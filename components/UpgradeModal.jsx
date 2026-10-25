'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, QrCode, Mail, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpgradeModal({
  isOpen,
  onClose,
  user,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedPlan, setSubmittedPlan] = useState(null);

  if (!isOpen) return null;

  const handlePlanBuy = async (planName, contextLimit, price) => {
    const email = user?.email || '';
    if (!email) {
      alert('Please sign in first so your upgrade can be linked to your registered email account.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit to Supabase contact_messages
      const supabase = createClient();
      const userName = user?.user_metadata?.name || email.split('@')[0];
      await supabase.from('contact_messages').insert([{
        name: userName,
        email: email,
        subject: 'AI_UPGRADE',
        message: `GuruAI Upgrade Request: ${planName} ($${price}). Context Window Limit: ${contextLimit} Tokens. User ID: ${user.id}`,
        status: 'Pending',
        created_at: new Date().toISOString(),
      }]);

      // 2. Dispatch invoice email with QR and UPI placeholders
      await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          name: userName,
          type: 'ai_upgrade_invoice',
          planName,
          planPrice: price,
          contextLimit,
        }),
      });

      setSubmittedPlan({ planName, price, contextLimit, email });
    } catch (e) {
      console.warn('Upgrade invoice submission error:', e);
      // Fallback open contact
      const params = new URLSearchParams({
        subject: 'ai_upgrade',
        plan: planName,
        context: contextLimit.toString(),
        price: price.toString(),
        email: email,
      });
      window.open(`https://webguruji.online/contact.html?${params.toString()}`, '_blank');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="GuruAI Upgrade & Context Expansion"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl shadow-indigo-950/70 p-5 sm:p-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close Upgrade Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>GuruAI Premium Upgrade &amp; Context Expansion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
            Upgrade Your Context &amp; Daily Limits
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Free tier includes <strong>8 requests</strong> (guest) and <strong>20 requests</strong> (members). Upgrade to unlock continuous multi-turn memory, massive token context windows, and priority inference.
          </p>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Tier 1: Starter Pro ($5) */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter Pro</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-200 font-mono font-bold">$5 / mo</span>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-extrabold text-white">50,000</div>
                <div className="text-xs text-cyan-400 font-semibold tracking-wide">Tokens Context Limit</div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>100 Daily Chats</strong> (12h cycle)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>50,000 Token Memory Buffer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Fast GPU processing speed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full homework &amp; coding tutorials</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanBuy('Starter Pro ($5)', 50000, 5)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <span>Upgrade to Starter ($5)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tier 2: Power Scholar ($15 - Recommended / Best Value) */}
          <div className="rounded-2xl bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950 border-2 border-indigo-500/70 p-5 sm:p-6 flex flex-col justify-between hover:border-indigo-400 transition relative shadow-2xl shadow-indigo-950/60">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow">
              🔥 Best Value • 3.5x Context
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Power Scholar</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-xs text-cyan-300 font-mono font-bold">$15 / mo</span>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-extrabold text-white">175,000</div>
                <div className="text-xs text-indigo-300 font-semibold tracking-wide">Tokens Context Limit</div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>350 Daily Chats</strong> (12h cycle)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>175,000 Token Memory</strong> (3.5x Starter)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Multi-document analysis &amp; PDF digest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Deep chain-of-thought problem solving</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanBuy('Power Scholar ($15)', 175000, 15)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/40 hover:opacity-95 transition flex items-center justify-center gap-1.5"
            >
              <span>Upgrade to Scholar ($15)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tier 3: Grandmaster Enterprise ($25) */}
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Grandmaster</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-xs text-purple-300 font-mono font-bold">$25 / mo</span>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-extrabold text-white">325,000</div>
                <div className="text-xs text-purple-300 font-semibold tracking-wide">Tokens Context Limit</div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Unlimited Priority Chats</strong> (24h)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>325,000 Token Massive Context</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full textbook &amp; codebase ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Dedicated GPU channel &amp; early access</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePlanBuy('Grandmaster Enterprise ($25)', 325000, 25)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <span>Upgrade to Grandmaster ($25)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span>Clicking any plan redirects to <strong>webguruji.online/contact.html</strong>. Once your request is submitted, HarshGuruJi Admin activates your new limit live!</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded">Live Admin Sync</span>
        </div>
      </div>
    </div>
  );
}
