import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { GitBranch, TrendingUp, ArrowRight, Filter } from "lucide-react";
import { Correlation, CorrelationMetrics } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function NodeCorrelation() {
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");

  const { data: correlations, isLoading: correlationsLoading } = useQuery<Correlation[]>({
    queryKey: ["/api/correlations"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<CorrelationMetrics>({
    queryKey: ["/api/correlations/metrics"],
  });

  const filteredCorrelations = correlations?.filter((c) => 
    confidenceFilter === "all" || c.confidence === confidenceFilter
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Node Correlation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Statistical analysis of TOR traffic patterns and entry/exit node correlation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Correlations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold tabular-nums">
                {metrics?.totalCorrelations || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              High Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold tabular-nums text-chart-5">
                {metrics?.highConfidence || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Medium Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold tabular-nums text-chart-4">
                {metrics?.mediumConfidence || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold tabular-nums">
                {metrics?.averageScore || 0}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Correlation Results</CardTitle>
              <CardDescription>Entry and exit node traffic correlation analysis</CardDescription>
            </div>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-48" data-testid="select-confidence-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence Levels</SelectItem>
                <SelectItem value="high">High Confidence</SelectItem>
                <SelectItem value="medium">Medium Confidence</SelectItem>
                <SelectItem value="low">Low Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {correlationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !filteredCorrelations || filteredCorrelations.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {correlations?.length === 0 
                  ? "No correlations found. Upload PCAP files to start analysis." 
                  : "No correlations match your filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCorrelations.map((correlation) => (
                <div
                  key={correlation.id}
                  className="border rounded-lg p-6 hover-elevate"
                  data-testid={`correlation-card-${correlation.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="font-mono text-foreground">
                          Entry: {correlation.entryNodeId?.substring(0, 12)}...
                        </span>
                        <ArrowRight className="w-4 h-4 inline-block mx-2 text-muted-foreground" />
                        <span className="font-mono text-foreground">
                          Exit: {correlation.exitNodeId?.substring(0, 12)}...
                        </span>
                      </div>
                    </div>
                    <StatusBadge type="confidence" value={correlation.confidence as any} />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Correlation Score
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {correlation.correlationScore}%
                        </span>
                      </div>
                      <Progress value={correlation.correlationScore} className="h-2" />
                    </div>
                    
                    {correlation.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        Analyzed: {format(new Date(correlation.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
