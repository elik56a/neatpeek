"use client";

import { User } from "@/types";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext } from "react";

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

  const user = session?.user || null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);

      // Use redirect: true for more reliable session handling
      const response = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      // This code will only run if redirect is set to false
      console.log("Login response:", response);

      if (response?.error) {
        throw new Error(response.error);
      }

      // The redirect should happen automatically, but just in case
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("Attempting Google login");
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const loginWithFigma = async () => {
    try {
      console.log("Attempting Figma login");
      await signIn("figma", {
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (error) {
      console.error("Figma login failed:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Register user through API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }

      // Get the response data
      const data = await response.json();
      console.log("Registration successful:", data);

      // Instead of trying to auto-login, just redirect to the login page
      // This is more reliable and gives the user a clear path
      router.push(`/login?registered=true&email=${encodeURIComponent(email)}`);

      /* Commenting out auto-login as it's causing issues
      const loginResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (loginResponse?.error) {
        console.error("Auto-login after registration failed:", loginResponse.error);
        router.push("/login?registered=true");
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push("/dashboard");
      }
      */
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
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
