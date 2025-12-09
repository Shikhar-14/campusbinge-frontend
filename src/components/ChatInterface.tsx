import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, MapPin, Target } from "lucide-react";
import bhAiLogo from "@/assets/bh-ai-logo.png";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile } from "@/components/profile/UserProfileDialog";
import { CareerCards } from "@/components/CareerCards";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import VoiceInterface from "@/components/chat/VoiceInterface";
import { sendChatMessageToBackend } from "@/integrations/supabase/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  careerData?: any;
};

// New: backend response type for structured /api/chat
type BackendChatResponse = {
  answer: string;
  intent: string;
  recommended_programs: any[];
  meta?: Record<string, any>;
};

type ChatInterfaceProps = {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
};

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
};

export const ChatInterface = ({
  conversationId,
  onConversationCreated,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(conversationId);
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll when new messages come in (if user is near bottom)
  useEffect(() => {
    const viewport = scrollViewportRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;
    if (viewport && shouldAutoScroll) {
      const isNearBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
        100;
      if (isNearBottom || shouldAutoScroll) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading, shouldAutoScroll]);

  // Detect manual scrolling to disable auto-scroll when user scrolls up
  useEffect(() => {
    const viewport = scrollViewportRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {
      const isNearBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
        100;
      setShouldAutoScroll(isNearBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
      setCurrentConversationId(conversationId);
      setHasStartedChatting(true);
    } else {
      setMessages([WELCOME_MESSAGE]);
      setCurrentConversationId(null);
      setHasStartedChatting(false);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      console.log(`Loading conversation: ${id}`);
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
        console.log("No messages found for this conversation");
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
      }));

      console.log(`Loaded ${loadedMessages.length} messages`);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Unexpected error loading conversation:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred loading the conversation",
        variant: "destructive",
      });
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
        console.error("Error saving message:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to save message:", error);
      throw error;
    }
  };

  const createConversation = async (firstMessage: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const title =
      firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data.id;
  };

  const handleVoiceMessage = useCallback(
    async (role: "user" | "assistant", content: string, careerData?: any) => {
      let convId = currentConversationId;

      // Create conversation if needed
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
      };

      // Add message to UI
      setMessages((prev) => [...prev, newMessage]);

      // Save to database
      await saveMessage(newMessage, convId);
    },
    [currentConversationId, onConversationCreated],
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setHasStartedChatting(true);
    setShouldAutoScroll(true);

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage: Message = { role: "user", content: input, timestamp };

    let convId = currentConversationId;

    // Create conversation if needed
    if (!convId) {
      convId = await createConversation(input);
      if (!convId) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return;
      }
      setCurrentConversationId(convId);
      onConversationCreated(convId);
    }

    const userInput = input;
    setInput("");

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to database
    try {
      await saveMessage(userMessage, convId);
      console.log("User message saved successfully");
    } catch (error) {
      console.error("Failed to save user message:", error);
      toast({
        title: "Warning",
        description: "Your message may not be saved. Continuing...",
        variant: "destructive",
      });
    }

    // Call Python backend for AI response (non-streaming)
    try {
      // New: backend may return either a string or a structured object
      const rawResponse =
        (await sendChatMessageToBackend(
          userInput,
        )) as BackendChatResponse | string;

      const answer =
        typeof rawResponse === "string"
          ? rawResponse
          : rawResponse.answer ?? "";

      const assistantTimestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: answer,
        timestamp: assistantTimestamp,
      };

      // Show assistant message in UI
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      try {
        await saveMessage(assistantMessage, convId);
        console.log("Assistant message saved successfully");
      } catch (saveError) {
        console.error("Failed to save assistant message:", saveError);
        toast({
          title: "Warning",
          description:
            "AI response may not be saved to conversation history.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting AI response from backend:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

      {/* Feature Cards - Hidden when chatting starts */}
      {!hasStartedChatting && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <img
                src={bhAiLogo}
                alt="Bh.AI"
                className="w-7 h-7 object-contain"
              />
            </div>
            <h3 className="font-semibold mb-2">Academic Help</h3>
            <p className="text-sm text-muted-foreground">
              Get guidance on courses, professors, study tips, and academic
              resources.
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Campus Life</h3>
            <p className="text-sm text-muted-foreground">
              Discover clubs, events, dining options, and social opportunities
              on campus.
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
                    className="w-full h-full object-contain -translate-y-[10px]"
                  />
                </div>
              )}
              <div
                className={`flex-1 ${
                  message.role === "user"
                    ? "ml-auto max-w-[80%]"
                    : "max-w-[80%]"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="text-sm font-medium text-primary mb-1">
                    Bh.ai
                  </div>
                )}
                {index === 0 && message.role === "assistant" && (
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
                    {message.careerData && message.careerData.careers ? (
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
                {message.timestamp && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img
                  src={bhAiLogo}
                  alt="Bh.AI"
                  className="w-full h-full object-contain animate-pulse -translate-y-[10px]"
                />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="text-sm font-medium text-primary mb-1">
                  Bh.ai
                </div>
                <Card className="bg-muted p-4">
                  <div className="flex gap-1 items-center">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </Card>
              </div>
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
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 h-[50px] w-[50px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
