import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Pin, Lock, Archive, Trash2, UserX, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ModerationMenuProps = {
  type: "post" | "comment" | "user";
  itemId: string;
  userId?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isArchived?: boolean;
  onUpdate?: () => void;
};

export const ModerationMenu = ({
  type,
  itemId,
  userId,
  isPinned,
  isLocked,
  isArchived,
  onUpdate,
}: ModerationMenuProps) => {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showMuteDialog, setShowMuteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePinPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("posts")
        .update({
          is_pinned: !isPinned,
          pinned_at: !isPinned ? new Date().toISOString() : null,
          pinned_by: !isPinned ? user.id : null,
        })
        .eq("id", itemId);

      if (error) throw error;
      toast({
        title: isPinned ? "Post unpinned" : "Post pinned",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error pinning post:", error);
      toast({
        title: "Error",
        description: "Failed to pin post",
        variant: "destructive",
      });
    }
  };

  const handleLockPost = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_locked: !isLocked })
        .eq("id", itemId);

      if (error) throw error;
      toast({
        title: isLocked ? "Post unlocked" : "Post locked",
        description: isLocked ? "Users can now comment" : "Comments disabled",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error locking post:", error);
      toast({
        title: "Error",
        description: "Failed to lock post",
        variant: "destructive",
      });
    }
  };

  const handleArchivePost = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_archived: !isArchived })
        .eq("id", itemId);

      if (error) throw error;
      toast({
        title: isArchived ? "Post unarchived" : "Post archived",
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error archiving post:", error);
      toast({
        title: "Error",
        description: "Failed to archive post",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (type === "post") {
        const { error } = await supabase.from("posts").delete().eq("id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comments")
          .update({
            is_deleted: true,
            deleted_by: user.id,
            deleted_at: new Date().toISOString(),
          })
          .eq("id", itemId);
        if (error) throw error;
      }

      toast({
        title: `${type === "post" ? "Post" : "Comment"} deleted`,
      });
      setShowDeleteDialog(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanUser = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_bans").insert({
        user_id: userId,
        banned_by: user.id,
        reason,
      });

      if (error) throw error;
      toast({
        title: "User banned",
      });
      setShowBanDialog(false);
      setReason("");
      onUpdate?.();
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMuteUser = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_mutes").insert({
        user_id: userId,
        muted_by: user.id,
        reason,
      });

      if (error) throw error;
      toast({
        title: "User muted",
        description: "User can no longer post or comment",
      });
      setShowMuteDialog(false);
      setReason("");
      onUpdate?.();
    } catch (error) {
      console.error("Error muting user:", error);
      toast({
        title: "Error",
        description: "Failed to mute user",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Shield className="w-4 h-4 mr-1" />
            Moderate
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {type === "post" && (
            <>
              <DropdownMenuItem onClick={handlePinPost}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "Unpin" : "Pin"} post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLockPost}>
                <Lock className="w-4 h-4 mr-2" />
                {isLocked ? "Unlock" : "Lock"} post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchivePost}>
                <Archive className="w-4 h-4 mr-2" />
                {isArchived ? "Unarchive" : "Archive"} post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {type}
          </DropdownMenuItem>
          {userId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowMuteDialog(true)}>
                <VolumeX className="w-4 h-4 mr-2" />
                Mute user
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
                <UserX className="w-4 h-4 mr-2" />
                Ban user
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from accessing the forum.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="ban-reason">Reason</Label>
            <Textarea
              id="ban-reason"
              placeholder="Provide a reason for the ban..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} disabled={submitting}>
              {submitting ? "Banning..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mute Dialog */}
      <AlertDialog open={showMuteDialog} onOpenChange={setShowMuteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mute user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from posting or commenting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="mute-reason">Reason</Label>
            <Textarea
              id="mute-reason"
              placeholder="Provide a reason for the mute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMuteUser} disabled={submitting}>
              {submitting ? "Muting..." : "Mute User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
