import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  trend = "neutral",
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      <div className="absolute inset-0 data-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 holographic opacity-50 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-xs font-bold font-mono uppercase tracking-widest text-primary/80">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 cyber-glow">
          <Icon className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary))]" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold tabular-nums font-mono text-primary neon-text" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change && (
          <p className={cn(
            "text-xs mt-3 font-mono tracking-wide font-semibold uppercase",
            trend === "up" && "text-chart-5 drop-shadow-[0_0_4px_hsl(var(--chart-5))]",
            trend === "down" && "text-destructive drop-shadow-[0_0_4px_hsl(var(--destructive))]",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
    </Card>
  );
}
