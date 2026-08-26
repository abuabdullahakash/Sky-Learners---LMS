"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Building2, 
  Users, 
  UserCheck,
  UserPlus,
  Sparkles, 
  Sparkle,
  Award, 
  Star, 
  GraduationCap, 
  BookOpen, 
  Bookmark,
  BookMarked,
  Library,
  School,
  Pencil,
  ShieldCheck, 
  Shield,
  ShieldAlert,
  Lock,
  Key,
  Video, 
  Phone, 
  Mail, 
  MessageCircle, 
  MessagesSquare,
  ArrowRight, 
  Edit3, 
  CheckCircle2, 
  BadgeCheck,
  FileCheck,
  Globe, 
  Flame, 
  Compass, 
  Trophy, 
  Medal,
  Crown,
  Gem,
  Play, 
  Zap, 
  Target, 
  Crosshair,
  Lightbulb, 
  Brain,
  Atom,
  Microscope,
  Dna,
  Binary,
  Cpu,
  Orbit,
  Puzzle,
  HeartHandshake, 
  Heart,
  HeartPulse,
  Smile,
  ThumbsUp,
  Handshake,
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Timer,
  FastForward,
  Footprints,
  Mountain, 
  Send, 
  Share2,
  Megaphone,
  Briefcase,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Radio,
  Tv,
  Terminal,
  Database,
  Server,
  Wifi,
  Cloud,
  Bot,
  Code,
  FileText,
  FileCode,
  FolderGit2,
  Layers,
  Boxes,
  Palette,
  Brush,
  Camera,
  Music,
  Film,
  Gift,
  Coffee,
  Sun,
  Anchor,
  Eye,
  ChevronLeft, 
  ChevronRight,
  Quote,
  Rocket,
  Check,
  type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoModal } from '@/components/ui/VideoModal';

export interface ValueCardItem {
  id: string;
  icon: string;
  customSvg?: string;
  title: string;
  subtitle: string;
  desc: string;
  colorTheme?: string;
}

export const DEFAULT_VALUE_CARDS: ValueCardItem[] = [
  {
    id: 'val-1',
    icon: 'HeartHandshake',
    title: 'LEARNER FIRST',
    subtitle: 'শিক্ষার্থীই সবার আগে',
    desc: 'আমাদের প্রতিটি কোর্স ও সিদ্ধান্তের কেন্দ্রে থাকে শিক্ষার্থীর সর্বোচ্চ সুবিধা ও তার ভবিষ্যৎ সাফল্যের নিশ্চয়তা।',
    colorTheme: 'rose'
  },
  {
    id: 'val-2',
    icon: 'Zap',
    title: 'EXECUTE AT SPEED',
    subtitle: 'গতি ও নিখুঁত পাঠদান',
    desc: 'সিলেবাস দ্রুত ও নিখুঁতভাবে শেষ করা এবং যেকোনো প্রশ্ন বা ডাউট তাৎক্ষণিকভাবে সমাধান করাই আমাদের অঙ্গীকার।',
    colorTheme: 'amber'
  },
  {
    id: 'val-3',
    icon: 'TrendingUp',
    title: 'GROW 100X',
    subtitle: 'শতগুণ প্রবৃদ্ধি ও রূপান্তর',
    desc: 'একজন সাধারণ শিক্ষার্থীকেও ধারাবাহিক চর্চা ও সঠিক গাইডলাইনের মাধ্যমে মেধার শীর্ষে পৌঁছে দেওয়ার মানসিকতা।',
    colorTheme: 'blue'
  },
  {
    id: 'val-4',
    icon: 'ShieldCheck',
    title: 'SEIZE OWNERSHIP',
    subtitle: 'পূর্ণ দায়বদ্ধতা ও দায়িত্বশীলতা',
    desc: 'শিক্ষার্থীদের প্রতিটি পরীক্ষার ফলাফল ও প্রস্তুতির দায় আমরা নিজের কাঁধে তুলে নিই এবং শেষ পর্যন্ত পাশে থাকি।',
    colorTheme: 'emerald'
  },
  {
    id: 'val-5',
    icon: 'Mountain',
    title: 'STRIVE FOR EXCELLENCE',
    subtitle: 'শ্রেষ্ঠত্বের নিরন্তর সাধনা',
    desc: 'লেকচার শিট, পরীক্ষা পদ্ধতি কিংবা ভিডিও কোয়ালিটি—প্রতিটি ক্ষেত্রে সেরা মান নিশ্চিত করাই আমাদের লক্ষ্য।',
    colorTheme: 'orange'
  },
  {
    id: 'val-6',
    icon: 'Lightbulb',
    title: 'THINK DIFFERENT',
    subtitle: 'ভিন্ন ও আধুনিক দৃষ্টিভঙ্গি',
    desc: 'গতানুগতিক নিয়মের বাইরে গিয়ে বাস্তব উদাহরণ ও সহজ টেকনিকের সাহায্যে কঠিন বিষয়গুলোকে সহজবোধ্য করে তোলা।',
    colorTheme: 'purple'
  }
];

