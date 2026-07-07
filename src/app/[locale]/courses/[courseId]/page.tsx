"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BookOpen, Users, Clock, CheckCircle2, ArrowLeft, Star, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PerspectiveCarousel } from '@/components/ui/perspective-carousel';

gsap.registerPlugin(ScrollTrigger);

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/courses');
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (course?.sliderImages?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % course.sliderImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [course?.sliderImages]);

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
  }, [course?.galleryImages, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <BookOpen className="w-20 h-20 text-foreground/20 mb-4" />
        <h1 className="text-3xl font-bold mb-4">কোর্সটি খুঁজে পাওয়া যায়নি</h1>
        <Link href="/courses" className="text-primary font-bold hover:underline">
          ফিরে যান
        </Link>
      </div>
    );
  }

  const freeLessons = (course.modules || []).flatMap((m: any) => 
    (m.lessons || []).filter((l: any) => l.isFreePreview === true)
  );

  console.log('Course Modules:', course.modules);
  console.log('Free Lessons:', freeLessons);

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
          {/* Left Side: Vertical Slider Dots & Counter (Desktop) */}
          <div className="hidden lg:flex absolute left-4 xl:left-0 top-1/2 -translate-y-1/2 flex-col items-center gap-6 w-16">
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

          {/* Right Side: Watch Trailer & Icons */}
          <div className="hidden lg:flex absolute right-4 xl:right-0 top-1/2 -translate-y-1/2 flex-col items-center gap-10 w-20">
            {(course.introVideoUrl || course.thumbnailUrl) && (
              <a href={course.introVideoUrl || '#'} target={course.introVideoUrl ? "_blank" : "_self"} className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-primary group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20">
                    <PlayCircle className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest text-center group-hover:text-primary group-hover:-translate-y-1 transition-all duration-300">Watch<br/>Trailer</span>
              </a>
            )}
            <div className="w-px h-16 bg-white/10"></div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-1 group cursor-default" title={`Total Lessons: ${course.totalVideoLessons || 0}`}>
                <BookOpen className="w-5 h-5 text-cyan-400 group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default" title={`Live Classes: ${course.totalLiveClasses || 0}`}>
                <Users className="w-5 h-5 text-blue-400 group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default" title={`Exams: ${course.totalExams || 0}`}>
                <CheckCircle2 className="w-5 h-5 text-purple-400 group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default" title={`Duration: ${course.courseValidity || 'Lifetime'}`}>
                <Clock className="w-5 h-5 text-pink-400 group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className={`w-full px-4 lg:px-20 xl:px-24 py-12 ${textColor}`}>
            <Link href="/courses" className={`inline-flex items-center gap-2 font-semibold mb-8 transition-colors hover:opacity-100 ${hasCover ? 'text-white/70 hover:text-white' : 'text-foreground/60 hover:text-foreground'}`}>
              <ArrowLeft className="w-4 h-4" /> ফিরে যান
            </Link>
            
            <div className="max-w-2xl">
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 border shadow-sm uppercase tracking-wide ${hasCover ? 'bg-primary/20 text-primary border-primary/30' : 'bg-primary/10 text-primary border-primary/20'}`}>
                {course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : course.category}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm animate-pulse">
                {course.title}
              </h1>
              <p className={`text-xl mb-10 leading-relaxed ${mutedColor}`}>
                {course.subtitle || 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন এবং পরীক্ষায় ভালো ফলাফল করতে পারবেন।'}
              </p>
              
              <div className="flex flex-wrap items-center gap-8 text-sm font-semibold">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasCover ? 'bg-white/10 text-white' : 'bg-primary/20 text-primary'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide ${softColor}`}>প্রশিক্ষক/প্রতিষ্ঠান</p>
                    <p className="font-bold text-base mt-0.5">{course.coachingName || 'Instructor'}</p>
                    {course.teacherId && (
                      <Link href={`/teachers/${course.teacherId}`} target="_blank" className="text-primary text-xs hover:underline mt-0.5 inline-block font-bold">
                        প্রোফাইল দেখুন
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasCover ? 'bg-white/10 text-white' : 'bg-primary/20 text-primary'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wide ${softColor}`}>মেয়াদ</p>
                    <p className="font-bold text-base mt-0.5">{course.courseValidity || 'Life-time Access'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Blend Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

        {/* Bottom Slider Dots (Mobile) */}
        {hasSlider && course.sliderImages.length > 1 && (
          <div className="lg:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {course.sliderImages.map((_: any, idx: number) => (
              <div key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6">কোর্সের বিস্তারিত বিবরণ</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || `যে সকল শিক্ষার্থীরা ${course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : course.category} তে অধ্যয়নরত আছেন এবং নিজেদের প্রস্তুতিকে আরও এক ধাপ এগিয়ে নিতে চান, তাদের জন্য এই কোর্সটি বিশেষভাবে ডিজাইন করা হয়েছে।`}
              </div>
            </section>


            {freeLessons.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <PlayCircle className="w-8 h-8 text-primary" /> 
                  ফ্রি ক্লাস ও ম্যাটেরিয়ালস
                </h2>
                <div className="bg-background border border-foreground/10 rounded-3xl overflow-hidden shadow-sm">
                  {freeLessons.map((lesson: any, i: number) => (
                    <div key={lesson.id} className={`p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors ${i !== freeLessons.length - 1 ? 'border-b border-foreground/10' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground/90">{lesson.title || `ফ্রি লেসন ${i + 1}`}</p>
                          <p className="text-xs text-foreground/50 mt-0.5">ফ্রি প্রিভিউ</p>
                        </div>
                      </div>
                      <a href={lesson.videoUrl || '#'} target={lesson.videoUrl ? "_blank" : "_self"} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-colors whitespace-nowrap">
                        দেখুন
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.instructors && course.instructors.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" /> 
                  কোর্সের প্রশিক্ষকবৃন্দ
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
                  কোর্স গ্যালারি
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

          </div>
          
          <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit pb-12">
            <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <p className="text-foreground/50 font-bold uppercase tracking-wider mb-2">কোর্স ফি</p>
                <div className="text-5xl font-extrabold text-primary">
                  ৳{course.price}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">মডিউল সংখ্যা</span>
                  <span>{course.modules?.length || 0} টি</span>
                </li>
                {course.department && (
                  <li className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-foreground/60">বিষয়/বিভাগ</span>
                    <span className="text-right">{course.department}</span>
                  </li>
                )}
                {course.year && (
                  <li className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-foreground/60">বর্ষ/সেমিস্টার</span>
                    <span className="text-right">{course.year}</span>
                  </li>
                )}
                {course.eduClass && (
                  <li className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-foreground/60">শ্রেণী</span>
                    <span className="text-right">{course.category === 'intermediate' ? 'একাদশ/দ্বাদশ' : `Class ${course.eduClass}`}</span>
                  </li>
                )}
                {course.classStartDate && (
                  <li className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-foreground/60">ক্লাস শুরু</span>
                    <span className="text-right">{new Date(course.classStartDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </li>
                )}
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">কোর্সের মেয়াদ</span>
                  <span className="text-right">{course.courseValidity || 'লাইফ-টাইম'}</span>
                </li>
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">সার্টিফিকেট</span>
                  <span className="text-right">হ্যাঁ</span>
                </li>
              </ul>

              <button 
                onClick={() => router.push(`/courses/${course.id}/checkout`)}
                className="w-full py-4 bg-primary text-primary-foreground text-xl font-bold rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                কোর্সে যুক্ত হোন
              </button>
              
              <p className="text-center text-xs font-semibold text-foreground/40 mt-4">
                ১০০% নিরাপদ পেমেন্ট (বিকাশ/নগদ/রকেট)
              </p>
            </div>
            
            <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">কোর্সে যা যা থাকছে</h2>
              <div className="flex flex-col gap-3">
                {[
                  course.totalVideoLessons > 0 ? `${course.totalVideoLessons} টি রেকর্ডেড ভিডিও ক্লাস` : null,
                  course.totalLiveClasses > 0 ? `${course.totalLiveClasses} টি লাইভ ক্লাস সেশন` : null,
                  course.totalPdfs > 0 ? `${course.totalPdfs} টি ক্লাস নোট ও পিডিএফ` : null,
                  course.totalExams > 0 ? `${course.totalExams} টি অধ্যায়ভিত্তিক পরীক্ষা (MCQ)` : null,
                  course.hasDoubtSolving ? '24/7 ডাউট সলভিং সাপোর্ট' : null,
                ].filter(Boolean).length > 0 ? (
                  [
                    course.totalVideoLessons > 0 ? `${course.totalVideoLessons} টি রেকর্ডেড ভিডিও ক্লাস` : null,
                    course.totalLiveClasses > 0 ? `${course.totalLiveClasses} টি লাইভ ক্লাস সেশন` : null,
                    course.totalPdfs > 0 ? `${course.totalPdfs} টি ক্লাস নোট ও পিডিএফ` : null,
                    course.totalExams > 0 ? `${course.totalExams} টি অধ্যায়ভিত্তিক পরীক্ষা (MCQ)` : null,
                    course.hasDoubtSolving ? '24/7 ডাউট সলভিং সাপোর্ট' : null,
                  ].filter(Boolean).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/10 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="font-semibold text-sm text-foreground/90">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-foreground/50 border border-foreground/10 rounded-xl bg-background text-sm text-center">
                    ফিচার যুক্ত করা হয়নি
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
