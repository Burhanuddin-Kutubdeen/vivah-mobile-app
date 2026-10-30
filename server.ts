import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "Vivah Matrimony",
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});

// AI Profile Compatibility Analysis Endpoint
app.post("/api/gemini/match-analysis", async (req, res) => {
  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in environment secrets."
      });
    }

    const { userProfile, candidateProfile } = req.body;

    const prompt = `You are Vivah's expert AI Matrimony Compatibility & Astrological Advisor.
Analyze the compatibility between these two matrimony profiles for marriage.

User Profile:
- Name: ${userProfile?.name || 'User'}
- Age/Height: ${userProfile?.age || '28'} y/o, ${userProfile?.height || "5'8\""}
- Profession: ${userProfile?.profession || 'Software Engineer'}
- Religion/Caste: ${userProfile?.religion || 'Hindu'}, ${userProfile?.caste || 'Brahmin'}
- Rashi/Nakshatra: ${userProfile?.rashi || 'Vrishabha'}, ${userProfile?.nakshatra || 'Rohini'}
- Diet/Lifestyle: ${userProfile?.diet || 'Vegetarian'}, ${userProfile?.lifestyle || 'Non-smoker'}
- Location: ${userProfile?.city || 'Mumbai'}
- Family Background: ${userProfile?.familyType || 'Joint Family'}, ${userProfile?.familyValues || 'Traditional & Modern Blend'}

Candidate Profile:
- Name: ${candidateProfile?.name || 'Candidate'}
- Age/Height: ${candidateProfile?.age} y/o, ${candidateProfile?.height}
- Profession: ${candidateProfile?.profession}
- Religion/Caste: ${candidateProfile?.religion}, ${candidateProfile?.caste}
- Rashi/Nakshatra: ${candidateProfile?.rashi}, ${candidateProfile?.nakshatra}
- Diet/Lifestyle: ${candidateProfile?.diet}, ${candidateProfile?.lifestyle}
- Location: ${candidateProfile?.city}
- Family Background: ${candidateProfile?.familyType}, ${candidateProfile?.familyValues}

Provide a JSON object response with exact keys:
1. "overallCompatibilityPercentage": number (between 70 and 99)
2. "gunaMilanScore": string (e.g. "31/36")
3. "summary": string (2-3 sentences summarizing core synergy)
4. "strengths": string array (3 key matching factors like shared career values, astrological harmony, lifestyle alignment)
5. "considerations": string array (1-2 respectful points for discussion, e.g. relocation, family setup)
6. "astrologicalInsight": string (brief horoscope/guna perspective)

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error("Gemini Match Analysis Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate match analysis" });
  }
});

// AI Bio Generator Endpoint
app.post("/api/gemini/generate-bio", async (req, res) => {
  try {
    const ai = getGeminiAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in environment secrets."
      });
    }

    const { profession, education, hobbies, values, familyType, lookingFor } = req.body;

    const prompt = `Write a graceful, dignified, and compelling Matrimony About Me profile description (bio) in English suitable for an Indian matrimony platform (Vivah).
User Details:
- Profession: ${profession || 'Software Architect'}
- Education: ${education || 'B.Tech in Computer Science'}
- Hobbies/Interests: ${hobbies || 'Travelling, classical music, cooking, fitness'}
- Core Values: ${values || 'Family-oriented, respects traditions while having a progressive mindset'}
- Family Setup: ${familyType || 'Nuclear family with deep rooted warmth'}
- Looking For: ${lookingFor || 'A compassionate, educated, and supportive partner'}

Generate a JSON response with:
{
  "bio": "A well-written 3-paragraph bio summarizing personality, career aspirations, family values, and what they seek in a life partner.",
  "headline": "A short, catchy headline (e.g. 'Software Professional with Warm Family Values & Passion for Travel')"
}
Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Gemini Bio Generator Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to generate bio" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vivah Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
