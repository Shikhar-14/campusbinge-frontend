import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KarmaBadgeProps {
  karma: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const KarmaBadge = ({ karma, size = "sm", showIcon = true, className }: KarmaBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const getKarmaColor = () => {
    if (karma >= 1000) return "text-orange-600 dark:text-orange-400";
    if (karma >= 500) return "text-purple-600 dark:text-purple-400";
    if (karma >= 100) return "text-blue-600 dark:text-blue-400";
    if (karma > 0) return "text-green-600 dark:text-green-400";
    if (karma < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const formatKarma = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className={cn("flex items-center gap-1 font-semibold", sizeClasses[size], getKarmaColor(), className)}>
      {showIcon && <TrendingUp className={iconSizes[size]} />}
      <span>{formatKarma(karma)}</span>
    </div>
  );
};
