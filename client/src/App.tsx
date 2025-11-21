import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Dashboard from "@/pages/dashboard";
import DataCollection from "@/pages/data-collection";
import TrafficAnalysis from "@/pages/traffic-analysis";
import NodeCorrelation from "@/pages/node-correlation";
import NetworkTopology from "@/pages/network-topology";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/collection" component={DataCollection} />
      <Route path="/analysis" component={TrafficAnalysis} />
      <Route path="/correlation" component={NodeCorrelation} />
      <Route path="/topology" component={NetworkTopology} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toast } = useToast();
  const [isSystemActive, setIsSystemActive] = useState(false);

  const collectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tor-nodes/collect", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tor-nodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Auto-Collection Complete",
        description: "TOR node data has been successfully collected",
      });
    },
    onError: () => {
      toast({
        title: "Auto-Collection Failed",
        description: "Failed to collect TOR node data",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isSystemActive) {
      // Collect immediately when activated
      collectMutation.mutate();
      
      // Then collect every 5 minutes
      interval = setInterval(() => {
        collectMutation.mutate();
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSystemActive]);

  const toggleSystem = () => {
    const newState = !isSystemActive;
    setIsSystemActive(newState);
    
    toast({
      title: newState ? "System Activated" : "System Deactivated",
      description: newState 
        ? "Automatic TOR node collection started" 
        : "Automatic data collection stopped",
    });
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="relative flex items-center justify-between h-16 px-6 border-b-2 border-primary/40 bg-card/80 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
            <div className="absolute inset-0 holographic pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:text-primary transition-colors" />
              <div className="hidden md:block">
                <h2 className="text-sm font-bold font-mono tracking-wider text-primary neon-text uppercase">
                  TOR FORENSIC ANALYSIS SYSTEM
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={toggleSystem}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-md border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 hover-elevate active-elevate-2 ${
                  isSystemActive
                    ? "border-chart-5/50 bg-chart-5/10 text-chart-5 cyber-glow"
                    : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                }`}
                data-testid="button-system-toggle"
              >
                <div className={`w-2 h-2 rounded-full shadow-lg transition-all ${
                  isSystemActive 
                    ? "bg-chart-5 animate-pulse shadow-chart-5/50" 
                    : "bg-muted-foreground/50"
                }`} />
                {isSystemActive ? "System Active" : "System Inactive"}
              </button>
              <ThemeToggle />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
