// src/pages/TestComponents.tsx
// 
// TEMPORARY TEST PAGE - Delete after testing
// 
// Add this route to your router temporarily:
// <Route path="/test-ui" element={<TestComponents />} />

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState, GridSkeleton, CardSkeleton, ListItemSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState, InlineError } from "@/components/ui/ErrorState";
import { Heart, MessageSquare, FolderOpen } from "lucide-react";

const TestComponents = () => {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">UI Component Test Page</h1>
      <p className="text-muted-foreground">Testing new LoadingState, EmptyState, and ErrorState components</p>

      {/* Toggle Button */}
      <div className="flex gap-2">
        <Button onClick={() => setShowLoading(!showLoading)}>
          Toggle Loading States
        </Button>
      </div>

      <hr className="border-border" />

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Loading States</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <h3 className="font-medium mb-2">Small Spinner</h3>
            <LoadingState size="sm" message="Loading..." />
          </Card>
          
          <Card className="p-4">
            <h3 className="font-medium mb-2">Medium Spinner (default)</h3>
            <LoadingState message="Fetching data..." />
          </Card>
          
          <Card className="p-4">
            <h3 className="font-medium mb-2">Large Spinner</h3>
            <LoadingState size="lg" message="Please wait..." />
          </Card>
        </div>

        <div>
          <h3 className="font-medium mb-2">Card Skeleton</h3>
          <div className="w-64">
            <CardSkeleton />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">List Item Skeleton</h3>
          <Card>
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </Card>
        </div>

        <div>
          <h3 className="font-medium mb-2">Grid Skeleton (6 cards)</h3>
          <GridSkeleton count={6} />
        </div>
      </section>

      <hr className="border-border" />

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Empty States</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <EmptyState
            icon={Heart}
            title="No Favorites"
            description="You haven't added any colleges to your favorites yet."
            action={{
              label: "Browse Colleges",
              onClick: () => alert("Browse clicked!")
            }}
          />
          
          <EmptyState
            icon={MessageSquare}
            title="No Messages"
            description="Start a conversation to see your chat history here."
          />
          
          <EmptyState
            icon={FolderOpen}
            title="No Documents"
            description="Upload your first document to get started."
            action={{
              label: "Upload Document",
              onClick: () => alert("Upload clicked!")
            }}
          />
        </div>
      </section>

      <hr className="border-border" />

      {/* Error States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Error States</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <ErrorState
            type="error"
            title="Something went wrong"
            message="We couldn't load your data. Please try again."
            onRetry={() => alert("Retry clicked!")}
          />
          
          <ErrorState
            type="network"
            title="Connection Lost"
            message="Please check your internet connection."
            onRetry={() => alert("Retry clicked!")}
          />
          
          <ErrorState
            type="notFound"
            title="Page Not Found"
            message="The page you're looking for doesn't exist."
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Inline Error</h3>
          <InlineError 
            message="Failed to save changes" 
            onRetry={() => alert("Retry clicked!")}
          />
        </div>
      </section>

      <hr className="border-border" />

      <section>
        <h2 className="text-2xl font-semibold text-green-600">✅ All Components Working!</h2>
        <p className="text-muted-foreground">
          If you can see all the components above, everything is set up correctly.
          You can now delete this test page.
        </p>
      </section>
    </div>
  );
};

export default TestComponents;