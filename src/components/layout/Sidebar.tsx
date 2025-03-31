
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  PaintBucket,
  History,
  FileCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarLinks = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard 
    },
    { 
      name: "Brand Setup", 
      href: "/brand-setup", 
      icon: PaintBucket 
    },
    { 
      name: "Design Checker", 
      href: "/design-checker", 
      icon: FileCheck 
    },
    { 
      name: "Design History", 
      href: "/design-history", 
      icon: History 
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings 
    },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-white font-bold">TC</span>
            </div>
            <span className="font-bold text-lg">TailorChecker</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-bold">TC</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("text-muted-foreground", collapsed && "mx-auto")}
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            
            if (collapsed) {
              return (
                <TooltipProvider key={link.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex h-10 w-10 mx-auto items-center justify-center rounded-md",
                          "transition-colors hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        )}
                      >
                        <link.icon size={20} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {link.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3",
                  "transition-colors hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                )}
              >
                <link.icon size={20} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t mt-auto">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mx-auto"
                  onClick={logout}
                >
                  <LogOut size={20} className="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut size={18} className="text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
