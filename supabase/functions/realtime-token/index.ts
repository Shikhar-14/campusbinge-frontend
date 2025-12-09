import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log("Requesting ephemeral token from OpenAI...");

    // Build personalized context from user profile
    let profileContext = "";
    if (userProfile) {
      profileContext = `\n\nUSER PROFILE CONTEXT:`;
      if (userProfile.fullName) profileContext += `\n- Name: ${userProfile.fullName}`;
      if (userProfile.academicInterests) profileContext += `\n- Academic Interests: ${userProfile.academicInterests}`;
      if (userProfile.careerGoals) profileContext += `\n- Career Goals: ${userProfile.careerGoals}`;
      if (userProfile.twelfthStream) profileContext += `\n- Stream: ${userProfile.twelfthStream}`;
      if (userProfile.tenthPercentage) profileContext += `\n- 10th Percentage: ${userProfile.tenthPercentage}`;
      if (userProfile.twelfthPercentage) profileContext += `\n- 12th Percentage: ${userProfile.twelfthPercentage}`;
      if (userProfile.entranceExam && userProfile.entranceScore) {
        profileContext += `\n- Entrance Exam: ${userProfile.entranceExam} (Score: ${userProfile.entranceScore})`;
      }
      if (userProfile.cityPreference) profileContext += `\n- City Preference: ${userProfile.cityPreference}`;
      if (userProfile.budgetRange) profileContext += `\n- Budget Range: ${userProfile.budgetRange}`;
      if (userProfile.extraCurricular && userProfile.extraCurricular.length > 0) {
        profileContext += `\n- Extra Curricular: ${userProfile.extraCurricular.join(", ")}`;
      }
      profileContext += `\n\nUse this context to provide highly personalized recommendations and guidance.`;
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17", // Using latest available realtime model
        voice: "alloy",
        instructions: `You are Bh.AI, an intelligent assistant specializing in college admissions, career guidance, and educational counseling.${profileContext}

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

LANGUAGE SUPPORT:
- Automatically detect and respond in the user's language
- Support all Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, etc.) and major global languages
- **CRITICAL: Differentiate between Hinglish and Hindi:**
  * **Hinglish** = Hindi-English code-mixing (e.g., "Mujhe computer science mein admission chahiye" or "Kya aap college options bata sakte ho?")
  * **Pure Hindi** = Only Hindi words and grammar (e.g., "मुझे कंप्यूटर विज्ञान में प्रवेश चाहिए")
  * When user speaks in Hinglish, respond in Hinglish (mix Hindi and English naturally)
  * When user speaks in pure Hindi, respond in pure Hindi
  * Match the user's language mixing style and level
- Maintain accuracy and quality across all languages

When discussing colleges or careers, provide comprehensive, up-to-date information while being encouraging and supportive of the student's goals.`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
