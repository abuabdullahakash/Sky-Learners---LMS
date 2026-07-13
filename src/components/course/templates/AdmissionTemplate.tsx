"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Target, Trophy, Clock } from 'lucide-react';
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';

export default function AdmissionTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const t = useTranslations('CourseDetails');

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* Intense Hero Section for HSC/Admission */}
      <div className={`min-h-[60vh] pt-28 pb-12 flex items-center relative overflow-hidden bg-gradient-to-r from-red-900/90 to-black`}>
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-20 xl:px-24 relative z-20 h-full flex flex-col justify-center">
          <Link href="/courses" className="inline-flex items-center gap-2 font-semibold mb-8 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('goBack')}
          </Link>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 bg-red-600 text-white uppercase tracking-wide">
              {t(`category.${course.category}`) || course.category}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-md">
              {course.title}
            </h1>
            <p className="text-xl mb-10 leading-relaxed text-red-100">
              {course.subtitle || t('descriptionFallbackHsc')}
            </p>
            
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-white/90">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">শীর্ষস্থান অধিকারের প্রস্তুতি</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Target className="w-5 h-5 text-red-400" />
                <span className="font-bold">শতভাগ ফোকাসড সিলেবাস</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || t('descriptionFallbackHsc')}
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
