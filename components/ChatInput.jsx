'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Lock, Square, Sparkles } from 'lucide-react';

export default function ChatInput({
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  onStopGeneration,
  isGenerating,
  isImageMode,
  setIsImageMode,
  isLoggedIn,
  remainingAllowance = 2,
  onOpenLoginPrompt,
}) {
  const textareaRef = useRef(null);

  // Dynamic auto-expansion of textarea up to max 180px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputPrompt.trim() && !isGenerating) {
        onSendMessage();
      }
    }
  };

  const handleImageToggle = () => {
    if (!isLoggedIn) {
      onOpenLoginPrompt?.();
      return;
    }
    setIsImageMode(!isImageMode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isGenerating) {
            onStopGeneration?.();
          } else if (inputPrompt.trim()) {
            onSendMessage();
          }
        }}
        className={`relative rounded-2xl border transition-all duration-200 bg-[var(--composer-bg)] backdrop-blur-md shadow-xl ${
          isImageMode
            ? 'border-purple-500/80 ring-2 ring-purple-500/30'
            : 'border-[var(--border-color)] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-[var(--ring-glow)]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={1}
          placeholder={
            isImageMode
              ? 'Describe the image you want Stable Diffusion XL to create...'
              : 'Ask GuruAI anything in English, Hinglish, or Hindi...'
          }
          className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none resize-none min-h-[44px] max-h-44 disabled:opacity-60"
          aria-label="Message prompt composer"
        />

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            {/* Image Mode Toggle */}
            <button
              type="button"
              onClick={handleImageToggle}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isImageMode
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
              title={
                isLoggedIn
                  ? isImageMode
                    ? 'Switch back to Text Chat'
                    : 'Switch to AI Image Studio'
                  : 'Sign in to unlock AI Image Generation'
              }
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
              <span>Image Studio</span>
              {!isLoggedIn && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
            </button>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Enter to send, Shift + Enter for new line
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              /* Stop Generation Control */
              <button
                type="button"
                onClick={onStopGeneration}
                aria-label="Stop generation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition animate-fade-in"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              /* Send Message Control */
              <button
                type="submit"
                disabled={!inputPrompt.trim()}
                aria-label="Send message"
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-cyan-600 text-white shadow-md shadow-indigo-600/25 transition flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Footer Meta */}
      <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span>
          GuruAI can make mistakes. Verify critical facts and code.
        </span>
        <span className="font-mono">
          {remainingAllowance > 0 ? `${remainingAllowance} requests left` : 'Limit reached'}
        </span>
      </div>
    </div>
  );
}
