"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@skylab-kulubu/skylcn-ui";
import { cancelCopy, cancelOutcomeFor, cancelProblem } from "@/lib/ticket-cancel";

// "Biletimi iptal et" ("Listeden çık" on the waiting list) under the ticket,
// shown only while core says the holder may cancel. It asks first in a modal
// dialog (the page's own <dialog>, as the QR's full screen, so it stays inside
// the page's skylcn-ui scope); once core says yes the page is read again and
// shows the cancelled ticket.
export default function CancelTicket({ ticketKey, waitlisted }: { ticketKey: string; waitlisted: boolean }) {
  const copy = cancelCopy(waitlisted);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  async function cancel() {
    setSending(true);
    setProblem(null);
    let message: string | null;
    try {
      const response = await fetch(`/bilet/${ticketKey}/iptal`, { method: "POST", cache: "no-store" });
      message = cancelProblem(cancelOutcomeFor(response.status, await response.json().catch(() => null)));
    } catch {
      message = cancelProblem({ kind: "failed" });
    }
    setSending(false);
    if (message) {
      setProblem(message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="mt-8 flex justify-center">
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(true)}>
        {copy.button}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="bilet-iptal-baslik"
        aria-describedby="bilet-iptal-metin"
        onClose={() => {
          setOpen(false);
          setProblem(null);
        }}
        className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-xl border border-border bg-background p-5 text-foreground backdrop:bg-black/60"
      >
        <h2 id="bilet-iptal-baslik" className="text-lg leading-snug font-semibold text-foreground-strong">
          {copy.title}
        </h2>
        <p id="bilet-iptal-metin" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {copy.detail}
        </p>
        {problem ? (
          <p role="alert" className="mt-3 text-sm leading-relaxed text-destructive">
            {problem}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending} autoFocus>
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={cancel} pending={sending} disabled={sending}>
            {copy.action}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
