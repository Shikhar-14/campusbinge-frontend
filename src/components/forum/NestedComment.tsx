import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { CommentVoteButtons } from "./CommentVoteButtons";
import { KarmaBadge } from "./KarmaBadge";
import { ReportDialog } from "./ReportDialog";
import { ModerationMenu } from "./ModerationMenu";
import { useModeratorStatus } from "@/hooks/useModeratorStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ReactionsBar } from "./ReactionsBar";
import { EditCommentDialog } from "./EditCommentDialog";
import { DeleteCommentDialog } from "./DeleteCommentDialog";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  parent_id: string | null;
  is_deleted?: boolean;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    total_karma?: number;
  } | null;
  replies?: Comment[];
};

interface NestedCommentProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onReplyAdded: () => void;
}

export const NestedComment = ({ comment, postId, depth = 0, onReplyAdded }: NestedCommentProps) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { isModerator } = useModeratorStatus();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    fetchCurrentUser();
  }, []);

  const displayName = comment.is_anonymous
    ? comment.anonymous_name || "Anonymous"
    : comment.profiles?.display_name || "User";

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in to reply", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("comments").insert({
        content: replyContent.trim(),
        post_id: postId,
        user_id: user.id,
        parent_id: comment.id,
      });

      if (error) throw error;

      setReplyContent("");
      setShowReplyBox(false);
      onReplyAdded();
      toast({ title: "Reply added successfully" });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({ title: "Failed to add reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const marginLeft = Math.min(depth * 24, 120); // Max 5 levels of indentation

  if (comment.is_deleted) {
    return (
      <div className="space-y-2" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex gap-2">
          <div className="flex-1 min-w-0 py-3">
            <p className="text-sm text-muted-foreground italic">[This comment has been removed by moderators]</p>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => (
              <NestedComment
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
                onReplyAdded={onReplyAdded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="flex gap-2 group">
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm mb-2 whitespace-pre-wrap break-words">{comment.content}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <CommentVoteButtons commentId={comment.id} />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              <MessageSquare className="h-3 w-3" />
              Reply
            </Button>

            <ReactionsBar commentId={comment.id} />

            {currentUser === comment.user_id && (
              <>
                <EditCommentDialog 
                  commentId={comment.id}
                  currentContent={comment.content}
                  onCommentUpdated={onReplyAdded}
                />
                <DeleteCommentDialog 
                  commentId={comment.id}
                  onCommentDeleted={onReplyAdded}
                />
              </>
            )}

            <ReportDialog
              targetType="comment" 
              targetId={comment.id}
              trigger={
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  Report
                </Button>
              }
            />

            {isModerator && (
              <ModerationMenu
                type="comment"
                itemId={comment.id}
                userId={comment.user_id}
                onUpdate={onReplyAdded}
              />
            )}
          </div>

          {showReplyBox && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? "Posting..." : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <NestedComment
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
