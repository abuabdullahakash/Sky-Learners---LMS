"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon } from 'lucide-react';
import RoleSelectionModal from './RoleSelectionModal';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setIsRoleModalOpen(false);
    router.push(`/onboarding?role=${role}`);
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-[180px] h-[48px] md:w-[220px] md:h-[56px] lg:w-[260px] lg:h-[64px] overflow-hidden flex items-center justify-center">
                <Image src="/Sky learners academy.png" alt="Sky Learners Logo" fill className="object-contain scale-[1.7] origin-center" priority />
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
          </div>
        </div>
      </nav>

      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        onSelectRole={handleRoleSelect} 
      />
    </>
  );
}
