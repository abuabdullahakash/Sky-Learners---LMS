"use client";

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BookOpen, CheckCircle, Trophy, PlayCircle, ArrowRight, Sparkles, Flame, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function DashboardOverview() {
  const t = useTranslations('Dashboard.overview');
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const stats = [
    { title: t('enrolled'), value: '4', icon: BookOpen, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { title: t('completed'), value: '12', icon: CheckCircle, color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/20' },
    { title: t('score'), value: '85%', icon: Trophy, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-10">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/30 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-accent/20 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
              <Flame className="w-4 h-4" />
              <span>3 Day Streak!</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.displayName?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-foreground/70 text-lg max-w-xl leading-relaxed">
              {t('subtitle')} We have exciting new modules waiting for you today.
            </p>
          </div>
          
          <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group">
            Resume Learning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group relative bg-foreground/5 rounded-3xl p-6 border border-foreground/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-foreground/10 overflow-hidden cursor-default">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500`}></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-2xl text-white shadow-lg ${stat.shadow} transform group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-foreground/60 font-medium text-sm uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Learning & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Focus / Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold tracking-tight">{t('continue')}</h2>
            <Link href="/dashboard/courses" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-foreground/5 rounded-3xl p-3 border border-foreground/10 flex flex-col sm:flex-row items-stretch gap-4 group hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="w-full sm:w-56 h-48 sm:h-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                </div>
                <span className="font-bold tracking-widest text-white/90">PHYSICS 101</span>
              </div>
            </div>
            
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider border border-accent/20">Chapter 3</span>
                  <span className="flex items-center gap-1 text-foreground/50 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    15 mins left
                  </span>
                </div>
                <h3 className="text-2xl font-bold mt-3 group-hover:text-primary transition-colors">Motion and Mechanics</h3>
                <p className="text-foreground/60 mt-2 line-clamp-2 leading-relaxed">
                  Learn the fundamental laws of motion formulated by Sir Isaac Newton and how they apply to real-world objects.
                </p>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-primary">Progress</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-foreground/10 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full w-[45%] relative">
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Upcoming */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Tasks</h2>
          <div className="bg-foreground/5 rounded-3xl p-6 border border-foreground/10 space-y-4 relative overflow-hidden backdrop-blur-md">
            
            <div className="flex items-start gap-4 p-4 bg-background/50 rounded-2xl hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Math Quiz: Algebra</h4>
                <p className="text-sm text-foreground/50 mt-1">Today, 8:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-background/50 rounded-2xl hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Submit Chemistry Assignment</h4>
                <p className="text-sm text-foreground/50 mt-1">Tomorrow, 11:59 PM</p>
              </div>
            </div>

            <button className="w-full py-3 mt-2 text-sm font-bold text-foreground/60 hover:text-primary transition-colors border-t border-foreground/10 pt-4">
              View Calendar
            </button>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes progress {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}
