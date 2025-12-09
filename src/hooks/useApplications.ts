import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Application, Requirement, Task, Event, Document } from "@/types/applicationTypes";

// Convert database row to Application type
const mapDbToApplication = (row: any): Application => ({
  id: row.id,
  studentId: row.user_id,
  university: row.university,
  country: row.country,
  portal: row.portal,
  course: row.course,
  level: row.level,
  term: row.term,
  deadline: row.deadline,
  appId: row.app_id,
  feeAmount: parseFloat(row.fee_amount),
  feePaid: row.fee_paid,
  currentStatus: row.current_status,
  decision: row.decision,
  decisionDate: row.decision_date,
  scholarshipNote: row.scholarship_note,
  image: row.image_url,
});

// Convert database row to Requirement type
const mapDbToRequirement = (row: any): Requirement => ({
  id: row.id,
  applicationId: row.application_id,
  type: row.type,
  label: row.label,
  isRequired: row.is_required,
  status: row.status,
  dueOn: row.due_on,
  notes: row.notes,
});

// Convert database row to Task type
const mapDbToTask = (row: any): Task => ({
  id: row.id,
  applicationId: row.application_id,
  bucket: row.bucket,
  title: row.title,
  status: row.status,
  dueOn: row.due_on,
});

// Convert database row to Event type
const mapDbToEvent = (row: any): Event => ({
  id: row.id,
  applicationId: row.application_id,
  type: row.type,
  timestamp: row.timestamp,
  detail: row.detail,
});

// Convert database row to Document type
const mapDbToDocument = (row: any): Document => ({
  id: row.id,
  applicationId: row.application_id,
  name: row.name,
  kind: row.kind,
  url: row.url,
  uploadedAt: row.uploaded_at,
});

export const useApplications = () => {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("deadline", { ascending: true });

      if (error) throw error;
      return data.map(mapDbToApplication);
    },
  });
};

export const useRequirements = () => {
  return useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("requirements")
        .select(`
          *,
          application:applications!inner(user_id)
        `)
        .eq("application.user_id", user.id);

      if (error) throw error;
      return data.map(mapDbToRequirement);
    },
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          application:applications!inner(user_id)
        `)
        .eq("application.user_id", user.id)
        .order("due_on", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data.map(mapDbToTask);
    },
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          application:applications!inner(user_id)
        `)
        .eq("application.user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data.map(mapDbToEvent);
    },
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          application:applications!inner(user_id)
        `)
        .eq("application.user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data.map(mapDbToDocument);
    },
  });
};
