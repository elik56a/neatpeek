"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface AnimatedTabsProps {
  defaultValue: string;
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  children: React.ReactNode;
  className?: string;
}

export function AnimatedTabs({ 
  defaultValue, 
  tabs, 
  children, 
  className 
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle tab change with animation
  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(value);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Tabs 
      defaultValue={defaultValue} 
      value={activeTab}
      className={cn("space-y-4", className)}
      onValueChange={handleTabChange}
    >
      <TabsList className="flex flex-wrap bg-slate-50 p-1">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className={cn(
              "flex items-center data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300",
              "data-[state=active]:text-indigo-700"
            )}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className={cn(
        "transition-opacity duration-300",
        isAnimating ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </div>
    </Tabs>
  );
}

export function AnimatedTabsContent({ 
  value, 
  children,
  className
}: { 
  value: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent 
      value={value} 
      className={cn(
        "animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
        className
      )}
      style={{ animationFillMode: 'both' }}
    >
      {children}
    </TabsContent>
  );
}
