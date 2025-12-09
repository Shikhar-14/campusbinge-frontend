import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserKarma = (userId: string | null | undefined) => {
  const [karma, setKarma] = useState({
    post_karma: 0,
    comment_karma: 0,
    total_karma: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchKarma();

    // Subscribe to karma updates
    const channel = supabase
      .channel(`karma-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setKarma({
            post_karma: newData.post_karma || 0,
            comment_karma: newData.comment_karma || 0,
            total_karma: newData.total_karma || 0,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchKarma = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("post_karma, comment_karma, total_karma")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setKarma({
          post_karma: data.post_karma || 0,
          comment_karma: data.comment_karma || 0,
          total_karma: data.total_karma || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching karma:", error);
    } finally {
      setLoading(false);
    }
  };

  return { ...karma, loading };
};
