"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { MessageCircle, Send, Link as LinkIcon, ExternalLink, MessageSquare, Megaphone, Bell } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
}

interface CourseNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  teacherName?: string;
}

const PLATFORM_INFO: Record<string, { icon: React.FC<any>; colorClass: string; iconBg: string }> = {
  facebook_public: { icon: FacebookIcon, colorClass: 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20', iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  facebook_private: { icon: FacebookIcon, colorClass: 'border-blue-600/30 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20', iconBg: 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-500' },
  whatsapp: { icon: MessageCircle, colorClass: 'border-green-500/30 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20', iconBg: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' },
  telegram: { icon: Send, colorClass: 'border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20', iconBg: 'bg-sky-100 dark:bg-sky-500/20 text-sky-500 dark:text-sky-400' },
  discord: { icon: MessageSquare, colorClass: 'border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20', iconBg: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
  youtube: { icon: YoutubeIcon, colorClass: 'border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20', iconBg: 'bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400' },
  other: { icon: LinkIcon, colorClass: 'border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20', iconBg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400' },
};

export default function StudentCommunity() {
  const tHero = useTranslations('Dashboard.studentHero');
  const params = useParams();
  const courseId = params.courseId as string;
  const t = useTranslations('Community');
  
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [notices, setNotices] = useState<CourseNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          let fetchedLinks: CommunityLink[] = data.communityLinks || [];
          
          if (fetchedLinks.length === 0 && data.facebookGroupUrl) {
            fetchedLinks = [{
              id: 'legacy',
              platform: 'facebook_private',
              url: data.facebookGroupUrl
            }];
          }
          
          setLinks(fetchedLinks);
          setNotices(data.notices || []);
        }
      } catch (error) {
        console.error("Error fetching community & notices", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      
      {/* Hero Section */}
      <div className="relative w-full shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <MessageSquare className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">{tHero('badge')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm flex items-center gap-3">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />
              {tHero('communityTitle')}
            </h1>
            <p className="text-gray-300 text-sm font-medium">{tHero('communitySubtitle')}</p>
          </div>
        </div>
      </div>

      {/* 📢 Course Notices Section */}
      <div className="bg-white dark:bg-foreground/5 rounded-3xl p-6 border border-gray-200 dark:border-foreground/10 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-orange-500" />
          Teacher Announcements & Notices (নোটিশ বোর্ড)
        </h2>
        
        {notices.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-gray-200 dark:border-foreground/10 rounded-2xl">
            <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-foreground/60 text-sm font-medium">No teacher notices posted for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="p-5 bg-orange-500/5 dark:bg-foreground/5 rounded-2xl border border-orange-500/20 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full uppercase tracking-wider">Announcement</span>
                  <span className="text-xs text-foreground/50">{new Date(notice.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{notice.title}</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                {notice.teacherName && (
                  <p className="text-xs font-semibold text-primary pt-1">— {notice.teacherName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔗 Community Links Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          Community Groups
        </h2>

        {links.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-foreground/5 rounded-3xl border border-gray-200 dark:border-foreground/10">
            <MessageSquare className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('notActiveTitle')}</h3>
            <p className="text-gray-500 dark:text-foreground/60 text-sm mt-1">{t('notActiveSubtitle')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => {
              const info = PLATFORM_INFO[link.platform] || PLATFORM_INFO['other'];
              const Icon = info.icon;
              
              return (
                <Link 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group ${info.colorClass}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-sm ${info.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{t(`platforms.${link.platform}`)}</h3>
                      <p className="text-sm opacity-80 mt-1">{t('clickToJoin')}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
