"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { BookOpen, Users, Star, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function CoursesPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses');
        // Fetching all published courses
        const q = query(coursesRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-primary">আমাদের সকল কোর্সসমূহ</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            আপনার পছন্দের কোর্সটি বেছে নিন এবং আজই শেখা শুরু করুন। সেরা শিক্ষকদের গাইডলাইনে প্রস্তুত হোন ভবিষ্যতের জন্য।
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-foreground/10">
            <BookOpen className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">কোনো কোর্স পাওয়া যায়নি!</h2>
            <p className="text-foreground/60">বর্তমানে কোনো পাবলিশ করা কোর্স নেই। দয়া করে পরে আবার চেক করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-background rounded-3xl border border-foreground/10 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group flex flex-col">
                <div className="h-48 w-full bg-foreground/5 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-foreground/10">
                    {course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : course.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-foreground/60 mb-4 line-clamp-2 text-sm">
                    {course.subtitle || 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন।'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-foreground/70 mb-6">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> {course.coachingName || 'Instructor'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> Life-time</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between">
                    <div className="font-extrabold text-2xl text-primary">
                      ৳{course.price}
                    </div>
                    <button 
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="px-6 py-2.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary font-bold rounded-xl transition-colors"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
