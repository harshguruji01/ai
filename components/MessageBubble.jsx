'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  Maximize2,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import GuruLogo from '@/components/GuruLogo';
import CodeBlock from '@/components/CodeBlock';

// Helper: extract <think>...</think> if present
function extractThinking(rawContent = '', explicitReasoning = null) {
  if (explicitReasoning) {
    return { reasoning: explicitReasoning, content: rawContent || '' };
  }
  if (!rawContent) return { reasoning: null, content: '' };

  const match = rawContent.match(/^<think>([\s\S]*?)<\/think>\s*([\s\S]*)$/);
  if (match) {
    return {
      reasoning: match[1].trim(),
      content: match[2],
    };
  }

  // Handle unclosed <think> during streaming
  if (rawContent.startsWith('<think>')) {
    return {
      reasoning: rawContent.slice(7).trim(),
      content: '',
    };
  }

  return { reasoning: null, content: rawContent };
}

function ThinkingSection({ reasoning, isStreaming = false }) {
  const [isExpanded, setIsExpanded] = useState(!isStreaming ? false : true);

  if (!reasoning) return null;

  return (
    <div className="mb-3 rounded-xl border border-cyan-500/20 bg-slate-900/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-cyan-300 hover:text-cyan-200 hover:bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center gap-2">
          <Brain className={`w-3.5 h-3.5 text-cyan-400 ${isStreaming ? 'animate-pulse' : ''}`} />
          <span className="font-medium tracking-wide">
            {isStreaming ? 'Thinking...' : 'Thought Process'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] uppercase font-mono tracking-wider">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 font-mono text-[11px] text-slate-400 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap select-text">
          {reasoning}
          {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}

// Helper: Markdown parser supporting code blocks, bold, lists, and inline code
function parseMarkdown(content = '') {
  const parts = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trimEnd(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  return parts;
}

function FormattedText({ text = '', isStreaming = false }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, lIdx) => {
        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;
        const tokens = cleanLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

        const renderedTokens = tokens.map((token, tIdx) => {
          if (token.startsWith('`') && token.endsWith('`')) {
            return (
              <code
                key={tIdx}
                className="bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded text-[0.88em] font-mono border border-slate-700/60"
              >
                {token.slice(1, -1)}
              </code>
            );
          }
          if (token.startsWith('**') && token.endsWith('**')) {
            return (
              <strong key={tIdx} className="font-semibold text-white">
                {token.slice(2, -2)}
              </strong>
            );
          }
          return token;
        });

        if (isBullet) {
          return (
            <li key={lIdx} className="ml-5 list-disc my-1 text-slate-200">
              {renderedTokens}
            </li>
          );
        }

        if (!line.trim()) {
          return <div key={lIdx} className="h-2" />;
        }

        return (
          <p key={lIdx} className="my-1.5 leading-relaxed text-[var(--text-primary)]">
            {renderedTokens}
            {isStreaming && lIdx === lines.length - 1 && (
              <span className="streaming-cursor" aria-hidden="true" />
            )}
          </p>
        );
      })}
    </>
  );
}

export default function MessageBubble({
  message,
  onImageClick,
  onRegenerate,
  isStreaming = false,
  userEmail,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.isError || message.status === 'failed';

  const { reasoning, content: actualContent } = extractThinking(
    message.content,
    message.reasoning
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(actualContent || message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={`group flex gap-3 md:gap-4 transition-all duration-200 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <GuruLogo size={32} />
        </div>
      )}

      {/* Bubble Container */}
      <div className="max-w-[92%] md:max-w-[85%] flex flex-col space-y-1">
        <div
          className={`relative text-sm ${
            isUser
              ? 'bg-[var(--bubble-user)] text-[var(--text-primary)] border border-indigo-500/20 rounded-3xl px-5 py-3 shadow-sm'
              : isError
              ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-2xl px-4 py-3'
              : 'bg-transparent border-0 text-[var(--text-primary)] px-1 py-1 shadow-none'
          }`}
        >
          {/* Image Message */}
          {message.messageType === 'image' && message.imageUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-medium">{message.content}</p>
              <div className="relative group/img rounded-xl overflow-hidden border border-slate-700 bg-black max-w-sm">
                <img
                  src={message.imageUrl}
                  alt={message.content || 'Generated by GuruAI'}
                  className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition"
                  onClick={() => onImageClick?.(message.imageUrl, message.content)}
                />
                <button
                  onClick={() => onImageClick?.(message.imageUrl, message.content)}
                  className="absolute bottom-2 right-2 bg-black/80 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </button>
              </div>
            </div>
          ) : (
            /* Text Message Markdown with Thinking Section */
            <div className="leading-relaxed">
              {reasoning && (
                <ThinkingSection
                  reasoning={reasoning}
                  isStreaming={isStreaming && !actualContent}
                />
              )}
              {actualContent ? (
                parseMarkdown(actualContent).map((part, pIdx) => {
                  if (part.type === 'code') {
                    return <CodeBlock key={pIdx} language={part.language} code={part.code} />;
                  }
                  return (
                    <FormattedText
                      key={pIdx}
                      text={part.text}
                      isStreaming={isStreaming && pIdx === parseMarkdown(actualContent).length - 1}
                    />
                  );
                })
              ) : isStreaming && reasoning ? null : (
                <p className="text-slate-400 italic">Thinking...</p>
              )}
            </div>
          )}

          {/* Action Buttons for Assistant Message */}
          {!isUser && !isError && message.content && !isStreaming && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shadow-sm"
                title="Copy response"
                aria-label="Copy response text"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition shadow-sm"
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span
            className={`text-[10px] text-slate-400 px-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {formattedTime}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs flex-shrink-0 mt-0.5">
          {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
    </div>
  );
}
