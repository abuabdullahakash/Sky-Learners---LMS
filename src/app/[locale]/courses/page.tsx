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
  Sparkles, 
  Building2, 
  X, 
  Filter, 
  GraduationCap,
  Layers,
  ArrowRight,
  ArrowLeft,
  School,
  Award,
  Library,
  Flame,
  CheckCircle2,
  ChevronRight
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
  const urlSearch = searchParams.get('search');

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
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(urlClass || null);
  const [loading, setLoading] = useState(true);

  // Sync selectedCategory with urlCategory if present
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('all');
    }
    if (urlClass) {
      setSelectedClassFilter(urlClass);
    } else {
      setSelectedClassFilter(null);
    }
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlCategory, urlClass, urlSearch]);

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

  // Convert numbers to Bengali digits
  const toBnNum = (val: number | string) => {
    if (!isBn) return String(val);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  };

  // Helper for Category Labels
  const getCategoryMeta = (catId: string) => {
    switch (catId) {
      case 'primary':
        return {
          id: 'primary',
          nameBn: 'প্রাথমিক বিদ্যালয়',
          nameEn: 'Primary School',
          badgeBn: '১ম - ৫ম শ্রেণি',
          badgeEn: 'Class 1 to 5',
          descBn: 'ছোটদের পড়ালেখা হোক আনন্দের ও সহজ। ১ম থেকে ৫ম শ্রেণির সকল বিষয়ের সহজ পাঠ।',
          descEn: 'Foundational learning made enjoyable and simple for Class 1 to 5 students.',
          icon: School,
          color: 'from-amber-500/20 to-orange-500/10 border-orange-500/20 text-orange-500',
          badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
          classes: [
            { num: '1', bn: '১ম শ্রেণি', en: 'Class 1' },
            { num: '2', bn: '২য় শ্রেণি', en: 'Class 2' },
            { num: '3', bn: '৩য় শ্রেণি', en: 'Class 3' },
            { num: '4', bn: '৪র্থ শ্রেণি', en: 'Class 4' },
            { num: '5', bn: '৫ম শ্রেণি', en: 'Class 5' },
          ]
        };
      case 'high_school':
        return {
          id: 'high_school',
          nameBn: 'উচ্চ বিদ্যালয়',
          nameEn: 'High School',
          badgeBn: '৬ষ্ঠ - ১০ম শ্রেণি (SSC)',
          badgeEn: 'Class 6 to 10 (SSC)',
          descBn: 'জেএসসি ও এসএসসি পরীক্ষার সেরা প্রস্তুতি এবং গণিত-বিজ্ঞানের বেসিক মজবুত করার পূর্ণাঙ্গ কোর্স।',
          descEn: 'Comprehensive preparation for high school and SSC board exam excellence.',
          icon: GraduationCap,
          color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-500',
          badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
          classes: [
            { num: '6', bn: '৬ষ্ঠ শ্রেণি', en: 'Class 6' },
            { num: '7', bn: '৭ম শ্রেণি', en: 'Class 7' },
            { num: '8', bn: '৮ম শ্রেণি', en: 'Class 8' },
            { num: '9', bn: '৯ম শ্রেণি', en: 'Class 9' },
            { num: '10', bn: '১০ম শ্রেণি (এসএসসি)', en: 'Class 10 (SSC)' },
          ]
        };
      case 'intermediate':
        return {
          id: 'intermediate',
          nameBn: 'উচ্চ মাধ্যমিক (HSC)',
          nameEn: 'HSC / Higher Secondary',
          badgeBn: 'একাদশ ও দ্বাদশ শ্রেণি',
          badgeEn: 'Class 11 & 12',
          descBn: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগের জন্য অভিজ্ঞ শিক্ষকদের সাথে পূর্ণাঙ্গ এইচএসসি প্রস্তুতি।',
          descEn: 'Complete HSC preparation across Science, Arts, and Commerce streams.',
          icon: Award,
          color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-500',
          badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
          classes: [
            { num: '11', bn: 'একাদশ শ্রেণি', en: 'Class 11' },
            { num: '12', bn: 'দ্বাদশ শ্রেণি', en: 'Class 12' },
          ]
        };
      case 'admission':
        return {
          id: 'admission',
          nameBn: 'বিশ্ববিদ্যালয় ভর্তি',
          nameEn: 'University Admission',
          badgeBn: 'মেডিকেল / ইঞ্জিনিয়ারিং / ভার্সিটি',
          badgeEn: 'Medical / Engg / Varsity',
          descBn: 'বুয়েট, মেডিকেল, ঢাকা বিশ্ববিদ্যালয় সহ শীর্ষ বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার সফল প্রস্তুতি।',
          descEn: 'Targeted preparation for Medical, BUET, and University admission tests.',
          icon: Building2,
          color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/20 text-purple-500',
          badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
          classes: [
            { num: 'engineering', bn: 'ইঞ্জিনিয়ারিং', en: 'Engineering' },
            { num: 'medical', bn: 'মেডিকেল', en: 'Medical' },
            { num: 'university', bn: 'ভার্সিটি ইউনিট', en: 'Varsity' },
            { num: 'iba', bn: 'আইবিএ / বিউপি', en: 'IBA / BUP' },
          ]
        };
      case 'honours':
      case 'masters':
      case 'honours_masters':
        return {
          id: 'honours_masters',
          nameBn: 'অনার্স / মাস্টার্স',
          nameEn: 'Honours / Masters',
          badgeBn: 'সকল ডিপার্টমেন্ট ও বর্ষ',
          badgeEn: 'All Departments & Years',
          descBn: 'জাতীয় ও পাবলিক বিশ্ববিদ্যালয়ের বিভিন্ন বিষয়ের একাডেমিক সিলেবাস ও পরীক্ষার দিকনির্দেশনা।',
          descEn: 'University degree level academic curriculum and semester guidelines.',
          icon: Library,
          color: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-500',
          badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
          classes: []
        };
      case 'skills':
      default:
        return {
          id: 'skills',
          nameBn: 'দক্ষতা ও ক্যারিয়ার',
          nameEn: 'Skills & Career',
          badgeBn: 'আইটি ও প্রফেশনাল স্কিলস',
          badgeEn: 'IT & Professional',
          descBn: 'প্রোগ্রামিং, ডিজাইন, ডিজিটাল মার্কেটিং এবং আধুনিক ফ্রিল্যান্সিং ক্যারিয়ার গড়ে তোলার কোর্স।',
          descEn: 'Practical career skills in programming, digital design, and freelancing.',
          icon: Sparkles,
          color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-500',
          badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
          classes: []
        };
    }
  };

  const mainCategoriesList = ['primary', 'high_school', 'intermediate', 'admission', 'honours_masters', 'skills'];

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' || 
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.instructorName?.toLowerCase().includes(q) ||
      c.coachingName?.toLowerCase().includes(q) ||
      (c.specificSubjects && c.specificSubjects.some((s: any) => (typeof s === 'string' ? s : s.name)?.toLowerCase().includes(q)));

    // Category filter
    let matchesCategory = true;
    const catToMatch = (urlCategory && urlCategory !== 'all') ? urlCategory : (selectedCategory !== 'all' ? selectedCategory : null);
    if (catToMatch) {
      if (catToMatch === 'honours' || catToMatch === 'masters' || catToMatch === 'honours_masters') {
        matchesCategory = c.category === 'honours' || c.category === 'masters';
      } else {
        matchesCategory = c.category && c.category.toLowerCase() === catToMatch.toLowerCase();
      }
    }

    // Class filter (e.g. 1 to 12)
    let matchesClass = true;
    const activeClass = selectedClassFilter || urlClass;
    if (activeClass) {
      matchesClass = String(c.eduClass) === String(activeClass) || String(c.class) === String(activeClass) || String(c.department)?.toLowerCase() === String(activeClass)?.toLowerCase();
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

    return matchesSearch && matchesCategory && matchesClass && matchesGroup && matchesDepartment && matchesYear;
  });

  const isMarketplaceMode = !activeTeacherId;
  const isCategoryViewActive = Boolean((urlCategory && urlCategory !== 'all') || (selectedCategory !== 'all') || searchQuery.trim().length > 0 || urlClass);

  const activeCategoryMeta = getCategoryMeta(urlCategory || selectedCategory || 'primary');

  const handleSelectCategory = (catId: string, classNum?: string) => {
    setSelectedCategory(catId);
    setSelectedClassFilter(classNum || null);
    
    let path = `/courses?category=${catId}`;
    if (classNum) path += `&class=${classNum}`;
    router.push(path);
  };

  const handleBackToAllCategories = () => {
    setSelectedCategory('all');
    setSelectedClassFilter(null);
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

  return (
    <div className="min-h-[calc(100vh-80px)] pt-28 pb-20 bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px]">
        
        {/* ========================================================================= */}
        {/* CASE 1: GLOBAL MARKETPLACE MAIN COURSES HUB (WHEN NO CATEGORY IS SELECTED) */}
        {/* ========================================================================= */}
        {isMarketplaceMode && !isCategoryViewActive && (
          <div className="space-y-16 animate-in fade-in duration-200">
            
            {/* 🌟 Top Hero Banner Section */}
            <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-orange-500/10 border border-foreground/10 text-center shadow-xl">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>{isBn ? 'দেশের সেরা অনলাইন লার্নিং প্ল্যাটফর্ম' : 'Empowering Students to Succeed'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {isBn ? 'আপনার পছন্দের বিষয় ও ক্লাসে শিখুন' : 'Explore All Learning Categories'}
                </h1>

                <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                  {isBn 
                    ? 'প্রাথমিক বিদ্যালয় থেকে শুরু করে উচ্চ মাধ্যমিক, বিশ্ববিদ্যালয় ভর্তি ও ক্যারিয়ার স্কিল—সকল ক্যাটাগরির সেরা কোর্স এক ছাদের নিচে।'
                    : 'From Primary and High School to HSC, University Admission, and Professional Skills—find expert-crafted courses designed for excellence.'}
                </p>

                {/* Quick Stats Pill */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs sm:text-sm text-foreground/75 font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{toBnNum(courses.length)} {isBn ? 'টি সক্রিয় কোর্স' : 'Published Courses'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{isBn ? 'দেশসেরা শিক্ষকবৃন্দ' : 'Top Instructors'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>{isBn ? 'সার্টিফিকেট ও কুইজ' : 'Verified Certificates'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🗂️ All Category Sections Grid */}
            <div className="space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {isBn ? 'সকল শিক্ষাগত স্তর ও ক্যাটাগরি' : 'Educational Levels & Categories'}
                </h2>
                <p className="text-sm text-foreground/60">
                  {isBn ? 'যে স্তরের কোর্স পড়তে চান সেটি নির্বাচন করুন' : 'Select a category to discover curated classes and courses'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainCategoriesList.map((catId) => {
                  const meta = getCategoryMeta(catId);
                  const Icon = meta.icon;
                  
                  // Filter courses belonging to this category
                  const catCourses = courses.filter(c => {
                    if (catId === 'honours_masters') return c.category === 'honours' || c.category === 'masters';
                    return c.category?.toLowerCase() === catId;
                  });

                  return (
                    <div 
                      key={catId}
                      className="group relative rounded-2xl border border-foreground/10 bg-background/80 hover:bg-background/95 p-6 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div className="space-y-4">
                        {/* Header: Icon + Category Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${meta.color} border shrink-0 group-hover:scale-105 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.badgeColor}`}>
                            {isBn ? meta.badgeBn : meta.badgeEn}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {isBn ? meta.nameBn : meta.nameEn}
                          </h3>
                          <p className="text-xs sm:text-sm text-foreground/65 mt-1.5 leading-relaxed">
                            {isBn ? meta.descBn : meta.descEn}
                          </p>
                        </div>

                        {/* Quick Class / Subject Chips */}
                        {meta.classes.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/45 mb-2">
                              {isBn ? 'শ্রেণি / শাখা সমূহ:' : 'Available Classes:'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {meta.classes.map((cls) => (
                                <button
                                  key={cls.num}
                                  type="button"
                                  onClick={() => handleSelectCategory(catId, cls.num)}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary border border-foreground/10 transition-colors font-medium"
                                >
                                  {isBn ? cls.bn : cls.en}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action: Explore Button & Course Count */}
                      <div className="pt-6 mt-6 border-t border-foreground/10 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground/50">
                          {toBnNum(catCourses.length)} {isBn ? 'টি কোর্স লাইভ' : 'Active Courses'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(catId)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm group/btn"
                        >
                          <span>{isBn ? `${meta.nameBn} দেখুন` : `Explore`}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🌟 Recent / Featured Courses Preview Strip */}
            {courses.length > 0 && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {isBn ? 'জনপ্রিয় কোর্সসমূহ' : 'Popular Courses'}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-foreground/60">
                    {isBn ? 'সেরা শিক্ষকদের পাঠদানে নির্মিত' : 'Handcrafted by top mentors'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.slice(0, 6).map((course) => (
                    <div 
                      key={course.id}
                      className="group bg-background rounded-2xl border border-foreground/10 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Course Thumbnail */}
                        <div className="relative aspect-video w-full bg-foreground/5 overflow-hidden">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/40">
                              <BookOpen className="w-12 h-12" />
                            </div>
                          )}
                          {course.category && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                              {course.category}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-3">
                          <p className="text-xs font-semibold text-primary">
                            {course.coachingName || course.instructorName || 'Instructor'}
                          </p>
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          {course.subtitle && (
                            <p className="text-xs text-foreground/65 line-clamp-2">
                              {course.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 pt-0 flex items-center justify-between border-t border-foreground/5 mt-3 pt-3">
                        <div className="font-extrabold text-base text-foreground">
                          {course.price === 0 || !course.price ? (
                            <span className="text-emerald-500">{isBn ? 'ফ্রি' : 'Free'}</span>
                          ) : (
                            <span>৳{toBnNum(course.price)}</span>
                          )}
                        </div>
                        <Link
                          href={generateCourseUrl(course)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all"
                        >
                          {isBn ? 'বিস্তারিত দেখুন →' : 'View Details →'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: SINGLE CATEGORY SUBVIEW OR SEARCH (WITH BACK BUTTON & FILTERS)    */}
        {/* ========================================================================= */}
        {(!isMarketplaceMode || isCategoryViewActive) && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* ⬅️ Back Button & Category Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foreground/10">
              <button
                type="button"
                onClick={handleBackToAllCategories}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isBn ? '← সকল ক্যাটাগরিতে ফিরে যান' : '← Back to All Categories'}</span>
              </button>

              {/* Active Category Chips Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground/50">
                  {isBn ? 'মোট কোর্স:' : 'Total Courses:'}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {toBnNum(filteredCourses.length)}
                </span>
              </div>
            </div>

            {/* Category Header Hero */}
            <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${activeCategoryMeta.color} border flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeCategoryMeta.badgeColor}`}>
                    {isBn ? activeCategoryMeta.badgeBn : activeCategoryMeta.badgeEn}
                  </span>
                  {selectedClassFilter && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                      {isBn ? `ক্লাস: ${selectedClassFilter}` : `Class: ${selectedClassFilter}`}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {searchQuery ? `"${searchQuery}" এর সার্চ ফলাফল` : (isBn ? activeCategoryMeta.nameBn : activeCategoryMeta.nameEn)}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/75 max-w-xl leading-relaxed">
                  {isBn ? activeCategoryMeta.descBn : activeCategoryMeta.descEn}
                </p>
              </div>

              {/* Quick Class Sub-Filters within Category View */}
              {activeCategoryMeta.classes.length > 0 && (
                <div className="flex flex-wrap sm:flex-col gap-1.5 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-foreground/10 self-start shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 px-1">
                    {isBn ? 'ক্লাস ফিল্টার' : 'Filter by Class'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedClassFilter(null)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                        !selectedClassFilter ? 'bg-primary text-white font-bold' : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
                      }`}
                    >
                      {isBn ? 'সব' : 'All'}
                    </button>
                    {activeCategoryMeta.classes.map((c) => (
                      <button
                        key={c.num}
                        type="button"
                        onClick={() => setSelectedClassFilter(c.num)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          selectedClassFilter === c.num ? 'bg-primary text-white font-bold' : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
                        }`}
                      >
                        {isBn ? c.bn : c.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="group bg-background rounded-2xl border border-foreground/10 overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Course Thumbnail */}
                      <div className="relative aspect-video w-full bg-foreground/5 overflow-hidden">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/40">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                        {course.category && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                            {course.category}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-5 space-y-3">
                        <p className="text-xs font-semibold text-primary">
                          {course.coachingName || course.instructorName || 'Instructor'}
                        </p>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs text-foreground/65 line-clamp-2">
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-foreground/5 mt-3 pt-3">
                      <div className="font-extrabold text-base text-foreground">
                        {course.price === 0 || !course.price ? (
                          <span className="text-emerald-500">{isBn ? 'ফ্রি' : 'Free'}</span>
                        ) : (
                          <span>৳{toBnNum(course.price)}</span>
                        )}
                      </div>
                      <Link
                        href={generateCourseUrl(course)}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all"
                      >
                        {isBn ? 'বিস্তারিত দেখুন →' : 'View Details →'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-3xl border border-foreground/10 bg-foreground/[0.02] space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isBn ? 'এই ক্যাটাগরিতে বর্তমানে কোনো কোর্স নেই' : 'No courses found in this category'}
                </h3>
                <p className="text-xs text-foreground/60 max-w-md mx-auto">
                  {isBn ? 'নতুন কোর্স শীঘ্রই যুক্ত করা হবে। অন্য কোনো ক্যাটাগরি ঘুরে দেখতে পারেন।' : 'New courses are being prepared. Explore other categories.'}
                </p>
                <button
                  type="button"
                  onClick={handleBackToAllCategories}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                >
                  {isBn ? 'সকল ক্যাটাগরি দেখুন' : 'Explore All Categories'}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
