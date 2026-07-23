"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/context/AuthContext';
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
  Sparkles
} from 'lucide-react';
import RoleSelectionModal from './RoleSelectionModal';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading, logout } = useAuth();
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/teacher-dashboard');

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  const studentDashboardLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Daily Exams', href: '/dashboard/exams', icon: GraduationCap },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const teacherDashboardLinks = [
    { name: 'Overview', href: '/teacher-dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/teacher-dashboard/courses', icon: Video },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
    { name: 'Earnings', href: '/teacher-dashboard/earnings', icon: DollarSign },
    { name: 'Settings', href: '/teacher-dashboard/settings', icon: Settings },
  ];

  const activeDashboardLinks = isTeacher ? teacherDashboardLinks : studentDashboardLinks;

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
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Drawer Content Panel */}
        <div 
          className={`absolute top-20 right-0 bottom-0 w-[85%] max-w-[340px] bg-background/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-foreground/10 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="space-y-6">
            
            {/* User Info / Role Badge */}
            {user ? (
              <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {user.displayName || userData?.name || 'User Account'}
                  </h4>
                  <p className="text-xs text-foreground/60 truncate capitalize">
                    {userData?.role || 'Member'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-center">
                <h4 className="font-bold text-base mb-1">SkyLearners LMS</h4>
                <p className="text-xs text-foreground/70 mb-3">Join thousands of students and teachers today.</p>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Login / Join Now
                </Link>
              </div>
            )}

            {/* Public Navigation Links */}
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
            </div>

            {/* Active Dashboard Links (If Logged In) */}
            {user && (
              <div className="space-y-1 pt-4 border-t border-foreground/10">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/40 px-3 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
                </div>
                {activeDashboardLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? isTeacher 
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
            )}

          </div>

          {/* Footer Actions inside Drawer */}
          {user && (
            <div className="pt-6 border-t border-foreground/10 mt-6">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}

        </div>
      </div>

      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSelectRole={handleRoleSelect} 
      />
    </>
  );
}
