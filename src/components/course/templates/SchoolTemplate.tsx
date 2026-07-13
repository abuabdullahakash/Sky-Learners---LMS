"use client";

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Users, Clock, ArrowLeft, PlayCircle, Image as ImageIcon, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PerspectiveCarousel } from '@/components/ui/perspective-carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';

gsap.registerPlugin(ScrollTrigger);

export default function SchoolTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const t = useTranslations('CourseDetails');
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gallery animation...
  }, [course?.galleryImages]);

  const hasSlider = course.sliderImages && course.sliderImages.length > 0;
  const hasCover = hasSlider || !!course.coverImageUrl;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* Playful Hero Section for School Level */}
      <div className={`min-h-[60vh] lg:min-h-[70vh] pt-28 pb-12 flex items-center relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20`}>
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-20 xl:px-24 relative z-20 h-full flex flex-col justify-center">
          <Link href="/courses" className="inline-flex items-center gap-2 font-semibold mb-8 text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('goBack')}
          </Link>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 bg-primary text-white shadow-lg shadow-primary/30 uppercase tracking-wide">
              {t(`category.${course.category}`) || course.category}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight text-foreground drop-shadow-sm">
              {course.title}
            </h1>
            <p className="text-xl mb-10 leading-relaxed text-foreground/80">
              {course.subtitle || t('descriptionFallbackPrimary')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Message for Parents */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <Heart className="w-6 h-6" /> 
                অভিভাবকদের উদ্দেশ্যে
              </h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {course.parentMessage || "আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য একটি শক্ত ভিত্তি তৈরি করা অত্যন্ত জরুরি। আমাদের এই কোর্সটি এমনভাবে সাজানো হয়েছে যাতে পড়াশোনা তাদের কাছে বোঝা না মনে হয়ে আনন্দদায়ক মনে হয়।"}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || t('descriptionFallbackPrimary')}
              </div>
            </section>

            <LearningOutcomes outcomes={course.learningOutcomes} />
            <CourseCurriculum modules={course.modules} />
            <CourseTestimonials testimonials={course.testimonials} />
          </div>
          
          <StickyPricingCard course={course} />

        </div>
      </div>
    </div>
  );
}
