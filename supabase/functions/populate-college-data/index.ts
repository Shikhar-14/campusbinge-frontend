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

    const { action, data } = await req.json();

    console.log(`Populate college data action: ${action}`);

    switch (action) {
      case "add_college": {
        const { error } = await supabase.from("colleges").insert(data);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: "College added successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_course": {
        const { error } = await supabase.from("college_courses").insert(data);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: "Course added successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_placement": {
        const { error } = await supabase.from("college_placements").insert(data);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: "Placement data added successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_entrance_exam": {
        const { error } = await supabase.from("entrance_exams").insert(data);
        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true, message: "Entrance exam added successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "bulk_import": {
        // Import multiple records at once
        const { colleges, courses, placements } = data;
        
        if (colleges?.length) {
          const { error } = await supabase.from("colleges").insert(colleges);
          if (error) throw error;
        }
        
        if (courses?.length) {
          const { error } = await supabase.from("college_courses").insert(courses);
          if (error) throw error;
        }
        
        if (placements?.length) {
          const { error } = await supabase.from("college_placements").insert(placements);
          if (error) throw error;
        }

        return new Response(
          JSON.stringify({ success: true, message: "Bulk import completed successfully" }),
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
    console.error("Error in populate-college-data function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
