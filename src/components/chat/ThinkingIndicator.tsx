import React from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ThinkingIndicatorProps {
  variant?: 'minimal' | 'detailed';
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
  variant = 'minimal' 
}) => {
  if (variant === 'detailed') {
    return (
      <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Thinking</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </span>
            </div>
            {/* Skeleton lines */}
            <div className="space-y-2">
              <div className="h-3 bg-muted/50 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-muted/50 rounded-full w-4/5 animate-pulse [animation-delay:150ms]" />
              <div className="h-3 bg-muted/50 rounded-full w-3/5 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Minimal variant - clean animated dots
  return (
    <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Generating response</span>
        </div>
        <span className="flex gap-1 ml-1">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
        </span>
      </div>
    </Card>
  );
};

// Alternative: Streaming indicator with cursor
export const StreamingIndicator: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Card className="bg-card border-primary/10 p-5 rounded-2xl shadow-sm">
      <div className="text-[15px] leading-7 text-foreground/90">
        {content || (
          <span className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Generating response...
          </span>
        )}
        {/* Blinking cursor */}
        <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />
      </div>
    </Card>
  );
};

export default ThinkingIndicator;