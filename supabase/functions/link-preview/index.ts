import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      throw new Error("URL is required");
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      throw new Error("Invalid URL");
    }

    console.log(`Fetching preview for: ${url}`);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract Open Graph meta tags
    const getMetaContent = (property: string): string | null => {
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    // Try multiple meta tag formats
    let title =
      getMetaContent("og:title") ||
      getMetaContent("twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      validUrl.hostname;

    let description =
      getMetaContent("og:description") ||
      getMetaContent("twitter:description") ||
      getMetaContent("description") ||
      "";

    let image =
      getMetaContent("og:image") ||
      getMetaContent("twitter:image") ||
      getMetaContent("image") ||
      "";

    // Make image URL absolute if it's relative
    if (image && !image.startsWith("http")) {
      image = new URL(image, validUrl.origin).toString();
    }

    // Clean up HTML entities
    title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    description = description.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const preview = {
      url: url,
      title: title.trim(),
      description: description.trim().substring(0, 300), // Limit description length
      image: image || null,
      hostname: validUrl.hostname,
    };

    console.log("Preview generated:", preview);

    return new Response(JSON.stringify(preview), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});