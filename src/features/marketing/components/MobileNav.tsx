import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileNavProps {
  items: { title: string; href: string }[];
  isMarketing: boolean;
}

export function MobileNav({ items, isMarketing }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col space-y-4">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground"
              }
            >
              {item.title}
            </Link>
          ))}
          {isMarketing && (
            <>
              <Link href="/login" className="text-muted-foreground">
                Sign In
              </Link>
              <Link href="/register" className="text-foreground font-medium">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
