import * as React from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { AddItemDialog } from "@/features/tasks/components/add-item-dialog";
import { cn } from "@/shared/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

export interface TaskDropdownMenuProps {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  onAddOption?: (label: string) => void;
  showAddOption?: boolean;
  addOptionLabel?: string;
  addDialogTitle?: string;
  addDialogDescription?: string;
  className?: string;
}

export function TaskDropdownMenu({
  icon,
  placeholder,
  value,
  options,
  onValueChange,
  onAddOption,
  showAddOption = false,
  addOptionLabel = "Add option",
  addDialogTitle = "Add New Item",
  addDialogDescription,
  className,
}: TaskDropdownMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleAddOption = (name: string) => {
    if (onAddOption) {
      onAddOption(name);
    }
  };

  const handleAddClick = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent",
              className
            )}
          >
            {icon}
            {selectedOption ? selectedOption.label : placeholder}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onValueChange(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {option.color && (
                  <div className={cn("h-2 w-2 rounded-full", option.color)} />
                )}
                {option.label}
              </span>
              {value === option.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}

          {showAddOption && onAddOption && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleAddClick}
                className="cursor-pointer text-[#e44232] hover:text-[#e44232]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addOptionLabel}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={addDialogTitle}
        description={addDialogDescription}
        placeholder="Enter name..."
        onAdd={handleAddOption}
      />
    </>
  );
}
