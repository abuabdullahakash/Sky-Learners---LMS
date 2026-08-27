"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLang = () => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-foreground/10 dark:border-white/10 transition-all font-semibold text-xs sm:text-sm shadow-xs active:scale-95 text-foreground/80 hover:text-foreground"
    >
      <Globe className="w-3.5 h-3.5 text-orange-500" />
      <span>{locale === 'bn' ? 'EN' : 'বাংলা'}</span>
    </button>
  );
}
