import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AIApplicationAssistantProps = {
  missingFields: string[];
  onFieldFilled: (fieldName: string, value: string) => void;
};

export const AIApplicationAssistant = ({ missingFields, onFieldFilled }: AIApplicationAssistantProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Bh.AI, a helpful assistant guiding students through university applications. The student is filling out an application form and needs help with these missing fields: ${missingFields.join(", ")}. 
              
Your goal is to:
1. Ask clarifying questions about missing information
2. Provide guidance on what information is needed
3. Help them understand what to write in essay-type questions
4. Suggest how to improve their answers
5. Be encouraging and supportive

Keep responses concise and actionable. If the user provides information for a field, acknowledge it and move to the next missing field.`
            },
            ...messages,
            { role: "user", content: userMessage }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === "assistant") {
                      lastMessage.content = assistantMessage;
                    } else {
                      newMessages.push({ role: "assistant", content: assistantMessage });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try asking your question again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      // Initial greeting
      setMessages([{
        role: "assistant",
        content: `Hi! I'm Bh.AI, your application assistant. I see you have ${missingFields.length} fields to complete: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? "..." : ""}.\n\nHow can I help you fill these out?`
      }]);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={handleOpen}
      >
        <Sparkles className="w-4 h-4" />
        Get Bh.AI Help
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Bh.AI Application Assistant
              </DialogTitle>
              <DialogDescription>
                Get help filling out your application form
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 px-6 min-h-0">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <Card
                  key={index}
                  className={`p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-8"
                      : "bg-card mr-8"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
              ))}
              {isLoading && (
                <Card className="p-4 bg-card mr-8 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 p-6 pt-4 border-t">
            <Input
              placeholder="Ask Bh.AI for help..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
