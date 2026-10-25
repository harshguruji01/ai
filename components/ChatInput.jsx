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
  ChevronDown,
  Zap,
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
  activeModel = 'guru-flash-1.1',
  setActiveModel,
  onOpenUpgrade,
}) {
  const models = [
    { id: 'guru-flash-1.1', name: 'Guru-Flash 1.1', badge: 'Unlocked', desc: 'Balanced intelligence & fast general tasks', isLocked: false },
    { id: 'guru-flash-1.2', name: 'Guru-Flash 1.2', badge: 'Unlocked', desc: 'Ultra-fast Groq Qwen-27B engine', isLocked: false },
    { id: 'guru-flash-1.3', name: 'Guru-Flash 1.3 Pro', badge: 'Starter $5', desc: 'Expanded 50K context & instruction precision', isLocked: true },
    { id: 'guru-flash-1.5', name: 'Guru-Flash 1.5 Pro', badge: 'Starter $5', desc: 'Deep logic reasoning & analysis', isLocked: true },
    { id: 'guru-vision-1.9', name: 'Guru-Vision 1.9', badge: 'Power $15', desc: 'High-definition vision synthesis & multimodal', isLocked: true },
    { id: 'guru-ultra-2.0', name: 'Guru-Ultra 2.0', badge: 'VIP $25', desc: 'Flagship 120B reasoning & code engine', isLocked: true },
  ];

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

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

            {/* Model Selector Pill */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 shadow-sm transition-all"
                title="Select AI Model"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="font-heading font-bold text-white text-[11px] sm:text-xs">
                  {models.find((m) => m.id === activeModel)?.name || 'Guru-Flash 1.1'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {modelMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-2 z-50 space-y-1 animate-fade-in">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>GuruAI Models</span>
                    <span className="text-indigo-400 font-mono">Select Engine</span>
                  </div>

                  {models.map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setModelMenuOpen(false);
                        if (mod.isLocked) {
                          onOpenUpgrade?.();
                        } else {
                          setActiveModel?.(mod.id);
                        }
                      }}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-800/80 transition group cursor-pointer"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        mod.isLocked 
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                          : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                      }`}>
                        {mod.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white group-hover:text-cyan-400 transition">
                            {mod.name}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            mod.isLocked
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {mod.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{mod.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image Studio Mode Toggle Pill */}
            <button
              type="button"
              onClick={handleImageToggle}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
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
              <ImageIcon className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">Image Studio</span>
              <span className="xs:hidden sm:hidden">Studio</span>
              {!isLoggedIn && <Lock className="w-3 h-3 text-amber-400 ml-0.5 flex-shrink-0" />}
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
