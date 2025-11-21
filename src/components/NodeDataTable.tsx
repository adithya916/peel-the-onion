import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Database, Search } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NodeData {
  id: string;
  ip: string;
  type: string;
  country: string;
  bandwidth: string;
  uptime: string;
  confidence: number;
  lastSeen: string;
}

const nodeData: NodeData[] = [
  {
    id: "N001",
    ip: "185.220.101.45",
    type: "Entry",
    country: "Germany",
    bandwidth: "1.2 Gbps",
    uptime: "99.8%",
    confidence: 92,
    lastSeen: "2m ago",
  },
  {
    id: "N002",
    ip: "192.42.116.28",
    type: "Entry",
    country: "Netherlands",
    bandwidth: "890 Mbps",
    uptime: "98.5%",
    confidence: 78,
    lastSeen: "5m ago",
  },
  {
    id: "N003",
    ip: "176.10.99.200",
    type: "Relay",
    country: "France",
    bandwidth: "2.1 Gbps",
    uptime: "99.9%",
    confidence: 85,
    lastSeen: "1m ago",
  },
  {
    id: "N004",
    ip: "199.249.230.81",
    type: "Exit",
    country: "United States",
    bandwidth: "1.5 Gbps",
    uptime: "99.2%",
    confidence: 95,
    lastSeen: "3m ago",
  },
  {
    id: "N005",
    ip: "171.25.193.78",
    type: "Exit",
    country: "Canada",
    bandwidth: "1.8 Gbps",
    uptime: "97.8%",
    confidence: 89,
    lastSeen: "7m ago",
  },
];

export const NodeDataTable = () => {
  const [search, setSearch] = useState("");

  const filteredData = nodeData.filter(
    (node) =>
      node.ip.toLowerCase().includes(search.toLowerCase()) ||
      node.country.toLowerCase().includes(search.toLowerCase()) ||
      node.type.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "entry":
        return "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30";
      case "relay":
        return "bg-muted text-muted-foreground border-border";
      case "exit":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-muted";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              TOR Node Database
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Comprehensive relay and node information with real-time metrics</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 font-mono"
            />
          </div>
        </div>

        <div className="border border-border/50 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-mono text-xs">NODE ID</TableHead>
                <TableHead className="font-mono text-xs">IP ADDRESS</TableHead>
                <TableHead className="font-mono text-xs">TYPE</TableHead>
                <TableHead className="font-mono text-xs">LOCATION</TableHead>
                <TableHead className="font-mono text-xs">BANDWIDTH</TableHead>
                <TableHead className="font-mono text-xs">UPTIME</TableHead>
                <TableHead className="font-mono text-xs">CONFIDENCE</TableHead>
                <TableHead className="font-mono text-xs">LAST SEEN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((node) => (
                <TableRow key={node.id} className="hover:bg-secondary/20">
                  <TableCell className="font-mono text-sm font-semibold">{node.id}</TableCell>
                  <TableCell className="font-mono text-sm text-primary">{node.ip}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(node.type)}>
                      {node.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{node.country}</TableCell>
                  <TableCell className="font-mono text-sm">{node.bandwidth}</TableCell>
                  <TableCell className="font-mono text-sm">{node.uptime}</TableCell>
                  <TableCell>
                    <span className={`font-mono text-sm font-bold ${getConfidenceColor(node.confidence)}`}>
                      {node.confidence}%
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{node.lastSeen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <p>Showing {filteredData.length} of {nodeData.length} nodes</p>
          <p>Last updated: 2 seconds ago</p>
        </div>
      </div>
    </Card>
  );
};
