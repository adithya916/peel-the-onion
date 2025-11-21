import { useState } from "react";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { NodeDataTable } from "@/components/NodeDataTable";
import { TimelineView } from "@/components/TimelineView";
import { StatsCards } from "@/components/StatsCards";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("network");

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent scan-line" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur">
            <TabsTrigger value="network" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Network Topology
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Timeline Analysis
            </TabsTrigger>
            <TabsTrigger value="nodes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Node Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="space-y-4">
            <NetworkVisualization />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <TimelineView />
          </TabsContent>

          <TabsContent value="nodes" className="space-y-4">
            <NodeDataTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
