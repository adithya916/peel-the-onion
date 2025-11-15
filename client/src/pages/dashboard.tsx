import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { 
  Activity, 
  Database, 
  GitBranch, 
  Network, 
  TrendingUp, 
  Eye,
  ArrowRight,
  Shield
} from "lucide-react";
import { Link } from "wouter";
import { DashboardStats, Correlation } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentCorrelations, isLoading: correlationsLoading } = useQuery<Correlation[]>({
    queryKey: ["/api/correlations/recent"],
  });

  if (statsLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          TOR network forensic analysis overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Nodes"
          value={stats?.totalNodes || 0}
          icon={Database}
          change={`${stats?.entryNodes || 0} Entry, ${stats?.exitNodes || 0} Exit`}
        />
        <MetricCard
          title="Active Correlations"
          value={stats?.activeCorrelations || 0}
          icon={GitBranch}
          trend="up"
          change="+12% from last analysis"
        />
        <MetricCard
          title="Identified Entry Nodes"
          value={stats?.identifiedEntryNodes || 0}
          icon={Eye}
          trend="up"
        />
        <MetricCard
          title="Avg Confidence"
          value={`${stats?.averageConfidence || 0}%`}
          icon={TrendingUp}
          change="High confidence rate"
          trend="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Correlations</CardTitle>
            <CardDescription>Latest traffic correlation analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {correlationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !recentCorrelations || recentCorrelations.length === 0 ? (
              <div className="text-center py-12">
                <Network className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No correlations yet</p>
                <Link href="/analysis">
                  <Button variant="outline" size="sm" className="mt-4" data-testid="button-upload-pcap">
                    Upload PCAP File
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCorrelations.slice(0, 5).map((correlation) => (
                  <div 
                    key={correlation.id}
                    className="flex items-center justify-between p-4 rounded-md border hover-elevate"
                    data-testid={`correlation-${correlation.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-foreground">
                          {correlation.entryNodeId?.substring(0, 8)}...
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-mono text-foreground">
                          {correlation.exitNodeId?.substring(0, 8)}...
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score: {correlation.correlationScore}%
                      </p>
                    </div>
                    <StatusBadge type="confidence" value={correlation.confidence as any} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription>Start analyzing TOR network traffic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/collection">
              <Button className="w-full justify-start" variant="outline" data-testid="button-collect-nodes">
                <Database className="w-4 h-4 mr-2" />
                Collect TOR Node Data
              </Button>
            </Link>
            <Link href="/analysis">
              <Button className="w-full justify-start" variant="outline" data-testid="button-analyze-traffic">
                <Activity className="w-4 h-4 mr-2" />
                Analyze Traffic (Upload PCAP)
              </Button>
            </Link>
            <Link href="/topology">
              <Button className="w-full justify-start" variant="outline" data-testid="button-view-topology">
                <Network className="w-4 h-4 mr-2" />
                View Network Topology
              </Button>
            </Link>
            <Link href="/reports">
              <Button className="w-full justify-start" data-testid="button-generate-report">
                <Shield className="w-4 h-4 mr-2" />
                Generate Forensic Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Node Distribution</CardTitle>
          <CardDescription>TOR network node types breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums text-chart-1">
                {stats?.entryNodes || 0}
              </div>
              <div className="mt-2">
                <StatusBadge type="node" value="entry" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums text-chart-2">
                {stats?.middleNodes || 0}
              </div>
              <div className="mt-2">
                <StatusBadge type="node" value="middle" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold tabular-nums text-chart-4">
                {stats?.exitNodes || 0}
              </div>
              <div className="mt-2">
                <StatusBadge type="node" value="exit" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
