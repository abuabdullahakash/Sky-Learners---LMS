"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle2, PlayCircle, Trophy, BookOpen, AlertCircle, Calendar, Video, UserCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function StudentCourseOverview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const t = useTranslations('Dashboard.courseOverview');
  const { user } = useAuth();
  
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [completedExamsCount, setCompletedExamsCount] = useState<number>(0);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  // Time state for live classes
  const [currentTime, setCurrentTime] = useState(new Date());

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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl">
      
      {/* Left Column (Main Content) */}
      <div className="xl:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">{t('welcome')} {course.title}</h1>
          <p className="text-gray-600 dark:text-foreground/70">{t('summary')}</p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercentage}%</h3>
            <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">{t('progress')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-200 dark:border-green-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</h3>
            <p className="text-sm font-bold text-green-600/80 dark:text-green-400/80 uppercase tracking-wider">{t('lessonsCompleted')}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
            <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount * 10}</h3>
            <p className="text-sm font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">{t('pointsEarned')}</p>
          </div>
        </div>

        {/* Continue Learning CTA */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-foreground/5 dark:to-foreground/10 rounded-3xl p-8 border border-gray-200 dark:border-foreground/20 text-center flex flex-col items-center shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -ml-8 -mb-8 group-hover:bg-blue-500/10 transition-colors"></div>
          
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
            <PlayCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">{t('readyToStart')}</h2>
          <p className="text-gray-600 dark:text-foreground/70 max-w-md mb-6 relative z-10">{t('diveInto')}</p>
          <Link 
            href={`/dashboard/courses/${courseId}/curriculum`}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 relative z-10 hover:-translate-y-1"
          >
            {t('goToCurriculum')}
          </Link>
        </div>
        
        {/* Announcements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            {t('latestAnnouncements')}
          </h2>
          <div className="bg-yellow-500/10 dark:bg-yellow-500/5 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-500/20 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500 mb-2 opacity-50" />
            <p className="text-yellow-800 dark:text-yellow-500/70 italic font-medium">{t('noAnnouncements')}</p>
          </div>
        </div>
      </div>

      {/* Right Column (Widgets) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Widget 1: Circular Progress */}
        <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 w-full text-left">Your Progress</h3>
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
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{progressPercentage}%</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 w-full border-t border-gray-100 dark:border-foreground/10 pt-4 text-sm font-medium">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-foreground/60 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> Lessons
              </span>
              <span className="text-gray-900 dark:text-white font-bold">{completedCount} / {promisedVideos}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-foreground/60 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-orange-500" /> Exams
              </span>
              <span className="text-gray-900 dark:text-white font-bold">{completedExamsCount} / {promisedExams}</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Upcoming Live Class */}
        <div className="bg-white dark:bg-foreground/5 rounded p-6 border border-gray-200 dark:border-foreground/10 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Upcoming Live</h3>
            {nextClass?.isLive && (
              <span className="bg-red-500 text-white px-2.5 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-sm shadow-red-500/20">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                LIVE NOW
                {nextClass.liveStartedAt && (
                  <span className="ml-1 border-l border-white/30 pl-2 text-white/90 font-mono tracking-tighter">
                    {formatLiveDuration(nextClass.liveStartedAt)}
                  </span>
                )}
              </span>
            )}
          </div>
          
          {nextClass ? (
            <div className={`space-y-4 ${canJoinLive ? 'ring-1 ring-orange-500/30 bg-orange-500/5 p-4 rounded' : ''} transition-all`}>
              <div className={`p-4 rounded border ${canJoinLive ? 'bg-white dark:bg-foreground/5 border-orange-200 dark:border-orange-500/20' : 'bg-gray-50 dark:bg-foreground/5 border-gray-100 dark:border-foreground/10'}`}>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{nextClass.title}</h4>
                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{nextClass.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded text-sm font-bold">
                    <Clock className="w-4 h-4" /> {formatTime12Hour(nextClass.time)}
                  </div>
                </div>
              </div>
              
              {canJoinLive ? (
                <a 
                  href={nextClass.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 animate-in zoom-in"
                >
                  <Video className="w-5 h-5" /> Join Class
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-foreground/10 text-gray-400 dark:text-foreground/40 font-bold rounded cursor-not-allowed transition-colors"
                  >
                    <Clock className="w-5 h-5" /> Starting Soon...
                  </button>
                  <span className="text-[10px] text-center text-gray-400 font-medium">
                    {nextClass.isAutoStart ? 'Activates at scheduled time' : 'Teacher will start this manually'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-foreground/20 mb-3" />
              <p className="text-gray-500 dark:text-foreground/60 text-sm">No upcoming live classes scheduled at the moment.</p>
            </div>
          )}
        </div>

        {/* Widget 3: Instructor Profile */}
        {teacherProfile && (
          <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Course Instructor</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-foreground/10 shrink-0 border border-gray-200 dark:border-foreground/20">
                {teacherProfile.photoUrl ? (
                  <img src={teacherProfile.photoUrl} alt={teacherProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-full h-full text-gray-400 dark:text-foreground/40" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{teacherProfile.displayName}</h4>
                <p className="text-xs text-gray-500 dark:text-foreground/60 line-clamp-1">{teacherProfile.title || 'Instructor'}</p>
              </div>
            </div>
            {course.teacherId && (
              <Link 
                href={`/teachers/${course.teacherId}`}
                target="_blank"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-foreground/20 text-gray-700 dark:text-foreground/80 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-foreground/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View Profile
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
