import { Download, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Header = () => {
  const handleExport = () => {
    toast.success("Forensic report exported successfully", {
      description: "Report saved to downloads folder",
    });
  };

  return (
    <header className="border-b border-border bg-card/30 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary animate-pulse-glow" />
              <Activity className="w-4 h-4 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold glow-text">TOR Unveil</h1>
              <p className="text-xs text-muted-foreground font-mono">Network Analysis System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground font-mono">System Active</span>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
