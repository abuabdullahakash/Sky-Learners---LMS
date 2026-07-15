"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { PlayCircle, CheckCircle, Video as VideoIcon, Loader2, ChevronDown, ChevronRight, Lock } from 'lucide-react';

export default function StudentCourseCurriculum() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          // Set first lesson as active by default if available
          if (data.modules && data.modules.length > 0) {
            setExpandedModules([data.modules[0].id]);
            if (data.modules[0].lessons && data.modules[0].lessons.length > 0) {
              setActiveLesson(data.modules[0].lessons[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Curriculum Available</h2>
        <p className="text-gray-500">The teacher has not added any lessons to this course yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Video Player Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-black rounded-2xl aspect-video relative overflow-hidden shadow-lg flex items-center justify-center">
          {activeLesson ? (
            activeLesson.videoUrl ? (
              // Simple video embedding - assuming YouTube for this example or direct MP4
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
            )
          ) : (
            <div className="text-white/50 flex flex-col items-center">
              <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a lesson to start learning</p>
            </div>
          )}
        </div>

        {activeLesson && (
          <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-foreground/10 shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeLesson.title}</h2>
            {activeLesson.description && (
              <p className="text-gray-600 dark:text-foreground/70">{activeLesson.description}</p>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-foreground/10 flex justify-end">
              <button className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-foreground/5 rounded-3xl border border-gray-200 dark:border-foreground/10 overflow-hidden shadow-sm dark:shadow-none sticky top-24">
          <div className="p-5 border-b border-gray-100 dark:border-foreground/10 bg-gray-50 dark:bg-transparent">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Course Content</h3>
            <p className="text-sm text-gray-500 dark:text-foreground/50">{course.modules.length} Modules</p>
          </div>

          <div className="max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
            {course.modules.map((module: any, index: number) => {
              const isExpanded = expandedModules.includes(module.id);
              return (
                <div key={module.id} className="border-b border-gray-100 dark:border-foreground/10 last:border-0">
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-foreground/5 transition-colors text-left"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        Module {index + 1}: {module.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{module.lessons?.length || 0} Lessons</p>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </button>

                  {isExpanded && module.lessons && module.lessons.length > 0 && (
                    <div className="bg-gray-50/50 dark:bg-black/20 p-2 space-y-1">
                      {module.lessons.map((lesson: any, lIndex: number) => {
                        const isActive = activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-3 rounded-xl flex gap-3 transition-colors ${
                              isActive 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-white dark:hover:bg-foreground/10 text-gray-600 dark:text-foreground/70'
                            }`}
                          >
                            {isActive ? (
                              <PlayCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                            ) : (
                              <VideoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-50" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm font-medium leading-tight ${isActive ? 'font-bold' : ''}`}>
                                {lIndex + 1}. {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs mt-1 opacity-70">{lesson.duration}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
