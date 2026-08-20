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
  LayoutDashboard
} from 'lucide-react';
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

  // 8. Trust Banner
  const rawTrustTitle = config.trustTitle || 'বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতিতে';
  const cleanTrustTitle = rawTrustTitle.replace(/একটি\s*আস্থার\s*নাম/gi, '').trim();
  const trustHighlight = profileData?.displayName || 'Physics Hunters';
  const trustSubtitle = config.trustSubtitle || 'ভর্তি প্রস্তুতির শুরু হোক আজ থেকেই। সঠিক দিকনির্দেশনা ও প্রয়োজনীয় রিসোর্সের সাথে এগিয়ে যাও তোমার লক্ষ্যের দিকে।';
  const trustPaidBtnText = config.trustPaidBtnText || 'পেইড কোর্স';
  const trustFreeBtnText = config.trustFreeBtnText || 'ফ্রি কোর্স';
  const trustFreeLink = config.trustFreeLink || '#courses';
  const trustCornerImage = config.trustCornerImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop';

  // 9. Photo Gallery
  const defaultGalleryPhotos = [
    { id: 'g-1', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-2', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-3', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-4', imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-5', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-6', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop' }
  ];
  const galleryPhotos = config.galleryPhotos && config.galleryPhotos.length > 0 ? config.galleryPhotos : defaultGalleryPhotos;
  
  const buildMarqueeSet = (items: any[]) => {
    if (!items || items.length === 0) return [];
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

  const currentSlide = heroSliders[currentSlideIndex] || heroSliders[0];

  return (
    <div className={`min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white w-full max-w-full overflow-x-hidden ${isOwner ? 'pt-28 sm:pt-32' : 'pt-16 sm:pt-20'}`}>
      
      {/* ========================================================================= */}
      {/* 0. TEACHER OWNER ACTION BAR (When viewed by logged-in instructor)         */}
      {/* ========================================================================= */}
      {isOwner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-4 py-2.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2 border-b border-orange-400/40">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>শিক্ষক ভিউ</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-white/95 hidden md:inline">
              এটি আপনার পার্সোনাল একাডেমি ওয়েবসাইট ({profileData?.displayName || 'আপনার একাডেমি'})
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <Link
              href="/teacher-dashboard/home-builder"
              className="px-3.5 py-1.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-black transition-all shadow-md flex items-center gap-1.5 text-xs hover:scale-105"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>হোম বিল্ডারে এডিট করুন</span>
            </Link>

            <Link
              href="/teacher-dashboard"
              className="px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>টিচার ড্যাশবোর্ড</span>
            </Link>

            <Link
              href="/courses"
              className="px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সকল কোর্স ব্রাউজ</span>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO IMAGE CAROUSEL SLIDER (Physics Hunters Style)                     */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full rounded-2xl sm:rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-foreground/10 group">
          
          {/* Active Banner Image with Link */}
          {currentSlide.targetCourseId ? (
            <Link href={`/courses/${currentSlide.targetCourseId}`} className="w-full h-full block">
              <img 
                src={currentSlide.imageUrl} 
                alt={currentSlide.title || "Banner"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              />
            </Link>
          ) : (
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title || "Banner"} 
              className="w-full h-full object-cover"
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
              className="group relative min-h-[190px] sm:min-h-[210px] p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/[0.12] via-background to-orange-500/[0.04] border-2 border-orange-500/30 hover:border-orange-500/80 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1.5 flex items-center justify-between overflow-hidden"
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

              <div className="relative z-10 w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                <ArrowRight className="w-7 h-7" />
              </div>
            </a>

            {/* Free Courses Card */}
            <a
              href={quickCards.freeLink || '#courses'}
              className="group relative min-h-[190px] sm:min-h-[210px] p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.12] via-background to-blue-500/[0.04] border-2 border-blue-500/30 hover:border-blue-500/80 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1.5 flex items-center justify-between overflow-hidden"
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

              <div className="relative z-10 w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 flex-shrink-0">
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
              {locale === 'bn' ? 'আমাদের কোর্সসমূহ' : 'Our Course Catalog'}
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
                  ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 scale-105'
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
              <Link href="/teacher-dashboard/courses/create" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg">
                <span>+ নতুন কোর্স যুক্ত করুন</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="group rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-md"
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
      <section className="py-20 sm:py-28 bg-foreground/[0.02] border-y border-foreground/10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Ecosystem</span>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                {featuresTitle}
              </h2>
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
            </div>

            <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto">
              {featuresSubtitle}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">ইন্টারেক্টিভ লাইভ ও রেকর্ডেড ক্লাস</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                প্রতিটি বিষয়ের কনসেপ্ট ক্লিয়ার করতে রয়েছে সর্বোচ্চ মানের ভিডিও লেকচার ও লাইভ ডিসকাশন।
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">অনলাইন এক্সাম ও লিডারবোর্ড</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                নিয়মিত এমসিকিউ ও রিটেন পরীক্ষা দিয়ে দেশব্যাপী নিজের অবস্থান যাচাই করুন।
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">লেকচার শিট ও প্র্যাকটিস বুক</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                প্রতিটি চ্যাপ্টারের গোছানো পিডিএফ নোটস ও স্ট্যান্ডার্ড প্রশ্নব্যাংক।
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4 hover:border-orange-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">২৪/৭ ডাউট সলভিং</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                পড়াশোনায় যেকোনো সমস্যায় সরাসরি ডেডিকেটেড টিচারদের থেকে সমাধান পাওয়ার সুযোগ।
              </p>
            </div>

            <div className="md:col-span-3 p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">সেরা মেন্টরদের সাথে তোমার সাফল্য সুনিশ্চিত করো</h3>
                <p className="text-foreground/75 text-sm">হাজারো সফল শিক্ষার্থীর কাতারে যুক্ত হতে এখনই তোমার কোর্সে এনরোল করো।</p>
              </div>
              <a href="#courses" className="px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shrink-0">
                কোর্সসমূহ দেখুন
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ভর্তি নির্দেশিকা (Step-by-Step Admission Guide)                         */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] p-8 sm:p-14 bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Steps */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                  সহজ ৩ ধাপ
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-3">কীভাবে কোর্সে ভর্তি হবেন?</h2>
              </div>

              <div className="space-y-6">
                {admissionSteps.map((st: any, idx: number) => (
                  <div key={st.id || idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                      {st.stepNumber || idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-white">{st.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-300 mt-0.5 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Action Widget */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ভর্তি সংক্রান্ত যেকোনো তথ্যে</h3>
                <p className="text-xs text-gray-300 mt-1">আমাদের এক্সপার্ট কাউন্সিলরদের সাথে সরাসরি কথা বলুন</p>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${contactPhone}`}
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl"
                >
                  <Phone className="w-4 h-4" />
                  <span>কল করুন: {contactPhone}</span>
                </a>

                {contactWhatsapp && (
                  <a
                    href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp মেসেজ দিন</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.5 আমাদের শিক্ষক মণ্ডলী (Faculty Showcase for Institutions)              */}
      {/* ========================================================================= */}
      {isInstitution && teachersRoster.length > 0 && (
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-extrabold uppercase tracking-wider">
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

            <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto">
              দেশের সেরা বিশ্ববিদ্যালয় ও শীর্ষস্থানীয় প্রতিষ্ঠানসমূহের অভিজ্ঞ মেন্টরদের সাথে নাও তোমার সেরা প্রস্তুতি
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachersRoster.map((teacher: any, idx: number) => (
              <div
                key={teacher.id || idx}
                className="group rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 p-6 flex flex-col justify-between space-y-5 transition-all duration-300 shadow-md hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition-colors" />

                <div>
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full p-1 bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 shadow-xl mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-background bg-foreground/10">
                      <img
                        src={teacher.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(teacher.name)}
                        alt={teacher.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-orange-500 transition-colors line-clamp-1">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-bold text-orange-500 line-clamp-1">
                      {teacher.role || 'Senior Faculty'}
                    </p>
                    {teacher.university && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-foreground/60 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                        <span className="truncate">{teacher.university}</span>
                      </div>
                    )}
                  </div>

                  {teacher.subjects && (
                    <div className="mt-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[11px] font-semibold max-w-full truncate">
                        📚 {teacher.subjects}
                      </span>
                    </div>
                  )}

                  {teacher.bio && (
                    <p className="text-xs text-foreground/70 mt-3 text-center line-clamp-2 leading-relaxed">
                      {teacher.bio}
                    </p>
                  )}
                </div>

                {(teacher.facebookUrl || teacher.youtubeUrl) && (
                  <div className="pt-3 border-t border-foreground/10 flex items-center justify-center gap-2">
                    {teacher.facebookUrl && (
                      <a
                        href={teacher.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-blue-600 hover:text-white flex items-center justify-center text-foreground/70 transition-colors text-xs font-bold"
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
                        className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-red-600 hover:text-white flex items-center justify-center text-foreground/70 transition-colors text-xs"
                        title="YouTube"
                      >
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. আমাদের সম্পর্কে (About Section)                                         */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-foreground/[0.02] border-y border-foreground/10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12">
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              {aboutTitle}
            </h2>
            <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
          </div>

          <div className="p-8 sm:p-14 rounded-[3rem] bg-gradient-to-br from-orange-500/[0.04] via-background to-orange-500/[0.02] border border-foreground/10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              <div className="lg:col-span-5 text-center space-y-4">
                <div className="relative w-60 h-60 sm:w-72 sm:h-72 mx-auto rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-orange-500/20 p-3 flex items-center justify-center shadow-2xl">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-background bg-background shadow-inner">
                    <img 
                      src={aboutPhoto} 
                      alt={profileData?.displayName || "Founder"} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-background/95 border border-foreground/15 shadow-md text-[11px] font-extrabold text-orange-500 backdrop-blur-md flex items-center gap-1.5">
                    <span>🏆</span>
                    <span>চিফ মেন্টর</span>
                  </div>
                </div>

                <div className="inline-block px-8 py-3 rounded-2xl bg-background border border-foreground/10 shadow-lg text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="text-lg font-black text-foreground">{profileData?.displayName || 'Instructor Name'}</h4>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  </div>
                  <p className="text-xs text-orange-500 font-bold mt-0.5">
                    {founderRole}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-extrabold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" />
                  <span>স্বপ্ন ছোঁয়ার প্রস্তুতি</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-[1.25]">
                  {aboutHeadline}
                </h3>

                <p className="text-foreground/75 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {aboutBio}
                </p>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4">
                  {aboutStats.map((st: any) => (
                    <div key={st.id} className="p-4 sm:p-5 rounded-2xl bg-background border border-foreground/10 shadow-sm text-center">
                      <div className="text-xl sm:text-2xl md:text-3xl font-black text-orange-500">{st.value}</div>
                      <div className="text-[11px] sm:text-xs font-bold text-foreground/60 mt-1 uppercase tracking-wider">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. যোগাযোগ ও সোশ্যাল চ্যানেল (Contact Section)                            */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-5 relative space-y-6">
            {contactImage && (
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-64 sm:h-72 -mb-28 sm:-mb-32 z-0 pointer-events-none">
                <img 
                  src={contactImage} 
                  alt="Contact Representative" 
                  className="w-full h-full object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] drop-shadow-2xl" 
                />
              </div>
            )}

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-orange-500" />
                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">২৪/৭ সাপোর্ট</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                আমাদের সাথে <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                  যোগাযোগ করো
                </span>
              </h2>

              <p className="text-foreground/75 text-sm sm:text-base mt-2 leading-relaxed font-medium">
                {profileData?.displayName || 'আমাদের'}-এর সাথে যুক্ত থাকো, নতুন ক্লাস, আপডেট ও প্রয়োজনীয় তথ্য সবার আগে পেতে।
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`tel:${contactPhone}`}
              className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/40 transition-all shadow-sm hover:shadow-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-orange-500 transition-colors">
                    সরাসরি কল করো
                  </h4>
                  <p className="text-xs text-foreground/60 mt-0.5">{contactPhone}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {contactWhatsapp && (
              <a
                href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-500 transition-colors">
                      WhatsApp মেসেজ
                    </h4>
                    <p className="text-xs text-foreground/60 mt-0.5">{contactWhatsapp}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            )}

            {contactFacebookGroup && (
              <a
                href={contactFacebookGroup}
                target="_blank"
                rel="noreferrer"
                className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-blue-500/40 transition-all shadow-sm hover:shadow-xl flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-500 transition-colors">
                      Facebook গ্রুপ
                    </h4>
                    <p className="text-xs text-foreground/60 mt-0.5">কমিউনিটিতে যুক্ত হও</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            )}

            <a
              href={`mailto:${contactEmail}`}
              className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-500 transition-colors">
                    Email-এ যোগাযোগ করো
                  </h4>
                  <p className="text-xs text-foreground/60 mt-0.5">{contactEmail}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ট্রাস্ট ও কল-টু-অ্যাকশন ব্যানার                                         */}
      {/* ========================================================================= */}
      <section className="py-12 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] p-8 sm:p-12 lg:p-14 bg-gradient-to-r from-orange-500/[0.08] via-background to-amber-500/[0.05] border-2 border-orange-500/30 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-6 flex-1 relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-[1.2] tracking-tight">
              {cleanTrustTitle}{' '}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                {trustHighlight}
              </span>{' '}
              একটি আস্থার নাম
            </h2>

            <p className="text-foreground/75 text-sm sm:text-base leading-relaxed font-medium">
              {trustSubtitle}
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <a
                href="#courses"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 hover:scale-105 transition-all"
              >
                {trustPaidBtnText}
              </a>

              <a
                href={trustFreeLink}
                className="px-8 py-3.5 rounded-2xl bg-background hover:bg-foreground/5 border-2 border-orange-500/30 hover:border-orange-500 text-foreground font-black text-sm transition-all hover:scale-105"
              >
                {trustFreeBtnText}
              </a>
            </div>
          </div>

          <div className="relative z-10 lg:w-96 flex-shrink-0 flex items-center justify-center">
            <div className="relative w-64 sm:w-80 aspect-[4/4.5] rounded-3xl overflow-hidden shadow-2xl border-4 border-background bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent">
              <img 
                src={trustCornerImage} 
                alt="Student Success" 
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. ফটো গ্যালারি ও সাফল্যের মুহূর্ত (Continuous Dual-Row Seamless Marquee)   */}
      {/* ========================================================================= */}
      {galleryPhotos.length > 0 && (
        <section className="py-20 sm:py-28 bg-black text-white border-t border-white/10 overflow-hidden">
          
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 mb-14 text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-orange-500" />
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {profileData?.displayName || 'Physics Hunters'}-এর হাত ধরে{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  সাফল্যের পথে এগিয়ে চলেছে
                </span>
              </h2>
              <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-orange-500" />
            </div>

            <p className="text-gray-400 text-xs sm:text-sm font-medium">
              {config.gallerySubtitle || 'আমাদের শিক্ষার্থীদের অর্জন ও স্মরণীয় মুহূর্তগুলো'}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="w-full overflow-hidden flex">
              <div className="animate-marquee-left flex gap-4 sm:gap-6 py-2">
                {row1Loop.map((photo: any, idx: number) => (
                  <div 
                    key={`row1-${idx}`} 
                    className="relative w-64 sm:w-80 md:w-96 aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl flex-shrink-0 group"
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
                    className="relative w-64 sm:w-80 md:w-96 aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl flex-shrink-0 group"
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
        <div className="relative rounded-[2rem] p-6 sm:p-8 bg-background border border-foreground/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-blue-500" />

          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-black text-foreground">
                {helpBarTitle}{' '}
                <span className="text-orange-500 font-black">আমরা পাশে আছি</span>
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
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
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
              className="px-5 py-3 rounded-2xl bg-background hover:bg-foreground/5 border-2 border-foreground/15 text-foreground font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
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

    </div>
  );
}
