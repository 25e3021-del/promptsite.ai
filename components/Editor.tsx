
import React from 'react';

interface EditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript';
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, language, onChange }) => {
  const fileName = language === 'javascript' ? 'script.js' : language === 'css' ? 'styles.css' : 'index.html';
  
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/20 justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
          {fileName}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full bg-transparent text-zinc-300 p-6 font-mono text-[13px] leading-relaxed resize-none focus:outline-none focus:ring-0 placeholder:text-zinc-800 selection:bg-blue-500/30"
        placeholder={`Code for ${fileName} will appear here...`}
      />
    </div>
  );
};

export default Editor;
