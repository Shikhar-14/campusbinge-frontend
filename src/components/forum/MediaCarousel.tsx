import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  url: string;
  type: "image" | "video";
};

type MediaCarouselProps = {
  mediaItems: MediaItem[];
};

export const MediaCarousel = ({ mediaItems }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaItems || mediaItems.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const currentMedia = mediaItems[currentIndex];

  return (
    <div className="mt-3 relative">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
        {currentMedia.type === "image" ? (
          <img
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </AspectRatio>

      {mediaItems.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Counter */}
          <div className="absolute bottom-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {mediaItems.length}
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-background/60 hover:bg-background/80"
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};