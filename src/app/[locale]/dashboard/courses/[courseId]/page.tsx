"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle2, PlayCircle, Trophy, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function StudentCourseOverview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const t = useTranslations('Dashboard.courseOverview');
  const { user } = useAuth();
  
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState<number>(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courseData = docSnap.data();
          setCourse(courseData);

          // Calculate total lessons
          let total = 0;
          if (courseData.modules) {
            courseData.modules.forEach((module: any) => {
              if (module.lessons) {
                total += module.lessons.length;
              }
            });
          }
          setTotalLessons(total);

          // Fetch completed lessons
          if (user) {
            const completedQuery = query(
              collection(db, 'completed_lessons'),
              where('studentId', '==', user.uid),
              where('courseId', '==', courseId)
            );
            const completedSnap = await getDocs(completedQuery);
            setCompletedCount(completedSnap.size);
          }
        }
      } catch (error) {
        console.error("Error fetching course", error);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  if (!course) {
    return <div className="text-center py-20 text-gray-500">Loading course overview...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">{t('welcome')} {course.title}</h1>
        <p className="text-gray-600 dark:text-foreground/70">{t('summary')}</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0}%</h3>
          <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">{t('progress')}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-200 dark:border-green-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</h3>
          <p className="text-sm font-bold text-green-600/80 dark:text-green-400/80 uppercase tracking-wider">{t('lessonsCompleted')}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <Trophy className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount * 10}</h3>
          <p className="text-sm font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">{t('pointsEarned')}</p>
        </div>
      </div>

      {/* Continue Learning CTA */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-foreground/5 dark:to-foreground/10 rounded-3xl p-8 border border-gray-200 dark:border-foreground/20 text-center flex flex-col items-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -ml-8 -mb-8"></div>
        
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 relative z-10 shadow-inner">
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
  );
}
