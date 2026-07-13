import { PlayCircle, Lock } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from 'next-intl';

export default function CourseCurriculum({ modules }: { modules: any[] }) {
  const t = useTranslations('CourseDetails');

  if (!modules || modules.length === 0) return null;

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <PlayCircle className="w-8 h-8 text-primary" /> 
        {t('curriculum')}
      </h2>
      <div className="bg-background border border-blue-100 dark:border-foreground/10 rounded-3xl p-6 shadow-md shadow-blue-900/5 dark:shadow-none">
        <Accordion className="w-full gap-3 flex flex-col">
          {modules.map((module: any, i: number) => (
            <AccordionItem 
              key={module.id || i} 
              value={`module-${i}`} 
              className="border-none bg-blue-50/50 dark:bg-foreground/5 rounded-2xl overflow-hidden data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-foreground/10 transition-colors"
            >
              <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-5 py-4 group">
                <div className="flex justify-between items-center w-full pr-4">
                  <span>{module.title || `মডিউল ${i + 1}`}</span>
                  <span className="text-sm font-semibold text-blue-600/70 dark:text-blue-400/70 hidden sm:inline-block bg-blue-100/50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {module.lessons?.length || 0} টি লেসন
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-5">
                <div className="space-y-3">
                  {(module.lessons || []).map((lesson: any, j: number) => (
                    <div key={lesson.id || j} className="flex items-center justify-between p-3.5 bg-white dark:bg-background/40 rounded-xl hover:bg-blue-50 dark:hover:bg-foreground/5 border border-blue-100/50 dark:border-foreground/5 hover:border-blue-200 dark:hover:border-foreground/10 hover:shadow-sm transition-all duration-300 group/lesson">
                      <div className="flex items-center gap-3">
                        {lesson.isFreePreview ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover/lesson:scale-110 transition-transform">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-foreground/10 flex items-center justify-center text-slate-400 dark:text-foreground/40 shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold ${lesson.isFreePreview ? 'text-blue-900 dark:text-foreground/90 group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400' : 'text-slate-600 dark:text-foreground/60'} transition-colors`}>
                            {lesson.title || `লেসন ${j + 1}`}
                          </p>
                          {lesson.isFreePreview && (
                            <p className="text-[10px] uppercase font-bold tracking-wider text-blue-500 mt-0.5">{t('freePreview')}</p>
                          )}
                        </div>
                      </div>
                      
                      {lesson.isFreePreview ? (
                        <a href={lesson.videoUrl || '#'} target={lesson.videoUrl ? "_blank" : "_self"} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap">
                          {t('watch')}
                        </a>
                      ) : (
                        <span className="text-xs text-foreground/40 font-semibold px-2">
                          {t('locked')}
                        </span>
                      )}
                    </div>
                  ))}
                  {(!module.lessons || module.lessons.length === 0) && (
                    <p className="text-sm text-foreground/50 text-center py-4">কোনো লেসন যুক্ত করা হয়নি</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
