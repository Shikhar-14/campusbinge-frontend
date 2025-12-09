import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoting } from "@/hooks/useVoting";

interface VoteButtonsProps {
  postId: string;
  orientation?: "vertical" | "horizontal";
}

export const VoteButtons = ({ postId, orientation = "vertical" }: VoteButtonsProps) => {
  const { voteScore, userVote, upvote, downvote } = useVoting(postId);

  const containerClass = orientation === "vertical" 
    ? "flex flex-col items-center gap-1" 
    : "flex items-center gap-2";

  return (
    <div className={containerClass}>
      <Button
        variant="ghost"
        size="sm"
        onClick={upvote}
        className={cn(
          "h-8 w-8 p-0",
          userVote === 1 && "text-orange-500 hover:text-orange-600"
        )}
      >
        <ArrowUp className={cn(
          "h-5 w-5",
          userVote === 1 && "fill-current"
        )} />
      </Button>

      <span className={cn(
        "text-sm font-semibold min-w-[2rem] text-center",
        userVote === 1 && "text-orange-500",
        userVote === -1 && "text-blue-500"
      )}>
        {voteScore}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={downvote}
        className={cn(
          "h-8 w-8 p-0",
          userVote === -1 && "text-blue-500 hover:text-blue-600"
        )}
      >
        <ArrowDown className={cn(
          "h-5 w-5",
          userVote === -1 && "fill-current"
        )} />
      </Button>
    </div>
  );
};
