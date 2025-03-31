
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import Sidebar from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const AppLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-screen">
          <main className="p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
