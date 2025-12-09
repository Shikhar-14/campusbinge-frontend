import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCommunityMembership = (communityId: string) => {
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkMembership();
    fetchMemberCount();

    // Real-time subscription for member count
    const channel = supabase
      .channel(`community-members-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_members',
          filter: `community_id=eq.${communityId}`
        },
        () => fetchMemberCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", communityId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsMember(!!data);
    setLoading(false);
  };

  const fetchMemberCount = async () => {
    const { count } = await supabase
      .from("community_members")
      .select("*", { count: "exact", head: true })
      .eq("community_id", communityId);
    setMemberCount(count || 0);
  };

  const toggleMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to join communities", variant: "destructive" });
      return;
    }

    try {
      if (isMember) {
        await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);
        setIsMember(false);
        toast({ title: "Left community" });
      } else {
        await supabase.from("community_members").insert({
          community_id: communityId,
          user_id: user.id,
        });
        setIsMember(true);
        toast({ title: "Joined community!" });
      }
    } catch (error) {
      console.error("Error toggling membership:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update membership", 
        variant: "destructive" 
      });
    }
  };

  return {
    isMember,
    memberCount,
    loading,
    toggleMembership,
  };
};
