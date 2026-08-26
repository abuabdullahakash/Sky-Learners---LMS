"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Building2, 
  X, 
  Filter, 
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { generateCourseUrl } from '@/lib/slug';
import { Link } from '@/i18n/routing';

export default function CoursesPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const isBn = locale === 'bn';
  const searchParams = useSearchParams();
  const queryTeacherId = searchParams.get('teacherId');
  const isForcedMarketplace = searchParams.get('view') === 'marketplace';

  // URL Filters from Mega Menu & Search
  const urlCategory = searchParams.get('category');
  const urlClass = searchParams.get('class') || searchParams.get('eduClass');
  const urlGroup = searchParams.get('group');
  const urlDepartment = searchParams.get('department');
  const urlYear = searchParams.get('year');
  const urlTrack = searchParams.get('track');

  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
      if (stored && stored !== 'global') {
        setGuestTeacherId(stored);
      }
    }
  }, []);
  
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const preferredTeacherId = userData?.preferredTeacherId && userData.preferredTeacherId !== 'global' ? userData.preferredTeacherId : null;
  const activeTeacherId = isForcedMarketplace ? null : (isTeacher ? user?.uid : (preferredTeacherId || queryTeacherId || (!user ? guestTeacherId : null)));

  const [courses, setCourses] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Sync selectedCategory with urlCategory if present
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('all');
    }
  }, [urlCategory]);

  useEffect(() => {
    if (authLoading) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        let q;

        // If teacher is logged in OR student is in focused teacher mode, fetch ONLY that teacher's courses
        if (activeTeacherId) {
          q = query(
            coursesRef, 
            where('teacherId', '==', activeTeacherId), 
            where('isPublished', '==', true)
          );

          // Also fetch teacher's profile for dynamic branding
          try {
            const tDoc = await getDoc(doc(db, 'teacherProfiles', activeTeacherId));
            if (tDoc.exists()) {
              setTeacherProfile(tDoc.data());
            }
          } catch (e) {
            console.error("Error fetching teacher profile:", e);
          }
        } else {
          // For guests and students in marketplace mode, fetch all marketplace courses
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
  }, [activeTeacherId, authLoading]);

  // Filter & Smart-Rank courses by search query, category, and URL parameters
  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' || 
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.instructorName?.toLowerCase().includes(q) ||
      c.coachingName?.toLowerCase().includes(q) ||
      (c.specificSubjects && c.specificSubjects.some((s: any) => (typeof s === 'string' ? s : s.name)?.toLowerCase().includes(q)));

    // Category filter
    let matchesCategory = true;
    const catToMatch = urlCategory || (selectedCategory !== 'all' ? selectedCategory : null);
    if (catToMatch) {
      if (catToMatch === 'honours' || catToMatch === 'masters' || catToMatch === 'honours_masters') {
        matchesCategory = c.category === 'honours' || c.category === 'masters';
      } else {
        matchesCategory = c.category && c.category.toLowerCase() === catToMatch.toLowerCase();
      }
    }

    // Class filter (e.g. 1 to 12)
    let matchesClass = true;
    if (urlClass) {
      matchesClass = String(c.eduClass) === String(urlClass) || String(c.class) === String(urlClass);
    }

    // Group / Department filter
    let matchesGroup = true;
    if (urlGroup) {
      matchesGroup = Boolean(c.department && c.department.toLowerCase() === urlGroup.toLowerCase());
    }

    let matchesDepartment = true;
    if (urlDepartment) {
      matchesDepartment = Boolean(c.department && c.department.toLowerCase() === urlDepartment.toLowerCase());
    }

    // Year / Semester filter
    let matchesYear = true;
    if (urlYear) {
      matchesYear = Boolean(c.year && c.year.toLowerCase() === urlYear.toLowerCase());
    }

    // Track filter for skills
    let matchesTrack = true;
    if (urlTrack) {
      matchesTrack = (c.category === 'skills') && (
        c.title?.toLowerCase().includes(urlTrack.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(urlTrack.toLowerCase()) ||
        c.track === urlTrack
      );
    }

    return matchesSearch && matchesCategory && matchesClass && matchesGroup && matchesDepartment && matchesYear && matchesTrack;
  }).sort((a, b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const aInstructor = (a.coachingName || a.instructorName || '').toLowerCase();
      const bInstructor = (b.coachingName || b.instructorName || '').toLowerCase();

      const aExact = aTitle === q || aInstructor.includes(q);
      const bExact = bTitle === q || bInstructor.includes(q);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
    }
    const aCount = (a.enrolledStudents || a.enrolledCount || 0);
    const bCount = (b.enrolledStudents || b.enrolledCount || 0);
    return bCount - aCount;
  });

  // Extract unique categories for filter tabs
  const categoriesSet = new Set<string>();
  courses.forEach(c => {
    if (c.category) categoriesSet.add(c.category);
  });
  const availableCategories = Array.from(categoriesSet);

  // Friendly Category Label Helper
  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'primary': return isBn ? 'প্রাথমিক বিদ্যালয়' : 'Primary School';
      case 'high_school': return isBn ? 'উচ্চ বিদ্যালয়' : 'High School';
      case 'intermediate': return isBn ? 'উচ্চ মাধ্যমিক' : 'HSC';
      case 'admission': return isBn ? 'বিশ্ববিদ্যালয় ভর্তি' : 'University Admission';
      case 'honours': return isBn ? 'অনার্স' : 'Honours';
      case 'masters': return isBn ? 'মাস্টার্স' : 'Masters';
      case 'skills': return isBn ? 'দক্ষতা' : 'Skills';
      default: return cat;
    }
  };

  const getClassLabel = (cls: string) => {
    const num = parseInt(cls, 10);
    if (isNaN(num)) return cls;
    if (isBn) {
      const bnNums: Record<number, string> = {
        1: '১ম শ্রেণি', 2: '২য় শ্রেণি', 3: '৩য় শ্রেণি', 4: '৪র্থ শ্রেণি', 5: '৫ম শ্রেণি',
        6: '৬ষ্ঠ শ্রেণি', 7: '৭ম শ্রেণি', 8: '৮ম শ্রেণি', 9: '৯ম শ্রেণি', 10: '১০ম শ্রেণি (এসএসসি)',
        11: 'একাদশ শ্রেণি', 12: 'দ্বাদশ শ্রেণি'
      };
      return bnNums[num] || `${cls} শ্রেণি`;
    }
    return `Class ${cls}`;
  };

  const getGroupLabel = (grp: string) => {
    switch (grp.toLowerCase()) {
      case 'science': return isBn ? 'বিজ্ঞান বিভাগ' : 'Science';
      case 'arts': return isBn ? 'মানবিক বিভাগ' : 'Arts';
      case 'commerce': return isBn ? 'ব্যবসায় শিক্ষা' : 'Commerce';
      case 'engineering': return isBn ? 'ইঞ্জিনিয়ারিং ভর্তি' : 'Engineering';
      case 'medical': return isBn ? 'মেডিকেল ভর্তি' : 'Medical';
      case 'university': return isBn ? 'বিশ্ববিদ্যালয় ইউনিট' : 'Varsity Units';
      case 'iba': return isBn ? 'আইবিএ / বিউপি' : 'IBA / BUP';
      default: return grp;
    }
  };

  const hasActiveFilters = Boolean(urlCategory || urlClass || urlGroup || urlDepartment || urlYear || urlTrack || (selectedCategory !== 'all' && !urlCategory));

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    router.push('/courses');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFocusedAcademy = Boolean(activeTeacherId);
  const academyName = teacherProfile?.displayName || (isTeacher ? user?.displayName : '') || (isBn ? 'আমাদের একাডেমি' : 'Our Academy');

  return (
    <div className="min-h-[calc(100vh-80px)] pt-28 pb-16 bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>
              {isFocusedAcademy 
                ? (isBn ? `${academyName} • কোর্স পোর্টাল` : `${academyName} • Courses Portal`)
                : (isBn ? 'এক্সপ্লোর করুন সকল কোর্স' : 'Explore All Courses')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
            {isFocusedAcademy ? (
              <>
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-primary bg-clip-text text-transparent">
                  {academyName}
                </span>{isBn ? '-এর সকল কোর্সসমূহ' : ' Courses'}
              </>
            ) : (
              <>
                {isBn ? 'আমাদের ' : 'Browse Our '}
                <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {isBn ? 'সকল কোর্সসমূহ' : 'Featured Courses'}
                </span>
              </>
            )}
          </h1>

          <p className="text-foreground/70 text-sm sm:text-base md:text-lg leading-relaxed">
            {isFocusedAcademy 
              ? (isBn 
                  ? `${academyName}-এর সকল প্রিমিয়াম ব্যাচ, এক্সাম এবং স্পেশাল লাইভ ক্লাসসমূহ এক নজরে দেখুন।` 
                  : `Browse all premium batches, exams, and live classes by ${academyName}.`)
              : (isBn 
                  ? 'আপনার পছন্দের ক্লাস বা বিষয় নির্বাচন করুন এবং সেরা শিক্ষকদের গাইডলাইনে প্রস্তুত হোন ভবিষ্যতের জন্য।' 
                  : 'Select your preferred education level and excel with top educators and coaching centers.')}
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-background/90 border border-foreground/15 p-1.5 focus-within:border-primary/60 transition-all backdrop-blur-xl group">
              <div className="pl-4 pr-2 text-foreground/50 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? "কোর্সের নাম বা বিষয় দিয়ে খুঁজুন..." : "Search by course title, teacher or subject..."}
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

          {/* Active Applied Filters Banner */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-foreground/50 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-primary" />
                {isBn ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
              </span>

              {urlCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs">
                  <span>{getCategoryLabel(urlCategory)}</span>
                  <Link href="/courses" className="hover:text-primary/70 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              )}

              {urlClass && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold shadow-xs">
                  <span>{getClassLabel(urlClass)}</span>
                  <Link href={urlCategory ? `/courses?category=${urlCategory}` : '/courses'} className="hover:text-orange-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              )}

              {urlGroup && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-bold shadow-xs">
                  <span>{getGroupLabel(urlGroup)}</span>
                  <Link href={urlCategory ? `/courses?category=${urlCategory}` : '/courses'} className="hover:text-purple-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              )}

              {urlDepartment && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold shadow-xs">
                  <span>{urlDepartment}</span>
                  <Link href="/courses" className="hover:text-blue-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              )}

              {urlYear && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shadow-xs">
                  <span>{urlYear}</span>
                  <Link href={urlDepartment ? `/courses?department=${encodeURIComponent(urlDepartment)}` : '/courses'} className="hover:text-emerald-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-red-500 hover:text-red-600 underline px-2 py-1 transition-colors"
              >
                {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset All'}
              </button>
            </div>
          )}

          {/* Category Filter Pills (When no deep URL filter is selected) */}
          {availableCategories.length > 0 && !urlClass && !urlGroup && !urlYear && !urlDepartment && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  router.push('/courses');
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === 'all' && !urlCategory
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                }`}
              >
                {isBn ? `সকল (${courses.length})` : `All (${courses.length})`}
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    router.push(`/courses?category=${cat}`);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                    (selectedCategory === cat || urlCategory === cat)
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
                  }`}
                >
                  {getCategoryLabel(cat)}
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
              {searchQuery 
                ? (isBn ? 'কোনো কোর্স খুঁজে পাওয়া যায়নি!' : 'No matching courses found!') 
                : (user && isTeacher 
                    ? (isBn ? 'আপনি এখনো কোনো কোর্স পাবলিশ করেননি!' : "You haven't published any courses yet!") 
                    : (isBn ? 'বর্তমানে এই ক্যাটাগরিতে কোনো কোর্স নেই' : 'No courses available in this category currently'))}
            </h2>
            <p className="text-foreground/60 text-sm max-w-md mx-auto">
              {user && isTeacher 
                ? (isBn ? 'শিক্ষার্থীদের জন্য আপনার কোর্স তৈরি করুন এবং পাবলিশ করে লাইভ নিয়ে আসুন।' : 'Create and publish your curriculum from your dashboard.')
                : (isBn ? 'অন্য কোনো ক্লাস বা বিষয় নির্বাচন করে চেষ্টা করুন অথবা সকল কোর্স ব্রাউজ করুন।' : 'Try clearing your filters or search for another subject.')}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold text-xs transition-all"
                >
                  {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Clear All Filters'}
                </button>
              )}
              {user && isTeacher && (
                <Link
                  href="/teacher-dashboard/courses/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isBn ? '+ নতুন কোর্স তৈরি করুন' : '+ Create Course'}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => {
              
              // Dynamic Badge Logic
              let badgeText = course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? (isBn ? 'প্রাথমিক' : 'Primary') : course.category === 'high_school' ? (isBn ? 'উচ্চ বিদ্যালয়' : 'High School') : (course.category || 'Course');
              if (course.eduClass) badgeText += ` - ${getClassLabel(String(course.eduClass))}`;
              if (course.department && course.category !== 'admission' && course.category !== 'honours' && course.category !== 'masters') {
                badgeText += ` (${getGroupLabel(course.department)})`;
              }
              if (course.year) {
                badgeText += ` • ${course.year}`;
              }
              
              if (course.isFullClassCourse !== false) {
                badgeText += isBn ? ' (সম্পূর্ণ কোর্স)' : ' (Full Course)';
              } else if (course.specificSubjects && course.specificSubjects.length > 0) {
                if (course.specificSubjects.length === 1) {
                  badgeText += ` • ${course.specificSubjects[0]}`;
                } else {
                  badgeText += ` • ${course.specificSubjects.length} ${isBn ? 'টি বিষয়' : 'Subjects'}`;
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
                        🎁 {isBn ? 'ফ্রি কোর্স' : 'Free Course'}
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
                          🎁 {isBn ? 'ফ্রি' : 'Free'}
                        </div>
                      )}
                    </div>

                    <p className="text-foreground/60 mb-5 line-clamp-2 text-sm leading-relaxed">
                      {course.subtitle || (isBn ? 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন।' : 'Master essential concepts with structured curriculum.')}
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
                      
                      <span className="flex items-center gap-1.5 ml-auto" title="Duration"><Clock className="w-4 h-4 text-rose-500" /> {course.courseValidity || course.duration || (isBn ? 'লাইফ-টাইম' : 'Lifetime')}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        {isFree ? (
                          isDiscountValid ? (
                            <>
                              <span className="text-xs text-foreground/50 line-through font-medium">৳{course.price}</span>
                              <span className="font-black text-2xl text-emerald-500">{isBn ? 'ফ্রি' : 'Free'}</span>
                            </>
                          ) : (
                            <span className="font-black text-2xl text-emerald-500">{isBn ? 'ফ্রি' : 'Free'}</span>
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
                        href={generateCourseUrl(course)}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-95 flex items-center gap-1"
                      >
                        <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
