import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  type: "entry" | "relay" | "exit" | "target";
  x: number;
  y: number;
  label: string;
  confidence?: number;
}

export const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const nodes: Node[] = [
    { id: "target", type: "target", x: 50, y: 300, label: "Target Origin", confidence: 87 },
    { id: "entry1", type: "entry", x: 200, y: 200, label: "Entry Node 1", confidence: 92 },
    { id: "entry2", type: "entry", x: 200, y: 400, label: "Entry Node 2", confidence: 78 },
    { id: "relay1", type: "relay", x: 400, y: 150, label: "Relay 1" },
    { id: "relay2", type: "relay", x: 400, y: 300, label: "Relay 2" },
    { id: "relay3", type: "relay", x: 400, y: 450, label: "Relay 3" },
    { id: "exit1", type: "exit", x: 600, y: 200, label: "Exit Node 1", confidence: 95 },
    { id: "exit2", type: "exit", x: 600, y: 400, label: "Exit Node 2", confidence: 89 },
  ];

  const connections = [
    { from: "target", to: "entry1" },
    { from: "target", to: "entry2" },
    { from: "entry1", to: "relay1" },
    { from: "entry1", to: "relay2" },
    { from: "entry2", to: "relay2" },
    { from: "entry2", to: "relay3" },
    { from: "relay1", to: "exit1" },
    { from: "relay2", to: "exit1" },
    { from: "relay2", to: "exit2" },
    { from: "relay3", to: "exit2" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return;

        ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Animated data flow
        const offset = (Date.now() / 20) % 100;
        const progress = ((offset + conn.from.charCodeAt(0) * 10) % 100) / 100;
        const flowX = fromNode.x + (toNode.x - fromNode.x) * progress;
        const flowY = fromNode.y + (toNode.y - fromNode.y) * progress;

        ctx.fillStyle = "rgba(0, 212, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const colors = {
          target: "#00d4ff",
          entry: "#8b5cf6",
          relay: "#6b7280",
          exit: "#10b981",
        };

        ctx.fillStyle = colors[node.type];
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[node.type];
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-muted";
    if (confidence >= 90) return "bg-success";
    if (confidence >= 75) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              Network Topology Mapping
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Real-time TOR node correlation and traffic flow analysis</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30">
              <Zap className="w-3 h-3" />
              Live
            </Badge>
          </div>
        </div>

        <div className="relative bg-secondary/20 rounded-lg p-8 border border-border/30">
          <canvas ref={canvasRef} width={700} height={600} className="w-full" />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur rounded-lg p-4 border border-border/50 space-y-2">
            <p className="text-xs font-semibold mb-2 font-mono">NODE TYPES</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-mono">Target Origin</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-cyber-purple" />
                <span className="font-mono">Entry/Guard</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="font-mono">Relay Node</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="font-mono">Exit Node</span>
              </div>
            </div>
          </div>

          {/* Confidence indicators */}
          <div className="absolute bottom-4 left-4 space-y-2">
            {nodes.filter(n => n.confidence).map((node) => (
              <div key={node.id} className="bg-card/80 backdrop-blur rounded px-3 py-1.5 border border-border/50 flex items-center gap-2">
                <span className="text-xs font-mono">{node.label}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getConfidenceColor(node.confidence)}`} />
                  <span className="text-xs font-bold">{node.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
