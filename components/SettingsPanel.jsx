'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Moon,
  Sun,
  Terminal,
  Type,
  Globe,
  User,
  Shield,
  Check,
  ExternalLink,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';
import GuruLogo from '@/components/GuruLogo';

export default function SettingsPanel({
  isOpen,
  onClose,
  isLoggedIn,
  user,
  preferences,
  onSavePreferences,
  remainingAllowance = 2,
  maxRequests = 2,
  onOpenAuth,
}) {
  const [theme, setTheme] = useState(preferences.theme || 'dark');
  const [fontSize, setFontSize] = useState(preferences.font_size || 'medium');
  const [fontFamily, setFontFamily] = useState(preferences.font_family || 'sans');
  const [aiLanguage, setAiLanguage] = useState(preferences.ai_language || 'english');
  const [activeTab, setActiveTab] = useState('appearance');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  useEffect(() => {
    setTheme(preferences.theme || 'dark');
    setFontSize(preferences.font_size || 'medium');
    setFontFamily(preferences.font_family || 'sans');
    setAiLanguage(preferences.ai_language || 'english');
  }, [preferences, isOpen]);

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
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const loginUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://webguruji.online';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GuruAI Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl overflow-hidden text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <GuruLogo size={28} />
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">GuruAI Preferences</h2>
              <span className="text-[10px] text-slate-400">Customization & Account</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-color)] px-6 pt-2 gap-4 text-xs font-semibold">
          {[
            { id: 'appearance', label: 'Appearance', icon: Moon },
            { id: 'ai', label: 'AI Language', icon: Globe },
            { id: 'account', label: 'Account', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guest Lock Banner */}
        {!isLoggedIn && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Settings sync is locked for Guest users</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="text-[11px] font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full hover:bg-amber-400 transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Settings Body */}
        <div className={`p-6 space-y-5 ${!isLoggedIn && activeTab !== 'account' ? 'opacity-70' : ''}`}>
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5 animate-fade-in">
              {/* Theme Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'dark', label: 'Dark Slate', icon: Moon, accent: 'border-indigo-500' },
                    { id: 'light', label: 'Light Clean', icon: Sun, accent: 'border-blue-500' },
                    { id: 'cyberpunk', label: 'Cyberpunk', icon: Terminal, accent: 'border-cyan-400' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition text-xs font-medium ${
                          isSelected
                            ? `bg-slate-800 ${t.accent} text-white shadow-md ring-1 ${t.accent}`
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Text Scale
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="small">Small (14px)</option>
                    <option value="medium">Medium (16px — Default)</option>
                    <option value="large">Large (18px)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sans">System Sans-Serif</option>
                    <option value="serif">Editorial Serif</option>
                    <option value="mono">Developer Monospace</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI LANGUAGE */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                  AI Response Language
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  GuruAI dynamically formulates responses tailored to your chosen linguistic style.
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'english', label: 'English', desc: 'Standard English' },
                    { id: 'hinglish', label: 'Hinglish', desc: 'Hindi in Roman script' },
                    { id: 'hindi', label: 'Hindi', desc: 'हिंदी देवनागरी' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setAiLanguage(lang.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        aiLanguage === lang.id
                          ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-sm ring-1 ring-indigo-400'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{lang.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{lang.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & QUOTA */}
          {activeTab === 'account' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  Authentication Status
                </div>
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-200">{user?.email}</div>
                      <div className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Verified WebGuruJi Member</span>
                      </div>
                    </div>
                    <a
                      href={`${mainSiteUrl}/dashboard.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/20 text-xs font-semibold transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Open User Dashboard</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-amber-300 font-semibold">Guest Visitor</div>
                    <p className="text-slate-400 text-[11px]">
                      Sign in with your WebGuruJi account to persist chats and unlock SDXL image creation.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-300">Remaining Quota</div>
                  <div className="text-[11px] text-slate-400">
                    {isLoggedIn ? '12-hour rolling window' : '6-hour rolling window'}
                  </div>
                </div>
                <div className="font-mono text-cyan-400 font-bold text-sm">
                  {remainingAllowance} / {maxRequests} Left
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by NVIDIA NIM & Supabase
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : saving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sign In</span>
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
