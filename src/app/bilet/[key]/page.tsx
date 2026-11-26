import type { Metadata } from "next";
import { headers } from "next/headers";
import { ErrorScene, StatusPage, pickErrorSceneVariant, statusSceneVariant } from "@skylab-kulubu/skylcn-ui";
import { House } from "lucide-react";
import LinkButton from "@/components/skylcn/LinkButton";
import CancelTicket from "@/components/ticket/CancelTicket";
import TicketCard from "@/components/ticket/TicketCard";
import TicketNotice from "@/components/ticket/TicketNotice";
import WelcomeAtDoor from "@/components/ticket/WelcomeAtDoor";
import { organizerLogo } from "@/lib/ticket-check-ins";
import { findTicket, ticketView, visitorAddress, type TicketLookup } from "@/lib/ticket-page";

// The ticket changes with the Event (its dates, a cancellation): never cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bilet | SKY LAB",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const MESSAGES: Record<Exclude<TicketLookup["kind"], "found">, { title: string; description?: string }> = {
  "not-found": { title: "Bilet bulunamadı", description: "Bu bağlantıyla eşleşen bir bilet yok." },
  closed: { title: "Bu bilet artık açık değil." },
  unavailable: { title: "Bilet şu an açılamıyor", description: "Biraz sonra yeniden deneyin." },
};

// The club's error scene above the page's own words: a random drawing of the kind on
// each visit, picked here since the page renders per request. "Şu an açılamıyor" is a
// 503, which always draws the same one.
function scene(kind: Exclude<TicketLookup["kind"], "found">) {
  if (kind === "unavailable") return <ErrorScene kind="unavailable" variant={statusSceneVariant("unavailable", 503)} />;
  if (kind === "closed") return <ErrorScene kind="linkExpired" variant={pickErrorSceneVariant("linkExpired")} />;
  return <ErrorScene kind="notFound" variant={pickErrorSceneVariant("notFound")} />;
}

// The key is never shown back: it is the ticket's secret.
function EmptyState({ kind }: { kind: Exclude<TicketLookup["kind"], "found"> }) {
  const message = MESSAGES[kind];
  return (
    <StatusPage
      as="div"
      className="min-h-0 flex-1 bg-transparent px-5 pt-10 pb-12"
      scene={scene(kind)}
      title={message.title}
      description={message.description}
    >
      <LinkButton href="/">
        <House aria-hidden="true" />
        Ana sayfaya dön
      </LinkButton>
    </StatusPage>
  );
}

export default async function TicketPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  // CORE_API_ORIGIN is API_BASE_URL, written into the build by next.config.ts;
  // CORE_INTERNAL_URL is read here at run time (Dokploy's environment).
  const request = await headers();
  const visitor = visitorAddress(request.get("x-forwarded-for"), request.get("x-real-ip"));
  const result = await findTicket(key, process.env.CORE_API_ORIGIN, {
    visitor,
    coreInternalUrl: process.env.CORE_INTERNAL_URL,
  });
  if (result.kind !== "found") return <EmptyState kind={result.kind} />;

  const view = ticketView(result.ticket, process.env.CORE_API_ORIGIN, new Date());
  const { state, cancellable } = result.ticket;
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-12">
      <TicketCard view={view} />
      {state === "ticket_cancelled" || state === "waitlisted" ? <TicketNotice state={state} /> : null}
      <WelcomeAtDoor
        ticketKey={key}
        holderName={view.holderName}
        eventName={view.eventName}
        state={result.ticket.state}
        eventStart={result.ticket.eventStart}
        eventEnd={result.ticket.eventEnd}
        organizer={view.organizer}
        organizerLogo={organizerLogo(result.ticket.ownerTeam, result.ticket.eventName, result.ticket.theme)}
        coverSrc={view.coverSrc}
      />
      {/* Only while core says so: an older core sends no `cancellable`, and offers no cancel */}
      {cancellable && (state === "active" || state === "waitlisted") ? (
        <CancelTicket ticketKey={key} waitlisted={state === "waitlisted"} />
      ) : null}
    </div>
  );
}
