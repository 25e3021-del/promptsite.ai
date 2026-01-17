
import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteFiles } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert full-stack web developer. Your task is to generate complete, production-ready, responsive, and accessible website code based on user prompts.
Guidelines:
1. Always return a valid JSON object with keys: "html", "css", and "js".
2. HTML: Use semantic elements, ARIA labels, and standard head metadata. Reference "styles.css" and "script.js".
3. CSS: Use modern layout techniques (Flexbox/Grid), mobile-first responsive design, and an attractive color palette.
4. JS: Provide clean, minimal, and functional JavaScript for interactions.
5. Content: Use high-quality realistic placeholder text (no Lorem Ipsum). 
6. Aesthetics: Design should be modern, clean, and SaaS-inspired.
7. Images: Use high-quality placeholders from Unsplash (via https://picsum.photos/...) if images are needed.
`;

export const generateWebsite = async (prompt: string): Promise<WebsiteFiles> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a full website for: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING, description: 'Complete index.html content' },
            css: { type: Type.STRING, description: 'Complete styles.css content' },
            js: { type: Type.STRING, description: 'Complete script.js content' },
          },
          required: ["html", "css", "js"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      html: result.html || '',
      css: result.css || '',
      js: result.js || '',
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate website code. Please check your prompt and try again.");
  }
};
