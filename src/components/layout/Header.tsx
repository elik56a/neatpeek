
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

const marketingNavItems = [
  {
    title: "Features",
    href: "/features",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "FAQ",
    href: "/faq",
  },
];

export function Header() {
  const pathname = usePathname();
  const isMarketing = !pathname?.startsWith("/dashboard") &&
                      !pathname?.startsWith("/design-") &&
                      !pathname?.startsWith("/brand-") &&
                      !pathname?.startsWith("/app") &&
                      pathname !== "/login" &&
                      pathname !== "/register";

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <Link href="/" className="flex items-center mr-6">
          <span className="text-lg font-bold flex-shrink-0">TailorChecker</span>
        </Link>

        {isMarketing ? (
          <>
            <div className="hidden md:flex items-center space-x-2">
              {marketingNavItems.map((item) => (
                <Button 
                  key={item.href} 
                  variant="ghost" 
                  asChild
                  className={cn(
                    pathname === item.href && "bg-muted text-foreground"
                  )}
                >
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              ))}
            </div>

            <div className="flex flex-1 items-center justify-end gap-1 md:gap-2">
              <div className="hidden md:flex">
                <ThemeToggle />
              </div>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
              <MobileNav items={marketingNavItems} isMarketing={true} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
