"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, PlayCircle, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function RecommendedCourses() {
  const t = useTranslations('Dashboard.overview');
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

  const courses = [
    {
      title: "Quantum Mechanics Fundamentals",
      subject: "Physics",
      lessons: 24,
      duration: "12 hours",
      color: "from-blue-500 to-cyan-400",
      description: "Understand the basic principles of quantum theory and wave-particle duality."
    },
    {
      title: "Calculus II: Integration",
      subject: "Mathematics",
      lessons: 18,
      duration: "9 hours",
      color: "from-green-500 to-emerald-400",
      description: "Master advanced integration techniques and their applications in physics."
    },
    {
      title: "Organic Chemistry Basics",
      subject: "Chemistry",
      lessons: 32,
      duration: "16 hours",
      color: "from-orange-500 to-yellow-400",
      description: "Introduction to organic compounds, structure, and reactivity."
    },
    {
      title: "Classical Mechanics",
      subject: "Physics",
      lessons: 20,
      duration: "10 hours",
      color: "from-purple-500 to-pink-400",
      description: "Dive deep into Newton's laws and the motion of macroscopic objects."
    }
  ];

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-foreground/10 pb-6">
        <Link href="/dashboard/settings" className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Recommended Courses <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 mt-1">Specially tailored for your academic profile</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course, index) => (
          <div key={index} className="bg-foreground/5 rounded-3xl p-4 border border-foreground/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer flex flex-col sm:flex-row gap-6">
            <div className={`w-full sm:w-48 h-48 bg-gradient-to-br ${course.color} rounded-2xl relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform shadow-inner`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6 text-white fill-white/20" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold">
                {course.subject}
              </div>
            </div>
            
            <div className="flex-1 py-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-foreground/50">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons} Lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
