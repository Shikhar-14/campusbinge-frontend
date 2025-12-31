// src/components/ui/ErrorState.tsx
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: "error" | "network" | "notFound";
  className?: string;
}

export const ErrorState = ({
  title,
  message,
  onRetry,
  type = "error",
  className = ""
}: ErrorStateProps) => {
  const configs = {
    error: {
      icon: AlertCircle,
      defaultTitle: "Something went wrong",
      defaultMessage: "We encountered an error. Please try again.",
      iconColor: "text-destructive"
    },
    network: {
      icon: WifiOff,
      defaultTitle: "Connection Error",
      defaultMessage: "Please check your internet connection and try again.",
      iconColor: "text-orange-500"
    },
    notFound: {
      icon: AlertCircle,
      defaultTitle: "Not Found",
      defaultMessage: "The requested resource could not be found.",
      iconColor: "text-muted-foreground"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
          {message || config.defaultMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Inline error for smaller spaces
export const InlineError = ({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="h-6 px-2 text-destructive hover:text-destructive"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    )}
  </div>
);