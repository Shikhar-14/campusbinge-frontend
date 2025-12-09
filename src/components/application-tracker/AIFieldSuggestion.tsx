import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type AIFieldSuggestionProps = {
  fieldName: string;
  fieldLabel: string;
  courseName: string;
  universityName: string;
  currentValue?: string;
  onSuggestionAccept: (suggestion: string) => void;
  placeholder?: string;
};

export const AIFieldSuggestion = ({
  fieldName,
  fieldLabel,
  courseName,
  universityName,
  currentValue,
  onSuggestionAccept,
  placeholder
}: AIFieldSuggestionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getSuggestion = async () => {
    setIsLoading(true);
    setSuggestion("");

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
              content: `You are Bh.AI, an expert university application assistant. You help students craft compelling application responses. 

Context:
- Student is applying to: ${universityName}
- Course: ${courseName}
- Field: ${fieldLabel}
- Current response: ${currentValue || "None"}

Provide a thoughtful, personalized suggestion for the "${fieldLabel}" field. Make it:
1. Course-specific and relevant to ${courseName}
2. Authentic and student-appropriate
3. Concise but impactful (${fieldName.includes("why") ? "100-150 words" : "50-100 words"})
4. Actionable - something they can use as inspiration

${placeholder ? `Hint: ${placeholder}` : ""}

Provide ONLY the suggested text, no explanations or meta-commentary.`
            },
            {
              role: "user",
              content: `Suggest content for: ${fieldLabel}`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI suggestion");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let suggestionText = "";

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
                  suggestionText += content;
                  setSuggestion(suggestionText);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onSuggestionAccept(suggestion);
      setIsOpen(false);
      toast({
        title: "Suggestion Applied",
        description: "Review and edit the text as needed.",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => {
            setIsOpen(true);
            if (!suggestion && !isLoading) {
              getSuggestion();
            }
          }}
        >
          <Sparkles className="w-3 h-3" />
          Get AI Suggestion
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Suggestion for {fieldLabel}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Course: {courseName}
          </p>
        </div>

        <ScrollArea className="h-64 p-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Generating suggestion...</span>
            </div>
          ) : suggestion ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {suggestion}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  className="flex-1"
                >
                  Use This Suggestion
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={getSuggestion}
                >
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 This is a suggestion. Feel free to customize it to match your personal style and experiences.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Click to generate a suggestion
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
