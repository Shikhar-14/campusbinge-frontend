import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Pin, Lock, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  profiles: {
    display_name: string;
    avatar_url: string;
  };
};

type Post = {
  id: string;
  content: string;
  user_id: string;
  thread_id: string;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
  vote_count?: number;
  user_vote?: number;
};

export const ThreadView = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchThread();
    incrementViewCount();
  }, [threadId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const incrementViewCount = async () => {
    if (!threadId) return;
    // Increment view count
    try {
      const { data: thread } = await supabase
        .from("forum_threads" as any)
        .select("views_count")
        .eq("id", threadId)
        .maybeSingle();
      
      if (thread) {
        const threadObj = thread as Record<string, any>;
        if ('views_count' in threadObj) {
          await supabase
            .from("forum_threads" as any)
            .update({ views_count: (threadObj.views_count || 0) + 1 })
            .eq("id", threadId);
        }
      }
    } catch (error) {
      // Ignore errors
    }
  };

  const fetchThread = async () => {
    if (!threadId) return;

    try {
      // Fetch thread
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads" as any)
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq("id", threadId)
        .maybeSingle();

      if (threadError) throw threadError;
      if (!threadData) {
        setLoading(false);
        return;
      }
      setThread(threadData as unknown as Thread);

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts" as any)
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (postsError) throw postsError;

      // Get votes for each post
      const postsWithVotes = await Promise.all(
        (postsData || []).map(async (post: any) => {
          const { data: votes } = await supabase
            .from("forum_votes" as any)
            .select("vote_type, user_id")
            .eq("post_id", post.id);

          const validVotes = Array.isArray(votes) ? votes.filter((v: any) => typeof v === 'object' && 'vote_type' in v) : [];
          const voteCount = validVotes.reduce((sum: number, vote: any) => sum + (vote as any).vote_type, 0);
          const userVoteData = validVotes.find((v: any) => (v as any).user_id === currentUserId);
          const userVote = userVoteData ? (userVoteData as any).vote_type : 0;

          return {
            ...post,
            vote_count: voteCount,
            user_vote: userVote,
          };
        })
      );

      setPosts(postsWithVotes as Post[]);
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast({
        title: "Error",
        description: "Failed to load thread",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please log in to post",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!newPostContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("forum_posts" as any).insert({
        content: newPostContent,
        thread_id: threadId!,
        user_id: currentUserId,
      });

      if (error) throw error;

      setNewPostContent("");
      fetchThread();
      toast({
        title: "Success",
        description: "Your post has been added",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (postId: string, voteType: number) => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from("forum_votes" as any)
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (existingVote) {
        const voteObj = existingVote as Record<string, any>;
        if ('vote_type' in voteObj) {
          // Remove vote if clicking same button
          if (voteObj.vote_type === voteType) {
            await supabase.from("forum_votes" as any).delete().eq("id", voteObj.id);
          } else {
            // Update vote
            await supabase
              .from("forum_votes" as any)
              .update({ vote_type: voteType })
              .eq("id", voteObj.id);
          }
        }
      } else {
        // Create new vote
        await supabase.from("forum_votes" as any).insert({
          post_id: postId,
          user_id: currentUserId,
          vote_type: voteType,
        });
      }

      fetchThread();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Thread not found</p>
          <Button onClick={() => navigate("/forum")} className="mt-4">
            Back to Forum
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
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
          </div>
          <CardTitle className="text-2xl">{thread.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={thread.profiles?.avatar_url} />
                <AvatarFallback>
                  {thread.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{thread.profiles?.display_name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Replies ({posts.length})
        </h3>

        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, 1)}
                    className={post.user_vote === 1 ? "text-primary" : ""}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">{post.vote_count || 0}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(post.id, -1)}
                    className={post.user_vote === -1 ? "text-destructive" : ""}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {post.profiles?.display_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!thread.is_locked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Write your reply..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleSubmitPost}
              disabled={submitting || !newPostContent.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
