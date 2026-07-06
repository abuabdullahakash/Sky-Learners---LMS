"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, BookOpen, GraduationCap, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const t = useTranslations('Dashboard.sidebar');
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('courses'), href: '/dashboard/courses', icon: BookOpen },
    { name: t('exams'), href: '/dashboard/exams', icon: GraduationCap },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-foreground/10 bg-background/50 backdrop-blur-md hidden md:flex flex-col justify-between h-[calc(100vh-80px)] sticky top-20">
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-foreground/10">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
