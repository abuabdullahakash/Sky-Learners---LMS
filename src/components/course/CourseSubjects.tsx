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
          <div className="min-w-[700px] border border-primary/20 rounded-[4px] overflow-hidden bg-background shadow-sm">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-red-500 font-bold text-sm text-white uppercase tracking-wider shadow-sm">
                  <th className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-white/90 shrink-0" /> 
                      {t('subjectName') || 'Subject / Topic'}
                    </div>
                  </th>
                  {hasInstructor && (
                    <th className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('instructor') || 'Instructor'}
                      </div>
                    </th>
                  )}
                  {hasLiveClasses && (
                    <th className="p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('liveClasses') || 'Live Classes'}
                      </div>
                    </th>
                  )}
                  {hasVideos && (
                    <th className="p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4 text-white/90 shrink-0" /> 
                        {t('videoLessons') || 'Video Lessons'}
                      </div>
                    </th>
                  )}
                  {hasExams && (
                    <th className="p-4 whitespace-nowrap text-center">
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
                  <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="whitespace-pre-wrap">{sub.name}</span>
                      </div>
                    </td>
                    
                    {hasInstructor && (
                      <td className="p-4 text-sm text-foreground/80">
                        {sub.instructor || <span className="text-foreground/40">{t('na') || '-'}</span>}
                      </td>
                    )}
                    
                    {hasLiveClasses && (
                      <td className="p-4 text-center text-sm font-medium">
                        {(sub.liveClasses && Number(sub.liveClasses) > 0) ? (
                          <span className="inline-flex px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">{sub.liveClasses}</span>
                        ) : (
                          <span className="text-foreground/30">{t('na') || '-'}</span>
                        )}
                      </td>
                    )}

                    {hasVideos && (
                      <td className="p-4 text-center text-sm font-medium">
                        {(sub.videoLessons && Number(sub.videoLessons) > 0) ? (
                          <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">{sub.videoLessons}</span>
                        ) : (
                          <span className="text-foreground/30">{t('na') || '-'}</span>
                        )}
                      </td>
                    )}

                    {hasExams && (
                      <td className="p-4 text-center text-sm font-medium">
                        {(sub.exams && Number(sub.exams) > 0) ? (
                          <span className="inline-flex px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">{sub.exams}</span>
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
