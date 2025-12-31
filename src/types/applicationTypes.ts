// src/types/applicationTypes.ts
/**
 * Type definitions for Application Tracker System
 */

// =============================================================================
// Status & Enum Types
// =============================================================================

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PAYMENT_CONFIRMED"
  | "UNDER_REVIEW"
  | "AWAITING_DOCS"
  | "SHORTLISTED"
  | "COUNSELING_ROUND_1"
  | "COUNSELING_ROUND_2"
  | "SEAT_ALLOTMENT_PENDING"
  | "OFFER"
  | "ACCEPTED"
  | "REJECTED"
  | "DECLINED"
  | "VISA"
  | "ENROLLED";

export type ApplicationDecision =
  | "ADMITTED"
  | "REJECTED"
  | "WAITLISTED"
  | null;

export type Portal =
  | "COMMON_APP"
  | "UCAS"
  | "OUAC"
  | "CUET"
  | "JAC_DELHI"
  | "JOSAA"
  | "DIRECT"
  | "OTHER";

export type Country = "IN" | "US" | "UK" | "CA" | "AU" | "OTHER";

export type Level = "UG" | "PG" | "PhD" | "Diploma";

export type RequirementType =
  | "TRANSCRIPT"
  | "SOP"
  | "LOR"
  | "TEST_SCORE"
  | "ESSAY"
  | "ID_PROOF"
  | "PHOTO"
  | "CERTIFICATE"
  | "OTHER";

export type RequirementStatus = "PENDING" | "IN_PROGRESS" | "UPLOADED";

export type TaskBucket = "ESSAY" | "TEST" | "REC" | "FINANCE" | "ADMIN";

export type TaskStatus = "TODO" | "DOING" | "DONE";

export type EventType =
  | "STATUS_CHANGE"
  | "DOCUMENT_UPLOAD"
  | "NOTE"
  | "REMINDER"
  | "DEADLINE"
  | "PAYMENT";

export type DocumentKind = "PDF" | "IMAGE" | "LINK";

// =============================================================================
// Main Entity Types
// =============================================================================

/**
 * Application entity - tracks a single college application
 */
export interface Application {
  id: string;
  studentId: string;
  university: string;
  course: string;
  country: Country | string;
  portal: Portal | string;
  level: Level | string;
  term: string | null;
  deadline: string | null;
  appId: string | null;
  feeAmount: number;
  feePaid: boolean;
  currentStatus: ApplicationStatus | string;
  decision: ApplicationDecision | string | null;
  decisionDate: string | null;
  scholarshipNote: string | null;
  image: string | null;
  notes?: string | null;
  shortlistId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Requirement entity - document/action required for an application
 */
export interface Requirement {
  id: string;
  applicationId: string;
  type: RequirementType | string;
  label: string;
  isRequired: boolean;
  status: RequirementStatus | string;
  dueOn: string | null;
  notes: string | null;
}

/**
 * Task entity - actionable item for an application
 */
export interface Task {
  id: string;
  applicationId: string;
  bucket: TaskBucket | string;
  title: string;
  status: TaskStatus | string;
  dueOn: string | null;
  notes?: string | null;
}

/**
 * Event entity - activity log entry
 */
export interface Event {
  id: string;
  applicationId: string;
  type: EventType | string;
  timestamp: string;
  detail: string;
  metadata?: Record<string, any>;
}

/**
 * Document entity - uploaded file
 */
export interface Document {
  id: string;
  applicationId: string;
  name: string;
  kind: DocumentKind | string;
  url: string;
  uploadedAt: string;
}

// =============================================================================
// Input Types (for creating/updating)
// =============================================================================

/**
 * Input for creating a new application
 */
export interface CreateApplicationInput {
  university: string;
  course: string;
  country?: Country | string;
  portal?: Portal | string;
  level?: Level | string;
  term?: string;
  deadline?: string;
  feeAmount?: number;
  image?: string;
  shortlistId?: string;
  notes?: string;
}

/**
 * Input for updating an application
 */
export interface UpdateApplicationInput {
  university?: string;
  course?: string;
  country?: Country | string;
  portal?: Portal | string;
  level?: Level | string;
  term?: string;
  deadline?: string;
  appId?: string;
  feeAmount?: number;
  feePaid?: boolean;
  currentStatus?: ApplicationStatus | string;
  decision?: ApplicationDecision | string;
  decisionDate?: string;
  scholarshipNote?: string;
  image?: string;
  notes?: string;
}

/**
 * Input for creating a requirement
 */
export interface CreateRequirementInput {
  applicationId: string;
  type: RequirementType | string;
  label: string;
  isRequired?: boolean;
  dueOn?: string;
  notes?: string;
}

/**
 * Input for creating a task
 */
export interface CreateTaskInput {
  applicationId: string;
  bucket: TaskBucket | string;
  title: string;
  dueOn?: string;
  notes?: string;
}

// =============================================================================
// College Data Type (for shortlist)
// =============================================================================

/**
 * Course within a college
 */
export interface CollegeCourse {
  name: string;
  fees: number;
  duration: string;
  eligibility: string;
  admissionProcess?: string;
}

/**
 * College data stored in shortlisted_colleges.college_data
 * Matches the CollegeData type from @/data/collegesData
 */
export interface CollegeData {
  id: string;
  name: string;
  campusName?: string;
  city: string;
  state: string;
  country?: string;
  established: string;          // Required for comparison
  type?: string;
  affiliation?: string;
  approvals: string[];          // Required array for comparison
  nirfRanking?: string;
  naacGrade?: string;
  image: string;                // Required for comparison
  highlights: string[];         // Required array for comparison
  courses: CollegeCourse[];
}

/**
 * Shortlisted college entry
 */
export interface ShortlistedCollege {
  id: string;
  userId: string;
  collegeId: string;
  collegeData: CollegeData;
  createdAt: string;
}

// =============================================================================
// Status Flow Helpers
// =============================================================================

/**
 * Status progression for Indian universities
 */
export const INDIAN_STATUS_FLOW: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "PAYMENT_CONFIRMED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "COUNSELING_ROUND_1",
  "COUNSELING_ROUND_2",
  "SEAT_ALLOTMENT_PENDING",
  "OFFER",
  "ACCEPTED",
  "ENROLLED",
];

