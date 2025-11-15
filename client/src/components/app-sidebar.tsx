import { 
  Activity, 
  Database, 
  FileUp, 
  GitBranch, 
  Home, 
  Network, 
  FileText, 
  Shield 
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
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">TOR Unveil</h2>
            <p className="text-xs text-muted-foreground">Forensic Analysis</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide px-6">
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
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
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
