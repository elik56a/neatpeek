"use client";

import { User } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext } from "react";
import { AuthService } from "../services/auth-service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFigma: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image,
    role: session.user.role,
    companyId: session.user.companyId,
    companyName: session.user.companyName,
    companyRole: session.user.companyRole,
    figmaUserId: session.user.figmaUserId,
    figmaAccessToken: session.user.figmaAccessToken,
    figmaRefreshToken: session.user.figmaRefreshToken,
    figmaTokenExpiry: session.user.figmaTokenExpiry,
  } : null;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
