import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
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

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md border-2 border-chart-5/50 bg-chart-5/10 text-chart-5 text-xs font-mono font-bold uppercase tracking-wider cyber-glow">
                    <div className="w-2 h-2 rounded-full bg-chart-5 animate-pulse shadow-lg shadow-chart-5/50" />
                    System Active
                  </div>
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
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
