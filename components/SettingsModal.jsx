'use client';

import React, { useState } from 'react';
import { X, Lock, Check, Sparkles, Moon, Sun, Terminal, Type, Globe } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  isLoggedIn,
  preferences,
  onSavePreferences,
  onClearHistory,
}) {
  const [theme, setTheme] = useState(preferences.theme || 'dark');
  const [fontSize, setFontSize] = useState(preferences.font_size || 'medium');
  const [fontFamily, setFontFamily] = useState(preferences.font_family || 'sans');
  const [aiLanguage, setAiLanguage] = useState(preferences.ai_language || 'english');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!isLoggedIn) return;
    setSaving(true);
    await onSavePreferences({
      theme,
      font_size: fontSize,
      font_family: fontFamily,
      ai_language: aiLanguage,
    });
    setSaving(false);
    onClose();
  };

  const loginUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold tracking-wide">AI Customization & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Lock Banner */}
        {!isLoggedIn && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Preferences are locked for Guests</span>
            </div>
            <a
              href={loginUrl}
              className="text-xs font-semibold bg-amber-500 text-slate-950 px-3 py-1 rounded-full hover:bg-amber-400 transition"
            >
              Login to Unlock
            </a>
          </div>
        )}

        {/* Content Body */}
        <div className={`p-6 space-y-6 ${!isLoggedIn ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* 1. Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Moon className="w-4 h-4 text-indigo-400" />
              Interface Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark Slate</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('cyberpunk')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                  theme === 'cyberpunk'
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/30'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Terminal className="w-5 h-5" />
                <span>Cyberpunk Neon</span>
              </button>
            </div>
          </div>

          {/* 2. Typography & Font Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Type className="w-4 h-4 text-emerald-400" />
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="small">Small (14px)</option>
                <option value="medium">Medium (16px - Default)</option>
                <option value="large">Large (18px)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Type className="w-4 h-4 text-emerald-400" />
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="sans">Modern Sans-Serif</option>
                <option value="serif">Editorial Serif</option>
                <option value="mono">Developer Monospace</option>
              </select>
            </div>
          </div>

          {/* 3. AI Output Language */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              AI Output Language (Prompted to Model)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'english', label: 'English', desc: 'Global English' },
                { id: 'hinglish', label: 'Hinglish', desc: 'Hindi in Roman' },
                { id: 'hindi', label: 'Hindi', desc: 'हिंदी देवनागरी' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setAiLanguage(lang.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    aiLanguage === lang.id
                      ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{lang.label}</div>
                  <div className="text-[10px] text-slate-500">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat History management */}
          {isLoggedIn && onClearHistory && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Manage Stored Chats</span>
              <button
                type="button"
                onClick={onClearHistory}
                className="text-red-400 hover:text-red-300 hover:underline"
              >
                Clear All Saved Chat History
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply & Save'}
            </button>
          ) : (
            <a
              href={loginUrl}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
            >
              Login at WebGuruJi
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
