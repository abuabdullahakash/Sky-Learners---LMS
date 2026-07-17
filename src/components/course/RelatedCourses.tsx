"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BookOpen, Clock, Users, Book } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function RelatedCourses({ 
  currentCourseId, 
  teacherId, 
  category, 
  eduClass 
}: { 
  currentCourseId: string;
  teacherId: string;
  category?: string;
  eduClass?: string;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('CourseDetails');

  useEffect(() => {
    async function fetchRelatedCourses() {
      if (!teacherId) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'courses'),
          where('teacherId', '==', teacherId),
          where('isPublished', '==', true)
        );
        const snapshot = await getDocs(q);
        
        let allCourses: any[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== currentCourseId) {
            allCourses.push({ id: doc.id, ...doc.data() });
          }
        });

        // Sorting: Primary match (same category & eduClass), then others
        const primaryMatches = allCourses.filter(c => c.category === category && c.eduClass === eduClass);
        const others = allCourses.filter(c => !(c.category === category && c.eduClass === eduClass));

        const sorted = [...primaryMatches, ...others].slice(0, 3); // Limit to 3 for related courses
        setCourses(sorted);
      } catch (err) {
        console.error("Error fetching related courses", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedCourses();
  }, [currentCourseId, teacherId, category, eduClass]);

  if (loading) return null;
  if (courses.length === 0) return null;

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300 mt-16 pt-16 border-t border-foreground/10 relative z-10">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Book className="w-8 h-8 text-primary" /> 
        {t('relatedCourses') || 'Related Courses by this Instructor'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          // Badge Logic
          let badgeText = course.category === 'primary' ? 'Primary' :
                          course.category === 'high_school' ? 'High School' :
                          course.category === 'intermediate' ? 'HSC' :
                          course.category === 'honours' ? 'Honours' :
                          course.category === 'masters' ? 'Masters' :
                          course.category === 'admission' ? 'Admission' :
                          course.category === 'skills' ? 'Skills' : 'Course';

          if (course.eduClass) {
            badgeText += ` • Class ${course.eduClass}`;
          }

          if (course.isFullClassCourse) {
            badgeText += ` • Full Course`;
          } else if (course.specificSubjects && course.specificSubjects.length > 0) {
            if (course.specificSubjects.length === 1) {
              const subName = typeof course.specificSubjects[0] === 'string' ? course.specificSubjects[0] : course.specificSubjects[0].name;
              badgeText += ` • ${subName}`;
            } else {
              badgeText += ` • ${course.specificSubjects.length} Subjects`;
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
    </section>
  );
}
