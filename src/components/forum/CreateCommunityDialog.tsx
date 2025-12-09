import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface CreateCommunityDialogProps {
  onCommunityCreated?: () => void;
}

export const CreateCommunityDialog = ({ onCommunityCreated }: CreateCommunityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Community name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a community",
          variant: "destructive",
        });
        return;
      }

      const { data: community, error } = await supabase
        .from("communities")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          icon: icon.trim() || null,
          is_private: isPrivate,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically join the creator as admin
      if (community) {
        await supabase
          .from("community_members")
          .insert({
            community_id: community.id,
            user_id: user.id,
            is_admin: true,
          });
      }

      toast({
        title: "Success",
        description: "Community created successfully!",
      });

      setName("");
      setDescription("");
      setIcon("");
      setIsPrivate(false);
      setOpen(false);
      
      if (onCommunityCreated) {
        onCommunityCreated();
      }
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="Enter community name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your community"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <div className="flex gap-2">
              <Input
                id="icon"
                placeholder="📁"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-0" align="end">
                  <ScrollArea className="h-[350px]">
                    <EmojiPicker
                      onEmojiClick={(emojiData: EmojiClickData) => setIcon(emojiData.emoji)}
                      width="100%"
                    />
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="private">Private Community</Label>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
