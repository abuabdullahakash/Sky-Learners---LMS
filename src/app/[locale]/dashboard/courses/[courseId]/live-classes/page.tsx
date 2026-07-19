"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video, Calendar, Clock, ExternalLink, PlayCircle } from 'lucide-react';
import Image from 'next/image';

type LiveClass = {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  isLive?: boolean;
};

export default function StudentLiveClasses() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time listener for course changes (e.g., teacher clicking "Go Live")
  useEffect(() => {
    if (!courseId) return;
    const docRef = doc(db, 'courses', courseId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveClasses(data.liveClasses || []);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live classes in real-time", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  // Timer to check if it's time to activate the Join button
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium animate-pulse">Loading Live Classes...</div>
      </div>
    );
  }

  // Sort classes by date (upcoming first)
  const sortedClasses = [...liveClasses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> Live Sessions
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Course Live Classes</h1>
            <p className="text-gray-300 md:text-lg">
              Join upcoming live sessions scheduled by your instructor. Interactive learning right at your fingertips.
            </p>
          </div>
        </div>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-foreground/10 rounded bg-gray-50 dark:bg-background/50">
          <div className="w-20 h-20 bg-gray-200 dark:bg-foreground/5 text-gray-400 dark:text-foreground/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Live Classes</h2>
          <p className="text-gray-500 dark:text-foreground/60 max-w-md mx-auto">
            There are currently no scheduled live classes for this course. Your instructor will notify you when a new session is added.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 max-w-5xl mx-auto">
          {sortedClasses.map((cls, index) => {
            const classTimeReached = isTimeReached(cls.date, cls.time);
            const canJoin = cls.isLive || classTimeReached;

            return (
              <div 
                key={cls.id} 
                className={`bg-white dark:bg-foreground/5 border border-gray-100 dark:border-foreground/10 p-6 rounded shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group animate-in fade-in slide-in-from-bottom-4 ${canJoin ? 'hover:border-orange-500/50 hover:shadow-md ring-1 ring-transparent hover:ring-orange-500/20' : 'opacity-90'}`}
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {cls.isLive ? (
                      <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Live Now
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-foreground/10 text-gray-600 dark:text-foreground/70 text-xs font-bold rounded uppercase tracking-wider">
                        Upcoming
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
                      <span>{cls.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0 flex flex-col items-center gap-2">
                  {canJoin ? (
                    <a 
                      href={cls.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:-translate-y-1 animate-in zoom-in duration-300"
                    >
                      <PlayCircle className="w-5 h-5" /> Join Live
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="px-8 py-3.5 bg-gray-200 dark:bg-foreground/10 text-gray-400 dark:text-foreground/40 font-bold rounded cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      <Clock className="w-5 h-5" /> Starting Soon...
                    </button>
                  )}
                  
                  {!canJoin && (
                    <span className="text-xs text-gray-500 dark:text-foreground/50 font-medium">Button activates at class time</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
