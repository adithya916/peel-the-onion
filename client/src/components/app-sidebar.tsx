import { 
  Activity, 
  Database, 
  FileUp, 
  GitBranch, 
  Home, 
  Network, 
  FileText
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import torIcon from "@/assets/tor-icon.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Data Collection",
    url: "/collection",
    icon: Database,
  },
  {
    title: "Traffic Analysis",
    url: "/analysis",
    icon: Activity,
  },
  {
    title: "Node Correlation",
    url: "/correlation",
    icon: GitBranch,
  },
  {
    title: "Network Topology",
    url: "/topology",
    icon: Network,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-2 border-primary/30">
      <SidebarHeader className="p-6 border-b-2 border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 data-grid opacity-20 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 border-2 border-primary cyber-glow backdrop-blur-sm">
            <img src={torIcon} alt="TOR Unveil" className="w-8 h-8 drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-primary uppercase tracking-wider">TOR Unveil</h2>
            <p className="text-xs text-muted-foreground font-mono tracking-wide">Forensic Analysis</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold font-mono uppercase tracking-widest px-6 text-primary/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group relative overflow-hidden transition-all duration-300 hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:shadow-[inset_0_0_12px_hsl(var(--primary)/0.5)] font-mono"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4 group-hover:text-primary transition-colors group-data-[active=true]:text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                      <span className="uppercase tracking-wide text-xs font-semibold group-hover:text-primary transition-colors group-data-[active=true]:text-primary">{item.title}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity holographic" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
