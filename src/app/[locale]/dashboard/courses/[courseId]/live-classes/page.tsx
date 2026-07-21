"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video, Calendar, Clock, ExternalLink, PlayCircle, Users, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

type LiveClass = {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  isLive?: boolean;
  liveStartedAt?: number;
  liveEndedAt?: number;
  isAutoStart?: boolean;
  attendedStudents?: string[];
  moduleId?: string;
};

export default function StudentLiveClasses() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  const t = useTranslations('Dashboard.liveClasses');
  
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [liveModules, setLiveModules] = useState<{id: string, title: string}[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!courseId) return;
    const docRef = doc(db, 'courses', courseId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveClasses(data.liveClasses || []);
        setLiveModules(data.liveModules || []);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live classes in real-time", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Check every second
    return () => clearInterval(timer);
  }, []);

  const isTimeReached = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`);
    return currentTime >= classDateTime;
  };

  const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const formatLiveDuration = (startedAt: number) => {
    const diff = Math.floor((currentTime.getTime() - startedAt) / 1000);
    if (diff < 0) return "00:00";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleJoinLive = async (cls: LiveClass) => {
    if (user && !cls.attendedStudents?.includes(user.uid)) {
      try {
        const classRef = doc(db, 'courses', courseId);
        
        // Fetch latest data to prevent race conditions
        const { getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(classRef);
        
        if (docSnap.exists()) {
          const latestClasses = docSnap.data().liveClasses || [];
          const updatedClasses = latestClasses.map((c: LiveClass) => {
            if (c.id === cls.id) {
              const currentAttended = c.attendedStudents || [];
              return {
                ...c,
                attendedStudents: Array.from(new Set([...currentAttended, user.uid]))
              };
            }
            return c;
          });
          
          await updateDoc(classRef, { liveClasses: updatedClasses });
        }
      } catch (error) {
        console.error("Error updating attendance:", error);
      }
    }
    // Open meet link
    window.open(cls.meetLink, '_blank');
  };

  // Detect if link is from a platform that keeps public recordings
  const getRecordingPlatform = (url: string): 'facebook' | 'youtube' | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '');
      if (host === 'facebook.com' || host === 'fb.watch' || host === 'fb.com') return 'facebook';
      if (host === 'youtube.com' || host === 'youtu.be') return 'youtube';
    } catch { /* invalid url */ }
    return null;
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium animate-pulse">{t('loading')}</div>
      </div>
    );
  }

  // Sort classes by date (upcoming first)
  const sortedClasses = [...liveClasses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const renderClassCard = (cls: LiveClass, index: number) => {
    const classTimeReached = cls.isAutoStart && isTimeReached(cls.date, cls.time);
    const isAutoStarting = cls.isAutoStart && classTimeReached && !cls.isLive && !cls.liveEndedAt;
    const canJoin = cls.isLive || classTimeReached;
    const isEnded = !!cls.liveEndedAt && !cls.isLive;
    const hasAttended = user && cls.attendedStudents?.includes(user.uid);
    // Fallback: use scheduled time if isLive but liveStartedAt not yet written
    const effectiveLiveStart = cls.liveStartedAt || 
      (cls.isLive && cls.date && cls.time ? new Date(`${cls.date}T${cls.time}`).getTime() : undefined);

    return (
      <div 
        key={cls.id} 
        className={`bg-white dark:bg-foreground/5 border border-gray-200 dark:border-foreground/10 p-6 rounded-none shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group animate-in fade-in slide-in-from-bottom-4 ${canJoin ? 'hover:border-orange-500/50 hover:shadow-md' : 'opacity-90'} ${isEnded ? 'opacity-80' : ''}`}
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {cls.isLive ? (
              <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-sm shadow-red-500/20">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                {t('liveNow')}
                {effectiveLiveStart && (
                  <span className="ml-1 border-l border-white/30 pl-2 text-white/90 font-mono tracking-tighter">
                    {formatLiveDuration(effectiveLiveStart)}
                  </span>
                )}
              </span>
            ) : isAutoStarting ? (
              <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                Auto-starting...
              </span>
            ) : isEnded ? (
              <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow-sm">
                {t('completed')}
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-gray-100 dark:bg-foreground/10 text-gray-600 dark:text-foreground/70 text-xs font-bold rounded uppercase tracking-wider">
                {t('upcoming')}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{cls.title}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-foreground/70 font-medium mt-4">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-foreground/5 px-3 py-1.5 rounded">
              <Calendar className="w-4 h-4 text-orange-500" /> 
              <span>{cls.date}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-foreground/5 px-3 py-1.5 rounded">
              <Clock className="w-4 h-4 text-orange-500" /> 
              <span>{formatTime12Hour(cls.time)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-foreground/5 px-3 py-1.5 rounded">
              {hasAttended ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500"><CheckCircle className="w-4 h-4" /> {t('present')}</span>
              ) : isEnded ? (
                <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400"><XCircle className="w-4 h-4" /> {t('missed')}</span>
              ) : (
                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500"><Users className="w-4 h-4" /> {t('interactiveSession')}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="shrink-0 flex flex-col items-center gap-0">
          {isEnded ? (
            (() => {
              const platform = getRecordingPlatform(cls.meetLink);
              return (
                <div className="flex flex-col items-stretch overflow-hidden rounded-none shadow-sm">
                  <div className="flex flex-col items-center bg-gradient-to-r from-orange-500/80 to-red-500/80 px-5 py-2">
                    <span className="text-xs text-white/80 font-bold">{t('classDuration')}</span>
                    <span className="text-lg font-extrabold text-white font-mono leading-tight">
                      {cls.liveStartedAt && cls.liveEndedAt ? (
                        (() => {
                          const diff = Math.floor((cls.liveEndedAt - cls.liveStartedAt) / 1000);
                          const h = Math.floor(diff / 3600);
                          const m = Math.floor((diff % 3600) / 60);
                          const s = diff % 60;
                            if (h > 0) return `${h}h ${m}m ${s}s`;
                            return `${m}m ${s}s`;
                          })()
                        ) : t('ended')}
                    </span>
                  </div>
                  {platform && (
                    <a
                      href={cls.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 px-4 py-1.5 font-bold text-xs transition-all ${
                        platform === 'facebook'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-[#FF0000] text-white hover:bg-red-700'
                      }`}
                    >
                      {platform === 'facebook' ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      )}
                      {t('watchRecording')}
                    </a>
                  )}
                </div>
              );
            })()
          ) : canJoin ? (
            <button 
              onClick={() => handleJoinLive(cls)}
              className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:-translate-y-1 animate-in zoom-in duration-300"
            >
              <PlayCircle className="w-5 h-5" /> {t('joinLive')}
            </button>
          ) : (
            <button 
              disabled
              className="px-8 py-3.5 bg-gray-200 dark:bg-foreground/10 text-gray-400 dark:text-foreground/40 font-bold rounded cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <Clock className="w-5 h-5" /> {t('startingSoon')}
            </button>
          )}
          
          {!canJoin && !isEnded && (
            <span className="text-xs text-gray-500 dark:text-foreground/50 font-medium">
              {cls.isAutoStart ? t('autoStartNote') : t('manualStartNote')}
            </span>
          )}
        </div>
      </div>
    );
  };

  const generalClasses = sortedClasses.filter(c => !c.moduleId);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-12">
      
      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <Video className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></span> {t('liveSessions')}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">{t('title')}</h1>
            <p className="text-gray-300 text-sm font-medium">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-foreground/10 rounded bg-gray-50 dark:bg-background/50">
          <div className="w-20 h-20 bg-gray-200 dark:bg-foreground/5 text-gray-400 dark:text-foreground/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('noLiveClasses')}</h2>
          <p className="text-gray-500 dark:text-foreground/60 max-w-md mx-auto">
            {t('noLiveClassesDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {liveModules.map((module, mIndex) => {
            const moduleClasses = sortedClasses.filter(c => c.moduleId === module.id);
            const isExpanded = expandedModules.includes(module.id);
            const hasLiveClass = moduleClasses.some(c => c.isLive);
            if (moduleClasses.length === 0) return null; // Don't show empty modules for students
            
            return (
              <div key={module.id} className={`bg-white dark:bg-background rounded-none overflow-hidden shadow-sm transition-all duration-300 border-2 ${
                hasLiveClass 
                  ? 'border-red-500/60 hover:border-red-500 shadow-red-500/10' 
                  : 'border-orange-500/30 hover:border-orange-500/50'
              }`}>
                <button 
                  onClick={() => toggleModule(module.id)}
                  className={`w-full border-l-4 p-4 flex items-center gap-4 transition-colors text-left ${
                    hasLiveClass
                      ? 'bg-red-500/10 dark:bg-red-500/10 border-red-500 hover:bg-red-500/15'
                      : 'bg-orange-500/10 dark:bg-orange-500/10 border-orange-500 hover:bg-orange-500/15 dark:hover:bg-orange-500/15'
                  }`}
                >
                  <div className={`p-1 rounded ${
                    hasLiveClass 
                      ? 'bg-red-500/20 text-red-600 dark:text-red-400' 
                      : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                  }`}>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex-1">{module.title}</h3>
                  {hasLiveClass && (
                    <span className="flex items-center gap-1.5 mr-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-500 animate-pulse">LIVE</span>
                    </span>
                  )}
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    hasLiveClass
                      ? 'text-white bg-red-500 animate-pulse'
                      : 'text-orange-500 bg-orange-500/10'
                  }`}>
                    {hasLiveClass ? '🔴 ' : ''}{moduleClasses.length} {t('liveSessions')}
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 md:p-6 space-y-4 bg-gray-50/50 dark:bg-background/50 border-t border-gray-200 dark:border-foreground/10">
                    {moduleClasses.map((cls, index) => renderClassCard(cls, index))}
                  </div>
                </div>
              </div>
            );
          })}

          {generalClasses.length > 0 && (
            <div className="bg-white dark:bg-background rounded-none border-2 border-orange-500/30 hover:border-orange-500/50 overflow-hidden shadow-sm transition-all duration-300">
              <div className="bg-orange-500/10 dark:bg-orange-500/10 border-l-4 border-orange-500 text-foreground p-4 flex items-center gap-4 border-b border-gray-200 dark:border-foreground/10">
                <div className="p-1 bg-orange-500/20 rounded text-orange-600 dark:text-orange-400">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex-1">{t('generalClasses')}</h3>
                <span className="text-sm font-semibold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                  {generalClasses.length} {t('liveSessions')}
                </span>
              </div>
              <div className="p-4 md:p-6 space-y-4 bg-gray-50/50 dark:bg-background/50">
                {generalClasses.map((cls, index) => renderClassCard(cls, index))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
