import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NodeType = "entry" | "middle" | "exit" | "unknown";
type ConfidenceLevel = "high" | "medium" | "low";
type Status = "active" | "inactive" | "analyzing";

interface StatusBadgeProps {
  type: "node" | "confidence" | "status";
  value: NodeType | ConfidenceLevel | Status;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === "node") {
      const nodeColors = {
        entry: "bg-chart-1/20 text-chart-1 border-chart-1/30",
        middle: "bg-chart-2/20 text-chart-2 border-chart-2/30",
        exit: "bg-chart-4/20 text-chart-4 border-chart-4/30",
        unknown: "bg-muted text-muted-foreground border-border",
      };
      return nodeColors[value as NodeType];
    }
    
    if (type === "confidence") {
      const confidenceColors = {
        high: "bg-chart-5/20 text-chart-5 border-chart-5/30",
        medium: "bg-chart-4/20 text-chart-4 border-chart-4/30",
        low: "bg-destructive/20 text-destructive border-destructive/30",
      };
      return confidenceColors[value as ConfidenceLevel];
    }
    
    const statusColors = {
      active: "bg-chart-5/20 text-chart-5 border-chart-5/30",
      inactive: "bg-muted text-muted-foreground border-border",
      analyzing: "bg-chart-1/20 text-chart-1 border-chart-1/30",
    };
    return statusColors[value as Status];
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        getVariant(),
        className
      )}
      data-testid={`badge-${value}`}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </Badge>
  );
}
