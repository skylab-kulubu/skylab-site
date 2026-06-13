import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "glass" | "glassDark";
}

export function GlassCard({
  className,
  children,
  variant = "glass",
}: GlassCardProps) {
  const variants = {
    default: "",
    glass: "glass-panel",
    glassDark: "glass-panel-dark",
  };

  return <Card className={cn(variants[variant], className)}>{children}</Card>;
}
