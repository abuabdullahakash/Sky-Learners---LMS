import { Target, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { curatedIcons, CuratedIconName } from '@/lib/icons';

export default function LearningOutcomes({ outcomes }: { outcomes?: any[] }) {
  const t = useTranslations('CourseDetails');

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
      <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayOutcomes.map((outcome, i) => {
            const isObject = typeof outcome === 'object' && outcome !== null;
            const text = isObject ? outcome.text : outcome;
            const iconName = isObject ? outcome.icon : 'CheckCircle2';
            
            const IconComponent = curatedIcons[iconName as CuratedIconName] || CheckCircle2;
            
            // Random vibrant colors for the icons to make it look premium
            const colors = [
              'text-blue-500 bg-blue-500/10',
              'text-emerald-500 bg-emerald-500/10',
              'text-violet-500 bg-violet-500/10',
              'text-pink-500 bg-pink-500/10',
              'text-amber-500 bg-amber-500/10',
              'text-cyan-500 bg-cyan-500/10'
            ];
            const colorClass = colors[i % colors.length];

            return (
              <div key={i} className="flex items-start gap-4 p-5 bg-foreground/5 rounded-2xl hover:bg-foreground/10 transition-colors border border-foreground/5 hover:border-foreground/10 group">
                <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <p className="text-foreground/80 font-medium leading-relaxed mt-1">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
