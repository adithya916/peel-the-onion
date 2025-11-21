import { Activity, Network, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  {
    label: "Active Nodes",
    value: "247",
    change: "+12%",
    icon: Network,
    color: "text-primary",
  },
  {
    label: "Entry Nodes Identified",
    value: "89",
    change: "+8%",
    icon: Target,
    color: "text-success",
  },
  {
    label: "Correlation Accuracy",
    value: "94.2%",
    change: "+3.1%",
    icon: TrendingUp,
    color: "text-warning",
  },
  {
    label: "Active Traces",
    value: "34",
    change: "+5",
    icon: Activity,
    color: "text-cyber-purple",
  },
];

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">{stat.label}</p>
                <p className="text-3xl font-bold font-mono">{stat.value}</p>
                <p className={`text-xs ${stat.color} flex items-center gap-1`}>
                  <span>↗</span>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-secondary/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
