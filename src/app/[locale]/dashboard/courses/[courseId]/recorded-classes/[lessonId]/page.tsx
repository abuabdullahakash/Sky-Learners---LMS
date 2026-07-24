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
  const [reportScreenshot, setReportScreenshot] = useState<File | null>(null);
  const [reportScreenshotUrl, setReportScreenshotUrl] = useState('');
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
            const fallbackUrl = currentSource === 'youtube' 
              ? finalVideoUrl.replace('watch?v=', 'embed/')
              : activeLesson.videoUrl;
              
            return (
              <iframe 
                src={fallbackUrl} 
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={activeLesson.title}
              ></iframe>
            );
          })()
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
          <div className="flex items-center justify-end">
            <button 
              disabled={isCompleted || isCompleting}
              onClick={async () => {
                if (!user || isCompleted) return;
                setIsCompleting(true);
                try {
                  await setDoc(doc(db, 'completed_lessons', `${user.uid}_${courseId}_${lessonId}`), {
                    studentId: user.uid,
                    courseId,
                    lessonId,
                    courseTitle: course?.title || '',
                    lessonTitle: activeLesson.title || '',
                    timestamp: new Date().toISOString()
                  });
                  setIsCompleted(true);
                  toast.success("Lesson marked as completed!");
                } catch (error) {
                  console.error("Error marking as completed", error);
                  toast.error("Failed to mark as completed. Please try again.");
                } finally {
                  setIsCompleting(false);
                }
              }}
              className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg 
                ${isCompleted ? 'bg-green-500 text-white shadow-green-500/20' 
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95'}
              `}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Completed
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

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-foreground/10 animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute right-4 top-4 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors text-foreground/60"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              {t('reportIssue')}
            </h2>
            <p className="text-foreground/60 text-sm mb-6">Lesson: {activeLesson.title}</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!reportSubject || !reportNote || !user) return;
              setIsSubmittingReport(true);
              
              try {
                let imgUrl = '';
                if (reportScreenshot) {
                  imgUrl = await uploadImageToImgBB(reportScreenshot);
                }
                
                await addDoc(collection(db, 'lesson_issues'), {
                  courseId,
                  lessonId,
                  lessonTitle: activeLesson.title,
                  studentId: user.uid,
                  studentName: profile?.fullName || user.displayName || 'Student',
                  studentPhotoUrl: profile?.photoUrl || user.photoURL || '',
                  subject: reportSubject,
                  note: reportNote,
                  screenshotUrl: imgUrl,
                  status: 'open',
                  createdAt: new Date().toISOString()
                });
                
                toast.success(t('issueSuccess'));
                setIsReportModalOpen(false);
                setReportSubject('');
                setReportNote('');
                setReportScreenshot(null);
                setReportScreenshotUrl('');
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
                  className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 focus:outline-none focus:border-red-500 mt-1 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block">{t('issueScreenshot')}</label>
                {reportScreenshotUrl ? (
                  <div className="relative inline-block">
                    <img src={reportScreenshotUrl} alt="Preview" className="h-24 rounded-lg object-cover border border-foreground/20" />
                    <button 
                      type="button"
                      onClick={() => {
                        setReportScreenshot(null);
                        setReportScreenshotUrl('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-foreground/5 hover:bg-foreground/10 px-4 py-2.5 rounded-xl border border-foreground/10 flex items-center gap-2 text-sm font-bold transition-colors">
                      <ImageIcon className="w-4 h-4 text-foreground/60" />
                      Upload Image
                      <input 
                        type="file" className="hidden" accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setReportScreenshot(e.target.files[0]);
                            setReportScreenshotUrl(URL.createObjectURL(e.target.files[0]));
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
