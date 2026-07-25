"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BookOpen, CheckCircle, Trophy, PlayCircle, ArrowRight, Sparkles, Flame, Clock, Video, Megaphone, HelpCircle, Bell, ChevronRight, CheckSquare, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

interface ActivityFeedItem {
  id: string;
  type: 'notice' | 'live_class' | 'exam' | 'lesson';
  title: string;
  subtitle?: string;
  dateStr?: string;
  courseTitle: string;
  courseId: string;
  link: string;
  isLive?: boolean;
  timestamp: number;
}

export default function DashboardOverview() {
  const t = useTranslations('Dashboard.overview');
  const locale = useLocale();
  const { user, userData } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(num);
  };
  
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<string>('0%');
  const [streakDays, setStreakDays] = useState<number>(1);
  const [lastAccessed, setLastAccessed] = useState<any>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  const formatTimeAgo = (timestamp: string | number) => {
    if (!timestamp) return t('timeAgo.justNow');
    const timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const diff = Date.now() - timeMs;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('timeAgo.justNow');
    
    const formatNumber = (num: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(num);
    
    if (minutes === 1) return t('timeAgo.minuteAgo');
    if (minutes < 60) return t('timeAgo.minutesAgo', { minutes: formatNumber(minutes) });
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return t('timeAgo.hourAgo');
    if (hours < 24) return t('timeAgo.hoursAgo', { hours: formatNumber(hours) });
    
    const days = Math.floor(hours / 24);
    if (days === 1) return t('timeAgo.dayAgo');
    return t('timeAgo.daysAgo', { days: formatNumber(days) });
  };

  const getCategoryTranslation = (cat: string) => {
    if (!cat) return t('continueBtn');
    const lowerCat = cat.toLowerCase();
    switch (lowerCat) {
      case 'intermediate': return t('categories.intermediate');
      case 'primary': return t('categories.primary');
      case 'high_school': return t('categories.high_school');
      case 'honours': return t('categories.honours');
      case 'masters': return t('categories.masters');
      default: return cat;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Calculate & Update Dynamic Streak
        try {
          const streakRef = doc(db, 'user_streaks', user.uid);
          const streakSnap = await getDoc(streakRef);
          const todayStr = new Date().toISOString().split('T')[0];

          if (streakSnap.exists()) {
            const sData = streakSnap.data();
            const lastDate = sData.lastActiveDate;
            let currentStreak = sData.streakCount || 1;

            if (lastDate !== todayStr) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastDate === yesterdayStr) {
                currentStreak += 1;
              } else {
                currentStreak = 1;
              }

              await updateDoc(streakRef, {
                streakCount: currentStreak,
                lastActiveDate: todayStr
              });
            }
            setStreakDays(currentStreak);
          } else {
            await setDoc(streakRef, {
              streakCount: 1,
              lastActiveDate: todayStr
            });
            setStreakDays(1);
          }
        } catch (streakErr) {
          console.error("Streak calculation error:", streakErr);
        }

        // 2. Fetch approved enrollments count & IDs
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(
          enrollmentsRef,
          where('studentId', '==', user.uid),
          where('status', '==', 'approved')
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        setEnrolledCount(enrollmentsSnap.size);

        const enrolledCourseIds = enrollmentsSnap.docs.map(d => d.data().courseId).filter(Boolean);

        // 3. Fetch completed lessons count
        const completedRef = collection(db, 'completed_lessons');
        const completedQuery = query(completedRef, where('studentId', '==', user.uid));
        const completedSnap = await getDocs(completedQuery);
        setCompletedCount(completedSnap.size);

        // 4. Calculate Real Average Exam Score Percentage
        try {
          const completedExamsRef = collection(db, 'completed_exams');
          const completedExamsQuery = query(completedExamsRef, where('studentId', '==', user.uid));
          const completedExamsSnap = await getDocs(completedExamsQuery);

          if (!completedExamsSnap.empty) {
            let totalPercentageSum = 0;
            let validExamsCount = 0;

            completedExamsSnap.docs.forEach(docSnap => {
              const examData = docSnap.data();
              if (examData.totalMarks && examData.totalMarks > 0) {
                const percentage = (examData.score / examData.totalMarks) * 100;
                totalPercentageSum += Math.min(100, Math.max(0, percentage));
                validExamsCount++;
              } else if (examData.score !== undefined) {
                totalPercentageSum += Math.min(100, examData.score * 10);
                validExamsCount++;
              }
            });

            if (validExamsCount > 0) {
              const avg = Math.round(totalPercentageSum / validExamsCount);
              const formattedAvg = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(avg);
              setAvgScore(`${formattedAvg}%`);
            } else {
              setAvgScore('0%');
            }
          } else {
            setAvgScore('0%');
          }
        } catch (scoreErr) {
          console.error("Average score calculation error:", scoreErr);
          setAvgScore('0%');
        }

        // 5. Fetch last accessed lesson
        const lastAccessedRef = collection(db, 'last_accessed');
        const lastAccessedQuery = query(lastAccessedRef, where('__name__', '==', user.uid));
        const lastAccessedSnap = await getDocs(lastAccessedQuery);
        if (!lastAccessedSnap.empty) {
          setLastAccessed(lastAccessedSnap.docs[0].data());
        }

        // 6. Fetch recommended courses strictly filtered by student eduLevel
        const coursesRef = collection(db, 'courses');
        const pubQuery = query(coursesRef, where('isPublished', '==', true));
        const courseSnap = await getDocs(pubQuery);
        let allPublished = courseSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        if (userData?.eduLevel) {
          const userLevel = (userData.eduLevel || '').toLowerCase().trim();
          allPublished = allPublished.filter((c: any) => (c.category || '').toLowerCase().trim() === userLevel);
        }

        setRecommendedCourses(allPublished.slice(0, 4));

        // Helper to parse Live Class Date & Time safely in local timezone
        const parseLiveClassTimestamp = (dateStr?: string, timeStr?: string): number => {
          if (!dateStr) return Date.now();
          try {
            const dateParts = dateStr.split('-');
            let dateObj: Date;
            if (dateParts.length === 3) {
              const year = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10) - 1;
              const day = parseInt(dateParts[2], 10);
              dateObj = new Date(year, month, day);
            } else {
              dateObj = new Date(dateStr);
            }

            if (isNaN(dateObj.getTime())) return Date.now();

            if (timeStr) {
              const timeLower = timeStr.toLowerCase().trim();
              const isPm = timeLower.includes('pm');
              const isAm = timeLower.includes('am');
              const cleanTime = timeLower.replace(/am|pm/g, '').trim();
              const timeParts = cleanTime.split(':');

              if (timeParts.length >= 2) {
                let hours = parseInt(timeParts[0], 10) || 0;
                const minutes = parseInt(timeParts[1], 10) || 0;
                if (isPm && hours < 12) hours += 12;
                if (isAm && hours === 12) hours = 0;
                dateObj.setHours(hours, minutes, 0, 0);
              }
            }
            return dateObj.getTime();
          } catch {
            return Date.now();
          }
        };

        // 7. Fetch Activity Feed Items across enrolled courses (Global Top 3)
        if (enrolledCourseIds.length > 0) {
          const feedItems: ActivityFeedItem[] = [];

          await Promise.all(
            enrolledCourseIds.map(async (courseId) => {
              try {
                const courseDocSnap = await getDoc(doc(db, 'courses', courseId));
                if (courseDocSnap.exists()) {
                  const cData = courseDocSnap.data();
                  const courseTitle = cData.title || 'Enrolled Course';

                  if (cData.notices && Array.isArray(cData.notices)) {
                    cData.notices.forEach((n: any) => {
                      feedItems.push({
                        id: `notice-${n.id}`,
                        type: 'notice',
                        title: n.title,
                        subtitle: n.content,
                        dateStr: formatTimeAgo(n.createdAt),
                        courseTitle,
                        courseId,
                        link: `/dashboard/courses/${courseId}/community`,
                        timestamp: new Date(n.createdAt || Date.now()).getTime()
                      });
                    });
                  }

                  if (cData.liveClasses && Array.isArray(cData.liveClasses)) {
                    cData.liveClasses.forEach((lc: any) => {
                      const lcTime = parseLiveClassTimestamp(lc.date, lc.time);
                      const creationTime = Number(lc.createdAt) || (Number(lc.id) > 1000000000000 ? Number(lc.id) : 0);
                      const bestTime = Math.max(lcTime, creationTime);
                      const isLiveNow = Boolean(lc.isLive);
                      feedItems.push({
                        id: `live-${lc.id}`,
                        type: 'live_class',
                        title: lc.title,
                        subtitle: isLiveNow ? '🔴 Live Now! (লাইভ ক্লাস শুরু হয়েছে)' : (lc.date ? `${lc.date}${lc.time ? ' • ' + lc.time : ''}` : 'সিডিউলড লাইভ ক্লাস'),
                        dateStr: lc.date || '',
                        courseTitle,
                        courseId,
                        isLive: isLiveNow,
                        link: `/dashboard/courses/${courseId}/live-classes`,
                        timestamp: isLiveNow ? Date.now() + 1000000000 : bestTime
                      });
                    });
                  }

                  if (cData.exams && Array.isArray(cData.exams)) {
                    cData.exams.forEach((ex: any) => {
                      if (ex.isPublished !== false) {
                        feedItems.push({
                          id: `exam-${ex.id}`,
                          type: 'exam',
                          title: ex.title,
                          subtitle: ex.endTime ? `Deadline: ${new Date(ex.endTime).toLocaleDateString()}` : `${ex.totalMarks || 0} Marks • ${ex.durationMinutes || 0} mins`,
                          dateStr: ex.durationMinutes ? `${ex.durationMinutes}m` : '',
                          courseTitle,
                          courseId,
                          link: `/dashboard/courses/${courseId}/exams`,
                          timestamp: ex.endTime ? new Date(ex.endTime).getTime() : Date.now()
                        });
                      }
                    });
                  }
                }
              } catch (err) {
                console.error(`Error fetching updates for course ${courseId}:`, err);
              }
            })
          );

          feedItems.sort((a, b) => {
            if (a.isLive && !b.isLive) return -1;
            if (!a.isLive && b.isLive) return 1;
            return b.timestamp - a.timestamp;
          });
          setActivityFeed(feedItems.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsFeedLoading(false);
      }
    };

    fetchData();
  }, [user, userData?.eduLevel]);

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
    { title: t('enrolled'), value: enrolledCount !== null ? enrolledCount.toString() : '-', icon: BookOpen, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { title: t('completed'), value: completedCount.toString(), icon: CheckCircle, color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/20' },
    { title: locale === 'bn' ? 'গড় পরীক্ষা নম্বর' : 'Average Score', value: avgScore, icon: Trophy, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div ref={containerRef} className="w-full space-y-10">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-purple-500/10 dark:from-orange-500/20 dark:via-purple-500/15 dark:to-blue-500/20 border border-orange-500/20 dark:border-white/10 p-6 sm:p-8 md:p-12 shadow-lg backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-15 pointer-events-none">
          <Sparkles className="w-24 h-24 sm:w-36 sm:h-36 text-orange-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 sm:w-96 h-80 sm:h-96 opacity-30 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[-50px] left-[-50px] w-56 sm:w-64 h-56 sm:h-64 opacity-20 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-md mb-3 sm:mb-4">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(streakDays)} {locale === 'bn' ? 'দিনের স্ট্রীক!' : 'Day Streak!'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 tracking-tight text-gray-900 dark:text-white leading-tight">
              {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-purple-500">{user?.displayName?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-foreground/80 dark:text-foreground/70 text-xs sm:text-base max-w-xl leading-relaxed">
              {t('subtitle')} {t('newModules')}
            </p>
          </div>
          
          <button className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm group w-full sm:w-auto">
            {t('resumeLearning')}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Grid - 2 Columns on Mobile with Centered Content */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isLastItemOnMobile = index === 2;
          return (
            <div 
              key={index} 
              className={`group relative bg-white dark:bg-foreground/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 dark:border-foreground/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-foreground/10 overflow-hidden cursor-default flex flex-col items-center justify-center text-center ${
                isLastItemOnMobile ? 'col-span-2 md:col-span-1 sm:col-span-1' : 'col-span-1'
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500`}></div>
              
              <div className="flex flex-col items-center justify-center text-center gap-2 relative z-10 w-full">
                <div className={`bg-gradient-to-br ${stat.color} p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-white shadow-md ${stat.shadow} transform group-hover:rotate-6 transition-transform duration-300 flex items-center justify-center`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="w-full text-center">
                  <p className="text-foreground/60 font-semibold text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 truncate text-center">{stat.title}</p>
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white text-center">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Learning & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Focus / Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('continue')}</h2>
            <Link href="/dashboard/courses" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              {t('viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {lastAccessed ? (
            <Link href={`/dashboard/courses/${lastAccessed.courseId}/recorded-classes/${lastAccessed.lessonId}`} className="block">
              <div className="bg-white dark:bg-white/[0.04] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-200/80 dark:border-white/10 flex flex-row items-center gap-3 sm:gap-5 group hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                {/* Compact Thumbnail Image List view on Mobile */}
                <div className="w-28 sm:w-52 h-24 sm:h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 shadow-md">
                  {lastAccessed.thumbnailUrl ? (
                    <img src={lastAccessed.thumbnailUrl} alt={lastAccessed.courseTitle} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-white">
                        <div className="w-9 h-9 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                          <PlayCircle className="w-5 h-5 sm:w-8 sm:h-8 text-white fill-white/20" />
                        </div>
                        <span className="font-bold text-[10px] sm:text-xs tracking-wider text-white/90 line-clamp-1">{lastAccessed.courseTitle}</span>
                      </div>
                    </>
                  )}
                  {lastAccessed.thumbnailUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                
                {/* Text Content List view */}
                <div className="flex-1 min-w-0 py-0.5 sm:py-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] sm:text-xs font-extrabold text-primary bg-primary/10 px-2 sm:px-3 py-0.5 rounded-md uppercase tracking-wider border border-primary/20 truncate">
                        {getCategoryTranslation(lastAccessed.category)}
                      </span>
                      <span className="flex items-center gap-1 text-foreground/70 dark:text-foreground/60 text-[10px] sm:text-xs font-semibold bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        {formatTimeAgo(lastAccessed.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-xl font-bold group-hover:text-primary transition-colors text-gray-900 dark:text-white line-clamp-1 sm:line-clamp-2 leading-tight">
                      {lastAccessed.lessonTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 mt-0.5 sm:mt-1 truncate font-medium">
                      {lastAccessed.courseTitle}
                    </p>
                  </div>
                  
                  <div className="mt-2 sm:mt-3 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1">
                      {t('resumeAction')} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white dark:bg-foreground/5 rounded-3xl p-8 border border-gray-200 dark:border-foreground/10 text-center shadow-sm">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Learning</h3>
              <p className="text-foreground/60 mb-6">You haven't watched any lessons recently. Go to your courses and pick a topic to start!</p>
              <Link href="/dashboard/courses" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all inline-flex">
                Go to Courses
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar / Dynamic Activity Feed (সাম্প্রতিক ৩টি আপডেট) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {t('upcomingTasks')} & আপডেট
            </h2>
            <span className="px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
              সর্বশেষ ৩টি
            </span>
          </div>
          
          <div className="bg-white dark:bg-foreground/5 rounded-3xl p-5 border border-gray-200 dark:border-foreground/10 space-y-3 relative overflow-hidden backdrop-blur-xl shadow-lg">
            
            {isFeedLoading ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-foreground/5 animate-pulse rounded-2xl border border-foreground/5"></div>
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="p-8 text-center text-foreground/50 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                আপনার এনরোল করা কোর্সে কোনো নোটিশ বা নতুন ক্লাস নেই।
              </div>
            ) : (
              activityFeed.map((item) => {
                let IconComponent = Megaphone;
                let iconWrapperClass = "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20";
                
                if (item.type === 'live_class') {
                  IconComponent = Video;
                  iconWrapperClass = item.isLive 
                    ? "bg-red-500/15 text-red-500 ring-1 ring-red-500/30 animate-pulse" 
                    : "bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20";
                } else if (item.type === 'exam') {
                  IconComponent = HelpCircle;
                  iconWrapperClass = "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20";
                } else if (item.type === 'lesson') {
                  IconComponent = BookOpen;
                  iconWrapperClass = "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20";
                }

                return (
                  <Link key={item.id} href={item.link} className="block group">
                    <div className="flex items-center gap-3.5 p-4 bg-gray-50/80 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] rounded-2xl border border-gray-200/60 dark:border-white/10 hover:border-primary/40 dark:hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                      
                      {/* Clean SVG Icon Box */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${iconWrapperClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Course Tag & Type Badges */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/25 rounded-md truncate max-w-[140px] sm:max-w-[220px]" title={item.courseTitle}>
                            📚 {item.courseTitle}
                          </span>
                          {item.type === 'notice' && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold text-amber-500 bg-amber-500/10 rounded-md">
                              নোটিশ
                            </span>
                          )}
                          {item.type === 'live_class' && (
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md flex items-center gap-1 ${item.isLive ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-purple-500 bg-purple-500/10'}`}>
                              {item.isLive ? '🔴 লাইভ চলছে' : 'লাইভ ক্লাস'}
                            </span>
                          )}
                          {item.type === 'exam' && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold text-blue-500 bg-blue-500/10 rounded-md">
                              পরীক্ষা
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </h4>
                        
                        {item.subtitle && (
                          <p className="text-xs text-foreground/60 mt-0.5 truncate font-medium">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>

                    </div>
                  </Link>
                );
              })
            )}

            <Link href="/dashboard/courses" className="block w-full text-center py-2.5 mt-2 text-xs font-bold text-gray-500 hover:text-primary dark:text-foreground/60 dark:hover:text-primary transition-colors border-t border-gray-100 dark:border-foreground/10 pt-3">
              সকল কোর্স দেখুন →
            </Link>
          </div>
        </div>

      </div>

      {/* Ongoing Courses / Recommended Courses (Based on Profile) */}
      <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-foreground/10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('ongoingCourses')}</h2>
            <p className="text-gray-500 dark:text-foreground/60 text-sm mt-1">{t('basedOnProfile')}</p>
          </div>
          <Link href="/dashboard/recommended" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
            {t('browseMore')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recommendedCourses.length === 0 ? (
          <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-8 text-center flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-orange-500 mb-3" />
            <h3 className="text-lg font-bold mb-1">
              {locale === 'bn' ? `আপনার শিক্ষাগত স্তর (${userData?.eduLevel || ''}) অনুযায়ী কোর্স পাওয়া যায়নি` : `No courses available for your level (${userData?.eduLevel || ''})`}
            </h3>
            <p className="text-xs sm:text-sm text-foreground/60 max-w-md mb-4">
              {locale === 'bn' ? 'আপনার একাডেমি লেভেলের নতুন কোর্স শীঘ্রই যুক্ত করা হবে।' : 'New courses for your academic profile will be added soon.'}
            </p>
            <Link href="/courses" className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90">
              {locale === 'bn' ? 'সব কোর্স দেখুন' : 'Browse All Courses'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {recommendedCourses.map((course) => {
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
                      🎁 {locale === 'bn' ? 'ফ্রি' : 'FREE'}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors duration-300">
                    {course.title}
                  </h3>

                  <p className="text-foreground/60 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                    {course.subtitle || (locale === 'bn' ? 'অভিজ্ঞ শিক্ষকমণ্ডলীর নির্দেশনায় সম্পূর্ণ কোর্স সম্পন্ন করুন।' : 'Master your skills with comprehensive guidance.')}
                  </p>

                  {/* Course Metadata Stats */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/10 mb-6 text-xs font-semibold text-foreground/70">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      <span>{formatNumber(course.totalVideoLessons || 0)} {locale === 'bn' ? 'টি ভিডিও' : 'Lessons'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      <span>{formatNumber(course.totalExams || 0)} {locale === 'bn' ? 'টি এক্সাম' : 'Exams'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{course.courseValidity || (locale === 'bn' ? 'লাইফটাইম' : 'Lifetime')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{formatNumber(course.enrolledStudents || 0)} {locale === 'bn' ? 'শিক্ষার্থী' : 'Students'}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      {isFree ? (
                        <span className="text-2xl font-extrabold text-emerald-500">{locale === 'bn' ? 'ফ্রি' : 'FREE'}</span>
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
                      <span>{locale === 'bn' ? 'কোর্সটি দেখুন' : 'View Course'}</span>
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

    </div>
  );
}
