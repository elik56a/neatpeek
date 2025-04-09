"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDataContext } from "@/providers";
import { Building, ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";

export function CompanySelector() {
  const { company, hasCompany, isCompanyAdmin } = useAppDataContext();

  if (!hasCompany) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/company/create">
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building className="h-4 w-4" />
          {company?.name || "Company"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isCompanyAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/company/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Company Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/company/members" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Manage Members
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
