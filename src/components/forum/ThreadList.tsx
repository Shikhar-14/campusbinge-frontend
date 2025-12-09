import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, Pin, Lock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Thread = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
  post_count?: number;
  vote_count?: number;
};

export const ThreadList = ({ categoryId }: { categoryId?: string }) => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, [categoryId]);

  const fetchThreads = async () => {
    try {
      let query = supabase
        .from("forum_threads" as any)
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data: threadsData, error } = await query;

      if (error) throw error;

      // Get post counts and votes for each thread
      const threadsWithStats = await Promise.all(
        (threadsData || []).map(async (thread: any) => {
          // Get post count
          const { count: postCount } = await supabase
            .from("forum_posts" as any)
            .select("*", { count: "exact", head: true })
            .eq("thread_id", thread.id);

          // Get vote count
          const { data: votes } = await supabase
            .from("forum_votes" as any)
            .select("vote_type")
            .eq("thread_id", thread.id);

          const voteCount = votes?.reduce((sum: number, vote: any) => sum + vote.vote_type, 0) || 0;

          return {
            ...thread,
            post_count: postCount || 0,
            vote_count: voteCount,
          };
        })
      );

      setThreads(threadsWithStats as Thread[]);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No threads yet. Be the first to start a discussion!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Card
          key={thread.id}
          className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
          onClick={() => navigate(`/forum/thread/${thread.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>{thread.vote_count || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{thread.post_count || 0}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {thread.is_pinned && (
                    <Badge variant="default" className="gap-1">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </Badge>
                  )}
                  {thread.is_locked && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Locked
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                    {thread.title}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {thread.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={thread.profiles?.avatar_url} />
                      <AvatarFallback>
                        {thread.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {thread.profiles?.display_name || "Anonymous"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{thread.views_count}</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
