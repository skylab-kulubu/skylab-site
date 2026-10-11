import SkylcnScope from "@/components/skylcn/SkylcnScope";

// Drawn with skylcn-ui, scoped to this route: see SkylcnScope.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SkylcnScope wide>{children}</SkylcnScope>;
}
