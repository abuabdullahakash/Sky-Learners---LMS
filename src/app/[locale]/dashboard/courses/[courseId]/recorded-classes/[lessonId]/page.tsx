// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import ReactPlayer from 'react-player';

export default function LessonVideoPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tracking states
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
        {activeLesson.videoUrl && activeLesson.videoSource === 'facebook_private' ? (
          <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-blue-600/5 dark:bg-blue-900/20">
            <svg className="w-16 h-16 text-blue-600 mb-4 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
            <h3 className="text-2xl font-bold text-white mb-2">Private Facebook Video</h3>
            <p className="text-white/70 mb-6 max-w-md text-center px-4">This video is hosted in a private Facebook group. For security reasons, it cannot be embedded here.</p>
            <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Watch on Facebook
            </a>
          </div>
        ) : activeLesson.videoUrl && activeLesson.videoSource === 'facebook_public' ? (
          // @ts-ignore: ReactPlayer types might not be fully compatible with React 19 yet
          <ReactPlayer
            url={activeLesson.videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={(state: any) => {
              setWatchProgress(state.played);
              if (state.played >= 0.8) setHasReachedThreshold(true);
            }}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        ) : activeLesson.videoUrl ? (
          // @ts-ignore: ReactPlayer types might not be fully compatible with React 19 yet
          <ReactPlayer
            url={activeLesson.videoUrl}
            width="100%"
            height="100%"
            controls
            onProgress={(state: any) => {
              setWatchProgress(state.played);
              if (state.played >= 0.8) setHasReachedThreshold(true);
            }}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        ) : (
          <div className="text-center text-white/50 p-6 absolute inset-0 flex flex-col items-center justify-center">
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
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-foreground/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Progress indicator */}
            <div className="flex-1 w-full max-w-sm">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                <span>Watch Progress</span>
                <span>{Math.round(watchProgress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-foreground/10 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ${hasReachedThreshold ? 'bg-green-500' : 'bg-orange-500'}`} 
                  style={{ width: `${Math.min(watchProgress * 100, 100)}%` }}
                ></div>
              </div>
              {!hasReachedThreshold && activeLesson.videoSource !== 'facebook_private' && activeLesson.videoUrl && (
                <p className="text-[11px] text-gray-400 mt-1.5">Watch at least 80% to mark as completed.</p>
              )}
            </div>

            <button 
              disabled={(!hasReachedThreshold && activeLesson.videoSource !== 'facebook_private' && activeLesson.videoUrl) || isCompleted}
              onClick={() => setIsCompleted(true)}
              className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg 
                ${isCompleted ? 'bg-green-500 text-white shadow-green-500/20' 
                : hasReachedThreshold || activeLesson.videoSource === 'facebook_private' || !activeLesson.videoUrl
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 dark:bg-foreground/10 text-gray-400 dark:text-foreground/30 cursor-not-allowed shadow-none'}
              `}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Completed
                </>
              ) : !hasReachedThreshold && activeLesson.videoSource !== 'facebook_private' && activeLesson.videoUrl ? (
                <>
                  <Lock className="w-5 h-5" /> Mark as Completed
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Mark as Completed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
