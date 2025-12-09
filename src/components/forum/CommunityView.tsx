import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, UserPlus, UserMinus } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { useCommunityMembership } from "@/hooks/useCommunityMembership";
import { PostInteractionsNew } from "./PostInteractionsNew";

type Community = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const CommunityView = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMember, memberCount, toggleMembership } = useCommunityMembership(communityId || "");

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchPosts();
    }
  }, [communityId]);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from("communities" as any)
        .select("*")
        .eq("id", communityId)
        .single();

      if (error) throw error;

      if (data) {
        setCommunity(data as unknown as Community);
      }
    } catch (error) {
      console.error("Error fetching community:", error);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("posts" as any)
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (postsData) {
        // Fetch profiles separately
        const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles" as any)
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(
          (profilesData || []).map((p: any) => [p.user_id, p])
        );

        const postsWithProfiles = postsData.map((post: any) => ({
          ...post,
          profiles: profilesMap.get(post.user_id) || null,
        }));

        setPosts(postsWithProfiles as unknown as Post[]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!community) {
    return <div className="container mx-auto py-8 px-4">Community not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate('/forum')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{community.icon || "📁"}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
            <p className="text-muted-foreground mb-4">{community.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{memberCount} members</span>
            </div>
          </div>
          <CreatePostDialog communityId={communityId} onPostCreated={fetchPosts} />
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/forum/post/${post.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {post.is_anonymous ? (
                      <span className="text-sm font-medium">
                        {post.anonymous_name || "Anonymous"}
                      </span>
                    ) : (
                      <span className="text-sm font-medium">
                        {post.profiles?.display_name || "User"}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-3">{post.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
