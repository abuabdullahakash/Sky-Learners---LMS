"use client";

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { 
  Building2, 
  User, 
  CheckCircle2, 
  Globe, 
  Star, 
  Users, 
  Video, 
  GraduationCap, 
  Briefcase, 
  Presentation,
  BookOpen,
  Megaphone,
  ArrowRight,
  Pin,
  Sparkles,
  Flame,
  Share2,
  Phone,
  Mail,
  Award,
  Clock,
  Compass,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trophy,
  HelpCircle,
  Check,
  MapPin,
  MessageCircle,
  ExternalLink,
  Info,
  Play,
  Layers,
  ShieldCheck,
  Target,
  Send,
  Edit2,
  LayoutDashboard,
  X,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CourseItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  price?: number;
  regularPrice?: number;
  enrolledCount?: number;
  rating?: number;
  duration?: string;
  instructorName?: string;
}

interface TeacherStorefrontViewProps {
  teacherId: string;
  isOwner?: boolean;
}

export default function TeacherStorefrontView({ teacherId, isOwner = false }: TeacherStorefrontViewProps) {
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('সকল কোর্স');
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<any | null>(null);

  // Hero Slider Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAcademyStorefront = async () => {
      if (!teacherId) {
        setIsLoading(false);
        return;
      }
      try {
        // 1. Fetch Teacher Profile & Home Page Config
        const docRef = doc(db, 'teacherProfiles', teacherId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }

        // 2. Fetch Teacher's Published Courses
        const coursesRef = collection(db, 'courses');
        const qCourses = query(coursesRef, where('teacherId', '==', teacherId), where('isPublished', '==', true));
        const coursesSnap = await getDocs(qCourses);
        const fetchedCourses: CourseItem[] = [];
        coursesSnap.forEach(d => {
          const data = d.data();
          fetchedCourses.push({
            id: d.id,
            title: data.title || 'Untitled Course',
            thumbnailUrl: data.thumbnailUrl,
            category: data.category,
            price: data.price,
            regularPrice: data.regularPrice,
            enrolledCount: data.enrolledCount || 0,
            rating: 4.9,
            duration: data.duration,
            instructorName: data.coachingName || docSnap.data()?.displayName || 'Instructor'
          });
        });
        setCourses(fetchedCourses);

      } catch (error) {
        console.error("Error fetching teacher storefront", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAcademyStorefront();
  }, [teacherId]);

  // Extract config or defaults
  const config = profileData?.homePageConfig || {};

  // 1. Hero Sliders
  const heroSliders = config.heroSliders && config.heroSliders.length > 0 ? config.heroSliders : [
    {
      id: 'default-1',
      imageUrl: profileData?.coverPhoto || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      targetCourseId: courses[0]?.id || '',
      title: profileData?.displayName || 'Special Batch'
    }
  ];

  // Auto-play slider
  useEffect(() => {
    if (heroSliders.length > 1) {
      slideTimerRef.current = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % heroSliders.length);
      }, 5000);
      return () => {
        if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      };
    }
  }, [heroSliders.length]);

  const handleNextSlide = () => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    setCurrentSlideIndex(prev => (prev + 1) % heroSliders.length);
  };

  const handlePrevSlide = () => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    setCurrentSlideIndex(prev => (prev - 1 + heroSliders.length) % heroSliders.length);
  };

  // 2. Quick Cards
  const quickCards = config.quickCards || {
    paidTitle: 'পেইড কোর্সসমূহ',
    paidSubtitle: 'ভর্তি চলছে এমন সকল প্রিমিয়াম ব্যাচ ও লাইভ কোর্স দেখুন',
    freeTitle: 'ফ্রি কোর্স ও ডেমো',
    freeSubtitle: 'ফ্রি স্পেশাল ক্লাস ও ডেমো লেকচার দেখে প্রস্তুতি শুরু করুন',
    freeLink: '#courses'
  };

  // 3. Custom Categories
  const customCategories = config.customCategories && config.customCategories.length > 0
    ? config.customCategories
    : ['সকল কোর্স', 'এইচএসসি সাইকেল', 'মেডিকেল এডমিশন', 'ভার্সিটি এডমিশন'];

  // Filter courses by category
  const filteredCourses = courses.filter(c => {
    if (activeCategory === 'সকল কোর্স') return true;
    return c.category?.toLowerCase() === activeCategory.toLowerCase() || activeCategory === 'সকল কোর্স';
  });

  // 4. Feature Cards & Bento Layout
  const featuresTitle = config.featuresTitle || 'একজন শিক্ষার্থীর পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন';
  const featuresSubtitle = config.featuresSubtitle || 'আমাদের প্রতিটি কোর্সে সেরা প্রস্তুতির জন্য রয়েছে সমন্বিত ফিচারসমূহ';

  // 5. Admission Info
  const admissionSteps = config.admissionSteps && config.admissionSteps.length > 0 ? config.admissionSteps : [
    { id: 's-1', stepNumber: 1, title: 'কোর্স নির্বাচন করুন', desc: 'আপনার ক্লাসের জন্য সঠিক কোর্সটি সিলেক্ট করে এনরোল বাটনে চাপুন।' },
    { id: 's-2', stepNumber: 2, title: 'পেমেন্ট সম্পন্ন করুন', desc: 'বিকাশ, নগদ বা কার্ডের মাধ্যমে ফি পরিশোধ করুন।' },
    { id: 's-3', stepNumber: 3, title: 'ক্লাস ও এক্সামে যুক্ত হোন', desc: 'ড্যাশবোর্ড থেকে তাৎক্ষণিক লাইভ ক্লাস ও এক্সামে অংশ নিন।' }
  ];

  // 5.5 Institution & Faculty State
  const isInstitution = profileData?.type === 'institution' || (profileData?.teachersRoster && profileData.teachersRoster.length > 0);
  const teachersRoster = profileData?.teachersRoster || [];

  // 6. About Section
  const aboutTitle = config.aboutTitle || (isInstitution ? 'আমাদের প্রতিষ্ঠান সম্পর্কে' : 'আমাদের সম্পর্কে');
  const aboutHeadline = config.aboutHeadline || `স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছে "${profileData?.displayName || 'আমাদের একাডেমি'}"`;
  const aboutBio = config.aboutBio || profileData?.bio || 'অনলাইন বিশ্ববিদ্যালয় ও বোর্ড পরীক্ষার প্রস্তুতির জন্য দেশসেরা প্ল্যাটফর্ম। ভর্তি প্রস্তুতি নেওয়া শিক্ষার্থীদের সঠিক দিকনির্দেশনা, নিয়মিত পরীক্ষা, মানসম্মত ক্লাস এবং ধারাবাহিক প্রস্তুতির মাধ্যমে নিজেদের লক্ষ্যে পৌঁছাতে আমরা নিরলসভাবে কাজ করে যাচ্ছি।';
  const founderRole = config.founderTitle || (isInstitution ? 'প্রতিষ্ঠাতা ও পরিচালক' : 'চিফ মেন্টর ও পরিচালক');
  const aboutPhoto = config.aboutPhoto || profileData?.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
  const aboutStats = config.aboutStats && config.aboutStats.length > 0 ? config.aboutStats : [
    { id: 'st-1', label: 'Courses', value: `${courses.length || 10}+` },
    { id: 'st-2', label: 'Exams', value: '10K+' },
    { id: 'st-3', label: 'Students', value: '100K+' }
  ];

  // 7. Contact & Social Channels
  const contactPhone = config.contactPhone || '01700000000';
  const contactWhatsapp = config.contactWhatsapp || '01700000000';
  const contactEmail = config.contactEmail || 'support@skylearners.com';
  const contactFacebookPage = config.contactFacebookPage || 'https://facebook.com';
  const contactFacebookGroup = config.contactFacebookGroup || 'https://facebook.com/groups';
  const contactYoutube = config.contactYoutube || 'https://youtube.com';
  const contactTelegram = config.contactTelegram || 'https://t.me';
  const contactImage = config.contactImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';

  // 8. Trust Banner & Image Slider
  const rawTrustTitle = String(config.trustTitle || 'বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতিতে');
  const cleanTrustTitle = rawTrustTitle.replace(/একটি\s*আস্থার\s*নাম/gi, '').trim();
  const trustHighlight = profileData?.displayName || 'Physics Hunters';
  const trustSubtitle = config.trustSubtitle || 'ভর্তি প্রস্তুতির শুরু হোক আজ থেকেই। সঠিক দিকনির্দেশনা ও প্রয়োজনীয় রিসোর্সের সাথে এগিয়ে যাও তোমার লক্ষ্যের দিকে।';
  const trustPaidBtnText = config.trustPaidBtnText || 'পেইড কোর্স';
  const trustFreeBtnText = config.trustFreeBtnText || 'ফ্রি কোর্স';
  const trustFreeLink = config.trustFreeLink || '#courses';
  const trustCornerImage = config.trustCornerImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop';

  const trustSlidersList: string[] = config.trustSliders && Array.isArray(config.trustSliders) && config.trustSliders.length > 0
    ? config.trustSliders
    : [
        trustCornerImage,
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop'
      ];
  
  const [currentTrustIndex, setCurrentTrustIndex] = useState(0);
  const trustTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (trustSlidersList.length > 1) {
      trustTimerRef.current = setInterval(() => {
        setCurrentTrustIndex(prev => (prev + 1) % trustSlidersList.length);
      }, 4500);
      return () => {
        if (trustTimerRef.current) clearInterval(trustTimerRef.current);
      };
    }
  }, [trustSlidersList.length]);

  const handleNextTrustSlide = () => {
    if (trustTimerRef.current) clearInterval(trustTimerRef.current);
    setCurrentTrustIndex(prev => (prev + 1) % trustSlidersList.length);
  };

  const handlePrevTrustSlide = () => {
    if (trustTimerRef.current) clearInterval(trustTimerRef.current);
    setCurrentTrustIndex(prev => (prev - 1 + trustSlidersList.length) % trustSlidersList.length);
  };

  // 9. Photo Gallery
  const defaultGalleryPhotos = [
    { id: 'g-1', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-2', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-3', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-4', imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-5', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-6', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop' }
  ];
  const galleryPhotos = config.galleryPhotos && Array.isArray(config.galleryPhotos) && config.galleryPhotos.length > 0 ? config.galleryPhotos : defaultGalleryPhotos;
  
  const buildMarqueeSet = (items: any[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];
    let set: any[] = [];
    while (set.length < 12) {
      set = [...set, ...items];
    }
    return [...set, ...set];
  };

  const halfLen = Math.ceil(galleryPhotos.length / 2);
  const row1Photos = galleryPhotos.slice(0, halfLen);
  const row2Photos = galleryPhotos.slice(halfLen).length > 0 ? galleryPhotos.slice(halfLen) : galleryPhotos;

  const row1Loop = buildMarqueeSet(row1Photos);
  const row2Loop = buildMarqueeSet(row2Photos);

  // 10. Help Bar
  const helpBarTitle = config.helpBarTitle || 'সাহায্যের প্রয়োজন?';
  const helpBarPhone = config.helpBarPhone || contactPhone;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!profileData && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-foreground/70 bg-background space-y-4">
        <Building2 className="w-16 h-16 text-foreground/30" />
        <h2 className="text-2xl font-bold">{locale === 'bn' ? 'একাডেমি পেজটি পাওয়া যায়নি' : 'Academy page not found'}</h2>
        <Link href="/" className="px-6 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm">
          {locale === 'bn' ? 'হোম পেজে ফিরে যান' : 'Return to Home'}
        </Link>
      </div>
    );
  }

  const currentSlide = (heroSliders && heroSliders.length > 0) ? (heroSliders[currentSlideIndex] || heroSliders[0]) : { id: 'default', imageUrl: '', targetCourseId: '', title: '' };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white w-full max-w-full overflow-x-hidden pt-24 sm:pt-28 lg:pt-32">
      
      {/* ========================================================================= */}
      {/* 1. HERO IMAGE CAROUSEL SLIDER (Physics Hunters Style)                     */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="relative aspect-[16/7] sm:aspect-[21/9] lg:aspect-[2.4/1] w-full rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-foreground/10 group">
          
          {/* Active Banner Image with Link */}
          {currentSlide.targetCourseId ? (
            <Link href={`/courses/${currentSlide.targetCourseId}`} className="w-full h-full block">
              <img 
                src={currentSlide.imageUrl} 
                alt={currentSlide.title || "Banner"} 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              />
            </Link>
          ) : (
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title || "Banner"} 
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Slider Navigation Arrows (Left / Right) */}
          {heroSliders.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-110 z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {heroSliders.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlideIndex === idx 
                        ? 'w-8 h-2 bg-orange-500 shadow-lg shadow-orange-500/50' 
                        : 'w-2 h-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DUAL QUICK ACTION CARDS (Contrasting Section Background & Borders)      */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-foreground/[0.02] border-y border-foreground/10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Paid Courses Card */}
            <a
              href="#courses"
              className="group relative min-h-[190px] sm:min-h-[210px] p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/[0.12] via-background to-orange-500/[0.04] border-2 border-orange-500/30 hover:border-orange-500/80 transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-between overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              
              <div className="space-y-3.5 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider border border-orange-500/30 shadow-sm">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>PREMIUM BATCHES</span>
                </span>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground group-hover:text-orange-500 transition-colors tracking-tight">
                  {quickCards.paidTitle}
                </h3>

                <p className="text-xs sm:text-sm text-foreground/75 max-w-sm leading-relaxed font-medium">
                  {quickCards.paidSubtitle}
                </p>
              </div>

              <div className="relative z-10 w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                <ArrowRight className="w-7 h-7" />
              </div>
            </a>

            {/* Free Courses Card */}
            <a
              href={quickCards.freeLink || '#courses'}
              className="group relative min-h-[190px] sm:min-h-[210px] p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.12] via-background to-blue-500/[0.04] border-2 border-blue-500/30 hover:border-blue-500/80 transition-all duration-500 shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-between overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
              
              <div className="space-y-3.5 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/30 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>FREE RESOURCES</span>
                </span>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground group-hover:text-blue-500 transition-colors tracking-tight">
                  {quickCards.freeTitle}
                </h3>

                <p className="text-xs sm:text-sm text-foreground/75 max-w-sm leading-relaxed font-medium">
                  {quickCards.freeSubtitle}
                </p>
              </div>

              <div className="relative z-10 w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 flex-shrink-0">
                <ArrowRight className="w-7 h-7" />
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. OUR COURSES WITH DYNAMIC CATEGORY TABS & ACCENT LINES                  */}
      {/* ========================================================================= */}
      <section id="courses" className="py-16 sm:py-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>আপনার লক্ষ্যের জন্য সঠিক কোর্সটি বেছে নাও</span>
          </div>

          {/* Title with Gradient Accent Lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              {locale === 'bn' ? (
                <>আমাদের <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">কোর্সসমূহ</span></>
              ) : (
                <>Our <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">Courses</span></>
              )}
            </h2>
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
          </div>

          <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            {config.coursesSubtitle || 'সেরা মেন্টরদের সাথে ঘরে বসেই নাও শতভাগ প্রস্তুতি। সঠিক গাইডলাইনে নিশ্চিত করো তোমার সাফল্য।'}
          </p>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {customCategories.map((cat: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm scale-105'
                  : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-foreground/[0.02] border-2 border-dashed border-foreground/10 rounded-3xl p-8">
            <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/60 text-sm font-semibold">এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় কোর্স নেই।</p>
            {isOwner && (
              <Link href="/teacher-dashboard/courses/create" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm">
                <span>+ নতুন কোর্স যুক্ত করুন</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="group rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full bg-foreground/5 overflow-hidden">
                  <img 
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.category && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                      {course.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-foreground/60 line-clamp-1 font-medium">
                      👨‍🏫 {course.instructorName}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-foreground/10 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-orange-500">
                        {course.price ? `৳ ${course.price}` : 'ফ্রি'}
                      </div>
                      {course.regularPrice && course.regularPrice > (course.price || 0) && (
                        <div className="text-[11px] text-foreground/40 line-through">
                          ৳ {course.regularPrice}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/courses/${course.id}`}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                    >
                      <span>বিস্তারিত</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন (Modern Bento Ecosystem Grid)         */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-foreground/[0.02] to-background border-y border-foreground/10 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Full Ecosystem</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-snug sm:leading-tight">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                {featuresTitle}
              </span>
            </h2>

            <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
              {featuresSubtitle}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Card 1 (Span 2) - Live & Recorded Classes */}
            <div className="md:col-span-2 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/[0.08] via-background to-amber-500/[0.04] border border-orange-500/20 hover:border-orange-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold border border-orange-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    <span>HD Live & Recording</span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-orange-500 transition-colors">
                  ইন্টারেক্টিভ লাইভ ও রেকর্ডেড ক্লাস
                </h3>
                <p className="text-foreground/75 text-sm sm:text-base leading-relaxed">
                  প্রতিটি বিষয়ের কনসেপ্ট ক্লিয়ার করতে রয়েছে সর্বোচ্চ মানের ডিজিটাল স্মার্টবোর্ড লেকচার, লাইভ ডিসকাশন এবং আনলিমিটেড রিভিশনের সুযোগ।
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-2 relative z-10">
                <span className="px-3.5 py-1.5 rounded-xl bg-background/80 border border-foreground/10 text-xs font-bold text-foreground/80 shadow-sm">
                  ✨ 4K আল্ট্রা HD ক্লাস
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-background/80 border border-foreground/10 text-xs font-bold text-foreground/80 shadow-sm">
                  🎥 স্মার্টবোর্ড ডিজিটাল লেকচার
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-background/80 border border-foreground/10 text-xs font-bold text-foreground/80 shadow-sm">
                  🔄 আনলিমিটেড রিভিশন
                </span>
              </div>
            </div>

            {/* Card 2 - Online Exam & Leaderboard */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.08] via-background to-blue-500/[0.02] border border-blue-500/20 hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-blue-500 transition-colors">
                  অনলাইন এক্সাম ও লিডারবোর্ড
                </h3>
                <p className="text-foreground/75 text-sm leading-relaxed">
                  নিয়মিত এমসিকিউ ও স্ট্যান্ডার্ড রিটেন পরীক্ষা দিয়ে দেশব্যাপী রিয়েলটাইম মেরিট লিস্টে নিজের অবস্থান যাচাই করুন।
                </p>
              </div>

              <div className="space-y-2 relative z-10 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>তাৎক্ষণিক ফলাফল ও মেধা তালিকা</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>নেগেটিভ মার্কিং অ্যানালাইসিস</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Lecture Sheet & Practice Book */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-500/[0.08] via-background to-purple-500/[0.02] border border-purple-500/20 hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-purple-500 transition-colors">
                  লেকচার শিট ও প্র্যাকটিস বুক
                </h3>
                <p className="text-foreground/75 text-sm leading-relaxed">
                  প্রতিটি চ্যাপ্টারের পূর্ণাঙ্গ টাইপভিত্তিক গোছানো রঙিন পিডিএফ নোটস ও স্ট্যান্ডার্ড প্রশ্নব্যাংক।
                </p>
              </div>

              <div className="space-y-2 relative z-10 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>প্রিন্ট উপযোগী অধ্যায়ভিত্তিক PDF</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>টপিকওয়াইজ ফর্মুলা শিট</span>
                </div>
              </div>
            </div>

            {/* Card 4 - 24/7 Doubt Solving */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/[0.08] via-background to-emerald-500/[0.02] border border-emerald-500/20 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-emerald-500 transition-colors">
                  ২৪/৭ ডাউট সলভিং
                </h3>
                <p className="text-foreground/75 text-sm leading-relaxed">
                  পড়াশোনায় যেকোনো সমস্যায় সরাসরি ডেডিকেটেড এক্সপার্ট মেন্টরদের থেকে দ্রুত সমাধান পাওয়ার সুবিধা।
                </p>
              </div>

              <div className="space-y-2 relative z-10 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>সরাসরি শিক্ষকদের সহায়তা</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>প্রাইভেট ডিসকাশন গ্রুপ অ্যাক্সেস</span>
                </div>
              </div>
            </div>

            {/* Card 5 (Span 3) - Success CTA Banner */}
            <div className="md:col-span-3 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-600/15 border-2 border-orange-500/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-500 text-xs font-bold border border-orange-500/30 mb-1">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>স্বপ্ন জয়ের সেরা প্ল্যাটফর্ম</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  সেরা মেন্টরদের সাথে তোমার সাফল্য সুনিশ্চিত করো
                </h3>
                <p className="text-foreground/75 text-sm sm:text-base font-medium">
                  হাজারো সফল শিক্ষার্থীর কাতারে যুক্ত হতে এখনই তোমার কাঙ্ক্ষিত কোর্সে এনরোল করো।
                </p>
              </div>

              <a 
                href="#courses" 
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-sm hover:scale-105 transition-all shrink-0 flex items-center gap-2"
              >
                <span>কোর্সসমূহ দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ভর্তি নির্দেশিকা (Step-by-Step Admission Guide - Light/Dark Harmonized) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-orange-500/[0.04] via-card to-amber-500/[0.02] dark:from-neutral-900 dark:via-zinc-950 dark:to-black text-foreground dark:text-white border border-foreground/10 dark:border-white/10 shadow-md relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left: Steps Flow */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>সহজ ৩ ধাপের প্রক্রিয়া</span>
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3 text-foreground dark:text-white tracking-tight">
                  কীভাবে কোর্সে <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">ভর্তি হবেন?</span>
                </h2>
                <p className="text-foreground/70 dark:text-gray-400 text-sm sm:text-base mt-2 font-medium leading-relaxed">
                  মাত্র ৩টি সহজ ধাপে ঘরে বসেই আপনার কাঙ্ক্ষিত কোর্সে যুক্ত হয়ে সেরা প্রস্তুতি শুরু করুন।
                </p>
              </div>

              {/* Connected Timeline Steps */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-amber-500 before:to-emerald-500">
                {admissionSteps.map((st: any, idx: number) => {
                  const stepNum = st.stepNumber || idx + 1;
                  const stepColors = [
                    'from-orange-500 to-amber-500 shadow-sm text-white',
                    'from-amber-500 to-orange-600 shadow-sm text-white',
                    'from-emerald-500 to-teal-600 shadow-sm text-white'
                  ];
                  const colorClass = stepColors[idx % stepColors.length];

                  return (
                    <div key={st.id || idx} className="flex items-start gap-5 relative group">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${colorClass} font-black text-lg flex items-center justify-center shrink-0 shadow-sm ring-4 ring-background dark:ring-neutral-900 z-10 group-hover:scale-110 transition-transform`}>
                        0{stepNum}
                      </div>
                      <div className="p-5 rounded-2xl bg-card dark:bg-white/[0.04] border border-foreground/10 dark:border-white/10 hover:border-orange-500/40 transition-colors flex-1 space-y-1 shadow-sm">
                        <h4 className="font-extrabold text-base sm:text-lg text-foreground dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                          {st.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-foreground/70 dark:text-gray-300 leading-relaxed font-medium">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Quick Counseling & Payment Widget */}
            <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-card/90 dark:bg-white/[0.03] border border-foreground/10 dark:border-white/10 backdrop-blur-xl shadow-md space-y-6 text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Phone className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-orange-500/10 dark:bg-white/10 text-orange-600 dark:text-orange-400 text-xs font-extrabold uppercase tracking-wider">
                  হেল্প ও ভর্তি সহায়তা
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-foreground dark:text-white mt-2">
                  ভর্তি সংক্রান্ত যেকোনো তথ্যে
                </h3>
                <p className="text-xs sm:text-sm text-foreground/70 dark:text-gray-300 mt-1 font-medium">
                  আমাদের এক্সপার্ট কাউন্সিলরদের সাথে সরাসরি কথা বলে সঠিক কোর্স বেছে নিন
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={`tel:${contactPhone}`}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:scale-[1.02]"
                >
                  <Phone className="w-4 h-4" />
                  <span>সরাসরি কল করুন: {contactPhone}</span>
                </a>

                {contactWhatsapp && (
                  <a
                    href={`https://wa.me/${String(contactWhatsapp).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp-এ মেসেজ দিন</span>
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-foreground/10 dark:border-white/10">
                <p className="text-[11px] text-foreground/60 dark:text-gray-400 font-bold mb-2">সমর্থিত পেমেন্ট মাধ্যমসমূহ</p>
                <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-foreground/80 dark:text-gray-300 font-extrabold">
                  <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300 border border-pink-500/20 dark:border-pink-500/30">bKash</span>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-500/20 dark:border-orange-500/30">Nagad</span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30">Rocket</span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30">Cards</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.5 আমাদের শিক্ষক মণ্ডলী (Faculty Showcase for Institutions)              */}
      {/* ========================================================================= */}
      {isInstitution && teachersRoster.length > 0 && (
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              <Users className="w-3.5 h-3.5" />
              <span>Expert Faculty & Mentors</span>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                আমাদের <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">শিক্ষক মণ্ডলী</span>
              </h2>
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
            </div>

            <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
              দেশের সেরা বিশ্ববিদ্যালয় ও শীর্ষস্থানীয় প্রতিষ্ঠানসমূহের অভিজ্ঞ মেন্টরদের সাথে নাও তোমার সেরা প্রস্তুতি
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachersRoster.map((teacher: any, idx: number) => (
              <div
                key={teacher.id || idx}
                className="group rounded-[2.5rem] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-foreground/10 hover:border-orange-500/50 p-6 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/30 transition-colors" />

                <div>
                  <div className="relative w-28 h-28 mx-auto rounded-full p-1.5 bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-background bg-neutral-900">
                      <img
                        src={teacher.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(teacher.name)}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-lg text-foreground group-hover:text-orange-500 transition-colors line-clamp-1">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-bold text-orange-500">
                      {teacher.role || 'Senior Faculty'}
                    </p>
                    {teacher.university && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-foreground/70 font-medium mt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">{teacher.university}</span>
                      </div>
                    )}
                  </div>

                  {teacher.subjects && (
                    <div className="mt-3 text-center">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-bold max-w-full truncate">
                        📚 {teacher.subjects}
                      </span>
                    </div>
                  )}

                  {teacher.bio && (
                    <p className="text-xs text-foreground/70 mt-3 text-center line-clamp-2 leading-relaxed font-medium">
                      {teacher.bio}
                    </p>
                  )}
                </div>

                {/* Actions: Biodata Modal Button & Social */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherModal(teacher)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>বায়োডাটা দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  {(teacher.facebookUrl || teacher.youtubeUrl) && (
                    <div className="pt-2 border-t border-foreground/10 flex items-center justify-center gap-2.5">
                      {teacher.facebookUrl && (
                        <a
                          href={teacher.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-blue-600 hover:text-white flex items-center justify-center text-foreground/70 transition-colors text-xs font-bold shadow-sm"
                          title="Facebook"
                        >
                          f
                        </a>
                      )}
                      {teacher.youtubeUrl && (
                        <a
                          href={teacher.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-red-600 hover:text-white flex items-center justify-center text-foreground/70 transition-colors text-xs shadow-sm"
                          title="YouTube"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. আমাদের সম্পর্কে (About Section - Light/Dark Harmonized & Premium)       */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-foreground/[0.02] border-y border-foreground/10 relative overflow-hidden">
        {/* Ambient floating lights */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12">
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                {aboutTitle}
              </span>
            </h2>
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
          </div>

          <div className="p-8 sm:p-14 rounded-[3.5rem] bg-gradient-to-br from-orange-500/[0.05] via-card to-amber-500/[0.03] dark:from-neutral-900 dark:via-zinc-950 dark:to-black text-foreground dark:text-white border border-foreground/10 dark:border-white/10 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left: Founder Avatar with glowing rings */}
              <div className="lg:col-span-5 text-center space-y-5">
                <div className="relative w-64 h-64 sm:w-76 sm:h-76 mx-auto rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 p-2.5 flex items-center justify-center shadow-md group">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-background dark:border-neutral-950 bg-card dark:bg-neutral-900 shadow-inner">
                    <img 
                      src={aboutPhoto} 
                      alt={profileData?.displayName || "Founder"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute -top-2 left-0 px-4 py-1.5 rounded-full bg-card/90 dark:bg-neutral-900/90 border border-orange-500/40 shadow-sm text-xs font-black text-orange-600 dark:text-orange-400 backdrop-blur-md flex items-center gap-1.5">
                    <span>🏆</span>
                    <span>চিফ মেন্টর</span>
                  </div>

                  <div className="absolute -bottom-2 right-0 px-4 py-1.5 rounded-full bg-card/90 dark:bg-neutral-900/90 border border-amber-500/40 shadow-sm text-xs font-black text-amber-600 dark:text-amber-300 backdrop-blur-md flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>১০+ বছর অভিজ্ঞতা</span>
                  </div>
                </div>

                <div className="inline-block px-8 py-3.5 rounded-2xl bg-card/90 dark:bg-white/[0.05] border border-foreground/10 dark:border-white/10 shadow-sm text-center backdrop-blur-md">
                  <div className="flex items-center justify-center gap-2">
                    <h4 className="text-xl font-black text-foreground dark:text-white">{profileData?.displayName || 'Instructor Name'}</h4>
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-1 tracking-wide">
                    {founderRole}
                  </p>
                </div>
              </div>

              {/* Right: Story & Animated Stats */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>স্বপ্ন ছোঁয়ার প্রস্তুতি</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground dark:text-white leading-[1.25] tracking-tight">
                  {aboutHeadline}
                </h3>

                <div className="relative">
                  <Quote className="w-8 h-8 text-orange-500/20 absolute -top-4 -left-3 pointer-events-none" />
                  <p className="text-foreground/75 dark:text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium pl-4 border-l-2 border-orange-500/40">
                    {aboutBio}
                  </p>
                </div>

                {/* 3 Rich Animated Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-orange-500/40 shadow-sm hover:shadow-md transition-all text-center group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-orange-600 dark:text-orange-400">১০,০০০+</div>
                    <div className="text-[11px] sm:text-xs font-bold text-foreground/60 dark:text-gray-400 mt-1 uppercase tracking-wider">মোট শিক্ষার্থী</div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all text-center group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">৯৯%</div>
                    <div className="text-[11px] sm:text-xs font-bold text-foreground/60 dark:text-gray-400 mt-1 uppercase tracking-wider">সফলতার হার</div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all text-center group hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">৫০০+</div>
                    <div className="text-[11px] sm:text-xs font-bold text-foreground/60 dark:text-gray-400 mt-1 uppercase tracking-wider">মোট ক্লাস লেকচার</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. যোগাযোগ ও সোশ্যাল চ্যানেল (Contact Section - Light & Dark Harmonized)   */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[3.5rem] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-orange-500/[0.04] via-card to-amber-500/[0.02] dark:from-neutral-900/95 dark:via-black dark:to-neutral-900/90 text-foreground dark:text-white border border-foreground/10 dark:border-white/10 shadow-md relative overflow-hidden">
          
          <div className="space-y-12">
            
            {/* Heading & Intro + Large Transparent Representative Image */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-foreground/10 dark:border-white/10 relative">
              <div className="space-y-3 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>২৪/৭ হেল্প ও সাপোর্ট সক্রিয়</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground dark:text-white tracking-tight leading-tight">
                  আমাদের সাথে{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                    যোগাযোগ করো
                  </span>
                </h2>

                <p className="text-foreground/75 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                  {profileData?.displayName || 'আমাদের একাডেমি'}-এর সাথে যুক্ত থাকো, নতুন ক্লাস, নোটিশ, আপডেট ও প্রয়োজনীয় দিকনির্দেশনা সবার আগে পেতে।
                </p>
              </div>

              {contactImage && (
                <div className="relative w-full sm:w-80 md:w-96 lg:w-[380px] h-48 sm:h-56 md:h-64 lg:h-72 flex-shrink-0 flex items-end justify-center lg:justify-end pointer-events-none -mb-6 lg:-mb-10">
                  <img 
                    src={contactImage} 
                    alt="Support Representative" 
                    className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" 
                  />
                </div>
              )}
            </div>

            {/* 6 Rich Contact Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* 1. Phone Call Card */}
              <a
                href={`tel:${contactPhone}`}
                className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 text-[10px] font-bold border border-orange-500/20 dark:border-orange-500/30">
                    সরাসরি কল
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                    সরাসরি কল করো
                  </h4>
                  <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5">{contactPhone}</p>
                </div>
                <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-bold">
                  <span>কল করতে ট্যাপ করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* 2. WhatsApp Message Card */}
              {contactWhatsapp && (
                <a
                  href={`https://wa.me/${String(contactWhatsapp).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20 dark:border-emerald-500/30">
                      ইনস্ট্যান্ট চ্যাট
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      WhatsApp মেসেজ
                    </h4>
                    <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5">{contactWhatsapp}</p>
                  </div>
                  <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>মেসেজ দিন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )}

              {/* 3. Telegram Channel Card */}
              {contactTelegram && (
                <a
                  href={contactTelegram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-sky-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 text-[10px] font-bold border border-sky-500/20 dark:border-sky-500/30">
                      নোটিশ ও ফাইল
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      Telegram চ্যানেল
                    </h4>
                    <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5">নিয়মিত আপডেট পেতে</p>
                  </div>
                  <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-bold">
                    <span>চ্যানেলে যুক্ত হোন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )}

              {/* 4. YouTube Channel Card */}
              {contactYoutube && (
                <a
                  href={contactYoutube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-300 text-[10px] font-bold border border-red-500/20 dark:border-red-500/30">
                      ফ্রি ভিডিও
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      YouTube চ্যানেল
                    </h4>
                    <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5">ফ্রি ক্লাস ও টিপস দেখুন</p>
                  </div>
                  <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-bold">
                    <span>সাবস্ক্রাইব করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )}

              {/* 5. Facebook Group Card */}
              {contactFacebookGroup && (
                <a
                  href={contactFacebookGroup}
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold border border-blue-500/20 dark:border-blue-500/30">
                      কমিউনিটি
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Facebook গ্রুপ
                    </h4>
                    <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5">কমিউনিটিতে যুক্ত হও</p>
                  </div>
                  <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
                    <span>গ্রুপে যুক্ত হোন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              )}

              {/* 6. Email Contact Card */}
              <a
                href={`mailto:${contactEmail}`}
                className="p-6 rounded-3xl bg-card dark:bg-white/[0.04] hover:bg-foreground/[0.03] dark:hover:bg-white/[0.08] border border-foreground/10 dark:border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-bold border border-purple-500/20 dark:border-purple-500/30">
                    ইমেইল
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-foreground dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    অফিসিয়াল ইমেইল
                  </h4>
                  <p className="text-xs text-foreground/60 dark:text-gray-400 font-semibold mt-0.5 truncate">{contactEmail}</p>
                </div>
                <div className="pt-2 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
                  <span>ইমেইল পাঠান</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ট্রাস্ট ও কল-টু-অ্যাকশন ব্যানার (Light/Dark Harmonized & Slider)         */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[3.5rem] p-8 sm:p-14 lg:p-16 bg-gradient-to-br from-orange-500/[0.06] via-card to-amber-500/[0.03] dark:from-neutral-900 dark:via-zinc-950 dark:to-black text-foreground dark:text-white border-2 border-orange-500/30 shadow-md relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>শীর্ষস্থানীয় এডটেক একাডেমি</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground dark:text-white leading-[1.2] tracking-tight">
                  {cleanTrustTitle}{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                    {trustHighlight}
                  </span>{' '}
                  একটি আস্থার নাম
                </h2>

                <p className="text-foreground/75 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                  {trustSubtitle}
                </p>

                <div className="flex items-center gap-3 flex-wrap text-xs font-bold text-foreground/80 dark:text-gray-300 pt-1">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] border border-foreground/10 dark:border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>১০০% লাইভ ইন্টারঅ্যাকশন</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] border border-foreground/10 dark:border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>রিভিশন ও এক্সাম ব্যাচ</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.04] dark:bg-white/[0.05] border border-foreground/10 dark:border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>ডেডিকেটেড মেন্টরশিপ</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <a
                  href="#courses"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-sm hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{trustPaidBtnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={trustFreeLink}
                  className="px-8 py-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] border border-foreground/15 dark:border-white/20 text-foreground dark:text-white font-black text-sm transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
                >
                  {trustFreeBtnText}
                </a>
              </div>
            </div>

            {/* Right Equal-Height Image Slider Column */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden shadow-md border-2 border-foreground/10 dark:border-white/20 bg-gradient-to-tr from-orange-500/20 via-foreground/5 dark:via-white/5 to-transparent group flex flex-col justify-between">
                
                {/* Active Image */}
                <img 
                  src={trustSlidersList[currentTrustIndex] || trustCornerImage} 
                  alt="Student Success" 
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                />

                {/* Floating Top Badge */}
                <div className="relative z-10 m-4 self-start px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300 flex items-center gap-1.5 shadow-sm">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>সফল শিক্ষার্থী</span>
                </div>

                {/* Slider Navigation Controls (Left/Right Arrows) */}
                {trustSlidersList.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between z-20 pointer-events-none">
                    <button
                      type="button"
                      onClick={handlePrevTrustSlide}
                      className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-sm hover:scale-110 pointer-events-auto cursor-pointer"
                      aria-label="Previous Trust Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextTrustSlide}
                      className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-sm hover:scale-110 pointer-events-auto cursor-pointer"
                      aria-label="Next Trust Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Floating Bottom Badge & Dots */}
                <div className="relative z-10 m-4 flex items-center justify-between gap-2">
                  {/* Dots indicator */}
                  {trustSlidersList.length > 1 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                      {trustSlidersList.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentTrustIndex(idx)}
                          className={`rounded-full transition-all ${
                            currentTrustIndex === idx ? 'w-5 h-1.5 bg-orange-500' : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  ) : <div />}

                  <div className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-black text-orange-400 flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>৪.৯/৫ রেটিং</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. ফটো গ্যালারি ও সাফল্যের মুহূর্ত (Continuous Dual-Row Seamless Marquee)   */}
      {/* ========================================================================= */}
      {galleryPhotos.length > 0 && (
        <section className="py-20 sm:py-28 bg-foreground/[0.02] dark:bg-black text-foreground dark:text-white border-t border-foreground/10 dark:border-white/10 overflow-hidden">
          
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mb-14 text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground dark:text-white">
                {profileData?.displayName || 'Physics Hunters'}-এর হাত ধরে{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  সাফল্যের পথে এগিয়ে চলেছে
                </span>
              </h2>
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
            </div>

            <p className="text-foreground/60 dark:text-gray-400 text-xs sm:text-sm font-medium">
              {config.gallerySubtitle || 'আমাদের শিক্ষার্থীদের অর্জন ও স্মরণীয় মুহূর্তগুলো'}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="w-full overflow-hidden flex">
              <div className="animate-marquee-left flex gap-4 sm:gap-6 py-2">
                {row1Loop.map((photo: any, idx: number) => (
                  <div 
                    key={`row1-${idx}`} 
                    className="relative w-64 sm:w-80 md:w-96 aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 shadow-md flex-shrink-0 group"
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt="Gallery" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full overflow-hidden flex">
              <div className="animate-marquee-right flex gap-4 sm:gap-6 py-2">
                {row2Loop.map((photo: any, idx: number) => (
                  <div 
                    key={`row2-${idx}`} 
                    className="relative w-64 sm:w-80 md:w-96 aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 shadow-md flex-shrink-0 group"
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt="Gallery" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 10. সাহায্যের প্রয়োজন? আমরা পাশে আছি                                       */}
      {/* ========================================================================= */}
      <section className="py-12 max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="relative rounded-[2rem] p-6 sm:p-8 bg-card border border-foreground/10 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-blue-500" />

          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-foreground">
                {helpBarTitle}{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent font-black">
                  আমরা পাশে আছি
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-foreground/60 mt-0.5 font-medium">
                কোর্স সম্পর্কিত যেকোনো সমস্যা বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করো
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end flex-shrink-0">
            {contactFacebookPage && (
              <a
                href={contactFacebookPage}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
              >
                <span className="font-black text-base">f</span>
                <div className="text-left leading-tight">
                  <div>Facebook মেসেজ</div>
                  <div className="text-[10px] text-white/80 font-normal">(মেসেজের সময় ২৪/৭)</div>
                </div>
              </a>
            )}

            <a
              href={`tel:${helpBarPhone}`}
              className="px-5 py-3 rounded-2xl bg-background hover:bg-foreground/5 border-2 border-foreground/15 text-foreground font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <Phone className="w-4 h-4 text-orange-500" />
              <div className="text-left leading-tight">
                <div>{helpBarPhone}</div>
                <div className="text-[10px] text-foreground/60 font-normal">(সকাল ১০টা - রাত ৮টা)</div>
              </div>
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* Teacher Biodata Modal (Popup)                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTeacherModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacherModal(null)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-3.5 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-card dark:bg-neutral-950 border border-foreground/10 dark:border-white/15 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl shadow-orange-500/10 pointer-events-auto relative flex flex-col max-h-[90vh] text-foreground dark:text-white"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedTeacherModal(null)}
                  className="absolute top-4 right-4 z-20 p-2.5 bg-background/80 dark:bg-black/60 hover:bg-background dark:hover:bg-black/90 backdrop-blur-md rounded-full text-foreground dark:text-white border border-foreground/10 dark:border-white/10 transition-colors cursor-pointer shadow-md"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header Banner */}
                <div className="relative h-36 sm:h-44 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3),transparent_70%)]" />
                  <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>এক্সপার্ট ফ্যাকাল্টি প্রোফাইল</span>
                  </div>
                </div>

                {/* Avatar & Floating Info */}
                <div className="px-6 sm:px-8 relative -mt-16 sm:-mt-20 z-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-2xl shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-background dark:border-neutral-950 bg-card dark:bg-neutral-900">
                        <img
                          src={selectedTeacherModal.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(selectedTeacherModal.name)}
                          alt={selectedTeacherModal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 pb-1 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground dark:text-white">{selectedTeacherModal.name}</h2>
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">{selectedTeacherModal.role || 'Senior Faculty'}</p>
                      {selectedTeacherModal.university && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-foreground/70 dark:text-gray-300 font-medium">
                          <GraduationCap className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{selectedTeacherModal.university}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  
                  {/* Subjects / Department */}
                  {selectedTeacherModal.subjects && (
                    <div className="p-4 rounded-2xl bg-foreground/[0.04] dark:bg-white/[0.04] border border-foreground/10 dark:border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground/60 dark:text-gray-400 uppercase tracking-wider">পাঠদানের বিষয়সমূহ</h4>
                        <p className="text-sm sm:text-base font-extrabold text-foreground dark:text-white mt-0.5">{selectedTeacherModal.subjects}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio & Details */}
                  {selectedTeacherModal.bio && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground/60 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span>শিক্ষকের বিস্তারিত পরিচিতি ও অভিজ্ঞতা</span>
                      </h4>
                      <div className="p-5 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.03] border border-foreground/10 dark:border-white/10 text-foreground/90 dark:text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedTeacherModal.bio}
                      </div>
                    </div>
                  )}

                  {/* Highlights / Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.02] border border-foreground/10 dark:border-white/10 flex items-center gap-2.5 text-xs text-foreground/80 dark:text-gray-300">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>অভিজ্ঞ ও পেশাদার মেন্টরশিপ</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.02] border border-foreground/10 dark:border-white/10 flex items-center gap-2.5 text-xs text-foreground/80 dark:text-gray-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>ভেরিফাইড একাডেমি ফ্যাকাল্টি</span>
                    </div>
                  </div>

                  {/* Social & Contact Channels */}
                  {(selectedTeacherModal.facebookUrl || selectedTeacherModal.youtubeUrl || selectedTeacherModal.email || selectedTeacherModal.phone) && (
                    <div className="pt-4 border-t border-foreground/10 dark:border-white/10 flex flex-wrap items-center gap-3">
                      {selectedTeacherModal.facebookUrl && (
                        <a
                          href={selectedTeacherModal.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <span>Facebook Profile</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {selectedTeacherModal.youtubeUrl && (
                        <a
                          href={selectedTeacherModal.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>YouTube Channel</span>
                        </a>
                      )}
                      {selectedTeacherModal.email && (
                        <a
                          href={`mailto:${selectedTeacherModal.email}`}
                          className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
