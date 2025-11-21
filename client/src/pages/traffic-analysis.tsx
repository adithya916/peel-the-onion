import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileUp, Activity, CheckCircle, XCircle } from "lucide-react";
import { TrafficFlow } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function TrafficAnalysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState<TrafficFlow | null>(null);

  const { data: flows, isLoading } = useQuery<TrafficFlow[]>({
    queryKey: ["/api/traffic-flows"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pcap", file);
      
      return apiRequest("POST", "/api/traffic-flows/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic-flows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUploadProgress(0);
      toast({
        title: "Upload Successful",
        description: "PCAP file has been analyzed successfully",
      });
    },
    onError: () => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "Failed to upload and analyze PCAP file",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".pcap") && !file.name.endsWith(".pcapng")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .pcap or .pcapng file",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
    setUploadProgress(50);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Traffic Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and analyze network traffic PCAP files for TOR correlation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Upload PCAP File</CardTitle>
          <CardDescription>
            Drag and drop your network capture file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pcap,.pcapng"
              onChange={handleChange}
              disabled={uploadMutation.isPending}
            />
            
            <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            
            {uploadMutation.isPending ? (
              <div className="space-y-4">
                <p className="text-sm text-foreground font-medium">Uploading and analyzing...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground font-medium mb-2">
                  Drop PCAP file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports .pcap and .pcapng formats
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-browse-file"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Uploaded Traffic Flows</CardTitle>
          <CardDescription>History of analyzed network capture files</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !flows || flows.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No traffic flows uploaded yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase">File Name</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Uploaded</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Packets</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Size</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Duration</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Status</TableHead>
                    <TableHead className="text-xs font-medium uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flows.map((flow) => (
                    <TableRow key={flow.id} data-testid={`flow-${flow.id}`}>
                      <TableCell className="font-medium">{flow.fileName}</TableCell>
                      <TableCell className="text-sm">
                        {flow.uploadedAt ? format(new Date(flow.uploadedAt), "MMM dd, HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {flow.packetCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {(flow.totalSize / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                      <TableCell className="text-sm">
                        {flow.duration ? `${flow.duration}s` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-chart-5" />
                          <span className="text-sm">Analyzed</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFlow(flow)}
                          data-testid={`button-view-details-${flow.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFlow && selectedFlow.parsedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Detailed Traffic Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Forensic analysis results for {selectedFlow.fileName}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedFlow(null)}
              data-testid="button-close-details"
            >
              Close
            </Button>
          </div>

          {/* Summary Statistics */}
          {(selectedFlow.parsedData as any).summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      HTTP Requests
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {(selectedFlow.parsedData as any).summary.totalHTTPRequests || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Extracted Files
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-chart-1">
                      {(selectedFlow.parsedData as any).summary.extractedFiles || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Credentials Found
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-chart-4">
                      {(selectedFlow.parsedData as any).summary.credentialsFound || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Unique Hosts
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {(selectedFlow.parsedData as any).summary.uniqueHosts || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HTTP Requests */}
          {(selectedFlow.parsedData as any).httpRequests && (selectedFlow.parsedData as any).httpRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">HTTP Requests</CardTitle>
                <CardDescription>Network requests captured in PCAP file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Frame #</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Method</TableHead>
                        <TableHead className="text-xs font-medium uppercase">URL</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Status</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Content Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedFlow.parsedData as any).httpRequests.map((req: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{req.frameNumber}</TableCell>
                          <TableCell>
                            <Badge variant={req.method === "GET" ? "secondary" : "default"}>
                              {req.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-md truncate">
                            {req.url}
                          </TableCell>
                          <TableCell>
                            <Badge variant={req.statusCode === 200 ? "default" : "secondary"}>
                              {req.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{req.contentType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Files */}
          {(selectedFlow.parsedData as any).extractedFiles && (selectedFlow.parsedData as any).extractedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Extracted Files</CardTitle>
                <CardDescription>Files reassembled from network traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Frame #</TableHead>
                        <TableHead className="text-xs font-medium uppercase">File Name</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Type</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Size</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedFlow.parsedData as any).extractedFiles.map((file: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{file.frameNumber}</TableCell>
                          <TableCell className="font-medium">{file.fileName}</TableCell>
                          <TableCell className="text-sm">{file.fileType}</TableCell>
                          <TableCell className="text-sm tabular-nums">
                            {(file.size / 1024).toFixed(2)} KB
                          </TableCell>
                          <TableCell className="font-mono text-xs">{file.source}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credentials Found */}
          {(selectedFlow.parsedData as any).credentials && (selectedFlow.parsedData as any).credentials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Credentials Found</CardTitle>
                <CardDescription>Authentication credentials extracted from traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Frame #</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Protocol</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Host</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Username</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Password</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedFlow.parsedData as any).credentials.map((cred: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{cred.frameNumber}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{cred.protocol}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{cred.host}</TableCell>
                          <TableCell className="font-medium">{cred.username}</TableCell>
                          <TableCell className="font-mono">{cred.password}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Browser Activity */}
          {(selectedFlow.parsedData as any).browserActivity && (selectedFlow.parsedData as any).browserActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Browser Activity</CardTitle>
                <CardDescription>Websites visited and browsing timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(selectedFlow.parsedData as any).browserActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          {activity.url}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Frame {activity.frameNumber} • {format(new Date(activity.timestamp), "MMM dd, HH:mm:ss")}
                        </p>
                      </div>
                      <Badge variant="secondary">{activity.method}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Queries */}
          {(selectedFlow.parsedData as any).searchQueries && (selectedFlow.parsedData as any).searchQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Search Queries</CardTitle>
                <CardDescription>Search engine queries performed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(selectedFlow.parsedData as any).searchQueries.map((query: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-3 border rounded-md bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium text-sm">"{query.query}"</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {query.searchEngine} • Frame {query.frameNumber}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          {query.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Details */}
          {(selectedFlow.parsedData as any).connections && (selectedFlow.parsedData as any).connections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Network Connections</CardTitle>
                <CardDescription>TCP/IP connection details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-medium uppercase">Source</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Destination</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Protocol</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Packets</TableHead>
                        <TableHead className="text-xs font-medium uppercase">Bytes</TableHead>
                        <TableHead className="text-xs font-medium uppercase">State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedFlow.parsedData as any).connections.map((conn: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">
                            {conn.sourceIP}:{conn.sourcePort}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {conn.destIP}:{conn.destPort}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{conn.protocol}</Badge>
                          </TableCell>
                          <TableCell className="text-sm tabular-nums">{conn.packets}</TableCell>
                          <TableCell className="text-sm tabular-nums">
                            {(conn.bytes / 1024).toFixed(2)} KB
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{conn.state}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
