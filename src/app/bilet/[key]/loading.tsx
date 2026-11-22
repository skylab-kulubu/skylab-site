import { StatusPage } from "@skylab-kulubu/skylcn-ui";

// Shown while core answers the ticket.
export default function Loading() {
  return <StatusPage as="div" loading title="Bilet açılıyor" className="min-h-0 flex-1 bg-transparent px-5 pt-10 pb-12" />;
}
