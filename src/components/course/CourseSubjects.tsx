import { Book, Users, Video, Edit3, MonitorPlay } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Subject {
  name: string;
  instructor?: string;
  liveClasses?: string | number;
  videoLessons?: string | number;
  exams?: string | number;
}

export default function CourseSubjects({ subjects, courseType }: { subjects: Subject[], courseType?: string }) {
  const t = useTranslations('CourseDetails');
  
  if (!subjects || subjects.length === 0) return null;

  // Check which columns have at least one value across all subjects
  const hasInstructor = courseType === 'coaching' && subjects.some(s => s.instructor && s.instructor.trim() !== '');
  const hasLiveClasses = subjects.some(s => s.liveClasses && Number(s.liveClasses) > 0);
  const hasVideos = subjects.some(s => s.videoLessons && Number(s.videoLessons) > 0);
  const hasExams = subjects.some(s => s.exams && Number(s.exams) > 0);

  // If there are no stats at all, just render as beautiful badges
  const isSimpleList = !hasInstructor && !hasLiveClasses && !hasVideos && !hasExams;

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300 mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Book className="w-8 h-8 text-primary" /> 
        {t('subjectBreakdown') || 'Course Breakdown & Distribution'}
      </h2>

      {isSimpleList ? (
        <div className="flex flex-wrap gap-3">
          {subjects.map((sub, idx) => (
            <div key={idx} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-foreground/5 border border-foreground/10 hover:border-primary/30 transition-colors shadow-sm">
              <Book className="w-4 h-4 text-primary" />
              <span className="font-semibold">{sub.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] border border-foreground/10 rounded-2xl overflow-hidden bg-background shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-foreground/5 p-4 border-b border-foreground/10 font-bold text-sm text-foreground/80 uppercase tracking-wider">
              <div className={`col-span-${hasInstructor ? '4' : '6'} flex items-center gap-2`}>
                <Book className="w-4 h-4" /> {t('subjectName') || 'Subject / Topic'}
              </div>
              {hasInstructor && (
                <div className="col-span-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> {t('instructor') || 'Instructor'}
                </div>
              )}
              {hasLiveClasses && (
                <div className="col-span-2 flex items-center justify-center gap-2 text-center">
                  <MonitorPlay className="w-4 h-4 text-red-500" /> {t('liveClasses') || 'Live Classes'}
                </div>
              )}
              {hasVideos && (
                <div className="col-span-2 flex items-center justify-center gap-2 text-center">
                  <Video className="w-4 h-4 text-blue-500" /> {t('videoLessons') || 'Video Lessons'}
                </div>
              )}
              {hasExams && (
                <div className="col-span-2 flex items-center justify-center gap-2 text-center">
                  <Edit3 className="w-4 h-4 text-green-500" /> {t('exams') || 'Exams'}
                </div>
              )}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-foreground/5">
              {subjects.map((sub, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-foreground/[0.02] transition-colors">
                  <div className={`col-span-${hasInstructor ? '4' : '6'} font-semibold flex items-center gap-2`}>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {sub.name}
                  </div>
                  
                  {hasInstructor && (
                    <div className="col-span-2 text-sm text-foreground/80">
                      {sub.instructor || <span className="text-foreground/40">{t('na') || '-'}</span>}
                    </div>
                  )}
                  
                  {hasLiveClasses && (
                    <div className="col-span-2 text-center text-sm font-medium">
                      {(sub.liveClasses && Number(sub.liveClasses) > 0) ? (
                        <span className="inline-flex px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">{sub.liveClasses}</span>
                      ) : (
                        <span className="text-foreground/30">{t('na') || '-'}</span>
                      )}
                    </div>
                  )}

                  {hasVideos && (
                    <div className="col-span-2 text-center text-sm font-medium">
                      {(sub.videoLessons && Number(sub.videoLessons) > 0) ? (
                        <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">{sub.videoLessons}</span>
                      ) : (
                        <span className="text-foreground/30">{t('na') || '-'}</span>
                      )}
                    </div>
                  )}

                  {hasExams && (
                    <div className="col-span-2 text-center text-sm font-medium">
                      {(sub.exams && Number(sub.exams) > 0) ? (
                        <span className="inline-flex px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">{sub.exams}</span>
                      ) : (
                        <span className="text-foreground/30">{t('na') || '-'}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
