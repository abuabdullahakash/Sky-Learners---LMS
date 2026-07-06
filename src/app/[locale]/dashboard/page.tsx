"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BookOpen, CheckCircle, Trophy, PlayCircle } from 'lucide-react';

export default function DashboardOverview() {
  const t = useTranslations('Dashboard.overview');
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  const stats = [
    { title: t('enrolled'), value: '4', icon: BookOpen, color: 'bg-blue-500' },
    { title: t('completed'), value: '12', icon: CheckCircle, color: 'bg-green-500' },
    { title: t('score'), value: '85%', icon: Trophy, color: 'bg-yellow-500' },
  ];

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-foreground/5 rounded-3xl p-8 border border-foreground/10 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {t('welcome')}, <span className="text-primary">{user?.displayName || 'Student'}</span>! 👋
        </h1>
        <p className="text-foreground/70 text-lg">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-foreground/5 rounded-2xl p-6 border border-foreground/10 flex items-center gap-6 hover:bg-foreground/10 transition-colors cursor-default">
              <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-foreground/60 font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('continue')}</h2>
        <div className="bg-foreground/5 rounded-2xl p-6 border border-foreground/10 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/30 transition-colors cursor-pointer">
          <div className="w-full md:w-48 h-32 bg-foreground/10 rounded-xl relative overflow-hidden flex-shrink-0">
            {/* Placeholder for course thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Physics</span>
                <h3 className="text-xl font-bold mt-2">Motion and Mechanics</h3>
              </div>
              <span className="text-foreground/50 text-sm">Chapter 3</span>
            </div>
            <p className="text-foreground/60 mb-4 line-clamp-2">Learn the fundamental laws of motion formulated by Sir Isaac Newton and how they apply to real-world objects.</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-foreground/10 rounded-full h-2.5 mb-1">
              <div className="bg-primary h-2.5 rounded-full w-[45%]"></div>
            </div>
            <p className="text-xs text-foreground/50 text-right">45% Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
