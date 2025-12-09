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
import { COUNTRY_CODES, CountryCode } from "@/data/countryCodes";

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CountryCodeSelect({ value, onChange, placeholder = "Select code...", className }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCode = COUNTRY_CODES.find(c => c.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-32 justify-between text-left h-auto min-h-[40px] py-2", className)}
        >
          <span className="truncate pr-1">
            {selectedCode ? selectedCode.value : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0 bg-background z-50" align="start">
        <Command className="bg-background">
          <CommandInput placeholder="Search country codes..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No country code found.</CommandEmpty>
            
            <CommandGroup>
              {COUNTRY_CODES.map((code) => (
                <CommandItem
                  key={`${code.value}-${code.country}`}
                  value={`${code.value} ${code.country} ${code.label}`}
                  onSelect={() => {
                    onChange(code.value);
                    setOpen(false);
                  }}
                  className="py-2"
                >
                  <span className="flex-1 whitespace-normal break-words pr-2">
                    {code.label}
                  </span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      value === code.value && selectedCode?.country === code.country ? "opacity-100" : "opacity-0"
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
