import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { NATIONALITIES } from "@/data/nationalities";

interface NationalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NationalitySelect({ 
  value, 
  onChange, 
  placeholder = "Select nationality...", 
  className 
}: NationalitySelectProps) {
  const [open, setOpen] = useState(false);

  // Prioritize Indian at the top
  const sortedNationalities = [...NATIONALITIES].sort((a, b) => {
    if (a === "Indian") return -1;
    if (b === "Indian") return 1;
    return a.localeCompare(b);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left h-auto min-h-[40px] py-2", className)}
        >
          <span className="truncate pr-2">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0 bg-background z-50" align="start">
        <Command className="bg-background">
          <CommandInput placeholder="Search nationality..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup>
              {sortedNationalities.map((nationality) => (
                <CommandItem
                  key={nationality}
                  value={nationality}
                  onSelect={() => {
                    onChange(nationality);
                    setOpen(false);
                  }}
                  className="py-2"
                >
                  <span className="flex-1">
                    {nationality}
                  </span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === nationality ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
