'use client';

import React from 'react';
import Image from 'next/image';

export default function GuruLogo({ size = 28, className = '' }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="GuruAI Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}

