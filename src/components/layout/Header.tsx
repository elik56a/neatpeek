
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-bold">TC</span>
          </div>
          <span className="font-bold text-xl hidden md:inline-block">TailorChecker</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Home
          </Link>
          <Link 
            href="/features" 
            className={`text-sm font-medium transition-colors ${isActive('/features') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className={`text-sm font-medium transition-colors ${isActive('/pricing') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Pricing
          </Link>
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'hover:text-primary'}`}
          >
            About
          </Link>
          <Link 
            href="/faq" 
            className={`text-sm font-medium transition-colors ${isActive('/faq') ? 'text-primary' : 'hover:text-primary'}`}
          >
            FAQ
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background animate-fade-in md:hidden">
          <nav className="container flex flex-col gap-4 p-6">
            <Link
              href="/"
              className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${isActive('/features') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${isActive('/pricing') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              onClick={closeMenu}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${isActive('/about') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              href="/faq"
              className={`flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors ${isActive('/faq') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
              onClick={closeMenu}
            >
              FAQ
            </Link>
            
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild>
                  <Link href="/dashboard" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={closeMenu}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={closeMenu}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
