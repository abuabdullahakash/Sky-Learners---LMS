import { Target, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LearningOutcomes({ outcomes }: { outcomes?: string[] }) {
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
          {displayOutcomes.map((outcome, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              <p className="text-foreground/80 font-medium leading-relaxed">{outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
