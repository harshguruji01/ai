'use client';

import React from 'react';

export interface AiLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function AiLoader({
  text = 'Generating',
  size = 'md',
  className = '',
  showText = true,
}: AiLoaderProps) {
  const sizeMap = {
    sm: {
      wrapper: 'w-[72px] h-[72px]',
      fontSize: 'text-[10px]',
    },
    md: {
      wrapper: 'w-[130px] h-[130px]',
      fontSize: 'text-xs md:text-sm',
    },
    lg: {
      wrapper: 'w-[200px] h-[200px]',
      fontSize: 'text-base md:text-lg',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`ai-loader-container relative inline-flex flex-col items-center justify-center ${className}`}>
      <div
        className={`ai-loader-sphere relative ${currentSize.wrapper} rounded-full overflow-hidden flex items-center justify-center select-none bg-[#05020c] transition-all duration-300`}
        style={{
          boxShadow:
            '0 0 35px rgba(124, 58, 237, 0.35), 0 0 70px rgba(99, 102, 241, 0.2), inset 0 0 25px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div
          className="ai-loader-glow absolute -inset-[20%] rounded-full animate-[spin_9s_linear_infinite]"
          style={{
            background:
              'radial-gradient(circle at 68% 28%, #d8b4fe 0%, #9333ea 22%, #6366f1 45%, #31104b 70%, #04010a 90%)',
            filter: 'blur(8px)',
          }}
        />

        <div
          className="ai-loader-crescent absolute inset-0 rounded-full animate-pulse pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.85) 0%, rgba(192, 132, 252, 0.5) 20%, rgba(99, 102, 241, 0.2) 45%, transparent 70%)',
            filter: 'blur(10px)',
            animationDuration: '3.5s',
          }}
        />

        <div
          className="ai-loader-shadow absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 35% 75%, rgba(0, 0, 0, 0.95) 0%, rgba(4, 1, 10, 0.75) 45%, transparent 80%)',
          }}
        />

        <div
          className="ai-loader-rim absolute inset-[1px] rounded-full pointer-events-none"
          style={{
            border: '1px solid rgba(216, 180, 254, 0.22)',
            boxShadow: 'inset 0 0 16px rgba(147, 51, 234, 0.35)',
          }}
        />

        {showText && (
          <span
            className={`ai-loader-text relative z-10 font-normal ${currentSize.fontSize} tracking-tight text-slate-100 animate-pulse select-none text-center px-1`}
            style={{
              textShadow: '0 0 15px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8)',
              animationDuration: '2.5s',
            }}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export default AiLoader;
