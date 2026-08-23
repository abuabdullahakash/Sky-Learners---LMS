"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Award, 
  Star, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Video, 
  Phone, 
  Mail, 
  MessageCircle, 
  ArrowRight, 
  Edit3, 
  CheckCircle2,
  Globe,
  Flame,
  Compass,
  Trophy,
  Play,
  Zap,
  Target,
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  Mountain,
  Send
} from 'lucide-react';
import { VideoModal } from '@/components/ui/VideoModal';

export default function AboutPage() {
  const { user, userData, loading: authLoading } = useAuth();

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');

  useEffect(() => {
    if (authLoading) return;

    const fetchAboutData = async () => {
      setLoading(true);
      try {
        if (user && isTeacher) {
          // Fetch teacher's profile and custom config
          const docRef = doc(db, 'teacherProfiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTeacherProfile(docSnap.data());
          }

          // Count teacher's published courses
          const coursesQ = query(collection(db, 'courses'), where('teacherId', '==', user.uid), where('isPublished', '==', true));
          const coursesSnap = await getDocs(coursesQ);
          setCoursesCount(coursesSnap.size);
        }
      } catch (err) {
        console.error("Error fetching about page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [user, isTeacher, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================================
  // CASE 1: LOGGED IN TEACHER / ACADEMY ABOUT PAGE (Shikho Style)
  // =========================================================================
  if (user && isTeacher) {
    const config = teacherProfile?.homePageConfig || {};
    const isInstitution = teacherProfile?.type === 'institution';
    const displayName = teacherProfile?.displayName || user.displayName || 'আমাদের একাডেমি';
    const headline = teacherProfile?.headline || config.aboutHeadline || 'স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছি আমরা';
    const bio = config.aboutBio || teacherProfile?.bio || 'অনলাইন বিশ্ববিদ্যালয় ও বোর্ড পরীক্ষার প্রস্তুতির জন্য নিবেদিতপ্রাণ একটি আধুনিক একাডেমি। মানসম্মত লেকচার, নিয়মিত পরীক্ষা ও আন্তরিক মেন্টরশিপের মাধ্যমে শিক্ষার্থীদের স্বপ্ন পূরণে আমরা সর্বদা পাশে আছি।';
    const founderTitle = config.founderTitle || (isInstitution ? 'প্রতিষ্ঠাতা ও পরিচালক' : 'চিফ মেন্টর ও পরিচালক');
    const founderPhoto = config.aboutPhoto || teacherProfile?.profilePhoto || user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid;
    const teachersRoster = isInstitution ? (teacherProfile?.teachersRoster || []) : [];
    
    // Moments & Gallery Images
    const momentsList = config.trustSliders && Array.isArray(config.trustSliders) && config.trustSliders.length > 0 
      ? config.trustSliders 
      : [
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
        ];

    // Story Team Image
    const storyImage = config.coverPhoto || teacherProfile?.coverPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop';
    
    // Promo Video
    const promoVideoUrl = config.introVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white pt-20">
        
        {/* ========================================================================= */}
        {/* 1. TOP HERO BANNER WITH BACKGROUND PHOTO & OVERLAY (Shikho Exact Match)   */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center justify-center border-b border-foreground/10">
          
          {/* Full Background Team Photo */}
          <div className="absolute inset-0 z-0">
            <img 
              src={storyImage} 
              alt="Team Background" 
              className="w-full h-full object-cover object-center scale-105 filter brightness-90"
            />
            {/* Smooth Gradient Overlay: Deep Rich Gradient matching Site Theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/80 to-[#09090b]/40 sm:from-[#09090b]/95 sm:via-[#1c120c]/85 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Slogan & Narrative */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] drop-shadow-md">
                  শিখবো, <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">জিতবো</span>
                </h1>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow">
                  {displayName}, দেশজুড়ে সবার জন্য মানসম্মত পড়াশোনা নিশ্চিত করতে অভিজ্ঞ মেন্টর এবং অত্যাধুনিক প্রযুক্তির সাহায্যে আমরা গড়ে তুলেছি সহজে শেখার এবং সহজে জেতার এক নতুন দুনিয়া!
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/courses"
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>কোর্সগুলো দেখুন</span>
                  </Link>

                  <Link
                    href="/teacher-dashboard/home-builder"
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-orange-400" />
                    <span>পেজ সাজান</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Video Card with Circular Play Button */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div 
                  onClick={() => {
                    setVideoModalUrl(promoVideoUrl);
                    setIsVideoModalOpen(true);
                  }}
                  className="w-full max-w-sm sm:max-w-md aspect-[16/10] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 hover:border-orange-400 shadow-2xl relative group cursor-pointer transition-all duration-300 hover:scale-[1.03]"
                >
                  <img 
                    src={storyImage} 
                    alt="Promo" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  />
                  
                  {/* Subtle White / Dark Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />

                  {/* Centered Play Button (Matching Shikho Design) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300 ring-8 ring-white/30">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-orange-600 translate-x-0.5" />
                    </div>
                  </div>

                  {/* Corner caption badge */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-black text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      আমি শিখবো, আমি জিতবো
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. "আমাদের গল্প" (OUR STORY / THE JOURNEY)                                 */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Photo */}
            <div className="lg:col-span-6">
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-orange-500/30 shadow-2xl group">
                <img 
                  src={storyImage} 
                  alt="Our Journey" 
                  className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-black uppercase tracking-wider mb-1">
                    গল্পের শুরু
                  </div>
                  <h3 className="font-black text-lg sm:text-xl">{displayName} পরিবার</h3>
                </div>
              </div>
            </div>

            {/* Right Story Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                  আমাদের <span className="text-orange-500">গল্প</span>
                </h2>
                <div className="h-1 w-20 bg-orange-500 rounded-full mt-2" />
              </div>

              <div className="space-y-4 text-foreground/80 text-sm sm:text-base leading-relaxed">
                <p>
                  ২০২০ সালের শুরুতে একদল স্বপ্নবাজ শিক্ষকের হাত ধরে আমাদের এই শিক্ষাযাত্রার সূচনা। আমাদের মূল লক্ষ্য ছিল বাংলাদেশের প্রচলিত মুখস্থভিত্তিক পড়াশোনার বাইরে গিয়ে প্রতিটি বিষয়ের গভীরে গিয়ে কনসেপ্ট ভিত্তিক ও প্রাণবন্ত পাঠদান নিশ্চিত করা।
                </p>
                <p>
                  গত কয়েক বছরে হাজারো শিক্ষার্থীকে তাদের বোর্ড পরীক্ষা এবং শীর্ষস্থানীয় বিশ্ববিদ্যালয়ে ভর্তির জন্য সফলভাবে গাইড করেছি আমরা। আধুনিক ডিজিটাল ক্লাসরুম, নিয়মিত লাইভ ও রেকর্ডেড ক্লাস এবং ডেইলি এক্সাম সিস্টেমের মাধ্যমে প্রতিটি শিক্ষার্থীর দুর্বলতা দূর করে তাদের আত্মবিশ্বাস বহুগুণ বৃদ্ধি করাই আমাদের প্রতিদিনের সাধনা।
                </p>
                <p className="font-semibold text-foreground">
                  আমরা বিশ্বাস করি—সঠিক দিকনির্দেশনা ও আন্তরিক চেষ্টা থাকলে যেকোনো শিক্ষার্থী তার স্বপ্নের শীর্ষ চূড়ায় পৌঁছাতে পারে।
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-foreground/10">
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-orange-500">{coursesCount || 5}+</div>
                  <div className="text-[11px] sm:text-xs text-foreground/70 font-semibold mt-0.5">কোর্সসমূহ</div>
                </div>
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-orange-500">১,২০০+</div>
                  <div className="text-[11px] sm:text-xs text-foreground/70 font-semibold mt-0.5">সফল শিক্ষার্থী</div>
                </div>
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-orange-500">৯৯%</div>
                  <div className="text-[11px] sm:text-xs text-foreground/70 font-semibold mt-0.5">সন্তুষ্টি রেটিং</div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. "আমাদের মূল ভিত্তি" (CORE VALUES / 6 PILLARS - Shikho Style)           */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-foreground/[0.02] border-y border-foreground/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                আমাদের <span className="text-orange-500">মূল ভিত্তি</span>
              </h2>
              <div className="h-1 w-24 bg-orange-500 rounded-full mx-auto" />
              <p className="text-foreground/70 text-sm sm:text-base font-medium pt-2">
                যে আদর্শ ও মূলনীতির ওপর দাঁড়িয়ে আমাদের প্রতিটি ক্লাস ও সিদ্ধান্ত
              </p>
            </div>

            {/* 6 Core Value Posters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Card 1: LEARNER FIRST */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-rose-500/10 via-background to-orange-500/5 border border-rose-500/20 shadow-lg hover:border-rose-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      LEARNER FIRST
                    </h3>
                    <p className="text-xs font-bold text-rose-500 mt-0.5">শিক্ষার্থীই সবার আগে</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  আমাদের প্রতিটি কোর্স ও সিদ্ধান্তের কেন্দ্রে থাকে শিক্ষার্থীর সর্বোচ্চ সুবিধা ও তার ভবিষ্যৎ সাফল্যের নিশ্চয়তা।
                </p>
              </div>

              {/* Card 2: EXECUTE AT SPEED */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/5 border border-amber-500/20 shadow-lg hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      EXECUTE AT SPEED
                    </h3>
                    <p className="text-xs font-bold text-amber-500 mt-0.5">গতি ও নিখুঁত পাঠদান</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  সিলেবাস দ্রুত ও নিখুঁতভাবে শেষ করা এবং যেকোনো প্রশ্ন বা ডাউট তাৎক্ষণিকভাবে সমাধান করাই আমাদের অঙ্গীকার।
                </p>
              </div>

              {/* Card 3: GROW 100X */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/5 border border-blue-500/20 shadow-lg hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      GROW 100X
                    </h3>
                    <p className="text-xs font-bold text-blue-500 mt-0.5">শতগুণ প্রবৃদ্ধি ও রূপান্তর</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  একজন সাধারণ শিক্ষার্থীকেও ধারাবাহিক চর্চা ও সঠিক গাইডলাইনের মাধ্যমে মেধার শীর্ষে পৌঁছে দেওয়ার মানসিকতা।
                </p>
              </div>

              {/* Card 4: SEIZE OWNERSHIP */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 border border-emerald-500/20 shadow-lg hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      SEIZE OWNERSHIP
                    </h3>
                    <p className="text-xs font-bold text-emerald-500 mt-0.5">পূর্ণ দায়বদ্ধতা ও দায়িত্বশীলতা</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  শিক্ষার্থীদের প্রতিটি পরীক্ষার ফলাফল ও প্রস্তুতির দায় আমরা নিজের কাঁধে তুলে নিই এবং শেষ পর্যন্ত পাশে থাকি।
                </p>
              </div>

              {/* Card 5: STRIVE FOR EXCELLENCE */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-orange-500/10 via-background to-amber-500/5 border border-orange-500/20 shadow-lg hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mountain className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      STRIVE FOR EXCELLENCE
                    </h3>
                    <p className="text-xs font-bold text-orange-500 mt-0.5">শ্রেষ্ঠত্বের নিরন্তর সাধনা</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  লেকচার শিট, পরীক্ষা পদ্ধতি কিংবা ভিডিও কোয়ালিটি—প্রতিটি ক্ষেত্রে সেরা মান নিশ্চিত করাই আমাদের লক্ষ্য।
                </p>
              </div>

              {/* Card 6: THINK DIFFERENT */}
              <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-500/10 via-background to-indigo-500/5 border border-purple-500/20 shadow-lg hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                      THINK DIFFERENT
                    </h3>
                    <p className="text-xs font-bold text-purple-500 mt-0.5">ভিন্ন ও আধুনিক দৃষ্টিভঙ্গি</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  গতানুগতিক নিয়মের বাইরে গিয়ে বাস্তব উদাহরণ ও সহজ টেকনিকের সাহায্যে কঠিন বিষয়গুলোকে সহজবোধ্য করে তোলা।
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. "টিম ও ক্লাসরুম মোমেন্টস" (TEAM & MOMENTS - Shikho Style)              */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              {displayName} <span className="text-orange-500">পরিবার</span>
            </h2>
            <div className="h-1 w-24 bg-orange-500 rounded-full mx-auto" />
            <p className="text-foreground/70 text-sm sm:text-base font-medium pt-2">
              অভিজ্ঞ শিক্ষকমণ্ডলী, একাডেমি মেন্টরস এবং টেকনোলজি টিমের সম্মিলিত প্রচেষ্টা
            </p>
          </div>

          {/* Large Team Hero Card */}
          <div className="rounded-[2.5rem] overflow-hidden border-2 border-foreground/10 bg-zinc-950 shadow-2xl relative aspect-[16/9] sm:aspect-[21/9] max-w-5xl mx-auto">
            <img 
              src={storyImage} 
              alt="Team" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-orange-400">Core Team & Faculty</div>
                <h3 className="text-xl sm:text-3xl font-black">শিক্ষার্থীদের স্বপ্ন পূরণে নিবেদিত একদল মেন্টর</h3>
              </div>
            </div>
          </div>

          {/* Candid Moments Grid Thumbnails */}
          {momentsList.length > 0 && (
            <div className="space-y-4">
              <div className="text-center text-xs font-extrabold uppercase tracking-wider text-orange-500">
                স্মরণীয় কিছু মুহূর্ত ও ক্লাসরুম
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {momentsList.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-foreground/10 shadow-sm group">
                    <img 
                      src={imgUrl} 
                      alt={`Moment ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* 5. "ফাউন্ডার ও চিফ মেন্টর প্রোফাইল" (FOUNDER SPOTLIGHT - Shikho Style)     */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-background via-orange-500/5 to-background border-t border-foreground/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="p-8 sm:p-14 rounded-[3rem] bg-gradient-to-br from-foreground/[0.04] via-background to-foreground/[0.02] border-2 border-orange-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
                
                {/* Founder Photo with Stylized Curve */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="relative">
                    <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-[2.5rem] overflow-hidden border-4 border-orange-500 shadow-2xl bg-neutral-900 group">
                      <img 
                        src={founderPhoto} 
                        alt={displayName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl shadow-xl">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Founder Details & Message */}
                <div className="md:col-span-7 space-y-5 text-center md:text-left">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-black uppercase tracking-wider mb-2">
                      {founderTitle}
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black text-foreground">
                      {displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 font-semibold mt-1">
                      শীর্ষ একাডেমি প্রশিক্ষক ও কনসেপ্ট মেন্টর
                    </p>
                  </div>

                  <p className="text-foreground/80 text-sm sm:text-base leading-relaxed whitespace-pre-line italic">
                    "{bio}"
                  </p>

                  {/* Social Connect Links */}
                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {config.contactFacebookPage && (
                      <a href={config.contactFacebookPage} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 transition-all" title="Facebook">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {config.contactYoutube && (
                      <a href={config.contactYoutube} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 transition-all" title="YouTube">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {config.contactWhatsapp && (
                      <a href={`https://wa.me/${config.contactWhatsapp}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 transition-all" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    {config.contactEmail && (
                      <a href={`mailto:${config.contactEmail}`} className="p-2.5 rounded-xl bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white border border-orange-600/20 transition-all" title="Email">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. BOTTOM CALL-TO-ACTION (CTA)                                            */}
        {/* ========================================================================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-16 rounded-[3rem] bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-2xl relative overflow-hidden space-y-6">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                আজই তোমার প্রস্তুতি শুরু করো
              </h2>
              <p className="text-orange-100 text-sm sm:text-base">
                দেশসেরা দিকনির্দেশনায় ঘরে বসেই নাও শতভাগ প্রস্তুতি এবং নিজেকে এগিয়ে রাখো সবার চেয়ে।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/courses"
                  className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm hover:bg-orange-50 transition-all shadow-xl hover:scale-105"
                >
                  সকল কোর্সসমূহ দেখুন
                </Link>
                {config.contactPhone && (
                  <a
                    href={`tel:${config.contactPhone}`}
                    className="px-8 py-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>হেল্পলাইনে কল দিন</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Video Modal Component */}
        <VideoModal 
          isOpen={isVideoModalOpen} 
          onClose={() => setIsVideoModalOpen(false)} 
          videoUrl={videoModalUrl} 
        />

      </div>
    );
  }

  // =========================================================================
  // CASE 2: GUEST / STUDENT (SkyLearners Platform Overview)
  // =========================================================================
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background text-foreground selection:bg-orange-500 selection:text-white">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Platform Hero */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>SkyLearners LMS প্ল্যাটফর্ম সম্পর্কে</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            বাংলাদেশের শিক্ষা ব্যবস্থাকে <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">স্মার্ট ও সহজ</span> করার প্রয়াস
          </h1>

          <p className="text-foreground/75 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            স্কাই লার্নার্স (SkyLearners) এমন একটি আধুনিক এডুকেশন হাব—যেখানে দেশসেরা শিক্ষক, স্বনামধন্য কোচিং সেন্টার এবং হাজারো শিক্ষার্থী একই ছাদের নিচে যুক্ত হয়ে শিক্ষা গ্রহণ ও পরিচালনা করতে পারে।
          </p>
        </div>

        {/* Mission & Vision Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের মিশন (Mission)</h2>
            <p className="text-foreground/75 leading-relaxed text-sm sm:text-base">
              প্রত্যেক শিক্ষার্থীর হাতের নাগালে মানসম্মত শিক্ষা পৌঁছে দেওয়া এবং প্রতিটি শিক্ষক ও একাডেমিকে নিজস্ব ব্র্যান্ডেড ডিজিটাল একাডেমি পরিচালনার অত্যাধুনিক প্রযুক্তি ও টুলস প্রদান করা।
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের ভিশন (Vision)</h2>
            <p className="text-foreground/75 leading-relaxed text-sm sm:text-base">
              বাংলাদেশের এক নম্বর অল-ইন-ওয়ান এডুকেটর ও লার্নার্স ইকোসিস্টেম তৈরি করা, যা একাডেমিক পরীক্ষা থেকে শুরু করে ক্যারিয়ার স্কিল পর্যন্ত প্রতিটি ধাপে সাফল্যের নিশ্চয়তা দেয়।
            </p>
          </div>
        </div>

        {/* Platform Live Stats */}
        <div className="py-12 px-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-orange-500 mb-1">১০,০০০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">সক্রিয় শিক্ষার্থী</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-amber-500 mb-1">৫০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">ভেরিফাইড শিক্ষক ও কোচিং</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-purple-500 mb-1">১০০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">অনলাইন ও অফলাইন কোর্স</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-500 mb-1">৯৯%</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">ইতিবাচক ফিডব্যাক</div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-14 rounded-[2.5rem] bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-center shadow-2xl relative overflow-hidden space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black">আজই আপনার যাত্রা শুরু করুন</h2>
            <p className="text-orange-100 text-sm sm:text-base">নতুন কিছু শিখুন অথবা একজন শিক্ষক হিসেবে আপনার একাডেমি গড়ে তুলুন।</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                href="/courses"
                className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
              >
                কোর্স এক্সপ্লোর করুন
              </Link>
              <Link 
                href="/register"
                className="px-8 py-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-sm transition-all shadow-lg hover:scale-105"
              >
                ফ্রি একাউন্ট খুলুন
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
