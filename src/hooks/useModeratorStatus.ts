import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useModeratorStatus = () => {
  const [isModerator, setIsModerator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkModeratorStatus();
  }, []);

  const checkModeratorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles) {
        const rolesList = roles.map(r => r.role);
        setIsAdmin(rolesList.includes("admin"));
        setIsModerator(rolesList.includes("moderator") || rolesList.includes("admin"));
      }
    } catch (error) {
      console.error("Error checking moderator status:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isModerator, isAdmin, loading };
};
