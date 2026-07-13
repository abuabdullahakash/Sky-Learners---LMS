import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TargetAudience({ audience }: { audience?: string }) {
  const t = useTranslations('CourseDetails');

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" /> 
        {t('targetAudience')}
      </h2>
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-sm">
        <p className="text-foreground/80 leading-relaxed text-lg">
          {audience || "যেকোনো শিক্ষার্থী যারা এই বিষয়ে নিজেদের দক্ষতাকে এক ধাপ এগিয়ে নিতে চায় এবং সফলতার শিখরে পৌঁছাতে চায়, তাদের সবার জন্যই এই কোর্সটি সমানভাবে উপকারী।"}
        </p>
      </div>
    </section>
  );
}
