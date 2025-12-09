import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVoting = (postId: string) => {
  const [voteScore, setVoteScore] = useState(0);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoteData();

    // Set up real-time subscription for votes
    const votesChannel = supabase
      .channel(`votes-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `post_id=eq.${postId}`
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
  }, [postId]);

  const fetchVoteData = async () => {
    await Promise.all([fetchUserVote(), fetchVoteScore()]);
  };

  const fetchUserVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    setUserVote((data?.vote_type as 1 | -1) || null);
  };

  const fetchVoteScore = async () => {
    const { data } = await supabase
      .rpc('get_post_vote_score', { post_id_param: postId });
    
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
          .from("votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        setUserVote(null);
        delta = -voteType;
      } else if (userVote) {
        // Update existing vote
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("post_id", postId)
          .eq("user_id", user.id);
        setUserVote(voteType);
        delta = voteType * 2; // -1 -> 1 or 1 -> -1
      } else {
        // Create new vote
        await supabase
          .from("votes")
          .insert({ post_id: postId, user_id: user.id, vote_type: voteType });
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
