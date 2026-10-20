'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Settings,
  ShieldCheck,
  User,
  Zap,
  ArrowRight,
  RefreshCw,
  LogOut,
  ExternalLink,
  Trash2,
  Download,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({ remaining: 2, max: 2, windowStart: Date.now() });
  const [resetTimer, setResetTimer] = useState('--:--:--');
  const [stats, setStats] = useState({ savedChats: 0, totalMessages: 0, images: 0 });
  const [conversations, setConversations] = useState([]);
  
  // Preferences
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('english');
  const [font, setFont] = useState('sans');
  const [temp, setTemp] = useState('0.7');
  const [notice, setNotice] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    // 1. Load preferences
    const savedTheme = localStorage.getItem('guruai_theme') || 'dark';
    const savedLang = localStorage.getItem('guruai_lang') || 'english';
    const savedFont = localStorage.getItem('guruai_font') || 'sans';
    const savedTemp = localStorage.getItem('guruai_temp') || '0.7';

    setTheme(savedTheme);
    setLang(savedLang);
    setFont(savedFont);
    setTemp(savedTemp);

    // 2. Load conversations & stats
    try {
      const convs = JSON.parse(localStorage.getItem('guruai_local_conversations') || '[]');
      setConversations(convs);
      let msgs = 0;
      let imgs = 0;
      convs.forEach(c => {
        if (Array.isArray(c.messages)) {
          msgs += c.messages.length;
          c.messages.forEach(m => {
            if (m.imageUrl || (m.content && m.content.includes('http') && m.content.includes('image'))) {
              imgs++;
            }
          });
        }
      });
      setStats({ savedChats: convs.length, totalMessages: msgs, images: imgs });
    } catch (e) {}

    // 3. Check Session & Profile
    async function initSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setUser(session.user);
          // fetch profile
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (prof) setProfile(prof);
          setupQuota(session.user);
        } else {
          // Check local stored session
          const localStored = localStorage.getItem('hg_auth_user');
          if (localStored) {
            try {
              const u = JSON.parse(localStored);
              setUser(u);
              setupQuota(u);
            } catch (e) {
              setupQuota(null);
            }
          } else {
            setupQuota(null);
          }
        }
      } catch (err) {
        console.warn('Session init error:', err);
        setupQuota(null);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  // Quota calculation & timer
  function setupQuota(currentUser) {
    const now = Date.now();
    let max = currentUser ? 10 : 2;
    let windowDuration = (currentUser ? 12 : 6) * 3600 * 1000;
    const key = currentUser ? ('guruai_quota_user_' + currentUser.id) : 'guruai_quota_guest';

    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(key));
    } catch (e) {}

    if (!stored || typeof stored.remaining !== 'number' || !stored.windowStart || (now - stored.windowStart) > windowDuration) {
      stored = { remaining: max, windowStart: now };
      localStorage.setItem(key, JSON.stringify(stored));
    }

    setQuota({ remaining: stored.remaining, max, windowStart: stored.windowStart });

    // Start timer interval
    const interval = setInterval(() => {
      const curNow = Date.now();
      const elapsed = curNow - stored.windowStart;
      const leftMs = Math.max(0, windowDuration - elapsed);

      if (leftMs <= 0) {
        setResetTimer('Refreshed!');
        clearInterval(interval);
        setupQuota(currentUser);
        return;
      }

      const h = Math.floor(leftMs / (3600 * 1000));
      const m = Math.floor((leftMs % (3600 * 1000)) / (60 * 1000));
      const s = Math.floor((leftMs % (60 * 1000)) / 1000);
      setResetTimer(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('guruai_theme', newTheme);
    showNotice(`Theme updated to ${newTheme}`);
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('guruai_lang', newLang);
    showNotice(`Language updated to ${newLang}`);
  };

  const handleSetFont = (newFont) => {
    setFont(newFont);
    localStorage.setItem('guruai_font', newFont);
    showNotice(`Typography font updated to ${newFont}`);
  };

  const handleSetTemp = (newTemp) => {
    setTemp(newTemp);
    localStorage.setItem('guruai_temp', newTemp);
    showNotice(`Creativity temperature set to ${newTemp}`);
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('hg_auth_user');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleExportChats = () => {
    const raw = localStorage.getItem('guruai_local_conversations') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guruai-chat-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all saved conversations?')) {
      localStorage.removeItem('guruai_local_conversations');
      setConversations([]);
      setStats(prev => ({ ...prev, savedChats: 0, totalMessages: 0, images: 0 }));
      showNotice('Conversation history cleared');
    }
  };

  const handleDeleteSingle = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem('guruai_local_conversations', JSON.stringify(updated));
    showNotice('Conversation removed');
  };

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest Visitor';
  const displayEmail = user?.email || 'Guest visitor mode';
  const isAdmin = profile?.role === 'admin' || profile?.is_admin;
  const isGoldenTick = profile?.is_golden_tick || profile?.golden_tick;

  return (
    <div className={`min-h-screen flex flex-col bg-[#07090e] text-slate-100 ${theme === 'light' ? 'theme-light' : theme === 'cyberpunk' ? 'theme-cyberpunk' : ''}`}>
      
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0c101d]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0A0E1A] border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="GuruAI Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wide text-white">GuruAI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold uppercase">Dashboard</span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">Account, Quotas &amp; Studio Preferences</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white text-xs font-semibold transition shadow-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </Link>

          <a href="https://www.webguruji.online/dashboard.html" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/80 text-xs font-semibold transition shadow-sm">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Main Website Dashboard</span>
          </a>

          {user ? (
            <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold transition">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition">
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. Identity & Profile Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-950/80 via-[#0d121f] to-[#141b2d] border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 border border-indigo-400/60 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-600/25 overflow-hidden flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{displayName}</h1>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{user ? 'Pro Member' : 'Guest Visitor'}</span>
                  </span>

                  {isGoldenTick && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  )}

                  {isAdmin && (
                    <a href="/admin.html" className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold hover:bg-rose-500/30 transition flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Portal ↗</span>
                    </a>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 font-mono truncate">{displayEmail}</p>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                  <span>● Active Engine: <strong className="text-cyan-400">NVIDIA Nemotron 3 Ultra 550B</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>Image Engine: <strong className="text-purple-400">SDXL Lightning</strong></span>
                </div>
              </div>
            </div>

            <Link href="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Start New Prompt</span>
            </Link>
          </div>
        </section>

        {/* 2. Quota & Limits Ring */}
        <section className="rounded-3xl bg-[#0d121f] border border-slate-800/90 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <h2 className="text-base sm:text-lg font-bold text-white">Live AI Quota &amp; Allowance</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Rolling window allowance for conversational intelligence and image synthesis.</p>
            </div>
            <button onClick={() => setupQuota(user)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Allowance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Remaining Allowance</span>
                <span className="font-mono text-cyan-400 font-bold">{quota.max} Max</span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{quota.remaining}</span>
                  <span className="text-xs text-slate-400">/ {quota.max} requests remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, (quota.remaining / quota.max) * 100))}%` }}></div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>●</span>
                <span>{user ? 'Member: 10 requests / 12h' : 'Guest: 2 requests / 6h'}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400">Rolling Reset Timer</span>
              <div className="my-2">
                <span className="text-2xl font-bold font-mono text-cyan-300">{resetTimer}</span>
              </div>
              <span className="text-[11px] text-slate-400">Full allowance restoration countdown</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950/80 border border-indigo-500/20 flex flex-col justify-between">
              <span className="text-xs text-indigo-300 font-semibold">Member Privileges</span>
              <div className="space-y-1.5 my-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5x Allowance (10 prompts / 12h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SDXL AI Image Generation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Permanent Conversation History</span>
                </div>
              </div>
              <a href="https://www.webguruji.online/dashboard.html" target="_blank" className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium">Manage on HarshGuruJi &rarr;</a>
            </div>
          </div>
        </section>

        {/* 3. Analytics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saved Chats</span>
            <div className="text-2xl font-bold text-white">{stats.savedChats}</div>
            <span className="text-[10px] text-cyan-400">Stored locally</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Messages</span>
            <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
            <span className="text-[10px] text-indigo-400">Turns exchanged</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Images</span>
            <div className="text-2xl font-bold text-white">{stats.images}</div>
            <span className="text-[10px] text-purple-400">SDXL Lightning</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Language Mode</span>
            <div className="text-lg font-bold text-white capitalize">{lang}</div>
            <span className="text-[10px] text-emerald-400">Active conversational tag</span>
          </div>
        </section>

        {/* 4. AI Studio Settings */}
        <section className="rounded-3xl bg-[#0d121f] border border-slate-800 p-5 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-white">AI Studio Settings &amp; Personalization</h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize your assistant's dialect, theme, and creativity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Appearance Theme</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: 'dark', label: 'Dark Mode', desc: 'Obsidian' },
                  { key: 'light', label: 'Light Mode', desc: 'Slate' },
                  { key: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon Glow' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => handleSetTheme(t.key)}
                    className={`p-3 rounded-xl border text-left transition ${theme === t.key ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/90'}`}
                  >
                    <div className="text-xs font-bold text-white">{t.label}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">AI Conversational Language</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: 'english', label: 'English', desc: 'Global standard' },
                  { key: 'hinglish', label: 'Hinglish', desc: 'Hindi in English letters' },
                  { key: 'hindi', label: 'हिन्दी', desc: 'Devanagari script' },
                ].map(l => (
                  <button
                    key={l.key}
                    onClick={() => handleSetLang(l.key)}
                    className={`p-3 rounded-xl border text-left transition ${lang === l.key ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 bg-slate-900/90'}`}
                  >
                    <div className="text-xs font-bold text-white">{l.label}</div>
                    <div className="text-[10px] text-slate-400">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Font Family</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: 'sans', label: 'Inter Sans', desc: 'Clean modern' },
                  { key: 'serif', label: 'Merriweather', desc: 'Editorial' },
                  { key: 'mono', label: 'Fira Code', desc: 'Code Mono' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => handleSetFont(f.key)}
                    className={`p-2.5 rounded-xl border text-left transition ${font === f.key ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/90'}`}
                  >
                    <div className="text-xs font-bold text-white">{f.label}</div>
                    <div className="text-[10px] text-slate-400">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Creativity Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Creativity (Temperature)</label>
                <span className="font-mono text-xs text-cyan-400 font-bold">{temp}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temp}
                onChange={(e) => handleSetTemp(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1 (Precise/Code)</span>
                <span>0.7 (Balanced)</span>
                <span>1.0 (Creative/Stories)</span>
              </div>
            </div>
          </div>

          {notice && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notice}</span>
            </div>
          )}
        </section>

        {/* 5. Chat History Manager */}
        <section className="rounded-3xl bg-[#0d121f] border border-slate-800 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Your Chat Conversations</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage, export, or resume previous dialogue sessions.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleExportChats} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition">
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export (JSON)</span>
              </button>
              <button onClick={handleClearAllChats} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-xs text-rose-300 transition">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {!conversations.length ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6">
                <span className="text-2xl block mb-2">💬</span>
                <span className="font-medium text-slate-400 block mb-1">No saved conversations yet</span>
                <span className="text-[11px] text-slate-500 block mb-4">Start chatting on GuruAI to track conversations here.</span>
                <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow">
                  <span>Start Chatting</span> &rarr;
                </Link>
              </div>
            ) : (
              conversations.map(c => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition group">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition">
                      {c.title || 'Untitled Dialogue'}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{c.messages ? c.messages.length : 0} messages</span>
                      <span>●</span>
                      <span>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/?conv=${encodeURIComponent(c.id)}`} className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/80 text-[11px] font-semibold transition">
                      Resume
                    </Link>
                    <button onClick={() => handleDeleteSingle(c.id)} className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 6. Ecosystem Strip */}
        <section className="rounded-3xl bg-[#0d121f] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-300">HarshGuruJi Connected Ecosystem Portals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <a href="https://www.webguruji.online/dashboard.html" target="_blank" className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 text-slate-200 transition group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">🌐</div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Main WebGuruJi Dashboard</div>
                  <div className="text-[10px] text-slate-400">Profile, Badges &amp; Store</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>

            <a href="https://www.webguruji.online/store.html" target="_blank" className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 text-slate-200 transition group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">🎮</div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">HarshGuruJi App Store</div>
                  <div className="text-[10px] text-slate-400">APKs, Games &amp; Tools</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>

            <a href="https://books.webguruji.online/" target="_blank" className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 text-slate-200 transition group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">📚</div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">NCERT Books Library</div>
                  <div className="text-[10px] text-slate-400">Class 1-12 Textbooks</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0c101d] px-4 py-4 text-center text-xs text-slate-500 mt-auto">
        <span>GuruAI Studio Dashboard &copy; 2026 HarshGuruJi. All rights reserved.</span>
      </footer>
    </div>
  );
}
