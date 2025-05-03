import { signIn, signOut } from "next-auth/react";
import { AuthResponse, LoginCredentials, RegisterCredentials } from "../types/auth";
import { validatePassword } from "../utils/password-validator";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check rate limiting
      const rateLimitResponse = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: credentials.email }),
      });

      if (!rateLimitResponse.ok) {
        const data = await rateLimitResponse.json();
        return {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: data.error || "Too many login attempts. Please try again later.",
          },
        };
      }

      const response = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (!response) {
        return {
          success: false,
          error: {
            code: "LOGIN_FAILED",
            message: "No response from authentication server.",
          },
        };
      }

      if (response.error) {
        // Update rate limit on failed attempt
        await fetch("/api/auth/rate-limit", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: credentials.email, success: false }),
        });

        return {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        };
      }

      // Reset rate limit on successful login
      await fetch("/api/auth/rate-limit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: credentials.email, success: true }),
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: {
          code: "LOGIN_FAILED",
          message: "An unexpected error occurred. Please try again.",
        },
      };
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate password
      const passwordError = validatePassword(credentials.password);
      if (passwordError) {
        return {
          success: false,
          error: {
            code: "INVALID_PASSWORD",
            message: passwordError,
          },
        };
      }

      // Register user through API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: {
            code: "REGISTRATION_FAILED",
            message: data.message || "Registration failed",
          },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "REGISTRATION_ERROR",
          message: "Registration failed. Please try again.",
        },
      };
    }
  }

  static async loginWithGoogle(): Promise<AuthResponse> {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GOOGLE_LOGIN_FAILED",
          message: "Google login failed. Please try again.",
        },
      };
    }
  }

  static async loginWithFigma(): Promise<AuthResponse> {
    try {
      await signIn("figma", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "FIGMA_LOGIN_FAILED",
          message: "Figma login failed. Please try again.",
        },
      };
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      await signOut({ callbackUrl: "/login" });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: "Logout failed. Please try again.",
        },
      };
    }
  }
}
