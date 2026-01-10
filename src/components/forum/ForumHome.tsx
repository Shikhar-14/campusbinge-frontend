import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Search, MessageSquare, Share2, Loader2, Pin, Lock, Archive, ArrowLeft } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateCommunityDialog } from "./CreateCommunityDialog";
import { CommunitiesList } from "./CommunitiesList";
import { VoteButtons } from "./VoteButtons";
import { KarmaBadge } from "./KarmaBadge";
import { ReportDialog } from "./ReportDialog";
import { ModerationMenu } from "./ModerationMenu";
import { useModeratorStatus } from "@/hooks/useModeratorStatus";
import { LiveThreadIndicator } from "./LiveThreadIndicator";
import { MediaPreview } from "./MediaPreview";
import { MediaCarousel } from "./MediaCarousel";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PostSkeleton } from "./PostSkeleton";

type Community = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  member_count: number;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  college: string | null;
  community_id: string | null;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_archived?: boolean;
  is_live?: boolean;
  media_url?: string;
  media_type?: "image" | "video" | "link";
  media_items?: Array<{ url: string; type: "image" | "video" }>;
  link_preview?: any;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    total_karma?: number;
  } | null;
  communities?: {
    name: string;
  } | null;
  vote_score?: number;
  comment_count?: number;
  view_count?: number;
};

