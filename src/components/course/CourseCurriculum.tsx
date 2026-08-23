import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { PlayCircle, Lock, FileText, Download, X, Calendar, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from 'next-intl';

export default function CourseCurriculum({ modules, routineImageUrl, courseId }: { modules: any[], routineImageUrl?: string, courseId?: string }) {
  const t = useTranslations('CourseDetails');
  const router = useRouter();
  const [isRoutineOpen, setIsRoutineOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLockedPopupOpen, setIsLockedPopupOpen] = useState(false);

  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'Class-Routine.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image', error);
      window.open(url, '_blank'); // fallback
    } finally {
      setIsDownloading(false);
    }
  };

  if ((!modules || modules.length === 0) && !routineImageUrl) return null;


  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2.5">
        <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" /> 
        <span>{t('curriculum')}</span>
      </h2>
      <div className="bg-background border border-blue-100 dark:border-foreground/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-md shadow-blue-900/5 dark:shadow-none">
        <Accordion className="w-full gap-2.5 sm:gap-3 flex flex-col">
          {modules.map((module: any, i: number) => (
            <AccordionItem 
              key={module.id || i} 
              value={`module-${i}`} 
              className="border-none bg-blue-50/50 dark:bg-foreground/5 rounded-xl overflow-hidden data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-foreground/10 transition-colors"
            >
              <AccordionTrigger className="text-left font-bold text-base sm:text-lg hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3.5 sm:px-5 py-3 sm:py-4 group">
                <div className="flex justify-between items-center w-full pr-2 sm:pr-4">
                  <span className="truncate">{module.title === 'New Module' ? t('freeClasses') : module.title || `মডিউল ${i + 1}`}</span>
                  <span className="text-xs sm:text-sm font-semibold text-blue-600/70 dark:text-blue-400/70 shrink-0 bg-blue-100/50 dark:bg-blue-900/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ml-2">
                    {module.lessons?.length || 0} টি লেসন
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-3.5 px-2 sm:px-5">
                <div className="space-y-2.5 sm:space-y-3">
                  {(module.lessons || []).map((lesson: any, j: number) => {
                    const themeColors = [
                      {
                        border: 'border-blue-100 dark:border-foreground/5 hover:border-blue-300 dark:hover:border-foreground/20',
                        bg: 'bg-white dark:bg-background/40 hover:bg-blue-50/80 dark:hover:bg-blue-900/10',
                        iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
                        textBase: lesson.isFreePreview ? 'text-blue-900 dark:text-foreground/90 group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400' : 'text-slate-600 dark:text-foreground/60',
                        btn: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white',
                        label: 'text-blue-500'
                      },
                      {
                        border: 'border-emerald-100 dark:border-foreground/5 hover:border-emerald-300 dark:hover:border-foreground/20',
                        bg: 'bg-white dark:bg-background/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/10',
                        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
                        textBase: lesson.isFreePreview ? 'text-emerald-900 dark:text-foreground/90 group-hover/lesson:text-emerald-600 dark:group-hover/lesson:text-emerald-400' : 'text-slate-600 dark:text-foreground/60',
                        btn: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white',
                        label: 'text-emerald-500'
                      },
                      {
                        border: 'border-violet-100 dark:border-foreground/5 hover:border-violet-300 dark:hover:border-foreground/20',
                        bg: 'bg-white dark:bg-background/40 hover:bg-violet-50/80 dark:hover:bg-violet-900/10',
                        iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
                        textBase: lesson.isFreePreview ? 'text-violet-900 dark:text-foreground/90 group-hover/lesson:text-violet-600 dark:group-hover/lesson:text-violet-400' : 'text-slate-600 dark:text-foreground/60',
                        btn: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white',
                        label: 'text-violet-500'
                      },
                      {
                        border: 'border-pink-100 dark:border-foreground/5 hover:border-pink-300 dark:hover:border-foreground/20',
                        bg: 'bg-white dark:bg-background/40 hover:bg-pink-50/80 dark:hover:bg-pink-900/10',
                        iconBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400',
                        textBase: lesson.isFreePreview ? 'text-pink-900 dark:text-foreground/90 group-hover/lesson:text-pink-600 dark:group-hover/lesson:text-pink-400' : 'text-slate-600 dark:text-foreground/60',
                        btn: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white',
                        label: 'text-pink-500'
                      },
                      {
                        border: 'border-amber-100 dark:border-foreground/5 hover:border-amber-300 dark:hover:border-foreground/20',
                        bg: 'bg-white dark:bg-background/40 hover:bg-amber-50/80 dark:hover:bg-amber-900/10',
                        iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
                        textBase: lesson.isFreePreview ? 'text-amber-900 dark:text-foreground/90 group-hover/lesson:text-amber-600 dark:group-hover/lesson:text-amber-400' : 'text-slate-600 dark:text-foreground/60',
                        btn: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white',
                        label: 'text-amber-500'
                      }
                    ];
                    
                    const theme = themeColors[j % themeColors.length];
                    
                    return (
                    <div key={lesson.id || j} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-300 group/lesson cursor-pointer ${theme.border} ${theme.bg}`}>
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        {lesson.thumbnailUrl ? (
                          <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 shadow-sm border border-foreground/10 group-hover/lesson:border-primary/30 transition-colors">
                            <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover/lesson:scale-110 transition-transform duration-500" />
                            {lesson.isFreePreview && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                <PlayCircle className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
                            )}
                          </div>
                        ) : lesson.isFreePreview ? (
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 group-hover/lesson:scale-110 transition-transform shadow-sm ${theme.iconBg}`}>
                            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-foreground/10 flex items-center justify-center text-slate-400 dark:text-foreground/40 shrink-0 shadow-sm">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold text-xs sm:text-sm transition-colors truncate ${theme.textBase}`}>
                            {lesson.title || `লেসন ${j + 1}`}
                          </p>
                          {lesson.isFreePreview && (
                            <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${theme.label}`}>{t('freePreview')}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap sm:flex-nowrap">
                        {lesson.noteUrl && (
                          lesson.isFreePreview ? (
                            <a href={lesson.noteUrl} target="_blank" className={`px-3.5 py-1.5 sm:px-4 sm:py-2 font-bold rounded-lg text-xs transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap text-center !no-underline hover:!text-white flex items-center gap-1.5 ${theme.btn}`}>
                              <FileText className="w-3.5 h-3.5" />
                              {t('classNote')}
                            </a>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); setIsLockedPopupOpen(true); }} className="px-3.5 py-1.5 sm:px-4 sm:py-2 font-bold rounded-lg text-xs transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-1.5 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500">
                              <Lock className="w-3.5 h-3.5" />
                              {t('classNote')}
                            </button>
                          )
                        )}
                        {lesson.isFreePreview ? (
                          <a href={lesson.videoUrl || '#'} target={lesson.videoUrl ? "_blank" : "_self"} className={`px-4 py-1.5 sm:px-5 sm:py-2.5 font-bold rounded-lg text-xs transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap text-center sm:text-left !no-underline hover:!text-white ${theme.btn}`}>
                            {t('watch')}
                          </a>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setIsLockedPopupOpen(true); }} className="px-4 py-1.5 sm:px-5 sm:py-2 font-bold rounded-lg text-xs transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-1.5 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500">
                            <Lock className="w-3.5 h-3.5" />
                            {t('locked')}
                          </button>
                        )}
                      </div>
                    </div>
                  )})}
                  {(!module.lessons || module.lessons.length === 0) && (
                    <p className="text-xs sm:text-sm text-foreground/50 text-center py-4">{t('noLessons')}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {routineImageUrl && (
        <div className="mt-8 bg-background border border-orange-100 dark:border-foreground/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md shadow-orange-900/5 dark:shadow-none animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            {t('classRoutine').includes('CourseDetails.') ? 'ক্লাস রুটিন' : t('classRoutine')}
          </h3>
          <div 
            onClick={() => setIsRoutineOpen(true)}
            className="relative w-full rounded-xl overflow-hidden border border-foreground/10 cursor-pointer group hover:border-orange-500 transition-colors bg-foreground/5 flex items-center justify-center min-h-[160px] sm:min-h-[200px]"
          >
            <img src={routineImageUrl} alt="Class Routine" className="w-full max-h-[500px] object-contain group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white font-bold bg-orange-500 text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-2xl">View Full Routine</span>
            </div>
          </div>
        </div>
      )}

      {/* Routine Lightbox Modal */}
      {isRoutineOpen && routineImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsRoutineOpen(false)}>
          <button 
            onClick={() => setIsRoutineOpen(false)}
            className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors z-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="relative w-[94vw] max-w-4xl max-h-[90vh] flex flex-col items-center gap-3 p-3 sm:p-5 bg-black/80 rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full flex-1 overflow-auto rounded-xl border border-white/10 bg-black/40 max-h-[75vh]">
              <img 
                src={routineImageUrl} 
                alt="Class Routine Full" 
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            </div>
            
            <button 
              onClick={() => handleDownload(routineImageUrl)}
              disabled={isDownloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
              {t('downloadRoutine').includes('CourseDetails.') ? 'Download Routine' : t('downloadRoutine')}
            </button>
          </div>
        </div>
      )}

      {/* Locked Content Popup */}
      {isLockedPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsLockedPopupOpen(false)}>
          <div className="relative w-[92vw] max-w-md bg-background rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border border-foreground/10" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsLockedPopupOpen(false)}
              className="absolute top-4 right-4 p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/40 text-orange-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground">{t('lockedContent') || 'কন্টেন্টটি লক করা আছে!'}</h3>
            <p className="text-xs sm:text-sm text-foreground/70 mb-6 sm:mb-8 leading-relaxed">
              {t('enrollToAccess') || 'এই লেসনটি এবং ক্লাস নোটটি দেখতে চাইলে আপনাকে কোর্সটিতে ভর্তি হতে হবে। এখনই কোর্সে ভর্তি হয়ে আপনার শেখা শুরু করুন!'}
            </p>
            
            <button 
              onClick={() => {
                setIsLockedPopupOpen(false);
                if (typeof window !== 'undefined') {
                  const current = window.location.pathname;
                  router.push(current.endsWith('/checkout') ? current : `${current}/checkout`);
                }
              }}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs sm:text-base cursor-pointer"
            >
              {t('enrollNow') || 'কোর্সে যুক্ত হোন'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
