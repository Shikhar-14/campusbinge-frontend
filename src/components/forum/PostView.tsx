import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Clock, Pin, Lock, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PostInteractionsNew } from "./PostInteractionsNew";
import { NestedComment } from "./NestedComment";
import { KarmaBadge } from "./KarmaBadge";
import { ReportDialog } from "./ReportDialog";
import { ModerationMenu } from "./ModerationMenu";
import { useModeratorStatus } from "@/hooks/useModeratorStatus";
import { ReactionsBar } from "./ReactionsBar";
import { LiveThreadIndicator } from "./LiveThreadIndicator";
import { MediaPreview } from "./MediaPreview";
import { MediaCarousel } from "./MediaCarousel";
import { PollCard } from "./PollCard";
import { EditPostDialog } from "./EditPostDialog";
import { DeletePostDialog } from "./DeletePostDialog";

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_archived?: boolean;
  is_live?: boolean;
  media_url?: string;
  media_type?: "image" | "video" | "link";
  media_items?: Array<{ url: string; type: "image" | "video" }>;
  link_preview?: any;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    total_karma?: number;
  } | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  parent_id: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    total_karma?: number;
  } | null;
  replies?: Comment[];
};

type CommentSort = "top" | "new" | "controversial";

export const PostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSort>("top");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { isModerator } = useModeratorStatus();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      incrementViewCount();
    }
  }, [postId]);

  const incrementViewCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      await supabase.from("post_views" as any).insert({
        post_id: postId,
        user_id: user?.id || null,
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const fetchPost = async () => {
    try {
      const { data: postData, error } = await supabase
        .from("posts" as any)
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;

      if (postData) {
        // Fetch profile separately
        const postDataAny = postData as any;
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, total_karma")
          .eq("user_id", postDataAny.user_id)
          .maybeSingle();

        setPost({
          ...postDataAny,
          profiles: profileData || null,
        } as unknown as Post);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      // Fetch ALL comments for this post
      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (commentsData) {
        // Fetch profiles
        const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, total_karma")
          .in("user_id", userIds);

        const profilesMap = new Map(
          (profilesData || []).map((p: any) => [p.user_id, p])
        );

        // Fetch vote scores for all comments
        const commentsWithData = await Promise.all(
          commentsData.map(async (comment: any) => {
            const { data: voteScore } = await supabase
              .rpc('get_comment_vote_score', { comment_id_param: comment.id });
            
            return {
              ...comment,
              profiles: profilesMap.get(comment.user_id) || null,
              voteScore: (voteScore as number) || 0,
            };
          })
        );

        // Build tree structure
        const tree = buildCommentTree(commentsWithData);
        setComments(tree as Comment[]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const buildCommentTree = (flatComments: any[]): any[] => {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const sortComments = (comments: Comment[]): Comment[] => {
    const sorted = [...comments].sort((a, b) => {
      if (sortBy === "new") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "top") {
        const aScore = (a as any).voteScore || 0;
        const bScore = (b as any).voteScore || 0;
        return bScore - aScore;
      } else if (sortBy === "controversial") {
        // Simple controversial algorithm: comments with scores close to 0 but high engagement
        const aScore = Math.abs((a as any).voteScore || 0);
        const bScore = Math.abs((b as any).voteScore || 0);
        return aScore - bScore;
      }
      return 0;
    });

    // Recursively sort replies
    return sorted.map(comment => ({
      ...comment,
      replies: comment.replies ? sortComments(comment.replies) : [],
    }));
  };

  const checkLikeStatus = async () => {
    // Removed - now handled by usePostInteractions hook
  };

  const handleLike = async () => {
    // Removed - now handled by PostInteractions component
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to comment",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("comments" as any).insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        is_anonymous: false,
      });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast({
        title: "Success",
        description: "Comment posted!",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!post) {
    return <div className="container mx-auto py-8 px-4">Post not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate('/forum')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {post.is_anonymous
                ? "A"
                : post.profiles?.display_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.is_pinned && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  Pinned
                </Badge>
              )}
              {post.is_locked && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}
              {post.is_archived && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Archive className="w-3 h-3" />
                  Archived
                </Badge>
              )}
            </div>
            <div 
              className="font-semibold cursor-pointer hover:underline"
              onClick={() => !post.is_anonymous && navigate(`/user/${post.user_id}`)}
            >
              {post.is_anonymous
                ? post.anonymous_name || "Anonymous"
                : post.profiles?.display_name || "User"}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <p className="text-lg mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.media_items && post.media_items.length > 0 ? (
          <MediaCarousel mediaItems={post.media_items} />
        ) : (
          <MediaPreview
            mediaUrl={post.media_url}
            mediaType={post.media_type}
            linkPreview={post.link_preview}
          />
        )}

        <PollCard postId={postId || ""} />

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <PostInteractionsNew postId={postId || ""} />
          <ReactionsBar postId={postId} />
          {currentUser === post.user_id && (
            <>
              <EditPostDialog 
                postId={postId || ""} 
                currentContent={post.content}
                onPostUpdated={fetchPost}
              />
              <DeletePostDialog 
                postId={postId || ""} 
                redirectAfterDelete={true}
              />
            </>
          )}
          <ReportDialog targetType="post" targetId={postId || ""} />
          {isModerator && (
            <ModerationMenu
              type="post"
              itemId={postId || ""}
              userId={post.user_id}
              isPinned={post.is_pinned}
              isLocked={post.is_locked}
              isArchived={post.is_archived}
              onUpdate={fetchPost}
            />
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">
          {post.is_locked ? "Comments are locked" : "Add a comment"}
        </h3>
        {post.is_locked ? (
          <p className="text-muted-foreground">
            This post has been locked by moderators. No new comments can be added.
          </p>
        ) : (
          <>
            <Textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
            />
            <Button onClick={handleSubmitComment} disabled={submitting}>
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Comments ({comments.length})
          </h3>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "top" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("top")}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Top
            </Button>
            <Button
              variant={sortBy === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("new")}
            >
              <Clock className="w-4 h-4 mr-1" />
              New
            </Button>
            <Button
              variant={sortBy === "controversial" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("controversial")}
            >
              Controversial
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {sortComments(comments).map((comment) => (
            <NestedComment
              key={comment.id}
              comment={comment}
              postId={postId || ""}
              onReplyAdded={fetchComments}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
