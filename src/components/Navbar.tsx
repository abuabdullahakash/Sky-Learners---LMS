"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
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
  UserCircle
} from 'lucide-react';
import RoleSelectionModal from './RoleSelectionModal';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { user, userData, loading, logout } = useAuth();
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentCourseTitle, setCurrentCourseTitle] = useState('');

  const courseId = params?.courseId as string;

  // Path & Context detection
  const isStudentDashboard = pathname.startsWith('/dashboard');
  const isTeacherDashboard = pathname.startsWith('/teacher-dashboard');
  const isDashboard = isStudentDashboard || isTeacherDashboard;

  const parts = pathname.split('/');
  const coursesIndex = parts.indexOf('courses');
  
  const isTeacherCourseDashboard = isTeacherDashboard && coursesIndex !== -1 && parts.length > coursesIndex + 1 && parts[coursesIndex + 1] !== 'create';
  const isStudentCourseDashboard = isStudentDashboard && coursesIndex !== -1 && parts.length > coursesIndex + 1;
  const isCourseDashboard = isTeacherCourseDashboard || isStudentCourseDashboard;

  // Fetch course title for course dashboard header in drawer
  useEffect(() => {
    if (courseId && isCourseDashboard) {
      const fetchTitle = async () => {
        try {
          const docRef = doc(db, 'courses', courseId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCurrentCourseTitle(docSnap.data().title || '');
          }
        } catch (err) {
          console.error("Error fetching course title for navbar drawer", err);
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

  const isTeacher = userData?.role === 'teacher';

  // Dashboard Nav Links
  const studentDashboardLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Daily Exams', href: '/dashboard/exams', icon: GraduationCap },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const teacherDashboardLinks = [
    { name: 'Overview', href: '/teacher-dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/teacher-dashboard/courses', icon: Video },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
    { name: 'Earnings', href: '/teacher-dashboard/earnings', icon: DollarSign },
    { name: 'Account Settings', href: '/teacher-dashboard/settings', icon: Settings },
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
  ];

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-background/85 backdrop-blur-md border-b border-foreground/10">
        <div className={`${isDashboard ? 'w-full' : 'max-w-[1280px]'} mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]`}>
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-10">
              <div className="relative w-[150px] h-[40px] sm:w-[180px] sm:h-[48px] md:w-[220px] md:h-[56px] flex items-center justify-start">
                <Image src="/Skylearnars Academy logo.png" alt="Sky Learners Logo" fill className="object-contain object-left" priority />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className={`font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary' : 'text-foreground/80'}`}>
                {t('home')}
              </Link>
              <Link href="/courses" className={`font-medium transition-colors hover:text-primary ${pathname === '/courses' ? 'text-primary' : 'text-foreground/80'}`}>
                {t('courses')}
              </Link>
              <Link href="/about" className={`font-medium transition-colors hover:text-primary ${pathname === '/about' ? 'text-primary' : 'text-foreground/80'}`}>
                About
              </Link>
              
              <div className="flex items-center gap-4 pl-4 border-l border-foreground/10">
                <ThemeToggle />
                <LanguageToggle />
                
                {loading ? (
                  <div className="w-[120px] h-[40px] bg-foreground/10 animate-pulse rounded-full"></div>
                ) : user ? (
                  <div className="flex items-center gap-4">
                    {userData?.onboardingComplete ? (
                      <Link href={userData?.role === 'teacher' ? '/teacher-dashboard' : '/dashboard'} className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full font-medium transition-colors border border-foreground/10">
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                    ) : (
                      <button 
                        onClick={() => setIsRoleModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full font-medium transition-colors border border-foreground/10 text-orange-500 hover:text-orange-600"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Account
                      </button>
                    )}
                  </div>
                ) : (
                  <Link href="/register" className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all">
                    Login / Join
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Controls (Toggles + Hamburger Trigger) */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground transition-all ml-1"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Off-Canvas Drawer Menu */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            setShowProfileMenu(false);
          }}
        ></div>

        {/* Drawer Content Panel */}
        <div 
          className={`absolute top-20 right-0 bottom-0 w-[85%] max-w-[340px] bg-background/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-foreground/10 shadow-2xl flex flex-col justify-between p-5 transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Top Main Navigation Body */}
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">

            {/* CASE 1: Inside Specific Course Dashboard */}
            {isCourseDashboard ? (
              <div className="space-y-3">
                {/* Back Button */}
                <Link
                  href={isTeacherCourseDashboard ? "/teacher-dashboard/courses" : "/dashboard/courses"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-500/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isTeacherCourseDashboard ? 'Back to All Courses' : 'Back to My Courses'}</span>
                </Link>

                {/* Course Header */}
                <div className="p-3 rounded-2xl bg-foreground/5 border border-foreground/10">
                  <h4 className="font-bold text-sm text-foreground line-clamp-2" title={currentCourseTitle}>
                    {currentCourseTitle || 'Course Management'}
                  </h4>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-primary/10 text-primary uppercase">
                    {isTeacherCourseDashboard ? 'Teacher View' : 'Student Learning'}
                  </span>
                </div>

                {/* Course Navigation Items */}
                <div className="space-y-1 pt-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-1">
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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                          isActive 
                            ? 'bg-orange-500 text-white font-bold shadow-md' 
                            : 'hover:bg-foreground/5 text-foreground/80'
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
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  {isTeacherDashboard ? 'Teacher Dashboard' : 'Student Dashboard'}
                </div>
                {(isTeacherDashboard ? teacherDashboardLinks : studentDashboardLinks).map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? isTeacherDashboard 
                            ? 'bg-orange-500 text-white font-bold shadow-md' 
                            : 'bg-primary text-white font-bold shadow-md'
                          : 'hover:bg-foreground/5 text-foreground/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* CASE 3: Public Site Pages (Home, Courses, About) */
              <div className="space-y-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-2">
                  Navigation
                </div>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pathname === '/' ? 'bg-primary text-white font-bold' : 'hover:bg-foreground/5 text-foreground/80'
                  }`}
                >
                  <span>{t('home')}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
                <Link
                  href="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pathname === '/courses' ? 'bg-primary text-white font-bold' : 'hover:bg-foreground/5 text-foreground/80'
                  }`}
                >
                  <span>{t('courses')}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    pathname === '/about' ? 'bg-primary text-white font-bold' : 'hover:bg-foreground/5 text-foreground/80'
                  }`}
                >
                  <span>About</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>

                {user && (
                  <Link
                    href={isTeacher ? '/teacher-dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 mt-3 rounded-xl font-bold text-sm bg-primary/10 text-primary border border-primary/20 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* Bottom Fixed User Profile Card (Matching Desktop Sidebar) */}
          <div className="pt-4 mt-4 border-t border-foreground/10 relative">
            {user ? (
              <>
                {/* Popover Menu on Click / Hover */}
                {showProfileMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-3 bg-background border border-foreground/10 rounded-2xl shadow-2xl p-2 space-y-1 animate-in slide-in-from-bottom-2 duration-200 z-50">
                    {isTeacher && (
                      <Link 
                        href="/teacher-dashboard/profile"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setShowProfileMenu(false);
                        }} 
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-foreground/70" /> View Profile
                      </Link>
                    )}
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
                  className="flex items-center gap-3 w-full p-3 rounded-2xl bg-foreground/[0.03] hover:bg-foreground/10 border border-foreground/10 transition-all cursor-pointer select-none"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-primary/20">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
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

        </div>
      </div>

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
