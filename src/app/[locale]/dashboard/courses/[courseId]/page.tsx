"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Clock, CheckCircle2, PlayCircle, Trophy, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function StudentCourseOverview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data());
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
        <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Welcome to {course.title}</h1>
        <p className="text-gray-600 dark:text-foreground/70">Here is a quick summary of your progress and course details.</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0%</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-foreground/60 uppercase tracking-wider">Progress</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-foreground/60 uppercase tracking-wider">Lessons Completed</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Trophy className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-foreground/60 uppercase tracking-wider">Points Earned</p>
        </div>
      </div>

      {/* Continue Learning CTA */}
      <div className="bg-gray-50 dark:bg-foreground/5 rounded-3xl p-8 border border-gray-100 dark:border-foreground/10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <PlayCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Ready to start?</h2>
        <p className="text-gray-600 dark:text-foreground/60 max-w-md mb-6">Dive into the curriculum and begin your first lesson.</p>
        <Link 
          href={`/dashboard/courses/${courseId}/curriculum`}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
        >
          Go to Curriculum
        </Link>
      </div>
      
      {/* Announcements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Latest Announcements
        </h2>
        <div className="bg-gray-50 dark:bg-foreground/5 rounded-2xl p-6 border border-gray-100 dark:border-foreground/10">
          <p className="text-gray-600 dark:text-foreground/60 italic text-center py-4">No announcements yet.</p>
        </div>
      </div>

    </div>
  );
}
