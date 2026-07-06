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
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors font-medium text-sm"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'bn' ? 'EN' : 'বাংলা'}</span>
    </button>
  );
}
