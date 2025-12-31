// src/components/ChatInterface.tsx
/**
 * Chat Interface Component - With Streaming Support (v6 - Fixed Message Display)
 * 
 * Fixes in v6:
 * - Fixed user message disappearing after sending
 * - Fixed welcome message staying visible after chatting
 * - Prevented conversation ID change from wiping messages
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, MapPin, Target, RefreshCw, StopCircle, WifiOff } from "lucide-react";
import bhAiLogo from "@/assets/bh-ai-logo.png";
import { useToast } from "@/hooks/use-toast";
import { CareerCards } from "@/components/CareerCards";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import VoiceInterface from "@/components/chat/VoiceInterface";
import { 
  sendChatMessageStreaming,
  sendChatMessageToBackend,
  isStreamingSupported,
  type RecommendedProgram,
  ApiError 
} from "@/integrations/supabase/api";
import { StructuredResponse } from "@/components/chat/StructuredResponse";

// =============================================================================
// Types
// =============================================================================

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  careerData?: any;
  intent?: string;
  recommendedPrograms?: RecommendedProgram[];
  meta?: Record<string, any>;
  isStreaming?: boolean;
  isError?: boolean;
};

type ChatInterfaceProps = {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
};

// =============================================================================
// Constants
// =============================================================================

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm Bh.AI, your intelligent college admissions and career guidance assistant. I can help you with:\n\n" +
    "🎓 **College Guidance**: Information about colleges, courses, and admissions\n" +
    "🎯 **Career Planning**: Explore career paths and opportunities\n" +
    "📚 **Academic Advice**: Study tips, exam preparation, and more\n" +
    "💬 **Personalized Support**: Get tailored recommendations based on your profile\n\n" +
    "What would you like to know today?",
  timestamp: new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  isStreaming: false,
};

const USE_STREAMING = isStreamingSupported();

// =============================================================================
// Component
// =============================================================================

export const ChatInterface = ({
  conversationId,
  onConversationCreated,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isNetwork: boolean } | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastFailedMessage, setLastFailedMessage] = useState<string>("");
  
  // Track if we're currently creating a conversation to prevent race conditions
  const isCreatingConversationRef = useRef(false);
  
  // FIX: Track the last conversation ID we loaded to prevent unnecessary resets
  const lastLoadedConversationIdRef = useRef<string | null>(null);
  
  // Refs for streaming state management
  const streamingMessageIdRef = useRef<number>(0);
  const pendingProgramsRef = useRef<RecommendedProgram[]>([]);
  const pendingIntentRef = useRef<string>("generic");
  const pendingMetaRef = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const viewport = scrollViewportRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (viewport && shouldAutoScroll) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const viewport = scrollViewportRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {
      const isNearBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  // FIX: Only load conversation when switching to a DIFFERENT existing conversation
  // Don't reset when we just created a new conversation
  useEffect(() => {
    // If conversationId is null, reset to welcome (new chat)
    if (conversationId === null) {
      // Only reset if we're not in the middle of a chat
      if (!hasStartedChatting) {
        setMessages([WELCOME_MESSAGE]);
        setCurrentConversationId(null);
        lastLoadedConversationIdRef.current = null;
      }
      return;
    }
    
    // If this is a new conversation we just created, don't reload
    // (we already have the messages in state)
    if (conversationId === currentConversationId) {
      return;
    }
    
    // If switching to a different existing conversation, load it
    if (conversationId !== lastLoadedConversationIdRef.current) {
      console.log("[ChatInterface] Loading different conversation:", conversationId);
      loadConversation(conversationId);
      setCurrentConversationId(conversationId);
      setHasStartedChatting(true);
      lastLoadedConversationIdRef.current = conversationId;
    }
  }, [conversationId]); // Removed hasStartedChatting and currentConversationId from deps

  const loadConversation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation history",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        setMessages([WELCOME_MESSAGE]);
        return;
      }

      const loadedMessages: Message[] = data.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        careerData: msg.career_data,
        timestamp: new Date(msg.created_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isStreaming: false,
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const saveMessage = async (message: Message, convId: string) => {
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: convId,
        role: message.role,
        content: message.content,
        career_data: message.careerData || null,
      });
      
      if (error) {
        console.error("Failed to save message:", error);
      }
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  // ==========================================================================
  // Create conversation with better error handling and retry
  // ==========================================================================
  
  const createConversation = async (firstMessage: string, retryCount = 0): Promise<string | null> => {
    if (isCreatingConversationRef.current) {
      console.log("[ChatInterface] Already creating conversation, waiting...");
      await new Promise(resolve => setTimeout(resolve, 500));
      if (currentConversationId) {
        return currentConversationId;
      }
    }
    
    isCreatingConversationRef.current = true;
    
    try {
      console.log("[ChatInterface] Creating conversation...");
      
      let user = null;
      for (let i = 0; i < 3; i++) {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authUser) {
          user = authUser;
          break;
        }
        if (authError) {
          console.error(`[ChatInterface] Auth error (attempt ${i + 1}):`, authError);
        }
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (!user) {
        console.error("[ChatInterface] No authenticated user found after retries");
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        return null;
      }

      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");

      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) {
        console.error("[ChatInterface] Failed to create conversation:", error);
        
        if (retryCount < 1) {
          console.log("[ChatInterface] Retrying conversation creation...");
          isCreatingConversationRef.current = false;
          return createConversation(firstMessage, retryCount + 1);
        }
        
        return null;
      }
      
      console.log("[ChatInterface] Conversation created:", data.id);
      
      // FIX: Update the ref so we don't try to reload this conversation
      lastLoadedConversationIdRef.current = data.id;
      
      return data.id;
      
    } finally {
      isCreatingConversationRef.current = false;
    }
  };

  const handleSaveProgram = useCallback((program: RecommendedProgram) => {
    toast({
      title: "Saved!",
      description: `${program.college_name} added to your tracker`,
    });
  }, [toast]);

  const handleCompareProgram = useCallback((program: RecommendedProgram) => {
    toast({
      title: "Added to compare",
      description: `${program.college_name} added to comparison`,
    });
  }, [toast]);

  const handleVoiceMessage = useCallback(
    async (role: "user" | "assistant", content: string, careerData?: any) => {
      let convId = currentConversationId;

      if (!convId) {
        convId = await createConversation(content);
        if (!convId) return;
        setCurrentConversationId(convId);
        onConversationCreated(convId);
        setHasStartedChatting(true);
      }

      const newMessage: Message = {
        role,
        content,
        careerData,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isStreaming: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      await saveMessage(newMessage, convId);
    },
    [currentConversationId, onConversationCreated]
  );

  // ==========================================================================
  // Finalize Streaming Message
  // ==========================================================================
  
  const finalizeStreamingMessage = useCallback((messageId: number) => {
    console.log(`[ChatInterface] Finalizing message ${messageId}`);
    
    setMessages((prev) => {
      return prev.map((msg, idx) => {
        if (msg.role === "assistant" && msg.isStreaming) {
          console.log(`[ChatInterface] Found streaming message at index ${idx}, finalizing with ${pendingProgramsRef.current.length} programs`);
          return {
            ...msg,
            isStreaming: false,
            intent: pendingIntentRef.current,
            recommendedPrograms: [...pendingProgramsRef.current],
            meta: pendingMetaRef.current,
          };
        }
        return msg;
      });
    });
    
    streamingMessageIdRef.current = 0;
    pendingProgramsRef.current = [];
    pendingIntentRef.current = "generic";
    pendingMetaRef.current = undefined;
  }, []);

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    finalizeStreamingMessage(streamingMessageIdRef.current);
  }, [finalizeStreamingMessage]);

  // ==========================================================================
  // Helper: Check if error is network-related
  // ==========================================================================
  
  const isNetworkError = (error: unknown): boolean => {
    if (error instanceof TypeError) {
      return error.message.includes('fetch') || 
             error.message.includes('network') ||
             error.message.includes('Failed to fetch');
    }
    if (error instanceof ApiError) {
      return error.code === 'NETWORK_ERROR';
    }
    return false;
  };

  // ==========================================================================
  // Send Message (Streaming)
  // ==========================================================================
  
  const handleSendStreaming = async (userInput: string, convId: string) => {
    abortControllerRef.current = new AbortController();
    
    pendingProgramsRef.current = [];
    pendingIntentRef.current = "generic";
    pendingMetaRef.current = undefined;
    
    const messageId = Date.now();
    streamingMessageIdRef.current = messageId;
    
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStreaming: true,
      recommendedPrograms: undefined,
      intent: undefined,
    };
    
    setMessages((prev) => [...prev, assistantMessage]);
    
    let fullResponseText = "";
    
    try {
      console.log("[ChatInterface] Starting streaming request...");
      
      await sendChatMessageStreaming(
        userInput,
        {
          onToken: (token) => {
            fullResponseText += token;
            
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && updated[lastIdx].isStreaming) {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: updated[lastIdx].content + token,
                };
              }
              return updated;
            });
          },
          
          onIntent: (intent) => {
            console.log(`[ChatInterface] Received intent: ${intent}`);
            pendingIntentRef.current = intent;
          },
          
          onPrograms: (programs) => {
            console.log(`[ChatInterface] Received ${programs.length} programs`);
            pendingProgramsRef.current = programs;
          },
          
          onMeta: (meta) => {
            console.log(`[ChatInterface] Received meta`);
            pendingMetaRef.current = meta;
          },
          
          onDone: () => {
            console.log(`[ChatInterface] Stream complete`);
            finalizeStreamingMessage(messageId);
            setError(null);
            setLastFailedMessage("");
          },
          
          onError: (errorMsg) => {
            console.error(`[ChatInterface] Stream error: ${errorMsg}`);
            setLastFailedMessage(userInput);
            setError({ message: errorMsg, isNetwork: errorMsg.toLowerCase().includes('network') });
            finalizeStreamingMessage(messageId);
            toast({
              title: "Error",
              description: errorMsg,
              variant: "destructive",
            });
          },
        },
        convId,
        abortControllerRef.current.signal
      );
      
      if (fullResponseText) {
        await saveMessage({
          role: "assistant",
          content: fullResponseText,
          recommendedPrograms: pendingProgramsRef.current,
          intent: pendingIntentRef.current,
          isStreaming: false,
        }, convId);
      }
      
    } catch (error) {
      console.error("[ChatInterface] Streaming error:", error);
      finalizeStreamingMessage(messageId);
      
      if (error instanceof ApiError && error.code !== "CANCELLED") {
        const isNetwork = isNetworkError(error);
        setLastFailedMessage(userInput);
        setError({ 
          message: isNetwork 
            ? "Unable to connect. Please check your internet connection." 
            : error.message,
          isNetwork 
        });
      } else if (!(error instanceof ApiError)) {
        const isNetwork = isNetworkError(error);
        setLastFailedMessage(userInput);
        setError({ 
          message: isNetwork 
            ? "Unable to connect. Please check your internet connection." 
            : "Something went wrong. Please try again.",
          isNetwork 
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendNonStreaming = async (userInput: string, convId: string) => {
    abortControllerRef.current = new AbortController();
    
    try {
      console.log("[ChatInterface] Starting non-streaming request...");
      
      const response = await sendChatMessageToBackend(
        userInput,
        convId,
        { signal: abortControllerRef.current.signal }
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        intent: response.intent,
        recommendedPrograms: response.recommended_programs,
        meta: response.meta,
        isStreaming: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantMessage, convId);
      
      setError(null);
      setLastFailedMessage("");

    } catch (error) {
      console.error("[ChatInterface] Non-streaming error:", error);
      
      const isNetwork = isNetworkError(error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : isNetwork 
          ? "Unable to connect. Please check your internet connection."
          : "Failed to get response. Please try again.";
      
      setLastFailedMessage(userInput);
      setError({ message: errorMessage, isNetwork });
      toast({
        title: isNetwork ? "Connection Error" : "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // ==========================================================================
  // handleSend - FIX: Properly manages messages state
  // ==========================================================================
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    
    // FIX: Set hasStartedChatting FIRST to hide welcome cards
    setHasStartedChatting(true);
    setShouldAutoScroll(true);
    setError(null);
    setInput(""); // Clear input immediately for better UX

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage: Message = { role: "user", content: userInput, timestamp, isStreaming: false };

    // FIX: If this is the first message, replace WELCOME_MESSAGE with user message
    // Otherwise, append to existing messages
    if (messages.length === 1 && messages[0] === WELCOME_MESSAGE) {
      setMessages([userMessage]);
    } else {
      setMessages((prev) => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    // Get or create conversation
    let convId = currentConversationId;

    if (!convId) {
      console.log("[ChatInterface] No conversation ID, creating new conversation...");
      convId = await createConversation(userInput);
      
      if (!convId) {
        console.error("[ChatInterface] Failed to create conversation");
        setIsLoading(false);
        setError({ 
          message: "Failed to start conversation. Please try again.", 
          isNetwork: false 
        });
        setLastFailedMessage(userInput);
        setInput(userInput); // Put the message back in input
        // Reset to welcome state on failure
        setMessages([WELCOME_MESSAGE]);
        setHasStartedChatting(false);
        return;
      }
      
      setCurrentConversationId(convId);
      onConversationCreated(convId);
    }

    // Save user message
    await saveMessage(userMessage, convId);

    // Send to backend
    if (USE_STREAMING) {
      await handleSendStreaming(userInput, convId);
    } else {
      await handleSendNonStreaming(userInput, convId);
    }
  };

  // ==========================================================================
  // Retry Handler
  // ==========================================================================
  
  const handleRetry = useCallback(async () => {
    if (!lastFailedMessage || isLoading) return;
    
    console.log("[ChatInterface] Retrying last message:", lastFailedMessage);
    
    setError(null);
    
    // Remove the last assistant message if it exists (could be error or partial response)
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });
    
    setIsLoading(true);
    setShouldAutoScroll(true);
    
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation(lastFailedMessage);
      if (!convId) {
        setError({ message: "Failed to create conversation", isNetwork: false });
        setIsLoading(false);
        return;
      }
      setCurrentConversationId(convId);
      onConversationCreated(convId);
    }
    
    if (USE_STREAMING) {
      await handleSendStreaming(lastFailedMessage, convId);
    } else {
      await handleSendNonStreaming(lastFailedMessage, convId);
    }
  }, [lastFailedMessage, isLoading, currentConversationId, onConversationCreated]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <div className="flex items-end justify-center gap-2 mb-2">
          <img
            src={bhAiLogo}
            alt="Bh.AI"
            className="w-14 h-14 object-contain -translate-y-[13px]"
          />
          <h1 className="text-4xl font-bold leading-none">Bh.ai</h1>
        </div>
        <p className="text-muted-foreground">
          Your personal guide to college success
        </p>
      </div>

      {/* Feature Cards - FIX: Only show when hasStartedChatting is false */}
      {!hasStartedChatting && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <img src={bhAiLogo} alt="Bh.AI" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="font-semibold mb-2">Academic Help</h3>
            <p className="text-sm text-muted-foreground">
              Get guidance on courses, professors, study tips, and academic resources.
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Campus Life</h3>
            <p className="text-sm text-muted-foreground">
              Discover clubs, events, dining options, and social opportunities.
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Personalized Advice</h3>
            <p className="text-sm text-muted-foreground">
              Get tailored recommendations based on your interests and goals.
            </p>
          </Card>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollViewportRef}>
        <div className="space-y-6 pb-4">
          {messages.map((message, index) => (
            <div key={index} className="flex gap-3">
              {message.role === "assistant" && (
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <img
                    src={bhAiLogo}
                    alt="Bh.AI"
                    className={`w-full h-full object-contain -translate-y-[10px] ${
                      message.isStreaming === true ? "animate-pulse" : ""
                    }`}
                  />
                </div>
              )}
              <div
                className={`flex-1 ${
                  message.role === "user" ? "ml-auto max-w-[80%]" : "max-w-[90%]"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="text-sm font-medium text-primary mb-1">
                    Bh.ai
                    {message.isStreaming === true && (
                      <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                        typing...
                      </span>
                    )}
                  </div>
                )}
                
                {/* FIX: Only show "Welcome!" on the actual welcome message, not all first messages */}
                {index === 0 && message.role === "assistant" && message.content === WELCOME_MESSAGE.content && (
                  <div className="flex items-center gap-1 text-sm font-medium mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Welcome!</span>
                  </div>
                )}

                {message.role === "user" ? (
                  <Card className="bg-primary text-primary-foreground p-4 rounded-2xl">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </Card>
                ) : (
                  <>
                    {message.isStreaming === true ? (
                      <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm">
                        <MarkdownMessage content={message.content || "Thinking..."} />
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
                      </Card>
                    ) : message.intent === "college_search" && 
                         message.recommendedPrograms && 
                         message.recommendedPrograms.length > 0 ? (
                      <StructuredResponse
                        answer={message.content}
                        intent={message.intent}
                        programs={message.recommendedPrograms}
                        meta={message.meta}
                        onSaveProgram={handleSaveProgram}
                        onCompareProgram={handleCompareProgram}
                      />
                    ) : message.careerData && message.careerData.careers ? (
                      <>
                        <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm mb-4">
                          <MarkdownMessage content={message.content} />
                        </Card>
                        <CareerCards careers={message.careerData.careers} />
                      </>
                    ) : (
                      <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <MarkdownMessage content={message.content} />
                      </Card>
                    )}
                  </>
                )}

                {message.timestamp && message.isStreaming !== true && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Error State with Retry Button */}
          {error && !isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 flex-shrink-0" />
              <Card className={`flex-1 max-w-[90%] p-4 ${
                error.isNetwork 
                  ? "bg-orange-500/10 border-orange-500/20" 
                  : "bg-destructive/10 border-destructive/20"
              }`}>
                <div className="flex items-start gap-3">
                  {error.isNetwork ? (
                    <WifiOff className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-1 ${
                      error.isNetwork ? "text-orange-600" : "text-destructive"
                    }`}>
                      {error.isNetwork ? "Connection Error" : "Something went wrong"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {error.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about college life, academics, clubs, dining..."
            disabled={isLoading}
            className="min-h-[50px] max-h-[120px] resize-none"
          />
          <VoiceInterface onSaveMessage={handleVoiceMessage} />
          
          {isLoading ? (
            <Button
              onClick={handleStopStreaming}
              size="icon"
              variant="destructive"
              className="h-[50px] w-[50px]"
              title="Stop generating"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90 h-[50px] w-[50px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;