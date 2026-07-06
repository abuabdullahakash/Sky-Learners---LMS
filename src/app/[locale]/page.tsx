"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

export default function Home() {
  const t = useTranslations('Index');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(btnRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.2"
    )
    .fromTo(cardsRef.current?.children || [],
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" },
      "-=0.2"
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4" ref={heroRef}>
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mt-10">
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p ref={subRef} className="text-lg md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        
        <div ref={btnRef} className="flex gap-4 justify-center">
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1">
            {t('getStarted')}
          </button>
          <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-secondary/30 transition-all hover:-translate-y-1">
            {t('courses')}
          </button>
        </div>
      </div>

      {/* Feature Cards Placeholder */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-6xl pb-20">
        {[
          { icon: <BookOpen className="w-8 h-8 mb-4 text-primary" />, title: "Premium Content", desc: "High quality video lectures & notes" },
          { icon: <GraduationCap className="w-8 h-8 mb-4 text-secondary" />, title: "Daily Exams", desc: "Test your skills every day" },
          { icon: <Users className="w-8 h-8 mb-4 text-accent" />, title: "Live Support", desc: "Doubt solving sessions" }
        ].map((feat, i) => (
          <div key={i} className="p-8 rounded-2xl bg-foreground/5 border border-foreground/10 hover:border-primary/50 transition-colors">
            {feat.icon}
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-foreground/70">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
