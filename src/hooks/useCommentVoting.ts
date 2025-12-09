import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommentVoting = (commentId: string) => {
  const [voteScore, setVoteScore] = useState(0);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoteData();

    // Set up real-time subscription for comment votes
    const votesChannel = supabase
      .channel(`comment-votes-${commentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_votes',
          filter: `comment_id=eq.${commentId}`
        },
        () => {
          fetchVoteScore();
          fetchUserVote();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [commentId]);

  const fetchVoteData = async () => {
    await Promise.all([fetchUserVote(), fetchVoteScore()]);
  };

  const fetchUserVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("comment_votes")
      .select("vote_type")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    setUserVote((data?.vote_type as 1 | -1) || null);
  };

  const fetchVoteScore = async () => {
    const { data } = await supabase
      .rpc('get_comment_vote_score', { comment_id_param: commentId });
    
    setVoteScore((data as number) || 0);
  };

  const vote = async (voteType: 1 | -1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to vote", variant: "destructive" });
      return;
    }

    try {
      let delta = 0;

      if (userVote === voteType) {
        // Remove vote if clicking same button
        await supabase
          .from("comment_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        setUserVote(null);
        delta = -voteType;
      } else if (userVote) {
        // Update existing vote
        await supabase
          .from("comment_votes")
          .update({ vote_type: voteType })
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        setUserVote(voteType);
        delta = voteType * 2; // -1 -> 1 or 1 -> -1
      } else {
        // Create new vote
        await supabase
          .from("comment_votes")
          .insert({ comment_id: commentId, user_id: user.id, vote_type: voteType });
        setUserVote(voteType);
        delta = voteType;
      }

      setVoteScore((prev) => prev + delta);
    } catch (error) {
      console.error("Error voting:", error);
      toast({ title: "Failed to vote", variant: "destructive" });
    }
  };

  const upvote = () => vote(1);
  const downvote = () => vote(-1);

  return {
    voteScore,
    userVote,
    upvote,
    downvote,
  };
};
