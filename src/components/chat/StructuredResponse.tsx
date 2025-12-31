// src/components/chat/StructuredResponse.tsx
/**
 * Structured Response Component
 * 
 * Displays AI response with:
 * - Markdown text answer
 * - College recommendations grouped by Reach/Realistic/Safe
 * - Expandable sections
 * - Action buttons
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  GraduationCap, 
  Target, 
  Shield,
  Sparkles,
  ListFilter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./MarkdownMessage";
import { CollegeCard, CollegeCardList, type CollegeProgram } from "./CollegeCard";

// =============================================================================
// Types
// =============================================================================

export interface StructuredResponseProps {
  answer: string;
  intent: string;
  programs: CollegeProgram[];
  meta?: {
    num_programs_retrieved?: number;
    model?: string;
  };
  onSaveProgram?: (program: CollegeProgram) => void;
  onCompareProgram?: (program: CollegeProgram) => void;
  onViewDetails?: (program: CollegeProgram) => void;
  className?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Categorize programs into Reach/Realistic/Safe based on score
 * Lower FAISS score = better match (L2 distance)
 */
function categorizePrograms(programs: CollegeProgram[]): {
  reach: CollegeProgram[];
  realistic: CollegeProgram[];
  safe: CollegeProgram[];
} {
  if (!programs || programs.length === 0) {
    return { reach: [], realistic: [], safe: [] };
  }

  // Sort by score (lower is better for L2 distance)
  const sorted = [...programs].sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
  
  const total = sorted.length;
  
  if (total <= 3) {
    // With few results, distribute evenly
    return {
      reach: sorted.slice(0, 1),
      realistic: sorted.slice(1, 2),
      safe: sorted.slice(2),
    };
  }
  
  // Split into thirds
  const third = Math.ceil(total / 3);
  
  return {
    reach: sorted.slice(0, third),
    realistic: sorted.slice(third, third * 2),
    safe: sorted.slice(third * 2),
  };
}

// =============================================================================
// Sub-Components
// =============================================================================

interface CategorySectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  programs: CollegeProgram[];
  category: "reach" | "realistic" | "safe";
  defaultOpen?: boolean;
  onSave?: (program: CollegeProgram) => void;
  onCompare?: (program: CollegeProgram) => void;
  onViewDetails?: (program: CollegeProgram) => void;
}

function CategorySection({
  title,
  description,
  icon,
  programs,
  category,
  defaultOpen = true,
  onSave,
  onCompare,
  onViewDetails,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!programs || programs.length === 0) {
    return null;
  }

  const categoryColors = {
    reach: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20",
    realistic: "border-green-200 bg-green-50/50 dark:bg-green-950/20",
    safe: "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20",
  };

  const badgeColors = {
    reach: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    realistic: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    safe: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("overflow-hidden", categoryColors[category])}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background shadow-sm">
                {icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{title}</span>
                  <Badge className={cn("text-xs", badgeColors[category])}>
                    {programs.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="grid gap-3">
              {programs.map((program, index) => (
                <CollegeCard
                  key={program.external_id || `${category}-${index}`}
                  program={program}
                  category={category}
                  onSave={onSave}
                  onCompare={onCompare}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function StructuredResponse({
  answer,
  intent,
  programs,
  meta,
  onSaveProgram,
  onCompareProgram,
  onViewDetails,
  className,
}: StructuredResponseProps) {
  const [viewMode, setViewMode] = useState<"structured" | "list">("structured");
  
  const hasPrograms = programs && programs.length > 0;
  const isCollegeSearch = intent === "college_search";
  
  // Categorize programs
  const categorized = categorizePrograms(programs);
  const hasCategories = 
    categorized.reach.length > 0 || 
    categorized.realistic.length > 0 || 
    categorized.safe.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Response Text */}
      <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm">
        <MarkdownMessage content={answer} />
      </Card>

      {/* College Recommendations */}
      {isCollegeSearch && hasPrograms && (
        <div className="space-y-3">
          {/* Header with view toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Recommended Colleges ({programs.length})
              </span>
            </div>
            
            {hasCategories && (
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "structured" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("structured")}
                  className="h-7 text-xs"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Grouped
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 text-xs"
                >
                  <ListFilter className="w-3 h-3 mr-1" />
                  List
                </Button>
              </div>
            )}
          </div>

          {/* Structured View (Reach/Realistic/Safe) */}
          {viewMode === "structured" && hasCategories && (
            <div className="space-y-3">
              <CategorySection
                title="Reach"
                description="Competitive options - aim high!"
                icon={<Target className="w-5 h-5 text-amber-600" />}
                programs={categorized.reach}
                category="reach"
                defaultOpen={true}
                onSave={onSaveProgram}
                onCompare={onCompareProgram}
                onViewDetails={onViewDetails}
              />
              
              <CategorySection
                title="Realistic"
                description="Good match for your profile"
                icon={<GraduationCap className="w-5 h-5 text-green-600" />}
                programs={categorized.realistic}
                category="realistic"
                defaultOpen={true}
                onSave={onSaveProgram}
                onCompare={onCompareProgram}
                onViewDetails={onViewDetails}
              />
              
              <CategorySection
                title="Safe"
                description="Strong chance of admission"
                icon={<Shield className="w-5 h-5 text-blue-600" />}
                programs={categorized.safe}
                category="safe"
                defaultOpen={false}
                onSave={onSaveProgram}
                onCompare={onCompareProgram}
                onViewDetails={onViewDetails}
              />
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <CollegeCardList
              programs={programs}
              showRanks={true}
              onSave={onSaveProgram}
              onCompare={onCompareProgram}
              onViewDetails={onViewDetails}
            />
          )}
        </div>
      )}

      {/* Meta info (debug) */}
      {meta && import.meta.env.DEV && (
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          Model: {meta.model} | Programs: {meta.num_programs_retrieved}
        </div>
      )}
    </div>
  );
}

export default StructuredResponse;