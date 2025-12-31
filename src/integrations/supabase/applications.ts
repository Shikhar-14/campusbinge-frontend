// src/integrations/supabase/applications.ts
/**
 * Application Tracker API Functions
 * 
 * Handles CRUD operations for applications and related entities.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CollegeData } from "@/data/collegesData";

// =============================================================================
// Types
// =============================================================================

export interface Application {
  id: string;
  studentId: string;
  university: string;
  course: string;
  country: string;
  portal: string;
  level: string;
  term: string | null;
  deadline: string | null;
  appId: string | null;
  feeAmount: number;
  feePaid: boolean;
  currentStatus: string;
  decision: string | null;
  decisionDate: string | null;
  scholarshipNote: string | null;
  image: string | null;
  notes?: string | null;
  shortlistId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// Application Operations
// =============================================================================

/**
 * Create a new application from a shortlisted college
 */
export async function createApplicationFromShortlist(
  collegeData: CollegeData,
  courseName: string,
  shortlistId?: string
): Promise<ApiResult<Application>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please log in to create an application" };
    }

    // Find the selected course
    const course = collegeData.courses.find(c => c.name === courseName) || collegeData.courses[0];

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      university: collegeData.name,
      course: course?.name || courseName,
      country: collegeData.country || "IN",
      portal: "DIRECT",
      level: detectLevel(course?.name || courseName),
      fee_amount: course?.fees || 0,
      image_url: collegeData.image,
      current_status: "DRAFT",
    };

    // Only add shortlist_id if provided
    if (shortlistId) {
      insertData.shortlist_id = shortlistId;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[applications] Create error:", error);
      throw error;
    }

    // Create default requirements
    await createDefaultRequirements(data.id, course?.name || courseName);

    // Log the event
    await logEvent(data.id, "STATUS_CHANGE", "Application created");

    return {
      success: true,
      data: mapDbToApplication(data),
    };
  } catch (error) {
    console.error("[applications] Create error:", error);
    return { success: false, error: "Failed to create application" };
  }
}

/**
 * Check if an application already exists for a college
 */
export async function checkApplicationExists(
  university: string,
  course: string
): Promise<{ exists: boolean; applicationId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { exists: false };

    const { data } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("university", university)
      .eq("course", course)
      .maybeSingle();

    return {
      exists: !!data,
      applicationId: data?.id,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Update an existing application
 */
export async function updateApplication(
  id: string,
  updates: Partial<{
    currentStatus: string;
    decision: string;
    feePaid: boolean;
    notes: string;
  }>
): Promise<ApiResult<Application>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please log in" };
    }

    const updateData: Record<string, unknown> = {};
    
    if (updates.currentStatus !== undefined) updateData.current_status = updates.currentStatus;
    if (updates.decision !== undefined) updateData.decision = updates.decision;
    if (updates.feePaid !== undefined) updateData.fee_paid = updates.feePaid;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: mapDbToApplication(data),
    };
  } catch (error) {
    console.error("[applications] Update error:", error);
    return { success: false, error: "Failed to update application" };
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<ApiResult<void>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Please log in" };
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[applications] Delete error:", error);
    return { success: false, error: "Failed to delete application" };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create default requirements based on course type
 */
async function createDefaultRequirements(applicationId: string, courseName: string): Promise<void> {
  const isUG = courseName.toLowerCase().includes("b.tech") || 
               courseName.toLowerCase().includes("ba") ||
               courseName.toLowerCase().includes("bsc") ||
               courseName.toLowerCase().includes("bcom");

  const defaultRequirements = [
    { type: "TRANSCRIPT", label: "10th Marksheet", is_required: true },
    { type: "TRANSCRIPT", label: "12th Marksheet", is_required: true },
    { type: "ID_PROOF", label: "Aadhaar Card", is_required: true },
    { type: "PHOTO", label: "Passport Photo", is_required: true },
  ];

  if (isUG) {
    defaultRequirements.push(
      { type: "TEST_SCORE", label: "Entrance Exam Score", is_required: false },
      { type: "CERTIFICATE", label: "Category Certificate (if applicable)", is_required: false }
    );
  }

  for (const req of defaultRequirements) {
    await supabase.from("requirements").insert({
      application_id: applicationId,
      type: req.type,
      label: req.label,
      is_required: req.is_required,
      status: "PENDING",
    });
  }
}

/**
 * Log an event for an application
 */
async function logEvent(
  applicationId: string,
  type: string,
  detail: string
): Promise<void> {
  try {
    await supabase.from("events").insert({
      application_id: applicationId,
      type,
      detail,
    });
  } catch (error) {
    console.error("[events] Log error:", error);
  }
}

/**
 * Map database row to Application type
 */
function mapDbToApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    studentId: row.user_id as string,
    university: row.university as string,
    country: row.country as string,
    portal: row.portal as string,
    course: row.course as string,
    level: row.level as string,
    term: row.term as string | null,
    deadline: row.deadline as string | null,
    appId: row.app_id as string | null,
    feeAmount: parseFloat(String(row.fee_amount)) || 0,
    feePaid: row.fee_paid as boolean,
    currentStatus: row.current_status as string,
    decision: row.decision as string | null,
    decisionDate: row.decision_date as string | null,
    scholarshipNote: row.scholarship_note as string | null,
    image: row.image_url as string | null,
    notes: row.notes as string | null,
    shortlistId: row.shortlist_id as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Detect education level from course name
 */
function detectLevel(courseName: string): string {
  const name = courseName.toLowerCase();
  
  if (name.includes("ph.d") || name.includes("phd") || name.includes("doctorate")) {
    return "PhD";
  }
  if (name.includes("m.tech") || name.includes("mba") || name.includes("m.sc") || 
      name.includes("ma ") || name.includes("m.a.") || name.includes("mca") ||
      name.includes("m.com") || name.includes("master")) {
    return "PG";
  }
  if (name.includes("diploma")) {
    return "Diploma";
  }
  return "UG";
}