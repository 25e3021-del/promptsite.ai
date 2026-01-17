
export interface WebsiteFiles {
  html: string;
  css: string;
  js: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  files: WebsiteFiles;
}

export type ActiveTab = 'html' | 'css' | 'js' | 'preview';

export enum TemplateType {
  LANDING = 'Landing Page',
  PORTFOLIO = 'Portfolio',
  SAAS = 'SaaS Product',
  ECOMMERCE = 'E-commerce'
}
