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
              <header className="flex items-center justify-between h-16 px-6 border-b bg-background">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="hidden md:block">
                    <h2 className="text-sm font-medium text-foreground">
                      TN Police Hackathon 2025
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-chart-5 animate-pulse" />
                    System Active
                  </div>
                  <ThemeToggle />
                </div>
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
