import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
import { SchoolBoard } from "@/data/schoolBoards";

interface BoardSelectProps {
  value: string;
  onChange: (value: string) => void;
  boards: SchoolBoard[];
  placeholder?: string;
  className?: string;
}

export function BoardSelect({ value, onChange, boards, placeholder = "Select board...", className }: BoardSelectProps) {
  const [open, setOpen] = useState(false);

  // Group boards by type for better organization
  const indianNational = boards.filter(b => b.region === "India" && b.type === "National");
  const indianState = boards.filter(b => b.region === "India" && b.type === "State");
  const international = boards.filter(b => b.region === "International");
  const others = boards.filter(b => b.region !== "India" && b.region !== "International");

  const selectedBoard = boards.find(b => b.value === value);

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
            {selectedBoard ? selectedBoard.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[400px] p-0 bg-background z-50" align="start">
        <Command className="bg-background">
          <CommandInput placeholder="Search boards..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No board found.</CommandEmpty>
            
            {indianNational.length > 0 && (
              <CommandGroup heading="Indian National Boards">
                {indianNational.map((board) => (
                  <CommandItem
                    key={board.value}
                    value={board.label}
                    onSelect={() => {
                      onChange(board.value);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <span className="flex-1 whitespace-normal break-words pr-2">
                      {board.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === board.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {indianState.length > 0 && (
              <CommandGroup heading="Indian State Boards">
                {indianState.map((board) => (
                  <CommandItem
                    key={board.value}
                    value={board.label}
                    onSelect={() => {
                      onChange(board.value);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <span className="flex-1 whitespace-normal break-words pr-2">
                      {board.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === board.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {international.length > 0 && (
              <CommandGroup heading="International Boards">
                {international.map((board) => (
                  <CommandItem
                    key={board.value}
                    value={board.label}
                    onSelect={() => {
                      onChange(board.value);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <span className="flex-1 whitespace-normal break-words pr-2">
                      {board.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === board.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {others.length > 0 && (
              <CommandGroup heading="Other Countries">
                {others.map((board) => (
                  <CommandItem
                    key={board.value}
                    value={board.label}
                    onSelect={() => {
                      onChange(board.value);
                      setOpen(false);
                    }}
                    className="py-3"
                  >
                    <span className="flex-1 whitespace-normal break-words pr-2">
                      {board.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === board.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
