import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RSS feeds from major Indian news sources - education and general news
const RSS_FEEDS = [
  // Education-specific feeds
  "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", // Times of India - Education
  "https://indianexpress.com/section/education/feed/", // Indian Express - Education
  "https://www.hindustantimes.com/feeds/rss/education/rssfeed.xml", // Hindustan Times - Education
  "https://www.ndtv.com/education/rss", // NDTV Education
  
  // General news feeds (will be filtered for student content)
  "https://www.thehindu.com/news/national/feeder/default.rss", // The Hindu - National
  "https://feeds.feedburner.com/ndtvnews-top-stories", // NDTV Top Stories
  "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", // Times of India - Top Stories
  "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", // Hindustan Times - India
];

// Comprehensive keywords for student-relevant content in Indian context
const STUDENT_KEYWORDS = [
  // General education
  'student', 'students', 'college', 'colleges', 'university', 'universities', 
  'education', 'educational', 'school', 'schools', 'campus', 'learn', 'learning',
  
  // Indian education system
  'iit', 'nit', 'iim', 'aiims', 'neet', 'jee', 'cat', 'gate', 'upsc', 'ssc',
  'cbse', 'icse', 'board', 'ugc', 'aicte', 'naac',
  
  // Academic activities
  'exam', 'exams', 'examination', 'admission', 'admissions', 'entrance',
  'course', 'courses', 'degree', 'diploma', 'bachelor', 'masters', 'phd',
  'semester', 'academic', 'curriculum', 'syllabus',
  
  // Student life & opportunities
  'scholarship', 'scholarships', 'fellowship', 'stipend', 'fee', 'tuition',
  'placement', 'placements', 'internship', 'internships', 'campus placement',
  'recruitment', 'career', 'job fair', 'hiring',
  
  // Results & performance
  'result', 'results', 'marks', 'score', 'grade', 'grades', 'rank', 'topper',
  'merit', 'cutoff', 'percentile',
  
  // Educational events
  'convocation', 'fest', 'competition', 'olympiad', 'debate', 'workshop',
  'seminar', 'conference', 'research',
];

// Exclude certain keywords to filter out non-student news
const EXCLUDE_KEYWORDS = [
  'murder', 'rape', 'suicide', 'accident', 'death', 'killed', 'arrested',
  'politics', 'election', 'minister', 'party', 'bjp', 'congress',
  'cricket', 'football', 'sports score', 'match', 'ipl',
];

function isStudentRelevant(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();
  
  // Check if contains excluded keywords
  const hasExcluded = EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword));
  if (hasExcluded) return false;
  
  // Check if contains student-relevant keywords
  return STUDENT_KEYWORDS.some(keyword => text.includes(keyword));
}

function extractTextBetween(str: string, start: string, end: string): string {
  const startIndex = str.indexOf(start);
  if (startIndex === -1) return "";
  const endIndex = str.indexOf(end, startIndex + start.length);
  if (endIndex === -1) return "";
  return str.substring(startIndex + start.length, endIndex);
}

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function parseRSSFeed(url: string) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    const articles = [];
    const items = text.split("<item>");
    
    for (let i = 1; i < items.length && i <= 8; i++) {
      const item = items[i];
      
      const title = cleanHTML(extractTextBetween(item, "<title>", "</title>"));
      const description = cleanHTML(extractTextBetween(item, "<description>", "</description>"));
      const link = extractTextBetween(item, "<link>", "</link>").trim();
      const pubDate = extractTextBetween(item, "<pubDate>", "</pubDate>");
      
      // Try to extract image URL
      let imageUrl = "";
      const imgMatch = item.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      } else {
        const mediaMatch = item.match(/url="([^"]+)"/);
        if (mediaMatch) imageUrl = mediaMatch[1];
      }
      
      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop";
      }
      
      const cleanDesc = description.substring(0, 180);
      
      // Only include student-relevant articles
      if (title && link && cleanDesc && isStudentRelevant(title, description)) {
        articles.push({
          title: title.substring(0, 100),
          description: cleanDesc,
          url: link,
          urlToImage: imageUrl,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: { name: new URL(url).hostname.replace("www.", "").split(".")[0].toUpperCase() }
        });
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching news from RSS feeds...");
    
    // Fetch all RSS feeds in parallel
    const allArticles = await Promise.all(
      RSS_FEEDS.map(feed => parseRSSFeed(feed))
    );
    
    // Combine articles
    const combinedArticles = allArticles.flat();
    
    // Sort by published date (newest first)
    combinedArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Return top 12 articles
    const topArticles = combinedArticles.slice(0, 12);
    
    console.log(`Successfully fetched ${topArticles.length} articles`);
    
    return new Response(
      JSON.stringify({ 
        articles: topArticles,
        status: "ok"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch news",
        articles: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
