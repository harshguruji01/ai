'use client';

import React from 'react';

export default function GuruLogo({ size = 28, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="guruGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="sparkGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="#0A0E1A" />
        <rect
          width="30"
          height="30"
          x="1"
          y="1"
          rx="8"
          stroke="url(#guruGradComp)"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />
        <path
          d="M19.5 11.5C18.2 10.3 16.4 9.5 14.5 9.5C10.9 9.5 8 12.4 8 16C8 19.6 10.9 22.5 14.5 22.5C18.1 22.5 20.8 19.8 21 16.5H15"
          stroke="url(#guruGradComp)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="10" r="2.2" fill="url(#sparkGradComp)" />
        <circle cx="22" cy="10" r="3.2" stroke="#38BDF8" strokeWidth="0.75" strokeOpacity="0.6" />
      </svg>
    </div>
  );
}
