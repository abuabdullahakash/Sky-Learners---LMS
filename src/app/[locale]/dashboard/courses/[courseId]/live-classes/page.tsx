"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';

type LiveClass = {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
};

export default function StudentLiveClasses() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLiveClasses(data.liveClasses || []);
        }
      } catch (err) {
        console.error("Error fetching live classes", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium">Loading live classes...</div>
      </div>
    );
  }

  // Sort classes by date (upcoming first)
  const sortedClasses = [...liveClasses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Classes</h1>
          <p className="text-gray-600 dark:text-foreground/70 text-sm">Join upcoming live sessions scheduled by your instructor.</p>
        </div>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-foreground/10 rounded-3xl bg-gray-50 dark:bg-background/50">
          <div className="w-20 h-20 bg-gray-200 dark:bg-foreground/5 text-gray-400 dark:text-foreground/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Live Classes</h2>
          <p className="text-gray-500 dark:text-foreground/60 max-w-md mx-auto">
            There are currently no scheduled live classes for this course. Your instructor will notify you when a new session is added.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedClasses.map((cls, index) => (
            <div 
              key={cls.id} 
              className="bg-white dark:bg-foreground/5 border border-gray-100 dark:border-foreground/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-orange-500/30 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-md uppercase tracking-wider animate-pulse">Live</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{cls.title}</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-foreground/70 font-medium mt-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-foreground/10 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-500" /> 
                    <span>{cls.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-foreground/10 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-500" /> 
                    <span>{cls.time}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={cls.meetLink}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:-translate-y-1 shrink-0"
              >
                Join Live <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
