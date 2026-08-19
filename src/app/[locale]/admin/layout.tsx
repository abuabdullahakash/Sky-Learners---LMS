"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, Link } from '@/i18n/routing';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ArrowLeft, 
  Sparkles,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const isOwner = user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isAdmin = isOwner || userData?.isAdmin === true || userData?.role === 'admin';

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!isAdmin) {
        alert('Access Denied: Super Admin privileges required.');
        router.replace('/');
      } else {
        setAuthorized(true);
      }
    }
  }, [user, userData, loading, isAdmin, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">Verifying Super Admin Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* Top Super Admin Banner Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand / Title */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                      SkyLearners
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      Admin Control
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 hidden sm:block">Live Database & Platform Management</p>
                </div>
              </Link>
            </div>

            {/* Right: Quick shortcuts & Profile */}
            <div className="flex items-center gap-3">
              <Link 
                href="/teacher-dashboard"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                Teacher Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <Link 
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
              </Link>

              {/* Admin Avatar Pill */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full ring-2 ring-purple-500/40 bg-purple-900/50 flex items-center justify-center text-purple-200 font-bold text-xs overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[120px]">
                    {user?.displayName || 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-purple-400 font-medium leading-tight">Master Access</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}
