import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ActionMenuProps {
  figmaUrl: string;
  reviewId: string;
  onGoToReview?: () => void;
}

export function ActionMenu({ figmaUrl, reviewId, onGoToReview }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-lg shadow-lg p-2">
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <Link
            href={figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full"
          >
            <ExternalLink className="h-4 w-4" /> Open in Figma
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer rounded-md hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <Link
            href={`/design-review/${reviewId}`}
            onClick={onGoToReview}
            className="flex items-center gap-2 w-full"
          >
            <Eye className="h-4 w-4" /> Go to Design Review
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
