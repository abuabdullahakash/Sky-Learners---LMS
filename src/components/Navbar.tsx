"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  return (
    <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/10">
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-extrabold text-2xl tracking-tight">Sky<span className="text-primary">Learners</span></span>
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
              
              {!loading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full font-medium transition-colors border border-foreground/10">
                      <UserIcon className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all">
                    Login
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
