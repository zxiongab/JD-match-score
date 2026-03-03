import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  keywords: {
    matched: string[];
    missing: string[];
  };
}

export interface SimplifyMatchResult {
  score: number;
  matchedKeywords: number;
  totalKeywords: number;
  summary: string;
  worthApplying: boolean;
}

export async function simplifyAnalyze(resume: string, jd: string): Promise<SimplifyMatchResult> {
  const prompt = `
    Analyze the match between this Resume and Job Description like the Simplify extension.
    
    JD: ${jd.substring(0, 3000)}
    Resume: ${resume.substring(0, 3000)}

    Return a JSON object:
    {
      "score": number (0-100),
      "matchedKeywords": number,
      "totalKeywords": number,
      "summary": "Short summary of match",
      "worthApplying": boolean
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          matchedKeywords: { type: Type.NUMBER },
          totalKeywords: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          worthApplying: { type: Type.BOOLEAN }
        },
        required: ["score", "matchedKeywords", "totalKeywords", "summary", "worthApplying"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      score: 0,
      matchedKeywords: 0,
      totalKeywords: 0,
      summary: "Analysis failed",
      worthApplying: false
    };
  }
}
