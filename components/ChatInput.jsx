'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Image as ImageIcon,
  Lock,
  Square,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react';

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
  onOpenSettings,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Auto-expand textarea dynamically up to 200px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 24), 200)}px`;
    }
  }, [inputPrompt]);

  // Speech Recognition (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        setRecognitionInstance(recognition);
      }
    }
  }, [setInputPrompt]);

  const toggleSpeech = () => {
    if (!recognitionInstance) return;
    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition error:', e);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((inputPrompt.trim() || attachedFile) && !isGenerating) {
        handleSend();
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSend = () => {
    if (!inputPrompt.trim() && !attachedFile) return;
    onSendMessage();
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasText = Boolean(inputPrompt && inputPrompt.trim().length > 0);

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-2">
      {/* File Attachment Pill Preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-200 w-fit animate-fade-in shadow-md">
          <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate max-w-[200px] font-mono font-medium">
            {attachedFile.name}
          </span>
          <span className="text-[10px] text-slate-400">
            ({Math.round(attachedFile.size / 1024)} KB)
          </span>
          <button
            type="button"
            onClick={() => {
              setAttachedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Gemini & ChatGPT Capsule Chatbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isGenerating) {
            onStopGeneration?.();
          } else {
            handleSend();
          }
        }}
        className={`relative rounded-3xl border transition-all duration-300 bg-[var(--composer-bg)] shadow-2xl backdrop-blur-xl ${
          isImageMode
            ? 'border-purple-500/80 ring-2 ring-purple-500/30 shadow-purple-500/10'
            : 'border-[var(--border-color)] hover:border-indigo-500/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,.txt,.pdf,.csv,.json"
          className="hidden"
        />

        {/* Top Textarea Area */}
        <div className="px-4 pt-3.5 pb-2">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={1}
            placeholder={
              isImageMode
                ? 'Describe the image for Stable Diffusion XL to generate...'
                : 'Ask GuruAI anything in English, Hinglish, or Hindi...'
            }
            className="w-full bg-transparent text-[14.5px] leading-relaxed text-[var(--text-primary)] placeholder-slate-400 focus:outline-none resize-none min-h-[28px] max-h-52 disabled:opacity-60"
            aria-label="Message prompt composer"
          />
        </div>

        {/* Bottom Gemini-Style Toolbar */}
        <div className="flex items-center justify-between px-3.5 pb-3 pt-0.5">
          {/* Left Action Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Plus / Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all duration-150 active:scale-95"
              title="Attach document or image"
              aria-label="Attach file"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Image Studio Mode Toggle Pill */}
            <button
              type="button"
              onClick={handleImageToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isImageMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-300'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/40'
              }`}
              title={
                isLoggedIn
                  ? isImageMode
                    ? 'Switch to Text Chat'
                    : 'Switch to AI Image Studio'
                  : 'Sign in to unlock AI Image Studio'
              }
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
              <span>Image Studio</span>
              {!isLoggedIn && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
            </button>

            {/* Settings Quick Access Pill */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition"
                title="Model Settings & Preferences"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[11px]">Settings</span>
              </button>
            )}
          </div>

          {/* Right Action Icons & Send Button */}
          <div className="flex items-center gap-1.5">
            {/* Voice Dictation (Mic) */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-2 rounded-full transition-all duration-150 ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse ring-2 ring-rose-500/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Input (Speech-to-Text)'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {isGenerating ? (
              /* Stop Generation Button */
              <button
                type="button"
                onClick={onStopGeneration}
                aria-label="Stop generation"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all active:scale-95"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              /* Circular / Rounded Send Button (Gemini / ChatGPT Style) */
              <button
                type="submit"
                disabled={!hasText && !attachedFile}
                aria-label="Send message"
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                  hasText || attachedFile
                    ? 'bg-white text-slate-950 shadow-md shadow-white/20 hover:scale-105 active:scale-95'
                    : 'bg-slate-800/60 text-slate-500 cursor-not-allowed opacity-50'
                }`}
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4 fill-current translate-x-0.5 -translate-y-0.5" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Floating Chatbar Helper Meta */}
      <div className="flex flex-col gap-1 px-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0">
          GuruAI can make mistakes. Verify important facts and code.
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline text-slate-500 font-mono">
            ProTip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Ctrl+K</kbd> for new chat
          </span>
          <span className="font-mono text-cyan-400 font-medium">
            {remainingAllowance > 0 ? `${remainingAllowance} requests left` : 'Limit reached'}
          </span>
        </div>
      </div>
    </div>
  );
}
