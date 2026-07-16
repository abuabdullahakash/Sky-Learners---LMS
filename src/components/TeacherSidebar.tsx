"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, Video, Users, DollarSign, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TeacherSidebar() {
  const t = useTranslations('Dashboard.sidebar');
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: t('overview') || 'Overview', href: '/teacher-dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/teacher-dashboard/courses', icon: Video },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
    { name: 'Earnings', href: '/teacher-dashboard/earnings', icon: DollarSign },
    { name: 'My Profile', href: '/teacher-dashboard/profile', icon: UserCircle },
    { name: t('settings') || 'Settings', href: '/teacher-dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col justify-between sticky top-[120px] lg:top-[160px] h-[calc(100vh-140px)] lg:h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden border-r border-foreground/5 pr-4 custom-scrollbar">
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
                  ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                  : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          {t('logout') || 'Logout'}
        </button>
      </div>
    </aside>
  );
}
