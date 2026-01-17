
import React from 'react';

interface EditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript';
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, language, onChange }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e293b] overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-slate-700 bg-slate-900/50 justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {language === 'javascript' ? 'script.js' : language === 'css' ? 'styles.css' : 'index.html'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full bg-transparent text-slate-300 p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        placeholder={`Write your ${language} here...`}
      />
    </div>
  );
};

export default Editor;
