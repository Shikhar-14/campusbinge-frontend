import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageSquare, Award, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KarmaBadge } from "@/components/forum/KarmaBadge";

type Profile = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  post_karma: number;
  comment_karma: number;
  total_karma: number;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  community_id: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [awardsReceived, setAwardsReceived] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchUserActivity();
      fetchAwardsReceived();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const fetchUserActivity = async () => {
    try {
      const [postsData, commentsData] = await Promise.all([
        supabase
          .from("posts")
          .select("id, content, created_at, community_id")
          .eq("user_id", userId)
          .eq("is_anonymous", false)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("comments")
          .select("id, content, created_at, post_id")
          .eq("user_id", userId)
          .eq("is_anonymous", false)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (postsData.data) setPosts(postsData.data);
      if (commentsData.data) setComments(commentsData.data);
    } catch (error) {
      console.error("Error fetching user activity:", error);
    }
  };

  const fetchAwardsReceived = async () => {
    try {
      const [postAwardsData, commentAwardsData] = await Promise.all([
        supabase
          .from("post_awards")
          .select("id")
          .in("post_id", (await supabase.from("posts").select("id").eq("user_id", userId)).data?.map(p => p.id) || []),
        supabase
          .from("comment_awards")
          .select("id")
          .in("comment_id", (await supabase.from("comments").select("id").eq("user_id", userId)).data?.map(c => c.id) || []),
      ]);

      const total = (postAwardsData.data?.length || 0) + (commentAwardsData.data?.length || 0);
      setAwardsReceived(total);
    } catch (error) {
      console.error("Error fetching awards:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.display_name?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {profile.display_name || "Anonymous User"}
            </h1>
            <KarmaBadge karma={profile.total_karma} size="md" />
            {profile.bio && (
              <p className="text-muted-foreground mb-4 mt-2">{profile.bio}</p>
            )}
            <div className="flex gap-6 text-sm mt-4">
              <div>
                <div className="font-semibold text-lg">{posts.length}</div>
                <div className="text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="font-semibold text-lg">{comments.length}</div>
                <div className="text-muted-foreground">Comments</div>
              </div>
              <div>
                <div className="font-semibold text-lg">{profile.post_karma}</div>
                <div className="text-muted-foreground">Post Karma</div>
              </div>
              <div>
                <div className="font-semibold text-lg">{profile.comment_karma}</div>
                <div className="text-muted-foreground">Comment Karma</div>
              </div>
              <div>
                <div className="font-semibold text-lg flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {awardsReceived}
                </div>
                <div className="text-muted-foreground">Awards</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No posts yet
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/forum/post/${post.id}`)}
              >
                <p className="text-sm mb-2">{post.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {comments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No comments yet
            </Card>
          ) : (
            comments.map((comment) => (
              <Card
                key={comment.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(`/forum/post/${comment.post_id}`)}
              >
                <p className="text-sm mb-2">{comment.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
