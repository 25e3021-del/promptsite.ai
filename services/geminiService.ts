import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteFiles } from "../types";

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(fn: () => Promise<any>, maxRetries = 2): Promise<any> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || '';
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && i < maxRetries - 1) {
        const waitTime = Math.pow(3, i) * 2000 + Math.random() * 1000;
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateWebsite = async (prompt: string): Promise<WebsiteFiles> => {
  // Use environment API key exclusively
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  return fetchWithRetry(async () => {
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

      if (!response.text) {
        throw new Error("No code was returned. Please try a different prompt.");
      }

      const result = JSON.parse(response.text.trim());
      return {
        html: result.html || '',
        css: result.css || '',
        js: result.js || '',
      };
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("Quota exceeded. The free tier resets at midnight PT. Please wait or try again later.");
      }
      throw err;
    }
  });
};