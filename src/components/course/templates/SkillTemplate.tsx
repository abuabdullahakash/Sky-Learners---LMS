"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Briefcase, Award } from 'lucide-react';
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';

export default function SkillTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const t = useTranslations('CourseDetails');

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* Professional Hero Section for Skills/Honours */}
      <div className={`min-h-[60vh] pt-28 pb-12 flex items-center relative overflow-hidden bg-slate-900`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-20 xl:px-24 relative z-20 h-full flex flex-col justify-center">
          <Link href="/courses" className="inline-flex items-center gap-2 font-semibold mb-8 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('goBack')}
          </Link>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 uppercase tracking-wide">
              {t(`category.${course.category}`) || course.category}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-md">
              {course.title}
            </h1>
            <p className="text-xl mb-10 leading-relaxed text-slate-300">
              {course.subtitle || t('descriptionFallbackSkill')}
            </p>
            
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Briefcase className="w-5 h-5" />
                <span className="font-bold">ক্যারিয়ার ফোকাসড</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <Award className="w-5 h-5" />
                <span className="font-bold">সার্টিফিকেট ও পোর্টফোলিও</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {course.careerMessage && (
              <section className="bg-emerald-900/10 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-200 dark:border-emerald-900/30">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="w-6 h-6" /> 
                  ক্যারিয়ার ও পোর্টফোলিও গাইডেন্স
                </h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {course.careerMessage}
                </p>
              </section>
            )}

            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || t('descriptionFallbackSkill')}
              </div>
            </section>

            <LearningOutcomes outcomes={course.learningOutcomes} />
            <TargetAudience audience={course.targetAudience} />
            <CourseCurriculum modules={course.modules} />
            <CourseTestimonials testimonials={course.testimonials} />
          </div>
          
          <StickyPricingCard course={course} />

        </div>
      </div>
    </div>
  );
}
