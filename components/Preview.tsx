
import React, { useMemo } from 'react';
import { WebsiteFiles } from '../types';

interface PreviewProps {
  files: WebsiteFiles;
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const combinedContent = useMemo(() => {
    // Inject CSS and JS into the HTML structure
    const { html, css, js } = files;
    
    // We try to find where to inject styles and scripts
    let srcDoc = html;
    
    // Simple injection if tags are missing, or replacement if they exist
    const styleTag = `<style>${css}</style>`;
    const scriptTag = `<script>${js}</script>`;

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
    <div className="flex-1 bg-white h-full relative">
      <iframe
        title="Live Preview"
        srcDoc={combinedContent}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals allow-forms"
      />
    </div>
  );
};

export default Preview;
