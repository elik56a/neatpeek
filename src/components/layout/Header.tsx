
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-bold">TC</span>
          </div>
          <span className="font-bold text-xl hidden md:inline-block">TailorChecker</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
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
              to="/"
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent transition-colors"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/features"
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent transition-colors"
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent transition-colors"
              onClick={closeMenu}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent transition-colors"
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              to="/faq"
              className="flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent transition-colors"
              onClick={closeMenu}
            >
              FAQ
            </Link>
            
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button asChild>
                  <Link to="/dashboard" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={closeMenu}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={closeMenu}>
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
