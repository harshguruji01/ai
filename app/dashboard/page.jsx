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
  Palette,
  Image as ImageIcon,
  Bookmark,
  HelpCircle,
  MessageCircle,
  Menu,
  X,
  Plus,
  Copy,
  Edit2,
  Pin,
  Search,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quotas & Stats
  const [quota, setQuota] = useState({ remaining: 20, max: 20, windowStart: Date.now() });
  const [imageQuota, setImageQuota] = useState({ remaining: 5, max: 5 });
  const [resetTimer, setResetTimer] = useState('--:--:--');
  const [conversations, setConversations] = useState([]);
  const [creations, setCreations] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [promptCategory, setPromptCategory] = useState('All');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatSort, setChatSort] = useState('recent');

  // Preferences
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('english');
  const [font, setFont] = useState('sans');
  const [temp, setTemp] = useState('0.7');
  const [customInstructions, setCustomInstructions] = useState('');
  const [notice, setNotice] = useState('');

  // Modals
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [promptForm, setPromptForm] = useState({ title: '', category: 'Custom', prompt: '' });
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renamingChat, setRenamingChat] = useState({ id: '', title: '' });
  const [lightboxImg, setLightboxImg] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ fullName: '', username: '' });

  // Initial load
  useEffect(() => {
    // 1. Load preferences
    const savedTheme = localStorage.getItem('guruai_theme') || 'dark';
    const savedLang = localStorage.getItem('guruai_lang') || 'english';
    const savedFont = localStorage.getItem('guruai_font') || 'sans';
    const savedTemp = localStorage.getItem('guruai_temp') || '0.7';
    const savedInstr = localStorage.getItem('guruai_custom_instructions') || '';

    setTheme(savedTheme);
    setLang(savedLang);
    setFont(savedFont);
    setTemp(savedTemp);
    setCustomInstructions(savedInstr);

    // 2. Load conversations
    try {
      const convs = JSON.parse(localStorage.getItem('guruai_local_conversations') || '[]');
      setConversations(convs);

      // Extract image creations
      const imgs = [];
      convs.forEach(c => {
        if (Array.isArray(c.messages)) {
          c.messages.forEach(m => {
            if (m.imageUrl || (m.content && m.content.includes('http') && m.content.includes('image'))) {
              const url = m.imageUrl || (m.content.match(/https?:\/\/[^\s)]+/)?.[0]);
              if (url && !imgs.some(item => item.imageUrl === url)) {
                imgs.push({
                  id: m.id || Math.random().toString(36).slice(2),
                  prompt: m.prompt || c.title || 'SDXL Generation',
                  imageUrl: url,
                  createdAt: m.createdAt || c.updatedAt
                });
              }
            }
          });
        }
      });
      setCreations(imgs);
    } catch (e) {}

    // 3. Load saved prompts
    try {
      const savedP = JSON.parse(localStorage.getItem('guruai_saved_prompts') || '[]');
      if (savedP.length > 0) {
        setPrompts(savedP);
      } else {
        const defaultP = [
          { id: 'p1', title: 'Python Async API Handler', category: 'Coding', prompt: 'Write a high-performance asynchronous FastAPI endpoint with Pydantic request validation and structured error handling.' },
          { id: 'p2', title: 'Executive Project Summary', category: 'Writing', prompt: 'Summarize this technical architecture proposal into a high-level executive summary highlighting ROI, latency, and security.' },
          { id: 'p3', title: 'First-Principles Explainer', category: 'Learning', prompt: 'Explain the core mechanics of transformer attention mechanisms from first principles using an intuitive metaphor.' }
        ];
        setPrompts(defaultP);
        localStorage.setItem('guruai_saved_prompts', JSON.stringify(defaultP));
      }
    } catch (e) {}

    // 4. Check Session
    async function initSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setUser(session.user);
          setupQuota(session.user);

          // Fetch profile
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (prof) {
            setProfile(prof);
            setProfileForm({
              fullName: prof.display_name || session.user.user_metadata?.full_name || '',
              username: prof.username || session.user.user_metadata?.username || ''
            });
          }

          // Fetch saved prompts from Supabase
          const { data: dbPrompts } = await supabase.from('saved_prompts').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false });
          if (dbPrompts && dbPrompts.length > 0) {
            setPrompts(dbPrompts);
            localStorage.setItem('guruai_saved_prompts', JSON.stringify(dbPrompts));
          }
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
        console.warn('Session init notice:', err);
        setupQuota(null);
      } finally {
        setLoading(false);
      }
    }

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quota calculation & timer
  function setupQuota(currentUser) {
    const now = Date.now();
    const isMember = !!currentUser;
    const max = isMember ? 20 : 8;
    const windowDuration = (isMember ? 12 : 6) * 3600 * 1000;
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

    // Live countdown timer
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

  // Preference Handlers
  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('guruai_theme', newTheme);
    if (user && supabase) {
      supabase.from('user_preferences').upsert({ user_id: user.id, theme: newTheme, updated_at: new Date().toISOString() }).then(() => {});
    }
    showNotice(`Theme updated to ${newTheme}`);
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('guruai_lang', newLang);
    if (user && supabase) {
      supabase.from('user_preferences').upsert({ user_id: user.id, ai_language: newLang, updated_at: new Date().toISOString() }).then(() => {});
    }
    showNotice(`Language updated to ${newLang}`);
  };

  const handleSetFont = (newFont) => {
    setFont(newFont);
    localStorage.setItem('guruai_font', newFont);
    if (user && supabase) {
      supabase.from('user_preferences').upsert({ user_id: user.id, font_family: newFont, updated_at: new Date().toISOString() }).then(() => {});
    }
    showNotice(`Font family updated to ${newFont}`);
  };

  const handleSetTemp = (newTemp) => {
    setTemp(newTemp);
    localStorage.setItem('guruai_temp', newTemp);
    showNotice(`Creativity temperature set to ${newTemp}`);
  };

  const handleSaveInstructions = () => {
    localStorage.setItem('guruai_custom_instructions', customInstructions);
    showNotice('Custom instructions saved for Guru-Flash 1.1');
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('hg_auth_user');
    sessionStorage.clear();
    window.location.href = '/login';
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
    showNotice('Conversations exported as JSON');
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all saved conversations?')) {
      localStorage.removeItem('guruai_local_conversations');
      setConversations([]);
      showNotice('Conversation history cleared');
    }
  };

  const handleDeleteSingle = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem('guruai_local_conversations', JSON.stringify(updated));
    if (user && supabase) {
      supabase.from('conversations').delete().eq('id', id).eq('user_id', user.id).then(() => {});
    }
    showNotice('Conversation removed');
  };

  const handleSaveRename = () => {
    if (!renamingChat.title.trim()) return;
    const updated = conversations.map(c => c.id === renamingChat.id ? { ...c, title: renamingChat.title.trim(), updatedAt: new Date().toISOString() } : c);
    setConversations(updated);
    localStorage.setItem('guruai_local_conversations', JSON.stringify(updated));
    if (user && supabase) {
      supabase.from('conversations').update({ title: renamingChat.title.trim(), updated_at: new Date().toISOString() }).eq('id', renamingChat.id).eq('user_id', user.id).then(() => {});
    }
    setRenameModalOpen(false);
    showNotice('Conversation renamed');
  };

  const handleTogglePin = (id) => {
    const updated = conversations.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c);
    setConversations(updated);
    localStorage.setItem('guruai_local_conversations', JSON.stringify(updated));
    showNotice('Pin status updated');
  };

  // Prompts Management
  const handleSavePrompt = (e) => {
    e.preventDefault();
    if (!promptForm.title.trim() || !promptForm.prompt.trim()) return;

    if (editingPrompt) {
      const updated = prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptForm, updatedAt: new Date().toISOString() } : p);
      setPrompts(updated);
      localStorage.setItem('guruai_saved_prompts', JSON.stringify(updated));
      if (user && supabase) {
        supabase.from('saved_prompts').update({ ...promptForm, updated_at: new Date().toISOString() }).eq('id', editingPrompt.id).eq('user_id', user.id).then(() => {});
      }
      showNotice('Prompt updated');
    } else {
      const newP = {
        id: 'p_' + Math.random().toString(36).slice(2),
        ...promptForm,
        createdAt: new Date().toISOString()
      };
      const updated = [newP, ...prompts];
      setPrompts(updated);
      localStorage.setItem('guruai_saved_prompts', JSON.stringify(updated));
      if (user && supabase) {
        supabase.from('saved_prompts').insert({ user_id: user.id, ...promptForm }).then(() => {});
      }
      showNotice('Prompt added to library');
    }

    setPromptModalOpen(false);
    setEditingPrompt(null);
    setPromptForm({ title: '', category: 'Custom', prompt: '' });
  };

  const handleDeletePrompt = (id) => {
    const updated = prompts.filter(p => p.id !== id);
    setPrompts(updated);
    localStorage.setItem('guruai_saved_prompts', JSON.stringify(updated));
    if (user && supabase) {
      supabase.from('saved_prompts').delete().eq('id', id).eq('user_id', user.id).then(() => {});
    }
    showNotice('Prompt deleted');
  };

  // Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user || !supabase) return;

    try {
      await supabase.from('profiles').update({
        display_name: profileForm.fullName,
        username: profileForm.username || null,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);

      await supabase.auth.updateUser({
        data: { full_name: profileForm.fullName, username: profileForm.username }
      });

      showNotice('Profile updated successfully');
    } catch (err) {
      showNotice('Failed to update profile');
    }
  };

  const handleSendResetPassword = async () => {
    if (!user?.email || !supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/login?mode=reset'
    });
    if (error) {
      showNotice(error.message);
    } else {
      showNotice(`Password reset email sent to ${user.email}`);
    }
  };

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const displayEmail = user?.email || 'member@webguruji.online';
  const isGoldenTick = profile?.golden_tick || profile?.is_golden_tick;
  const isAdmin = profile?.role === 'admin' || profile?.is_admin;

  // Filter conversations
  let filteredConversations = [...conversations];
  if (chatSearch.trim()) {
    const q = chatSearch.toLowerCase();
    filteredConversations = filteredConversations.filter(c => (c.title || '').toLowerCase().includes(q));
  }
  if (chatSort === 'recent') {
    filteredConversations.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } else if (chatSort === 'oldest') {
    filteredConversations.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
  } else if (chatSort === 'title') {
    filteredConversations.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  // Filter prompts
  let filteredPrompts = prompts;
  if (promptCategory !== 'All') {
    filteredPrompts = filteredPrompts.filter(p => p.category === promptCategory);
  }

  return (
    <div className={`min-h-screen flex h-screen overflow-hidden bg-[#070913] text-slate-100 ${theme === 'light' ? 'theme-light' : theme === 'cyberpunk' ? 'theme-cyberpunk' : ''}`}>
      
      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-indigo-950/95 border border-indigo-500/50 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity" />
      )}

      {/* WORKSPACE SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 flex flex-col justify-between bg-[#0d111d] border-r border-slate-800 transition-transform duration-300 select-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#070913] border border-indigo-500/50 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.png" alt="GuruAI Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight group-hover:text-cyan-400 transition-colors">GuruAI</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase font-semibold">Workspace</span>
              </div>
              <p className="text-[10px] text-slate-400">by HarshGuruJi</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start New Chat Action */}
        <div className="px-3 pt-3">
          <Link href="/?new=true" className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center justify-between shadow-lg shadow-indigo-500/25 transition group">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Start New Chat</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-cyan-200">⌘N</span>
          </Link>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">Workspace</div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'overview' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('chats'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'chats' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>My Chats</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">{conversations.length}</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('creations'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'creations' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>My Creations</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">{creations.length}</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('prompts'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'prompts' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4" />
                    <span>Saved Prompts</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">{prompts.length}</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">Account</div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => { setActiveTab('usage'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'usage' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4" />
                    <span>Usage &amp; Plan</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">{isAdmin ? 'Admin' : 'Pro'}</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'profile' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </div>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('preferences'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'preferences' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4" />
                    <span>Preferences</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">Support</div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => { setActiveTab('help'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'help' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Help Center</span>
                  </div>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }} className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${activeTab === 'feedback' ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Feedback</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-[#070913]/70">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate block">{displayName}</span>
                <span className="text-[10px] text-slate-400 truncate block">{displayEmail}</span>
              </div>
            </div>
            <button onClick={handleSignOut} className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0d111d]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">Workspace</span>
              <span className="text-slate-400 hidden sm:inline">/</span>
              <span className="font-semibold text-white capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => handleSetTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'cyberpunk' : 'dark')} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs transition">
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a href="https://webguruji.online/dashboard.html" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>WebGuruJi</span>
            </a>

            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-cyan-300 text-xs font-semibold shadow-sm transition">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Return to Chat</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0e1428] via-[#0d111d] to-[#070913] p-6 sm:p-8 shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Workspace Active</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">{displayName}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Unified GuruAI workspace for intelligence, coding, and creative generation powered by <strong className="text-cyan-300 font-semibold">Guru-Flash 1.1</strong> &amp; SDXL.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link href="/?new=true" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 text-white text-xs font-semibold shadow transition">
                      <Sparkles className="w-4 h-4" />
                      <span>Start New Chat</span>
                    </Link>
                    <button onClick={() => setActiveTab('creations')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Explore AI Studio</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Quota & Allowance (TEST-REQUIRED TEXT PRESERVED) */}
              <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Live AI Quota &amp; Allowance</h2>
                      <p className="text-[11px] text-slate-400">Rolling 12-hour member allocation</p>
                    </div>
                  </div>
                  <button onClick={() => setupQuota(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Text Requests</span>
                      <span className="font-mono text-cyan-300 font-semibold">{quota.max} Max</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white">{quota.remaining}</span>
                      <span className="text-xs text-slate-400">/ {quota.max} remaining</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (quota.remaining / quota.max) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>SDXL Images</span>
                      <span className="font-mono text-cyan-300 font-semibold">5 / 24h</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white">{imageQuota.remaining}</span>
                      <span className="text-xs text-slate-400">/ 5 available</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Allowance Reset</span>
                      <span className="text-emerald-400 font-mono text-[10px] font-semibold">Active Window</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-mono font-bold text-white">{resetTimer}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Automatic replenishment</p>
                  </div>
                </div>
              </div>

              {/* Quick AI Launchers */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Quick AI Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <Link href="/?prompt=Hello%20GuruAI,%20help%20me%20with%20my%20task" className="p-4 rounded-2xl bg-[#0d111d] border border-slate-800 hover:border-indigo-500/50 flex items-start gap-3.5 transition group">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300">Ask GuruAI</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">Ask questions and analyze documents with Guru-Flash 1.1.</p>
                    </div>
                  </Link>

                  <Link href="/?prompt=Review%20and%20debug%20this%20code:%20" className="p-4 rounded-2xl bg-[#0d111d] border border-slate-800 hover:border-cyan-500/50 flex items-start gap-3.5 transition group">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300">Write &amp; Debug Code</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">Generate algorithms, optimize React, or fix bugs.</p>
                    </div>
                  </Link>

                  <Link href="/?image_mode=true" className="p-4 rounded-2xl bg-[#0d111d] border border-slate-800 hover:border-purple-500/50 flex items-start gap-3.5 transition group">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300">Generate an Image</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">Create high-resolution concepts with Stable Diffusion XL.</p>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* TAB: CHATS */}
          {activeTab === 'chats' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h1 className="text-lg font-bold text-white">My Conversations</h1>
                  <p className="text-xs text-slate-400">Search, rename, pin, and manage conversation history.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportChats} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button onClick={handleClearAllChats} className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search conversations by title..." className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <select value={chatSort} onChange={(e) => setChatSort(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none">
                  <option value="recent">Sort: Most Recent</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="title">Sort: Title (A-Z)</option>
                </select>
              </div>

              <div className="space-y-2.5">
                {!filteredConversations.length ? (
                  <div className="text-center py-12 text-xs text-slate-400 bg-slate-950/40 rounded-3xl border border-slate-800 p-8 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                    <span className="font-bold text-sm text-slate-200 block">No conversations found</span>
                    <p className="text-[11px] text-slate-400">Start your first dialogue with GuruAI.</p>
                  </div>
                ) : (
                  filteredConversations.map(c => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-[#0d111d] border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{c.title || 'Untitled Dialogue'}</span>
                          {c.isPinned && <span className="text-[10px] text-amber-400">📌</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                          <span>{c.messages ? c.messages.length : 0} messages</span>
                          <span>•</span>
                          <span>Updated {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/?conv=${encodeURIComponent(c.id)}`} className="px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/40 text-cyan-300 text-xs font-semibold hover:bg-indigo-900 transition">
                          Resume
                        </Link>
                        <button onClick={() => { setRenamingChat({ id: c.id, title: c.title || '' }); setRenameModalOpen(true); }} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition" title="Rename">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleTogglePin(c.id)} className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition" title="Pin">
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteSingle(c.id)} className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: CREATIONS */}
          {activeTab === 'creations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h1 className="text-lg font-bold text-white">My AI Creations</h1>
                  <p className="text-xs text-slate-400">All hyper-realistic images synthesized via Stable Diffusion XL.</p>
                </div>
                <Link href="/?image_mode=true" className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Image</span>
                </Link>
              </div>

              {!creations.length ? (
                <div className="text-center py-16 text-xs text-slate-400 bg-slate-950/40 rounded-3xl border border-slate-800 p-8 space-y-3">
                  <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                  <span className="font-bold text-sm text-slate-200 block">No images created yet</span>
                  <p className="text-[11px] text-slate-400">Generate high-definition visuals using SDXL.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {creations.map(img => (
                    <div key={img.id} className="rounded-2xl bg-[#0d111d] border border-slate-800 overflow-hidden flex flex-col justify-between group">
                      <div className="aspect-square bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setLightboxImg(img)}>
                        <img src={img.imageUrl} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-xs text-slate-300 line-clamp-2">{img.prompt}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="text-slate-400">{img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'Recent'}</span>
                          <a href={img.imageUrl} download="creation.png" className="text-cyan-400 hover:underline">Download</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h1 className="text-lg font-bold text-white">Saved Prompt Library</h1>
                  <p className="text-xs text-slate-400">Curate and launch your reusable prompt templates.</p>
                </div>
                <button onClick={() => { setEditingPrompt(null); setPromptForm({ title: '', category: 'Custom', prompt: '' }); setPromptModalOpen(true); }} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prompt</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Coding', 'Writing', 'Learning', 'Business', 'Custom'].map(cat => (
                  <button key={cat} onClick={() => setPromptCategory(cat)} className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${promptCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-700 text-slate-300'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map(p => (
                  <div key={p.id} className="rounded-2xl bg-[#0d111d] border border-slate-800 p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{p.title}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">{p.category}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">{p.prompt}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <Link href={`/?prompt=${encodeURIComponent(p.prompt)}`} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                        Use Prompt
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditingPrompt(p); setPromptForm({ title: p.title, category: p.category, prompt: p.prompt }); setPromptModalOpen(true); }} className="p-1 rounded text-slate-400 hover:text-white">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeletePrompt(p.id)} className="p-1 rounded text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: USAGE & PLAN */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white">Usage &amp; Plan Management</h1>
                <p className="text-xs text-slate-400">Transparent breakdown of allowances and limits.</p>
              </div>

              <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-indigo-400 font-semibold">Active Plan</span>
                    <h2 className="text-2xl font-bold text-white mt-0.5">{isAdmin ? 'Admin Tier' : 'Pro Member'}</h2>
                    <p className="text-xs text-slate-300 mt-1">20 Requests per 12-hour rolling window • 5 SDXL image creations per 24 hours.</p>
                  </div>
                  <button onClick={() => setPlanModalOpen(true)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
                    Manage / Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white">Account Profile</h1>
                <p className="text-xs text-slate-400">Personal identity and credentials.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-2xl flex items-center justify-center">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{displayName}</h3>
                    <p className="text-xs text-slate-400">{displayEmail}</p>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-3xl bg-[#0d111d] border border-slate-800 p-6 space-y-4">
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                        <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                        <input type="text" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Save Profile</button>
                  </form>

                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-white">Password &amp; Security</h4>
                    <button onClick={handleSendResetPassword} className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white">
                      Send Password Reset Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white">Workspace Preferences</h1>
                <p className="text-xs text-slate-400">Themes, typography, and AI behavior.</p>
              </div>

              <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 space-y-6">
                
                {/* Theme */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-white">Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'dark', label: 'Dark Slate', desc: 'Default dark surface' },
                      { key: 'light', label: 'Daylight Light', desc: 'Clean daylight contrast' },
                      { key: 'cyberpunk', label: 'Cyberpunk Matrix', desc: 'Neon cyan & purple' }
                    ].map(t => (
                      <button key={t.key} onClick={() => handleSetTheme(t.key)} className={`p-3 rounded-2xl border text-left transition ${theme === t.key ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'}`}>
                        <div className="text-xs font-semibold text-white">{t.label}</div>
                        <div className="text-[10px] text-slate-400">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold text-white">Language</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'english', label: 'English' },
                      { key: 'hinglish', label: 'Hinglish' },
                      { key: 'hindi', label: 'Hindi (हिन्दी)' }
                    ].map(l => (
                      <button key={l.key} onClick={() => handleSetLang(l.key)} className={`p-3 rounded-xl border text-center text-xs font-medium transition ${lang === l.key ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-300'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold text-white">Font Family</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'sans', label: 'Inter Sans' },
                      { key: 'serif', label: 'Merriweather' },
                      { key: 'mono', label: 'Fira Code' }
                    ].map(f => (
                      <button key={f.key} onClick={() => handleSetFont(f.key)} className={`p-3 rounded-xl border text-center text-xs font-medium transition ${font === f.key ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-300'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Creativity (Temperature)</label>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{temp}</span>
                  </div>
                  <input type="range" min="0.1" max="1.0" step="0.1" value={temp} onChange={(e) => handleSetTemp(e.target.value)} className="w-full accent-indigo-500 cursor-pointer" />
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold text-white">Custom System Instructions</label>
                  <textarea rows="3" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} placeholder="E.g., Respond like a senior full-stack engineer..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                  <div className="flex justify-end">
                    <button onClick={handleSaveInstructions} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Save Instructions</button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: HELP */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white">Help Center</h1>
                <p className="text-xs text-slate-400">Frequently asked questions and shortcuts.</p>
              </div>

              <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">FAQ</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-white block mb-1">What is Guru-Flash 1.1?</span>
                    <p className="text-[11px] text-slate-400">Guru-Flash 1.1 is our custom reasoning model tailored for rapid responses, programming, and Indian dialects.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-white block mb-1">How do quotas refresh?</span>
                    <p className="text-[11px] text-slate-400">Members receive 20 chat requests per 12-hour rolling window and 5 image synthesis operations per 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg font-bold text-white">Send Feedback</h1>
                <p className="text-xs text-slate-400">Directly contact HarshGuruJi with your ideas and issues.</p>
              </div>

              <div className="rounded-3xl bg-[#0d111d] border border-slate-800 p-6 max-w-xl space-y-4">
                <form onSubmit={(e) => { e.preventDefault(); showNotice('Feedback sent! Thank you.'); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback Subject</label>
                    <input type="text" required placeholder="Subject..." className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Details</label>
                    <textarea rows="4" required placeholder="Describe your experience..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Submit Feedback</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PROMPT MODAL */}
      {promptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1222] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setPromptModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white">{editingPrompt ? 'Edit Prompt' : 'Add Custom Prompt'}</h3>
            <form onSubmit={handleSavePrompt} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input type="text" required value={promptForm.title} onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select value={promptForm.category} onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                  <option value="Coding">Coding</option>
                  <option value="Writing">Writing</option>
                  <option value="Learning">Learning</option>
                  <option value="Business">Business</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content</label>
                <textarea rows="4" required value={promptForm.prompt} onChange={(e) => setPromptForm({ ...promptForm, prompt: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPromptModalOpen(false)} className="px-3.5 py-2 text-xs font-semibold text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1222] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Rename Conversation</h3>
            <input type="text" value={renamingChat.title} onChange={(e) => setRenamingChat({ ...renamingChat, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameModalOpen(false)} className="px-3.5 py-2 text-xs text-slate-400">Cancel</button>
              <button onClick={handleSaveRename} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxImg(null)} className="absolute -top-10 right-0 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImg.imageUrl} alt={lightboxImg.prompt} className="max-h-[75vh] w-auto rounded-2xl border border-slate-800 object-contain shadow-2xl" />
            <div className="mt-4 w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-300 truncate font-mono">{lightboxImg.prompt}</p>
              <a href={lightboxImg.imageUrl} download="creation.png" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">Download</a>
            </div>
          </div>
        </div>
      )}

      {/* PLAN MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1222] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setPlanModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white text-center">Upgrade GuruAI Plan</h3>
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase">Pro Plus</span>
              <h4 className="text-xl font-bold text-white">₹299 <span className="text-xs text-slate-400 font-normal">/ mo</span></h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>✓ 50 Requests / 12h</li>
                <li>✓ 20 SDXL Images / 24h</li>
                <li>✓ Priority GPU Scheduling</li>
              </ul>
              <a href="https://webguruji.online/contact.html?subject=ai_upgrade&plan=Pro%20Plus&price=299" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">
                Inquire on WebGuruJi
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
