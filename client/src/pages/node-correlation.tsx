import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { GitBranch, Upload, ArrowRight, Filter, FileUp, CheckCircle2, AlertCircle, Database, AlertTriangle, Info } from "lucide-react";
import { Correlation, CorrelationMetrics, TorNode, DashboardStats } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CorrelationNetworkViz } from "@/components/correlation-network-viz";

export default function NodeCorrelation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedCorrelation, setSelectedCorrelation] = useState<Correlation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: nodes } = useQuery<TorNode[]>({
    queryKey: ["/api/tor-nodes"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: correlations, isLoading: correlationsLoading } = useQuery<Correlation[]>({
    queryKey: ["/api/correlations"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<CorrelationMetrics>({
    queryKey: ["/api/correlations/metrics"],
  });

  const hasNodes = nodes && nodes.length > 0;
  const hasEntryNodes = stats && stats.entryNodes > 0;
  const hasExitNodes = stats && stats.exitNodes > 0;
  const canAnalyze = hasEntryNodes && hasExitNodes;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pcap", file);
      
      const response = await fetch("/api/traffic-flows/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PCAP file");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/correlations"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/correlations/metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/traffic-flows"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Wait a moment for queries to refetch
      setTimeout(async () => {
        const updatedCorrelations = await queryClient.fetchQuery({ queryKey: ["/api/correlations"] });
        const correlationCount = Array.isArray(updatedCorrelations) ? updatedCorrelations.length : 0;
        
        setUploadStatus("success");
        
        if (correlationCount > 0) {
          toast({
            title: "Analysis Complete",
            description: `Successfully analyzed ${data.packetCount.toLocaleString()} packets and generated ${correlationCount} correlations`,
          });
        } else {
          toast({
            title: "Analysis Complete - No Correlations",
            description: "PCAP analyzed but no correlations could be generated. Make sure you have entry and exit nodes collected.",
            variant: "destructive",
          });
        }
        
        setSelectedFile(null);
      }, 500);
    },
    onError: (error: Error) => {
      setUploadStatus("error");
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to analyze PCAP file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".pcap") || file.name.endsWith(".pcapng") || file.name.endsWith(".cap")) {
        setSelectedFile(file);
        setUploadStatus("idle");
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid PCAP file (.pcap, .pcapng, or .cap)",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = () => {
    if (!canAnalyze) {
      toast({
        title: "Cannot Analyze",
        description: "Please collect TOR nodes first. Go to Data Collection and click 'Collect TOR Nodes'.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const filteredCorrelations = correlations?.filter((c) => 
    confidenceFilter === "all" || c.confidence === confidenceFilter
  );

  const handleCorrelationClick = (correlation: Correlation) => {
    setSelectedCorrelation(correlation);
    setIsDialogOpen(true);
  };

  const entryNode = nodes?.find(n => n.id === selectedCorrelation?.entryNodeId);
  const exitNode = nodes?.find(n => n.id === selectedCorrelation?.exitNodeId);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Node Correlation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload PCAP files to analyze TOR traffic patterns and identify entry/exit node correlations
        </p>
      </div>

      {/* PCAP Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">PCAP File Analysis</CardTitle>
          <CardDescription>
            Upload packet capture files to perform statistical correlation analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canAnalyze && (
            <Alert variant="destructive" data-testid="alert-no-nodes">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>TOR Nodes Required</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>
                  You need to collect TOR nodes before analyzing PCAP files. 
                  {!hasNodes && " No nodes found in the database."}
                  {hasNodes && !hasEntryNodes && " No entry nodes available."}
                  {hasNodes && !hasExitNodes && " No exit nodes available."}
                </p>
                <Button
                  onClick={() => navigate("/data-collection")}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  data-testid="button-go-to-collection"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Go to Data Collection
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pcap,.pcapng,.cap"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-pcap-file"
            />
            
            {!selectedFile ? (
              <div className="space-y-4">
                <FileUp className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop PCAP file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .pcap, .pcapng, and .cap formats
                  </p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  data-testid="button-browse-file"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {uploadStatus === "idle" && (
                  <CheckCircle2 className="w-12 h-12 text-chart-5 mx-auto" />
                )}
                {uploadStatus === "success" && (
                  <CheckCircle2 className="w-12 h-12 text-chart-5 mx-auto" />
                )}
                {uploadStatus === "error" && (
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                )}
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={uploadMutation.isPending}
                    data-testid="button-analyze-pcap"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <GitBranch className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadStatus("idle");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    variant="outline"
                    disabled={uploadMutation.isPending}
                    data-testid="button-clear-file"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {uploadStatus === "success" && (
            <Alert data-testid="alert-upload-success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                PCAP file analyzed successfully. Correlations have been generated and are displayed below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
                  className="border rounded-lg p-6 hover-elevate cursor-pointer active-elevate-2"
                  onClick={() => handleCorrelationClick(correlation)}
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
                    <div className="flex items-center gap-2">
                      <StatusBadge type="confidence" value={correlation.confidence as any} />
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
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

      {/* Network Visualization */}
      {correlations && correlations.length > 0 && nodes && (
        <CorrelationNetworkViz correlations={correlations} nodes={nodes} />
      )}

      {/* Correlation Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-correlation-details">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Correlation Details</DialogTitle>
            <DialogDescription>
              Statistical analysis results for entry-exit node correlation
            </DialogDescription>
          </DialogHeader>

          {selectedCorrelation && (
            <div className="space-y-6 mt-4">
              {/* Correlation Overview */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                  Overview
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Correlation ID</p>
                    <p className="text-sm font-mono">{selectedCorrelation.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Confidence Level</p>
                    <StatusBadge type="confidence" value={selectedCorrelation.confidence as any} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Correlation Score</p>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold tabular-nums">{selectedCorrelation.correlationScore}%</p>
                      <Progress value={selectedCorrelation.correlationScore} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Analysis Timestamp</p>
                    <p className="text-sm">
                      {selectedCorrelation.timestamp 
                        ? format(new Date(selectedCorrelation.timestamp), "MMM dd, yyyy HH:mm:ss") 
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Node Information */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                  Node Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Entry Node */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-chart-5">Entry Node</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Nickname</p>
                        <p className="font-medium">{entryNode?.nickname || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IP Address</p>
                        <p className="font-mono text-xs">{entryNode?.ipAddress || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Port</p>
                        <p className="font-mono text-xs">{entryNode?.orPort || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fingerprint</p>
                        <p className="font-mono text-xs break-all">{selectedCorrelation.entryNodeId}</p>
                      </div>
                      {entryNode?.country && (
                        <div>
                          <p className="text-xs text-muted-foreground">Country</p>
                          <p className="text-xs">{entryNode.country}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Exit Node */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-chart-3">Exit Node</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Nickname</p>
                        <p className="font-medium">{exitNode?.nickname || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IP Address</p>
                        <p className="font-mono text-xs">{exitNode?.ipAddress || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Port</p>
                        <p className="font-mono text-xs">{exitNode?.orPort || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fingerprint</p>
                        <p className="font-mono text-xs break-all">{selectedCorrelation.exitNodeId}</p>
                      </div>
                      {exitNode?.country && (
                        <div>
                          <p className="text-xs text-muted-foreground">Country</p>
                          <p className="text-xs">{exitNode.country}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Analysis Metadata */}
              {selectedCorrelation.metadata && typeof selectedCorrelation.metadata === 'object' && (
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                    Analysis Metadata
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(selectedCorrelation.metadata as any).algorithm && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Algorithm</p>
                        <p className="text-sm font-medium capitalize">{(selectedCorrelation.metadata as any).algorithm}</p>
                      </div>
                    )}
                    {(selectedCorrelation.metadata as any).timingCorrelation !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Timing Correlation</p>
                        <p className="text-sm font-medium">
                          {((selectedCorrelation.metadata as any).timingCorrelation * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {(selectedCorrelation.metadata as any).packetSizeCorrelation !== undefined && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Packet Size Correlation</p>
                        <p className="text-sm font-medium">
                          {((selectedCorrelation.metadata as any).packetSizeCorrelation * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {(selectedCorrelation.metadata as any).sampleSize && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Sample Size</p>
                        <p className="text-sm font-medium">{(selectedCorrelation.metadata as any).sampleSize} packets</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Traffic Flow ID */}
              {selectedCorrelation.trafficFlowId && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                      Traffic Flow
                    </h3>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Flow ID</p>
                      <p className="text-sm font-mono">{selectedCorrelation.trafficFlowId}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
