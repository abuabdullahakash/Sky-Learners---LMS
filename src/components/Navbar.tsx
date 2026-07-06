"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export default function Navbar() {
  const t = useTranslations('Navigation');

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 border-b border-foreground/10 bg-background/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          Sky<span className="text-primary">Learners</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="font-medium hover:text-primary transition-colors">{t('home')}</Link>
          <Link href="/courses" className="font-medium hover:text-primary transition-colors">{t('courses')}</Link>
          <Link href="/dashboard" className="font-medium hover:text-primary transition-colors">{t('dashboard')}</Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
          <button className="px-5 py-2 bg-foreground text-background font-medium rounded-full hover:bg-foreground/80 transition-colors">
            {t('login')}
          </button>
        </div>
      </div>
    </nav>
  );
}
