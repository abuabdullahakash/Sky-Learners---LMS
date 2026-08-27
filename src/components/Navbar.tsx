"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  User as UserIcon, 
  Menu, 
  X, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Video, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut, 
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FileText,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  AlertCircle,
  MoreVertical,
  UserCircle,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Globe,
  Building2,
  Megaphone
} from 'lucide-react';
import RoleSelectionModal from './RoleSelectionModal';
import CourseMegaMenu from './CourseMegaMenu';
import HeaderSearchBar from './HeaderSearchBar';
import { resolveTeacherBySlugOrId } from '@/lib/slug';
import { TeacherThemeToggle, TeacherLanguageToggle } from './TeacherNavControls';
import TeacherStorefrontNav from './TeacherStorefrontNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isForcedMarketplace = searchParams.get('view') === 'marketplace';
  const { user, userData, loading, logout } = useAuth();
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentCourseTitle, setCurrentCourseTitle] = useState('');
  const [currentCourseData, setCurrentCourseData] = useState<{ title?: string; thumbnailUrl?: string; category?: string } | null>(null);

  const courseId = params?.courseId as string;

  // Path & Context detection
  const isStudentDashboard = pathname.startsWith('/dashboard');
  const isTeacherDashboard = pathname.startsWith('/teacher-dashboard');
  const isAdminDashboard = pathname.startsWith('/admin');
  const isDashboard = isStudentDashboard || isTeacherDashboard || isAdminDashboard;

  const parts = pathname.split('/');
  const coursesIndex = parts.indexOf('courses');
  
  const isTeacherCourseDashboard = isTeacherDashboard && coursesIndex !== -1 && parts.length > coursesIndex + 1 && parts[coursesIndex + 1] !== 'create';
  const isStudentCourseDashboard = isStudentDashboard && coursesIndex !== -1 && parts.length > coursesIndex + 1;
  const isCourseDashboard = isTeacherCourseDashboard || isStudentCourseDashboard;

  // Fetch course details (title, thumbnail, category) for course dashboard header in drawer
  useEffect(() => {
    if (courseId && isCourseDashboard) {
      const fetchTitle = async () => {
        try {
          const docRef = doc(db, 'courses', courseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentCourseData({
              title: data.title,
              thumbnailUrl: data.thumbnailUrl,
              category: data.category,
            });
            setCurrentCourseTitle(data.title || '');
          }
        } catch (err) {
          console.error("Error fetching course data for navbar drawer", err);
        }
      };
      fetchTitle();
    }
  }, [courseId, isCourseDashboard]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setIsRoleModalOpen(false);
    router.push(`/onboarding?role=${role}`);
  };

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';
  const isStudent = !isAdmin && userData?.role === 'student' && Boolean(userData?.onboardingComplete);
  const hasCompletedRole = isAdmin || isTeacher || isStudent;
  const userProfileLink = isAdmin ? '/admin' : (isTeacher ? '/teacher-dashboard' : (isStudent ? '/dashboard' : '/onboarding'));
  const [preferredTeacherName, setPreferredTeacherName] = useState<string>('');
  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);
  const [storefrontTeacherData, setStorefrontTeacherData] = useState<{
    disabledPages?: string[];
    customNavLinks?: Array<{ id: string; name: string; slug: string; enabled: boolean }>;
    profilePhoto?: string;
    headerLogo?: string;
    logoUrl?: string;
    headerTagline?: string;
  } | null>(null);
  const [platformGlobalPages, setPlatformGlobalPages] = useState<Array<{ id: string; name: string; slug: string; excludedTeacherIds?: string[] }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkStorage = () => {
        const stored = sessionStorage.getItem('referralTeacherId');
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

  // Real-Time Listener for Global Platform Pages & Exclusion Rules
  useEffect(() => {
    const unsubGlobalPages = onSnapshot(doc(db, 'platformSettings', 'globalTeacherPages'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pages && Array.isArray(data.pages)) {
          setPlatformGlobalPages(data.pages);
        }
      }
    }, (err) => {
      console.error("Error listening to global pages in navbar:", err);
    });

    return () => unsubGlobalPages();
  }, []);

  // Check if current route has a teacher context
  let routeTeacherId: string | null = null;
  if (pathname.includes('/teachers/')) {
    const parts = pathname.split('/teachers/');
    if (parts[1]) {
      routeTeacherId = parts[1].split('/')[0].split('#')[0].split('?')[0];
    }
  }

  const preferredTeacherId = userData?.preferredTeacherId;
  const isCustomTeacherMode = Boolean(isStudent && preferredTeacherId && preferredTeacherId !== 'global');
  
  // Active teacher for dynamic link routing
  const effectiveTeacherId = isForcedMarketplace
    ? null
    : (routeTeacherId 
        ? routeTeacherId 
        : (isStudent 
            ? (preferredTeacherId && preferredTeacherId !== 'global' ? preferredTeacherId : null)
            : (isTeacher 
                ? user?.uid 
                : (!user && guestTeacherId && guestTeacherId !== 'global' ? guestTeacherId : null)
              )
          )
      );

  // Real-Time Listener for Active Teacher Storefront Config
  useEffect(() => {
    if (!effectiveTeacherId) {
      setPreferredTeacherName('');
      setStorefrontTeacherData(null);
      return;
    }

    let unsub: (() => void) | null = null;

    const setupTeacherListener = async () => {
      try {
        let resolvedUid = effectiveTeacherId;
        const docRef = doc(db, 'teacherProfiles', effectiveTeacherId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const resolved = await resolveTeacherBySlugOrId(db, effectiveTeacherId);
          if (resolved?.uid) {
            resolvedUid = resolved.uid;
            if (typeof window !== 'undefined' && guestTeacherId === effectiveTeacherId) {
              sessionStorage.setItem('referralTeacherId', resolvedUid);
              setGuestTeacherId(resolvedUid);
            }
          }
        }

        unsub = onSnapshot(doc(db, 'teacherProfiles', resolvedUid), (tDoc) => {
          if (tDoc.exists()) {
            const data = tDoc.data();
            setPreferredTeacherName(data.displayName || data.academyName || 'Teacher Academy');
            setStorefrontTeacherData({
              disabledPages: data.disabledPages || [],
              customNavLinks: data.customNavLinks || [],
              profilePhoto: data.profilePhoto || data.photoUrl || '',
              headerLogo: data.headerLogo || data.logoUrl || '',
              logoUrl: data.logoUrl || data.headerLogo || '',
              headerTagline: data.headerTagline || 'Teacher Academy'
            });
          } else {
            getDoc(doc(db, 'users', resolvedUid)).then(uDoc => {
              if (uDoc.exists()) {
                const uData = uDoc.data();
                setPreferredTeacherName(uData.name || uData.displayName || 'Teacher Academy');
                setStorefrontTeacherData({
                  disabledPages: [],
                  customNavLinks: [],
                  profilePhoto: uData.profilePhoto || uData.photoURL || uData.photoUrl || '',
                  headerLogo: uData.headerLogo || uData.logoUrl || '',
                  logoUrl: uData.logoUrl || uData.headerLogo || '',
                  headerTagline: uData.headerTagline || 'Teacher Academy'
                });
              }
            }).catch(() => {});
            setStorefrontTeacherData({ disabledPages: [], customNavLinks: [] });
          }
        }, (err) => {
          console.error("Error listening to teacher storefront in navbar:", err);
        });
      } catch (err) {
        console.error("Error setting up teacher listener:", err);
      }
    };

    setupTeacherListener();

    return () => {
      if (unsub) unsub();
    };
  }, [effectiveTeacherId, guestTeacherId]);

  // 100% Clean URLs for seamless user experience:
  const homeLink = '/';
  const isHomeActive = pathname === '/' || pathname.startsWith('/teachers/');
  const isCoursesActive = pathname === '/courses' || pathname.startsWith('/courses');
  const isAboutActive = pathname === '/about' || pathname.startsWith('/about');
  const isContactActive = pathname === '/contact' || pathname.startsWith('/contact');

  // Determine Active Platform Mode:
  // True if: Logged-in teacher (isTeacher), on a /teachers/[slug] route, or student with focused academy, or guest with referral link
  const isTeacherStorefrontMode = !isForcedMarketplace && Boolean(
    routeTeacherId ||
    (user && isTeacher) ||
    (isStudent && preferredTeacherId && preferredTeacherId !== 'global') ||
    (!user && guestTeacherId && guestTeacherId !== 'global')
  );

  // 1. Marketplace Navigation Menu Category (১০০% ক্লিন ও পিওর SEO URL)
  const marketplaceNavLinks = [
    { name: t('home') || 'হোম', href: '/', isActive: isHomeActive },
    { name: t('courses') || 'কোর্স', href: '/courses', isActive: isCoursesActive },
    { name: 'About', href: '/about', isActive: isAboutActive },
  ];

  // 2. Dynamic Teacher Storefront Navigation Menu Category (শিক্ষকের নিজস্ব কাস্টম একাডেমি মেনু - ১০০% ক্লিন URL)
  const defaultTeacherBasePages = [
    { id: 'home', name: t('home') || 'হোম', href: '/' },
    { id: 'courses', name: t('courses') || 'কোর্স', href: '/courses' },
    { id: 'about', name: 'About', href: '/about' },
    { id: 'contact', name: t('contact') || (pathname.includes('/bn') ? 'যোগাযোগ' : 'Contact'), href: '/contact' },
  ];

  // Merge platform global pages with default base pages ensuring excludedTeacherIds are preserved
  const allMergedGlobalPages = defaultTeacherBasePages.map(bp => {
    const matched = platformGlobalPages.find(gp => gp.id === bp.id || gp.slug === bp.href);
    return {
      ...bp,
      excludedTeacherIds: matched?.excludedTeacherIds || []
    };
  });

  // Also append any custom global pages created by Super Admin
  platformGlobalPages.forEach(gp => {
    if (!allMergedGlobalPages.some(bp => bp.id === gp.id || bp.href === gp.slug)) {
      allMergedGlobalPages.push({
        id: gp.id,
        name: gp.name,
        href: gp.slug,
        excludedTeacherIds: gp.excludedTeacherIds || []
      } as any);
    }
  });

  const teacherDisabledPages = storefrontTeacherData?.disabledPages || [];
  const teacherCustomNavs = (storefrontTeacherData?.customNavLinks || []).filter(c => c.enabled !== false);

  // Filter out excluded / disabled global pages
  const filteredBasePages = allMergedGlobalPages.filter(page => {
    const isGloballyExcluded = effectiveTeacherId ? ((page as any).excludedTeacherIds || []).includes(effectiveTeacherId) : false;
    const isManuallyDisabled = teacherDisabledPages.includes(page.id);
    return !isGloballyExcluded && !isManuallyDisabled;
  });

  // Dynamic Storefront Menu
  const teacherStorefrontNavLinks = [
    ...filteredBasePages.map(p => ({
      name: p.name,
      href: p.href,
      isActive: p.href === '/' 
        ? (pathname === '/' || pathname.startsWith('/teachers/')) 
        : (pathname === p.href || pathname.startsWith(p.href))
    })),
    ...teacherCustomNavs.map(c => ({
      name: c.name,
      href: c.slug,
      isActive: pathname === c.slug || pathname.startsWith(c.slug)
    }))
  ];

  // Active Menu List based on platform mode
  const activePublicNavLinks = isTeacherStorefrontMode ? teacherStorefrontNavLinks : marketplaceNavLinks;

  // Dashboard Nav Links (Account Settings is handled in the bottom profile popup menu)
  const studentDashboardLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Daily Exams', href: '/dashboard/exams', icon: GraduationCap },
  ];

  const teacherDashboardLinks = [
    { name: 'Overview', href: '/teacher-dashboard', icon: LayoutDashboard },
    { name: '+ Create New Course', href: '/teacher-dashboard/courses/create', icon: PlusCircle, isHighlight: true },
    { name: 'My Courses', href: '/teacher-dashboard/courses', icon: Video },
    { name: 'Website Builder', href: '/teacher-dashboard/home-builder', icon: Globe },
    { name: 'My Website', href: '/', icon: Globe },
    { name: 'Posts & Notices', href: '/teacher-dashboard/posts', icon: Megaphone },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
    { name: 'Earnings', href: '/teacher-dashboard/earnings', icon: DollarSign },
  ];

  // Course Specific Links
  const teacherCourseLinks = [
    { name: 'Overview', href: `/teacher-dashboard/courses/${courseId}`, icon: LayoutDashboard, exact: true },
    { name: 'Enrollments', href: `/teacher-dashboard/courses/${courseId}/enrollments`, icon: ClipboardList },
    { name: 'Students', href: `/teacher-dashboard/courses/${courseId}/students`, icon: GraduationCap },
    { name: 'Curriculum', href: `/teacher-dashboard/courses/${courseId}/curriculum`, icon: BookOpen },
    { name: 'Student Issues', href: `/teacher-dashboard/courses/${courseId}/issues`, icon: AlertCircle },
    { name: 'Live Classes', href: `/teacher-dashboard/courses/${courseId}/live-classes`, icon: Video },
    { name: 'Resources', href: `/teacher-dashboard/courses/${courseId}/resources`, icon: FileText },
    { name: 'Exams & Quizzes', href: `/teacher-dashboard/courses/${courseId}/exams`, icon: CheckSquare },
    { name: 'Instructors', href: `/teacher-dashboard/courses/${courseId}/instructors`, icon: Users },
    { name: 'Community', href: `/teacher-dashboard/courses/${courseId}/community`, icon: MessageSquare },
    { name: 'Course Details', href: `/teacher-dashboard/courses/${courseId}/settings`, icon: Settings },
  ];

  const studentCourseLinks = [
    { name: 'Overview', href: `/dashboard/courses/${courseId}`, icon: LayoutDashboard, exact: true },
    { name: 'Recorded Classes', href: `/dashboard/courses/${courseId}/recorded-classes`, icon: Video },
    { name: 'Syllabus', href: `/dashboard/courses/${courseId}/syllabus`, icon: BookOpen },
    { name: 'Live Classes', href: `/dashboard/courses/${courseId}/live-classes`, icon: Video },
    { name: 'Resources', href: `/dashboard/courses/${courseId}/resources`, icon: FileText },
    { name: 'Exams & Quizzes', href: `/dashboard/courses/${courseId}/exams`, icon: CheckSquare },
    { name: 'Community', href: `/dashboard/courses/${courseId}/community`, icon: MessageSquare },
    { name: 'Help & Doubts', href: `/dashboard/courses/${courseId}/help`, icon: HelpCircle },
  ];

  const avatarUrl = userData?.profilePhoto || userData?.photoURL || userData?.photoUrl || user?.photoURL;

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isTeacherStorefrontMode 
          ? 'bg-background/85 backdrop-blur-md border-b border-foreground/10' 
          : 'bg-background/80 dark:bg-[#070b14]/80 backdrop-blur-xl sm:backdrop-blur-2xl border-b border-foreground/[0.08] dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
      }`}>
        {/* Marketplace subtle bottom liquid accent line */}
        {!isTeacherStorefrontMode && (
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/25 to-transparent pointer-events-none" />
        )}
        <div className={`${isDashboard ? 'w-full' : 'max-w-[1280px]'} mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]`}>
          <div className="flex justify-between items-center h-20 gap-4 md:gap-6">
            {/* Left Side: Logo + Nav Links together */}
            <div className="flex items-center gap-6 lg:gap-8 z-10">
              {/* Logo (Dynamic: Teacher Academy Branding vs Marketplace SkyLearners Logo) */}
              <Link href={homeLink} className="flex items-center gap-2 shrink-0 group transition-transform duration-200 hover:scale-[1.02]">
                {isTeacherStorefrontMode && (storefrontTeacherData?.headerLogo || storefrontTeacherData?.logoUrl) ? (
                  /* Pure Brand Logo Image - No redundant text beside it */
                  <div className="relative h-10 sm:h-11 md:h-12 w-auto max-w-[180px] sm:max-w-[240px] flex items-center justify-start py-0.5">
                    <img 
                      src={storefrontTeacherData.headerLogo || storefrontTeacherData.logoUrl} 
                      alt={preferredTeacherName || 'Teacher Logo'} 
                      className="h-full w-auto max-h-12 max-w-[180px] sm:max-w-[240px] object-contain object-left" 
                    />
                  </div>
                ) : isTeacherStorefrontMode && preferredTeacherName ? (
                  /* Fallback to Avatar + Name + Tagline only when NO image logo is uploaded */
                  <div className="flex items-center gap-2.5">
                    {storefrontTeacherData?.profilePhoto ? (
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-orange-500/30 bg-orange-500/10 shadow-sm shrink-0">
                        <img src={storefrontTeacherData.profilePhoto} alt={preferredTeacherName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shadow-md shadow-orange-500/20 text-sm">
                        {preferredTeacherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm sm:text-base leading-tight text-foreground group-hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-[200px]">
                        {preferredTeacherName}
                      </span>
                      <span className="text-[10px] font-semibold text-orange-500 leading-none">
                        {storefrontTeacherData?.headerTagline || 'Teacher Academy'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-[140px] h-[38px] sm:w-[165px] sm:h-[44px] md:w-[185px] md:h-[48px] flex items-center justify-start">
                    <Image src="/Skylearnars Academy logo.png" alt="Sky Learners Logo" fill className="object-contain object-left" priority />
                  </div>
                )}
              </Link>

              {/* Desktop Navigation Links directly beside Logo */}
              <div className="hidden md:flex items-center">
                {isTeacherStorefrontMode ? (
                  /* Modern Buttery-Smooth Sliding Pill Navigation for Teacher Storefront */
                  <TeacherStorefrontNav navLinks={activePublicNavLinks} />
                ) : (
                  /* Liquid Soft Marketplace Desktop Navigation Links */
                  <div className="flex items-center gap-1 lg:gap-2">
                    {activePublicNavLinks.map((item) => {
                      if (item.href === '/courses') {
                        return <CourseMegaMenu key="desktop-courses-mega-menu" />;
                      }
                      return (
                        <Link 
                          key={item.href + item.name} 
                          href={item.href} 
                          className={`relative px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                            item.isActive 
                              ? 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 shadow-xs' 
                              : 'text-foreground/80 hover:text-foreground hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Center-Right Search Bar (10 Minute School Style) - Only visible on public site pages, hidden on dashboard */}
            {!isDashboard && (
              <div className="hidden md:flex flex-1 max-w-[260px] lg:max-w-[320px] mx-auto items-center">
                <HeaderSearchBar 
                  isTeacherStorefrontMode={isTeacherStorefrontMode} 
                  activeTeacherId={effectiveTeacherId} 
                />
              </div>
            )}

            {/* Desktop Controls (Right) */}
            <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5 pl-2 shrink-0">
              {isTeacherStorefrontMode || isTeacherDashboard ? (
                <>
                  <TeacherThemeToggle />
                  <TeacherLanguageToggle instanceId="desktop-teacher-lang" />
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <LanguageToggle />
                </>
              )}
                
                {loading ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-foreground/10 animate-pulse rounded-full"></div>
                ) : user ? (
                  <div className="relative group">
                    {isTeacherStorefrontMode ? (
                      /* Tier 2 & Tier 3 Teacher Storefront: Sleek, compact Icon-only Dashboard Trigger */
                      <Link 
                        href={userProfileLink}
                        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-foreground/[0.04] hover:bg-orange-500/10 dark:bg-white/[0.06] dark:hover:bg-orange-500/15 border border-orange-500/30 hover:border-orange-500/60 shadow-xs hover:shadow-[0_0_12px_rgba(249,115,22,0.25)] transition-all duration-200 group"
                        title={user?.displayName || userData?.name || (isAdmin ? 'Admin Dashboard' : isTeacher ? 'Teacher Dashboard' : 'Student Dashboard')}
                        aria-label="Dashboard Menu"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
                          ) : (
                            <LayoutDashboard className="w-4 h-4 text-orange-500 transition-transform duration-200 group-hover:scale-110" />
                          )}
                        </div>
                      </Link>
                    ) : (
                      /* Tier 1 Marketplace: Original Full Pill Badge with Role Text */
                      <Link 
                        href={userProfileLink}
                        className={`flex items-center ${hasCompletedRole ? 'gap-2 px-2.5 py-1.5' : 'p-1'} rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all font-medium text-xs text-foreground group`}
                        title={user?.displayName || userData?.name || (isTeacher ? 'Teacher' : 'Student')}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        {hasCompletedRole ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                              : (isTeacher ? 'bg-orange-500/15 text-orange-500' : 'bg-blue-500/15 text-blue-500')
                          }`}>
                            {isAdmin ? 'Admin' : (isTeacher ? 'Teacher' : 'Student')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                            Setup
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Desktop Hover Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-foreground/15 rounded-2xl shadow-2xl p-2 space-y-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                      <div className="px-3 py-2 border-b border-foreground/10">
                        <p className="text-xs font-bold text-foreground truncate">{user?.displayName || userData?.name || 'User'}</p>
                        <p className="text-[11px] text-foreground/50 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15 hover:from-purple-500/25 hover:to-indigo-500/25 border border-purple-500/30 text-purple-400 font-bold text-xs transition-all shadow-sm"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-purple-300">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight flex items-center gap-1.5 text-purple-300">
                              Admin Panel <Sparkles className="w-3 h-3 text-amber-400" />
                            </p>
                            <p className="text-[10px] text-purple-300/70 leading-tight">Database & Controls</p>
                          </div>
                        </Link>
                      )}

                      {isTeacher ? (
                        <>
                          <Link 
                            href="/teacher-dashboard" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium text-xs transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                              <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-bold leading-tight">Teacher Dashboard</p>
                              <p className="text-[10px] text-foreground/50 leading-tight">Overview & Analytics</p>
                            </div>
                          </Link>

                          {user?.uid && !isAdmin && (
                            <Link 
                              href="/"
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 text-orange-500" /> View Live Website
                            </Link>
                          )}

                          <Link 
                            href="/teacher-dashboard/home-builder" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5 text-orange-500" /> Website Builder
                          </Link>

                          <Link 
                            href="/teacher-dashboard/courses" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-foreground/60" /> My Created Courses
                          </Link>

                          <Link 
                            href="/teacher-dashboard/students" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-foreground/60" /> Enrolled Students
                          </Link>

                          <Link 
                            href="/teacher-dashboard/earnings" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-foreground/60" /> Earnings & Revenue
                          </Link>
                        </>
                      ) : isStudent ? (
                        <>
                          <Link 
                            href="/dashboard" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-xs transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-bold leading-tight">Student Dashboard</p>
                              <p className="text-[10px] text-foreground/50 leading-tight">Learning & Progress</p>
                            </div>
                          </Link>

                          <Link 
                            href="/dashboard/courses" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-foreground/60" /> My Courses
                          </Link>

                          <Link 
                            href="/dashboard/exams" 
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-foreground/60" /> Daily Exams
                          </Link>
                        </>
                      ) : (
                        <Link 
                          href="/onboarding" 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-xs transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight">Complete Setup</p>
                            <p className="text-[10px] text-foreground/50 leading-tight">Select your role</p>
                          </div>
                        </Link>
                      )}

                      {hasCompletedRole && (
                        <>
                          <div className="h-px bg-foreground/10 my-1"></div>
                          <Link 
                            href={isTeacher ? '/teacher-dashboard/settings' : '/dashboard/settings'} 
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-foreground/60" /> Account Settings
                          </Link>
                        </>
                      )}

                      {/* Active Academy Indicator for Students */}
                      {isStudent && (
                        <div className="p-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/10 space-y-1.5 my-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-foreground/50">
                            <span>বর্তমান একাডেমি:</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${isCustomTeacherMode ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                              {isCustomTeacherMode ? 'ফোকাসড' : 'মার্কেটপ্লেস'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                              {isCustomTeacherMode ? <Building2 className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-foreground truncate">
                                {isCustomTeacherMode ? (preferredTeacherName || 'শিক্ষক একাডেমি') : 'SkyLearners মার্কেটপ্লেস'}
                              </p>
                            </div>
                          </div>
                          <Link
                            href="/dashboard/settings"
                            className="text-[10px] font-bold text-orange-500 hover:underline flex items-center gap-1 pt-0.5"
                          >
                            <span>⚙️ পরিবর্তন / সুইচ সেটিংস</span>
                          </Link>
                        </div>
                      )}

                      {/* Dual Site Switcher (Main Site vs Teacher Site) - Strictly Super Admin */}
                      {isAdmin && (
                        <div className="pt-2 pb-1">
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-foreground/[0.04] border border-foreground/10 rounded-xl">
                            <Link 
                              href="/?view=marketplace" 
                              onClick={() => setShowProfileMenu(false)}
                              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center shadow-xs ${
                                isForcedMarketplace 
                                  ? 'bg-blue-500 text-white border-blue-600' 
                                  : 'bg-background hover:bg-blue-500/10 hover:border-blue-500/30 border-foreground/10 text-foreground/80 hover:text-blue-500'
                              }`}
                              title="মূল মার্কেটপ্লেস ওয়েবসাইট (সারাদেশের সব কোর্স)"
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Main Site</span>
                            </Link>

                            <Link 
                              href="/" 
                              onClick={() => setShowProfileMenu(false)}
                              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center shadow-xs ${
                                !isForcedMarketplace 
                                  ? 'bg-orange-500 text-white border-orange-600' 
                                  : 'bg-background hover:bg-orange-500/10 hover:border-orange-500/30 border-foreground/10 text-foreground/80 hover:text-orange-500'
                              }`}
                              title="আমার নিজস্ব শিক্ষক ওয়েবসাইট / স্টোরফ্রন্ট"
                            >
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Teacher Site</span>
                            </Link>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => setShowLogoutConfirm(true)} 
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-500 text-xs font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={effectiveTeacherId ? `/register?ref=${effectiveTeacherId}` : '/register'} 
                    className="relative group px-5 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm text-white overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center shrink-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 transition-all" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 font-black tracking-wide">Login / Join</span>
                  </Link>
                )}
              </div>

            {/* Mobile / Tablet Controls (Toggles + Hamburger Trigger) */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
              {isTeacherStorefrontMode || isTeacherDashboard ? (
                <>
                  <TeacherThemeToggle />
                  <TeacherLanguageToggle instanceId="mobile-teacher-lang" />
                </>
              ) : (
                <>
                  <ThemeToggle />
                            <LanguageToggle />
                </>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all ml-0.5"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Off-Canvas Drawer Menu (Ultra-Smooth Liquid Spring Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowProfileMenu(false);
              }}
            />

            {/* Drawer Content Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 32, 
                stiffness: 300, 
                mass: 0.75 
              }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] z-[101] bg-background/98 dark:bg-slate-950/98 backdrop-blur-2xl border-l border-foreground/15 shadow-[-16px_0_50px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Top Header Bar */}
              <div className="flex items-center justify-between p-4 border-b border-foreground/10 bg-foreground/[0.03]">
                <div className="flex items-center gap-2">
                  {isTeacherStorefrontMode || isTeacherDashboard ? (
                    <>
                      <TeacherThemeToggle />
                      <TeacherLanguageToggle instanceId="drawer-teacher-lang" />
                    </>
                  ) : (
                    <>
                      <ThemeToggle />
                      <LanguageToggle />
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation Scroll Area */}
              <div className="space-y-5 flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* CASE 1: Inside Specific Course Dashboard */}
                {isCourseDashboard ? (
                  <div className="space-y-4">
                    {/* Back Button */}
                    <Link
                      href={isTeacherCourseDashboard ? "/teacher-dashboard/courses" : "/dashboard/courses"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-500/10 border border-orange-500/20 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{isTeacherCourseDashboard ? 'Back to All Courses' : 'Back to My Courses'}</span>
                    </Link>

                    {/* Course Header Card */}
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 shadow-sm space-y-2">
                      {currentCourseData?.thumbnailUrl && (
                        <div className="w-full h-24 relative rounded-xl overflow-hidden border border-foreground/10">
                          <Image src={currentCourseData.thumbnailUrl} alt={currentCourseData.title || 'Course'} fill className="object-cover" />
                        </div>
                      )}
                      <h4 className="font-bold text-sm text-foreground line-clamp-2" title={currentCourseData?.title || currentCourseTitle}>
                        {currentCourseData?.title || currentCourseTitle || 'Course Management'}
                      </h4>
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {currentCourseData?.category || (isTeacherCourseDashboard ? 'Teacher View' : 'Student Learning')}
                      </span>
                    </div>

                    {/* Course Navigation Items */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-2">
                        Course Menu
                      </div>
                      {(isTeacherCourseDashboard ? teacherCourseLinks : studentCourseLinks).map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                              isActive 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20 border-orange-400/30' 
                                : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground border-transparent hover:border-foreground/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="flex-1">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : isDashboard ? (
                  /* CASE 2: Inside Main Dashboard (Student or Teacher) */
                  <div className="space-y-3">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-orange-500/90 px-3 py-1 bg-orange-500/10 rounded-full w-fit border border-orange-500/20 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>{isTeacherDashboard ? 'Teacher Dashboard' : 'Student Dashboard'}</span>
                    </div>
                    
                    <div className="space-y-1.5 pt-1">
                      {(isTeacherDashboard ? teacherDashboardLinks : studentDashboardLinks).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all border ${
                              isActive
                                ? isTeacherDashboard 
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20 border-orange-400/30' 
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 border-blue-400/30'
                                : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground border-transparent hover:border-foreground/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="flex-1">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* CASE 3: Public Site Pages (Marketplace vs Teacher Storefront Menu) */
                  <div className="space-y-3">
                    {/* Teacher Storefront Mini Brand Profile Card (Only in Teacher Mode) */}
                    {isTeacherStorefrontMode && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 shadow-xs mb-2 flex items-center gap-3">
                        {storefrontTeacherData?.headerLogo || storefrontTeacherData?.logoUrl ? (
                          <div className="h-10 w-auto max-w-[110px] flex items-center shrink-0">
                            <img 
                              src={storefrontTeacherData.headerLogo || storefrontTeacherData.logoUrl} 
                              alt={preferredTeacherName || 'Academy Logo'} 
                              className="h-full w-auto max-h-10 object-contain object-left" 
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm shadow-orange-500/20 shrink-0">
                            {(preferredTeacherName || 'T').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-sm text-foreground truncate">
                            {preferredTeacherName || 'Teacher Academy'}
                          </p>
                          <p className="text-[10px] font-semibold text-orange-500 truncate">
                            {storefrontTeacherData?.headerTagline || 'অফিশিয়াল একাডেমি'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mobile Search Bar */}
                    <div className="px-1 pt-1 pb-1">
                      <HeaderSearchBar 
                        isTeacherStorefrontMode={isTeacherStorefrontMode} 
                        activeTeacherId={effectiveTeacherId} 
                      />
                    </div>

                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-1 flex items-center justify-between">
                      <span>Navigation</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 font-mono">
                        {isTeacherStorefrontMode ? 'Teacher Academy' : 'Marketplace'}
                      </span>
                    </div>
                    {activePublicNavLinks.map((item) => {
                      if (!isTeacherStorefrontMode && item.href === '/courses') {
                        return (
                          <CourseMegaMenu 
                            key="mobile-courses-mega-menu" 
                            isMobile={true} 
                            onItemClick={() => setIsMobileMenuOpen(false)} 
                          />
                        );
                      }
                      return (
                        <Link
                          key={item.href + item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                            item.isActive 
                              ? isTeacherStorefrontMode
                                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 border-orange-400/40 ring-1 ring-orange-400/30'
                                : 'bg-primary text-primary-foreground shadow-md shadow-primary/30 border-primary/40'
                              : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground border-transparent hover:border-foreground/10'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse' : 'bg-transparent'}`}></span>
                            <span>{item.name}</span>
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${item.isActive ? 'text-white translate-x-0.5' : 'opacity-40'}`} />
                        </Link>
                      );
                    })}

                    {user && (
                      <Link
                        href={userProfileLink}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 mt-3 rounded-xl font-bold text-sm bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 transition-all shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          {isTeacher ? 'Teacher Dashboard' : (isStudent ? 'Student Dashboard' : 'Complete Setup')}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}

              </div>

              {/* Bottom Fixed User Profile Card */}
              <div className="p-4 border-t border-foreground/10 bg-foreground/[0.02] relative">
                {user ? (
                  <>
                    {/* Popover Menu on Click / Hover */}
                    {showProfileMenu && (
                      <div className="absolute bottom-full left-4 right-4 mb-3 bg-background border border-foreground/10 rounded-2xl shadow-2xl p-2 space-y-1 animate-in slide-in-from-bottom-2 duration-200 z-50">
                        {isTeacher ? (
                          <>
                            <Link 
                              href="/teacher-dashboard"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-bold transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-orange-500" /> Teacher Dashboard
                            </Link>

                            <Link 
                              href="/teacher-dashboard/courses"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                            >
                              <Video className="w-4 h-4 text-foreground/60" /> My Courses
                            </Link>

                            <Link 
                              href="/teacher-dashboard/students"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                            >
                              <Users className="w-4 h-4 text-foreground/60" /> Enrolled Students
                            </Link>

                            <Link 
                              href="/teacher-dashboard/earnings"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                            >
                              <DollarSign className="w-4 h-4 text-foreground/60" /> Earnings & Revenue
                            </Link>

                            {/* Dual Site Switcher (Main Site vs Teacher Site) */}
                            {isAdmin && (
                              <div className="pt-2 pb-1 border-t border-foreground/10 my-1">
                                <p className="text-[10px] font-bold text-foreground/40 px-1 mb-1.5 uppercase tracking-wider">Site Switcher</p>
                                <div className="grid grid-cols-2 gap-1.5 p-1 bg-foreground/[0.04] border border-foreground/10 rounded-xl">
                                  <Link 
                                    href="/?view=marketplace" 
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        sessionStorage.removeItem('referralTeacherId');
                                        window.dispatchEvent(new Event('storage'));
                                      }
                                      setIsMobileMenuOpen(false);
                                      setShowProfileMenu(false);
                                    }}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-bold transition-all text-center shadow-xs ${
                                      isForcedMarketplace 
                                        ? 'bg-blue-500 text-white border-blue-600' 
                                        : 'bg-background hover:bg-blue-500/10 border-foreground/10 text-foreground/80 hover:text-blue-500'
                                    }`}
                                  >
                                    <Globe className="w-3.5 h-3.5 shrink-0" />
                                    <span>Main Site</span>
                                  </Link>

                                  <Link 
                                    href="/" 
                                    onClick={() => {
                                      if (typeof window !== 'undefined' && user?.uid) {
                                        sessionStorage.setItem('referralTeacherId', user.uid);
                                        window.dispatchEvent(new Event('storage'));
                                      }
                                      setIsMobileMenuOpen(false);
                                      setShowProfileMenu(false);
                                    }}
                                    className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-bold transition-all text-center shadow-xs ${
                                      !isForcedMarketplace 
                                        ? 'bg-orange-500 text-white border-orange-600' 
                                        : 'bg-background hover:bg-orange-500/10 border-foreground/10 text-foreground/80 hover:text-orange-500'
                                    }`}
                                  >
                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Teacher Site</span>
                                  </Link>
                                </div>
                              </div>
                            )}

                            <Link 
                              href="/teacher-dashboard/home-builder"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                            >
                              <Globe className="w-4 h-4 text-orange-500" /> Website Builder
                            </Link>
                          </>
                        ) : isStudent ? (
                          <>
                            <Link 
                              href="/dashboard"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-500/10 text-blue-500 text-sm font-bold transition-colors"
                            >
                              <GraduationCap className="w-4 h-4" /> Student Dashboard
                            </Link>
                            <Link 
                              href="/dashboard/courses"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }} 
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 text-foreground/80 hover:text-foreground text-xs font-medium transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-foreground/60" /> My Courses
                            </Link>
                          </>
                        ) : (
                          <Link 
                            href="/onboarding"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setShowProfileMenu(false);
                            }} 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold transition-colors"
                          >
                            <Sparkles className="w-4 h-4" /> Complete Setup
                          </Link>
                        )}

                        {hasCompletedRole && (
                          <Link 
                            href={isTeacher ? "/teacher-dashboard/settings" : "/dashboard/settings"}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setShowProfileMenu(false);
                            }} 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                          >
                            <Settings className="w-4 h-4 text-foreground/70" /> Account Settings
                          </Link>
                        )}

                        {/* Active Academy Indicator for Students (Mobile) */}
                        {isStudent && (
                          <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/10 space-y-1.5 my-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-foreground/50">
                              <span>বর্তমান একাডেমি:</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${isCustomTeacherMode ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                {isCustomTeacherMode ? 'ফোকাসড একাডেমি' : 'মার্কেটপ্লেস'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                {isCustomTeacherMode ? <Building2 className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-foreground truncate">
                                  {isCustomTeacherMode ? (preferredTeacherName || 'শিক্ষক একাডেমি') : 'SkyLearners মার্কেটপ্লেস'}
                                </p>
                              </div>
                            </div>
                            <Link
                              href="/dashboard/settings"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setShowProfileMenu(false);
                              }}
                              className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1 pt-0.5"
                            >
                              <span>⚙️ একাডেমি পরিবর্তন / সেটিংস</span>
                            </Link>
                          </div>
                        )}
                        <div className="h-px bg-foreground/10 my-1 mx-2"></div>
                        <button 
                          onClick={() => setShowLogoutConfirm(true)} 
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    )}

                    {/* Profile Card Button */}
                    <div 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 w-full p-3 rounded-2xl bg-background hover:bg-foreground/5 border border-foreground/10 hover:border-orange-500/30 transition-all cursor-pointer select-none shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-orange-500/20">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">
                          {user.displayName || userData?.name || 'User Account'}
                        </p>
                        <p className="text-[11px] text-foreground/50 truncate capitalize">
                          {userData?.role || 'Member'}
                        </p>
                      </div>
                      <MoreVertical className="w-4 h-4 text-foreground/40 shrink-0" />
                    </div>
                  </>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Login / Join</span>
                  </Link>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-foreground/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirm Logout</h3>
              <p className="text-foreground/60 text-sm">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="flex border-t border-foreground/10">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 py-4 font-medium hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </button>
              <div className="w-px bg-foreground/10"></div>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setIsMobileMenuOpen(false);
                  logout();
                }} 
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSelectRole={handleRoleSelect} 
      />
    </>
  );
}
