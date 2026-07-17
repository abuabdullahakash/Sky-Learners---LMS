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
        const q = query(coursesRef, where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        
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
    <div className="min-h-[calc(100vh-80px)] px-4 pt-28 pb-10 bg-background text-foreground">
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
            {courses.map((course) => {
              
              // Dynamic Badge Logic
              let badgeText = course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : (course.category || 'Course');
              if (course.eduClass) badgeText += ` ${course.eduClass}`;
              if (course.department && course.category !== 'admission' && course.category !== 'honours' && course.category !== 'masters') badgeText += ` (${course.department})`;
              
              if (course.isFullClassCourse !== false) {
                badgeText += ' (Full Course)';
              } else if (course.subjects && course.subjects.length > 0) {
                if (course.subjects.length === 1) {
                  badgeText += ` • ${course.subjects[0]}`;
                } else {
                  badgeText += ` • ${course.subjects.length} Subjects`;
                }
              }

              // Discount Logic
              let isDiscountValid = false;
              let expiryDate = null;
              if (course.discountPrice && course.discountValidUntil) {
                expiryDate = course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil);
                if (expiryDate && expiryDate > new Date()) {
                  isDiscountValid = true;
                }
              }

              return (
                <div key={course.id} className="bg-background rounded-3xl border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 overflow-hidden group flex flex-col relative">
                  
                  {isDiscountValid && (
                    <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold py-1 px-4 text-center z-20 uppercase tracking-widest shadow-md">
                      Discount Valid Till: {expiryDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}

                  <div className={`h-48 w-full bg-foreground/5 relative overflow-hidden ${isDiscountValid ? 'mt-6' : ''}`}>
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 bg-gradient-to-br from-foreground/5 to-foreground/10">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold shadow-lg border border-white/10 text-foreground">
                      {badgeText}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col relative z-10 bg-background">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-500 transition-all duration-300">{course.title}</h3>
                    <p className="text-foreground/60 mb-5 line-clamp-2 text-sm leading-relaxed">
                      {course.subtitle || 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন।'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/70 mb-6 bg-foreground/5 py-2 px-4 rounded-xl w-fit">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-orange-500" /> {course.coachingName || 'Instructor'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-rose-500" /> Life-time</span>
                    </div>

                    <div className="mt-auto pt-5 border-t border-foreground/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        {isDiscountValid ? (
                          <>
                            <span className="text-xs text-foreground/50 line-through font-medium">৳{course.price}</span>
                            <span className="font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                              ৳{course.discountPrice}
                            </span>
                          </>
                        ) : (
                          <span className="font-extrabold text-3xl text-foreground">
                            ৳{course.price}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => router.push(`/courses/${course.id}`)}
                        className="px-6 py-3 bg-foreground/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 text-foreground hover:text-white font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 active:scale-95"
                      >
                        বিস্তারিত
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
