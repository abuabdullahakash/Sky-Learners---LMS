// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle, ArrowLeft, Loader2, Lock, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { uploadImageToImgBB } from '@/lib/imgbb';

export default function LessonVideoPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCompleted, setIsCompleted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Issue Reporting
  const t = useTranslations('CourseDetails');
  const { user, profile } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportScreenshots, setReportScreenshots] = useState<File[]>([]);
  const [reportScreenshotUrls, setReportScreenshotUrls] = useState<string[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  useEffect(() => {
    const initializeTracking = async (lesson: any, courseData: any) => {
      if (!user || !lesson || !courseData) return;
      
      try {
        // Save to last_accessed
        await setDoc(doc(db, 'last_accessed', user.uid), {
          courseId,
          lessonId,
          courseTitle: courseData.title || '',
          lessonTitle: lesson.title || '',
          category: courseData.category || '',
          thumbnailUrl: courseData.thumbnailUrl || '',
          duration: lesson.duration || '0 Minutes',
          timestamp: new Date().toISOString()
        }, { merge: true });

        // Check if already completed
        const completedDoc = await getDoc(doc(db, 'completed_lessons', `${user.uid}_${courseId}_${lessonId}`));
        if (completedDoc.exists()) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error("Error initializing tracking", error);
      }
    };

    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          
          // Find the specific lesson
          let foundLesson = null;
          let foundModuleTitle = '';
          if (data.modules) {
            for (const module of data.modules) {
              if (module.lessons) {
                const lesson = module.lessons.find((l: any) => l.id === lessonId);
                if (lesson) {
                  foundLesson = lesson;
                  foundModuleTitle = module.title || '';
                  break;
                }
              }
            }
          }
          if (foundLesson) {
            foundLesson.moduleTitle = foundModuleTitle;
          }
          setActiveLesson(foundLesson);
          if (foundLesson) {
            initializeTracking(foundLesson, data);
          }
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId && lessonId && user) fetchCourse();
  }, [courseId, lessonId, user]);

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
    <div className="w-full space-y-6 relative">
      <div className="flex items-center justify-between gap-3">
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
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('getHelp')}</span>
        </button>
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
        ) : activeLesson.videoUrl ? (
          (() => {
            // Fallback for old videos that don't have videoSource
            let currentSource = activeLesson.videoSource;
            if (!currentSource || currentSource === 'unknown') {
              if (activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be')) currentSource = 'youtube';
              else if (activeLesson.videoUrl.includes('facebook.com') || activeLesson.videoUrl.includes('fb.watch') || activeLesson.videoUrl.includes('fb.com')) currentSource = 'facebook_public';
              else if (activeLesson.videoUrl.includes('drive.google.com')) currentSource = 'drive';
              else if (activeLesson.videoUrl.match(/\.(mp4|webm|ogg)$/i)) currentSource = 'direct';
              else currentSource = 'unknown';
            }

            const isTrackable = !videoError && ['youtube', 'facebook_public', 'direct', 'vimeo'].includes(currentSource);

            let finalVideoUrl = activeLesson.videoUrl;
            if (currentSource === 'youtube') {
              const match = activeLesson.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
              if (match && match[1]) {
                finalVideoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
              }
            }

            // If it's a known supported tracking platform and hasn't errored out, use ReactPlayer
            if (isTrackable) {
              return (
                // @ts-ignore
                <ReactPlayer
                  url={finalVideoUrl}
                  width="100%"
                  height="100%"
                  controls
                  config={{ youtube: { playerVars: { origin: typeof window !== 'undefined' ? window.location.origin : '' } } }}
                  onError={(e: any) => {
                    console.error('ReactPlayer Error:', e);
                    setVideoError(true);
                  }}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              );
            }
            
            // Otherwise fallback to iframe (e.g. Google Drive, unknown, or if ReactPlayer fails)
            return (
              <iframe
                src={activeLesson.videoUrl.includes('drive.google.com') ? activeLesson.videoUrl.replace(/\/view.*$/, '/preview') : activeLesson.videoUrl}
                className="w-full h-full border-0 absolute top-0 left-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            );
          })()
        ) : (
          <div className="text-white/50 text-sm">No video URL available for this lesson.</div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 dark:bg-foreground/5 p-6 rounded-2xl border border-gray-100 dark:border-foreground/10">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Lesson Progress</h2>
          <p className="text-sm text-gray-500 dark:text-foreground/60">Mark this lesson as completed to track your overall course progress.</p>
        </div>
        <button
          disabled={isCompleting}
          onClick={async () => {
            if (!user) return;
            setIsCompleting(true);
            try {
              const docId = `${user.uid}_${courseId}_${lessonId}`;
              if (isCompleted) {
                await deleteDoc(doc(db, 'completed_lessons', docId));
                setIsCompleted(false);
                toast.success('Marked as incomplete');
              } else {
                await setDoc(doc(db, 'completed_lessons', docId), {
                  userId: user.uid,
                  courseId,
                  lessonId,
                  completedAt: new Date().toISOString()
                });
                setIsCompleted(true);
                toast.success('Lesson completed! 🎉');
              }
            } catch (err) {
              console.error("Error toggling completion", err);
              toast.error('Failed to update progress');
            } finally {
              setIsCompleting(false);
            }
          }}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
            isCompleted 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 hover:bg-green-500/20' 
              : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
          }`}
        >
          {isCompleting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isCompleted ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              Completed
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Mark as Complete
            </>
          )}
        </button>
      </div>

      {/* --- Issue Report Modal --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-foreground/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-foreground/50" />
            </button>
            
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              {t('reportIssue')}
            </h2>
            <div className="text-foreground/60 text-xs sm:text-sm mb-6 space-y-0.5">
              {activeLesson.moduleTitle && <p className="font-semibold text-orange-500">{activeLesson.moduleTitle}</p>}
              <p className="font-bold text-foreground">Lesson: {activeLesson.title}</p>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!reportSubject || !reportNote || !user) return;
              setIsSubmittingReport(true);
              
              try {
                let imgUrls: string[] = [];
                if (reportScreenshots.length > 0) {
                  imgUrls = await Promise.all(reportScreenshots.map(file => uploadImageToImgBB(file)));
                }
                
                await addDoc(collection(db, 'lesson_issues'), {
                  courseId,
                  lessonId,
                  lessonTitle: activeLesson.title || '',
                  moduleTitle: activeLesson.moduleTitle || '',
                  subject: activeLesson.subject || '',
                  studentId: user.uid,
                  studentName: profile?.fullName || user.displayName || 'Student',
                  studentPhotoUrl: profile?.photoUrl || user.photoURL || '',
                  subjectTitle: reportSubject,
                  note: reportNote,
                  screenshotUrl: imgUrls[0] || '',
                  screenshotUrls: imgUrls,
                  status: 'open',
                  createdAt: new Date().toISOString()
                });
                
                toast.success(t('issueSuccess'));
                setIsReportModalOpen(false);
                setReportSubject('');
                setReportNote('');
                setReportScreenshots([]);
                setReportScreenshotUrls([]);
              } catch (error) {
                console.error("Error submitting report", error);
                toast.error("Failed to submit report. Please try again.");
              } finally {
                setIsSubmittingReport(false);
              }
            }} className="space-y-4">
              
              <div>
                <label className="text-sm font-bold text-foreground/80">{t('issueSubject')} *</label>
                <input 
                  type="text" required 
                  value={reportSubject} onChange={(e) => setReportSubject(e.target.value)}
                  placeholder={t('issueSubjectPlaceholder')}
                  className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 focus:outline-none focus:border-red-500 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/80">{t('issueNote')} *</label>
                <textarea 
                  required rows={4}
                  value={reportNote} onChange={(e) => setReportNote(e.target.value)}
                  placeholder={t('issueNotePlaceholder')}
                  className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 focus:outline-none focus:border-red-500 mt-1 resize-none text-sm"
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block">
                  {t('issueScreenshot')} (Up to 4 Screenshots)
                </label>
                
                {reportScreenshotUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {reportScreenshotUrls.map((url, index) => (
                      <div key={index} className="relative inline-block">
                        <img src={url} alt={`Preview ${index + 1}`} className="h-20 w-20 rounded-xl object-cover border border-foreground/20" />
                        <button 
                          type="button"
                          onClick={() => {
                            setReportScreenshots(prev => prev.filter((_, i) => i !== index));
                            setReportScreenshotUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {reportScreenshotUrls.length < 4 && (
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-foreground/5 hover:bg-foreground/10 px-4 py-2.5 rounded-xl border border-foreground/10 flex items-center gap-2 text-sm font-bold transition-colors">
                      <ImageIcon className="w-4 h-4 text-foreground/60" />
                      Add Screenshot ({reportScreenshotUrls.length}/4)
                      <input 
                        type="file" className="hidden" accept="image/*" multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            const combinedFiles = [...reportScreenshots, ...newFiles].slice(0, 4);
                            setReportScreenshots(combinedFiles);
                            setReportScreenshotUrls(combinedFiles.map(file => URL.createObjectURL(file)));
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <button 
                type="submit" disabled={isSubmittingReport || !reportSubject || !reportNote}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmittingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submitIssue')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
