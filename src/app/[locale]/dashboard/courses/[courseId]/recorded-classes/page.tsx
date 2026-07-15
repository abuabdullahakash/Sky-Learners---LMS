"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video as VideoIcon, Loader2, LayoutGrid, List as ListIcon, PlayCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function StudentRecordedClasses() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-foreground/5 rounded-3xl border border-gray-100 dark:border-foreground/10">
        <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Recorded Classes</h2>
        <p className="text-gray-500">The teacher has not added any lessons to this course yet.</p>
      </div>
    );
  }

  // Flatten all lessons across modules for easy listing/gridding
  const allLessons = course.modules.flatMap((module: any, mIndex: number) => 
    (module.lessons || []).map((lesson: any, lIndex: number) => ({
      ...lesson,
      moduleTitle: module.title,
      moduleIndex: mIndex + 1,
      lessonIndex: lIndex + 1
    }))
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recorded Classes</h1>
          <p className="text-gray-600 dark:text-foreground/70">Watch your class recordings here.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-foreground/10 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-foreground/10 shadow-sm text-primary' : 'text-gray-500 dark:text-foreground/60 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-foreground/10 shadow-sm text-primary' : 'text-gray-500 dark:text-foreground/60 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {allLessons.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-foreground/5 rounded-3xl border border-gray-100 dark:border-foreground/10">
          <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recorded Classes</h2>
          <p className="text-gray-500">There are no lessons available yet.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {allLessons.map((lesson: any) => (
            <Link 
              href={`/dashboard/courses/${courseId}/recorded-classes/${lesson.id}`} 
              key={lesson.id}
              className="flex flex-col sm:flex-row gap-5 p-4 bg-white dark:bg-foreground/5 border border-gray-100 dark:border-foreground/10 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="relative w-full sm:w-48 h-32 bg-gray-200 dark:bg-foreground/10 rounded-xl overflow-hidden flex-shrink-0">
                {lesson.thumbnailUrl ? (
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-foreground/5">
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Module {lesson.moduleIndex}: {lesson.moduleTitle}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{lesson.title}</h3>
                {lesson.description ? (
                  <p className="text-sm text-gray-500 dark:text-foreground/70 line-clamp-2 mb-3">{lesson.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-foreground/70 mb-3 italic">No class notes available.</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLessons.map((lesson: any) => (
            <Link 
              href={`/dashboard/courses/${courseId}/recorded-classes/${lesson.id}`} 
              key={lesson.id}
              className="flex flex-col bg-white dark:bg-foreground/5 border border-gray-100 dark:border-foreground/10 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="relative w-full aspect-video bg-gray-200 dark:bg-foreground/10 overflow-hidden">
                {lesson.thumbnailUrl ? (
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-foreground/5">
                    <VideoIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <PlayCircle className="w-14 h-14 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 line-clamp-1">
                  Module {lesson.moduleIndex}: {lesson.moduleTitle}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{lesson.title}</h3>
                {lesson.description ? (
                  <p className="text-sm text-gray-500 dark:text-foreground/70 line-clamp-2 mt-auto">{lesson.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-foreground/70 mt-auto italic">No class notes.</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
