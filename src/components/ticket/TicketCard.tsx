"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Exo_2 } from "next/font/google";
import { SkylabMark } from "@skylab-kulubu/skylcn-ui";
import type { TicketView, When } from "@/lib/ticket-page";
import styles from "./TicketCard.module.css";

// The ticket as a pass (an Apple Wallet event ticket's layout): the front is
// the Event's cover with its name and date, the back the Event's colour with
// its details, the QR and the code. A tap on the card turns it over; a tap on
// the QR shows it full screen and keeps the screen awake. The card floats a
// few pixels while its front shows; it stands still whenever the QR is in
// view, so a scanner reads it, and never moves with reduced motion.
// No text tells the holder what to do: the card carries data only.
// An Event in the ARTLAB theme gets ARTLAB's look (TicketCard.module.css):
// the poster's dark ground, orange accent and electric blue links, Exo 2
// titles (as core's ARTLAB ticket PDF) and ARTLAB's icon.

// ARTLAB's heading face, the one core embeds in the ARTLAB PDF (Exo 2, full
// Turkish). Not preloaded: only an ARTLAB card uses it, so a Kurumsal ticket
// never downloads it.
const exo2 = Exo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["800"],
  variable: "--font-artlab-display",
  display: "swap",
  preload: false,
});

function WhenLine({ when, className }: { when: When; className?: string }) {
  return (
    <p className={className}>
      {when.date}, <span className={styles.nowrap}>{when.hours}</span>
    </p>
  );
}

// A face out of view is inert: no focus, nothing read out.
function Front({
  view,
  hidden,
  onTurn,
  turnRef,
}: {
  view: TicketView;
  hidden: boolean;
  onTurn?: () => void;
  turnRef: React.Ref<HTMLButtonElement>;
}) {
  return (
    <section className={`${styles.face} ${styles.front}`} inert={hidden}>
      {view.coverSrc ? (
        // The cover is core's public image; next/image would route it through this site's server for nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.cover} src={view.coverSrc} alt="" referrerPolicy="no-referrer" decoding="async" />
      ) : null}
      <div className={view.coverSrc ? styles.shade : undefined} />
      {view.theme === "artlab" ? (
        <Image className={styles.mark} src="/img/events/artlab-2026.svg" alt="ARTLAB" width={30} height={30} />
      ) : (
        <SkylabMark size={24} className={styles.mark} />
      )}
      <div className={styles.frontText}>
        <h1 className={styles.frontTitle}>{view.eventName}</h1>
        {view.front ? <WhenLine when={view.front} className={styles.frontWhen} /> : null}
      </div>
      {onTurn ? (
        <button
          ref={turnRef}
          type="button"
          className={styles.turn}
          onClick={onTurn}
          aria-label={view.qrSrc ? "QR’ı göster" : "Bileti çevir"}
        />
      ) : null}
    </section>
  );
}

