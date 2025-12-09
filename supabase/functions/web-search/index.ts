import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, numResults = 5, searchType = "general" } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not configured");
    }

    console.log(`Searching web for: ${query} (type: ${searchType})`);

    // Call Tavily Search API with enhanced parameters
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: searchType === "academic" ? "advanced" : "basic",
        max_results: numResults,
        include_answer: true,
        include_raw_content: false,
        include_domains: [], // Can specify trusted domains if needed
        exclude_domains: [], // Can exclude unreliable sources
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tavily API error:", response.status, errorText);
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format results for AI consumption with rich metadata
    const formattedResults = {
      query: query,
      answer: data.answer || null, // Tavily's direct answer if available
      results: data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        published_date: result.published_date || null,
      })) || [],
      searchMetadata: {
        timestamp: new Date().toISOString(),
        resultsCount: data.results?.length || 0,
        searchType: searchType,
      },
      sources: data.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        domain: new URL(r.url).hostname,
      })) || [],
    };

    console.log(`Found ${formattedResults.results.length} results from web search`);

    return new Response(
      JSON.stringify(formattedResults),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in web-search function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
