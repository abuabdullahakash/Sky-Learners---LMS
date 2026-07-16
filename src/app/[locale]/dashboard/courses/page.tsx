"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link } from '@/i18n/routing';
import { BookOpen, Clock, CheckCircle2, PlayCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type EnrolledCourse = {
  enrollmentId: string;
  courseId: string;
  status: 'pending' | 'approved';
  enrolledAt: Date;
  courseDetails: any; 
};

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('Dashboard.myCourses');

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      try {
        // Fetch enrollments for the current student
        const q = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const enrollmentsPromises = querySnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const courseId = enrollmentData.courseId;
          
          let courseDetails = null;
          if (courseId) {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              courseDetails = { id: courseSnap.id, ...courseSnap.data() };
            }
          }

          return {
            enrollmentId: enrollmentDoc.id,
            courseId: courseId,
            status: enrollmentData.status,
            enrolledAt: enrollmentData.createdAt?.toDate() || new Date(),
            courseDetails,
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
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const approvedCourses = courses.filter(c => c.status === 'approved');

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t('title')}</h1>
        <p className="text-foreground/70 text-lg">{t('subtitle')}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} t={t} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} t={t} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ item, t }: { item: EnrolledCourse; t: any }) {
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
        
        {/* Progress (Mocked for active courses) */}
        {!isPending && (
          <div className="mt-auto pt-4 mb-5">
             <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-600 dark:text-gray-300">{t('progress')}</span>
                <span className={textColorClass}>0%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div className={`bg-gradient-to-r ${gradientClass} h-full rounded-full w-[0%] relative`}>
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
