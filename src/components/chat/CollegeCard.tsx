// src/components/chat/CollegeCard.tsx
/**
 * College Card Component - Chat Integration
 * 
 * Displays college/program from RAG results.
 * "Save" button adds to shortlisted_colleges table.
 * Saved colleges appear in ShortlistView.tsx (/application-tracker)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  IndianRupee,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  saveToShortlist,
  removeFromShortlist,
  checkIfShortlisted,
} from "@/integrations/supabase/shortlist";
import type { RecommendedProgram } from "@/integrations/supabase/api";

// =============================================================================
// Types
// =============================================================================

export interface CollegeCardProps {
  program: RecommendedProgram;
  category?: "reach" | "realistic" | "safe";
  showCategory?: boolean;
  compact?: boolean;
}

// =============================================================================
// Category Styling
// =============================================================================

const categoryConfig = {
  reach: {
    label: "Reach",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    borderColor: "border-l-amber-500",
  },
  realistic: {
    label: "Realistic",
    color: "bg-green-500/10 text-green-600 border-green-200",
    borderColor: "border-l-green-500",
  },
  safe: {
    label: "Safe",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    borderColor: "border-l-blue-500",
  },
};

// =============================================================================
// Helpers
// =============================================================================

function formatFees(fees: number | null): string {
  if (!fees) return "Fees not available";
  
  if (fees >= 100000) {
    const lakhs = fees / 100000;
    return `₹${lakhs.toFixed(1)}L/year`;
  }
  
  return `₹${fees.toLocaleString("en-IN")}/year`;
}

// =============================================================================
// Component
// =============================================================================

export function CollegeCard({
  program,
  category = "realistic",
  showCategory = true,
  compact = false,
}: CollegeCardProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlistId, setShortlistId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const config = categoryConfig[category];

  // Check shortlist status on mount
  useEffect(() => {
    async function checkStatus() {
      if (program.external_id) {
        const result = await checkIfShortlisted(program.external_id);
        setIsShortlisted(result.isShortlisted);
        setShortlistId(result.shortlistId || null);
      }
    }
    checkStatus();
  }, [program.external_id]);

  // Handle save/unsave toggle
  const handleSaveToggle = async () => {
    setIsSaving(true);

    try {
      if (isShortlisted) {
        // Remove from shortlist
        const result = await removeFromShortlist(program.external_id);
        
        if (result.success) {
          setIsShortlisted(false);
          setShortlistId(null);
          toast({
            title: "Removed",
            description: result.message,
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } else {
        // Add to shortlist
        const result = await saveToShortlist(program);
        
        if (result.success) {
          setIsShortlisted(true);
          setShortlistId(result.id || null);
          toast({
            title: result.alreadyExists ? "Already Saved" : "Saved!",
            description: result.message,
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("[CollegeCard] Save error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to shortlist
  const handleViewShortlist = () => {
    navigate("/application-tracker", { state: { activeTab: "shortlist" } });
  };

  // Compact view for inline display
  if (compact) {
    return (
      <Card className={`p-3 border-l-4 ${config.borderColor}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{program.college_name}</h4>
            <p className="text-xs text-muted-foreground truncate">{program.course_name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToggle}
            disabled={isSaving}
            className="flex-shrink-0"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isShortlisted ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>
    );
  }

  // Full card view
  return (
    <Card className={`p-4 border-l-4 ${config.borderColor} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base leading-tight">
            {program.college_name}
          </h4>
          {showCategory && (
            <Badge variant="outline" className={`mt-1 text-xs ${config.color}`}>
              {config.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Course */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <GraduationCap className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{program.course_name}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span>
          {program.city}, {program.state}
        </span>
      </div>

      {/* Fees */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <IndianRupee className="w-4 h-4 flex-shrink-0" />
        <span>{formatFees(program.approx_fees_per_year)}</span>
      </div>

      {/* Eligibility */}
      {program.eligibility && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
          <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{program.eligibility}</span>
        </div>
      )}

      {/* Admission Process */}
      {program.admission_process && (
        <div className="bg-muted/50 rounded px-3 py-2 text-sm mt-3">
          <span className="font-medium">Admission:</span>{" "}
          <span className="text-muted-foreground">{program.admission_process}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <Button
          variant={isShortlisted ? "secondary" : "outline"}
          size="sm"
          onClick={handleSaveToggle}
          disabled={isSaving}
          className="gap-1"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isShortlisted ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          {isShortlisted ? "Saved" : "Save"}
        </Button>

        {isShortlisted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewShortlist}
            className="gap-1 text-muted-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            View Shortlist
          </Button>
        )}
      </div>
    </Card>
  );
}

// =============================================================================
// College Card List Component
// =============================================================================

interface CollegeCardListProps {
  programs: RecommendedProgram[];
  showCategory?: boolean;
  compact?: boolean;
}

/**
 * Renders a list of CollegeCards with automatic categorization
 */
export function CollegeCardList({
  programs,
  showCategory = true,
  compact = false,
}: CollegeCardListProps) {
  if (!programs || programs.length === 0) {
    return null;
  }

  // Categorize programs based on score (lower = better match)
  const categorized = categorizePrograms(programs);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {programs.map((program, index) => {
        const category = getCategory(program, categorized);
        return (
          <CollegeCard
            key={program.external_id || index}
            program={program}
            category={category}
            showCategory={showCategory}
            compact={compact}
          />
        );
      })}
    </div>
  );
}

// =============================================================================
// Categorization Helpers
// =============================================================================

interface CategorizedPrograms {
  reach: RecommendedProgram[];
  realistic: RecommendedProgram[];
  safe: RecommendedProgram[];
}

function categorizePrograms(programs: RecommendedProgram[]): CategorizedPrograms {
  if (programs.length === 0) {
    return { reach: [], realistic: [], safe: [] };
  }

  // Sort by score (lower = better match = reach)
  const sorted = [...programs].sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
  
  const total = sorted.length;
  const third = Math.ceil(total / 3);

  return {
    reach: sorted.slice(0, third),
    realistic: sorted.slice(third, third * 2),
    safe: sorted.slice(third * 2),
  };
}

function getCategory(
  program: RecommendedProgram,
  categorized: CategorizedPrograms
): "reach" | "realistic" | "safe" {
  if (categorized.reach.some((p) => p.external_id === program.external_id)) {
    return "reach";
  }
  if (categorized.realistic.some((p) => p.external_id === program.external_id)) {
    return "realistic";
  }
  return "safe";
}

export default CollegeCard;