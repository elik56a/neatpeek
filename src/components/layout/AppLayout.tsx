
"use client";

import PageTransition from "./PageTransition";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <main className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
