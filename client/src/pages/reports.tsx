import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, FileJson, Plus, Eye } from "lucide-react";
import { ForensicReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Reports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("full");

  const { data: reports, isLoading } = useQuery<ForensicReport[]>({
    queryKey: ["/api/reports"],
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/reports/generate", {
        title: reportTitle,
        reportType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setDialogOpen(false);
      setReportTitle("");
      toast({
        title: "Report Generated",
        description: "Forensic report has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate forensic report",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (id: string) => apiRequest("GET", `/api/reports/${id}/export`, {}),
    onSuccess: (data: any) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tor-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Report has been downloaded as JSON",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error?.message || "Failed to export report",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!reportTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a report title",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Forensic Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and export comprehensive analysis reports
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-report">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Forensic Report</DialogTitle>
              <DialogDescription>
                Create a comprehensive analysis report with correlation results and node data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., TOR Analysis - December 2025"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  data-testid="input-report-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="type" data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Analysis Report</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="node-specific">Node-Specific Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-report"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                data-testid="button-generate-report"
              >
                {generateMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : !reports || reports.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No reports generated yet</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  data-testid="button-create-first-report"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Report
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover-elevate" data-testid={`report-card-${report.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium">{report.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.generatedAt &&
                        format(new Date(report.generatedAt), "MMM dd, yyyy HH:mm")}
                    </CardDescription>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Type
                    </p>
                    <p className="font-medium capitalize mt-1">
                      {report.reportType.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Nodes
                    </p>
                    <p className="font-medium tabular-nums mt-1">
                      {report.nodeCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Correlations
                    </p>
                    <p className="font-medium tabular-nums mt-1">
                      {report.correlationCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Confidence
                    </p>
                    <p className="font-medium tabular-nums mt-1">
                      {report.confidenceAverage || 0}%
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => exportMutation.mutate(report.id)}
                    disabled={exportMutation.isPending}
                    data-testid={`button-export-${report.id}`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
