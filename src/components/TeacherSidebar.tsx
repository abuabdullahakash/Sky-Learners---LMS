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

      <div className="p-4 mt-auto border-t border-foreground/5">
        <Link 
          href="/teacher-dashboard/settings"
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-foreground/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden shrink-0">
            {profileImage || user?.photoURL ? (
              <img src={profileImage || user?.photoURL || ''} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-foreground/50" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">
              {profileName || user?.displayName || userData?.name || 'Teacher'}
            </p>
            <p className="text-xs text-foreground/50 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
