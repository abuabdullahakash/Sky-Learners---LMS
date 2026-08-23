"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import RoleSelectionModal from '@/components/RoleSelectionModal';
import TeacherStorefrontView from '@/components/TeacherStorefrontView';
import gsap from 'gsap';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  Code2, 
  Palette, 
  Languages, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ChevronDown, 
  Award, 
  Trophy, 
  Video, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  Flame, 
  Compass,
  Megaphone,
  Pin,
  ExternalLink,
  PlusCircle,
  LayoutDashboard,
  Globe
} from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  price?: number;
  regularPrice?: number;
  instructorName?: string;
  teacherId?: string;
  coachingName?: string;
  isCoachingCourse?: boolean;
  totalStudents?: number;
  rating?: number;
  duration?: string;
}

interface CoachingProfile {
  id: string;
  displayName: string;
  headline?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  teachersRoster?: any[];
  coursesCount?: number;
  rating?: number;
}

interface TeacherProfile {
  id: string;
  displayName: string;
  headline?: string;
  profilePhoto?: string;
  institution?: string;
  rating?: number;
  studentsCount?: number;
}

interface TeacherPost {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherPhoto?: string;
  coachingName?: string;
  title: string;
  content: string;
  type: 'notice' | 'tips' | 'promo' | 'exam_alert';
  imageUrl?: string;
  linkedCourseId?: string;
  linkedCourseTitle?: string;
  isPinned?: boolean;
  createdAt: any;
}

