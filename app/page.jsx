'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { createClient } from '@/lib/supabase/client';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import SettingsPanel from '@/components/SettingsPanel';
import ImagePreview from '@/components/ImagePreview';
import AuthModal from '@/components/AuthModal';

export default function GuruAiApp() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [fingerprint, setFingerprint] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  // Layout & View States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [previewImageData, setPreviewImageData] = useState(null);

  // Conversation & Chat State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);

  // AbortController Ref for Cancel/Stop Generation
  const abortControllerRef = useRef(null);

  // Rate Limiting State
  const [quota, setQuota] = useState({
    remainingAllowance: 2,
    maxRequests: 2,
    resetInSeconds: 0,
    cooldownMessage: null,
  });

  // User Customization
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    font_size: 'medium',
    font_family: 'sans',
    ai_language: 'english',
  });

  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  // 1. Initialize Client Fingerprint for privacy-conscious guest tracking
  useEffect(() => {
    async function initFingerprint() {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (err) {
        console.warn('FingerprintJS load error:', err);
      }
    }
    initFingerprint();
  }, []);

  // 2. Refresh Usage Allowance from Server
  const refreshUsageStatus = useCallback(
    async (currentUser) => {
      try {
        const url = currentUser ? '/api/usage' : `/api/usage?fp=${fingerprint || ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setQuota({
            remainingAllowance: data.remainingAllowance,
            maxRequests: data.maxRequests,
            resetInSeconds: data.resetInSeconds,
            cooldownMessage:
              data.remainingAllowance <= 0
                ? 'Your current allowance is exhausted. Please wait for the window reset.'
                : null,
          });
        }
      } catch (err) {
        console.warn('Failed to refresh usage status:', err);
      }
    },
    [fingerprint]
  );

  // 3. Fetch User Session, Preferences & Usage Status
  useEffect(() => {
    async function bootstrapApp() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Fetch User Preferences from database
          try {
            const prefRes = await fetch('/api/preferences');
            if (prefRes.ok) {
              const prefData = await prefRes.json();
              if (prefData.preferences) {
                setPreferences(prefData.preferences);
                applyTheme(prefData.preferences);
              }
            }
          } catch (e) {
            console.warn('Failed to load cloud preferences:', e);
          }

          // Fetch Conversations List
          try {
            const convRes = await fetch('/api/conversations');
            if (convRes.ok) {
              const convData = await convRes.json();
              setConversations(convData.conversations || []);
            }
          } catch (e) {
            console.warn('Failed to load conversations:', e);
          }
        } else {
          setUser(null);
          // Apply local storage preferences for guest
          const localPrefs = localStorage.getItem('guruai_guest_prefs');
          if (localPrefs) {
            try {
              const parsed = JSON.parse(localPrefs);
              setPreferences(parsed);
              applyTheme(parsed);
            } catch {}
          }
        }

        // Fetch Current Usage Status
        await refreshUsageStatus(session?.user);
      } catch (err) {
        console.error('GuruAI bootstrap error:', err);
      } finally {
        setLoadingUser(false);
      }
    }

    bootstrapApp();

    // Check if user arrived via recovery link
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash || '';
      if (searchParams.get('reset_password') || hash.includes('type=recovery')) {
        setAuthModalMode('update_password');
        setAuthModalOpen(true);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('update_password');
        setAuthModalOpen(true);
      }
      if (session?.user) {
        refreshUsageStatus(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refreshUsageStatus]);

  // Apply Theme & Typography styles to document.body
  const applyTheme = (prefs) => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-cyberpunk');
    document.body.classList.add(`theme-${prefs.theme || 'dark'}`);

    document.body.classList.remove('font-sans-mode', 'font-serif-mode', 'font-mono-mode');
    document.body.classList.add(`font-${prefs.font_family || 'sans'}-mode`);

    document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    document.body.classList.add(`text-size-${prefs.font_size || 'medium'}`);
  };

  // Save Preferences
  const handleSavePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    applyTheme(newPrefs);
    localStorage.setItem('guruai_guest_prefs', JSON.stringify(newPrefs));

    if (user) {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPrefs),
        });
      } catch (e) {
        console.error('Failed to sync preferences to Supabase:', e);
      }
    }
  };

  // Quick Cycle Theme: Dark -> Light -> Cyberpunk -> Dark
  const handleQuickThemeToggle = () => {
    const cycle = { dark: 'light', light: 'cyberpunk', cyberpunk: 'dark' };
    const nextTheme = cycle[preferences.theme] || 'dark';
    handleSavePreferences({ ...preferences, theme: nextTheme });
  };

  // Select a past conversation
  const handleSelectConversation = async (convId) => {
    setActiveConversationId(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          (data.messages || []).map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            messageType: m.message_type,
            imageUrl: m.image_url,
            status: m.status,
            created_at: m.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
    }
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent('');
    setInputPrompt('');
    setIsImageMode(false);
  };

  // Rename Conversation
  const handleRenameConversation = async (convId, newTitle) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: newTitle } : c))
        );
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversationId === convId) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Stop active AI text generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      if (streamingContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: streamingContent + ' *(Stopped by user)*',
            messageType: 'text',
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ]);
        setStreamingContent('');
      }
    }
  };

  // Execute Send Message Flow (Streaming text or Image Gen)
  const executeSend = async (promptToSend, modeIsImage = isImageMode, history = messages) => {
    if (!promptToSend || isGenerating) return;

    setInputPrompt('');
    setIsGenerating(true);
    setQuota((prev) => ({ ...prev, cooldownMessage: null }));

    const userMsg = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      role: 'user',
      content: promptToSend,
      messageType: 'text',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    const currentHistory = [...history, userMsg];
    setMessages(currentHistory);

    // FLOW 1: AI Image Generation
    if (modeIsImage) {
      try {
        const res = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptToSend,
            conversationId: activeConversationId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: data.message || data.error || 'Failed to generate image.',
              messageType: 'text',
              isError: true,
            },
          ]);
          if (res.status === 429) {
            setQuota((prev) => ({
              ...prev,
              remainingAllowance: 0,
              cooldownMessage: data.message,
            }));
          }
          return;
        }

        // Image successfully generated
        if (data.conversationId && !activeConversationId) {
          setActiveConversationId(data.conversationId);
          const convRes = await fetch('/api/conversations');
          if (convRes.ok) {
            const convData = await convRes.json();
            setConversations(convData.conversations || []);
          }
        }

        if (data.remainingAllowance !== undefined) {
          setQuota((prev) => ({ ...prev, remainingAllowance: data.remainingAllowance }));
        }

        setMessages((prev) => [
          ...prev,
          {
            id: 'assistant-img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            role: 'assistant',
            content: `Generated image for: "${promptToSend}"`,
            messageType: 'image',
            imageUrl: data.imageUrl,
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Network error: Failed to communicate with image generation endpoint.',
            messageType: 'text',
            isError: true,
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // FLOW 2: Streaming Text Chat with NVIDIA Nemotron 3 Ultra 550B
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let res;
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: promptToSend,
            conversationId: activeConversationId,
            messages: currentHistory,
            fingerprint,
            isImageMode: false,
            language: preferences.ai_language || 'english',
          }),
        });
      } catch (e) {
        // Fallback handled below
      }

      if (!res || !res.ok) {
        if (res && res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          setQuota((prev) => ({
            ...prev,
            remainingAllowance: 0,
            cooldownMessage: errData.message,
          }));
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `⚠️ **Rate Limit Exceeded**\n\n${errData.message}`,
              messageType: 'text',
              isError: true,
            },
          ]);
          setIsGenerating(false);
          return;
        } else if (res && res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          if (errData.requiresLogin) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `🎨 ${errData.message}`,
                messageType: 'text',
                isError: true,
              },
            ]);
            setIsGenerating(false);
            return;
          }
        }

        // Fallback to live Supabase Edge Function
        try {
          res = await fetch('https://wumdbpyhpblvgjttsbpv.supabase.co/functions/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              prompt: promptToSend,
              messages: currentHistory,
              language: preferences.ai_language || 'english',
            }),
          });
        } catch (edgeErr) {
          console.warn('Edge function fallback error:', edgeErr);
        }

        if (!res || !res.ok) {
          const errData = res ? await res.json().catch(() => ({})) : {};
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `❌ Error: ${errData.error || 'Failed to complete request. Please retry.'}`,
              messageType: 'text',
              isError: true,
            },
          ]);
          setIsGenerating(false);
          return;
        }
      }

      // Stream SSE chunks
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedAnswer = '';
      let streamedReasoning = '';
      let serverConvId = activeConversationId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(trimmed.slice(6));
              const rToken = eventData.reasoning || eventData.choices?.[0]?.delta?.reasoning_content || '';
              const cToken = eventData.token || eventData.choices?.[0]?.delta?.content || '';

              if (rToken) {
                streamedReasoning += rToken;
                setStreamingReasoning(streamedReasoning);
              }
              if (cToken) {
                streamedAnswer += cToken;
                setStreamingContent(streamedAnswer);
              }
              if (eventData.conversationId && !serverConvId) {
                serverConvId = eventData.conversationId;
                setActiveConversationId(serverConvId);
              }
              if (eventData.remainingAllowance !== undefined) {
                setQuota((prev) => ({
                  ...prev,
                  remainingAllowance: eventData.remainingAllowance,
                  maxRequests: eventData.maxRequests,
                }));
              }
            } catch (e) {
              // Ignore non-json lines
            }
          }
        }
      }

      if (streamedAnswer || streamedReasoning) {
        const finalAnswer = streamedReasoning.trim()
          ? `<think>\n${streamedReasoning.trim()}\n</think>\n\n${streamedAnswer}`
          : streamedAnswer;

        setMessages((prev) => [
          ...prev,
          {
            id: 'assistant-text-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            role: 'assistant',
            content: finalAnswer,
            reasoning: streamedReasoning.trim() || null,
            messageType: 'text',
            status: 'completed',
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setStreamingContent('');
      setStreamingReasoning('');

      if (user && serverConvId && !activeConversationId) {
        const convRes = await fetch('/api/conversations');
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }
      }
    } catch (streamError) {
      if (streamError.name !== 'AbortError') {
        console.error('GuruAI Streaming error:', streamError);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '❌ Connection error: Generation was interrupted. Please retry.',
            messageType: 'text',
            isError: true,
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserPrompt = messages[lastUserIndex].content;
    const historyBeforeLastUser = messages.slice(0, lastUserIndex);
    executeSend(lastUserPrompt, isImageMode, historyBeforeLastUser);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Starter Prompt Card Click
  const handlePromptSelect = (selectedPrompt) => {
    const isImgPrompt =
      selectedPrompt.toLowerCase().includes('generate an image') ||
      selectedPrompt.toLowerCase().includes('generate image');
    if (isImgPrompt && !user) {
      handleOpenAuth('login');
      return;
    }
    if (isImgPrompt) {
      setIsImageMode(true);
    }
    setInputPrompt(selectedPrompt);
  };

  // Sign out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleNewChat();
    setConversations([]);
    setQuota({ remainingAllowance: 2, maxRequests: 2, resetInSeconds: 0, cooldownMessage: null });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* 1. Left Collapsible Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        remainingAllowance={quota.remainingAllowance}
        maxRequests={quota.maxRequests}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
        currentTheme={preferences.theme}
        onQuickThemeToggle={handleQuickThemeToggle}
        onOpenAuth={handleOpenAuth}
      />

      {/* 2. Main Chat Center Workspace */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
        <ChatWindow
          messages={messages}
          streamingContent={streamingContent}
          streamingReasoning={streamingReasoning}
          isGenerating={isGenerating}
          isImageMode={isImageMode}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onPromptSelect={handlePromptSelect}
          onImageClick={(imgUrl, prompt) => setPreviewImageData({ url: imgUrl, prompt })}
          onRegenerate={handleRegenerate}
          user={user}
          remainingAllowance={quota.remainingAllowance}
          maxRequests={quota.maxRequests}
          resetInSeconds={quota.resetInSeconds}
          cooldownMessage={quota.cooldownMessage}
          aiLanguage={preferences.ai_language}
          onOpenAuth={handleOpenAuth}
        />

        {/* 3. Bottom Composer */}
        <div className="w-full p-3.5 md:p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-md flex-shrink-0 z-20">
          <ChatInput
            inputPrompt={inputPrompt}
            setInputPrompt={setInputPrompt}
            onSendMessage={() => executeSend(inputPrompt.trim())}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            isImageMode={isImageMode}
            setIsImageMode={setIsImageMode}
            isLoggedIn={!!user}
            remainingAllowance={quota.remainingAllowance}
            onOpenLoginPrompt={() => handleOpenAuth('login')}
          />
        </div>
      </main>

      {/* 4. Settings Panel Drawer */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isLoggedIn={!!user}
        user={user}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        remainingAllowance={quota.remainingAllowance}
        maxRequests={quota.maxRequests}
        onOpenAuth={(mode) => {
          setSettingsOpen(false);
          handleOpenAuth(mode || 'login');
        }}
      />

      {/* 5. Image Lightbox */}
      <ImagePreview
        isOpen={!!previewImageData}
        imageUrl={previewImageData?.url}
        prompt={previewImageData?.prompt}
        onClose={() => setPreviewImageData(null)}
      />

      {/* 6. Auth Modal (Login / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        supabase={supabase}
        initialMode={authModalMode}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          refreshUsageStatus(authenticatedUser);
        }}
      />
    </div>
  );
}
