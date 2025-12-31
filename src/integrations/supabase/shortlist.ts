// src/integrations/supabase/shortlist.ts
/**
 * Shortlist Integration for Chat
 * 
 * Connects chat "Save" button to shortlisted_colleges table.
 * Saved colleges appear in ShortlistView.tsx
 */

import { supabase } from "@/integrations/supabase/client";
import type { RecommendedProgram } from "./api";
import type { CollegeData } from "@/data/collegesData";

// =============================================================================
// Types
// =============================================================================

export interface ShortlistResult {
  success: boolean;
  alreadyExists?: boolean;
  message: string;
  id?: string;
}

export interface ShortlistedCollegeRow {
  id: string;
  user_id: string;
  college_id: string;
  college_data: CollegeData;
  created_at: string;
}

// =============================================================================
// Conversion Functions
// =============================================================================

/**
 * Convert RAG RecommendedProgram to CollegeData format for shortlist storage
 */
export function convertToCollegeData(program: RecommendedProgram): CollegeData {
  return {
    id: program.external_id,
    name: program.college_name,
    city: program.city,
    state: program.state,
    country: "India",
    established: "N/A",
    approvals: ["UGC"],
    image: generateCollegeImage(program.college_name),
    highlights: program.eligibility 
      ? [program.eligibility] 
      : ["Quality education"],
    courses: [
      {
        name: program.course_name,
        fees: program.approx_fees_per_year || 0,
        duration: program.duration_years ? `${program.duration_years} Years` : "4 Years",
        eligibility: program.eligibility || "As per university norms",
      },
    ],
  };
}

/**
 * Generate a placeholder image for colleges without images
 */
function generateCollegeImage(collegeName: string): string {
  const encoded = encodeURIComponent(collegeName);
  return `https://ui-avatars.com/api/?name=${encoded}&size=400&background=6366f1&color=fff&font-size=0.25&bold=true`;
}

// =============================================================================
// Shortlist Operations
// =============================================================================

/**
 * Save a college/program to user's shortlist
 */
export async function saveToShortlist(program: RecommendedProgram): Promise<ShortlistResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: "Please log in to save colleges to your shortlist",
      };
    }

    // Check if already shortlisted
    const { data: existing } = await supabase
      .from("shortlisted_colleges")
      .select("id")
      .eq("user_id", user.id)
      .eq("college_id", program.external_id)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyExists: true,
        message: `${program.college_name} is already in your shortlist`,
        id: existing.id,
      };
    }

    // Convert to CollegeData format
    const collegeData = convertToCollegeData(program);

    // Insert into shortlisted_colleges
    const { data, error } = await supabase
      .from("shortlisted_colleges")
      .insert({
        user_id: user.id,
        college_id: program.external_id,
        college_data: collegeData as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[shortlist] Save error:", error);
      throw error;
    }

    return {
      success: true,
      message: `${program.college_name} added to your shortlist!`,
      id: data.id,
    };
  } catch (error) {
    console.error("[shortlist] Save error:", error);
    return {
      success: false,
      message: "Failed to save college. Please try again.",
    };
  }
}

/**
 * Remove a college from user's shortlist
 */
export async function removeFromShortlist(collegeId: string): Promise<ShortlistResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: "Please log in to manage your shortlist",
      };
    }

    const { error } = await supabase
      .from("shortlisted_colleges")
      .delete()
      .eq("user_id", user.id)
      .eq("college_id", collegeId);

    if (error) throw error;

    return {
      success: true,
      message: "College removed from your shortlist",
    };
  } catch (error) {
    console.error("[shortlist] Remove error:", error);
    return {
      success: false,
      message: "Failed to remove college. Please try again.",
    };
  }
}

/**
 * Check if a college is already shortlisted
 */
export async function checkIfShortlisted(collegeId: string): Promise<{
  isShortlisted: boolean;
  shortlistId?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { isShortlisted: false };
    }

    const { data } = await supabase
      .from("shortlisted_colleges")
      .select("id")
      .eq("user_id", user.id)
      .eq("college_id", collegeId)
      .maybeSingle();

    return {
      isShortlisted: !!data,
      shortlistId: data?.id,
    };
  } catch (error) {
    console.error("[shortlist] Check error:", error);
    return { isShortlisted: false };
  }
}

/**
 * Get all shortlisted colleges for current user
 */
export async function getShortlistedColleges(): Promise<CollegeData[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("shortlisted_colleges")
      .select("college_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Cast the JSON data to CollegeData
    return (data || []).map(item => item.college_data as unknown as CollegeData);
  } catch (error) {
    console.error("[shortlist] Fetch error:", error);
    return [];
  }
}

/**
 * Get shortlisted colleges as RecommendedProgram format (for chat display)
 */
export async function getShortlistAsPrograms(): Promise<RecommendedProgram[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("shortlisted_colleges")
      .select("college_id, college_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(item => {
      const college = item.college_data as unknown as CollegeData;
      const course = college.courses[0];
      
      return {
        external_id: item.college_id,
        college_name: college.name,
        course_name: course?.name || "Unknown Course",
        city: college.city,
        state: college.state,
        approx_fees_per_year: course?.fees || null,
        eligibility: course?.eligibility || null,
        admission_process: null,
      };
    });
  } catch (error) {
    console.error("[shortlist] Fetch error:", error);
    return [];
  }
}

/**
 * Get shortlist count
 */
export async function getShortlistCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from("shortlisted_colleges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("[shortlist] Count error:", error);
    return 0;
  }
}