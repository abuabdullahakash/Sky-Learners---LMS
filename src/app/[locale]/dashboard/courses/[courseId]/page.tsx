"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle2, PlayCircle, Trophy, BookOpen, AlertCircle, Calendar, Video, UserCircle, ExternalLink, HelpCircle, Globe, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

export default function StudentCourseOverview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const t = useTranslations('Dashboard.courseOverview');
  const locale = useLocale();
  const { user } = useAuth();
  
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [completedExamsCount, setCompletedExamsCount] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  // Time state for live classes
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(num);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!courseId) return;

    // Real-time listener for the course
    const docRef = doc(db, 'courses', courseId);
    const unsubscribeCourse = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const courseData = docSnap.data();
        setCourse(courseData);

        if (courseData.teacherId && !teacherProfile) {
          const teacherRef = doc(db, 'teacherProfiles', courseData.teacherId);
          const teacherSnap = await getDoc(teacherRef);
          if (teacherSnap.exists()) {
            setTeacherProfile(teacherSnap.data());
          }
        }
      }
    });

    // Fetch completion data once
    const fetchCompletionData = async () => {
      if (user && courseId) {
        try {
          const completedLessonsQuery = query(
            collection(db, 'completed_lessons'),
            where('studentId', '==', user.uid),
            where('courseId', '==', courseId)
          );
          const completedLessonsSnap = await getDocs(completedLessonsQuery);
          setCompletedCount(completedLessonsSnap.size);
          const completedIds = completedLessonsSnap.docs.map((d) => d.data().lessonId);
          setCompletedLessonIds(completedIds);

          const completedExamsQuery = query(
            collection(db, 'completed_exams'),
            where('studentId', '==', user.uid),
            where('courseId', '==', courseId)
          );
          const completedExamsSnap = await getDocs(completedExamsQuery);
          setCompletedExamsCount(completedExamsSnap.size);
        } catch (error) {
          console.error("Error fetching completion data", error);
        }
      }
    };
    
    fetchCompletionData();

    return () => {
      unsubscribeCourse();
    };
  }, [courseId, user]);

  const formatLiveDuration = (startedAt: number) => {
    const diff = Math.floor((currentTime.getTime() - startedAt) / 1000);
    if (diff < 0) return "00:00";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  if (!course) {
    return <div className="text-center py-20 text-gray-500">Loading course overview...</div>;
  }

  // Actual uploaded lessons from course modules as fallback
  const actualUploadedLessons = (course.modules || []).reduce(
    (sum: number, mod: any) => sum + (mod.lessons?.length || 0),
    0
  );

  // Marketing stats set by teacher in course settings
  const promisedVideos = Number(course.totalVideoLessons) || actualUploadedLessons;
  const promisedExams = Number(course.totalExams) || (course.exams?.length || 0);

  // Linear total items & total completed items across videos & exams
  const totalCourseItems = promisedVideos + promisedExams;
  const totalCompletedItems = completedCount + completedExamsCount;

  // Single linear progress percentage
  const progressPercentage = totalCourseItems > 0 
    ? Math.min(100, Math.round((totalCompletedItems / totalCourseItems) * 100))
    : 0;
  
  // Find next upcoming live class
  const upcomingClasses = (course.liveClasses || [])
    .filter((lc: any) => !lc.liveEndedAt && new Date(lc.date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null;
  
  let canJoinLive = false;
  if (nextClass) {
    const classDateTime = new Date(`${nextClass.date}T${nextClass.time}`);
    canJoinLive = nextClass.isLive || (nextClass.isAutoStart && currentTime >= classDateTime);
  }

  const teacherAvatar = teacherProfile?.profilePhoto || teacherProfile?.photoUrl || teacherProfile?.image;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl">
      
      {/* Left Column (Main Content) */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Back Button & Premium Hero Banner Header */}
        <div>
          <Link 
            href="/dashboard/courses" 
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-500/10 px-3.5 py-2 rounded-xl mb-4 transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'bn' ? 'আমার কোর্সসমূহে ফিরে যান' : 'Back to My Courses'}</span>
          </Link>

          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
                {course.category || 'Online Course'}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                {t('welcome')} {course.title}
              </h1>
              <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
                {t('summary')}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(progressPercentage)}%</h3>
            <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">{t('progress')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-200 dark:border-green-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(completedCount)}</h3>
            <p className="text-sm font-bold text-green-600/80 dark:text-green-400/80 uppercase tracking-wider">{t('lessonsCompleted')}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(completedCount * 10)}</h3>
            <p className="text-sm font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">{t('pointsEarned')}</p>
          </div>
        </div>

        {/* Continue Learning Dynamic Banner */}
        {(() => {
          // Collect all uploaded lessons across modules
          const allLessons: Array<{ id: string; title: string; duration?: string; videoUrl?: string; moduleTitle?: string }> = [];
          (course.modules || []).forEach((mod: any) => {
            (mod.lessons || []).forEach((les: any) => {
              allLessons.push({
                ...les,
                moduleTitle: mod.title || mod.name || (locale === 'bn' ? 'মডিউল' : 'Module')
              });
            });
          });

          const isCompletedAll = allLessons.length > 0 && completedLessonIds.length >= allLessons.length;
          const nextLesson = allLessons.find(les => !completedLessonIds.includes(les.id)) || allLessons[0];

          if (isCompletedAll) {
            return (
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-green-500/20 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-500/30 text-center flex flex-col items-center shadow-sm relative overflow-hidden group">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  {locale === 'bn' ? '🎉 অভিনন্দন!' : '🎉 Congratulations!'}
                </span>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">
                  {locale === 'bn' ? 'আপনি কোর্সটি সফলভাবে সম্পন্ন করেছেন!' : 'You have completed this course!'}
                </h2>
                <p className="text-gray-600 dark:text-foreground/70 max-w-md mb-6 relative z-10 text-sm">
                  {locale === 'bn' 
                    ? 'আপনার অর্জিত জ্ঞান বৃদ্ধি করতে সিলেবাস থেকে যেকোনো লেসন পুনরাই রিভিশন দিতে পারেন।' 
                    : 'You can review any lesson from the curriculum anytime to refresh your knowledge.'}
                </p>
                <Link 
                  href={`/dashboard/courses/${courseId}/curriculum`}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 relative z-10 hover:-translate-y-1 flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" /> {locale === 'bn' ? 'সিলেবাস রিভিশন দিন' : 'Review Curriculum'}
                </Link>
              </div>
            );
          }

          if (nextLesson) {
            return (
              <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex items-start gap-4 z-10">
                  <div className="w-14 h-14 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform mt-1">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        {completedCount > 0 
                          ? (locale === 'bn' ? 'পড়া চালিয়ে যান' : 'Continue Learning') 
                          : (locale === 'bn' ? 'প্রথম লেসন শুরু করুন' : 'Start First Lesson')}
                      </span>
                      {nextLesson.moduleTitle && (
                        <span className="text-xs text-gray-500 dark:text-foreground/50 font-medium">
                          • {nextLesson.moduleTitle}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white line-clamp-1">
                      {nextLesson.title}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-foreground/70 mt-1 line-clamp-1">
                      {locale === 'bn' 
                        ? 'ভিডিওটি প্লে করে আপনার পড়া সম্পূর্ণ করুন।' 
                        : 'Click play to start watching your next video lesson.'}
                    </p>
                  </div>
                </div>

                <Link 
                  href={`/dashboard/courses/${courseId}/recorded-classes/${nextLesson.id}`}
                  className="w-full md:w-auto px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 z-10 hover:-translate-y-0.5 shrink-0 flex items-center justify-center gap-2 text-sm"
                >
                  <PlayCircle className="w-5 h-5 text-white" /> 
                  {completedCount > 0 
                    ? (locale === 'bn' ? 'লেসনে যান' : 'Continue Lesson') 
                    : (locale === 'bn' ? 'ক্লাস শুরু করুন' : 'Start Class')}
                </Link>
              </div>
            );
          }

          return (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-foreground/5 dark:to-foreground/10 rounded-3xl p-8 border border-gray-200 dark:border-foreground/20 text-center flex flex-col items-center shadow-sm relative overflow-hidden group">
              <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">{t('readyToStart')}</h2>
              <p className="text-gray-600 dark:text-foreground/70 max-w-md mb-6 relative z-10 text-sm">{t('diveInto')}</p>
              <Link 
                href={`/dashboard/courses/${courseId}/curriculum`}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 relative z-10 hover:-translate-y-1"
              >
                {t('goToCurriculum')}
              </Link>
            </div>
          );
        })()}
        
        {/* Announcements / Latest Notices */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            {locale === 'bn' ? 'সর্বশেষ নোটিশ' : t('latestAnnouncements')}
          </h2>
          
          {course.notices && course.notices.length > 0 ? (
            <div className="space-y-3">
              {course.notices.slice(0, 4).map((notice: any) => (
                <div key={notice.id} className="bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl p-5 border border-amber-200 dark:border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
                      {locale === 'bn' ? 'নোটিশ' : 'Notice'}
                    </span>
                    <span className="text-xs text-foreground/50">{new Date(notice.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">{notice.title}</h4>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-500/10 dark:bg-yellow-500/5 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-500/20 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500 mb-2 opacity-50" />
              <p className="text-yellow-800 dark:text-yellow-500/70 italic font-medium">
                {locale === 'bn' ? 'এখনো কোনো নোটিশ নেই।' : t('noAnnouncements')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column (Widgets) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Widget 1: Circular Progress */}
        <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 w-full text-left">
            {locale === 'bn' ? 'আপনার অগ্রগতি' : 'Your Progress'}
          </h3>
          <div className="relative w-40 h-40">
            {/* Background Circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 dark:text-foreground/10 stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              {/* Progress Circle */}
              <circle
                className="text-primary stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${progressPercentage * 2.51} 251`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{formatNumber(progressPercentage)}%</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 w-full border-t border-gray-100 dark:border-foreground/10 pt-4 text-sm font-medium">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-foreground/60 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> {locale === 'bn' ? 'লেসন' : 'Lessons'}
              </span>
              <span className="text-gray-900 dark:text-white font-bold">{formatNumber(completedCount)} / {formatNumber(promisedVideos)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-foreground/60 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-orange-500" /> {locale === 'bn' ? 'পরীক্ষা' : 'Exams'}
              </span>
              <span className="text-gray-900 dark:text-white font-bold">{formatNumber(completedExamsCount)} / {formatNumber(promisedExams)}</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Upcoming Live Class */}
        <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {locale === 'bn' ? 'আসন্ন লাইভ ক্লাস' : 'Upcoming Live'}
            </h3>
            {nextClass?.isLive && (
              <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-sm shadow-red-500/20">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                {locale === 'bn' ? '🔴 লাইভ চলছে' : 'LIVE NOW'}
                {nextClass.liveStartedAt && (
                  <span className="ml-1 border-l border-white/30 pl-2 text-white/90 font-mono tracking-tighter">
                    {formatLiveDuration(nextClass.liveStartedAt)}
                  </span>
                )}
              </span>
            )}
          </div>
          
          {nextClass ? (
            <div className={`space-y-4 ${canJoinLive ? 'ring-1 ring-orange-500/30 bg-orange-500/5 p-4 rounded-2xl' : ''} transition-all`}>
              <div className={`p-4 rounded-xl border ${canJoinLive ? 'bg-white dark:bg-foreground/5 border-orange-200 dark:border-orange-500/20' : 'bg-gray-50 dark:bg-foreground/5 border-gray-100 dark:border-foreground/10'}`}>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{nextClass.title}</h4>
                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{nextClass.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg text-sm font-bold">
                    <Clock className="w-4 h-4" /> {formatTime12Hour(nextClass.time)}
                  </div>
                </div>
              </div>
              
              {canJoinLive ? (
                <a 
                  href={nextClass.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 animate-in zoom-in"
                >
                  <Video className="w-5 h-5" /> {locale === 'bn' ? 'ক্লাসে যোগ দিন' : 'Join Class'}
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-foreground/10 text-gray-400 dark:text-foreground/40 font-bold rounded-xl cursor-not-allowed transition-colors"
                  >
                    <Clock className="w-5 h-5" /> {locale === 'bn' ? 'শীঘ্রই শুরু হচ্ছে...' : 'Starting Soon...'}
                  </button>
                  <span className="text-[10px] text-center text-gray-400 font-medium">
                    {nextClass.isAutoStart 
                      ? (locale === 'bn' ? 'নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে লাইভ শুরু হবে' : 'Activates at scheduled time') 
                      : (locale === 'bn' ? 'শিক্ষক ম্যানুয়ালি লাইভ শুরু করবেন' : 'Teacher will start this manually')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-foreground/20 mb-3" />
              <p className="text-gray-500 dark:text-foreground/60 text-sm">
                {locale === 'bn' ? 'এই মুহূর্তে কোনো লাইভ ক্লাস নির্ধারণ করা নেই।' : 'No upcoming live classes scheduled at the moment.'}
              </p>
            </div>
          )}
        </div>

        {/* Widget 3: Instructor Profile */}
        {teacherProfile && (
          <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              {locale === 'bn' ? 'কোর্স শিক্ষক' : 'Course Instructor'}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-foreground/10 shrink-0 border border-gray-200 dark:border-foreground/20">
                {teacherAvatar ? (
                  <img src={teacherAvatar} alt={teacherProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-full h-full text-gray-400 dark:text-foreground/40" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{teacherProfile.displayName}</h4>
                <p className="text-xs text-gray-500 dark:text-foreground/60 line-clamp-1">
                  {teacherProfile.headline || teacherProfile.title || (locale === 'bn' ? 'ইন্সট্রাকটর' : 'Instructor')}
                </p>
              </div>
            </div>

            {/* Official Social Links Bar */}
            {(teacherProfile.website || teacherProfile.facebook || teacherProfile.youtube || teacherProfile.linkedin) && (
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-foreground/10">
                {teacherProfile.website && (
                  <a href={teacherProfile.website} target="_blank" rel="noreferrer" title="Website" className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {teacherProfile.facebook && (
                  <a href={teacherProfile.facebook} target="_blank" rel="noreferrer" title="Facebook" className="w-8 h-8 rounded-lg bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {teacherProfile.youtube && (
                  <a href={teacherProfile.youtube} target="_blank" rel="noreferrer" title="YouTube" className="w-8 h-8 rounded-lg bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all transform hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {teacherProfile.linkedin && (
                  <a href={teacherProfile.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all transform hover:scale-105">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}

            {course.teacherId && (
              <Link 
                href={`/teachers/${course.teacherId}`}
                target="_blank"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-foreground/20 text-gray-700 dark:text-foreground/80 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-foreground/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> {locale === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile'}
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
