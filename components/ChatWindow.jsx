'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Menu,
  Settings,
  AlertTriangle,
  RefreshCw,
  Code,
  Image as ImageIcon,
  Languages,
  PenTool,
  Brain,
  ArrowDown,
  Sparkles,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';
import GuruLogo from '@/components/GuruLogo';
import MessageBubble from '@/components/MessageBubble';
import UsageBadge from '@/components/UsageBadge';

export default function ChatWindow({
  messages = [],
  streamingContent = '',
  streamingReasoning = '',
  isGenerating = false,
  isImageMode = false,
  onOpenSidebar,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onOpenSettings,
  onPromptSelect,
  onImageClick,
  onRegenerate,
  user,
  remainingAllowance = 2,
  maxRequests = 2,
  resetInSeconds = 0,
  cooldownMessage = null,
  aiLanguage = 'english',
  onOpenAuth,
  onOpenUpgrade,
}) {
  const scrollRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  // Auto-scroll on new message or streaming chunk
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom || isGenerating) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, streamingContent, isGenerating]);

  // Detect scroll position to show/hide Scroll-to-Bottom button
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isUp = scrollHeight - scrollTop - clientHeight > 200;
      setShowScrollBottom(isUp);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Top Header */}
      <header className="z-10 flex h-auto min-h-14 flex-shrink-0 flex-wrap items-center justify-between gap-y-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 px-2 py-2 backdrop-blur-md sm:h-14 sm:flex-nowrap sm:px-4 sm:py-0">
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:gap-3">
          {/* Mobile Drawer Toggle */}
          <button
            onClick={onOpenSidebar}
            aria-label="Toggle navigation drawer"
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Left Expand Button (when sidebar is collapsed) */}
          {isSidebarCollapsed && (
            <button
              onClick={onToggleSidebarCollapse}
              aria-label="Expand sidebar"
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Expand sidebar (Ctrl+[)"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <GuruLogo size={24} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">
                GuruAI
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                Guru-Flash 1.1 & SDXL
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-1.5 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2 md:gap-3">
          {/* Output Language Indicator */}
          <button
            onClick={onOpenSettings}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 transition hover:border-indigo-500/60 sm:px-2.5"
            title="Current AI Output Language"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="capitalize text-[11px] font-medium">{aiLanguage}</span>
          </button>

          {/* Usage Allowance Counter */}
          <UsageBadge
            remainingAllowance={remainingAllowance}
            maxRequests={maxRequests}
            isLoggedIn={!!user}
            resetInSeconds={resetInSeconds}
            onClick={onOpenUpgrade || onOpenSettings}
          />

          {/* Upgrade Plan Button */}
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-purple-500/20 px-2 py-1 text-xs font-bold text-amber-300 shadow-sm shadow-amber-500/10 transition-all duration-200 hover:from-amber-500/30 hover:to-purple-500/30 sm:px-3"
            title="Upgrade context and daily limits"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Prominent Header Sign In / Profile Trigger */}
          {!user ? (
            <button
              onClick={() => onOpenAuth?.('login')}
              type="button"
              className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-cyan-500 active:scale-95 sm:px-3"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {/* User Dashboard Link (only for logged-in user) */}
              <a
                href={`${mainSiteUrl}/dashboard.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/90 border border-indigo-500/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 text-slate-200 transition-all group active:scale-95"
                title="User AI Dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 border border-indigo-300/60 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    (user.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <span className="text-xs text-slate-200 font-medium hidden sm:inline max-w-[110px] truncate">
                  {user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Dashboard')}
                </span>
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Conversation Feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mx-auto w-full min-w-0 max-w-4xl flex-1 space-y-6 overflow-y-auto overscroll-y-contain px-3 py-4 sm:px-4 sm:py-6 md:px-8"
      >
        {messages.length === 0 && !streamingContent ? (
          /* Welcome Screen Hero */
          <div className="h-full flex flex-col items-center justify-center text-center space-y-7 my-auto py-8 animate-fade-in">
            <div className="relative group">
              <GuruLogo size={64} className="shadow-2xl shadow-indigo-500/30" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                What can I help you with today?
              </h1>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Ask questions, explore ideas, write code, solve problems, or create images with GuruAI.
              </p>
            </div>

            {/* Categorized Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left pt-2">
              {[
                {
                  category: 'Programming & Debugging',
                  icon: Code,
                  iconColor: 'text-cyan-400',
                  prompt: 'How do I implement concurrency-safe atomic rate limiting in PostgreSQL using row-level locking?',
                  summary: 'Atomic PostgreSQL rate limiting with FOR UPDATE locks',
                },
                {
                  category: 'AI Image Creation',
                  icon: ImageIcon,
                  iconColor: 'text-purple-400',
                  prompt: 'Generate an image of a futuristic cyberpunk city with luminous neon reflections in rainy streets.',
                  summary: 'Generate high-res cyberpunk artwork via Stable Diffusion XL',
                },
                {
                  category: 'Learning & Explanations',
                  icon: Brain,
                  iconColor: 'text-indigo-400',
                  prompt: 'Next.js 14 App Router vs Pages Router ke architectural differences Hinglish mein samjhao.',
                  summary: 'App Router vs Pages Router explained in conversational Hinglish',
                },
                {
                  category: 'Writing & Creativity',
                  icon: PenTool,
                  iconColor: 'text-emerald-400',
                  prompt: 'Draft a professional engineering architecture proposal for cross-subdomain authentication.',
                  summary: 'Draft a clean cross-subdomain authentication proposal',
                },
              ].map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onPromptSelect?.(card.prompt)}
                    className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/60 hover:bg-slate-800/60 transition-all duration-200 text-left space-y-1.5 group shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-3.5 h-3.5 ${card.iconColor}`} />
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {card.category}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {card.summary}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      &ldquo;{card.prompt}&rdquo;
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          <>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id || index}
                message={msg}
                onImageClick={onImageClick}
                onRegenerate={
                  !isGenerating && index === messages.length - 1 && msg.role === 'assistant'
                    ? onRegenerate
                    : null
                }
                userEmail={user?.email}
              />
            ))}

            {/* Live Streaming Message Bubble */}
            {(streamingContent || streamingReasoning) && (
              <MessageBubble
                message={{
                  role: 'assistant',
                  content: streamingContent,
                  reasoning: streamingReasoning,
                  messageType: 'text',
                  status: 'completed',
                }}
                isStreaming={true}
                onImageClick={onImageClick}
              />
            )}

            {/* Generating Skeleton / Status Animation */}
            {isGenerating && !streamingContent && !streamingReasoning && (
              <div className="flex gap-3 md:gap-4 justify-start items-center animate-fade-in">
                <GuruLogo size={32} />
                <div className="bg-[var(--bubble-assistant)] border border-[var(--bubble-border)] px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-300 flex items-center gap-2.5 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>
                    {isImageMode
                      ? 'GuruAI is rendering your high-resolution artwork with Stable Diffusion XL...'
                      : 'GuruAI is thinking...'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Scroll to Bottom Action */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="absolute bottom-20 right-8 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl backdrop-blur-sm transition-all duration-200 z-20 group"
        >
          <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Cooldown Alert Banner */}
      {cooldownMessage && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2 flex-shrink-0 animate-fade-in">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{cooldownMessage}</span>
            </div>
            {user ? (
              <button
                type="button"
                onClick={onOpenUpgrade || (() => window.open(`${mainSiteUrl}/contact.html?subject=ai_upgrade`, '_blank'))}
                className="flex-shrink-0 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold hover:from-indigo-500 hover:to-cyan-500 transition text-xs cursor-pointer shadow-sm"
              >
                Upgrade Plan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="flex-shrink-0 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
