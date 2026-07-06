"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link, useRouter } from '@/i18n/routing';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import RoleSelectionModal from '@/components/RoleSelectionModal';

export default function Home() {
  const t = useTranslations('Index');
  const router = useRouter();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setIsRoleModalOpen(false);
    router.push(`/register?role=${role}`);
  };
  
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Background Image parallax animation
    gsap.fromTo(bgImageRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "+=0.5" // Start slightly after background starts loading
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
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden" ref={heroRef}>
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          ref={bgImageRef}
          src="/hero-image.png"
          alt="SkyLearners Background"
          fill
          priority
          className="object-cover object-center opacity-40 dark:opacity-50"
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background dark:from-background/90 dark:via-background/70 dark:to-background z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto mt-20">
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
          {t('title')}
        </h1>
        <p ref={subRef} className="text-lg md:text-2xl text-foreground/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
          {t('subtitle')}
        </p>
        
        <div ref={btnRef} className="flex gap-4 justify-center">
          <button onClick={() => setIsRoleModalOpen(true)} className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-1">
            {t('getStarted')}
          </button>
          <Link href="/courses" className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1">
            {t('courses')}
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div ref={cardsRef} className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-6xl pb-20">
        {[
          { icon: <BookOpen className="w-8 h-8 mb-4 text-primary" />, title: "Premium Content", desc: "High quality video lectures & notes" },
          { icon: <GraduationCap className="w-8 h-8 mb-4 text-secondary" />, title: "Daily Exams", desc: "Test your skills every day" },
          { icon: <Users className="w-8 h-8 mb-4 text-accent" />, title: "Live Support", desc: "Doubt solving sessions" }
        ].map((feat, i) => (
          <div key={i} className="p-8 rounded-2xl bg-background/60 backdrop-blur-md border border-foreground/10 hover:border-primary/50 transition-colors shadow-xl">
            {feat.icon}
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-foreground/80">{feat.desc}</p>
          </div>
        ))}
      </div>

      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSelectRole={handleRoleSelect} 
      />
    </div>
  );
}
