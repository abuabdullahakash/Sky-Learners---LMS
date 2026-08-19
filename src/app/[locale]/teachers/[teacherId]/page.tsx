"use client";

import { useEffect, useState, use, useRef } from 'react';
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
  Info
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

export default function TeacherPhysicsHuntersStorefrontPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
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

  // 4. Feature Cards
  const featureCards = config.featureCards && config.featureCards.length > 0 ? config.featureCards : [
    { id: 'f-1', icon: 'Video', title: 'ইন্টারঅ্যাক্টিভ লাইভ ক্লাস', desc: 'টপ টিচারদের সরাসরি ক্লাস ও রিয়েলটাইম ডাউট সলভিং' },
    { id: 'f-2', icon: 'FileText', title: 'ডেইলি ও উইকলি এক্সাম', desc: 'প্রতিদিনের ক্লাসের পর স্ট্যান্ডার্ড এমসিকিউ ও সিকিউ পরীক্ষা' },
    { id: 'f-3', icon: 'Trophy', title: 'ইনস্ট্যান্ট লিডারবোর্ড', desc: 'পরীক্ষা শেষেই পূর্ণাঙ্গ ফলাফল, র‍্যাংক ও সমাধান' },
    { id: 'f-4', icon: 'BookOpen', title: 'ক্লাস নোট ও প্র্যাকটিস শিট', desc: 'প্রতিটি অধ্যায়ের গোছানো লেকচার নোট ও দাগানো বই' },
    { id: 'f-5', icon: 'Users', title: 'ডেডিকেটেড ডাউট সল্ভিং', desc: 'যেকোনো প্রশ্নে মেন্টরদের সরাসরি সহায়তা ও আলোচনা' }
  ];

  // 5. Admission Info
  const admissionSteps = config.admissionSteps && config.admissionSteps.length > 0 ? config.admissionSteps : [
    { id: 's-1', stepNumber: 1, title: 'কোর্স নির্বাচন করুন', desc: 'আপনার ক্লাসের জন্য সঠিক কোর্সটি সিলেক্ট করে এনরোল বাটনে চাপুন।' },
    { id: 's-2', stepNumber: 2, title: 'পেমেন্ট সম্পন্ন করুন', desc: 'বিকাশ, নগদ বা কার্ডের মাধ্যমে ফি পরিশোধ করুন।' },
    { id: 's-3', stepNumber: 3, title: 'ক্লাস ও এক্সামে যুক্ত হোন', desc: 'ড্যাশবোর্ড থেকে তাৎক্ষণিক লাইভ ক্লাস ও এক্সামে অংশ নিন।' }
  ];

  // 6. About Section
  const aboutBio = config.aboutBio || profileData?.bio || 'আমাদের লক্ষ্য প্রতিটি শিক্ষার্থীকে কনসেপ্ট ক্লিয়ার করে মুখস্থবিদ্যার বাইরে গিয়ে বাস্তবসম্মতভাবে পড়ানো। অভিজ্ঞ মেন্টর ও উন্নত প্রযুক্তির সমন্বয়ে আমরা তৈরি করেছি সেরা প্ল্যাটফর্ম।';
  const aboutStats = config.aboutStats && config.aboutStats.length > 0 ? config.aboutStats : [
    { id: 'st-1', label: 'মোট শিক্ষার্থী', value: '১০,০০০+' },
    { id: 'st-2', label: 'সফলতার হার', value: '৯৯%' },
    { id: 'st-3', label: 'মোট ক্লাস লেকচার', value: `${courses.length > 0 ? courses.length * 20 : 100}+` }
  ];

  // 7. Contact
  const contactPhone = config.contactPhone || '01700000000';
  const contactWhatsapp = config.contactWhatsapp || '01700000000';
  const contactEmail = config.contactEmail || 'support@skylearners.com';
  const contactAddress = config.contactAddress || 'ঢাকা, বাংলাদেশ';

  // 8. Trust Banner
  const trustTitle = config.trustTitle || `বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতিতে ${profileData?.displayName || 'আমাদের একাডেমি'} একটি আস্থার নাম`;
  const trustSubtitle = config.trustSubtitle || 'স্বপ্নপূরণের এই যাত্রায় আজই যুক্ত হোন আমাদের প্রিমিয়াম কোর্সে।';
  const trustBtnText = config.trustBtnText || 'কোর্সে ভর্তি হোন';
  const trustTargetCourseId = config.trustTargetCourseId || courses[0]?.id || '';

  // 9. Photo Gallery
  const galleryPhotos = config.galleryPhotos && config.galleryPhotos.length > 0 ? config.galleryPhotos : [
    { id: 'g-1', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop', caption: 'সেমিনার সেশন' },
    { id: 'g-2', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop', caption: 'ডেইলি এক্সাম হল' },
    { id: 'g-3', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop', caption: 'অফলাইন ওরিয়েন্টেশন' },
    { id: 'g-4', imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop', caption: 'উদ্বোধনী ক্লাস' }
  ];

  // 10. Help Bar
  const helpBarTitle = config.helpBarTitle || 'সাহায্যের প্রয়োজন? আমরা পাশে আছি';
  const helpBarPhone = config.helpBarPhone || contactPhone;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(locale === 'bn' ? 'একাডেমি লিংক কপি করা হয়েছে!' : 'Academy link copied to clipboard!');
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Video': return Video;
      case 'FileText': return FileText;
      case 'Trophy': return Trophy;
      case 'BookOpen': return BookOpen;
      case 'Users': return Users;
      case 'Sparkles': return Sparkles;
      default: return Award;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!profileData) {
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
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white w-full max-w-full overflow-x-hidden pt-16 sm:pt-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO IMAGE CAROUSEL SLIDER (Physics Hunters Style)                     */}
      {/* ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-foreground/10 group">
          
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
      {/* 2. DUAL QUICK ACTION CARDS (পেইড কোর্স & ফ্রি কোর্স)                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Paid Courses Card */}
          <a
            href="#courses"
            className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 via-background to-orange-500/5 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-orange-500 tracking-wider">Premium Batches</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-orange-500 transition-colors">
                {quickCards.paidTitle}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/70 max-w-sm">
                {quickCards.paidSubtitle}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform flex-shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </a>

          {/* Free Courses Card */}
          <a
            href={quickCards.freeLink || '#courses'}
            className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-blue-500 tracking-wider">Free Resources</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-blue-500 transition-colors">
                {quickCards.freeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/70 max-w-sm">
                {quickCards.freeSubtitle}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform flex-shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </a>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. OUR COURSES WITH DYNAMIC CATEGORY TABS                                */}
      {/* ========================================================================= */}
      <section id="courses" className="py-16 sm:py-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'আপনার লক্ষ্যের জন্য সঠিক কোর্সটি বেছে নাও' : 'Find Your Dream Course'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {locale === 'bn' ? 'আমাদের কোর্সসমূহ' : 'Our Course Catalog'}
          </h2>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
          {customCategories.map((cat: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-foreground/[0.02] border border-foreground/10 rounded-3xl max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">
              {locale === 'bn' ? 'বর্তমানে কোনো কোর্স সক্রিয় নেই' : 'No Active Courses Found'}
            </h3>
            <p className="text-sm text-foreground/60 mt-1">
              {locale === 'bn' ? 'শীঘ্রই নতুন কোর্স প্রকাশ করা হবে।' : 'New courses will be published soon.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="group rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 shadow-md hover:shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="relative aspect-video w-full bg-foreground/10 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                      <BookOpen className="w-10 h-10 text-orange-500" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/60 mb-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="font-semibold">{course.instructorName}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-foreground/10 flex items-center justify-between">
                    <div>
                      {course.price && course.price > 0 ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-orange-500">
                            ৳{course.price}
                          </span>
                          {course.regularPrice && course.regularPrice > course.price && (
                            <span className="text-xs text-foreground/40 line-through">
                              ৳{course.regularPrice}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                          Free
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/courses/${course.id}`}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1"
                    >
                      <span>{locale === 'bn' ? 'বিস্তারিত' : 'View Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 4. একজন শিক্ষার্থীর পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন (Feature Grid)        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-foreground/[0.02] border-y border-foreground/10">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Full Preparation Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {config.featuresTitle || 'একজন শিক্ষার্থীর পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন'}
            </h2>
            <p className="text-foreground/70 text-sm sm:text-base mt-2">
              {config.featuresSubtitle || 'আমাদের প্রতিটি কোর্সে সেরা প্রস্তুতির জন্য রয়েছে সমন্বিত ফিচারসমূহ'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featureCards.map((feat: any) => {
              const IconComp = getIconComponent(feat.icon);
              return (
                <div 
                  key={feat.id}
                  className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between space-y-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground group-hover:text-orange-500 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ভর্তি তথ্য এখন এক জায়গায় (Admission Guide & Steps)                     */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left: Info & Steps */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                <Info className="w-3.5 h-3.5" />
                <span>Admission Guide</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                {config.admissionTitle || 'ভর্তি তথ্য এখন এক জায়গায়'}
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {config.admissionSubtitle || 'সহজ কয়েকটি ধাপে কোর্সে ভর্তি সম্পন্ন করুন এবং নিশ্চিত করুন আপনার শতভাগ প্রস্তুতি।'}
              </p>

              <div className="space-y-4 pt-2">
                {admissionSteps.map((step: any, idx: number) => (
                  <div key={step.id} className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{step.title}</h4>
                      <p className="text-xs text-gray-300 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {config.admissionNotice && (
                <p className="text-xs text-orange-300 font-semibold bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                  📢 {config.admissionNotice}
                </p>
              )}
            </div>

            {/* Right: Quick Action Widget */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6 text-center">
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
      {/* 6. আমাদের সম্পর্কে (About Us & Instructor Showcase)                       */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-foreground/[0.02] border-t border-foreground/10">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            
            {/* Instructor Portrait & Verified Badge */}
            <div className="text-center space-y-4">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl p-1.5 bg-background shadow-2xl border-2 border-orange-500/40 overflow-hidden">
                <img 
                  src={profileData?.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                  alt="Instructor" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-2xl font-black text-foreground">{profileData?.displayName || 'Instructor Name'}</h3>
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                </div>
                <p className="text-xs font-bold text-orange-500 mt-0.5">{profileData?.headline || 'Senior Instructor'}</p>
              </div>
            </div>

            {/* Biography & Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>About Us</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {config.aboutTitle || 'আমাদের সম্পর্কে'}
                </h2>
              </div>

              <p className="text-foreground/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {aboutBio}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-2">
                {aboutStats.map((st: any) => (
                  <div key={st.id} className="p-4 rounded-2xl bg-background border border-foreground/10 shadow-sm text-center">
                    <div className="text-xl sm:text-2xl font-black text-orange-500">{st.value}</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-foreground/60 mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. আমাদের সাথে যোগাযোগ করো (Contact Section)                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Phone className="w-3.5 h-3.5" />
            <span>Contact & Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {config.contactTitle || 'আমাদের সাথে যোগাযোগ করো'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">সরাসরি কল</h4>
            <p className="text-xs text-foreground/70">{contactPhone}</p>
          </div>

          <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">WhatsApp</h4>
            <p className="text-xs text-foreground/70">{contactWhatsapp}</p>
          </div>

          <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">ইমেইল</h4>
            <p className="text-xs text-foreground/70">{contactEmail}</p>
          </div>

          <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">ঠিকানা</h4>
            <p className="text-xs text-foreground/70">{contactAddress}</p>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 8. ট্রাস্ট ও কল-টু-অ্যাকশন ব্যানার (CTA Banner)                           */}
      {/* ========================================================================= */}
      <section className="py-8 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-orange-950 via-slate-900 to-indigo-950 border border-orange-500/30 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>{profileData?.displayName || 'Academy'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
              {trustTitle}
            </h2>
            <p className="text-sm text-gray-300 max-w-xl">
              {trustSubtitle}
            </p>
          </div>

          <div className="flex-shrink-0">
            {trustTargetCourseId ? (
              <Link
                href={`/courses/${trustTargetCourseId}`}
                className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-all shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span>{trustBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <a
                href="#courses"
                className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-all shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span>{trustBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. সাফল্যের পথে এগিয়ে চলেছে (Photo Gallery)                              */}
      {/* ========================================================================= */}
      {galleryPhotos.length > 0 && (
        <section className="py-16 sm:py-24 bg-black text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Hall of Fame & Memories</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {config.galleryTitle || `${profileData?.displayName || 'আমাদের'}-এর হাত ধরে সাফল্যের পথে এগিয়ে চলেছে`}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mt-2">
                {config.gallerySubtitle || 'ক্লাসরুম, সেমিনার ও শিক্ষার্থীদের আনন্দের মুহূর্তসমূহ'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryPhotos.map((photo: any) => (
                <div key={photo.id} className="relative group rounded-2xl overflow-hidden aspect-video border border-white/10 bg-white/5">
                  <img src={photo.imageUrl} alt={photo.caption || "Gallery"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white">{photo.caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 10. সাহায্যের প্রয়োজন? আমরা পাশে আছি (Support Strip & Footer)             */}
      {/* ========================================================================= */}
      <section className="py-8 bg-gradient-to-r from-orange-500/10 via-background to-orange-500/10 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">{helpBarTitle}</h4>
              <p className="text-xs text-foreground/60">যেকোনো প্রশ্ন বা তথ্যের জন্য কল করুন</p>
            </div>
          </div>

          <a
            href={`tel:${helpBarPhone}`}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{helpBarPhone}</span>
          </a>
        </div>
      </section>

      {/* Academy Footer */}
      <footer className="py-8 border-t border-foreground/10 text-center text-xs text-foreground/60 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {profileData?.displayName || 'Academy'}. Powered by SkyLearners LMS.</p>
        </div>
      </footer>

    </div>
  );
}
