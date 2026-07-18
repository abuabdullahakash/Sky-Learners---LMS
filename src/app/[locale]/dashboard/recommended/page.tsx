"use client";

import { useTranslations } from 'next-intl';
import { ArrowLeft, PlayCircle, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';

export default function RecommendedCourses() {
  const t = useTranslations('Dashboard.overview');
  const containerRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        
        let q = query(coursesRef, where('isPublished', '==', true));
        
        // If user has an academic profile level set, filter by that category
        if (userData?.eduLevel) {
          q = query(
            coursesRef,
            where('isPublished', '==', true),
            where('category', '==', userData.eduLevel)
          );
        }

        const querySnapshot = await getDocs(q);
        
        let coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // If no courses found for their specific level, fallback to all published courses
        if (coursesData.length === 0 && userData?.eduLevel) {
          const fallbackQuery = query(coursesRef, where('isPublished', '==', true));
          const fallbackSnap = await getDocs(fallbackQuery);
          coursesData = fallbackSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, [userData?.eduLevel]);

  useEffect(() => {
    if (!loading && courses.length > 0 && containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, courses]);

  return (
    <div ref={containerRef} className="w-full space-y-10">
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
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">No Courses Available</h2>
          <p className="text-foreground/60">Check back later for new courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="bg-foreground/5 rounded-3xl p-4 border border-foreground/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer flex flex-col sm:flex-row gap-6">
              <div className={`w-full sm:w-48 h-48 bg-gradient-to-br from-primary/80 to-accent rounded-2xl relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform shadow-inner`}>
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-black/10"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-75 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-6 h-6 text-white fill-white/20" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold capitalize shadow-lg">
                  {course.category || 'Course'}
                </div>
              </div>
              
              <div className="flex-1 py-2 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-3">
                    {course.subtitle || 'Learn from the best instructors.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-medium text-foreground/50">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.totalVideoLessons || 0} Lessons</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.courseValidity || 'Lifetime'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
