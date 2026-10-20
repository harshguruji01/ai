'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content = '' }) {
  // Parse code blocks with ```lang ... ```
  const parts = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: match[2].trimEnd(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  // Render text helper for simple bold, links, inline code and linebreaks
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      // Basic bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Inline formatting: code `...`, bold **...**
      const inlineTokens = cleanLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

      const renderedTokens = inlineTokens.map((token, tIdx) => {
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code
              key={tIdx}
              className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-slate-700/60"
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={tIdx} className="font-semibold text-slate-100">
              {token.slice(2, -2)}
            </strong>
          );
        }
        return token;
      });

      if (isBullet) {
        return (
          <li key={lIdx} className="ml-5 list-disc my-1 text-slate-300">
            {renderedTokens}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="my-1 text-slate-200 leading-relaxed">
          {renderedTokens}
        </p>
      );
    });
  };

  return (
    <div className="space-y-1 text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} language={part.language} code={part.code} />;
        }
        return <div key={index}>{renderFormattedText(part.text)}</div>;
      })}
    </div>
  );
}