export const VALUE_ICON_MAP: Record<string, LucideIcon> = {
  // Values & Emotions
  HeartHandshake, Heart, HeartPulse, Smile, ThumbsUp, Handshake, Sun, Flame, Sparkles, Sparkle,
  // Speed & Action
  Zap, Rocket, Activity, Gauge, Timer, FastForward, Compass, Footprints,
  // Growth & Excellence
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Target, Crosshair, Award, Trophy, Medal, Crown, Gem, Mountain,
  // Trust & Security
  ShieldCheck, Shield, ShieldAlert, Lock, Key, CheckCircle2, BadgeCheck, FileCheck, Anchor, Eye,
  // Education & Knowledge
  BookOpen, GraduationCap, Bookmark, BookMarked, Library, School, Pencil, FileText, FileCode, FolderGit2, Layers, Boxes,
  // Science & Ideas
  Brain, Lightbulb, Atom, Microscope, Dna, Binary, Cpu, Orbit, Puzzle,
  // Tech & Media
  Laptop, Monitor, Smartphone, Video, Globe, Code, Headphones, Radio, Tv, Terminal, Database, Server, Wifi, Cloud, Bot,
  // Community & Work
  Users, UserCheck, UserPlus, MessagesSquare, MessageCircle, Briefcase, Building2, Megaphone, Share2, Send,
  // Lifestyle & Creative
  Palette, Brush, Camera, Music, Film, Gift, Coffee, Star
};

export const COLOR_THEMES: Record<string, {
  cardBg: string;
  badgeBg: string;
  badgeText: string;
}> = {
  rose: {
    cardBg: 'from-rose-500/10 via-background to-orange-500/5 border-rose-500/20 hover:border-rose-500/50',
    badgeBg: 'bg-rose-500/15 text-rose-500',
    badgeText: 'text-rose-500'
  },
  amber: {
    cardBg: 'from-amber-500/10 via-background to-orange-500/5 border-amber-500/20 hover:border-amber-500/50',
    badgeBg: 'bg-amber-500/15 text-amber-500',
    badgeText: 'text-amber-500'
  },
  blue: {
    cardBg: 'from-blue-500/10 via-background to-cyan-500/5 border-blue-500/20 hover:border-blue-500/50',
    badgeBg: 'bg-blue-500/15 text-blue-500',
    badgeText: 'text-blue-500'
  },
  emerald: {
    cardBg: 'from-emerald-500/10 via-background to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/50',
    badgeBg: 'bg-emerald-500/15 text-emerald-500',
    badgeText: 'text-emerald-500'
  },
  orange: {
    cardBg: 'from-orange-500/10 via-background to-amber-500/5 border-orange-500/20 hover:border-orange-500/50',
    badgeBg: 'bg-orange-500/15 text-orange-500',
    badgeText: 'text-orange-500'
  },
  purple: {
    cardBg: 'from-purple-500/10 via-background to-indigo-500/5 border-purple-500/20 hover:border-purple-500/50',
    badgeBg: 'bg-purple-500/15 text-purple-500',
    badgeText: 'text-purple-500'
  },
  cyan: {
    cardBg: 'from-cyan-500/10 via-background to-blue-500/5 border-cyan-500/20 hover:border-cyan-500/50',
    badgeBg: 'bg-cyan-500/15 text-cyan-500',
    badgeText: 'text-cyan-500'
  },
  indigo: {
    cardBg: 'from-indigo-500/10 via-background to-pink-500/5 border-indigo-500/20 hover:border-indigo-500/50',
    badgeBg: 'bg-indigo-500/15 text-indigo-500',
    badgeText: 'text-indigo-500'
  }
};

