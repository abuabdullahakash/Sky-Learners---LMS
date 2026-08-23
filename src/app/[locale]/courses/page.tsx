"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { BookOpen, Users, Star, Clock, Search, PlusCircle, Sparkles, Building2, GraduationCap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Link } from '@/i18n/routing';

export default function CoursesPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const [courses, setCourses] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        let q;

        // If teacher is logged in, fetch ONLY their own published courses
        if (user && isTeacher) {
          q = query(
            coursesRef, 
            where('teacherId', '==', user.uid), 
            where('isPublished', '==', true)
          );

          // Also fetch teacher's profile for dynamic branding
          try {
            const tDoc = await getDoc(doc(db, 'teacherProfiles', user.uid));
            if (tDoc.exists()) {
              setTeacherProfile(tDoc.data());
            }
          } catch (e) {
            console.error("Error fetching teacher profile:", e);
          }
        } else {
          // For guests and students, fetch all marketplace courses
          q = query(coursesRef, where('isPublished', '==', true));
        }

        const querySnapshot = await getDocs(q);
        const coursesData: any[] = [];
        const teacherCache: Record<string, string> = {};

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          let creatorName = data.coachingName || '';
          
          if (!creatorName && data.teacherId) {
            if (!teacherCache[data.teacherId]) {
              const tDoc = await getDoc(doc(db, 'teacherProfiles', data.teacherId));
              if (tDoc.exists()) {
                teacherCache[data.teacherId] = tDoc.data().displayName || 'Instructor';
              } else {
                teacherCache[data.teacherId] = 'Instructor';
              }
            }
            creatorName = teacherCache[data.teacherId];
          }

          coursesData.push({
            id: docSnap.id,
            ...data,
            instructorName: creatorName || 'Instructor'
          });
        }
        
        coursesData.sort((a: any, b: any) => {
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
  }, [user, isTeacher, authLoading]);

  // Filter courses by search query and category
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = searchQuery.trim() === '' || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || 
      (c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter tabs
  const categoriesSet = new Set<string>();
  courses.forEach(c => {
    if (c.category) categoriesSet.add(c.category);
  });
  const availableCategories = Array.from(categoriesSet);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const academyName = teacherProfile?.displayName || user?.displayName || 'আমাদের';

  return (
    <div className="min-h-[calc(100vh-80px)] pt-28 pb-16 bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>
              {user && isTeacher 
                ? `${academyName} • কোর্স পোর্টাল` 
                : 'এক্সপ্লোর করুন সকল কোর্স'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
            {user && isTeacher ? (
              <>
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-primary bg-clip-text text-transparent">
                  {academyName}
                </span>-এর সকল কোর্সসমূহ
              </>
            ) : (
              <>
                আমাদের <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">সকল কোর্সসমূহ</span>
              </>
            )}
          </h1>

          <p className="text-foreground/70 text-sm sm:text-base md:text-lg leading-relaxed">
            {user && isTeacher 
              ? 'আমাদের সকল প্রিমিয়াম ব্যাচ, এক্সাম এবং স্পেশাল লাইভ ক্লাসসমূহ এক নজরে দেখুন।'
              : 'আপনার পছন্দের কোর্সটি বেছে নিন এবং আজই শেখা শুরু করুন। সেরা শিক্ষকদের গাইডলাইনে প্রস্তুত হোন ভবিষ্যতের জন্য।'}
          </p>

          {/* Search Bar */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-background/90 border border-foreground/15 p-1.5 focus-within:border-primary/60 transition-all backdrop-blur-xl group">
              <div className="pl-4 pr-2 text-foreground/50 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কোর্সের নাম বা বিষয় দিয়ে খুঁজুন..."
                className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-foreground/40 focus:outline-none py-2 pr-4"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-foreground/40 hover:text-foreground px-3 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                }`}
              >
                সকল ({courses.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Courses Grid / Empty States */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-foreground/[0.02] rounded-3xl border border-foreground/10 max-w-lg mx-auto shadow-sm space-y-4">
            <BookOpen className="w-16 h-16 text-foreground/30 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              {searchQuery ? 'কোনো কোর্স খুঁজে পাওয়া যায়নি!' : (user && isTeacher ? 'আপনি এখনো কোনো কোর্স পাবলিশ করেননি!' : 'বর্তমানে কোনো কোর্স নেই')}
            </h2>
            <p className="text-foreground/60 text-sm max-w-md mx-auto">
              {user && isTeacher 
                ? 'শিক্ষার্থীদের জন্য আপনার কোর্স তৈরি করুন এবং পাবলিশ করে লাইভ নিয়ে আসুন।'
                : 'অনুসন্ধানের সাথে মিল রেখে কোনো কোর্স পাওয়া যায়নি। অন্য কোনো বিষয় দিয়ে চেষ্টা করুন।'}
            </p>
            {user && isTeacher && (
              <div className="pt-2">
                <Link
                  href="/teacher-dashboard/courses/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ নতুন কোর্স তৈরি করুন</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => {
              
              // Dynamic Badge Logic
              let badgeText = course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : (course.category || 'Course');
              if (course.eduClass) badgeText += ` ${course.eduClass}`;
              if (course.department && course.category !== 'admission' && course.category !== 'honours' && course.category !== 'masters') badgeText += ` (${course.department})`;
              
              if (course.isFullClassCourse !== false) {
                badgeText += ' (Full Course)';
              } else if (course.specificSubjects && course.specificSubjects.length > 0) {
                if (course.specificSubjects.length === 1) {
                  badgeText += ` • ${course.specificSubjects[0]}`;
                } else {
                  badgeText += ` • ${course.specificSubjects.length} Subjects`;
                }
              }

              // Discount & Pricing Logic
              const hasDiscountPrice = course.discountPrice !== undefined && course.discountPrice !== null && course.discountPrice !== '';
              let isDiscountValid = false;
              let expiryDate = null;
              if (hasDiscountPrice && course.discountValidUntil) {
                expiryDate = course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil);
                if (expiryDate && expiryDate > new Date()) {
                  isDiscountValid = true;
                }
              }

              const activePrice = isDiscountValid ? Number(course.discountPrice) : Number(course.price || 0);
              const isFree = activePrice === 0;

              return (
                <div key={course.id} className="bg-background rounded-3xl border border-foreground/10 hover:border-orange-500/50 active:border-orange-500 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-orange-500/10 overflow-hidden group flex flex-col relative">
                  
                  {isDiscountValid && (
                    <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold py-1 px-4 text-center z-20 uppercase tracking-widest shadow-md">
                      Discount Valid Till: {expiryDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}

                  <div className={`h-48 w-full bg-foreground/5 relative overflow-hidden ${isDiscountValid ? 'mt-6' : ''}`}>
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 bg-gradient-to-br from-foreground/5 to-foreground/10">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {isFree && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                        🎁 ফ্রি কোর্স
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col relative z-10 bg-background">
                    {/* Course Creator Name */}
                    <div className="text-orange-500 text-[12px] font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      {course.courseType === 'coaching' || course.coachingName ? (
                        <><Building2 className="w-3.5 h-3.5" /> <span>{course.coachingName || 'Coaching Center'}</span></>
                      ) : (
                        <><Users className="w-3.5 h-3.5" /> <span>{course.instructorName || 'Instructor'}</span></>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                    
                    {/* Badge Below Title */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="bg-foreground/5 border border-foreground/10 px-3 py-1 rounded-full text-xs font-extrabold text-foreground/80 w-fit">
                        {badgeText}
                      </div>
                      {isFree && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-extrabold w-fit">
                          🎁 ফ্রি
                        </div>
                      )}
                    </div>

                    <p className="text-foreground/60 mb-5 line-clamp-2 text-sm leading-relaxed">
                      {course.subtitle || 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন।'}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/70 mb-6 w-full">
                      {(course.enrolledStudents && course.enrolledStudents >= 20) ? (
                        <span className="flex items-center gap-1.5" title="Enrolled Students"><Users className="w-4 h-4 text-orange-500" /> {course.enrolledStudents}</span>
                      ) : null}
                      
                      <span className="flex items-center gap-1.5" title="Total Videos">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                        {course.totalVideoLessons || 0}
                      </span>
                      
                      <span className="flex items-center gap-1.5" title="Total Exams">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        {course.totalExams || 0}
                      </span>
                      
                      <span className="flex items-center gap-1.5 ml-auto" title="Duration"><Clock className="w-4 h-4 text-rose-500" /> {course.courseValidity || course.duration || 'Life-time'}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        {isFree ? (
                          isDiscountValid ? (
                            <>
                              <span className="text-xs text-foreground/50 line-through font-medium">৳{course.price}</span>
                              <span className="font-black text-2xl text-emerald-500">ফ্রি</span>
                            </>
                          ) : (
                            <span className="font-black text-2xl text-emerald-500">ফ্রি</span>
                          )
                        ) : isDiscountValid ? (
                          <>
                            <span className="text-xs text-foreground/50 line-through font-medium">৳{course.price}</span>
                            <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                              ৳{course.discountPrice}
                            </span>
                          </>
                        ) : (
                          <span className="font-black text-2xl text-foreground">
                            ৳{course.price}
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/courses/${course.id}`}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-95"
                      >
                        বিস্তারিত দেখুন
                      </Link>
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
