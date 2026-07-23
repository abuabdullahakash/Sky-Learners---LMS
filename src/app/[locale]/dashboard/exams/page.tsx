"use client";

import { useTranslations, useLocale } from 'next-intl';
import { GraduationCap, Clock, Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function StudentExamsPage() {
  const t = useTranslations('Dashboard.sidebar');
  const locale = useLocale();
  const isBn = locale === 'bn';

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center animate-in fade-in duration-500 p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900/80 rounded-[2.5rem] border border-gray-100 dark:border-white/10 p-8 sm:p-12 text-center shadow-2xl overflow-hidden group">
        
        {/* Colorful Animated Ambient Background Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-br from-orange-500/30 to-pink-500/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-primary/10 text-primary border border-primary/20 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{isBn ? 'নতুন ফিচার' : 'New Feature'}</span>
        </div>

        {/* Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-orange-500 text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
          <GraduationCap className="w-12 h-12" />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">
          {isBn ? 'ডেইলি এক্সাম' : t('exams') || 'Daily Exams'}
        </h1>
        
        {/* Subheading Badge */}
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl text-lg sm:text-xl shadow-lg shadow-orange-500/20 mb-6 uppercase tracking-wider">
          {isBn ? 'শীঘ্রই আসছে (Coming Soon)' : 'Coming Soon'}
        </div>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-foreground/70 max-w-lg mx-auto mb-8 leading-relaxed">
          {isBn 
            ? 'আপনার প্রতিদিনের পড়ার প্রস্তুতি ও অগ্রগতি যাচাই করতে আমাদের আকর্ষণীয় ডেইলি এক্সাম ফিচারটি ডেভেলপ করা হচ্ছে। খুব শীঘ্রই এটি সবার জন্য উন্মুক্ত করা হবে!'
            : 'We are currently building the Daily Exams feature to help you test your learning progress every day. Stay tuned, it will be available soon!'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard/courses"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <BookOpen className="w-5 h-5" />
            {isBn ? 'আমার কোর্সে ফিরে যান' : 'Back to My Courses'}
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold rounded-xl transition-all border border-foreground/10 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
          </Link>
        </div>

      </div>
    </div>
  );
}
