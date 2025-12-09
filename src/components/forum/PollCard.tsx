import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PollOption = {
  text: string;
  votes: number;
};

type PollCardProps = {
  postId: string;
};

export const PollCard = ({ postId }: PollCardProps) => {
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPoll();
  }, [postId]);

  const fetchPoll = async () => {
    try {
      const { data: pollData } = await supabase
        .from("polls")
        .select("*")
        .eq("post_id", postId)
        .maybeSingle();

      if (!pollData) {
        setLoading(false);
        return;
      }

      setPoll(pollData);

      // Fetch votes
      const { data: votes } = await supabase
        .from("poll_votes")
        .select("option_index")
        .eq("poll_id", pollData.id);

      // Count votes per option
      const voteCounts: { [key: number]: number } = {};
      (votes || []).forEach((vote: any) => {
        voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1;
      });

      const pollOptions = typeof pollData.options === 'string' 
        ? JSON.parse(pollData.options) 
        : pollData.options;
      const optionsWithVotes = (pollOptions as string[]).map((text: string, index: number) => ({
        text,
        votes: voteCounts[index] || 0,
      }));

      setOptions(optionsWithVotes);
      setTotalVotes(votes?.length || 0);

      // Check if user voted
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userVoteData } = await supabase
          .from("poll_votes")
          .select("option_index")
          .eq("poll_id", pollData.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userVoteData) {
          setUserVote(userVoteData.option_index);
        }
      }
    } catch (error) {
      console.error("Error fetching poll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to vote",
          variant: "destructive",
        });
        return;
      }

      if (userVote !== null) {
        // Update existing vote
        await supabase
          .from("poll_votes")
          .update({ option_index: optionIndex })
          .eq("poll_id", poll.id)
          .eq("user_id", user.id);
      } else {
        // Insert new vote
        await supabase.from("poll_votes").insert({
          poll_id: poll.id,
          user_id: user.id,
          option_index: optionIndex,
        });
      }

      setUserVote(optionIndex);
      fetchPoll();

      toast({
        title: "Vote recorded",
        description: "Your vote has been counted",
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  if (loading || !poll) return null;

  const isEnded = poll.ends_at && new Date(poll.ends_at) < new Date();

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{poll.question}</h3>
      <div className="space-y-2">
        {options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = userVote === index;

          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "w-full h-auto p-3 relative justify-start",
                isEnded && "cursor-not-allowed"
              )}
              onClick={() => !isEnded && handleVote(index)}
              disabled={isEnded}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium flex items-center gap-2">
                    {option.text}
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </span>
                  <span className="text-sm">
                    {percentage.toFixed(0)}% ({option.votes})
                  </span>
                </div>
                {userVote !== null && (
                  <Progress value={percentage} className="h-1" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        {isEnded && " • Poll ended"}
        {poll.ends_at && !isEnded && (
          <> • Ends {new Date(poll.ends_at).toLocaleDateString()}</>
        )}
      </p>
    </Card>
  );
};
