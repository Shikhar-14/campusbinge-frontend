// src/components/forum/PostSkeleton.tsx
/**
 * Skeleton loader for forum posts
 * Shows animated placeholder while posts are loading
 */

import { Card } from "@/components/ui/card";

interface PostSkeletonProps {
  count?: number;
}

export const PostSkeleton = ({ count = 3 }: PostSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              {/* Header skeleton - community, author, time */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-2 bg-muted rounded-full" />
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-2 bg-muted rounded-full" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              
              {/* Title skeleton */}
              <div className="h-5 bg-muted rounded w-3/4" />
              
              {/* Content skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
              
              {/* Actions skeleton - votes, comments, share */}
              <div className="flex gap-4 pt-2">
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PostSkeleton;