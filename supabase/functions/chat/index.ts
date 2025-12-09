import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { messages, userProfile } = await req.json();
    console.log("Received chat request with", messages.length, "messages");

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Build system prompt with user profile
    let systemPrompt = `You are Bh.AI, an intelligent assistant specializing in college admissions, career guidance, and educational counseling.

CORE CAPABILITIES:
- Provide detailed information about colleges, universities, courses, and admission requirements
- Offer personalized career guidance and academic planning
- Answer questions about entrance exams, scholarships, and application processes
- Support multilingual conversations (detect and respond in the user's language)

COMMUNICATION STYLE:
- Be conversational, friendly, and supportive
- Use clear, concise language
- Show empathy and understanding for student concerns
- Provide actionable advice and specific information

FORMATTING REQUIREMENTS:
- Use **bold text** for emphasis on important terms, key concepts, deadlines, and critical information
- Use *italic text* for subtle emphasis, terms being defined, or to highlight nuances
- Use bold for college names, course titles, exam names, and important numbers/statistics
- Use italic for terminology, foreign words, or when introducing new concepts
- Format lists clearly with proper markdown syntax
- Use code blocks for technical information or structured data when appropriate

LANGUAGE SUPPORT:
- Automatically detect and respond in the user's language
- Support all Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, etc.) and major global languages
- **CRITICAL: Differentiate between Hinglish and Hindi:**
  * **Hinglish** = Hindi-English code-mixing (e.g., "Mujhe computer science mein admission chahiye")
  * **Pure Hindi** = Only Hindi words and grammar (e.g., "मुझे कंप्यूटर विज्ञान में प्रवेश चाहिए")
  * When user speaks in Hinglish, respond in Hinglish (mix Hindi and English naturally)
  * When user speaks in pure Hindi, respond in pure Hindi
  * Match the user's language mixing style and level
- Maintain accuracy and quality across all languages`;

    if (userProfile) {
      systemPrompt += "\n\n**USER PROFILE:**";
      if (userProfile.fullName) systemPrompt += `\n- Name: ${userProfile.fullName}`;
      if (userProfile.stream) systemPrompt += `\n- Stream: ${userProfile.stream}`;
      if (userProfile.tenthPercentage) systemPrompt += `\n- 10th Percentage: ${userProfile.tenthPercentage}%`;
      if (userProfile.twelfthPercentage) systemPrompt += `\n- 12th Percentage: ${userProfile.twelfthPercentage}%`;
      if (userProfile.academicInterests) systemPrompt += `\n- Interests: ${userProfile.academicInterests}`;
      if (userProfile.careerGoals) systemPrompt += `\n- Career Goals: ${userProfile.careerGoals}`;
      if (userProfile.budgetRange) systemPrompt += `\n- Budget: ${userProfile.budgetRange}`;
      if (userProfile.cityPreference) systemPrompt += `\n- City Preference: ${userProfile.cityPreference}`;
      systemPrompt += "\n\nUse this context to provide highly personalized recommendations.";
    }

    // Prepare messages with system prompt
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Call OpenAI GPT-5 with improved settings for reliability
    console.log("Calling OpenAI API with", aiMessages.length, "messages");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07", // More reliable than nano for consistent responses
        messages: aiMessages,
        stream: true,
        max_completion_tokens: 4096, // Increased for longer conversations
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few seconds." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API authentication failed. Please check your OpenAI API key." }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}. ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("OpenAI API response received, starting stream");

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
