"use client";
import 'react-quill-new/dist/quill.snow.css';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Target, Trophy, Clock, Users, Download, PlayCircle, ChevronLeft, ChevronRight, User, Play } from 'lucide-react';
import RelatedCourses from '../RelatedCourses';
import { PerspectiveCarousel, PerspectiveCarouselItem } from '@/components/ui/perspective-carousel';
import { InstructorModal } from '@/components/course/InstructorModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CourseCurriculum from '../CourseCurriculum';
import LearningOutcomes from '../LearningOutcomes';
import TargetAudience from '../TargetAudience';
import CourseTestimonials from '../CourseTestimonials';
import StickyPricingCard from '../StickyPricingCard';
import CourseFeatures from '../CourseFeatures';
import { VideoModal } from '@/components/ui/VideoModal';

export default function AdmissionTemplate({ course, currentSlide, setCurrentSlide }: { course: any, currentSlide: number, setCurrentSlide: (s: number) => void }) {
  const [selectedInstructor, setSelectedInstructor] = useState<PerspectiveCarouselItem | null>(null);
  const t = useTranslations('CourseDetails');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const hasSlider = course.sliderImages && course.sliderImages.length > 0;
  const hasCover = hasSlider || !!course.coverImageUrl;
  const textColor = hasCover ? "text-white" : "text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground pb-6 sm:pb-20 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
      <div className={`min-h-[420px] sm:min-h-[520px] lg:min-h-[75vh] pt-28 sm:pt-36 md:pt-40 pb-14 sm:pb-20 flex items-center relative overflow-hidden ${hasCover ? '' : 'bg-gradient-to-br from-red-950/30 via-background to-orange-950/20'}`}>
        
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-red-900/70 to-black/50 backdrop-blur-[2px]"></div>
          </div>
        ) : course.coverImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={course.coverImageUrl} alt="Cover Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-red-900/70 to-black/50 backdrop-blur-[2px]"></div>
          </div>
        ) : null}

        <div className={`w-full max-w-[1280px] px-[15px] md:px-[20px] lg:px-[30px] mx-auto relative z-20 h-full flex flex-col justify-center py-6 sm:py-12 ${textColor}`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6 flex-wrap">
            <Link href="/courses" className={`relative overflow-hidden inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all ${hasCover ? 'text-white/90 bg-white/10 border-white/20' : 'text-foreground/80 bg-foreground/5 border-foreground/10'} before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-500 ${hasCover ? 'before:bg-white/20' : 'before:bg-foreground/10'}`}>
              <ArrowLeft className="w-3.5 h-3.5 relative z-10" /> <span className="relative z-10">{t('goBack')}</span>
            </Link>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide border ${hasCover ? 'bg-white/10 border-white/20 text-white backdrop-blur-md' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
              <Trophy className="w-3.5 h-3.5" />
              {t(`category.${course.category}`) || course.category}
            </div>
          </div>
          
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-4xl lg:text-6xl font-extrabold mb-2.5 sm:mb-6 leading-tight drop-shadow-sm">
              {course.title}
            </h1>
            <p className={`text-xs sm:text-base md:text-xl mb-4 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none ${hasCover ? 'text-white/80' : 'text-foreground/80'}`}>
              {course.subtitle || t('descriptionFallbackHsc')}
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-6 mt-2 sm:mt-4">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>শীর্ষস্থান অধিকারের প্রস্তুতি</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <Target className="w-4 h-4 text-red-400 shrink-0" />
                <span>শতভাগ ফোকাসড সিলেবাস</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-4 sm:mt-8">
              {course.teacherId && (
                <Link href={`/teachers/${course.teacherId}`} target="_blank" className={`relative overflow-hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shadow-md group border backdrop-blur-md ${hasCover ? 'bg-white/10 text-white border-white/20' : 'bg-primary/5 text-primary border-primary/20'} before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-500 ${hasCover ? 'before:bg-white/25' : 'before:bg-primary/15'}`}>
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                  <span className="relative z-10">{t('viewProfile')}</span>
                </Link>
              )}

              {course.introVideoUrl && (
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className={`relative overflow-hidden inline-flex lg:hidden items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border backdrop-blur-md transition-all cursor-pointer shadow-md ${hasCover ? 'bg-white/10 text-white border-white/20' : 'bg-foreground/5 text-foreground border-foreground/10'} before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-0 before:transition-transform before:duration-500 ${hasCover ? 'before:bg-white/25' : 'before:bg-foreground/10'}`}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                  <span className="relative z-10">ভিডিও ট্রেইলার</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Video Button (Right Sidebar) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="w-full max-w-[1280px] px-[15px] md:px-[20px] lg:px-[30px] mx-auto relative h-full flex items-center justify-end">
            <div className="hidden lg:flex flex-col items-center gap-10 w-20 pointer-events-auto">
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
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        {hasSlider && course.sliderImages.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-10 left-0 right-0 z-20 pointer-events-none">
            <div className="w-full max-w-[1280px] px-[15px] md:px-[20px] lg:px-[30px] mx-auto relative flex justify-between items-center pointer-events-auto">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-white/80 text-xs sm:text-sm font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')}</span>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  {course.sliderImages.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)} 
                      className={`transition-all duration-500 cursor-pointer rounded-full ${idx === currentSlide ? 'bg-gradient-to-r from-red-400 to-orange-500 w-6 sm:w-10 h-2 sm:h-2.5 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-white/40 w-2 sm:w-2.5 h-2 sm:h-2.5 hover:bg-white/80'}`} 
                    />
                  ))}
                </div>
                <span className="text-white/40 text-[10px] sm:text-xs font-bold">{String(course.sliderImages.length).padStart(2, '0')}</span>
              </div>

              {/* Next/Prev Navigation */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <button 
                  onClick={() => setCurrentSlide((currentSlide === 0 ? course.sliderImages.length - 1 : currentSlide - 1))}
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all shadow-lg active:scale-90"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => setCurrentSlide((currentSlide + 1) % course.sliderImages.length)}
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all shadow-lg active:scale-90"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] py-6 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <TargetAudience audience={course.targetAudience} />
            
            <CourseFeatures course={course} />

            
            <LearningOutcomes outcomes={course.learningOutcomes} />
            
            <section>
              <h2 className="text-3xl font-bold mb-6">{t('description')}</h2>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-foreground/5 dark:to-foreground/5 p-6 rounded-lg border-l-4 border-l-primary border-y border-r border-y-red-100 border-r-red-100 dark:border-y-foreground/10 dark:border-r-foreground/10 leading-relaxed text-lg  relative overflow-hidden group">
                <div className="relative z-10 text-foreground/80">
                  <div className="ql-snow frontend-quill-render">
                    <div className="ql-editor !p-0 text-foreground/90 break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: course.detailedDescription || t('descriptionFallbackHsc')  }} />
                  </div>
                </div>
              </div>
            </section>

            
            {course.studyRoutineUrl && (
              <section className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-500">স্টাডি রুটিন ও এক্সাম ক্যালেন্ডার</h3>
                  <p className="text-foreground/70">অ্যাডমিশন বা বোর্ডের পূর্ণাঙ্গ রুটিনটি ডাউনলোড করে আপনার পড়াশোনা গুছিয়ে নিন।</p>
                </div>
                <a 
                  href={course.studyRoutineUrl} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-red-500/30"
                >
                  <Download className="w-5 h-5" /> রুটিন ডাউনলোড করুন
                </a>
              </section>
            )}

            
            <CourseCurriculum modules={course.modules} routineImageUrl={course.routineImageUrl} courseId={course.id} />

            
            {course.instructors && course.instructors.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300 mt-12">
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

            
            <CourseTestimonials testimonials={course.testimonials} />

            
            {course.faqs && course.faqs.length > 0 && (
              <section className="mt-12">
                <h2 className="text-3xl font-bold mb-6">{t('faqs')}</h2>
                <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm">
                  <Accordion className="w-full">
                    {course.faqs.map((faq: any, i: number) => (
                      <AccordionItem key={i} value={`item-${i}`} className={i === course.faqs.length - 1 ? "border-b-0" : ""}>
                        <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
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
          
          <RelatedCourses currentCourseId={course.id} teacherId={course.teacherId} category={course.category} eduClass={course.eduClass} />
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
