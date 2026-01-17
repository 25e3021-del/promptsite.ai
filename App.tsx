
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Zap, 
  Code2, 
  Eye, 
  Download, 
  RotateCcw, 
  History, 
  Layout, 
  Monitor, 
  Copy,
  Plus,
  Trash2,
  ChevronRight,
  Globe,
  Settings,
  AlertTriangle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { WebsiteFiles, ActiveTab, HistoryItem, TemplateType } from './types';
import { generateWebsite } from './services/geminiService';
import Editor from './components/Editor';
import Preview from './components/Preview';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{message: string, isQuota: boolean, isDaily: boolean} | null>(null);
  const [files, setFiles] = useState<WebsiteFiles>({
    html: '<!-- Click Generate to see magic happen! -->',
    css: '/* Styles will appear here */',
    js: '// Script will appear here'
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('prompt_site_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('prompt_site_history', JSON.stringify(history));
  }, [history]);

  const handleOpenKeySettings = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setErrorInfo(null); 
    } else {
      alert("API Key management is only available in the AI Studio environment.");
    }
  };

  const handleGenerate = async (targetPrompt?: string) => {
    const p = targetPrompt || prompt;
    if (!p.trim()) return;

    setIsLoading(true);
    setErrorInfo(null);
    try {
      const generated = await generateWebsite(p);
      setFiles(generated);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: p,
        timestamp: Date.now(),
        files: generated
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
      setActiveTab('preview');
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
      const isDaily = msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('exhausted');
      setErrorInfo({ message: msg, isQuota, isDaily });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (key: keyof WebsiteFiles, value: string) => {
    setFiles(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = async () => {
    try {
      // @ts-ignore
      const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
      const zip = new JSZip();
      zip.file("index.html", files.html);
      zip.file("styles.css", files.css);
      zip.file("script.js", files.js);
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP Generation Failed:", err);
      alert("Failed to generate ZIP. You can still copy the code manually.");
    }
  };

  const handleCopyCode = () => {
    const textToCopy = 
      activeTab === 'html' ? files.html :
      activeTab === 'css' ? files.css :
      activeTab === 'js' ? files.js : 
      `HTML:\n${files.html}\n\nCSS:\n${files.css}\n\nJS:\n${files.js}`;
    
    navigator.clipboard.writeText(textToCopy);
    alert('Code copied to clipboard!');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setFiles(item.files);
    setPrompt(item.prompt);
    setActiveTab('preview');
    setShowHistory(false);
    setErrorInfo(null);
  };

  const useTemplate = (template: TemplateType) => {
    let templatePrompt = "";
    switch(template) {
      case TemplateType.LANDING: templatePrompt = "A high-conversion landing page for a modern cloud kitchen service with a hero section, menu showcase, and contact form."; break;
      case TemplateType.PORTFOLIO: templatePrompt = "A sleek, minimalist portfolio for a senior product designer with a dark theme, case study grid, and subtle entrance animations."; break;
      case TemplateType.SAAS: templatePrompt = "A feature-rich SaaS marketing page with a pricing table, testimonial carousel, and interactive feature highlights."; break;
      case TemplateType.ECOMMERCE: templatePrompt = "An elegant e-commerce storefront for a high-end sustainable fashion brand with product filters and a responsive cart sidebar."; break;
    }
    setPrompt(templatePrompt);
    handleGenerate(templatePrompt);
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden text-slate-200">
      
      {/* Sidebar / Prompt Panel */}
      <div className="w-1/3 min-w-[380px] border-r border-slate-800 flex flex-col bg-[#0f172a] shadow-xl z-20">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PromptSite <span className="text-blue-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenKeySettings}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              title="API Key Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <History size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {showHistory ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Recent Creations</h3>
                <button 
                  onClick={() => {
                    if(confirm("Clear all history?")) setHistory([]);
                  }} 
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 opacity-50 space-y-2">
                  <RotateCcw size={32} className="mx-auto" />
                  <p className="text-sm">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all group"
                  >
                    <p className="text-sm line-clamp-2 text-slate-300 group-hover:text-white transition-colors">
                      {item.prompt}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Prompt Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold uppercase text-slate-500 tracking-wider">What are we building?</label>
                  <span className="text-xs text-slate-600 font-mono">{prompt.length}/500</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your website..."
                  className="w-full h-40 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none resize-none leading-relaxed"
                />

                {errorInfo && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-xs text-red-200 leading-relaxed font-bold">
                          {errorInfo.isQuota ? (errorInfo.isDaily ? "Daily Quota Exhausted" : "Rate Limit Hit") : "Generation Error"}
                        </p>
                        <p className="text-[11px] text-red-300/80 leading-relaxed italic">
                          {errorInfo.isQuota 
                            ? "The free tier has limits. If this is a daily limit, it will reset at midnight PT. If it's a minute limit, try again in 60 seconds." 
                            : errorInfo.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-1 border-t border-red-500/10">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleGenerate()}
                          className="py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <RefreshCw size={12} /> Retry Now
                        </button>
                        <button 
                          onClick={handleOpenKeySettings}
                          className="py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Settings size={12} /> Change Key
                        </button>
                      </div>
                      <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] text-slate-500 hover:text-slate-400 flex items-center justify-center gap-1 transition-colors underline"
                      >
                        Learn about free tier limits <ExternalLink size={8} />
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleGenerate()}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="fill-white" />
                      <span>Generate Website</span>
                    </>
                  )}
                </button>
              </div>

              {/* Templates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(TemplateType).map((t) => (
                    <button
                      key={t}
                      onClick={() => useTemplate(t)}
                      disabled={isLoading}
                      className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all flex flex-col gap-2 group disabled:opacity-50"
                    >
                      <Layout size={18} className="text-blue-500" />
                      <span className="text-[11px] font-medium">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 text-[10px] text-slate-600 font-mono text-center flex flex-col gap-1">
          <span>Gemini 3 Flash • Daily Quota Managed</span>
          <span className="opacity-50">Resets daily at 12:00 AM PT</span>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        <div className="h-14 bg-slate-900/50 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 h-full">
            {[
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'html', label: 'index.html', icon: Globe },
              { id: 'css', label: 'styles.css', icon: Code2 },
              { id: 'js', label: 'script.js', icon: Code2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`h-full px-4 flex items-center gap-2 text-sm font-medium transition-all relative ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-all"
            >
              <Copy size={14} /> <span className="hidden md:inline">Copy</span>
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium transition-all shadow-lg"
            >
              <Download size={14} /> <span className="hidden md:inline">Export ZIP</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'preview' ? (
            <Preview files={files} />
          ) : (
            <div className="h-full">
              {activeTab === 'html' && (
                <Editor value={files.html} language="html" onChange={(val) => handleFileChange('html', val)} />
              )}
              {activeTab === 'css' && (
                <Editor value={files.css} language="css" onChange={(val) => handleFileChange('css', val)} />
              )}
              {activeTab === 'js' && (
                <Editor value={files.js} language="javascript" onChange={(val) => handleFileChange('js', val)} />
              )}
            </div>
          )}

          {activeTab === 'preview' && files.html.length > 100 && (
            <div className="absolute bottom-6 right-6">
              <button 
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="w-12 h-12 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group disabled:opacity-50"
              >
                <RotateCcw size={20} className={isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
