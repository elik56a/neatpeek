"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

// Define a generic guideline interface with the minimum required properties
interface Guideline {
  id: string;
  name: string;
}

interface GuidelineSelectorProps {
  guidelines: Guideline[];
  selectedId: string;
  onSelect: (id: string) => void;
  companyName?: string;
}

export function GuidelineSelector({
  guidelines,
  selectedId,
  onSelect,
  companyName,
}: GuidelineSelectorProps) {
  const [open, setOpen] = useState(false);

  // Get the currently selected guideline
  const selectedGuideline = guidelines.find(g => g.id === selectedId);

  // Get the display name and initial
  const displayName = selectedGuideline?.name || companyName || "Your Brand";
  const initial = displayName.charAt(0);

  // If there's only one guideline, show a simple display
  if (guidelines.length <= 1) {
    return (
      <div className="flex items-center space-x-3 px-4 py-3 rounded-md border bg-background shadow-sm hover:bg-accent/10 text-foreground transition-all duration-200">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
          <span className="text-sm font-medium">{initial}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">Active Guideline</span>
        </div>
      </div>
    );
  }

  // Otherwise, show the dropdown selector
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex justify-between w-[260px] px-4 py-3 border-border hover:border-border hover:bg-accent/10 text-foreground transition-all duration-200 shadow-sm hover:shadow group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center mr-3 border border-primary/10">
              <span className="text-sm font-medium">{initial}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[160px]">{displayName}</span>
              <span className="text-xs text-muted-foreground">Active Guideline</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 border-border shadow-md" align="end">
        <Command className="rounded-lg overflow-hidden">
          <CommandInput placeholder="Search guidelines..." className="h-14 border-none focus:ring-0" />
          <CommandList className="max-h-[300px] overflow-auto py-1">
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">No guidelines found</CommandEmpty>
            <CommandGroup className="px-1 py-1">
              {guidelines.map((guideline) => {
                const isSelected = guideline.id === selectedId;
                return (
                  <CommandItem
                    key={guideline.id}
                    value={guideline.id}
                    onSelect={() => {
                      onSelect(guideline.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors duration-150 cursor-pointer ",
                      isSelected ? "bg-primary/10 text-primary hover:bg-accent/10" : "hover:bg-accent/10"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center border",
                      isSelected ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/50 border-border"
                    )}>
                      <span className="text-sm font-medium">{guideline.name.charAt(0)}</span>
                    </div>
                    <span className="truncate font-medium flex-1">{guideline.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0 ml-1" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
