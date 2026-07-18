"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, Video, Users, DollarSign, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function TeacherSidebar() {
  const t = useTranslations('Dashboard.sidebar');
  const pathname = usePathname();
  const { user, userData } = useAuth();
  
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'teacherProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileName(docSnap.data().displayName || '');
          setProfileImage(docSnap.data().photoUrl || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  const menuItems = [
    { name: t('overview') || 'Overview', href: '/teacher-dashboard', icon: LayoutDashboard },
    { name: 'My Courses', href: '/teacher-dashboard/courses', icon: Video },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
    { name: 'Earnings', href: '/teacher-dashboard/earnings', icon: DollarSign },
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

      <div className="p-4 mt-auto border-t border-foreground/5 relative group">
        
        {/* Hover Popover Menu */}
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-background border border-foreground/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
          <div className="p-2 space-y-1">
            <Link href="/teacher-dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors">
              <UserCircle className="w-4 h-4 text-foreground/70" /> View Profile
            </Link>
            <Link href="/teacher-dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 text-sm font-medium transition-colors">
              <Settings className="w-4 h-4 text-foreground/70" /> Account Settings
            </Link>
            <div className="h-px bg-foreground/10 my-1 mx-2"></div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 text-sm font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> 
              Log Out
            </button>
          </div>
        </div>

        {/* Profile Button */}
        <div className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-foreground/5 transition-all cursor-pointer bg-foreground/[0.02] border border-transparent hover:border-foreground/10">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            {profileImage || user?.photoURL ? (
              <img src={profileImage || user?.photoURL || ''} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground truncate">
                {profileName || user?.displayName || userData?.name || 'Teacher'}
              </p>
            </div>
            <p className="text-[11px] text-foreground/50 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
          <svg className="w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </div>
      </div>
    </aside>
  );
}
