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
      <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm">
        <Accordion className="w-full">
          {modules.map((module: any, i: number) => (
            <AccordionItem key={module.id || i} value={`module-${i}`} className={i === modules.length - 1 ? "border-b-0" : ""}>
              <AccordionTrigger className="text-left font-bold text-lg hover:text-primary transition-colors">
                <div className="flex justify-between items-center w-full pr-4">
                  <span>{module.title || `মডিউল ${i + 1}`}</span>
                  <span className="text-sm font-normal text-foreground/50 hidden sm:inline-block">
                    {module.lessons?.length || 0} টি লেসন
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-2">
                  {(module.lessons || []).map((lesson: any, j: number) => (
                    <div key={lesson.id || j} className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors">
                      <div className="flex items-center gap-3">
                        {lesson.isFreePreview ? (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <PlayCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50 shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${lesson.isFreePreview ? 'text-foreground/90' : 'text-foreground/70'}`}>
                            {lesson.title || `লেসন ${j + 1}`}
                          </p>
                          {lesson.isFreePreview && (
                            <p className="text-[10px] uppercase font-bold tracking-wider text-primary mt-0.5">{t('freePreview')}</p>
                          )}
                        </div>
                      </div>
                      
                      {lesson.isFreePreview ? (
                        <a href={lesson.videoUrl || '#'} target={lesson.videoUrl ? "_blank" : "_self"} className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-lg text-xs hover:bg-primary hover:text-white transition-colors whitespace-nowrap">
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
