"use client";

import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeft, BookOpen, Clock, Sparkles, Video, CheckSquare, Users, ChevronRight, Tag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Image from 'next/image';

export default function RecommendedCourses() {
  const t = useTranslations('Dashboard.overview');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const containerRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isBn ? 'bn-BD' : 'en-US').format(num);
  };

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        
        let q = query(coursesRef, where('isPublished', '==', true));
        
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
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link 
              href="/dashboard/settings" 
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all hover:scale-105 shrink-0 border border-white/20 mt-1"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md border border-white/30 mb-3 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {userData?.eduLevel ? `${userData.eduLevel} Academic Profile` : (isBn ? 'আপনার জন্য সাজানো' : 'Tailored For You')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isBn ? 'সুপারিশকৃত কোর্সসমূহ' : 'Recommended Courses'}
              </h1>
              <p className="text-white/80 text-base sm:text-lg mt-1 font-medium max-w-xl">
                {isBn 
                  ? 'আপনার একাডেমিক লেভেল অনুযায়ী সেরা কোর্সগুলো নিচে সাজানো হয়েছে' 
                  : 'Hand-picked courses specially aligned with your learning profile.'}
              </p>
            </div>
          </div>

          {userData?.eduLevel && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3 shrink-0 self-start md:self-auto">
              <Tag className="w-6 h-6 text-amber-300" />
              <div>
                <div className="text-xs text-white/70 font-semibold uppercase">{isBn ? 'আপনার শ্রেণি / বিভাগ' : 'Academic Profile'}</div>
                <div className="text-lg font-bold text-white capitalize">{userData.eduLevel}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground/60 text-sm font-medium">{isBn ? 'কোর্স লোড হচ্ছে...' : 'Loading recommended courses...'}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-[2.5rem] border border-foreground/10 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{isBn ? 'কোনো কোর্স পাওয়া যায়নি' : 'No Courses Available'}</h2>
          <p className="text-foreground/60 max-w-md mb-8">
            {isBn 
              ? 'আপনার ক্যাটাগরিতে বর্তমানে কোনো কোর্স নেই। অনুগ্রহ করে পরবর্তীতে চেক করুন অথবা অন্যান্য কোর্স ব্রাউজ করুন।' 
              : 'There are currently no courses for your academic profile. Check back later or browse all courses.'}
          </p>
          <Link 
            href="/courses" 
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
          >
            {isBn ? 'সব কোর্স দেখুন' : 'Browse All Courses'}
          </Link>
        </div>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {courses.map((course) => {
            const hasDiscount = course.discountPrice !== undefined && course.discountPrice !== null && (course.discountPrice as any) !== '';
            const isDiscountValid = hasDiscount && course.discountValidUntil && new Date() <= (course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil));
            const activePrice = isDiscountValid ? Number(course.discountPrice) : Number(course.price || 0);
            const isFree = activePrice === 0;

            const categoryColors: Record<string, string> = {
              primary: 'from-blue-500 to-cyan-500 text-blue-500 bg-blue-500/10',
              secondary: 'from-purple-500 to-indigo-500 text-purple-500 bg-purple-500/10',
              intermediate: 'from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-500/10',
              admission: 'from-orange-500 to-rose-500 text-orange-500 bg-orange-500/10',
            };

            const catKey = (course.category || '').toLowerCase();
            const colorClass = categoryColors[catKey] || 'from-orange-500 to-amber-500 text-orange-500 bg-orange-500/10';
            const gradientParts = colorClass.split(' ');
            const badgeTextColor = gradientParts[2];
            const badgeBg = gradientParts[3];

            return (
              <div 
                key={course.id} 
                className="group relative bg-white dark:bg-slate-900/80 rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden hover:border-transparent transition-all duration-500 flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 z-10"
              >
                {/* Border Gradient Overlay */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" style={{ margin: '-2px' }}></div>
                <div className="absolute inset-0 bg-white dark:bg-[#0f172a] rounded-[2rem] z-[-5]"></div>

                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-foreground/5 flex-shrink-0 overflow-hidden rounded-t-[2rem]">
                  {course.thumbnailUrl ? (
                    <Image 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30 font-semibold">
                      SkyLearners
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-70"></div>

                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md uppercase tracking-wider backdrop-blur-md border border-white/20 ${badgeBg} ${badgeTextColor}`}>
                      {course.category || 'General'}
                    </span>
                  </div>

                  {/* Free badge */}
                  {isFree && (
                    <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                      🎁 {isBn ? 'ফ্রি' : 'FREE'}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors duration-300">
                    {course.title}
                  </h3>

                  <p className="text-foreground/60 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                    {course.subtitle || (isBn ? 'অভিজ্ঞ শিক্ষকমণ্ডলীর নির্দেশনায় সম্পূর্ণ কোর্স সম্পন্ন করুন।' : 'Master your skills with comprehensive guidance.')}
                  </p>

                  {/* Course Metadata Stats */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/10 mb-6 text-xs font-semibold text-foreground/70">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      <span>{formatNumber(course.totalVideoLessons || 0)} {isBn ? 'টি ভিডিও' : 'Lessons'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      <span>{formatNumber(course.totalExams || 0)} {isBn ? 'টি এক্সাম' : 'Exams'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{course.courseValidity || (isBn ? 'লাইফটাইম' : 'Lifetime')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{formatNumber(course.enrolledStudents || 0)} {isBn ? 'শিক্ষার্থী' : 'Students'}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      {isFree ? (
                        <span className="text-2xl font-extrabold text-emerald-500">{isBn ? 'ফ্রি' : 'FREE'}</span>
                      ) : isDiscountValid ? (
                        <>
                          <span className="text-xs text-foreground/50 line-through font-medium">৳{formatNumber(course.price)}</span>
                          <span className="text-2xl font-extrabold text-orange-500">৳{formatNumber(course.discountPrice)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-extrabold text-gray-900 dark:text-white">৳{formatNumber(course.price || 0)}</span>
                      )}
                    </div>

                    <Link 
                      href={`/courses/${course.id}`}
                      className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md hover:shadow-orange-500/30 hover:-translate-y-0.5"
                    >
                      <span>{isBn ? 'কোর্সটি দেখুন' : 'View Course'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
