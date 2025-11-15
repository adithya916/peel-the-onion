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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums" data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change && (
          <p className={cn(
            "text-xs mt-2",
            trend === "up" && "text-chart-5",
            trend === "down" && "text-destructive",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