export const ForumHome = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeTab, setActiveTab] = useState<"hot" | "new" | "top" | "rising" | "controversial">("hot");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [postsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommunities, setShowCommunities] = useState(false);
  const { isModerator } = useModeratorStatus();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchCommunities();
    fetchUserProfile();
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("avatar_url, display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchCommunities = async () => {
    try {
      const { data: communitiesData } = await supabase
        .from("communities" as any)
        .select("*")
        .order("name");

      if (communitiesData) {
        const communitiesWithCounts = await Promise.all(
          communitiesData.map(async (community: any) => {
            const { count } = await supabase
              .from("community_members" as any)
              .select("*", { count: "exact", head: true })
              .eq("community_id", community.id);
            
            return {
              id: community.id,
              name: community.name,
              description: community.description,
              icon: community.icon,
              member_count: count || 0,
            };
          })
        );
        setCommunities(communitiesWithCounts);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const fetchData = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(true);
    }
    
    if (activeTab === "hot") {
      await fetchHotPosts(reset);
    } else if (activeTab === "new") {
      await fetchNewPosts(reset);
    } else if (activeTab === "top") {
      await fetchTopPosts(reset);
    } else if (activeTab === "rising") {
      await fetchRisingPosts(reset);
    } else if (activeTab === "controversial") {
      await fetchControversialPosts(reset);
    }
    
    if (reset) {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchData(false);
    setLoadingMore(false);
  };

  const fetchHotPosts = async (reset = true) => {
    try {
      const currentLength = reset ? 0 : posts.length;
      const { data: postsData } = await supabase
        .from("posts" as any)
        .select("*, communities(name)")
        .order("created_at", { ascending: false })
        .range(currentLength, currentLength + postsPerPage - 1);

      if (postsData) {
        const postsWithData = await enrichPostsWithData(postsData);
        // Hot algorithm: engagement score with time decay
        const sorted = postsWithData.sort((a, b) => {
          const now = Date.now();
          const ageA = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60); // hours
          const ageB = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
          
          const scoreA = ((a.vote_score || 0) * 2 + (a.comment_count || 0) * 3) / Math.pow(ageA + 2, 1.5);
          const scoreB = ((b.vote_score || 0) * 2 + (b.comment_count || 0) * 3) / Math.pow(ageB + 2, 1.5);
          return scoreB - scoreA;
        });
        
        if (reset) {
          setPosts(sorted);
        } else {
          setPosts(prev => [...prev, ...sorted]);
        }
        
        setHasMore(postsData.length === postsPerPage);
      }
    } catch (error) {
      console.error("Error fetching hot posts:", error);
    }
  };

  const fetchNewPosts = async (reset = true) => {
    try {
      const currentLength = reset ? 0 : posts.length;
      const { data: postsData } = await supabase
        .from("posts" as any)
        .select("*, communities(name)")
        .order("created_at", { ascending: false })
        .range(currentLength, currentLength + postsPerPage - 1);

      if (postsData) {
        const postsWithData = await enrichPostsWithData(postsData);
        
        if (reset) {
          setPosts(postsWithData);
        } else {
          setPosts(prev => [...prev, ...postsWithData]);
        }
        
        setHasMore(postsData.length === postsPerPage);
      }
    } catch (error) {
      console.error("Error fetching new posts:", error);
    }
  };

  const fetchTopPosts = async (reset = true) => {
    try {
      const currentLength = reset ? 0 : posts.length;
      const { data: postsData } = await supabase
        .from("posts" as any)
        .select("*, communities(name)")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .range(currentLength, currentLength + postsPerPage - 1);

      if (postsData) {
        const postsWithData = await enrichPostsWithData(postsData);
        const sorted = postsWithData.sort((a, b) => {
          const scoreA = (a.vote_score || 0) + (a.comment_count || 0);
          const scoreB = (b.vote_score || 0) + (b.comment_count || 0);
          return scoreB - scoreA;
        });
        
        if (reset) {
          setPosts(sorted);
        } else {
          setPosts(prev => [...prev, ...sorted]);
        }
        
        setHasMore(postsData.length === postsPerPage);
      }
    } catch (error) {
      console.error("Error fetching top posts:", error);
    }
  };

  const fetchRisingPosts = async (reset = true) => {
    try {
      const currentLength = reset ? 0 : posts.length;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: postsData } = await supabase
        .from("posts" as any)
        .select("*, communities(name)")
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .range(currentLength, currentLength + postsPerPage - 1);

      if (postsData) {
        const postsWithData = await enrichPostsWithData(postsData);
        // Rising: Recent posts with high engagement velocity
        const sorted = postsWithData.sort((a, b) => {
          const ageA = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
          const ageB = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
          
          const velocityA = ((a.vote_score || 0) + (a.comment_count || 0)) / Math.max(ageA, 1);
          const velocityB = ((b.vote_score || 0) + (b.comment_count || 0)) / Math.max(ageB, 1);
          return velocityB - velocityA;
        });
        
        if (reset) {
          setPosts(sorted);
        } else {
          setPosts(prev => [...prev, ...sorted]);
        }
        
        setHasMore(postsData.length === postsPerPage);
      }
    } catch (error) {
      console.error("Error fetching rising posts:", error);
    }
  };

  const fetchControversialPosts = async (reset = true) => {
    try {
      const currentLength = reset ? 0 : posts.length;
      const { data: postsData } = await supabase
        .from("posts" as any)
        .select("*, communities(name)")
        .order("created_at", { ascending: false })
        .range(currentLength, currentLength + postsPerPage - 1);

      if (postsData) {
        const postsWithData = await enrichPostsWithData(postsData);
        
        // Get upvote and downvote counts for controversy calculation
        const postsWithVotes = await Promise.all(
          postsWithData.map(async (post) => {
            const { data: votes } = await supabase
              .from("votes")
              .select("vote_type")
              .eq("post_id", post.id);
            
            const upvotes = (votes || []).filter(v => v.vote_type === 1).length;
            const downvotes = (votes || []).filter(v => v.vote_type === -1).length;
            
            return { ...post, upvotes, downvotes };
          })
        );
        
        // Controversial: Posts with high engagement but balanced votes
        const sorted = postsWithVotes.sort((a, b) => {
          const totalA = a.upvotes + a.downvotes;
          const totalB = b.upvotes + b.downvotes;
          
          if (totalA < 5) return 1; // Need minimum votes
          if (totalB < 5) return -1;
          
          // Balance score: closer to 0.5 is more controversial
          const balanceA = Math.abs(0.5 - (a.upvotes / totalA));
          const balanceB = Math.abs(0.5 - (b.upvotes / totalB));
          
          // Multiply by total engagement for weight
          const scoreA = (1 - balanceA) * totalA;
          const scoreB = (1 - balanceB) * totalB;
          
          return scoreB - scoreA;
        });
        
        if (reset) {
          setPosts(sorted);
        } else {
          setPosts(prev => [...prev, ...sorted]);
        }
        
        setHasMore(postsData.length === postsPerPage);
      }
    } catch (error) {
      console.error("Error fetching controversial posts:", error);
    }
  };

  const enrichPostsWithData = async (postsData: any[]) => {
    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, total_karma")
      .in("user_id", userIds);

    const profilesMap = new Map(
      (profilesData || []).map((p: any) => [p.user_id, p])
    );

    const postsWithStats = await Promise.all(
      postsData.map(async (post: any) => {
        const [voteScore, comments] = await Promise.all([
          supabase
            .rpc('get_post_vote_score', { post_id_param: post.id }),
          supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id),
        ]);
        return {
          ...post,
          profiles: profilesMap.get(post.user_id) || null,
          vote_score: (voteScore.data as number) || 0,
          comment_count: comments.count || 0,
        };
      })
    );
    return postsWithStats;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleSharePost = async (postId: string) => {
    const postUrl = `${window.location.origin}/forum/post/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.communities?.name.toLowerCase().includes(query) ||
      (post.profiles?.display_name || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
            {/* Create Post Card - Moved to Top */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userProfile?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CreatePostDialog onPostCreated={fetchData}>
                  <Button variant="outline" className="flex-1 justify-start text-muted-foreground">
                    What's on your mind?
                  </Button>
                </CreatePostDialog>
              </div>
            </Card>

            {/* Search Bar and Browse Communities */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, communities, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showCommunities ? "default" : "outline"}
                onClick={() => setShowCommunities(!showCommunities)}
              >
                Browse Communities
              </Button>
            </div>

            {/* Filter Tabs - Only show when not browsing communities */}
            {!showCommunities && (
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <Button
                  variant={activeTab === "hot" ? "default" : "outline"}
                  onClick={() => setActiveTab("hot")}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Hot
                </Button>
                <Button
                  variant={activeTab === "new" ? "default" : "outline"}
                  onClick={() => setActiveTab("new")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  New
                </Button>
                <Button
                  variant={activeTab === "rising" ? "default" : "outline"}
                  onClick={() => setActiveTab("rising")}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Rising
                </Button>
                <Button
                  variant={activeTab === "top" ? "default" : "outline"}
                  onClick={() => setActiveTab("top")}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Top
                </Button>
                <Button
                  variant={activeTab === "controversial" ? "default" : "outline"}
                  onClick={() => setActiveTab("controversial")}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Controversial
                </Button>
              </div>
            )}

            {/* Communities View or Posts Feed */}
            {showCommunities ? (
              <>
                <Button variant="ghost" onClick={() => setShowCommunities(false)} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Feed
                </Button>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">All Communities</h2>
                    <CreateCommunityDialog onCommunityCreated={fetchCommunities} />
                  </div>
                  <CommunitiesList communities={communities} onJoinToggle={fetchCommunities} />
                </Card>
              </>
            ) : (
              <>
                {/* Posts Feed Section */}
                {loading ? (
                  /* Improved: Skeleton loading instead of plain text */
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4 animate-pulse">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Header skeleton */}
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-20 bg-muted rounded" />
                              <div className="h-3 w-3 bg-muted rounded-full" />
                              <div className="h-3 w-24 bg-muted rounded" />
                              <div className="h-3 w-3 bg-muted rounded-full" />
                              <div className="h-3 w-16 bg-muted rounded" />
                            </div>
                            {/* Title skeleton */}
                            <div className="h-5 bg-muted rounded w-3/4" />
                            {/* Content skeleton */}
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-full" />
                              <div className="h-4 bg-muted rounded w-2/3" />
                            </div>
                            {/* Actions skeleton */}
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
                ) : filteredPosts.length === 0 ? (
                  /* Improved: Better empty state with icon and action */
                  <Card className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? "No results found" : "No posts yet"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                      {searchQuery 
                        ? `No posts match "${searchQuery}". Try a different search term.`
                        : "Be the first to start a discussion in this community!"
                      }
                    </p>
                    {!searchQuery && (
                      <CreatePostDialog onPostCreated={fetchData}>
                        <Button>Create First Post</Button>
                      </CreatePostDialog>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/forum/post/${post.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        {/* Post Header */}
                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground flex-wrap">
                          {post.is_live && (
                            <LiveThreadIndicator postId={post.id} isLive={true} />
                          )}
                          {post.is_pinned && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </Badge>
                          )}
                          {post.is_locked && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </Badge>
                          )}
                          {post.is_archived && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Archive className="w-3 h-3" />
                              Archived
                            </Badge>
                          )}
                          {post.communities && (
                            <span 
                              className="text-primary font-medium cursor-pointer hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/forum/community/${post.community_id}`);
                              }}
                            >
                              {post.communities.name}
                            </span>
                          )}
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <span>
                              Posted by{" "}
                              <span 
                                className={!post.is_anonymous ? "text-primary font-medium cursor-pointer hover:underline" : ""}
                                onClick={(e) => {
                                  if (!post.is_anonymous) {
                                    e.stopPropagation();
                                    navigate(`/user/${post.user_id}`);
                                  }
                                }}
                              >
                                {post.is_anonymous
                                  ? post.anonymous_name || "Anonymous"
                                  : post.profiles?.display_name || "User"}
                              </span>
                            </span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>

                        {/* Post Content */}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {post.content.split("\n")[0]}
                        </h3>
                        {post.content.split("\n").length > 1 && (
                          <p className="text-muted-foreground line-clamp-3">
                            {post.content.split("\n").slice(1).join("\n")}
                          </p>
                        )}

                        {post.media_items && post.media_items.length > 0 ? (
                          <MediaCarousel mediaItems={post.media_items} />
                        ) : (
                          <MediaPreview
                            mediaUrl={post.media_url}
                            mediaType={post.media_type}
                            linkPreview={post.link_preview}
                          />
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                          <div onClick={(e) => e.stopPropagation()}>
                            <VoteButtons postId={post.id} orientation="horizontal" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/forum/post/${post.id}`);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comment_count || 0}
                          </Button>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ReportDialog targetType="post" targetId={post.id} />
                          </div>
                          {isModerator && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <ModerationMenu
                                type="post"
                                itemId={post.id}
                                userId={post.user_id}
                                isPinned={post.is_pinned}
                                isLocked={post.is_locked}
                                isArchived={post.is_archived}
                                onUpdate={fetchData}
                              />
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSharePost(post.id);
                            }}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Load More Button - Only show when viewing posts */}
            {!showCommunities && !loading && posts.length > 0 && hasMore && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}
              </>
            )}

        </div>
      </div>
    </div>
  );
};
