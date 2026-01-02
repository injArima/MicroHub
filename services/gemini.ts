import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Safely access process.env to avoid "process is not defined" reference errors in browsers
const getApiKey = () => {
    try {
        return process.env.API_KEY || '';
    } catch (e) {
        // process is not defined
        return '';
    }
}

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw error;
  }
};

export const generateImageDescription = async (prompt: string, base64Image: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Gemini Vision Error", error);
        throw error;
    }
}