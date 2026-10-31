'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  ArrowUp,
} from 'lucide-react';

// Morphing typography helper that smoothly transitions container width
function MorphingText({ text }) {
  const [width, setWidth] = useState('auto');
  const measureRef = useRef(null);

  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={measureRef} className="invisible whitespace-nowrap px-0.5">
        {text}
      </span>
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
        {text}
      </span>
    </span>
  );
}

// 3-Bar Effort Level SVG Indicator
function EffortIcon({ level }) {
  const isMedOrMax = level === 'Medium' || level === 'Max Effort';
  const isMax = level === 'Max Effort';

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <rect
        x="1.5"
        y="8"
        width="2.5"
        height="4.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity="1"
      />
      <rect
        x="5.75"
        y="5"
        width="2.5"
        height="7.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity={isMedOrMax ? 1 : 0.35}
      />
      <rect
        x="10"
        y="2"
        width="2.5"
        height="10.5"
        rx="1"
        fill="currentColor"
        className="transition-opacity duration-300"
        opacity={isMax ? 1 : 0.35}
      />
    </svg>
  );
}

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
    { id: 'guru-flash-1.1', name: 'Guru-Flash 1.1', badge: 'Unlocked', desc: 'Fast general tasks & study', isLocked: false, icon: '⚡' },
    { id: 'guru-flash-1.2', name: 'Guru-Flash 1.2', badge: 'Unlocked', desc: 'Ultra-fast Groq Qwen-27B engine', isLocked: false, icon: '🚀' },
    { id: 'guru-flash-1.3', name: 'Guru-Flash 1.3 Pro', badge: 'Starter $5', desc: 'Expanded 50K context & accuracy', isLocked: true, icon: '✨' },
    { id: 'guru-flash-1.5', name: 'Guru-Flash 1.5 Pro', badge: 'Starter $5', desc: 'Deep logic reasoning & analysis', isLocked: true, icon: '🧠' },
    { id: 'guru-vision-1.9', name: 'Guru-Vision 1.9', badge: 'Power $15', desc: 'Vision synthesis & multimodal math', isLocked: true, icon: '👁️' },
    { id: 'guru-ultra-2.0', name: 'Guru-Ultra 2.0', badge: 'VIP $25', desc: 'Flagship 120B reasoning engine', isLocked: true, icon: '🔬' },
  ];

  const effortLevels = ['Low', 'Medium', 'Max Effort'];
  const [effortIdx, setEffortIdx] = useState(1); // Default Medium
  const currentEffort = effortLevels[effortIdx];

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const fadeTopRef = useRef(null);
  const fadeBottomRef = useRef(null);

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Model hover indicator pill state
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState({
    opacity: 0,
    transform: 'translateY(0px) scale(0.95)',
    transition: 'none',
  });

  // Cycle thinking effort
  const cycleEffort = (e) => {
    e.stopPropagation();
    setEffortIdx((prev) => (prev + 1) % effortLevels.length);
  };

  // Auto-resize textarea dynamically and update top/bottom gradient fades
  const updateFades = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (fadeTopRef.current) {
      fadeTopRef.current.style.opacity = Math.min(scrollTop / 16, 1).toString();
    }
    if (fadeBottomRef.current) {
      const remaining = scrollHeight - clientHeight - scrollTop;
      fadeBottomRef.current.style.opacity = remaining > 10 ? '1' : '0';
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, 36), 180);
      textareaRef.current.style.height = `${targetH}px`;
      updateFades();
    }
  }, [inputPrompt, updateFades]);

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
    if (!recognitionInstance) {
      // Fallback demo simulation
      setIsListening(!isListening);
      return;
    }
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

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setModelMenuOpen(false);
        if (!inputPrompt?.trim() && attachedFiles.length === 0) {
          setIsFocused(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [inputPrompt, attachedFiles.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((inputPrompt?.trim() || attachedFiles.length > 0) && !isGenerating) {
        handleSend();
      }
    }
    if (e.key === 'Escape' && !inputPrompt?.trim() && attachedFiles.length === 0) {
      setIsFocused(false);
      setModelMenuOpen(false);
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const mapped = files.map((file) => ({
        id: `att-${Math.random().toString(36).slice(2, 9)}`,
        file,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        isImage: file.type.startsWith('image/'),
      }));
      setAttachedFiles((prev) => [...prev, ...mapped].slice(0, 6));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachedFiles((prev) => {
      const match = prev.find((a) => a.id === id);
      if (match?.url) URL.revokeObjectURL(match.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!inputPrompt?.trim() && attachedFiles.length === 0) return;
    onSendMessage();
    attachedFiles.forEach((a) => {
      if (a.url) URL.revokeObjectURL(a.url);
    });
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasContent = Boolean(inputPrompt && inputPrompt.trim().length > 0) || attachedFiles.length > 0;
  const currentModelObj = models.find((m) => m.id === activeModel) || models[0];

  return (
    <div ref={containerRef} className="mx-auto w-full min-w-0 max-w-4xl space-y-2">
      {/* 21st.dev Attachment Tray Drawer (Slides out above capsule) */}
      <div
        className={`w-full overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          attachedFiles.length > 0 ? 'max-h-20 opacity-100 mb-1' : 'max-h-0 opacity-0 mb-0'
        }`}
        aria-hidden={attachedFiles.length === 0}
      >
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 rounded-t-2xl bg-slate-900/90 border border-indigo-500/30 border-b-0 backdrop-blur-md shadow-lg scrollbar-thin">
          {attachedFiles.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200 shrink-0 shadow-sm animate-in fade-in zoom-in-95 duration-200"
            >
              {att.isImage && att.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.url} alt={att.name} className="w-5 h-5 object-cover rounded-md border border-white/10" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="truncate max-w-[130px] font-mono text-[11px] font-medium text-slate-200">
                {att.name}
              </span>
              <span className="text-[10px] text-slate-400">
                ({Math.round(att.size / 1024)} KB)
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main 21st.dev Spring-Physics Capsule */}
      <div
        className={`relative w-full rounded-3xl border transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bg-[var(--composer-bg)] shadow-2xl backdrop-blur-2xl ${
          isImageMode
            ? 'border-purple-500/80 ring-2 ring-purple-500/30 shadow-purple-500/10'
            : isFocused || hasContent
            ? 'border-indigo-500/80 ring-4 ring-indigo-500/20 shadow-indigo-500/10'
            : 'border-[var(--border-color)] hover:border-indigo-500/50'
        } ${attachedFiles.length > 0 ? 'rounded-t-none' : ''}`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,.txt,.pdf,.csv,.json"
          multiple
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Scroll Fades (Gradient masks for multiline overflow) */}
        <div
          ref={fadeTopRef}
          className="absolute left-4 right-14 top-0 z-[2] h-6 bg-gradient-to-b from-[var(--composer-bg)] via-[var(--composer-bg)]/80 to-transparent pointer-events-none opacity-0 transition-opacity duration-200"
        />
        <div
          ref={fadeBottomRef}
          className="absolute left-4 right-14 bottom-12 z-[2] h-6 bg-gradient-to-t from-[var(--composer-bg)] via-[var(--composer-bg)]/80 to-transparent pointer-events-none opacity-0 transition-opacity duration-200"
        />

        {/* Top Textarea Area */}
        <div className="relative z-[1] px-4 pt-3.5 pb-1">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            onScroll={updateFades}
            disabled={isGenerating}
            rows={1}
            placeholder={
              isImageMode
                ? 'Describe the image for Stable Diffusion XL to generate...'
                : 'Ask GuruAI anything in English, Hinglish, or Hindi...'
            }
            className="w-full bg-transparent text-[14.5px] leading-relaxed text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none resize-none min-h-[32px] max-h-48 disabled:opacity-60 font-sans cursor-text scrollbar-thin"
            aria-label="Message prompt composer"
          />
        </div>

        {/* Bottom 21st.dev Toolbar */}
        <div className="relative z-[10] flex items-center justify-between px-3.5 pb-2.5 pt-1">
          {/* Left Action Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Model Selector Chip with Floating Glassmorphic Menu */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 shadow-sm transition-all active:scale-95 outline-none"
                title="Select GuruAI Model"
                aria-label={`Select model. Current: ${currentModelObj.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
                <span className="font-heading font-bold text-white text-[11px] sm:text-xs">
                  <MorphingText text={currentModelObj.name} />
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    modelMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Floating Menu with Magnetic Hover Highlight */}
              {modelMenuOpen && (
                <div
                  onMouseLeave={() =>
                    setHoverIndicatorStyle((prev) => ({
                      ...prev,
                      opacity: 0,
                      transform: prev.transform.replace('scale(1)', 'scale(0.95)'),
                      transition: 'opacity 0.2s ease-in, transform 0.2s ease-out',
                    }))
                  }
                  className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>GuruAI Models</span>
                    <span className="text-indigo-400 font-mono">Engine Selector</span>
                  </div>

                  {models.map((mod, idx) => (
                    <button
                      key={mod.id}
                      type="button"
                      onMouseEnter={() =>
                        setHoverIndicatorStyle({
                          opacity: 1,
                          transform: `translateY(${idx * 46}px) scale(1)`,
                          transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.15s ease',
                        })
                      }
                      onClick={() => {
                        setModelMenuOpen(false);
                        if (mod.isLocked) {
                          onOpenUpgrade?.();
                        } else {
                          setActiveModel?.(mod.id);
                        }
                      }}
                      className={`relative flex items-center gap-2.5 p-2 rounded-xl text-left transition-all group outline-none ${
                        activeModel === mod.id ? 'bg-indigo-600/20 text-white' : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          mod.isLocked
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                        }`}
                      >
                        {mod.isLocked ? <Lock className="w-3.5 h-3.5" /> : mod.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                            {mod.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                              mod.isLocked
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
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

            {/* Thinking / Effort Level Cycle Chip (21st.dev style) */}
            <button
              type="button"
              onClick={cycleEffort}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 shadow-sm transition-all active:scale-95 outline-none"
              title="Cycle Thinking Effort: Low / Medium / Max Effort"
            >
              <EffortIcon level={currentEffort} />
              <span className="text-[11px] font-medium text-slate-300">
                <MorphingText text={currentEffort} />
              </span>
            </button>

            {/* Plus / Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all duration-200 active:scale-95 outline-none"
              title="Attach document or image"
              aria-label="Attach file"
            >
              <Plus className="w-4 h-4" />
            </button>

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
              <ImageIcon className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span className="hidden xs:inline sm:inline">Studio</span>
              {!isLoggedIn && <Lock className="w-3 h-3 text-amber-400 ml-0.5 shrink-0" />}
            </button>

            {/* Settings Quick Access Pill */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition outline-none"
                title="Model Settings & Preferences"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[11px]">Settings</span>
              </button>
            )}
          </div>

          {/* Right Action Icons & Morphing Action Button */}
          <div className="flex items-center gap-2">
            {/* Real-time Voice Waveform Visualizer */}
            <div
              className={`flex items-center gap-[3px] h-6 px-1 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                isListening ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-2 pointer-events-none'
              }`}
            >
              {[10, 18, 24, 15, 8].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-indigo-500 animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>

            {/* 21st.dev Morphing Action Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                aria-label="Stop generation"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] active:scale-90 outline-none"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : hasContent ? (
              <button
                type="button"
                onClick={handleSend}
                aria-label="Send message"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-105 active:scale-95 outline-none animate-in zoom-in-75 duration-200"
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSpeech}
                aria-label="Use voice input"
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] active:scale-90 outline-none ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:scale-105'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice Input (Speech-to-Text)'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Helper Footer Under Chatbar */}
      <div className="flex flex-col gap-1 px-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0 flex items-center gap-1.5">
          <span>GuruAI citations & sources engine</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{currentEffort} Reasoning</span>
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline text-slate-500 font-mono">
            ProTip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Ctrl+K</kbd> for new chat
          </span>
          <span className="font-mono text-indigo-400 font-semibold">
            {remainingAllowance > 0 ? `${remainingAllowance} requests left` : 'Limit reached'}
          </span>
        </div>
      </div>
    </div>
  );
}
