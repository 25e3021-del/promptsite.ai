
export interface WebsiteFiles {
  html: string;
  css: string;
  js: string;
}

export interface ModelConfig {
  temperature: number;
  systemInstruction: string;
  model: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  files: WebsiteFiles;
  imagePreview?: string;
}

export type ActiveTab = 'html' | 'css' | 'js' | 'preview' | 'assets';

export enum TemplateType {
  LANDING = 'Landing Page',
  PORTFOLIO = 'Portfolio',
  SAAS = 'SaaS Product',
  ECOMMERCE = 'E-commerce'
}
