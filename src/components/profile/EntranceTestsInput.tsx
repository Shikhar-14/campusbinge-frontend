import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
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
import { ENTRANCE_TESTS, EntranceTest } from "@/data/entranceTests";
import { Badge } from "@/components/ui/badge";

export interface EntranceTestScore {
  testName: string;
  score: string;
  isCustom?: boolean;
}

interface EntranceTestsInputProps {
  value: EntranceTestScore[];
  onChange: (tests: EntranceTestScore[]) => void;
}

export function EntranceTestsInput({ value = [], onChange }: EntranceTestsInputProps) {
  const [open, setOpen] = useState(false);
  const [customTestName, setCustomTestName] = useState("");
  const [customTestScore, setCustomTestScore] = useState("");
  const [selectionType, setSelectionType] = useState<"predefined" | "custom">("predefined");

  // Group tests by category
  const groupedTests = ENTRANCE_TESTS.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, EntranceTest[]>);

  const addPredefinedTest = (testName: string) => {
    // Check if already added
    if (value.some(t => t.testName === testName)) {
      return;
    }
    onChange([...value, { testName, score: "", isCustom: false }]);
    setOpen(false);
  };

  const addCustomTest = () => {
    if (!customTestName.trim()) return;
    
    // Check if already added
    if (value.some(t => t.testName === customTestName)) {
      return;
    }
    
    onChange([...value, { testName: customTestName, score: customTestScore, isCustom: true }]);
    setCustomTestName("");
    setCustomTestScore("");
  };

  const removeTest = (testName: string) => {
    onChange(value.filter(t => t.testName !== testName));
  };

  const updateScore = (testName: string, score: string) => {
    onChange(value.map(t => t.testName === testName ? { ...t, score } : t));
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={selectionType} onValueChange={(v) => setSelectionType(v as "predefined" | "custom")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="predefined" id="predefined" />
          <Label htmlFor="predefined" className="font-normal cursor-pointer">Select from predefined tests</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom" className="font-normal cursor-pointer">Add custom entrance test</Label>
        </div>
      </RadioGroup>

      {selectionType === "predefined" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left h-auto min-h-[40px]">
              <Plus className="w-4 h-4 mr-2" />
              Add Entrance Test
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[400px] p-0 bg-background z-50" align="start">
            <Command className="bg-background">
              <CommandInput placeholder="Search entrance tests..." className="h-9" />
              <CommandList className="max-h-[400px]">
                <CommandEmpty>No test found.</CommandEmpty>
                
                {Object.entries(groupedTests).map(([category, tests]) => (
                  <CommandGroup key={category} heading={category}>
                    {tests.map((test) => {
                      const isAdded = value.some(t => t.testName === test.name);
                      return (
                        <CommandItem
                          key={test.name}
                          value={`${test.name} ${test.fullName}`}
                          onSelect={() => addPredefinedTest(test.name)}
                          disabled={isAdded}
                          className="py-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{test.name}</div>
                            <div className="text-xs text-muted-foreground">{test.fullName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {test.conductingBody} • {test.tier}
                            </div>
                          </div>
                          {isAdded && (
                            <Badge variant="secondary" className="ml-2">Added</Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customTestName">Test Name *</Label>
            <Input
              id="customTestName"
              value={customTestName}
              onChange={(e) => setCustomTestName(e.target.value)}
              placeholder="e.g., University Specific Test"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customTestScore">Score (Optional)</Label>
            <Input
              id="customTestScore"
              value={customTestScore}
              onChange={(e) => setCustomTestScore(e.target.value)}
              placeholder="e.g., 95/120 or 85%"
            />
          </div>
          <Button onClick={addCustomTest} disabled={!customTestName.trim()} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Test
          </Button>
        </Card>
      )}

      {value.length > 0 && (
        <div className="space-y-3">
          <Label>Added Tests & Scores</Label>
          {value.map((test) => (
            <Card key={test.testName} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{test.testName}</div>
                      {test.isCustom && (
                        <Badge variant="outline" className="mt-1">Custom Test</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTest(test.testName)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`score-${test.testName}`} className="text-sm">
                      Score/Rank/Percentile
                    </Label>
                    <Input
                      id={`score-${test.testName}`}
                      value={test.score}
                      onChange={(e) => updateScore(test.testName, e.target.value)}
                      placeholder="e.g., 250/300, AIR 1234, 98.5 percentile"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
