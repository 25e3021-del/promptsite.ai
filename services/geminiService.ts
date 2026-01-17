
import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteFiles, ModelConfig } from "../types";

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an expert full-stack web developer. Your task is to generate complete, production-ready, responsive, and accessible website code.
Guidelines:
1. Always return a valid JSON object with keys: "html", "css", and "js".
2. HTML: Use semantic elements, ARIA labels, and standard head metadata. Reference "styles.css" and "script.js".
3. CSS: Use modern layout techniques (Flexbox/Grid), mobile-first design, and professional color palettes.
4. JS: Functional, clean interactions.
5. Assets: If a screenshot is provided, replicate its layout, style, and spirit as closely as possible.
`;

export const generateWebsite = async (
  prompt: string, 
  config: ModelConfig, 
  imageBase64?: string
): Promise<WebsiteFiles> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: any[] = [];
  
  if (imageBase64) {
    // Handle vision multi-modal
    const [mime, data] = imageBase64.split(';base64,');
    const mimeType = mime.split(':')[1];
    contents.push({
      parts: [
        { inlineData: { data, mimeType } },
        { text: `Replicate this website design based on the image. Context: ${prompt}` }
      ]
    });
  } else {
    contents.push({ parts: [{ text: prompt }] });
  }

  try {
    const response = await ai.models.generateContent({
      model: config.model,
      contents,
      config: {
        systemInstruction: config.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
        temperature: config.temperature,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            js: { type: Type.STRING },
          },
          required: ["html", "css", "js"],
        },
      },
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text.trim());
  } catch (err: any) {
    console.error("Gemini Error:", err);
    throw err;
  }
};

export const generateImagePlaceholder = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Generate a high-quality web asset image: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image asset");
};