export default function AboutPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const queryTeacherId = searchParams.get('teacherId');
  const isForcedMarketplace = searchParams.get('view') === 'marketplace';

  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkStorage = () => {
        const stored = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
        if (stored && stored !== 'global') {
          setGuestTeacherId(stored);
        } else {
          setGuestTeacherId(null);
        }
      };
      checkStorage();
      window.addEventListener('storage', checkStorage);
      return () => window.removeEventListener('storage', checkStorage);
    }
  }, []);

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const preferredTeacherId = userData?.preferredTeacherId && userData.preferredTeacherId !== 'global' ? userData.preferredTeacherId : null;
  const activeTeacherId = isForcedMarketplace ? null : (isTeacher ? user?.uid : (preferredTeacherId || queryTeacherId || (!user ? guestTeacherId : null)));
  const isOwner = Boolean(user && isTeacher && user?.uid === activeTeacherId);

  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');

  // Interactive Team Showcase State
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      thumbnailScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const fetchAboutData = async () => {
      setLoading(true);
      try {
        if (activeTeacherId) {
          // Fetch teacher's profile and custom config
          const docRef = doc(db, 'teacherProfiles', activeTeacherId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTeacherProfile(docSnap.data());
          }

          // Count teacher's published courses
          const coursesQ = query(collection(db, 'courses'), where('teacherId', '==', activeTeacherId), where('isPublished', '==', true));
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
  }, [activeTeacherId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================================
  // CASE 1: LOGGED IN TEACHER / FOCUSED STUDENT ACADEMY ABOUT PAGE (Shikho Style)
  // =========================================================================
  if (activeTeacherId && teacherProfile) {
    const config = teacherProfile?.homePageConfig || {};
    const ab = config.aboutPageConfig || teacherProfile?.aboutPageConfig || {};

    const isInstitution = teacherProfile?.type === 'institution';
    const displayName = teacherProfile?.displayName || (isOwner ? user?.displayName : '') || 'আমাদের একাডেমি';
    const headline = teacherProfile?.headline || config.aboutHeadline || 'স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছি আমরা';
    const bio = ab.founderBio || config.aboutBio || teacherProfile?.bio || 'অনলাইন বিশ্ববিদ্যালয় ও বোর্ড পরীক্ষার প্রস্তুতির জন্য নিবেদিতপ্রাণ একটি আধুনিক একাডেমি। মানসম্মত লেকচার, নিয়মিত পরীক্ষা ও আন্তরিক মেন্টরশিপের মাধ্যমে শিক্ষার্থীদের স্বপ্ন পূরণে আমরা সর্বদা পাশে আছি।';
    const founderTitle = ab.founderTitle || config.founderTitle || (isInstitution ? 'প্রতিষ্ঠাতা ও পরিচালক' : 'চিফ মেন্টর ও পরিচালক');
    const founderPhoto = ab.founderPhoto || config.aboutPhoto || teacherProfile?.profilePhoto || (isOwner ? user?.photoURL : '') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + activeTeacherId;
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
    const storyImage = ab.storyImage || config.coverPhoto || teacherProfile?.coverPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop';
    const heroBgImage = ab.heroBgImage || storyImage;
    
    // Combine all photos for interactive showcase
    const customGalleryPhotos = (config.galleryPhotos && Array.isArray(config.galleryPhotos) && config.galleryPhotos.length > 0)
      ? config.galleryPhotos.map((p: any) => typeof p === 'string' ? p : p.imageUrl).filter(Boolean)
      : [];
    
    const combinedPhotos = [
      storyImage,
      ...customGalleryPhotos,
      ...momentsList,
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    ];
    const allTeamPhotos: string[] = Array.from(new Set(combinedPhotos)).filter(Boolean) as string[];

    // Promo Video
    const promoVideoUrl = ab.heroVideoUrl || config.introVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white pt-20">
        
        {/* ========================================================================= */}
        {/* 1. TOP HERO BANNER WITH BACKGROUND PHOTO & OVERLAY (Shikho Exact Match)   */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center justify-center border-b border-foreground/10">
          
          {/* Full Background Team Photo */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBgImage} 
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
                  {ab.heroHeading || 'শিখবো, জিতবো'}
                </h1>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow">
                  {ab.heroSubtitle || `${displayName}, দেশজুড়ে সবার জন্য মানসম্মত পড়াশোনা নিশ্চিত করতে অভিজ্ঞ মেন্টর এবং অত্যাধুনিক প্রযুক্তির সাহায্যে আমরা গড়ে তুলেছি সহজে শেখার এবং সহজে জেতার এক নতুন দুনিয়া!`}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href={ab.heroBtn1Link || "/courses"}
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{ab.heroBtn1Text || "কোর্সগুলো দেখুন"}</span>
                  </Link>

                  <a
                    href={ab.heroBtn2Link || "#story"}
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <span>{ab.heroBtn2Text || "আমাদের গল্প পড়ুন"}</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </a>
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
                    src={heroBgImage} 
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
        <section id="story" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
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
                  {ab.storyHeading ? (
                    <span>{ab.storyHeading}</span>
                  ) : (
                    <>আমাদের <span className="text-orange-500">গল্প</span></>
                  )}
                </h2>
                <div className="h-1 w-20 bg-orange-500 rounded-full mt-2" />
              </div>

              <div className="space-y-4 text-foreground/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {ab.storyDesc ? (
                  <p>{ab.storyDesc}</p>
                ) : (
                  <>
                    <p>
                      ২০২০ সালের শুরুতে একদল স্বপ্নবাজ শিক্ষকের হাত ধরে আমাদের এই শিক্ষাযাত্রার সূচনা। আমাদের মূল লক্ষ্য ছিল বাংলাদেশের প্রচলিত মুখস্থভিত্তিক পড়াশোনার বাইরে গিয়ে প্রতিটি বিষয়ের গভীরে গিয়ে কনসেপ্ট ভিত্তিক ও প্রাণবন্ত পাঠদান নিশ্চিত করা।
                    </p>
                    <p>
                      গত কয়েক বছরে হাজারো শিক্ষার্থীকে তাদের বোর্ড পরীক্ষা এবং শীর্ষস্থানীয় বিশ্ববিদ্যালয়ে ভর্তির জন্য সফলভাবে গাইড করেছি আমরা। আধুনিক ডিজিটাল ক্লাসরুম, নিয়মিত লাইভ ও রেকর্ডেড ক্লাস এবং ডেইলি এক্সাম সিস্টেমের মাধ্যমে প্রতিটি শিক্ষার্থীর দুর্বলতা দূর করে তাদের আত্মবিশ্বাস বহুগুণ বৃদ্ধি করাই আমাদের প্রতিদিনের সাধনা।
                    </p>
                    <p className="font-semibold text-foreground">
                      আমরা বিশ্বাস করি—সঠিক দিকনির্দেশনা ও আন্তরিক চেষ্টা থাকলে যেকোনো শিক্ষার্থী তার স্বপ্নের শীর্ষ চূড়ায় পৌঁছাতে পারে।
                    </p>
                  </>
                )}
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-foreground/10">
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-xl sm:text-2xl font-black text-orange-500">{ab.storyStat1Num || `${coursesCount || 5}+`}</div>
                  <div className="text-[11px] text-foreground/70 font-bold mt-0.5">{ab.storyStat1Label || 'কোর্স ও ব্যাচ'}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-xl sm:text-2xl font-black text-orange-500">{ab.storyStat2Num || '১,২০০+'}</div>
                  <div className="text-[11px] text-foreground/70 font-bold mt-0.5">{ab.storyStat2Label || 'সফল শিক্ষার্থী'}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-xl sm:text-2xl font-black text-orange-500">{ab.storyStat3Num || '৪.৯ ★'}</div>
                  <div className="text-[11px] text-foreground/70 font-bold mt-0.5">{ab.storyStat3Label || 'গড় রেটিং'}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                  <div className="text-xl sm:text-2xl font-black text-orange-500">{ab.storyStat4Num || '৯৮%'}</div>
                  <div className="text-[11px] text-foreground/70 font-bold mt-0.5">{ab.storyStat4Label || 'সফলতা হার'}</div>
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
                {ab.valuesHeading ? (
                  <span>{ab.valuesHeading}</span>
                ) : (
                  <>আমাদের <span className="text-orange-500">মূল ভিত্তি</span></>
                )}
              </h2>
              <div className="h-1 w-24 bg-orange-500 rounded-full mx-auto" />
              <p className="text-foreground/70 text-sm sm:text-base font-medium pt-2">
                {ab.valuesSubtitle || 'যে আদর্শ ও মূলনীতির ওপর দাঁড়িয়ে আমাদের প্রতিটি ক্লাস ও সিদ্ধান্ত'}
              </p>
            </div>

            {/* Dynamic Value Posters Grid */}
            {(() => {
              const valueCards: ValueCardItem[] = (ab.valueCards && Array.isArray(ab.valueCards) && ab.valueCards.length > 0) 
                ? ab.valueCards 
                : DEFAULT_VALUE_CARDS;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {valueCards.map((card, idx) => {
                    const IconComponent = VALUE_ICON_MAP[card.icon] || Award;
                    const theme = COLOR_THEMES[card.colorTheme || 'rose'] || COLOR_THEMES.rose;

                    return (
                      <div 
                        key={card.id || idx}
                        className={`rounded-3xl p-8 bg-gradient-to-br ${theme.cardBg} shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1`}
                      >
                        <div className="space-y-4">
                          <div className={`w-14 h-14 rounded-2xl ${theme.badgeBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            {card.icon === 'custom-svg' && card.customSvg ? (
                              <div 
                                className="w-7 h-7 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:stroke-current"
                                dangerouslySetInnerHTML={{ __html: card.customSvg }}
                              />
                            ) : (
                              <IconComponent className="w-7 h-7" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-foreground tracking-wide uppercase">
                              {card.title}
                            </h3>
                            {card.subtitle && (
                              <p className={`text-xs font-bold ${theme.badgeText} mt-0.5`}>
                                {card.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-line">
                          {card.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. "টিম ও ক্লাসরুম মোমেন্টস" (100VH INTERACTIVE SLIDE SHOWCASE)          */}
        {/* ========================================================================= */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              {ab.showcaseHeading ? (
                <span>{ab.showcaseHeading}</span>
              ) : (
                <>{displayName} <span className="text-orange-500">পরিবার</span></>
              )}
            </h2>
            <div className="h-1 w-20 bg-orange-500 rounded-full mx-auto" />
            <p className="text-foreground/70 text-xs sm:text-sm md:text-base font-medium pt-1">
              {ab.showcaseSubtitle || `${displayName}-কে নেতৃত্ব দিচ্ছে প্রতিভাবান এবং দক্ষ একটি ডায়নামিক টিম। সবার জন্য মানসম্মত শিক্ষা সহজলভ্য করার লক্ষ্যে আমাদের সম্মিলিত প্রয়াস।`}
            </p>
          </div>

          {/* Large Interactive Height-Balanced Frame */}
          <div className="relative w-full h-[46vh] sm:h-[54vh] lg:h-[58vh] rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-zinc-950 border-2 border-foreground/15 shadow-2xl group z-10">
            
            {/* Framer Motion Smooth Animated Slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPhotoIndex}
                initial={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full relative"
              >
                <img 
                  src={allTeamPhotos[selectedPhotoIndex] || storyImage} 
                  alt={`Team Moment ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-cover object-center" 
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient Top & Bottom Overlays */}
            <div className="absolute inset-x-0 bottom-0 pb-16 sm:pb-24 pt-12 px-5 sm:px-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between pointer-events-none z-10">
              <div className="text-white space-y-1 drop-shadow-md">
                <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[11px] font-black uppercase tracking-wider">
                  ক্যাম্পাস ও ক্লাসরুম মুহূর্ত #{selectedPhotoIndex + 1}
                </div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-black">
                  শিক্ষার্থীদের স্বপ্ন পূরণে নিবেদিত একদল মেন্টর
                </h3>
              </div>
              
              <div className="text-xs font-bold text-white/90 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md hidden sm:block">
                {selectedPhotoIndex + 1} / {allTeamPhotos.length}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(prev => (prev - 1 + allTeamPhotos.length) % allTeamPhotos.length)}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl z-20"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(prev => (prev + 1) % allTeamPhotos.length)}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl z-20"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* 2-Row Thumbnails Container - OVERLAPPING ON TOP OF BIG IMAGE (Shikho Exact Match) */}
          <div className="relative -mt-12 sm:-mt-16 lg:-mt-20 z-20 px-2 sm:px-4 w-full">
            <div className="relative group/slider">
              
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails('left')}
                className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/85 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl z-30 opacity-80 hover:opacity-100 hover:scale-110"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* 2-Row Strict Horizontal Grid */}
              <div 
                ref={thumbnailScrollRef}
                className="grid grid-rows-2 grid-flow-col auto-cols-[100px] sm:auto-cols-[130px] md:auto-cols-[150px] lg:auto-cols-[170px] gap-2 sm:gap-2.5 overflow-x-auto pb-3 pt-1.5 no-scrollbar scroll-smooth snap-x"
              >
                {allTeamPhotos.map((imgUrl: string, idx: number) => {
                  const isActive = idx === selectedPhotoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 relative group cursor-pointer shrink-0 snap-start ${
                        isActive 
                          ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-background scale-105 shadow-2xl shadow-orange-500/40 border-transparent z-10' 
                          : 'opacity-75 hover:opacity-100 hover:scale-[1.03] border-2 border-white/40 dark:border-white/20 shadow-lg backdrop-blur-sm'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-orange-500/15 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails('right')}
                className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/85 hover:bg-orange-500 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl z-30 opacity-80 hover:opacity-100 hover:scale-110"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 5. "ফাউন্ডার ও চিফ মেন্টর প্রোফাইল" (ELITE FOUNDER SPOTLIGHT)              */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Main Luxury Glassmorphic Bento Card */}
            <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-950/80 border-2 border-foreground/15 dark:border-white/15 p-6 sm:p-12 lg:p-16 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Left Column: Stylized Portrait */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative group">
                    
                    {/* Glowing Aura Ring */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-80 transition duration-500" />
                    
                    <div className="relative w-64 h-80 sm:w-72 sm:h-92 rounded-[2.5rem] overflow-hidden border-4 border-background bg-zinc-950 shadow-2xl">
                      <img 
                        src={founderPhoto} 
                        alt={displayName} 
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                      />
                      
                      {/* Active Status Badge */}
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-emerald-400 text-[11px] font-extrabold backdrop-blur-md border border-emerald-500/30 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>সক্রিয় মেন্টর</span>
                      </div>
                    </div>

                    {/* Achievement Corner Badge */}
                    <div className="absolute -bottom-3 -right-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow-2xl shadow-orange-500/40 flex items-center gap-2 border-2 border-background">
                      <Award className="w-4 h-4" />
                      <span>{founderTitle}</span>
                    </div>

                  </div>
                </div>

                {/* Right Column: Founder Message & Stats Bento */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  
                  {/* Tag & Name */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-500 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>মেন্টরের বিশেষ বার্তা</span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                      {displayName}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wide">
                      শীর্ষ একাডেমি প্রশিক্ষক ও কনসেপ্ট মেন্টর
                    </p>
                  </div>

                  {/* Quote Body with Icon */}
                  <div className="relative p-5 sm:p-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 space-y-2">
                    <Quote className="w-8 h-8 text-orange-500/40 absolute -top-4 -left-3" />
                    <p className="text-foreground/85 text-sm sm:text-base leading-relaxed italic pt-2">
                      "{bio}"
                    </p>
                  </div>

                  {/* 3 Quick Value Badges */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                      <div className="text-lg sm:text-xl font-black text-orange-500">{coursesCount || 5}+</div>
                      <div className="text-[10px] sm:text-xs text-foreground/65 font-bold mt-0.5">কোর্সসমূহ</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                      <div className="text-lg sm:text-xl font-black text-orange-500">১,২০০+</div>
                      <div className="text-[10px] sm:text-xs text-foreground/65 font-bold mt-0.5">সফল শিক্ষার্থী</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 text-center">
                      <div className="text-lg sm:text-xl font-black text-orange-500">৪.৯ ★</div>
                      <div className="text-[10px] sm:text-xs text-foreground/65 font-bold mt-0.5">রেটিং</div>
                    </div>
                  </div>

                  {/* Social Media Connect Channels */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    {config.contactFacebookPage && (
                      <a href={config.contactFacebookPage} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 transition-all font-bold text-xs flex items-center gap-2" title="Facebook">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                      </a>
                    )}
                    {config.contactYoutube && (
                      <a href={config.contactYoutube} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 transition-all font-bold text-xs flex items-center gap-2" title="YouTube">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>YouTube</span>
                      </a>
                    )}
                    {config.contactWhatsapp && (
                      <a href={`https://wa.me/${config.contactWhatsapp}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-600/20 transition-all font-bold text-xs flex items-center gap-2" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {config.contactEmail && (
                      <a href={`mailto:${config.contactEmail}`} className="px-4 py-2 rounded-xl bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white border border-orange-600/20 transition-all font-bold text-xs flex items-center gap-2" title="Email">
                        <Mail className="w-4 h-4" />
                        <span>ইমেইল</span>
                      </a>
                    )}
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. "প্রস্তুতি শুরু করার মেগা ব্যানার" (MEGA EDTECH BENTO CTA)             */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-14 lg:p-16 rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-[#1c0f06] via-[#120a04] to-[#09090b] border-2 border-orange-500/40 text-white shadow-2xl relative overflow-hidden text-center space-y-8">
            
            {/* Ambient Lighting & Neon Grid */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>{ab.ctaBadge || 'সাফল্যের শুরু হোক আজই'}</span>
              </div>

              {/* Mega Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {ab.ctaHeading || 'তোমার স্বপ্নের সেরা প্রস্তুতিতে সাথে আছে'} <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  "{displayName}"
                </span>
              </h2>

              <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                {ab.ctaSubtitle || 'দেশসেরা দিকনির্দেশনা, মানসম্মত লেকচার ও নিয়মিত মডেল টেস্টের মাধ্যমে ঘরে বসেই নাও শতভাগ প্রস্তুতি।'}
              </p>

              {/* 4 Feature Checklist Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl mx-auto pt-2">
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/90 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{ab.ctaFeature1 || 'লাইভ ক্লাস'}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/90 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{ab.ctaFeature2 || 'ডেইলি এক্সাম'}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/90 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{ab.ctaFeature3 || 'ডাউট সলভিং'}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/90 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{ab.ctaFeature4 || 'লেকচার শিট'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href={ab.ctaBtn1Link || "/courses"}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{ab.ctaBtn1Text || "সকল কোর্সসমূহ দেখুন"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {(ab.ctaPhone || config.contactPhone) && (
                  <a
                    href={`tel:${ab.ctaPhone || config.contactPhone}`}
                    className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span>{ab.ctaBtn2Text || "হেল্পলাইনে কল দিন"}</span>
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
