import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Network, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { TorNode, NetworkTopologyNode } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";

export default function NetworkTopology() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkTopologyNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { data: nodes, isLoading } = useQuery<TorNode[]>({
    queryKey: ["/api/tor-nodes"],
  });

  // Convert TOR nodes to topology nodes for visualization with deterministic layout
  const topologyNodes: NetworkTopologyNode[] = React.useMemo(() => {
    if (!nodes) return [];
    
    const entryNodes = nodes.filter(n => n.nodeType === "entry").slice(0, 30);
    const middleNodes = nodes.filter(n => n.nodeType === "middle").slice(0, 40);
    const exitNodes = nodes.filter(n => n.nodeType === "exit").slice(0, 30);
    
    const allNodes: NetworkTopologyNode[] = [];
    
    // Position entry nodes on the left
    entryNodes.forEach((node, i) => {
      allNodes.push({
        id: node.id,
        fingerprint: node.fingerprint,
        nickname: node.nickname,
        ipAddress: node.ipAddress,
        nodeType: 'entry',
        x: 100,
        y: 100 + (i * 450 / Math.max(entryNodes.length - 1, 1)),
        connections: [],
      });
    });
    
    // Position middle nodes in the center
    middleNodes.forEach((node, i) => {
      allNodes.push({
        id: node.id,
        fingerprint: node.fingerprint,
        nickname: node.nickname,
        ipAddress: node.ipAddress,
        nodeType: 'middle',
        x: 400,
        y: 100 + (i * 450 / Math.max(middleNodes.length - 1, 1)),
        connections: [],
      });
    });
    
    // Position exit nodes on the right
    exitNodes.forEach((node, i) => {
      allNodes.push({
        id: node.id,
        fingerprint: node.fingerprint,
        nickname: node.nickname,
        ipAddress: node.ipAddress,
        nodeType: 'exit',
        x: 700,
        y: 100 + (i * 450 / Math.max(exitNodes.length - 1, 1)),
        connections: [],
      });
    });
    
    return allNodes;
  }, [nodes]);

  useEffect(() => {
    if (!canvasRef.current || !topologyNodes.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between entry -> middle -> exit nodes
    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    ctx.lineWidth = 1;

    const entryNodes = topologyNodes.filter(n => n.nodeType === 'entry');
    const middleNodes = topologyNodes.filter(n => n.nodeType === 'middle');
    const exitNodes = topologyNodes.filter(n => n.nodeType === 'exit');

    // Connect entry nodes to random middle nodes
    entryNodes.forEach((entryNode, i) => {
      const targetMiddle = middleNodes[i % middleNodes.length];
      if (targetMiddle) {
        ctx.beginPath();
        ctx.moveTo(entryNode.x! * zoomLevel, entryNode.y! * zoomLevel);
        ctx.lineTo(targetMiddle.x! * zoomLevel, targetMiddle.y! * zoomLevel);
        ctx.stroke();
      }
    });

    // Connect middle nodes to exit nodes
    middleNodes.forEach((middleNode, i) => {
      const targetExit = exitNodes[i % exitNodes.length];
      if (targetExit) {
        ctx.beginPath();
        ctx.moveTo(middleNode.x! * zoomLevel, middleNode.y! * zoomLevel);
        ctx.lineTo(targetExit.x! * zoomLevel, targetExit.y! * zoomLevel);
        ctx.stroke();
      }
    });

    // Draw nodes
    topologyNodes.forEach((node) => {
      const colors = {
        entry: "#3b82f6",
        middle: "#14b8a6",
        exit: "#f97316",
      };

      ctx.fillStyle = colors[node.nodeType];
      ctx.beginPath();
      ctx.arc(
        node.x! * zoomLevel,
        node.y! * zoomLevel,
        8 * zoomLevel,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Add ring for selected node
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          node.x! * zoomLevel,
          node.y! * zoomLevel,
          12 * zoomLevel,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    });
  }, [topologyNodes, zoomLevel, selectedNode]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Network Topology</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive visualization of TOR network node connections
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Network Graph</CardTitle>
                <CardDescription>Force-directed layout of TOR nodes</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoomLevel(1)}
                  data-testid="button-reset-zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[600px] rounded-md" />
            ) : !nodes || nodes.length === 0 ? (
              <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-md">
                <div className="text-center">
                  <Network className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No nodes to visualize</p>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden border rounded-md bg-card">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[600px] cursor-crosshair"
                  data-testid="canvas-network-topology"
                />
                <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Legend</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-1" />
                      <span className="text-xs">Entry Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-2" />
                      <span className="text-xs">Middle Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-4" />
                      <span className="text-xs">Exit Nodes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Node Details</CardTitle>
            <CardDescription>Selected node information</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Nickname
                  </p>
                  <p className="text-sm font-medium">{selectedNode.nickname}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Type
                  </p>
                  <StatusBadge type="node" value={selectedNode.nodeType} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    IP Address
                  </p>
                  <p className="text-sm font-mono">{selectedNode.ipAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Fingerprint
                  </p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {selectedNode.fingerprint}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click a node to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Network Statistics</CardTitle>
          <CardDescription>Overview of network topology metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Total Nodes
              </p>
              <p className="text-2xl font-bold tabular-nums">{nodes?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Entry Nodes
              </p>
              <p className="text-2xl font-bold tabular-nums text-chart-1">
                {nodes?.filter((n) => n.nodeType === "entry").length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Middle Nodes
              </p>
              <p className="text-2xl font-bold tabular-nums text-chart-2">
                {nodes?.filter((n) => n.nodeType === "middle").length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Exit Nodes
              </p>
              <p className="text-2xl font-bold tabular-nums text-chart-4">
                {nodes?.filter((n) => n.nodeType === "exit").length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