/**
 * Status progression for international universities
 */
export const INTERNATIONAL_STATUS_FLOW: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "AWAITING_DOCS",
  "OFFER",
  "ACCEPTED",
  "VISA",
  "ENROLLED",
];

/**
 * Get the appropriate status flow based on country
 */
export function getStatusFlow(country: string): ApplicationStatus[] {
  return country === "IN" ? INDIAN_STATUS_FLOW : INTERNATIONAL_STATUS_FLOW;
}

/**
 * Get the progress percentage for a given status
 */
export function getStatusProgress(status: string, country: string = "IN"): number {
  const flow = getStatusFlow(country);
  const index = flow.indexOf(status as ApplicationStatus);
  if (index === -1) return 0;
  return Math.round(((index + 1) / flow.length) * 100);
}

// =============================================================================
// Display Helpers
// =============================================================================

export const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-500" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-500" },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", color: "bg-blue-600" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-yellow-500" },
  AWAITING_DOCS: { label: "Awaiting Documents", color: "bg-orange-500" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-500" },
  COUNSELING_ROUND_1: { label: "Counseling Round 1", color: "bg-purple-600" },
  COUNSELING_ROUND_2: { label: "Counseling Round 2", color: "bg-purple-700" },
  SEAT_ALLOTMENT_PENDING: { label: "Seat Allotment Pending", color: "bg-indigo-500" },
  OFFER: { label: "Offer Received", color: "bg-green-500" },
  ACCEPTED: { label: "Accepted", color: "bg-green-600" },
  REJECTED: { label: "Rejected", color: "bg-red-500" },
  DECLINED: { label: "Declined", color: "bg-gray-600" },
  VISA: { label: "Visa Process", color: "bg-cyan-500" },
  ENROLLED: { label: "Enrolled", color: "bg-emerald-500" },
};

export const PORTAL_DISPLAY: Record<string, string> = {
  COMMON_APP: "Common App",
  UCAS: "UCAS",
  OUAC: "OUAC",
  CUET: "CUET",
  JAC_DELHI: "JAC Delhi",
  JOSAA: "JoSAA",
  DIRECT: "Direct",
  OTHER: "Other",
};

export const TASK_BUCKET_DISPLAY: Record<string, { label: string; icon: string }> = {
  ESSAY: { label: "Essays", icon: "📝" },
  TEST: { label: "Tests", icon: "📊" },
  REC: { label: "Recommendations", icon: "📨" },
  FINANCE: { label: "Finance", icon: "💰" },
  ADMIN: { label: "Administrative", icon: "📋" },
};