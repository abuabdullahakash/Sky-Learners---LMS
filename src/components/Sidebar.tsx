"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, BookOpen, GraduationCap, Settings, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const t = useTranslations('Dashboard.sidebar');
  const pathname = usePathname();
  const { user, userData, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('courses'), href: '/dashboard/courses', icon: BookOpen },
    { name: t('exams'), href: '/dashboard/exams', icon: GraduationCap },
  ];

  return (
    <aside className="w-full flex flex-col justify-between min-h-full overflow-x-hidden pr-2">
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

      <div className="p-4 mt-auto border-t border-foreground/5 relative group">
        
        {/* Hover Popover Menu */}
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-background border border-foreground/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
          <div className="p-2 space-y-1">
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors">
              <Settings className="w-4 h-4 text-foreground/70" /> Account Settings
            </Link>
            <div className="h-px bg-foreground/10 my-1 mx-2"></div>
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> {t('logout') || 'Log Out'}
            </button>
          </div>
        </div>

        {/* Profile Button */}
        <div className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-foreground/5 transition-all cursor-pointer bg-foreground/[0.02] border border-transparent hover:border-foreground/10">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.displayName || userData?.name || 'Student'}
              </p>
            </div>
            <p className="text-[11px] text-foreground/50 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
          <svg className="w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-foreground/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('confirmLogoutTitle') || 'Confirm Logout'}</h3>
              <p className="text-foreground/60 text-sm">
                {t('confirmLogoutMessage') || 'Are you sure you want to log out of your account?'}
              </p>
            </div>
            <div className="flex border-t border-foreground/10">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className="flex-1 py-4 font-medium hover:bg-foreground/5 transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <div className="w-px bg-foreground/10"></div>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }} 
                className="flex-1 py-4 font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                {t('confirm') || 'Yes, Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
