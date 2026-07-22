"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BookOpen, CheckCircle, Trophy, PlayCircle, ArrowRight, Sparkles, Flame, Clock, Video, Megaphone, HelpCircle, Bell } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
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
  
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
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
        // Fetch approved enrollments count & IDs
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(
          enrollmentsRef,
          where('studentId', '==', user.uid),
          where('status', '==', 'approved')
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        setEnrolledCount(enrollmentsSnap.size);

        const enrolledCourseIds = enrollmentsSnap.docs.map(d => d.data().courseId).filter(Boolean);

        // Fetch completed lessons count
        const completedRef = collection(db, 'completed_lessons');
        const completedQuery = query(completedRef, where('studentId', '==', user.uid));
        const completedSnap = await getDocs(completedQuery);
        setCompletedCount(completedSnap.size);

        // Fetch last accessed lesson
        const lastAccessedRef = collection(db, 'last_accessed');
        const lastAccessedQuery = query(lastAccessedRef, where('__name__', '==', user.uid));
        const lastAccessedSnap = await getDocs(lastAccessedQuery);
        if (!lastAccessedSnap.empty) {
          setLastAccessed(lastAccessedSnap.docs[0].data());
        }

        // Fetch recommended courses
        const coursesRef = collection(db, 'courses');
        let courseQuery = query(coursesRef, where('isPublished', '==', true), limit(3));
        
        if (userData?.eduLevel) {
          courseQuery = query(
            coursesRef,
            where('isPublished', '==', true),
            where('category', '==', userData.eduLevel),
            limit(3)
          );
        }

        const courseSnap = await getDocs(courseQuery);
        let coursesData = courseSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        if (coursesData.length === 0 && userData?.eduLevel) {
          const fallbackQuery = query(coursesRef, where('isPublished', '==', true), limit(3));
          const fallbackSnap = await getDocs(fallbackQuery);
          coursesData = fallbackSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        }

        setRecommendedCourses(coursesData);

        // Fetch Activity Feed Items across all enrolled courses
        if (enrolledCourseIds.length > 0) {
          const feedItems: ActivityFeedItem[] = [];

          for (const courseId of enrolledCourseIds) {
            try {
              const courseDocSnap = await getDoc(doc(db, 'courses', courseId));
              if (courseDocSnap.exists()) {
                const cData = courseDocSnap.data();
                const courseTitle = cData.title || 'Enrolled Course';

                // 📢 Notices
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

                // 🔴 Live Classes
                if (cData.liveClasses && Array.isArray(cData.liveClasses)) {
                  cData.liveClasses.forEach((lc: any) => {
                    const lcTime = new Date(`${lc.date}T${lc.time}`).getTime() || Date.now();
                    feedItems.push({
                      id: `live-${lc.id}`,
                      type: 'live_class',
                      title: lc.title,
                      subtitle: lc.isLive ? '🔴 Live Now! (লাইভ চলছে)' : `${lc.date} • ${lc.time}`,
                      dateStr: lc.date,
                      courseTitle,
                      courseId,
                      isLive: lc.isLive,
                      link: `/dashboard/courses/${courseId}/live-classes`,
                      timestamp: lc.isLive ? Date.now() + 100000000 : lcTime
                    });
                  });
                }

                // 📝 Exams
                if (cData.exams && Array.isArray(cData.exams)) {
                  cData.exams.forEach((ex: any) => {
                    if (ex.isPublished !== false) {
                      feedItems.push({
                        id: `exam-${ex.id}`,
                        type: 'exam',
                        title: ex.title,
                        subtitle: ex.endTime ? `Deadline: ${new Date(ex.endTime).toLocaleDateString()}` : `${ex.totalMarks} Marks • ${ex.durationMinutes} mins`,
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
          }

          // Sort by timestamp (newest/upcoming first)
          feedItems.sort((a, b) => b.timestamp - a.timestamp);
          setActivityFeed(feedItems.slice(0, 5));
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
    { title: t('enrolled'), value: enrolledCount !== null ? enrolledCount : '-', icon: BookOpen, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { title: t('completed'), value: completedCount.toString(), icon: CheckCircle, color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/20' },
    { title: t('score'), value: (completedCount * 10).toString(), icon: Trophy, color: 'from-orange-500 to-yellow-400', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div ref={containerRef} className="w-full space-y-10">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-30 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 opacity-20 pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
              <Flame className="w-4 h-4" />
              <span>{t('streak')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-gray-900 dark:text-white">
              {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.displayName?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-foreground/80 dark:text-foreground/70 text-lg max-w-xl leading-relaxed">
              {t('subtitle')} {t('newModules')}
            </p>
          </div>
          
          <button className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group">
            {t('resumeLearning')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group relative bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl dark:shadow-none dark:hover:bg-foreground/10 overflow-hidden cursor-default">
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
              <div className="bg-white dark:bg-foreground/5 rounded-3xl p-3 border border-gray-200 dark:border-foreground/10 flex flex-col sm:flex-row items-stretch gap-4 group hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-2xl dark:shadow-none dark:hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="w-full sm:w-56 h-48 sm:h-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl relative overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
                  {lastAccessed.thumbnailUrl ? (
                    <img src={lastAccessed.thumbnailUrl} alt={lastAccessed.courseTitle} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                          <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                        </div>
                        <span className="font-bold tracking-widest text-white/90 line-clamp-2">{lastAccessed.courseTitle}</span>
                      </div>
                    </>
                  )}
                  {lastAccessed.thumbnailUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-100 bg-gray-200/50 dark:bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider border border-gray-300 dark:border-white/20 shadow-sm">{getCategoryTranslation(lastAccessed.category)}</span>
                      <span className="flex items-center gap-1 text-foreground/70 dark:text-foreground/60 text-sm font-semibold bg-gray-100 dark:bg-foreground/5 px-2 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-primary" />
                        {formatTimeAgo(lastAccessed.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mt-3 group-hover:text-primary transition-colors text-gray-900 dark:text-white line-clamp-2">{lastAccessed.lessonTitle}</h3>
                    <p className="text-foreground/70 dark:text-foreground/60 mt-2 line-clamp-2 leading-relaxed">
                      {lastAccessed.courseTitle}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary flex items-center gap-1">
                      {t('resumeAction')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

        {/* Sidebar / Dynamic Activity Feed (আসন্ন কাজসমূহ ও সাম্প্রতিক আপডেট) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary animate-bounce" />
              {t('upcomingTasks')} & আপডেট
            </h2>
          </div>
          
          <div className="bg-white dark:bg-foreground/5 rounded-3xl p-5 border border-gray-200 dark:border-foreground/10 space-y-3 relative overflow-hidden backdrop-blur-md shadow-md dark:shadow-none">
            
            {isFeedLoading ? (
              <div className="p-8 text-center text-sm font-medium text-foreground/50">
                আপডেট লোড হচ্ছে...
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="p-6 text-center text-foreground/50 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                আপনার এনরোল করা কোর্সে কোনো সাম্প্রতিক নোটিশ বা ক্লাস নেই।
              </div>
            ) : (
              activityFeed.map((item) => {
                let IconComponent = Megaphone;
                let iconColor = "text-orange-500 bg-orange-500/10";
                
                if (item.type === 'live_class') {
                  IconComponent = Video;
                  iconColor = item.isLive ? "text-red-500 bg-red-500/10 animate-pulse" : "text-purple-500 bg-purple-500/10";
                } else if (item.type === 'exam') {
                  IconComponent = HelpCircle;
                  iconColor = "text-blue-500 bg-blue-500/10";
                } else if (item.type === 'lesson') {
                  IconComponent = BookOpen;
                  iconColor = "text-emerald-500 bg-emerald-500/10";
                }

                return (
                  <Link key={item.id} href={item.link} className="block">
                    <div className="flex items-start gap-3.5 p-3.5 bg-gray-50 dark:bg-background/50 rounded-2xl hover:bg-primary/10 dark:hover:bg-primary/10 transition-all cursor-pointer group border border-transparent hover:border-primary/30">
                      
                      {/* Clean SVG Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Course Tag Badge */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full truncate max-w-[160px]" title={item.courseTitle}>
                            {item.courseTitle}
                          </span>
                          {item.type === 'notice' && <span className="text-[10px] font-bold text-orange-500">নোটিশ</span>}
                          {item.type === 'live_class' && <span className="text-[10px] font-bold text-red-500">{item.isLive ? '🔴 লাইভ' : 'লাইভ ক্লাস'}</span>}
                          {item.type === 'exam' && <span className="text-[10px] font-bold text-blue-500">পরীক্ষা</span>}
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        
                        {item.subtitle && (
                          <p className="text-xs text-foreground/60 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
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

      {/* Ongoing Courses (Based on Profile) */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="bg-white dark:bg-foreground/5 rounded-3xl p-4 border border-gray-200 dark:border-foreground/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl dark:shadow-none group cursor-pointer flex flex-col">
              <div className="h-40 bg-gradient-to-br from-primary/80 to-accent rounded-2xl mb-4 relative overflow-hidden flex-shrink-0">
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-black/10"></div>
                )}
                <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold capitalize shadow-sm">{course.category || t('categories.primary')}</div>
              </div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors text-gray-900 dark:text-white line-clamp-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-foreground/60 text-sm mb-4 line-clamp-2 flex-1">{course.subtitle || t('defaultSubtitle')}</p>
              <div className="flex justify-between items-center text-sm font-medium mt-auto pt-2 border-t border-gray-100 dark:border-foreground/10">
                <span className="text-gray-500 dark:text-foreground/50">{course.totalVideoLessons || 0} {t('lessons')}</span>
                <span className="text-primary font-bold">{t('continueBtn')}</span>
              </div>
            </Link>
          ))}
          {recommendedCourses.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              {t('noRecommended')}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
