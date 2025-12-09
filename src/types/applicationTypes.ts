export type Country = "US" | "UK" | "CA" | "IN";
export type Portal = "COMMON_APP" | "UCAS" | "OUAC" | "CUET" | "DIRECT";
export type Level = "UG" | "PG";
export type ApplicationStatus = 
  | "DRAFT" 
  | "SUBMITTED" 
  | "PAYMENT_CONFIRMED"
  | "UNDER_REVIEW" 
  | "AWAITING_DOCS" 
  | "SHORTLISTED" 
  | "OFFER" 
  | "ACCEPTED"
  | "DECLINED"
  | "VISA"
  | "ENROLLED"
  | "COUNSELING_ROUND_1"
  | "COUNSELING_ROUND_2"
  | "SEAT_ALLOTMENT_PENDING";

export type RequirementType = "SOP" | "LOR" | "TEST_SCORE" | "ESSAY" | "TRANSCRIPT" | "OTHER";
export type RequirementStatus = "NOT_STARTED" | "IN_PROGRESS" | "UPLOADED";
export type TaskStatus = "TODO" | "DOING" | "DONE";
export type TaskBucket = "ESSAY" | "TEST" | "REC" | "FINANCE" | "ADMIN";
export type EventType = "CREATED" | "SUBMITTED" | "PAID" | "DOC_UPLOADED" | "INTERVIEW" | "DECISION" | "ENROLLED";
export type DocumentKind = "PDF" | "LINK" | "IMG";

export interface Student {
  id: string;
  name: string;
  email: string;
  timezone: string;
}

export interface Application {
  id: string;
  studentId: string;
  university: string;
  country: Country;
  portal: Portal;
  course: string;
  level: Level;
  term: string;
  deadline: string;
  appId?: string;
  feeAmount: number;
  feePaid: boolean;
  currentStatus: ApplicationStatus;
  decision?: string;
  decisionDate?: string;
  scholarshipNote?: string;
  image?: string;
}

export interface Requirement {
  id: string;
  applicationId: string;
  type: RequirementType;
  label: string;
  isRequired: boolean;
  status: RequirementStatus;
  dueOn?: string;
  notes?: string;
}

export interface Task {
  id: string;
  applicationId: string;
  bucket: TaskBucket;
  title: string;
  status: TaskStatus;
  dueOn?: string;
}

export interface Event {
  id: string;
  applicationId: string;
  type: EventType;
  timestamp: string;
  detail: string;
}

export interface Document {
  id: string;
  applicationId: string;
  name: string;
  kind: DocumentKind;
  url: string;
  uploadedAt: string;
}

export interface DashboardStats {
  activeApplications: number;
  upcomingDeadlines: number;
  missingDocuments: number;
  offers: number;
}
