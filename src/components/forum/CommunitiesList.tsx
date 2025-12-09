import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Community = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  member_count: number;
};

interface CommunitiesListProps {
  communities: Community[];
  onJoinToggle?: () => void;
}

export const CommunitiesList = ({ communities, onJoinToggle }: CommunitiesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [membershipMap, setMembershipMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkMemberships();
  }, [communities]);

  const checkMemberships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || communities.length === 0) return;

      const { data } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id)
        .in("community_id", communities.map(c => c.id));

      const memberships: Record<string, boolean> = {};
      data?.forEach(m => {
        memberships[m.community_id] = true;
      });
      setMembershipMap(memberships);
    } catch (error) {
      console.error("Error checking memberships:", error);
    }
  };

  const handleJoinToggle = async (communityId: string, isMember: boolean) => {
    setLoading(prev => ({ ...prev, [communityId]: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join communities",
          variant: "destructive",
        });
        return;
      }

      if (isMember) {
        // Leave community
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Left community",
          description: "You have left the community",
        });
      } else {
        // Join community
        const { error } = await supabase
          .from("community_members")
          .insert({
            community_id: communityId,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Joined community",
          description: "You have joined the community",
        });
      }

      setMembershipMap(prev => ({
        ...prev,
        [communityId]: !isMember,
      }));

      if (onJoinToggle) {
        onJoinToggle();
      }
    } catch (error) {
      console.error("Error toggling membership:", error);
      toast({
        title: "Error",
        description: "Failed to update membership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [communityId]: false }));
    }
  };

  if (communities.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No communities yet. Create the first one!
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => {
        const isMember = membershipMap[community.id];
        const isLoading = loading[community.id];

        return (
          <Card
            key={community.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/forum/community/${community.id}`)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{community.icon || "📁"}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{community.name}</h3>
                {community.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {community.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{community.member_count}</span>
              </div>
              <Button
                size="sm"
                variant={isMember ? "secondary" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinToggle(community.id, isMember);
                }}
                disabled={isLoading}
              >
                {isMember ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Joined
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
