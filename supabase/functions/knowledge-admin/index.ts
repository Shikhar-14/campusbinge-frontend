import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, table, data, id } = await req.json();

    console.log(`Knowledge admin action: ${action} on table: ${table}`);

    // Validate table name
    const allowedTables = ["knowledge_base", "faqs", "career_paths"];
    if (!allowedTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: "Invalid table name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "create": {
        const { data: result, error } = await supabase.from(table).insert(data).select();
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "read": {
        let query = supabase.from(table).select("*");
        if (id) query = query.eq("id", id);
        const { data: result, error } = await query;
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID is required for update" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: result, error } = await supabase
          .from(table)
          .update(data)
          .eq("id", id)
          .select();
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID is required for delete" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: "Record deleted successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "search": {
        const { searchQuery, category } = data;
        let query = supabase.from(table).select("*");
        
        if (table === "knowledge_base" && searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }
        if (table === "faqs" && searchQuery) {
          query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
        }
        if (table === "career_paths" && searchQuery) {
          query = query.ilike("career_title", `%${searchQuery}%`);
        }
        
        if (category) {
          query = query.eq("category", category);
        }

        const { data: result, error } = await query;
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in knowledge-admin function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
