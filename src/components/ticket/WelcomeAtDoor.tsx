"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import {
  atDoorHours,
  checkInLine,
  firstName,
  inToday,
  lookupFromStatus,
  newCheckIn,
  nextDelay,
  type CheckInsLookup,
  type OrganizerLogo,
  type TicketCheckIn,
} from "@/lib/ticket-check-ins";
import styles from "./WelcomeAtDoor.module.css";

type Props = {
  ticketKey: string;
  holderName: string;
  eventName: string;
  state: string;
  eventStart: string | null;
  eventEnd: string | null;
  // Who organizes it (the club, or "WEBLAB · Web Geliştirme") and their logo, if the site has it.
  organizer: string;
  organizerLogo: OrganizerLogo | null;
  // The Event's cover, blurred and darkened behind the greeting; the club's colours without one.
  coverSrc: string | null;
};

// How long the greeting stays before it closes by itself.
const SHOWN_MS = 8000;

async function ask(ticketKey: string): Promise<CheckInsLookup> {
  try {
    const response = await fetch(`/bilet/${ticketKey}/girisler`, { cache: "no-store" });
    const body = response.ok ? await response.json().catch(() => null) : null;
    return lookupFromStatus(response.status, body);
  } catch {
    return { kind: "failed" };
  }
}

// The page notices its holder walking in: in the door's hours, while the tab
// is shown and the holder is not in yet today, it asks every few seconds;
// when the door writes the check-in it greets them full screen and stops.
// A phone that can vibrates (Android); an iPhone only shows it, since a page
// cannot play a sound nobody tapped for.
export default function WelcomeAtDoor({
  ticketKey,
  holderName,
  eventName,
  state,
  eventStart,
  eventEnd,
  organizer,
  organizerLogo,
  coverSrc,
}: Props) {
  const [greeting, setGreeting] = useState<TicketCheckIn | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ticket = { state, eventStart, eventEnd };
    let stopped = false;
    let busy = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let baseline: TicketCheckIn[] | null = null;
    let failures = 0;

    const later = (ms: number) => {
      clearTimeout(timer);
      if (!stopped) timer = setTimeout(() => void tick(), ms);
    };

    const tick = async () => {
      if (stopped || busy || document.visibilityState !== "visible") return;
      const now = new Date();
      if (!atDoorHours(ticket, now)) {
        // Before the door opens: look again in a minute, asking nobody. After it closed: done.
        const start = eventStart ? new Date(eventStart).getTime() : Number.NaN;
        if (state === "active" && now.getTime() < start) later(60_000);
        else stopped = true;
        return;
      }
      busy = true;
      const result = await ask(ticketKey);
      busy = false;
      if (stopped) return;
      if (result.kind === "stop") {
        stopped = true;
        return;
      }
      if (result.kind !== "ok") {
        failures += 1;
        later(nextDelay(result.kind, failures));
        return;
      }
      failures = 0;
      if (baseline === null) {
        baseline = result.checkIns;
        if (inToday(baseline, now)) {
          stopped = true;
          return;
        }
      } else {
        const fresh = newCheckIn(baseline, result.checkIns);
        if (fresh) {
          stopped = true;
          setGreeting(fresh);
          return;
        }
      }
      later(nextDelay("ok", 0));
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") later(0);
      else clearTimeout(timer);
    };
    document.addEventListener("visibilitychange", onVisibility);
    later(0);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ticketKey, state, eventStart, eventEnd]);

  useEffect(() => {
    const node = dialog.current;
    if (!greeting || !node) return;
    if (!node.open) node.showModal();
    close.current?.focus({ preventScroll: true });
    // Android Chrome vibrates once the page has been tapped; elsewhere nothing happens.
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // no vibration
    }
    const timer = setTimeout(() => setGreeting(null), SHOWN_MS);
    return () => clearTimeout(timer);
  }, [greeting]);

  useEffect(() => {
    if (!greeting && dialog.current?.open) dialog.current.close();
  }, [greeting]);

  const name = firstName(holderName);
  // The dialog's content is drawn while it is closed too (hidden), so the logos and the cover
  // are already loaded when the door writes the entry.
  return (
    <dialog
      ref={dialog}
      className={styles.welcome}
      data-cover={coverSrc ? "" : undefined}
      aria-labelledby="welcome-title"
      onClose={() => setGreeting(null)}
      onClick={() => setGreeting(null)}
    >
      {coverSrc ? (
        // The cover is core's public image, as on the card.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.cover} src={coverSrc} alt="" referrerPolicy="no-referrer" decoding="async" />
      ) : null}
      <div className={styles.body}>
        <Image className={styles.logo} src="/img/skylablogo.svg" alt="SKY LAB" width={64} height={60} priority />
        <div className={styles.middle}>
          <span className={styles.mark} aria-hidden="true">
            <Check strokeWidth={3} />
          </span>
          <h2 id="welcome-title" className={styles.title}>
            {name ? `Hoş geldin, ${name}` : "Hoş geldin"}
          </h2>
          <p className={styles.event}>{eventName}</p>
          {greeting ? <p className={styles.session}>{checkInLine(greeting)}</p> : null}
        </div>
        <div className={styles.bottom}>
          {organizer ? (
            <p className={styles.organizer}>
              {organizerLogo ? (
                <Image className={styles.teamLogo} src={organizerLogo.src} alt="" width={28} height={28} />
              ) : null}
              <span>{organizer}</span>
            </p>
          ) : null}
          <button ref={close} type="button" className={styles.close}>
            Kapat
          </button>
        </div>
      </div>
    </dialog>
  );
}
