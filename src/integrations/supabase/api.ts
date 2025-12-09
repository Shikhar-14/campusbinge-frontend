// src/integrations/supabase/api.ts

/**
 * Helper to call our Python FastAPI backend /api/chat endpoint.
 *
 * Backend returns a structured response:
 * {
 *   answer: string;
 *   intent: string;
 *   recommended_programs: any[];
 *   meta: Record<string, any>;
 * }
 */

export type BackendChatResponse = {
  answer: string;
  intent: string;
  recommended_programs: any[];
  meta?: Record<string, any>;
};

// Pick backend URL from env (VITE_BACKEND_URL) or default to localhost:8000
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function sendChatMessageToBackend(
  message: string,
): Promise<BackendChatResponse> {
  const url = `${BACKEND_URL}/api/chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // We’re only sending { message } for now; user_id is picked in backend if needed
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // Basic shape validation – in case backend changes, this will help debug
  if (typeof data.answer !== "string") {
    console.warn("Unexpected backend response shape:", data);
  }

  return data as BackendChatResponse;
}
