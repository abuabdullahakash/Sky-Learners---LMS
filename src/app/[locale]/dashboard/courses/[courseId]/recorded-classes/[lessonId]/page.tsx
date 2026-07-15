"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function LessonVideoPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          
          // Find the specific lesson
          let foundLesson = null;
          if (data.modules) {
            for (const module of data.modules) {
              if (module.lessons) {
                const lesson = module.lessons.find((l: any) => l.id === lessonId);
                if (lesson) {
                  foundLesson = lesson;
                  break;
                }
              }
            }
          }
          setActiveLesson(foundLesson);
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId && lessonId) fetchCourse();
  }, [courseId, lessonId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-foreground/5 rounded-3xl border border-gray-100 dark:border-foreground/10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Not Found</h2>
        <p className="text-gray-500 mb-6">The lesson you are looking for does not exist or has been removed.</p>
        <Link href={`/dashboard/courses/${courseId}/recorded-classes`} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium">
          Back to Recorded Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href={`/dashboard/courses/${courseId}/recorded-classes`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-foreground/10 rounded-full transition-colors text-gray-600 dark:text-foreground/70"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">{activeLesson.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-foreground/60">
            {activeLesson.subject && <span className="bg-gray-100 dark:bg-foreground/10 px-2 py-0.5 rounded font-medium text-gray-700 dark:text-foreground/80">{activeLesson.subject}</span>}
            {activeLesson.instructor && <span>By {activeLesson.instructor}</span>}
            {activeLesson.uploadDate && <span>• {new Date(activeLesson.uploadDate).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      <div className="bg-black rounded-2xl aspect-video relative overflow-hidden shadow-lg flex items-center justify-center">
        {activeLesson.videoUrl ? (
          <iframe 
            src={activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') 
              ? activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') 
              : activeLesson.videoUrl} 
            className="w-full h-full absolute inset-0"
            allowFullScreen
            title={activeLesson.title}
          ></iframe>
        ) : (
          <div className="text-center text-white/50 p-6">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No video available for this lesson.</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-foreground/10 shadow-sm dark:shadow-none">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Class Note</h2>
        {activeLesson.noteUrl ? (
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 flex items-start gap-4 border border-gray-100 dark:border-foreground/10">
            <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 p-3 rounded-xl flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Download Class Note</h3>
              <p className="text-sm text-gray-500 dark:text-foreground/60 mb-3">Get the PDF notes for this class from Google Drive.</p>
              <a href={activeLesson.noteUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors">
                View PDF Note
              </a>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No class notes have been provided for this lesson.</p>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-foreground/10 flex justify-end">
          <button className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40">
            <CheckCircle className="w-5 h-5" />
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
