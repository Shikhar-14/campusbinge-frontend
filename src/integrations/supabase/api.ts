// src/integrations/supabase/api.ts
/**
 * Backend API Client for Bh.ai
 * 
 * Features:
 * - Standard chat (non-streaming)
 * - Streaming chat (SSE) - NEW
 * - Typed request/response
 * - Request timeout & cancellation
 * - Proper error handling
 */

import { supabase } from "@/integrations/supabase/client";

// =============================================================================
// Types
// =============================================================================

export interface RecommendedProgram {
  external_id: string;
  college_name: string;
  course_name: string;
  city: string;
  state: string;
  approx_fees_per_year: number | null;
  eligibility: string | null;
  admission_process: string | null;
  score?: number;
  degree?: string;
  stream?: string;
  duration_years?: number;
  intake_capacity?: number;
}

export interface ChatResponseMeta {
  model: string;
  version: string;
  conversation_id: string | null;
  has_user: boolean;
  profile_loaded: boolean;
  num_programs_retrieved: number;
  llm_provider?: string;
  latency_ms?: number;
}

export interface BackendChatResponse {
  answer: string;
  intent: "college_search" | "career_guidance" | "generic" | "forum_search" | "application_action";
  recommended_programs: RecommendedProgram[];
  meta?: ChatResponseMeta;
}

export interface ChatRequestPayload {
  user_id: string | null;
  message: string;
  conversation_id: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// =============================================================================
// Streaming Types (NEW)
// =============================================================================

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onIntent?: (intent: string) => void;
  onPrograms?: (programs: RecommendedProgram[]) => void;
  onMeta?: (meta: ChatResponseMeta) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export interface StreamingChatResult {
  fullResponse: string;
  intent: string;
  programs: RecommendedProgram[];
  meta?: ChatResponseMeta;
}

// =============================================================================
// Configuration
// =============================================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 60000; // 60 seconds for streaming

// =============================================================================
// Standard Chat (Non-Streaming)
// =============================================================================

export async function sendChatMessageToBackend(
  message: string,
  conversationId?: string | null,
  options?: {
    timeoutMs?: number;
    signal?: AbortSignal;
  }
): Promise<BackendChatResponse> {
  const url = `${BACKEND_URL}/api/chat`;
  const timeoutMs = options?.timeoutMs ?? 30000;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.warn("[api.ts] supabase.auth.getUser error:", authError);
  }

  const payload: ChatRequestPayload = {
    user_id: user?.id ?? null,
    message,
    conversation_id: conversationId ?? null,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (options?.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const startTime = Date.now();
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startTime;
    console.log(`[api.ts] Chat request completed in ${latencyMs}ms`);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new ApiError(
        `Backend error: ${res.status} ${res.statusText} - ${errorText}`,
        res.status,
        "BACKEND_ERROR"
      );
    }

    const data = await res.json();

    if (typeof data?.answer !== "string") {
      console.warn("[api.ts] Unexpected response shape:", data);
      throw new ApiError("Invalid response from backend", undefined, "INVALID_RESPONSE");
    }

    return {
      answer: data.answer,
      intent: data.intent || "generic",
      recommended_programs: Array.isArray(data.recommended_programs) 
        ? data.recommended_programs 
        : [],
      meta: data.meta ? { ...data.meta, latency_ms: latencyMs } : undefined,
    };

  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timed out. Please try again.", undefined, "TIMEOUT");
      }
      throw new ApiError(error.message, undefined, "NETWORK_ERROR");
    }
    
    throw new ApiError("An unexpected error occurred", undefined, "UNKNOWN");
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// Streaming Chat (SSE) - NEW
// =============================================================================

/**
 * Send chat message with streaming response.
 * 
 * Uses Server-Sent Events (SSE) to receive tokens as they're generated.
 * 
 * @param message - User's message
 * @param callbacks - Callback functions for different event types
 * @param conversationId - Optional conversation ID
 * @param signal - Optional AbortSignal for cancellation
 * 
 * @returns Promise resolving to full response when complete
 * 
 * @example
 * await sendChatMessageStreaming(
 *   "Best colleges in Delhi",
 *   {
 *     onToken: (token) => setResponse(prev => prev + token),
 *     onPrograms: (programs) => setPrograms(programs),
 *     onDone: () => setIsLoading(false),
 *   }
 * );
 */
export async function sendChatMessageStreaming(
  message: string,
  callbacks: StreamCallbacks,
  conversationId?: string | null,
  signal?: AbortSignal
): Promise<StreamingChatResult> {
  const url = `${BACKEND_URL}/api/chat/stream`;

  const { data: { user } } = await supabase.auth.getUser();

  const payload: ChatRequestPayload = {
    user_id: user?.id ?? null,
    message,
    conversation_id: conversationId ?? null,
  };

  let fullResponse = "";
  let intent = "generic";
  let programs: RecommendedProgram[] = [];
  let meta: ChatResponseMeta | undefined;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new ApiError(`Backend error: ${res.status}`, res.status, "BACKEND_ERROR");
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new ApiError("No response body", undefined, "NO_BODY");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Parse SSE events from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      let currentEvent = "";
      let currentData = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          currentData = line.slice(6);
          
          // Process complete event
          if (currentData) {
            try {
              const parsed = JSON.parse(currentData);
              
              // Use event type from SSE header, or fall back to parsed.type
              const eventType = currentEvent || parsed.type || "unknown";
              
              switch (eventType) {
                case "token":
                  if (parsed.content) {
                    fullResponse += parsed.content;
                    callbacks.onToken(parsed.content);
                  }
                  break;
                  
                case "intent":
                  intent = parsed.intent;
                  callbacks.onIntent?.(parsed.intent);
                  break;
                  
                case "programs":
                  // FIX: Extract programs array from the event object
                  // Backend sends {"type": "programs", "programs": [...]}
                  const programsArray = parsed.programs || parsed;
                  programs = Array.isArray(programsArray) ? programsArray : [];
                  console.log(`[api.ts] Received ${programs.length} programs`);
                  callbacks.onPrograms?.(programs);
                  break;
                  
                case "meta":
                  // FIX: Extract meta from event object
                  meta = parsed.meta || parsed;
                  callbacks.onMeta?.(meta);
                  break;
                  
                case "done":
                  callbacks.onDone?.();
                  break;
                  
                case "error":
                  callbacks.onError?.(parsed.error || parsed.message || "Unknown error");
                  break;
                  
                default:
                  console.log(`[api.ts] Unknown SSE event type: ${eventType}`, parsed);
              }
            } catch (e) {
              console.warn("[api.ts] Failed to parse SSE data:", currentData, e);
            }
            
            currentEvent = "";
            currentData = "";
          }
        }
      }
    }

    return { fullResponse, intent, programs, meta };

  } catch (error) {
    if (error instanceof ApiError) {
      callbacks.onError?.(error.message);
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        callbacks.onError?.("Request cancelled");
        throw new ApiError("Request cancelled", undefined, "CANCELLED");
      }
      callbacks.onError?.(error.message);
      throw new ApiError(error.message, undefined, "NETWORK_ERROR");
    }
    
    throw new ApiError("An unexpected error occurred", undefined, "UNKNOWN");
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get backend URL for debugging
 */
export function getBackendUrl(): string {
  return BACKEND_URL;
}

/**
 * Check if streaming is supported
 */
export function isStreamingSupported(): boolean {
  return typeof ReadableStream !== "undefined" && typeof TextDecoder !== "undefined";
}