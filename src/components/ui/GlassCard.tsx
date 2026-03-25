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
    glass: "bg-white/10 backdrop-blur-md border-white/20",
    glassDark: "bg-black/20 backdrop-blur-lg border-white/10",
  };

  return <Card className={cn(variants[variant], className)}>{children}</Card>;
}
