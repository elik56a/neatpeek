
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  items: {
    title: string;
    href: string;
    description?: string;
  }[];
  isMarketing?: boolean;
}

export function MobileNav({ items, isMarketing = false }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white dark:bg-slate-950">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle>Menu</SheetTitle>
          <Button 
            variant="ghost" 
            className="absolute right-4 top-4 rounded-sm px-0 py-0 h-auto" 
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>
        <div className="grid gap-2 py-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors duration-200",
                pathname === item.href && "bg-muted"
              )}
              onClick={() => setOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          {isMarketing && (
            <>
              <div className="border-t my-2"></div>
              <Link
                href="/login"
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors duration-200",
                  pathname === "/login" && "bg-muted"
                )}
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200",
                )}
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
