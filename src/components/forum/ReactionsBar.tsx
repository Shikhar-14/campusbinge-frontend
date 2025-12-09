import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

type ReactionsBarProps = {
  postId?: string;
  commentId?: string;
};

export const ReactionsBar = ({ postId, commentId }: ReactionsBarProps) => {
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReactions();
    fetchUserReaction();
  }, [postId, commentId]);

  const fetchReactions = async () => {
    try {
      const { data } = await supabase
        .from("reactions")
        .select("reaction_type")
        .eq(postId ? "post_id" : "comment_id", postId || commentId);

      if (data) {
        const counts: { [key: string]: number } = {};
        data.forEach((r: any) => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        });
        setReactions(counts);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const fetchUserReaction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("reactions")
        .select("reaction_type")
        .eq(postId ? "post_id" : "comment_id", postId || commentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setUserReaction(data.reaction_type);
      }
    } catch (error) {
      console.error("Error fetching user reaction:", error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to react",
          variant: "destructive",
        });
        return;
      }

      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from("reactions")
          .delete()
          .eq(postId ? "post_id" : "comment_id", postId || commentId)
          .eq("user_id", user.id)
          .eq("reaction_type", reactionType);
        setUserReaction(null);
      } else {
        // Remove old reaction if exists
        if (userReaction) {
          await supabase
            .from("reactions")
            .delete()
            .eq(postId ? "post_id" : "comment_id", postId || commentId)
            .eq("user_id", user.id);
        }

        // Add new reaction
        await supabase.from("reactions").insert({
          [postId ? "post_id" : "comment_id"]: postId || commentId,
          user_id: user.id,
          reaction_type: reactionType,
        });
        setUserReaction(reactionType);
      }

      fetchReactions();
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map((reaction) => {
        const count = reactions[reaction.type] || 0;
        const isActive = userReaction === reaction.type;

        return (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 gap-1",
              isActive && "bg-primary/10 border border-primary"
            )}
            onClick={() => handleReaction(reaction.type)}
          >
            <span className="text-base">{reaction.emoji}</span>
            {count > 0 && (
              <span className="text-xs font-medium">{count}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
