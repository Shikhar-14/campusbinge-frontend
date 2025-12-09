import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommentVoting } from "@/hooks/useCommentVoting";

interface CommentVoteButtonsProps {
  commentId: string;
}

export const CommentVoteButtons = ({ commentId }: CommentVoteButtonsProps) => {
  const { voteScore, userVote, upvote, downvote } = useCommentVoting(commentId);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={upvote}
        className={cn(
          "h-6 w-6 p-0",
          userVote === 1 && "text-orange-500 hover:text-orange-600"
        )}
      >
        <ArrowUp className={cn(
          "h-4 w-4",
          userVote === 1 && "fill-current"
        )} />
      </Button>

      <span className={cn(
        "text-xs font-semibold min-w-[1.5rem] text-center",
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
          "h-6 w-6 p-0",
          userVote === -1 && "text-blue-500 hover:text-blue-600"
        )}
      >
        <ArrowDown className={cn(
          "h-4 w-4",
          userVote === -1 && "fill-current"
        )} />
      </Button>
    </div>
  );
};
