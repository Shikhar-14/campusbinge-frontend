import type { Application, ApplicationStatus, Portal, Country } from "@/types/applicationTypes";

export const getStatusLabel = (status: ApplicationStatus): string => {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    PAYMENT_CONFIRMED: "Payment Confirmed",
    UNDER_REVIEW: "Under Review",
    AWAITING_DOCS: "Awaiting Documents",
    SHORTLISTED: "Shortlisted",
    OFFER: "Offer Received",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    VISA: "Visa Process",
    ENROLLED: "Enrolled",
    COUNSELING_ROUND_1: "Counseling Round 1",
    COUNSELING_ROUND_2: "Counseling Round 2",
    SEAT_ALLOTMENT_PENDING: "Seat Allotment Pending",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: ApplicationStatus): string => {
  if (status === "DRAFT") return "bg-muted text-muted-foreground";
  if (status === "SUBMITTED" || status === "PAYMENT_CONFIRMED") return "bg-secondary text-secondary-foreground";
  if (status === "UNDER_REVIEW" || status === "AWAITING_DOCS") return "bg-primary/20 text-primary";
  if (status === "SHORTLISTED" || status === "COUNSELING_ROUND_1" || status === "COUNSELING_ROUND_2") return "bg-primary/40 text-primary";
  if (status === "OFFER" || status === "ACCEPTED") return "bg-primary text-primary-foreground";
  if (status === "DECLINED") return "bg-destructive/20 text-destructive";
  if (status === "VISA" || status === "ENROLLED") return "bg-primary text-primary-foreground";
  return "bg-muted text-muted-foreground";
};

export const getPortalLabel = (portal: Portal): string => {
  const labels: Record<Portal, string> = {
    COMMON_APP: "Common App",
    UCAS: "UCAS",
    OUAC: "OUAC",
    CUET: "CUET",
    DIRECT: "Direct Portal",
  };
  return labels[portal];
};

export const getCountryFlag = (country: Country): string => {
  const flags: Record<Country, string> = {
    US: "🇺🇸",
    UK: "🇬🇧",
    CA: "🇨🇦",
    IN: "🇮🇳",
  };
  return flags[country];
};

export const getProgressPercentage = (requirements: any[]): number => {
  if (requirements.length === 0) return 0;
  const completed = requirements.filter(r => r.status === "UPLOADED").length;
  return Math.round((completed / requirements.length) * 100);
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDeadline = (deadline: string): string => {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return "Passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getDeadlineColor = (deadline: string): string => {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return "text-muted-foreground";
  if (days <= 7) return "text-destructive";
  if (days <= 21) return "text-primary";
  return "text-muted-foreground";
};

export const filterApplications = (
  applications: Application[],
  filters: {
    search?: string;
    country?: Country | "all";
    status?: ApplicationStatus | "all";
  }
): Application[] => {
  return applications.filter(app => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!app.university.toLowerCase().includes(searchLower) && 
          !app.course.toLowerCase().includes(searchLower) &&
          !app.appId?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.country && filters.country !== "all" && app.country !== filters.country) {
      return false;
    }
    if (filters.status && filters.status !== "all" && app.currentStatus !== filters.status) {
      return false;
    }
    return true;
  });
};
