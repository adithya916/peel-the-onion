import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "entry" | "relay" | "exit" | "correlation";
  node: string;
  description: string;
  confidence?: number;
}

const timelineData: TimelineEvent[] = [
  {
    id: "1",
    timestamp: "14:32:18.234",
    type: "correlation",
    node: "System",
    description: "New TOR connection detected from 185.220.101.45",
    confidence: 95,
  },
  {
    id: "2",
    timestamp: "14:32:19.102",
    type: "entry",
    node: "Entry Node 1",
    description: "Traffic routed through guard node in Germany",
    confidence: 92,
  },
  {
    id: "3",
    timestamp: "14:32:20.456",
    type: "relay",
    node: "Relay 2",
    description: "Connection relayed through Netherlands",
  },
  {
    id: "4",
    timestamp: "14:32:21.789",
    type: "relay",
    node: "Relay 5",
    description: "Secondary relay path through France",
  },
  {
    id: "5",
    timestamp: "14:32:23.012",
    type: "exit",
    node: "Exit Node 1",
    description: "Traffic exited TOR network via US exit node",
    confidence: 89,
  },
  {
    id: "6",
    timestamp: "14:32:24.567",
    type: "correlation",
    node: "System",
    description: "Pattern match: 87% correlation with known entry IP",
    confidence: 87,
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "entry":
      return "border-cyber-purple bg-cyber-purple/10 text-cyber-purple";
    case "relay":
      return "border-muted-foreground bg-muted text-muted-foreground";
    case "exit":
      return "border-success bg-success/10 text-success";
    case "correlation":
      return "border-primary bg-primary/10 text-primary";
    default:
      return "border-border";
  }
};

export const TimelineView = () => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Activity Timeline Reconstruction
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Chronological trace of network events and node correlations</p>
          </div>
          <Badge variant="outline" className="border-primary/30 font-mono">
            Last 24h
          </Badge>
        </div>

        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          {timelineData.map((event, index) => (
            <div key={event.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className={`absolute left-0 w-6 h-6 rounded-full border-2 ${getTypeColor(event.type)} flex items-center justify-center`}>
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{event.timestamp}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <Badge variant="outline" className={`text-xs ${getTypeColor(event.type)}`}>
                        {event.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono font-semibold">{event.node}</span>
                    </div>
                    <p className="text-sm">{event.description}</p>
                  </div>
                  {event.confidence && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-mono">Confidence</p>
                        <p className="text-lg font-bold font-mono">{event.confidence}%</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
