
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const generateTONYResponse = async (
  history: Message[],
  userInput: string
) => {
  const ai = getAIClient();
  
  // Format history for Gemini API
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Add the current user input
  contents.push({
    role: 'user',
    parts: [{ text: userInput }]
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Reduced thinking budget for significantly faster response times (approx 2s reasoning)
        thinkingConfig: { thinkingBudget: 1024 },
        temperature: 0.7,
      },
    });

    const fullText = response.text || "";
    
    // Extract suggestions and actual content
    const suggestionMatch = fullText.match(/\[SUGGESTIONS:\s*(\[.*\])\]/);
    let cleanText = fullText;
    let suggestions: string[] = [];

    if (suggestionMatch) {
      cleanText = fullText.replace(suggestionMatch[0], "").trim();
      try {
        suggestions = JSON.parse(suggestionMatch[1]);
      } catch (e) {
        console.error("Failed to parse suggestions", e);
      }
    }

    return {
      content: cleanText,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
