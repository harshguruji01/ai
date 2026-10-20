'use client';

import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

export default function UsageBadge({
  remainingAllowance = 2,
  maxRequests = 2,
  isLoggedIn = false,
  resetInSeconds = 0,
  onClick,
}) {
  const isExhausted = remainingAllowance <= 0;
  const hours = Math.floor(resetInSeconds / 3600);
  const minutes = Math.ceil((resetInSeconds % 3600) / 60);

  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm ${
        isExhausted
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
          : 'bg-indigo-500/10 border-indigo-500/30 text-cyan-400 hover:bg-indigo-500/20 hover:border-cyan-400/50'
      }`}
      title={
        isExhausted
          ? `Allowance exhausted. Resets in ${hours}h ${minutes}m.`
          : `${remainingAllowance} of ${maxRequests} requests remaining.`
      }
      aria-label="Generation allowance status"
    >
      {isExhausted ? (
        <Clock className="w-3.5 h-3.5 animate-pulse text-rose-400" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      )}

      <span className="font-mono">
        {remainingAllowance}/{maxRequests}
      </span>

      {!isLoggedIn && (
        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-amber-300 ml-0.5">
          Guest
        </span>
      )}
    </button>
  );
}
