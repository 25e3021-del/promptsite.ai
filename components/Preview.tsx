
import React, { useMemo } from 'react';
import { WebsiteFiles } from '../types';

interface PreviewProps {
  files: WebsiteFiles;
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const combinedContent = useMemo(() => {
    const { html, css, js } = files;
    
    // Improved injection logic to handle varying HTML structures
    let srcDoc = html;
    
    const styleTag = `
      <style>
        ${css}
        /* Studio Reset */
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      </style>`;
      
    const scriptTag = `
      <script>
        window.onerror = function(msg, url, line) {
          console.error("Studio Runtime Error: " + msg + " (line " + line + ")");
        };
        try {
          ${js}
        } catch(e) {
          console.error("JS Execution Failed:", e);
        }
      </script>`;

    if (srcDoc.includes('</head>')) {
      srcDoc = srcDoc.replace('</head>', `${styleTag}</head>`);
    } else {
      srcDoc = styleTag + srcDoc;
    }

    if (srcDoc.includes('</body>')) {
      srcDoc = srcDoc.replace('</body>', `${scriptTag}</body>`);
    } else {
      srcDoc = srcDoc + scriptTag;
    }

    return srcDoc;
  }, [files]);

  return (
    <div className="w-full h-full bg-white relative">
      <iframe
        title="Studio Preview"
        srcDoc={combinedContent}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals allow-forms allow-popups"
      />
    </div>
  );
};

export default Preview;
