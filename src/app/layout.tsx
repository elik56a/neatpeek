import "@/app/globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import { CompanyProvider } from "@/features/company/components/CompanyProvider";
import { ThemeProvider } from "@/features/theme";
import { Inter } from 'next/font/google';
import type { Metadata } from 'next/types';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TailorChecker - Brand Consistency Checker",
  description: "Ensure all your designs meet your brand guidelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider defaultTheme="light" storageKey="tailor-checker-theme">
            <TooltipProvider>
              <AuthProvider>
                <CompanyProvider>
                  {children}
                  <Toaster />
                  <Sonner />
                </CompanyProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
