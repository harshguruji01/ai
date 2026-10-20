'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Settings,
  LogOut,
  LogIn,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Terminal,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import GuruLogo from '@/components/GuruLogo';

// Date grouping helper
function groupConversationsByDate(conversations) {
  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysStart = todayStart - 7 * 86400000;

  conversations.forEach((conv) => {
    const timestamp = new Date(conv.updated_at || conv.created_at).getTime();
    if (timestamp >= todayStart) {
      groups.Today.push(conv);
    } else if (timestamp >= yesterdayStart) {
      groups.Yesterday.push(conv);
    } else if (timestamp >= sevenDaysStart) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  return groups;
}

export default function ChatSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  user,
  remainingAllowance,
  maxRequests,
  onOpenSettings,
  onLogout,
  currentTheme = 'dark',
  onQuickThemeToggle,
  onOpenAuth,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const submitRename = (convId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = (convId, e) => {
    e.stopPropagation();
    onDeleteConversation(convId);
    setDeleteConfirmId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col justify-between transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-72'}`}
      >
        {/* Header */}
        <div className="p-3.5 space-y-3 flex-shrink-0 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group overflow-hidden"
              title="GuruAI by HarshGuruJi"
            >
              <GuruLogo size={32} />
              {!isCollapsed && (
                <div className="leading-tight truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-wide text-white group-hover:text-cyan-400 transition">
                      GuruAI
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 py-0.2 rounded">
                      Pro
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">
                    by HarshGuruJi
                  </span>
                </div>
              )}
            </a>

            {/* Desktop Collapse & Mobile Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="md:hidden p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          {!isCollapsed ? (
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-700/60 bg-gradient-to-r from-slate-900 to-indigo-950/40 hover:from-indigo-900/40 hover:to-slate-800/80 text-slate-100 text-xs font-semibold shadow-sm transition group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
                <span>New Conversation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Clear
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNewChat()}
              aria-label="New Conversation"
              className="w-full p-2.5 flex justify-center rounded-xl bg-slate-900 hover:bg-indigo-600/30 text-cyan-400 border border-slate-700/60 transition"
              title="New Conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

          {/* Search Box (Expanded Only) */}
          {!isCollapsed && user && conversations.length > 2 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {!isCollapsed ? (
            user ? (
              filteredConversations.length > 0 ? (
                Object.entries(groupedConversations).map(([groupTitle, convList]) => {
                  if (convList.length === 0) return null;
                  return (
                    <div key={groupTitle} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{groupTitle}</span>
                      </div>
                      {convList.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        const isEditing = editingId === conv.id;
                        const isDeleting = deleteConfirmId === conv.id;

                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              onSelectConversation(conv.id);
                              onClose();
                            }}
                            className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer border ${
                              isActive
                                ? 'bg-indigo-600/15 border-indigo-500/60 text-white font-medium shadow-sm'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <MessageSquare
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-indigo-400'
                                }`}
                              />
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-36"
                                  autoFocus
                                />
                              ) : (
                                <span className="truncate">{conv.title}</span>
                              )}
                            </div>

                            {/* Actions on hover or deletion confirm */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isEditing ? (
                                <button
                                  onClick={(e) => submitRename(conv.id, e)}
                                  className="p-1 hover:text-emerald-400 text-slate-300"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : isDeleting ? (
                                <div
                                  className="flex items-center gap-1 bg-rose-950/80 border border-rose-800 rounded px-1 py-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => confirmDelete(conv.id, e)}
                                    className="text-[10px] text-rose-300 font-bold hover:text-rose-100"
                                  >
                                    Delete?
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmId(null);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-white"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => startRename(conv, e)}
                                    className="p-1 text-slate-400 hover:text-white"
                                    title="Rename"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmId(conv.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-400"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-8 text-xs text-slate-400 italic text-center">
                  {searchQuery ? 'No matching chats found.' : 'No saved conversations yet.'}
                </div>
              )
            ) : (
              /* Guest Privacy Card */
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guest Privacy Mode</span>
                </div>
                <p className="leading-relaxed">
                  Your chat history is kept purely in temporary memory and never stored in the database.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAuth?.('login')}
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold pt-1 cursor-pointer transition"
                >
                  <span>Sign in to save chats</span>
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            /* Collapsed Icons Only */
            <div className="flex flex-col items-center space-y-2 pt-2">
              {conversations.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 ${
                    c.id === activeConversationId ? 'bg-indigo-600/20 text-cyan-400' : ''
                  }`}
                  title={c.title}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2.5 flex-shrink-0">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    remainingAllowance > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-slate-300 font-medium">
                  {user ? 'Member Allowance' : 'Guest Allowance'}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-cyan-400">
                {remainingAllowance}/{maxRequests}
              </span>
            </div>
          )}

          {/* Account & Controls Row */}
          <div className="flex items-center justify-between pt-1">
            {!isCollapsed ? (
              user ? (
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {user.email}
                    </div>
                    <div className="text-[10px] text-cyan-400">Signed In</div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => onOpenAuth?.('login')}
                  className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition group"
                  title="Click to sign in with email"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-indigo-600/30 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 text-xs font-bold transition">
                    G
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold text-slate-300 group-hover:text-white transition">Guest Visitor</div>
                    <div className="text-[10px] text-cyan-400 group-hover:underline">Click to Sign In</div>
                  </div>
                </div>
              )
            ) : null}

            <div className="flex items-center gap-1">
              {/* Quick Theme Toggle */}
              {onQuickThemeToggle && !isCollapsed && (
                <button
                  onClick={onQuickThemeToggle}
                  title={`Current theme: ${currentTheme}. Click to switch.`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  {currentTheme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : currentTheme === 'cyberpunk' ? (
                    <Terminal className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              )}

              <button
                onClick={onOpenSettings}
                title="Settings"
                aria-label="Open Settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <Settings className="w-4 h-4" />
              </button>

              {user ? (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth?.('login')}
                  title="Sign In with Email"
                  aria-label="Sign In with Email"
                  className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
