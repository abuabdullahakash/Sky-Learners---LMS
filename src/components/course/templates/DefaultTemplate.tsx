"use client";

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Users, Clock, CheckCircle2, ArrowLeft, PlayCircle, Image as ImageIcon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PerspectiveCarousel, PerspectiveCarouselItem } from '@/components/ui/perspective-carousel';
import { InstructorModal } from '@/components/course/InstructorModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';
import { VideoModal } from '@/components/ui/VideoModal';

gsap.registerPlugin(ScrollTrigger);

export default function DefaultTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const [selectedInstructor, setSelectedInstructor] = useState<PerspectiveCarouselItem | null>(null);
  const t = useTranslations('CourseDetails');
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
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
  const mutedColor = hasCover ? "text-white/80" : "text-foreground/70";
  const softColor = hasCover ? "text-white/60" : "text-foreground/50";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      <div className={`min-h-[75vh] lg:min-h-[85vh] pt-28 pb-12 flex items-center relative overflow-hidden ${hasCover ? '' : 'bg-foreground/5'}`}>
        {hasSlider ? (
          <div className="absolute inset-0 z-0">
            <img 
              key={currentSlide}
              src={course.sliderImages[currentSlide]} 
              alt="Background Slider" 
              className="w-full h-full object-cover animate-in fade-in duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 backdrop-blur-[2px]"></div>
          </div>
        ) : course.coverImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={course.coverImageUrl} alt="Cover Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 backdrop-blur-[2px]"></div>
          </div>
        ) : course.thumbnailUrl ? (
          <div className="absolute inset-0 opacity-10 blur-xl z-0">
            <img src={course.thumbnailUrl} alt="background blur" className="w-full h-full object-cover" />
          </div>
        ) : null}

        <div className="w-full max-w-7xl mx-auto relative z-20 h-full flex items-center">
          <div className="hidden lg:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-6 w-16">
            {hasSlider && course.sliderImages.length > 1 && (
              <>
                <span className="text-white/70 text-sm font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-3">
                  {course.sliderImages.map((_: any, idx: number) => (
                    <div key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-gradient-to-b from-cyan-400 to-purple-500 h-8 shadow-[0_0_10px_rgba(192,132,252,0.5)]' : 'bg-white/50 h-2 hover:bg-white/80'}`} />
                  ))}
                </div>
                <span className="text-white/30 text-xs font-bold">{String(course.sliderImages.length).padStart(2, '0')}</span>
              </>
            )}
          </div>

          <div className="hidden lg:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-10 w-20 z-20">
            {course.introVideoUrl && (
              <button onClick={() => setIsVideoModalOpen(true)} className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${hasCover ? 'bg-white/40' : 'bg-primary/40'}`}></div>
                  <div className={`relative w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${hasCover ? 'bg-white/10 border-white/20 text-white group-hover:bg-white group-hover:text-black group-hover:scale-110 shadow-white/20' : 'bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-primary/20'}`}>
                    <PlayCircle className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest text-center transition-all duration-300 whitespace-pre-line group-hover:-translate-y-1 ${hasCover ? 'text-white/60 group-hover:text-white' : 'text-foreground/60 group-hover:text-primary'}`}>{t('watchTrailer')}</span>
              </button>
            )}
            <div className={`w-px h-16 ${hasCover ? 'bg-white/10' : 'bg-foreground/10'}`}></div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-1 group cursor-default">
                <Users className="w-5 h-5 text-blue-400 group-hover:scale-125 transition-all" />
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default">
                <CheckCircle2 className="w-5 h-5 text-purple-400 group-hover:scale-125 transition-all" />
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default">
                <Clock className="w-5 h-5 text-pink-400 group-hover:scale-125 transition-all" />
              </div>
            </div>
          </div>

          <div className={`w-full px-4 lg:px-20 xl:px-24 py-12 ${textColor}`}>
            <Link href="/courses" className={`inline-flex items-center gap-2 font-semibold mb-8 transition-colors hover:opacity-100 ${hasCover ? 'text-white/70 hover:text-white' : 'text-foreground/60 hover:text-foreground'}`}>
              <ArrowLeft className="w-4 h-4" /> {t('goBack')}
            </Link>
            
            <div className="max-w-2xl">
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 border shadow-sm uppercase tracking-wide ${hasCover ? 'bg-primary/20 text-primary border-primary/30' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {t(`category.${course.category}`) || course.category}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm animate-pulse">
                {course.title}
              </h1>
              <p className={`text-xl mb-10 leading-relaxed ${mutedColor}`}>
                {course.subtitle || t('descriptionFallback')}
              </p>
              
              <div className="flex flex-wrap items-center gap-8 text-sm font-semibold">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasCover ? 'bg-white/10 text-white' : 'bg-primary/20 text-primary'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide ${softColor}`}>{t('instructor')}</p>
                    <p className="font-bold text-base mt-0.5">{course.coachingName || 'Instructor'}</p>
                    {course.teacherId && (
                      <Link href={`/teachers/${course.teacherId}`} target="_blank" className="text-primary text-xs hover:underline mt-0.5 inline-block font-bold">
                        {t('viewProfile')}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasCover ? 'bg-white/10 text-white' : 'bg-primary/20 text-primary'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide ${softColor}`}>{t('duration')}</p>
                    <p className="font-bold text-base mt-0.5">{course.courseValidity || t('lifetimeAccess')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasSlider && course.sliderImages.length > 1 && (
          <div className="lg:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {course.sliderImages.map((_: any, idx: number) => (
              <div key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg ">
                <div 
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-img:rounded-xl prose-p:leading-relaxed text-foreground/90 break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: course.detailedDescription || t('descriptionFallback') }}
                />
              </div>
            </section>

            <LearningOutcomes outcomes={course.learningOutcomes} />
            <TargetAudience audience={course.targetAudience} />
            <CourseCurriculum modules={course.modules} routineImageUrl={course.routineImageUrl} />

            {course.instructors && course.instructors.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" /> 
                  {t('instructors')}
                </h2>
                <div className="w-full h-[460px] py-10 relative">
                  <PerspectiveCarousel items={course.instructors} onItemClick={(item) => setSelectedInstructor(item)} 
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

      {course.introVideoUrl && (
        <VideoModal 
          isOpen={isVideoModalOpen} 
          onClose={() => setIsVideoModalOpen(false)} 
          videoUrl={course.introVideoUrl} 
        />
      )}
      <InstructorModal instructor={selectedInstructor} isOpen={!!selectedInstructor} onClose={() => setSelectedInstructor(null)} />
    </div>
  );
}
