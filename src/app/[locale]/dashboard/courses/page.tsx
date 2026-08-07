"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from '@/i18n/routing';
import { BookOpen, Clock, CheckCircle2, PlayCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import FlyingBookLoader from '@/components/ui/FlyingBookLoader';

type EnrolledCourse = {
  enrollmentId: string;
  courseId: string;
  status: 'pending' | 'approved';
  enrolledAt: Date;
  courseDetails: any;
  progressPercentage?: number;
};

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('Dashboard.myCourses');
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(num);
  };

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      try {
        // 1. Fetch enrollments by studentId AND studentEmail / contactEmail
        const enrollmentsMap = new Map<string, any>();
        
        // Query by studentId
        const uidSnap = await getDocs(query(collection(db, 'enrollments'), where('studentId', '==', user.uid)));
        uidSnap.forEach(d => enrollmentsMap.set(d.id, d));
        
        // Query by email
        if (user.email) {
          const userEmail = user.email.toLowerCase().trim();
          const [byStudentEmailSnap, byContactEmailSnap] = await Promise.all([
            getDocs(query(collection(db, 'enrollments'), where('studentEmail', '==', userEmail))),
            getDocs(query(collection(db, 'enrollments'), where('contactEmail', '==', userEmail)))
          ]);
          
          byStudentEmailSnap.forEach(d => {
            enrollmentsMap.set(d.id, d);
            if (d.data().studentId !== user.uid) {
              updateDoc(doc(db, 'enrollments', d.id), { studentId: user.uid }).catch(() => {});
            }
          });
          
          byContactEmailSnap.forEach(d => {
            enrollmentsMap.set(d.id, d);
            if (d.data().studentId !== user.uid) {
              updateDoc(doc(db, 'enrollments', d.id), { studentId: user.uid }).catch(() => {});
            }
          });
        }

        const enrollmentDocs = Array.from(enrollmentsMap.values());

        // 2. Fetch completed lessons and completed exams for this student
        const completedLessonsMap: Record<string, number> = {};
        const completedLessonsSnap = await getDocs(query(collection(db, 'completed_lessons'), where('studentId', '==', user.uid)));
        completedLessonsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.courseId) {
            completedLessonsMap[data.courseId] = (completedLessonsMap[data.courseId] || 0) + 1;
          }
        });

        if (user.email) {
          const clEmailSnap = await getDocs(query(collection(db, 'completed_lessons'), where('studentEmail', '==', user.email.toLowerCase().trim())));
          clEmailSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.courseId && !completedLessonsSnap.docs.some(d => d.id === docSnap.id)) {
              completedLessonsMap[data.courseId] = (completedLessonsMap[data.courseId] || 0) + 1;
            }
          });
        }

        const completedExamsMap: Record<string, number> = {};
        const completedExamsSnap = await getDocs(query(collection(db, 'completed_exams'), where('studentId', '==', user.uid)));
        completedExamsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.courseId) {
            completedExamsMap[data.courseId] = (completedExamsMap[data.courseId] || 0) + 1;
          }
        });

        if (user.email) {
          const ceEmailSnap = await getDocs(query(collection(db, 'completed_exams'), where('studentEmail', '==', user.email.toLowerCase().trim())));
          ceEmailSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.courseId && !completedExamsSnap.docs.some(d => d.id === docSnap.id)) {
              completedExamsMap[data.courseId] = (completedExamsMap[data.courseId] || 0) + 1;
            }
          });
        }
        
        const enrollmentsPromises = enrollmentDocs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const courseId = enrollmentData.courseId;
          
          let courseDetails = null;
          let progressPercentage = 0;

          if (courseId) {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              const cData = courseSnap.data();
              courseDetails = { id: courseSnap.id, ...cData };

              const actualUploadedLessons = (cData.modules || []).reduce(
                (sum: number, mod: any) => sum + (mod.lessons?.length || 0),
                0
              );
              const promisedVideos = Number(cData.totalVideoLessons) || actualUploadedLessons;
              const promisedExams = Number(cData.totalExams) || (cData.exams?.length || 0);

              const totalCourseItems = promisedVideos + promisedExams;
              const completedCount = completedLessonsMap[courseId] || 0;
              const completedExamsCount = completedExamsMap[courseId] || 0;
              const totalCompletedItems = completedCount + completedExamsCount;

              progressPercentage = totalCourseItems > 0
                ? Math.min(100, Math.round((totalCompletedItems / totalCourseItems) * 100))
                : 0;
            }
          }

          let enrolledAtDate = new Date();
          if (enrollmentData.createdAt) {
            if (typeof enrollmentData.createdAt.toDate === 'function') {
              enrolledAtDate = enrollmentData.createdAt.toDate();
            } else if (typeof enrollmentData.createdAt === 'string' || typeof enrollmentData.createdAt === 'number') {
              enrolledAtDate = new Date(enrollmentData.createdAt);
            }
          }

          return {
            enrollmentId: enrollmentDoc.id,
            courseId: courseId,
            status: enrollmentData.status,
            enrolledAt: enrolledAtDate,
            courseDetails,
            progressPercentage,
          } as EnrolledCourse;
        });

        const fetchedCourses = await Promise.all(enrollmentsPromises);
        
        // Sort by enrolledAt descending
        fetchedCourses.sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());

        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <FlyingBookLoader />
      </div>
    );
  }

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const approvedCourses = courses.filter(c => c.status === 'approved');

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      
      {/* Premium Hero Banner Header - Larger & Richer */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 md:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-2xl border border-white/10 min-h-[220px] sm:min-h-[260px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 opacity-20 pointer-events-none">
          <Sparkles className="w-24 h-24 sm:w-36 sm:h-36 text-orange-400 animate-pulse" />
        </div>

        <div className="relative z-10 space-y-3.5">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs sm:text-sm font-extrabold rounded-full uppercase tracking-wider border border-orange-500/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-orange-400" />
              {locale === 'bn' ? 'লার্নিং পোর্টাল' : 'Learning Portal'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('noCoursesTitle')}</h2>
          <p className="text-foreground/60 max-w-md mb-8">{t('noCoursesDesc')}</p>
          <Link 
            href="/courses" 
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
          >
            {t('browseBtn')}
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Pending Courses Section */}
          {pendingCourses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-500" />
                {t('pendingApproval')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {pendingCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} t={t} formatNumber={formatNumber} />
                ))}
              </div>
            </div>
          )}

          {/* Approved Courses Section */}
          {approvedCourses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {t('activeCourses')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {approvedCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} t={t} formatNumber={formatNumber} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ item, t, formatNumber }: { item: EnrolledCourse; t: any; formatNumber: (n: number) => string }) {
  const course = item.courseDetails;
  
  if (!course) {
    return (
      <div className="bg-white dark:bg-foreground/5 rounded-3xl border border-gray-200 dark:border-foreground/10 p-6 flex items-center gap-4 text-foreground/50 shadow-sm">
        <AlertCircle className="w-6 h-6 text-red-400" />
        {t('unavailableDetails')}
      </div>
    );
  }

  const isPending = item.status === 'pending';

  // Multi-color logic based on category or random consistent color
  const colors = [
    'from-blue-500 to-cyan-500 shadow-blue-500/20 text-blue-500 bg-blue-500/10',
    'from-orange-500 to-amber-500 shadow-orange-500/20 text-orange-500 bg-orange-500/10',
    'from-purple-500 to-pink-500 shadow-purple-500/20 text-purple-500 bg-purple-500/10',
    'from-emerald-500 to-teal-500 shadow-emerald-500/20 text-emerald-500 bg-emerald-500/10',
  ];
  
  // Create a pseudo-random but consistent index based on course id
  const colorIndex = course.id ? course.id.charCodeAt(0) % colors.length : 0;
  const colorSet = colors[colorIndex].split(' ');
  const gradientClass = colorSet[0] + ' ' + colorSet[1];
  const shadowClass = colorSet[2];
  const textColorClass = colorSet[3];
  const bgColorClass = colorSet[4];

  const pct = item.progressPercentage || 0;

  return (
    <div className="group relative bg-white dark:bg-slate-900/80 rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden hover:border-transparent transition-all duration-500 flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-2 z-10">
      
      {/* Colorful Animated Border on Hover */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" style={{ margin: '-2px' }}></div>
      <div className="absolute inset-0 bg-white dark:bg-[#0f172a] rounded-[2rem] z-[-5]"></div>

      {/* Subtle background glow - replaced blur with radial gradient for performance */}
      <div className={`absolute top-0 right-0 w-48 h-48 opacity-10 dark:opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-700`} style={{ background: 'radial-gradient(circle at top right, currentColor 0%, transparent 70%)', color: 'var(--primary)' }}></div>

      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-foreground/5 flex-shrink-0 overflow-hidden rounded-t-[2rem]">
        {course.thumbnailUrl ? (
          <Image src={course.thumbnailUrl} alt={course.title || t('defaultCategory')} fill className={`object-cover transition-transform duration-700 ease-out ${!isPending && 'group-hover:scale-110 group-hover:rotate-1'}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30">{t('noImage')}</div>
        )}
        
        {/* Dark gradient overlay for image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/20 ${
            isPending ? 'bg-orange-500/90 text-white' : 'bg-green-500/90 text-white'
          }`}>
            {isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {isPending ? t('statusPending') : t('statusActive')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider ${bgColorClass} ${textColorClass} border border-current/10`}>
          {course.category || t('defaultCategory')}
        </div>
        <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-colors duration-300">{course.title}</h3>
        
        {/* Dynamic Progress Bar */}
        {!isPending && (
          <div className="mt-auto pt-4 mb-5">
             <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-600 dark:text-gray-300">{t('progress')}</span>
                <span className={textColorClass}>{formatNumber(pct)}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                  className={`bg-gradient-to-r ${gradientClass} h-full rounded-full relative transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                </div>
              </div>
          </div>
        )}

        <div className={`mt-auto ${isPending ? 'pt-6' : ''}`}>
          {isPending ? (
            <div className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-xl font-semibold text-center text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200 dark:border-white/10">
              <Clock className="w-4 h-4" />
              {t('waitingApproval')}
            </div>
          ) : (
            <Link 
              href={`/dashboard/courses/${course.id}`}
              className={`relative w-full py-3.5 bg-gradient-to-r ${gradientClass} text-white rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden group/btn shadow-lg ${shadowClass}`}
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
              <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">{t('startLearning')}</span>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
