import { Book, Users, Video, Edit3, MonitorPlay, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

interface Subject {
  name: string;
  instructor?: string;
  liveClasses?: string | number;
  videoLessons?: string | number;
  exams?: string | number;
}

export default function CourseSubjects({ subjects, courseType }: { subjects: Subject[], courseType?: string }) {
  const t = useTranslations('CourseDetails');
  const tableScrollRef = useRef<HTMLDivElement>(null);
  
  if (!subjects || subjects.length === 0) return null;

  // Check which columns have at least one value across all subjects
  const hasInstructor = courseType === 'coaching' && subjects.some(s => s.instructor && s.instructor.trim() !== '');
  const hasLiveClasses = subjects.some(s => s.liveClasses && Number(s.liveClasses) > 0);
  const hasVideos = subjects.some(s => s.videoLessons && Number(s.videoLessons) > 0);
  const hasExams = subjects.some(s => s.exams && Number(s.exams) > 0);

  // If there are no stats at all, just render as beautiful badges
  const isSimpleList = !hasInstructor && !hasLiveClasses && !hasVideos && !hasExams;

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tableScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300 mt-10 sm:mt-12 relative z-10 w-full max-w-full overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-3xl font-bold flex items-center gap-2.5">
          <Book className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" /> 
          <span>{t('subjectBreakdown') || 'বিষয়ভিত্তিক ক্লাস ডিস্ট্রিবিউশন'}</span>
        </h2>

        {!isSimpleList && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollTable('left')}
              className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-colors active:scale-95 cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTable('right')}
              className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-colors active:scale-95 cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isSimpleList ? (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {subjects.map((sub, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-foreground/5 border border-foreground/10 hover:border-primary/30 transition-colors shadow-sm text-xs sm:text-sm">
              <Book className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold">{sub.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div 
          ref={tableScrollRef} 
          className="w-full max-w-full overflow-x-auto custom-scrollbar pb-3 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="min-w-[620px] sm:min-w-[700px] border border-primary/20 rounded-xl overflow-hidden bg-background shadow-sm">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-red-500 font-bold text-xs sm:text-sm text-white uppercase tracking-wider shadow-sm">
                  <th className="p-3.5 sm:p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-white/90 shrink-0" /> 
                      {t('subjectName') || 'Subject / Topic'}
                    </div>
                  </th>
                  {hasInstructor && (
                    <th className="p-3.5 sm:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('instructor') || 'Instructor'}
                      </div>
                    </th>
                  )}
                  {hasLiveClasses && (
                    <th className="p-3.5 sm:p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('liveClasses') || 'Live Classes'}
                      </div>
                    </th>
                  )}
                  {hasVideos && (
                    <th className="p-3.5 sm:p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('videoLessons') || 'Video Lessons'}
                      </div>
                    </th>
                  )}
                  {hasExams && (
                    <th className="p-3.5 sm:p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Edit3 className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('exams') || 'Exams'}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-primary/20">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors text-xs sm:text-sm">
                    <td className="p-3.5 sm:p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="whitespace-pre-wrap">{sub.name}</span>
                      </div>
                    </td>
                    
                    {hasInstructor && (
                      <td className="p-3.5 sm:p-4 text-foreground/80">
                        {sub.instructor || <span className="text-foreground/40">{t('na') || '-'}</span>}
                      </td>
                    )}
                    
                    {hasLiveClasses && (
                      <td className="p-3.5 sm:p-4 text-center font-medium">
                        {(sub.liveClasses && Number(sub.liveClasses) > 0) ? (
                          <span className="inline-flex px-2.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-bold">{sub.liveClasses}</span>
                        ) : (
                          <span className="text-foreground/30">{t('na') || '-'}</span>
                        )}
                      </td>
                    )}

                    {hasVideos && (
                      <td className="p-3.5 sm:p-4 text-center font-medium">
                        {(sub.videoLessons && Number(sub.videoLessons) > 0) ? (
                          <span className="inline-flex px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-bold">{sub.videoLessons}</span>
                        ) : (
                          <span className="text-foreground/30">{t('na') || '-'}</span>
                        )}
                      </td>
                    )}

                    {hasExams && (
                      <td className="p-3.5 sm:p-4 text-center font-medium">
                        {(sub.exams && Number(sub.exams) > 0) ? (
                          <span className="inline-flex px-2.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold">{sub.exams}</span>
                        ) : (
                          <span className="text-foreground/30">{t('na') || '-'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