export default function HomePage() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';
  const isStudent = !isAdmin && userData?.role === 'student';

  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
      if (stored && stored !== 'global') {
        setGuestTeacherId(stored);
      }
      setHasCheckedStorage(true);
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState<'all' | 'coaching' | 'individual' | 'popular'>('all');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coachingCenters, setCoachingCenters] = useState<CoachingProfile[]>([]);
  const [starTeachers, setStarTeachers] = useState<TeacherProfile[]>([]);
  const [teacherPosts, setTeacherPosts] = useState<TeacherPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // GSAP animation refs
  const heroTagRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const activeTeacherId = isTeacher && user?.uid
    ? user.uid
    : (isStudent && userData?.preferredTeacherId && userData.preferredTeacherId !== 'global'
        ? userData.preferredTeacherId
        : (!user && guestTeacherId ? guestTeacherId : null));

  if (activeTeacherId) {
    return <TeacherStorefrontView teacherId={activeTeacherId} isOwner={Boolean(isTeacher && user?.uid === activeTeacherId)} />;
  }

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(heroTagRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
      .fromTo(heroTitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
      .fromTo(heroSubRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
      .fromTo(heroSearchRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(heroCtaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(statsRef.current?.children || [], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");
  }, []);

  // Fetch Firestore Courses, Profiles & Teacher Posts
  useEffect(() => {
    if (user && isTeacher) {
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Published Courses
        const coursesRef = collection(db, 'courses');
        const qCourses = query(coursesRef, where('isPublished', '==', true), limit(12));
        const coursesSnap = await getDocs(qCourses);
        
        const fetchedCourses: CourseItem[] = [];
        const teacherCache: Record<string, string> = {};

        for (const docSnap of coursesSnap.docs) {
          const data = docSnap.data();
          let creatorName = data.coachingName || '';
          
          if (!creatorName && data.teacherId) {
            if (!teacherCache[data.teacherId]) {
              const tDoc = await getDoc(doc(db, 'teacherProfiles', data.teacherId));
              if (tDoc.exists()) {
                teacherCache[data.teacherId] = tDoc.data().displayName || 'Instructor';
              } else {
                teacherCache[data.teacherId] = 'Instructor';
              }
            }
            creatorName = teacherCache[data.teacherId];
          }

          fetchedCourses.push({
            id: docSnap.id,
            title: data.title || 'Untitled Course',
            thumbnailUrl: data.thumbnailUrl,
            category: data.category,
            price: data.price,
            regularPrice: data.regularPrice,
            instructorName: creatorName || 'Instructor',
            teacherId: data.teacherId,
            coachingName: data.coachingName,
            isCoachingCourse: Boolean(data.coachingName || (data.assignedTeachers && data.assignedTeachers.length > 0)),
            totalStudents: data.enrolledCount || Math.floor(Math.random() * 80) + 20,
            rating: 4.8 + Math.round((Math.random() * 0.2) * 10) / 10,
            duration: data.duration || '20+ Hours',
          });
        }
        setCourses(fetchedCourses);

        // 2. Fetch Profiles for Coachings & Teachers
        const tpRef = collection(db, 'teacherProfiles');
        const tpSnap = await getDocs(tpRef);
        
        const coachings: CoachingProfile[] = [];
        const teachers: TeacherProfile[] = [];

        tpSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const pType = data.type || (data.teachersRoster && data.teachersRoster.length > 0 ? 'institution' : 'individual');
          
          if (pType === 'institution') {
            coachings.push({
              id: docSnap.id,
              displayName: data.displayName || 'Coaching Academy',
              headline: data.headline || 'Premier Academic & Skill Coaching',
              profilePhoto: data.profilePhoto || data.photoUrl || '/Fav Icon.png',
              coverPhoto: data.coverPhoto,
              teachersRoster: data.teachersRoster || [],
              rating: 4.9,
              coursesCount: data.coursesCount || 4,
            });
          } else {
            teachers.push({
              id: docSnap.id,
              displayName: data.displayName || 'Faculty Instructor',
              headline: data.headline || 'Senior Subject Specialist',
              profilePhoto: data.profilePhoto || data.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + docSnap.id,
              institution: data.experiences?.[0]?.institution || 'SkyLearners Faculty',
              rating: 4.9,
              studentsCount: 350 + Math.floor(Math.random() * 500),
            });
          }
        });

        setCoachingCenters(coachings);
        setStarTeachers(teachers);

        // 3. Fetch Teacher Posts / Notices
        const postsRef = collection(db, 'teacher_posts');
        const postsSnap = await getDocs(query(postsRef, limit(10)));
        const fetchedPosts: TeacherPost[] = [];
        postsSnap.forEach(d => {
          fetchedPosts.push({ id: d.id, ...d.data() } as TeacherPost);
        });

        fetchedPosts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setTeacherPosts(fetchedPosts);

      } catch (err) {
        console.error('Error fetching home page marketplace data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setIsRoleModalOpen(false);
    router.push(`/onboarding?role=${role}`);
  };

  const filteredCourses = courses.filter((c) => {
    if (activeCourseTab === 'coaching') return c.isCoachingCourse;
    if (activeCourseTab === 'individual') return !c.isCoachingCourse;
    if (activeCourseTab === 'popular') return (c.totalStudents || 0) >= 30;
    return true;
  });

  const categoryList = [
    {
      id: 'academic',
      title: t('categories.academic'),
      icon: BookOpen,
      count: '45+ Courses',
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30',
      tag: 'Class 6 - 12'
    },
    {
      id: 'programming',
      title: t('categories.programming'),
      icon: Code2,
      count: '30+ Courses',
      color: 'from-violet-500/20 to-purple-500/20 text-violet-500 border-violet-500/30',
      tag: 'Web & App'
    },
    {
      id: 'design',
      title: t('categories.design'),
      icon: Palette,
      count: '20+ Courses',
      color: 'from-pink-500/20 to-rose-500/20 text-pink-500 border-pink-500/30',
      tag: 'UI/UX & Graphic'
    },
    {
      id: 'language',
      title: t('categories.language'),
      icon: Languages,
      count: '15+ Courses',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
      tag: 'IELTS & Spoken'
    },
    {
      id: 'business',
      title: t('categories.business'),
      icon: Briefcase,
      count: '18+ Courses',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30',
      tag: 'Marketing & Sales'
    },
    {
      id: 'admission',
      title: t('categories.admission'),
      icon: GraduationCap,
      count: '25+ Courses',
      color: 'from-red-500/20 to-rose-500/20 text-red-500 border-red-500/30',
      tag: 'Medical & Varsity'
    },
  ];

  const featureList = [
    {
      icon: Video,
      title: t('features.f1Title'),
      desc: t('features.f1Desc'),
      gradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-500',
    },
    {
      icon: Trophy,
      title: t('features.f2Title'),
      desc: t('features.f2Desc'),
      gradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500',
    },
    {
      icon: Users,
      title: t('features.f3Title'),
      desc: t('features.f3Desc'),
      gradient: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500',
    },
    {
      icon: ShieldCheck,
      title: t('features.f4Title'),
      desc: t('features.f4Desc'),
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500',
    },
  ];

  const testimonials = [
    {
      name: locale === 'bn' ? 'তানভীর আহমেদ' : 'Tanvir Ahmed',
      role: locale === 'bn' ? 'এইচএসসি পরীক্ষার্থী' : 'HSC Candidate',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
      content: locale === 'bn' 
        ? 'কোচিং সেন্টারের একাধিক অভিজ্ঞ স্যারের সমন্বয়ে ফিজিক্স ও কেমিস্ট্রির ক্লাসগুলো অসাধারণ ছিল। প্রতিটি লেসনের পর ডেইলি এক্সাম দিয়ে বোর্ড পরীক্ষার কনফিডেন্স অনেক বেড়েছে!'
        : 'The multi-teacher coaching batch for Physics and Chemistry was outstanding. The daily exams after every lecture boosted my board exam confidence tremendously!',
      course: 'HSC Science Masterclass',
      rating: 5
    },
    {
      name: locale === 'bn' ? 'সাদিয়া জাহান' : 'Sadia Jahan',
      role: locale === 'bn' ? 'বিশ্ববিদ্যালয় শিক্ষার্থী' : 'University Student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      content: locale === 'bn'
        ? 'ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট কোর্স করে আমি এখন একটি সফটওয়্যার কোম্পানিতে ইন্টার্নশিপ করছি। মেন্টরদের ডাউট সলভিং সাপোর্ট সত্যি প্রশংসনীয়।'
        : 'Completed the Full Stack Web Development course and now interning at a software firm. The mentor doubt-solving support was truly commendable.',
      course: 'Full Stack Web Mastery',
      rating: 5
    },
    {
      name: locale === 'bn' ? 'মাহমুদুল হাসান' : 'Mahmudul Hasan',
      role: locale === 'bn' ? 'মেডিকেল ভর্তি পরীক্ষার্থী' : 'Medical Aspirant',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      content: locale === 'bn'
        ? 'লাইভ ক্লাস ও ইনস্ট্যান্ট লিডারবোর্ড সিস্টেমের কারণে পড়াশোনায় আলাদা একটা উদ্দীপনা পেতাম। স্কাই লার্নার্স প্ল্যাটফর্ম এক কথায় অনন্য!'
        : 'The live classes and instant leaderboard system kept me motivated every single day. SkyLearners platform is simply unmatched!',
      course: 'Medical Admission Compact',
      rating: 5
    }
  ];

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  const typeBadges = {
    notice: { label: locale === 'bn' ? '📢 নোটিশ' : '📢 Notice', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    tips: { label: locale === 'bn' ? '💡 পড়ার টিপস' : '💡 Study Tips', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    promo: { label: locale === 'bn' ? '🔥 নতুন কোর্স' : '🔥 Course Promo', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    exam_alert: { label: locale === 'bn' ? '📝 পরীক্ষার বার্তা' : '📝 Exam Alert', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If a logged-in user is a Teacher, immediately display their own Academy / Storefront Home Page (SS 2)
  if (user && isTeacher && user.uid) {
    return <TeacherStorefrontView teacherId={user.uid} isOwner={true} />;
  }

  // If a logged-in user is a Student with a Focused Academy preference selected, immediately display that Teacher's Storefront!
  if (user && isStudent && userData?.preferredTeacherId && userData.preferredTeacherId !== 'global') {
    return <TeacherStorefrontView teacherId={userData.preferredTeacherId} isOwner={false} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Role-Adaptive: Student vs Guest)                         */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background Parallax & Dynamic Glowing Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-amber-500/15 blur-[140px] rounded-full" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Tag Badge */}
            <div ref={heroTagRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>
                {user && isStudent ? (
                  locale === 'bn' ? `🎓 শিক্ষার্থী পোর্টাল • স্বাগতম ${user.displayName || 'Learner'}` : `🎓 Student Portal • Welcome ${user.displayName || 'Learner'}`
                ) : (
                  t('heroTag')
                )}
              </span>
            </div>

            {/* Main Headline */}
            <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] text-foreground">
              {user && isStudent ? (
                locale === 'bn' ? (
                  <>
                    আজ <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">নতুন কী শিখতে</span> চান?
                  </>
                ) : (
                  <>
                    What do you want to <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">learn today?</span>
                  </>
                )
              ) : (
                locale === 'bn' ? (
                  <>
                    দেশসেরা শিক্ষক ও <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">কোচিং সেন্টারের</span> সাথে শিখুন
                  </>
                ) : (
                  <>
                    Learn from Top Teachers & <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">Leading Coaching Centers</span>
                  </>
                )
              )}
            </h1>

            {/* Subtitle */}
            <p ref={heroSubRef} className="text-base sm:text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto leading-relaxed">
              {user && isStudent ? (
                locale === 'bn'
                  ? 'আপনার পছন্দের বিষয় বা শিক্ষকের কোর্স খুঁজে নিন, লাইভ ক্লাসে অংশ নিন এবং নিয়মিত ডেইলি এক্সাম দিয়ে নিজেকে এগিয়ে রাখুন।'
                  : 'Discover your favorite subjects, join live classes, and test your skills with daily exams.'
              ) : (
                t('subtitle')
              )}
            </p>

            {/* Course Search Bar */}
            <div ref={heroSearchRef} className="pt-2 max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-2xl sm:rounded-full bg-background/90 border border-foreground/15 p-1.5 focus-within:border-primary/60 transition-all backdrop-blur-xl group">
                <div className="pl-4 pr-2 text-foreground/50 group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-foreground/40 focus:outline-none py-2.5 sm:py-3 pr-4"
                />
                <button 
                  type="submit" 
                  className="px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-primary/30 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>{locale === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Search Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs sm:text-sm text-foreground/60">
                <span className="font-semibold text-foreground/80">{t('popularSearch')}</span>
                {['HSC Science', 'SSC 2025', 'Web Development', 'Spoken English', 'Medical Admission'].map((chip, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => router.push(`/courses?search=${encodeURIComponent(chip)}`)}
                    className="px-3 py-1 rounded-full bg-foreground/5 hover:bg-primary/15 hover:text-primary border border-foreground/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC HERO ACTION BUTTONS */}
            <div ref={heroCtaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user && isStudent ? (
                /* CASE 1: STUDENT */
                <>
                  <Link 
                    href="/dashboard/courses"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-base hover:opacity-95 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>{locale === 'bn' ? 'আমার কোর্সে যান' : 'My Enrolled Courses'}</span>
                  </Link>

                  <Link 
                    href="/courses"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground font-bold text-base transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Compass className="w-5 h-5 text-primary" />
                    <span>{locale === 'bn' ? 'নতুন কোর্স ব্রাউজ করুন' : 'Browse All Courses'}</span>
                  </Link>
                </>
              ) : (
                /* CASE 2: GUEST */
                <>
                  <Link 
                    href="/courses"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-foreground text-background dark:bg-primary dark:text-white font-bold text-base hover:opacity-95 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group"
                  >
                    <Compass className="w-5 h-5 text-primary dark:text-white group-hover:rotate-45 transition-transform" />
                    <span>{t('exploreCourses')}</span>
                  </Link>
                  
                  <button 
                    type="button"
                    onClick={() => setIsRoleModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground font-bold text-base transition-all shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <Building2 className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                    <span>{t('teachWithUs')}</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PLATFORM LIVE METRICS (For Guests & Market Proof)                      */}
      {/* ========================================================================= */}
      {!user && (
        <section className="py-8 border-y border-foreground/10 bg-foreground/[0.02]">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
              <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 shadow-sm">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-1">১০,০০০+</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/70">{t('stats.students')}</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 shadow-sm">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-500 mb-1">৫০+</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/70">{t('stats.teachers')}</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 shadow-sm">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-500 mb-1">১০০+</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/70">{t('stats.courses')}</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 shadow-sm">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-500 mb-1">৯৯%</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/70">{t('stats.satisfaction')}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CATEGORIES EXPLORER                                                    */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Categories</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t('categories.title')}
              </h2>
              <p className="text-foreground/70 text-sm sm:text-base mt-2 max-w-xl">
                {t('categories.subtitle')}
              </p>
            </div>

            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-sm sm:text-base group"
            >
              <span>{t('categories.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryList.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.id}`}
                  className="group relative p-6 sm:p-7 rounded-3xl bg-background border border-foreground/10 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} border flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/70">
                      {cat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h3>
                    <p className="text-sm text-foreground/60 font-medium">
                      {cat.count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURED & TRENDING COURSES SHOWCASE                                  */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-foreground/[0.02] border-t border-foreground/10">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Programs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {t('featuredCourses.title')}
            </h2>
            <p className="text-foreground/70 text-sm sm:text-base mt-2">
              {t('featuredCourses.subtitle')}
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
              {[
                { id: 'all', label: t('featuredCourses.tabAll') },
                { id: 'coaching', label: t('featuredCourses.tabCoaching') },
                { id: 'individual', label: t('featuredCourses.tabIndividual') },
                { id: 'popular', label: t('featuredCourses.tabPopular') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCourseTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    activeCourseTab === tab.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                      : 'bg-background border border-foreground/10 text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-background border border-foreground/10 rounded-3xl max-w-lg mx-auto shadow-sm">
              <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">{t('featuredCourses.noCourses')}</h3>
              <p className="text-sm text-foreground/60 mb-6">Explore our catalog or check back soon as instructors add more courses.</p>
              <Link 
                href="/courses"
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm inline-block shadow-md"
              >
                {t('featuredCourses.viewAllCourses')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id}
                  className="group rounded-3xl bg-background border border-foreground/10 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-2xl flex flex-col overflow-hidden"
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
                        <BookOpen className="w-10 h-10 text-primary" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      {course.isCoachingCourse ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-500/90 text-white text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-md">
                          <Building2 className="w-3 h-3" />
                          <span>{t('featuredCourses.coachingBadge')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-md">
                          <UserCheck className="w-3 h-3" />
                          <span>{t('featuredCourses.individualBadge')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60 mb-2">
                        {course.isCoachingCourse ? (
                          <Building2 className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{course.instructorName}</span>
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-foreground/10 space-y-3">
                      <div className="flex items-center justify-between text-xs text-foreground/70">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{course.rating || 4.9}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span>{course.totalStudents} {t('featuredCourses.enrolled')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {course.price && course.price > 0 ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-black text-primary">
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
                              {t('featuredCourses.free')}
                            </span>
                          )}
                        </div>

                        <Link 
                          href={`/courses/${course.id}`}
                          className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-primary hover:text-white font-bold text-xs transition-all flex items-center gap-1 group/btn"
                        >
                          <span>{t('featuredCourses.viewDetails')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link 
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground font-bold text-base transition-all shadow-sm hover:scale-105"
            >
              <span>{t('featuredCourses.viewAllCourses')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TOP COACHING CENTERS SHOWCASE                                          */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('topCoachings.tag')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t('topCoachings.title')}
              </h2>
              <p className="text-foreground/70 text-sm sm:text-base mt-2 max-w-xl">
                {t('topCoachings.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(coachingCenters.length > 0 ? coachingCenters : [
              {
                id: 'demo-coaching-1',
                displayName: locale === 'bn' ? 'স্কাই একাডেমি ও কোচিং' : 'Sky Learners Academy',
                headline: locale === 'bn' ? 'এইচএসসি ও এডমিশন স্পেশালিস্ট টিম' : 'HSC & Admission Specialist Team',
                profilePhoto: '/Fav Icon.png',
                teachersRoster: [{}, {}, {}, {}],
                coursesCount: 6,
                rating: 4.9
              },
              {
                id: 'demo-coaching-2',
                displayName: locale === 'bn' ? 'প্রাইম এডুকেশন কেয়ার' : 'Prime Education Care',
                headline: locale === 'bn' ? 'এসএসসি ও ফাউন্ডেশন একাডেমিক সেন্টার' : 'SSC & Foundation Academic Center',
                profilePhoto: '/Fav Icon.png',
                teachersRoster: [{}, {}, {}],
                coursesCount: 4,
                rating: 4.8
              },
              {
                id: 'demo-coaching-3',
                displayName: locale === 'bn' ? 'নেক্সাস স্কিল একাডেমি' : 'Nexus Skill Academy',
                headline: locale === 'bn' ? 'প্রোগ্রামিং ও ক্যারিয়ার ট্রেনিং হাব' : 'Programming & Career Training Hub',
                profilePhoto: '/Fav Icon.png',
                teachersRoster: [{}, {}, {}, {}, {}],
                coursesCount: 8,
                rating: 4.9
              }
            ]).map((coaching) => (
              <div 
                key={coaching.id}
                className="group relative p-6 sm:p-8 rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center p-2 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src={coaching.profilePhoto || '/Fav Icon.png'} 
                      alt={coaching.displayName} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-orange-500 transition-colors">
                      {coaching.displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 line-clamp-1 mt-0.5">
                      {coaching.headline}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-foreground/10 text-center">
                  <div className="bg-foreground/[0.03] p-3 rounded-2xl">
                    <div className="text-lg font-black text-foreground">
                      {coaching.teachersRoster?.length || 3}+
                    </div>
                    <div className="text-xs text-foreground/60 font-semibold">
                      {t('topCoachings.instructorsCount')}
                    </div>
                  </div>
                  <div className="bg-foreground/[0.03] p-3 rounded-2xl">
                    <div className="text-lg font-black text-foreground">
                      {coaching.coursesCount || 4}
                    </div>
                    <div className="text-xs text-foreground/60 font-semibold">
                      {t('topCoachings.coursesCount')}
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/teachers/${coaching.id}`}
                  className="w-full py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('topCoachings.exploreCoaching')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STAR INSTRUCTORS SPOTLIGHT                                            */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-foreground/[0.02] border-y border-foreground/10">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('topInstructors.tag')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {t('topInstructors.title')}
            </h2>
            <p className="text-foreground/70 text-sm sm:text-base mt-2">
              {t('topInstructors.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(starTeachers.length > 0 ? starTeachers.slice(0, 4) : [
              {
                id: 't-1',
                displayName: locale === 'bn' ? 'আবু আব্দুল্লাহ আকাশ' : 'Abu Abdullah Akash',
                headline: locale === 'bn' ? 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার ও ইন্সট্রাক্টর' : 'Senior Software Engineer & Instructor',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Akash',
                institution: 'SkyLearners Lead',
                rating: 4.9,
                studentsCount: 850
              },
              {
                id: 't-2',
                displayName: locale === 'bn' ? 'ড. তানভীর হাসান' : 'Dr. Tanvir Hasan',
                headline: locale === 'bn' ? 'লেকচারার (পদার্থবিজ্ঞান)' : 'Lecturer (Physics)',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
                institution: 'Dhaka College',
                rating: 4.9,
                studentsCount: 1200
              },
              {
                id: 't-3',
                displayName: locale === 'bn' ? 'নুসরাত জাহান' : 'Nusrat Jahan',
                headline: locale === 'bn' ? 'আইইএলটিএস ট্রেইনার (ব্যান্ড ৮.৫)' : 'IELTS Trainer (Band 8.5)',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
                institution: 'British Council Certified',
                rating: 5.0,
                studentsCount: 940
              },
              {
                id: 't-4',
                displayName: locale === 'bn' ? 'মাহিনুর রহমান' : 'Mahinur Rahman',
                headline: locale === 'bn' ? 'উচ্চতর গণিত বিশেষজ্ঞ' : 'Higher Math Specialist',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mahin',
                institution: 'Notre Dame College Alumni',
                rating: 4.8,
                studentsCount: 670
              }
            ]).map((teacher) => (
              <div 
                key={teacher.id}
                className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl text-center flex flex-col justify-between group"
              >
                <div>
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-primary/10 p-1 border-2 border-primary/30 group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src={teacher.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + teacher.id} 
                      alt={teacher.displayName}
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>

                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {teacher.displayName}
                  </h3>
                  <p className="text-xs text-foreground/60 line-clamp-2 mt-1 min-h-[32px]">
                    {teacher.headline}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-foreground/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-foreground/70">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{teacher.rating || 4.9}</span>
                    </div>
                    <span className="font-medium">{teacher.studentsCount}+ {t('featuredCourses.enrolled')}</span>
                  </div>

                  <Link 
                    href={`/teachers/${teacher.id}`}
                    className="w-full py-2.5 rounded-xl bg-foreground/5 hover:bg-primary hover:text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t('topInstructors.viewProfile')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PLATFORM CORE FEATURES (Why SkyLearners?)                              */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{t('features.tag')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {t('features.title')}
            </h2>
            <p className="text-foreground/70 text-sm sm:text-base mt-2">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureList.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx}
                  className={`p-7 rounded-3xl bg-background border ${feat.gradient} hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-6">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">
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
      {/* 9. DUAL EDUCATOR CTA BANNER (ONLY SHOWN TO GUESTS / NEW VISITORS)         */}
      {/* ========================================================================= */}
      {!user && (
        <section className="py-12">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Individual Teacher CTA */}
              <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    {t('educatorCTA.individualTitle')}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
                    {t('educatorCTA.individualDesc')}
                  </p>
                </div>

                <div className="relative z-10">
                  <button 
                    type="button"
                    onClick={() => handleRoleSelect('teacher')}
                    className="px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
                  >
                    <span>{t('educatorCTA.individualBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right: Coaching Center CTA */}
              <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-purple-950 to-orange-950 text-white shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    {t('educatorCTA.coachingTitle')}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
                    {t('educatorCTA.coachingDesc')}
                  </p>
                </div>

                <div className="relative z-10">
                  <button 
                    type="button"
                    onClick={() => handleRoleSelect('teacher')}
                    className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2"
                  >
                    <span>{t('educatorCTA.coachingBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 10. TESTIMONIALS & SUCCESS STORIES (For Guests & Market Proof)            */}
      {/* ========================================================================= */}
      {!user && (
        <section className="py-20 md:py-28 bg-foreground/[0.02] border-t border-foreground/10">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-primary" />
                <span>{t('testimonials.tag')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {t('testimonials.title')}
              </h2>
              <p className="text-foreground/70 text-sm sm:text-base mt-2">
                {t('testimonials.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test, idx) => (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-background border border-foreground/10 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-foreground/80 text-sm sm:text-base leading-relaxed italic">
                      "{test.content}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-foreground/10">
                    <img 
                      src={test.avatar} 
                      alt={test.name} 
                      className="w-12 h-12 rounded-full object-cover border border-primary/30"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{test.name}</h4>
                      <p className="text-xs text-foreground/60">{test.role}</p>
                      <span className="text-[11px] font-semibold text-primary">{test.course}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 11. FAQ ACCORDION SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('faq.tag')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {t('faq.title')}
            </h2>
            <p className="text-foreground/70 text-sm sm:text-base mt-2">
              {t('faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-foreground/10 bg-background overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className={`p-2 rounded-full bg-foreground/5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-foreground/70 text-sm sm:text-base leading-relaxed border-t border-foreground/5 pt-4 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ROLE SELECTION MODAL                                                      */}
      {/* ========================================================================= */}
      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSelectRole={handleRoleSelect} 
      />

    </div>
  );
}
