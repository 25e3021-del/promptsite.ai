
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Code2, Eye, Download, History, Layout, Monitor, Copy, 
  Trash2, ChevronRight, Globe, AlertTriangle, RefreshCw, 
  Image as ImageIcon, Sliders, X, Smartphone, Tablet, Laptop,
  Upload, Sparkles, Wand2, Settings2
} from 'lucide-react';
import { WebsiteFiles, ActiveTab, HistoryItem, TemplateType, ModelConfig } from './types';
import { generateWebsite, generateImagePlaceholder } from './services/geminiService';
import Editor from './components/Editor';
import Preview from './components/Preview';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [files, setFiles] = useState<WebsiteFiles>({
    html: '<!-- Use the Studio to generate a site -->',
    css: '/* Styles will appear here */',
    js: '// Script will appear here'
  });
  
  const [studioConfig, setStudioConfig] = useState<ModelConfig>({
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    systemInstruction: ''
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prompt_site_studio_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !attachedImage) return;
    setIsLoading(true);
    setError(null);
    try {
      const generated = await generateWebsite(prompt, studioConfig, attachedImage || undefined);
      setFiles(generated);
      const newHistory: HistoryItem = {
        id: Date.now().toString(),
        prompt: prompt || 'Vision Task',
        timestamp: Date.now(),
        files: generated,
        imagePreview: attachedImage || undefined
      };
      setHistory(prev => [newHistory, ...prev].slice(0, 10));
      localStorage.setItem('prompt_site_studio_history', JSON.stringify([newHistory, ...history].slice(0, 10)));
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || "Studio experienced a glitch. Try reducing complexity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
    const zip = new JSZip();
    zip.file("index.html", files.html);
    zip.file("styles.css", files.css);
    zip.file("script.js", files.js);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studio-project.zip";
    a.click();
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      
      {/* --- Left Sidebar: Studio Controls --- */}
      <aside className="w-80 border-r border-zinc-800 flex flex-col bg-[#09090b]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 fill-blue-500/20" size={20} />
            <h1 className="font-bold tracking-tight text-sm">GEMINI STUDIO</h1>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className={`p-1.5 rounded-md transition-colors ${showAdvanced ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-zinc-800 text-zinc-500'}`}>
            <Settings2 size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Prompt Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Design Intent</label>
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-zinc-600"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 rounded-md ${attachedImage ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <ImageIcon size={14} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
            
            {attachedImage && (
              <div className="relative group rounded-lg overflow-hidden border border-zinc-800">
                <img src={attachedImage} className="w-full h-20 object-cover opacity-60" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black"
                >
                  <X size={10} />
                </button>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-bold uppercase bg-black/60 px-2 py-1 rounded">Visual Context Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Parameters Panel */}
          {showAdvanced && (
            <div className="space-y-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Model</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs"
                  value={studioConfig.model}
                  onChange={e => setStudioConfig({...studioConfig, model: e.target.value as any})}
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro (Precise)</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Temperature</label>
                  <span className="text-[10px] font-mono">{studioConfig.temperature}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  className="w-full accent-blue-500" 
                  value={studioConfig.temperature}
                  onChange={e => setStudioConfig({...studioConfig, temperature: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">System Instructions</label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs h-20 resize-none font-mono"
                  placeholder="e.g. Always use Glassmorphism..."
                  value={studioConfig.systemInstruction}
                  onChange={e => setStudioConfig({...studioConfig, systemInstruction: e.target.value})}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !attachedImage)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 group"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <>
                <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                <span>Run Studio</span>
              </>
            )}
          </button>

          {/* History */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timeline</label>
            <div className="space-y-2">
              {history.map(item => (
                <button 
                  key={item.id}
                  onClick={() => {setFiles(item.files); setPrompt(item.prompt);}}
                  className="w-full p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-blue-500/30 transition-all text-left group"
                >
                  <p className="text-[11px] font-medium text-zinc-400 truncate group-hover:text-zinc-200">{item.prompt}</p>
                  <span className="text-[9px] text-zinc-600 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Workspace --- */}
      <main className="flex-1 flex flex-col bg-[#0c0c0e]">
        
        {/* Workspace Toolbar */}
        <nav className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between">
          <div className="flex h-full">
            {[
              { id: 'preview', icon: Eye, label: 'Live' },
              { id: 'html', icon: Globe, label: 'HTML' },
              { id: 'css', icon: Code2, label: 'CSS' },
              { id: 'js', icon: Zap, label: 'JS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 text-xs font-semibold transition-all relative ${
                  activeTab === tab.id ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {activeTab === 'preview' && (
              <div className="flex items-center bg-zinc-900 rounded-lg p-1 gap-1 border border-zinc-800">
                <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-600'}`}><Smartphone size={14} /></button>
                <button onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-600'}`}><Tablet size={14} /></button>
                <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-600'}`}><Laptop size={14} /></button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-950 rounded-md text-[11px] font-bold hover:bg-white transition-all">
                <Download size={14} /> EXPORT
              </button>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950 p-8">
              <div className={`transition-all duration-500 bg-white shadow-2xl rounded-sm overflow-hidden ${
                previewDevice === 'mobile' ? 'w-[375px] h-[667px]' : 
                previewDevice === 'tablet' ? 'w-[768px] h-[1024px]' : 'w-full h-full'
              }`}>
                <Preview files={files} />
              </div>
            </div>
          ) : (
            <div className="h-full">
              <Editor 
                value={activeTab === 'html' ? files.html : activeTab === 'css' ? files.css : files.js} 
                language={activeTab === 'js' ? 'javascript' : activeTab as any}
                onChange={(val) => setFiles({...files, [activeTab]: val})}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
