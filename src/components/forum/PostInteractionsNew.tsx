import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { VoteButtons } from "./VoteButtons";

interface PostInteractionsNewProps {
  postId: string;
  onCommentClick?: () => void;
}

export const PostInteractionsNew = ({ postId, onCommentClick }: PostInteractionsNewProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInteractionStates();

    // Set up real-time subscriptions
    const commentsChannel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => fetchCommentCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [postId]);

  const fetchInteractionStates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await Promise.all([
      fetchRepostStatus(user.id),
      fetchRepostCount(),
      fetchSavedStatus(user.id),
      fetchCommentCount(),
    ]);
  };

  const fetchRepostStatus = async (userId: string) => {
    const { data } = await supabase
      .from("reposts")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    setReposted(!!data);
  };

  const fetchRepostCount = async () => {
    const { count } = await supabase
      .from("reposts")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    setRepostCount(count || 0);
  };

  const fetchSavedStatus = async (userId: string) => {
    // Note: saved_comments table was for saving comments, not posts
    // You might want to create a saved_posts table
    setSaved(false);
  };

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    setCommentCount(count || 0);
  };

  const toggleRepost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to repost", variant: "destructive" });
      return;
    }

    if (reposted) {
      await supabase.from("reposts").delete().eq("post_id", postId).eq("user_id", user.id);
      setReposted(false);
      setRepostCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase.from("reposts").insert({ post_id: postId, user_id: user.id });
      setReposted(true);
      setRepostCount(prev => prev + 1);
    }
  };

  const toggleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to save posts", variant: "destructive" });
      return;
    }

    // TODO: Implement saved posts functionality
    toast({ title: "Save feature coming soon!" });
  };

  return (
    <div className="flex items-center gap-2 pt-3 border-t">
      <VoteButtons postId={postId} orientation="horizontal" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
        className="gap-1.5"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs">{commentCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleRepost}
        className={cn("gap-1.5", reposted && "text-green-500")}
      >
        <Share2 className="h-4 w-4" />
        <span className="text-xs">{repostCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSave}
        className={cn("gap-1.5 ml-auto", saved && "text-primary")}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      </Button>
    </div>
  );
};
