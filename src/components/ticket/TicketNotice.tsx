import { cn } from "@skylab-kulubu/skylcn-ui";
import { Ban, Clock, type LucideIcon } from "lucide-react";

// What the page says under a ticket that opens no door, in /kapi's answer box:
// a cancelled ticket and one on the waiting list. No place in the list.
const NOTICES: Record<"ticket_cancelled" | "waitlisted", { icon: LucideIcon; title: string; detail?: string; tone: string; iconTone: string }> = {
  ticket_cancelled: {
    icon: Ban,
    title: "Bu bilet iptal edildi",
    tone: "border-destructive/30 bg-destructive/5",
    iconTone: "text-destructive",
  },
  waitlisted: {
    icon: Clock,
    title: "Bekleme listesindesin",
    detail: "Yer açılırsa biletin e-postayla gelir.",
    tone: "border-info/30 bg-info/5",
    iconTone: "text-info",
  },
};

export default function TicketNotice({ state }: { state: "ticket_cancelled" | "waitlisted" }) {
  const notice = NOTICES[state];
  const Icon = notice.icon;
  return (
    <div role="status" className={cn("mt-6 flex flex-col gap-4 rounded-xl border p-5", notice.tone)}>
      <Icon aria-hidden="true" strokeWidth={1.75} className={cn("size-8 shrink-0", notice.iconTone)} />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg leading-snug font-semibold text-foreground-strong">{notice.title}</h2>
        {notice.detail ? <p className="text-sm leading-relaxed text-muted-foreground">{notice.detail}</p> : null}
      </div>
    </div>
  );
}
