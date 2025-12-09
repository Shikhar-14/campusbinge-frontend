import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

type EditCommentDialogProps = {
  commentId: string;
  currentContent: string;
  onCommentUpdated?: () => void;
};

export const EditCommentDialog = ({ commentId, currentContent, onCommentUpdated }: EditCommentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("comments")
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your comment has been updated!",
      });

      setOpen(false);
      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="w-3 h-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="Write your comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Updating..." : "Update Comment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};