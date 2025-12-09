import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { ExternalLink, Play } from "lucide-react";

type MediaPreviewProps = {
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
};

const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const MediaPreview = ({ mediaUrl, mediaType, linkPreview }: MediaPreviewProps) => {
  if (!mediaUrl && !linkPreview) return null;

  if (mediaType === "image" && mediaUrl) {
    return (
      <div className="mt-3">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
          <img
            src={mediaUrl}
            alt="Post image"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </AspectRatio>
      </div>
    );
  }

  if (mediaType === "video" && mediaUrl) {
    return (
      <div className="mt-3">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
          <video
            src={mediaUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </AspectRatio>
      </div>
    );
  }

  if (linkPreview) {
    const videoId = isYouTubeUrl(linkPreview.url) ? getYouTubeVideoId(linkPreview.url) : null;
    
    // If it's a YouTube link with a valid video ID, show an embedded player
    if (videoId) {
      return (
        <div className="mt-3">
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </AspectRatio>
          <a
            href={linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            Open on YouTube
          </a>
        </div>
      );
    }
    
    // For non-YouTube links, show the card preview
    return (
      <Card className="mt-3 p-0 overflow-hidden hover:border-primary transition-colors cursor-pointer">
        <a
          href={linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row"
        >
          {linkPreview.image && (
            <div className="sm:w-1/3 h-48 sm:h-auto bg-muted flex-shrink-0">
              <img
                src={linkPreview.image}
                alt={linkPreview.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold line-clamp-2">{linkPreview.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {linkPreview.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new URL(linkPreview.url).hostname}
            </p>
          </div>
        </a>
      </Card>
    );
  }

  return null;
};
