"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { createContext, useCallback } from "react";
import { AuthService } from "../services/auth-service";
import { CustomLoader } from "@/components/ui/custom-loader";
import { appConfig } from "@/config/app";

// Session-based user type (simplified for session data)
interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
  companyId?: string;
  companyName?: string;
  companyRole?: string;
  figmaUserId?: string;
  hasFigmaConnection?: boolean;
  figmaTokenExpiry?: Date;
}

interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFigma: () => Promise<void>;
  autoLogin: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthLoader component to handle loading state
const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  // Show loading screen while session is being determined
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center">
          <CustomLoader variant="pulse" size="xl" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image,
        role: session.user.role,
        companyId: session.user.companyId,
        companyName: session.user.companyName,
        companyRole: session.user.companyRole,
        figmaUserId: session.user.figmaUserId,
        hasFigmaConnection: session.user.hasFigmaConnection,
        figmaTokenExpiry: session.user.figmaTokenExpiry,
      }
    : null;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Manual auto-redirect function - safe to call during render
  const autoLogin = useCallback(() => {
    if (!isLoading && isAuthenticated) {
      if (pathname === "/login" || pathname === "/register") {
        // Use setTimeout to defer navigation outside of render cycle
        setTimeout(() => {
          router.push("/dashboard");
        }, 0);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    if (!response.success) {
      throw new Error(response.error?.message || "Login failed. Please try again.");
    }
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await AuthService.register({ name, email, password });
    if (!response.success) {
      throw new Error(response.error?.message || "Registration failed. Please try again.");
    }
    router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);
  };

  const loginWithGoogle = async () => {
    const response = await AuthService.loginWithGoogle();
    if (!response.success) {
      throw new Error(response.error?.message || "Google login failed. Please try again.");
    }
  };

  const loginWithFigma = async () => {
    const response = await AuthService.loginWithFigma();
    if (!response.success) {
      throw new Error(response.error?.message || "Figma login failed. Please try again.");
    }
  };

  const logout = async () => {
    const response = await AuthService.logout();
    if (!response.success) {
      throw new Error(response.error?.message || "Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        loginWithGoogle,
        loginWithFigma,
        autoLogin,
      }}
    >
      <AuthLoader>{children}</AuthLoader>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
