"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth";
import { CompanySelector } from "@/features/company";
import { cn } from "@/utils/cn";
import { appConfig } from "@/config/app";
import {
  ChevronLeft,
  ChevronRight,
  FileCheck,
  History,
  LayoutDashboard,
  LogOut,
  PaintBucket,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Design Review",
      href: "/design-review",
      icon: FileCheck,
    },
    {
      name: "Brand Setup",
      href: "/brand-setup",
      icon: PaintBucket,
    },
    {
      name: "Teams",
      href: "/teams",
      icon: Users,
    },

    {
      name: "Design History",
      href: "/design-history",
      icon: History,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r bg-sidebar transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <span className="text-white font-bold">{appConfig.name.substring(0, 1)}</span>
            </div>
            <span className="font-bold text-lg">{appConfig.name}</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-bold">{appConfig.name.substring(0, 1)}</span>
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

      <ScrollArea className="flex-1 py-4 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 mb-4">
            <CompanySelector />
          </div>
        )}
        <nav className="px-2 space-y-1">
          {sidebarLinks.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

            if (collapsed) {
              return (
                <TooltipProvider key={link.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={link.href}
                        prefetch={true}
                        className={cn(
                          "flex h-10 w-10 mx-auto items-center justify-center rounded-md",
                          "transition-all duration-200 ease-in-out hover:bg-sidebar-accent",
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            : ""
                        )}
                      >
                        <link.icon
                          size={20}
                          className={cn(
                            "transition-transform duration-200",
                            isActive && "scale-110"
                          )}
                        />
                        {isActive && (
                          <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse"></div>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{link.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3",
                  "transition-all duration-200 ease-in-out hover:bg-sidebar-accent",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : ""
                )}
              >
                <link.icon
                  size={20}
                  className={cn("transition-transform duration-200", isActive && "scale-110")}
                />
                <span className={cn("transition-all duration-200", isActive && "font-medium")}>
                  {link.name}
                </span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-200">
                    <AvatarImage src={user?.image} alt={user?.name || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map(n => n[0]?.toUpperCase())
                            .join("")
                            .substring(0, 2)
                        : ""}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">{user?.name || user?.email}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="mx-auto" onClick={logout}>
                    <LogOut size={20} className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image} alt={user?.name || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map(n => n[0]?.toUpperCase())
                        .join("")
                        .substring(0, 2)
                    : ""}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
