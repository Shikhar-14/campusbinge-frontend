import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ReactNode, useEffect } from "react";
import { Image as ImageIcon, Video, Link as LinkIcon, X } from "lucide-react";
import { MediaPreview } from "./MediaPreview";

type CreatePostDialogProps = {
  onPostCreated?: () => void;
  communityId?: string;
  children?: ReactNode;
};

export const CreatePostDialog = ({ onPostCreated, communityId, children }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(communityId || "");
  const [communities, setCommunities] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const MAX_MEDIA_FILES = 20;

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities" as any)
      .select("id, name")
      .eq("is_private", false)
      .order("name");
    setCommunities(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + mediaFiles.length > MAX_MEDIA_FILES) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${MAX_MEDIA_FILES} files`,
        variant: "destructive",
      });
      return;
    }

    setMediaFiles((prev) => [...prev, ...files]);
    setMediaUrl("");
    setLinkPreview(null);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllMedia = () => {
    setMediaFiles([]);
    setMediaUrl("");
    setLinkPreview(null);
  };

  const fetchLinkPreview = async (url: string) => {
    if (!url || !url.startsWith("http")) return;
    
    setFetchingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke("link-preview", {
        body: { url },
      });

      if (error) throw error;

      if (data && !data.error) {
        setLinkPreview(data);
        console.log("Link preview fetched:", data);
      }
    } catch (error) {
      console.error("Error fetching link preview:", error);
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setMediaUrl(url);
    setMediaFiles([]);
    
    // Debounce the preview fetch
    const timeoutId = setTimeout(() => {
      fetchLinkPreview(url);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCommunity) {
      toast({
        title: "Error",
        description: "Please select a community",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Upload multiple media files to storage
    const uploadedMediaItems: Array<{ url: string; type: "image" | "video" }> = [];
    
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('forum-media')
          .upload(fileName, file);

        if (uploadError) {
          toast({
            title: "Error",
            description: `Failed to upload ${file.name}. Continuing with other files.`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('forum-media')
          .getPublicUrl(uploadData.path);
        
        const fileType = file.type;
        const mediaType: "image" | "video" = fileType.startsWith("image/") ? "image" : "video";
        
        uploadedMediaItems.push({ url: publicUrl, type: mediaType });
      }
    }

    const anonymousName = isAnonymous
      ? `Anonymous${Math.floor(Math.random() * 10000)}`
      : null;

    // Determine legacy media type for backward compatibility
    let legacyMediaType: "image" | "video" | "link" | null = null;
    let legacyMediaUrl: string | null = null;
    
    if (mediaUrl) {
      legacyMediaType = "link";
      legacyMediaUrl = mediaUrl;
    } else if (uploadedMediaItems.length > 0) {
      legacyMediaType = uploadedMediaItems[0].type;
      legacyMediaUrl = uploadedMediaItems[0].url;
    }

    const { data, error } = await supabase
      .from("posts" as any)
      .insert({
        content: content.trim(),
        user_id: user.id,
        is_anonymous: isAnonymous,
        anonymous_name: anonymousName,
        community_id: selectedCommunity,
        media_items: uploadedMediaItems,
        media_url: legacyMediaUrl,
        media_type: legacyMediaType,
        link_preview: mediaUrl ? linkPreview : null,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your post has been created!",
    });

    setOpen(false);
    setContent("");
    setIsAnonymous(false);
    removeAllMedia();
    
    if (onPostCreated) {
      onPostCreated();
    }
    
    if (data) {
      navigate(`/forum/post/${(data as any).id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary">
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label>Community</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Media (Optional) - Max {MAX_MEDIA_FILES} files</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-file"
                  multiple
                  disabled={mediaFiles.length >= MAX_MEDIA_FILES || mediaUrl !== ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('media-file')?.click()}
                  disabled={mediaFiles.length >= MAX_MEDIA_FILES || mediaUrl !== ""}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload Image/Video ({mediaFiles.length}/{MAX_MEDIA_FILES})
                </Button>
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Or paste a URL"
                  value={mediaUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setMediaUrl(url);
                    if (url) {
                      setMediaFiles([]);
                      handleUrlChange(url);
                    } else {
                      setLinkPreview(null);
                    }
                  }}
                  disabled={mediaFiles.length > 0}
                />
                {fetchingPreview && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Fetching preview...
                  </p>
                )}
              </div>
            </div>
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAllMedia}
                  >
                    Remove all
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="text-xs flex-1 truncate">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeMediaFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {linkPreview && (
            <div className="space-y-2">
              <Label>Link Preview</Label>
              <MediaPreview linkPreview={linkPreview} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous">Post anonymously</Label>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-primary">
            {submitting ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