export default function TicketCard({ view }: { view: TicketView }) {
  // No QR, no back: a cancelled Event, a cancelled ticket, the waiting list
  const cancelled = view.state === "event_cancelled" || view.state === "ticket_cancelled" || view.state === "waitlisted";
  const [face, setFace] = useState<"front" | "back">(cancelled ? "front" : view.openFace);
  const [fullScreen, setFullScreen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const frontTurn = useRef<HTMLButtonElement>(null);
  const backTurn = useRef<HTMLButtonElement>(null);
  const [turned, setTurned] = useState(false);
  const turn = () => {
    setTurned(true);
    setFace((f) => (f === "front" ? "back" : "front"));
  };

  // After a turn the button that was pressed is on the face now inert, so focus
  // moves to the face in view (its own turn button, first in its order).
  useEffect(() => {
    if (!turned) return;
    (face === "back" ? backTurn : frontTurn).current?.focus({ preventScroll: true });
  }, [face, turned]);

  // Full screen: the dialog is modal (Escape closes it) and the screen stays
  // awake while it is open, again after the tab comes back into view.
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (!fullScreen) {
      if (node.open) node.close();
      return;
    }
    if (!node.open) node.showModal();
    // A lock that arrives after the dialog closed, or a second one asked for
    // when the tab came back, is let go at once: one lock at most, none after.
    let closed = false;
    let held: WakeLockSentinel | null = null;
    const keepAwake = () => {
      if (document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
      if (held && !held.released) return;
      navigator.wakeLock
        .request("screen")
        .then((lock) => {
          if (closed || (held && !held.released)) {
            lock.release().catch(() => {});
            return;
          }
          held = lock;
        })
        .catch(() => {});
    };
    keepAwake();
    document.addEventListener("visibilitychange", keepAwake);
    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", keepAwake);
      held?.release().catch(() => {});
      held = null;
    };
  }, [fullScreen]);

  const still = face === "back" || fullScreen;

  return (
    <>
      <div className={styles.float} data-still={still || undefined}>
        <div
          className={`${styles.card} ${view.theme === "artlab" ? exo2.variable : ""}`}
          data-face={face}
          data-theme={view.theme}
          style={{ "--ticket-color": view.color } as React.CSSProperties}
        >
          <Front view={view} hidden={face !== "front"} onTurn={cancelled ? undefined : turn} turnRef={frontTurn} />
          {cancelled ? null : (
            <section className={`${styles.face} ${styles.back}`} inert={face !== "back"}>
                <button ref={backTurn} type="button" className={styles.turn} onClick={turn} aria-label="Ön yüzü göster" />
                <div className={styles.backTop}>
                  <span>{view.organizer}</span>
                  <SkylabMark size={22} />
                </div>
                <h1 className={styles.backTitle}>{view.eventName}</h1>
                {view.back ? <WhenLine when={view.back} className={styles.backWhen} /> : null}
                {view.venue ? <p className={styles.venue}>{view.venue}</p> : null}
                {view.holderName ? <p className={styles.holder}>{view.holderName}</p> : null}
                <div className={styles.bottom}>
                  {view.qrSrc ? (
                    <button type="button" className={styles.qr} onClick={() => setFullScreen(true)} aria-label="QR’ı tam ekran aç">
                      {/* Core draws the QR (black on white, quiet zone); the image needs no optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={view.qrSrc} alt="Bilet QR kodu" width={200} height={200} referrerPolicy="no-referrer" />
                    </button>
                  ) : null}
                  {view.code ? <p className={styles.code}>{view.code}</p> : null}
                  {view.pdfHref || view.mapsHref ? (
                    <nav className={styles.links} aria-label="Bilet bağlantıları">
                      {view.pdfHref ? (
                        <a href={view.pdfHref} rel="noreferrer">
                          PDF’i indir
                        </a>
                      ) : null}
                      {view.mapsHref ? (
                        <a href={view.mapsHref} target="_blank" rel="noreferrer noopener">
                          Haritada aç
                        </a>
                      ) : null}
                    </nav>
                  ) : null}
                </div>
            </section>
          )}
        </div>
      </div>
      {/* Says which face is in view after a turn; empty until the first one. */}
      <p className="sr-only" aria-live="polite">
        {turned ? (face === "back" ? "Arka yüz: QR ve bilet bilgileri" : "Ön yüz") : ""}
      </p>
      {view.state === "event_cancelled" ? <p className={styles.status}>Bu etkinlik iptal edildi.</p> : null}
      {view.state === "ended" ? <p className={styles.status}>Bu etkinlik sona erdi.</p> : null}
      {view.qrSrc ? (
        <dialog
          ref={dialog}
          className={styles.full}
          aria-label="Bilet QR kodu, tam ekran"
          onClose={() => setFullScreen(false)}
          onClick={() => setFullScreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view.qrSrc} alt="Bilet QR kodu" referrerPolicy="no-referrer" />
          {view.code ? <p>{view.code}</p> : null}
        </dialog>
      ) : null}
    </>
  );
}
