"use client";

import React from 'react';
import { useLocale } from 'next-intl';

interface FlyingBookLoaderProps {
  text?: string;
  subtitle?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function FlyingBookLoader({
  text,
  subtitle,
  fullScreen = false,
  className = ""
}: FlyingBookLoaderProps) {
  const locale = useLocale();

  const defaultText = text || (locale === 'bn' ? 'জ্ঞানার্জনের নতুন যাত্রা শুরু হচ্ছে... ✨' : 'Unlocking your magic lesson... ✨');
  const defaultSubtitle = subtitle || (locale === 'bn' ? 'একটু অপেক্ষা করো, পড়া তৈরি হচ্ছে! 📚' : 'Hold on tight, magic is happening! 📚');

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 select-none ${className}`}>
      
      {/* Magic Stars & Flying Book Container */}
      <div className="relative w-40 h-36 flex items-center justify-center mb-3">
        
        {/* Ambient Glow */}
        <div className="absolute w-32 h-32 bg-gradient-to-tr from-orange-500/20 via-purple-500/20 to-amber-400/20 rounded-full blur-2xl animate-pulse"></div>

        {/* Floating Twinkling Stars */}
        <div className="absolute top-1 left-4 text-amber-400 text-lg animate-bounce duration-1000">✨</div>
        <div className="absolute top-3 right-3 text-purple-400 text-sm animate-ping duration-1000">🌟</div>
        <div className="absolute bottom-2 left-6 text-orange-400 text-sm animate-pulse">💫</div>
        <div className="absolute bottom-4 right-5 text-amber-300 text-base animate-bounce">✨</div>

        {/* Flying Magic Book SVG */}
        <div className="relative z-10 animate-[float_3s_easeInOut_infinite] flex flex-col items-center">
          
          <svg className="w-24 h-24 text-primary filter drop-shadow-xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Book Cover Gradient */}
            <defs>
              <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
            </defs>

            {/* Book Back Spine/Shadow */}
            <path d="M50 78 C35 70, 18 72, 10 76 L10 38 C18 34, 35 32, 50 40 C65 32, 82 34, 90 38 L90 76 C82 72, 65 70, 50 78 Z" fill="url(#bookCoverGrad)" />

            {/* Left Page (Flapping Animation) */}
            <path 
              d="M50 74 C36 67, 20 68, 12 72 L12 35 C20 31, 36 30, 50 37 Z" 
              fill="url(#pageGrad)" 
              className="origin-[50px_40px] animate-[flapLeft_1.4s_easeInOut_infinite_alternate]"
            />
            {/* Left Page Lines */}
            <path d="M20 44 H42 M20 52 H38 M20 60 H40" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

            {/* Right Page (Flapping Animation) */}
            <path 
              d="M50 74 C64 67, 80 68, 88 72 L88 35 C80 31, 64 30, 50 37 Z" 
              fill="url(#pageGrad)" 
              className="origin-[50px_40px] animate-[flapRight_1.4s_easeInOut_infinite_alternate]"
            />
            {/* Right Page Lines */}
            <path d="M58 44 H80 M60 52 H80 M58 60 H78" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

            {/* Center Book Spine */}
            <path d="M50 36 L50 76" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />

            {/* Magic Wand / Sparkle Overlay */}
            <circle cx="50" cy="30" r="4" fill="#fbbf24" className="animate-ping" />
          </svg>

          {/* Magic Trail Shadow */}
          <div className="w-16 h-2 bg-black/20 dark:bg-white/20 rounded-full blur-sm mt-1 animate-[shadowScale_3s_easeInOut_infinite]"></div>
        </div>

      </div>

      {/* Playful Text */}
      <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight animate-pulse mb-1">
        {defaultText}
      </h3>
      <p className="text-xs sm:text-sm font-semibold text-foreground/60 max-w-xs leading-relaxed">
        {defaultSubtitle}
      </p>

      {/* Inline Keyframe Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes flapLeft {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-18deg); }
        }
        @keyframes flapRight {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(18deg); }
        }
        @keyframes shadowScale {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(0.6); opacity: 0.15; }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
