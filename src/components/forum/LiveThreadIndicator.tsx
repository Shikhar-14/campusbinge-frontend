import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

type LiveThreadIndicatorProps = {
  postId: string;
  isLive: boolean;
};

export const LiveThreadIndicator = ({ postId, isLive }: LiveThreadIndicatorProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    fetchCommentCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`live-thread-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          setRecentActivity(true);
          fetchCommentCount();
          setTimeout(() => setRecentActivity(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isLive]);

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    
    setCommentCount(count || 0);
  };

  if (!isLive) return null;

  return (
    <Badge variant="secondary" className="gap-1 animate-pulse">
      <Radio className="w-3 h-3 text-red-500" />
      <span>LIVE</span>
      {recentActivity && <span className="ml-1">• New comment!</span>}
      {commentCount > 0 && <span className="ml-1">({commentCount})</span>}
    </Badge>
  );
};
