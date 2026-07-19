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
    const canJoin = cls.isLive || classTimeReached;
    const isEnded = !!cls.liveEndedAt && !cls.isLive;
    const hasAttended = user && cls.attendedStudents?.includes(user.uid);

    return (
      <div 
        key={cls.id} 
        className={`bg-white dark:bg-foreground/5 border border-gray-100 dark:border-foreground/10 p-6 rounded-xl shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group animate-in fade-in slide-in-from-bottom-4 ${canJoin ? 'hover:border-orange-500/50 hover:shadow-md ring-1 ring-transparent hover:ring-orange-500/20' : 'opacity-90'} ${isEnded ? 'opacity-70 grayscale-[0.2]' : ''}`}
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {cls.isLive ? (
              <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-sm shadow-red-500/20">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> 
                {t('liveNow')}
                {cls.liveStartedAt && (
                  <span className="ml-1 border-l border-white/30 pl-2 text-white/90 font-mono tracking-tighter">
                    {formatLiveDuration(cls.liveStartedAt)}
                  </span>
                )}
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
        
        <div className="shrink-0 flex flex-col items-center gap-2">
          {isEnded ? (
            <div className="flex flex-col items-center bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-none shadow-sm">
              <span className="text-sm text-white/90 font-bold mb-1">{t('classDuration')}</span>
              <span className="text-xl font-extrabold text-white font-mono">
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
      
      {/* Hero Banner */}
      <div className="relative w-full h-48 md:h-64 rounded bg-gray-900 overflow-hidden mb-8 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <Image 
            src="/images/course-banner.jpg" // Assuming a generic banner exists, or just use a nice gradient fallback
            alt="Live Classes Banner" 
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Fallback pattern if image fails */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
        </div>
        
        <div className="relative z-20 h-full flex items-center p-8 md:p-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> {t('liveSessions')}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t('title')}</h1>
            <p className="text-gray-300 md:text-lg">
              {t('subtitle')}
            </p>
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
            if (moduleClasses.length === 0) return null; // Don't show empty modules for students
            
            return (
              <div key={module.id} className="bg-white dark:bg-background rounded-none border border-gray-200 dark:border-foreground/10 overflow-hidden shadow-sm transition-all duration-300">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center gap-4 hover:from-orange-600 hover:to-red-600 transition-colors text-left"
                >
                  <div className="p-1 bg-white/20 rounded shadow-sm text-white">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-lg text-white flex-1">{module.title}</h3>
                  <span className="text-sm font-semibold text-orange-500 bg-white px-3 py-1 rounded-full">
                    {moduleClasses.length} {t('liveSessions')}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="p-4 md:p-6 space-y-4 bg-gray-50/50 dark:bg-background/50 border-t border-gray-200 dark:border-foreground/10">
                    {moduleClasses.map((cls, index) => renderClassCard(cls, index))}
                  </div>
                )}
              </div>
            );
          })}

          {generalClasses.length > 0 && (
            <div className="bg-white dark:bg-background rounded-none border border-gray-200 dark:border-foreground/10 overflow-hidden shadow-sm transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center gap-4 border-b border-transparent">
                <div className="p-1 bg-white/20 rounded shadow-sm text-white">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white flex-1">{t('generalClasses')}</h3>
                <span className="text-sm font-semibold text-orange-500 bg-white px-3 py-1 rounded-full">
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
