import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", to: "/customers", icon: Users },
  { title: "Lançamentos", to: "/transactions", icon: Receipt },
  { title: "DRE", to: "/dre", icon: FileText },
  { title: "Relatórios", to: "/reports", icon: BarChart3 },
  { title: "Configurações", to: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            F
          </div>
          <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            FinPME
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    tooltip={item.title}
                  >
                    <Link to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          FinPME © {new Date().getFullYear()}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
