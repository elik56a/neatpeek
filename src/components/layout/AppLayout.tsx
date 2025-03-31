
"use client";

import { useAuth } from "@/context/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-screen">
          <main className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
