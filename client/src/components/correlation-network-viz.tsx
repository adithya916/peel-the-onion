import { useMemo } from "react";
import { Correlation, TorNode } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CorrelationNetworkVizProps {
  correlations: Correlation[];
  nodes: TorNode[];
}

export function CorrelationNetworkViz({ correlations, nodes }: CorrelationNetworkVizProps) {
  const vizData = useMemo(() => {
    const entryNodes = new Map<string, TorNode>();
    const exitNodes = new Map<string, TorNode>();
    
    correlations.forEach((corr) => {
      const entryNode = nodes.find((n) => n.id === corr.entryNodeId);
      const exitNode = nodes.find((n) => n.id === corr.exitNodeId);
      
      if (entryNode && corr.entryNodeId) entryNodes.set(corr.entryNodeId, entryNode);
      if (exitNode && corr.exitNodeId) exitNodes.set(corr.exitNodeId, exitNode);
    });

    return {
      entryNodes: Array.from(entryNodes.values()),
      exitNodes: Array.from(exitNodes.values()),
      correlations,
    };
  }, [correlations, nodes]);

  if (correlations.length === 0) return null;

  const width = 800;
  const height = Math.max(400, Math.max(vizData.entryNodes.length, vizData.exitNodes.length) * 25 + 100);
  const nodeRadius = 8;
  const entryX = 100;
  const exitX = width - 100;
  
  const entryNodePositions = vizData.entryNodes.map((node, i) => ({
    node,
    x: entryX,
    y: (height / (vizData.entryNodes.length + 1)) * (i + 1),
  }));

  const exitNodePositions = vizData.exitNodes.map((node, i) => ({
    node,
    x: exitX,
    y: (height / (vizData.exitNodes.length + 1)) * (i + 1),
  }));

  return (
    <Card data-testid="correlation-network-viz">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Correlation Network Visualization</CardTitle>
        <CardDescription>
          Visual representation of entry and exit node correlations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Entry Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-3" />
              <span className="text-muted-foreground">Exit Nodes</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Connection Lines */}
            <g>
              {correlations.map((corr) => {
                const entryPos = entryNodePositions.find(
                  (pos) => pos.node.id === corr.entryNodeId
                );
                const exitPos = exitNodePositions.find(
                  (pos) => pos.node.id === corr.exitNodeId
                );

                if (!entryPos || !exitPos) return null;

                const opacity = corr.correlationScore / 100;
                const strokeWidth = Math.max(1, (corr.correlationScore / 100) * 3);

                return (
                  <line
                    key={corr.id}
                    x1={entryPos.x + nodeRadius}
                    y1={entryPos.y}
                    x2={exitPos.x - nodeRadius}
                    y2={exitPos.y}
                    stroke="url(#lineGradient)"
                    strokeWidth={strokeWidth}
                    strokeOpacity={opacity * 0.8}
                    data-testid={`correlation-line-${corr.id}`}
                  />
                );
              })}
            </g>

            {/* Entry Nodes */}
            <g>
              {entryNodePositions.map((pos, i) => (
                <g key={pos.node.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill="hsl(var(--chart-1))"
                    className="drop-shadow-lg"
                    data-testid={`entry-node-${i}`}
                  />
                  <text
                    x={pos.x - nodeRadius - 10}
                    y={pos.y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs fill-muted-foreground"
                    data-testid={`entry-label-${i}`}
                  >
                    {pos.node.nickname.substring(0, 15)}
                  </text>
                </g>
              ))}
            </g>

            {/* Exit Nodes */}
            <g>
              {exitNodePositions.map((pos, i) => (
                <g key={pos.node.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill="hsl(var(--chart-3))"
                    className="drop-shadow-lg"
                    data-testid={`exit-node-${i}`}
                  />
                  <text
                    x={pos.x + nodeRadius + 10}
                    y={pos.y}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="text-xs fill-muted-foreground"
                    data-testid={`exit-label-${i}`}
                  >
                    {pos.node.nickname.substring(0, 15)}
                  </text>
                </g>
              ))}
            </g>

            {/* Labels */}
            <text
              x={entryX}
              y={30}
              textAnchor="middle"
              className="text-sm font-medium fill-foreground"
            >
              Entry Nodes ({vizData.entryNodes.length})
            </text>
            <text
              x={exitX}
              y={30}
              textAnchor="middle"
              className="text-sm font-medium fill-foreground"
            >
              Exit Nodes ({vizData.exitNodes.length})
            </text>
          </svg>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Line thickness and opacity represent correlation strength. 
          {correlations.length} correlation{correlations.length !== 1 ? 's' : ''} displayed.
        </p>
      </CardContent>
    </Card>
  );
}
