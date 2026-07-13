"use client";

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Users, Clock, ArrowLeft, PlayCircle, Image as ImageIcon, Heart, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PerspectiveCarousel } from '@/components/ui/perspective-carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';
import CourseFeatures from '../CourseFeatures';
import { Download } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SchoolTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const t = useTranslations('CourseDetails');
  const galleryRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    shapeRefs.current.forEach((shape, index) => {
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

  useEffect(() => {
    // Gallery animation...
  }, [course?.galleryImages]);

  const hasSlider = course.sliderImages && course.sliderImages.length > 0;
  const hasCover = hasSlider || !!course.coverImageUrl;
  const textColor = hasCover ? "text-white" : "text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* Playful Hero Section for School Level */}
      <div className={`min-h-[60vh] lg:min-h-[75vh] pt-20 pb-16 flex items-center relative overflow-hidden ${hasCover ? '' : 'bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20'}`}>
        
        {/* Background Layer */}
        {hasSlider ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
              className="flex w-full h-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {course.sliderImages.map((src: string, idx: number) => (
                <div key={idx} className="w-full h-full shrink-0 relative">
                  <img src={src} alt="Background Slider" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/70 to-pink-900/40 backdrop-blur-[2px]"></div>
          </div>
        ) : course.coverImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={course.coverImageUrl} alt="Cover Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/70 to-pink-900/40 backdrop-blur-[2px]"></div>
          </div>
        ) : null}

        {/* Slider Controls (Bottom Center) */}
        {hasSlider && course.sliderImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <span className="text-white/80 text-sm font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-3">
              {course.sliderImages.map((_: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)} 
                  className={`transition-all duration-500 cursor-pointer rounded-full ${idx === currentSlide ? 'bg-gradient-to-r from-blue-400 to-pink-500 w-10 h-2.5 shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'bg-white/40 w-2.5 h-2.5 hover:bg-white/80'}`} 
                />
              ))}
            </div>
            <span className="text-white/40 text-xs font-bold">{String(course.sliderImages.length).padStart(2, '0')}</span>
          </div>
        )}

        {/* Video Button & Stats (Right Sidebar) */}
        <div className="hidden lg:flex absolute right-4 xl:right-0 top-1/2 -translate-y-1/2 flex-col items-center gap-10 w-20 z-20">
          {course.introVideoUrl && (
            <a href={course.introVideoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/40 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/20">
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center group-hover:text-blue-400 group-hover:-translate-y-1 transition-all duration-300 whitespace-pre-line">{t('watchTrailer')}</span>
            </a>
          )}
        </div>

        <div className={`w-full max-w-7xl mx-auto px-4 lg:px-20 xl:px-24 relative z-20 h-full flex flex-col justify-center ${textColor}`}>
          <Link href="/courses" className={`inline-flex items-center gap-2 font-semibold mb-8 transition-colors ${hasCover ? 'text-white/70 hover:text-white' : 'text-foreground/60 hover:text-foreground'}`}>
            <ArrowLeft className="w-4 h-4" /> {t('goBack')}
          </Link>
          
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 uppercase tracking-wide ${hasCover ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}>
              {t(`category.${course.category}`) || course.category}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
              {course.title}
            </h1>
            <p className={`text-xl mb-10 leading-relaxed ${hasCover ? 'text-white/80' : 'text-foreground/80'}`}>
              {course.subtitle || t('descriptionFallbackPrimary')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Message for Parents */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <Heart className="w-6 h-6" /> 
                অভিভাবকদের উদ্দেশ্যে
              </h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {course.parentMessage || "আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য একটি শক্ত ভিত্তি তৈরি করা অত্যন্ত জরুরি। আমাদের এই কোর্সটি এমনভাবে সাজানো হয়েছে যাতে পড়াশোনা তাদের কাছে বোঝা না মনে হয়ে আনন্দদায়ক মনে হয়।"}
              </p>
            </section>

            <CourseFeatures course={course} />

            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-foreground/5 dark:to-foreground/5 p-6 rounded-lg border-l-4 border-l-primary border-y border-r border-y-blue-100 border-r-blue-100 dark:border-y-foreground/10 dark:border-r-foreground/10 leading-relaxed text-lg whitespace-pre-wrap relative overflow-hidden group">
                {/* Animated Background Shape */}
                <div 
                  ref={el => { shapeRefs.current[0] = el; }}
                  className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 dark:bg-blue-500/20 opacity-40 dark:opacity-30 pointer-events-none"
                />
                <div className="relative z-10 text-foreground/80">
                  {course.detailedDescription || t('descriptionFallbackPrimary')}
                </div>
              </div>
            </section>

            <LearningOutcomes outcomes={course.learningOutcomes} />
            <TargetAudience audience={course.targetAudience} />
            <CourseCurriculum modules={course.modules} />

            {course.studyRoutineUrl && (
              <section className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">স্টাডি রুটিন ও সিলেবাস</h3>
                  <p className="text-foreground/70">পুরো কোর্সের বিস্তারিত রুটিন ডাউনলোড করে প্রস্তুতি শুরু করুন আজই!</p>
                </div>
                <a 
                  href={course.studyRoutineUrl} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-blue-500/30"
                >
                  <Download className="w-5 h-5" /> রুটিন ডাউনলোড করুন
                </a>
              </section>
            )}

            {course.instructors && course.instructors.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" /> 
                  {t('instructors')}
                </h2>
                <div className="w-full h-[400px] py-10 relative">
                  <PerspectiveCarousel 
                    items={course.instructors} 
                    slideWidth={300}
                    rotationStep={40}
                  />
                </div>
              </section>
            )}

            <CourseTestimonials testimonials={course.testimonials} />

            {course.faqs && course.faqs.length > 0 && (
              <section className="mt-12">
                <h2 className="text-3xl font-bold mb-6">{t('faqs')}</h2>
                <div className="bg-background border border-foreground/10 rounded-lg p-6 shadow-sm relative overflow-hidden group">
                  {/* Animated Background Shape */}
                  <div 
                    ref={el => { shapeRefs.current[1] = el; }}
                    className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-purple-500/10 dark:bg-purple-500/20 opacity-40 dark:opacity-30 pointer-events-none"
                  />
                  <div className="relative z-10">
                    <Accordion className="w-full">
                    {course.faqs.map((faq: any, i: number) => (
                      <AccordionItem key={i} value={`item-${i}`} className={i === course.faqs.length - 1 ? "border-b-0" : ""}>
                        <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/70 text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  </div>
                </div>
              </section>
            )}
          </div>
          
          <StickyPricingCard course={course} />

        </div>
      </div>
    </div>
  );
}
