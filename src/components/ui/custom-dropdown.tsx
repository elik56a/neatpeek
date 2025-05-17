import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import React from "react";
import { CustomDropdownOption } from "@/types/general";

interface CustomDropdownProps {
  label: string;
  selected?: CustomDropdownOption | null;
  options: CustomDropdownOption[];
  onSelect: (option: CustomDropdownOption) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  selected,
  options,
  onSelect,
  icon,
  placeholder,
  className = "",
  badgeClassName = "text-xs font-medium text-primary bg-muted rounded px-2 py-0.5",
  triggerClassName = "w-full text-left flex items-center",
  contentClassName = "relative w-full",
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`${triggerClassName} ${className} pr-10`}>
          {icon && <span className="mr-2 h-4 w-4 shrink-0">{icon}</span>}
          <span className="flex-1 truncate flex items-center gap-2">
            {selected ? (
              <span className={badgeClassName}>{selected.label}</span>
            ) : (
              placeholder || label
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        {options.map(option => {
          const isSelected = selected && selected.value === option.value;
          return (
            <DropdownMenuItem key={option.value} onClick={() => onSelect(option)}>
              <span className="flex items-center justify-between w-full">
                <span className={isSelected ? "font-bold" : undefined}>{option.label}</span>
                {isSelected && <Check className="ml-2 h-4 w-4 text-primary" />}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
