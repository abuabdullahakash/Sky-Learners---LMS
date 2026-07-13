import { Target, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { curatedIcons, CuratedIconName } from '@/lib/icons';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LearningOutcomes({ outcomes }: { outcomes?: any[] }) {
  const t = useTranslations('CourseDetails');
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    shapesRef.current.forEach((shape, index) => {
      if (!shape) return;
      gsap.to(shape, {
        y: "random(-10, 10)",
        x: "random(-10, 10)",
        scale: "random(0.95, 1.05)",
        rotation: "random(-5, 5)",
        duration: "random(4, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.3,
      });
    });
  }, []);

  // Fallback data if outcomes are not provided in DB
  const defaultOutcomes = [
    "কোর্সের বেসিক থেকে অ্যাডভান্সড কনসেপ্ট ক্লিয়ার হবে",
    "পরীক্ষায় ভালো ফলাফল করার জন্য পূর্ণাঙ্গ প্রস্তুতি",
    "প্র্যাকটিক্যাল স্কিল ডেভেলপমেন্ট ও রিয়েল লাইফ প্রজেক্ট অভিজ্ঞতা",
    "যেকোনো সমস্যার দ্রুত সমাধান করার ক্ষমতা"
  ];

  const displayOutcomes = outcomes && outcomes.length > 0 ? outcomes : defaultOutcomes;

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Target className="w-8 h-8 text-primary" /> 
        {t('learningOutcomes')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayOutcomes.map((outcome, i) => {
          const isObject = typeof outcome === 'object' && outcome !== null;
          const text = isObject ? outcome.text : outcome;
          const iconName = isObject ? outcome.icon : 'CheckCircle2';
          
          const IconComponent = curatedIcons[iconName as CuratedIconName] || CheckCircle2;
          
          const colors = [
            'bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400',
            'bg-emerald-50/50 hover:bg-emerald-100/50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400',
            'bg-violet-50/50 hover:bg-violet-100/50 dark:bg-violet-900/10 dark:hover:bg-violet-900/20 border-violet-100 dark:border-violet-800/30 text-violet-600 dark:text-violet-400',
            'bg-pink-50/50 hover:bg-pink-100/50 dark:bg-pink-900/10 dark:hover:bg-pink-900/20 border-pink-100 dark:border-pink-800/30 text-pink-600 dark:text-pink-400',
            'bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 border-amber-100 dark:border-amber-800/30 text-amber-600 dark:text-amber-400',
            'bg-cyan-50/50 hover:bg-cyan-100/50 dark:bg-cyan-900/10 dark:hover:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30 text-cyan-600 dark:text-cyan-400'
          ];
          const shapeColors = [
            'bg-blue-400/20 dark:bg-blue-500/10',
            'bg-emerald-400/20 dark:bg-emerald-500/10',
            'bg-violet-400/20 dark:bg-violet-500/10',
            'bg-pink-400/20 dark:bg-pink-500/10',
            'bg-amber-400/20 dark:bg-amber-500/10',
            'bg-cyan-400/20 dark:bg-cyan-500/10'
          ];
          const colorClass = colors[i % colors.length];
          const shapeColorClass = shapeColors[i % shapeColors.length];

          return (
            <div key={i} className={`flex items-start gap-4 p-5 rounded-lg transition-colors border group relative overflow-hidden ${colorClass}`}>
              {/* Animated Background Shape */}
              <div 
                ref={el => { shapesRef.current[i] = el; }}
                className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl ${shapeColorClass} pointer-events-none`}
              />
              
              <div className="p-2 bg-white/60 dark:bg-black/20 rounded-md shrink-0 transition-transform group-hover:scale-110 shadow-sm relative z-10">
                <IconComponent className="w-6 h-6" />
              </div>
              <p className="text-foreground/80 font-medium leading-relaxed mt-1 relative z-10">{text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
