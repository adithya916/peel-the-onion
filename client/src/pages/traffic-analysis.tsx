import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
