"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Briefcase, Award, Users, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { useRef, useEffect } from 'react';
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

export default function SkillTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const t = useTranslations('CourseDetails');
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (galleryRef.current && course?.galleryImages?.length > 0) {
      const elements = galleryRef.current.querySelectorAll('.gallery-item');
      if (elements.length > 0) {
        gsap.fromTo(elements, 
          { opacity: 0, y: 50, scale: 0.95 }, 
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.8, 
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: galleryRef.current,
              start: "top 85%",
            }
          }
        );
      }
    }
  }, [course?.galleryImages]);

  const hasSlider = course.sliderImages && course.sliderImages.length > 0;
  const hasCover = hasSlider || !!course.coverImageUrl;
  const textColor = hasCover ? "text-white" : "text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      <div className={`min-h-[60vh] lg:min-h-[75vh] pt-28 pb-12 flex items-center relative overflow-hidden ${hasCover ? '' : 'bg-gradient-to-br from-emerald-900/30 via-background to-teal-900/20 dark:from-emerald-950 dark:via-background dark:to-teal-900/30'}`}>
        
        {/* Background Layer */}
        {hasSlider ? (
          <div className="absolute inset-0 z-0">
            <img 
              key={currentSlide}
              src={course.sliderImages[currentSlide]} 
              alt="Background Slider" 
              className="w-full h-full object-cover animate-in fade-in duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-black/50 backdrop-blur-[2px]"></div>
          </div>
        ) : course.coverImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={course.coverImageUrl} alt="Cover Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-black/50 backdrop-blur-[2px]"></div>
          </div>
        ) : null}

        {/* Slider Controls (Left Sidebar) */}
        <div className="hidden lg:flex absolute left-4 xl:left-0 top-1/2 -translate-y-1/2 flex-col items-center gap-6 w-16 z-20">
          {hasSlider && course.sliderImages.length > 1 && (
            <>
              <span className="text-white/70 text-sm font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')}</span>
              <div className="flex flex-col gap-3">
                {course.sliderImages.map((_: any, idx: number) => (
                  <div key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-gradient-to-b from-emerald-400 to-teal-500 h-8 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/50 h-2 hover:bg-white/80'}`} />
                ))}
              </div>
              <span className="text-white/30 text-xs font-bold">{String(course.sliderImages.length).padStart(2, '0')}</span>
            </>
          )}
        </div>

        {/* Video Button & Stats (Right Sidebar) */}
        <div className="hidden lg:flex absolute right-4 xl:right-0 top-1/2 -translate-y-1/2 flex-col items-center gap-10 w-20 z-20">
          {course.introVideoUrl && (
            <a href={course.introVideoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/40 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                  <PlayCircle className="w-6 h-6 fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center group-hover:text-emerald-400 group-hover:-translate-y-1 transition-all duration-300 whitespace-pre-line">{t('watchTrailer')}</span>
            </a>
          )}
        </div>

        <div className={`w-full max-w-7xl mx-auto px-4 lg:px-20 xl:px-24 relative z-20 h-full flex flex-col justify-center ${textColor}`}>
          <Link href="/courses" className={`inline-flex items-center gap-2 font-semibold mb-8 transition-colors ${hasCover ? 'text-white/70 hover:text-white' : 'text-foreground/60 hover:text-foreground'}`}>
            <ArrowLeft className="w-4 h-4" /> {t('goBack')}
          </Link>
          
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 uppercase tracking-wide border ${hasCover ? 'bg-white/10 border-white/20 text-white backdrop-blur-md' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
              <Award className="w-4 h-4" />
              {t(`category.${course.category}`) || course.category}
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
              {course.title}
            </h1>
            <p className={`text-xl mb-10 leading-relaxed ${hasCover ? 'text-white/80' : 'text-foreground/80'}`}>
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

            <CourseFeatures course={course} />

            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || t('descriptionFallbackSkill')}
              </div>
            </section>

            <LearningOutcomes outcomes={course.learningOutcomes} />
            <TargetAudience audience={course.targetAudience} />
            <CourseCurriculum modules={course.modules} />

            {course.instructors && course.instructors.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300 mt-12">
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

            {course.galleryImages && course.galleryImages.length > 0 && (
              <section className="mt-12" ref={galleryRef}>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-primary" /> 
                  {t('gallery')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {course.galleryImages.map((img: string, i: number) => (
                    <div key={i} className="gallery-item relative aspect-square rounded-2xl overflow-hidden shadow-sm group border border-foreground/10 bg-foreground/5 cursor-pointer">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <CourseTestimonials testimonials={course.testimonials} />

            {course.faqs && course.faqs.length > 0 && (
              <section className="mt-12">
                <h2 className="text-3xl font-bold mb-6">{t('faqs')}</h2>
                <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm">
                  <Accordion className="w-full">
                    {course.faqs.map((faq: any, i: number) => (
                      <AccordionItem key={i} value={`item-${i}`} className={i === course.faqs.length - 1 ? "border-b-0" : ""}>
                        <AccordionTrigger className="text-left font-bold text-lg hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/70 text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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
