"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState, useRef } from 'react';
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
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  School,
  Award,
  Library,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { generateCourseUrl } from '@/lib/slug';
import { Link } from '@/i18n/routing';

// Top Mentors Data by Category (Flat & Minimal)
const categoryMentors: Record<string, Array<{ name: string; institute: string; exp: string; photo: string; slug: string }>> = {
  primary: [
    {
      name: 'Abu Abdullah Akash',
      institute: 'Sky Learners Founder',
      exp: 'Primary Education Specialist',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Tahmina Akhter',
      institute: 'DU (Education)',
      exp: '6+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Mahmudul Hasan',
      institute: 'IUT (Child Math)',
      exp: '5+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Nusrat Jahan',
      institute: 'JU (English)',
      exp: '4+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ],
  high_school: [
    {
      name: 'Md Kamrul Hasan',
      institute: 'DU (Physics)',
      exp: '11+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Aman Islam Siam',
      institute: 'BUET (Math)',
      exp: '6+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Sabbir Ahmed Rifat',
      institute: 'RUET (Chemistry)',
      exp: '7+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Adittya Al-Razi',
      institute: 'DU (Biology)',
      exp: '5+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ],
  intermediate: [
    {
      name: 'Abu Abdullah Akash',
      institute: 'Physics Faculty',
      exp: 'HSC & Varsity Specialist',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Tanvir Hossain',
      institute: 'BUET (Math)',
      exp: '9+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Dr. Farhana Yasmin',
      institute: 'DMC (Biology)',
      exp: '8+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Shakil Anwar',
      institute: 'DU (Commerce)',
      exp: '10+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ],
  admission: [
    {
      name: 'Engr. Rakibul Islam',
      institute: 'BUET (Engineering)',
      exp: 'Admission Legend',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Dr. Sadia Rahman',
      institute: 'DMC (Medical)',
      exp: 'Medical Admission Head',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Arifuzzaman Shanto',
      institute: 'IBA (DU)',
      exp: 'IBA & BUP Trainer',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ],
  honours_masters: [
    {
      name: 'Abu Abdullah Akash',
      institute: 'Physics Faculty',
      exp: 'Degree Academic Mentor',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Prof. Anisur Rahman',
      institute: 'DU (Senior Mentor)',
      exp: '15+ Years Exp',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ],
  skills: [
    {
      name: 'Abu Abdullah Akash',
      institute: 'Full Stack & AI Dev',
      exp: 'Senior Web Architect',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    },
    {
      name: 'Zubair Al Mahmud',
      institute: 'Top-Rated Freelancer',
      exp: 'UI/UX & Digital Lead',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      slug: 'abu-abdullah-akash'
    }
  ]
};

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

          try {
            const tDoc = await getDoc(doc(db, 'teacherProfiles', activeTeacherId));
            if (tDoc.exists()) {
              setTeacherProfile(tDoc.data());
            }
          } catch (e) {
            console.error("Error fetching teacher profile:", e);
          }
        } else {
          // For marketplace mode, fetch all published courses
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

  // Helper for Category Metadata
  const getCategoryMeta = (catId: string) => {
    switch (catId) {
      case 'primary':
        return {
          id: 'primary',
          nameBn: 'প্রাথমিক বিদ্যালয়',
          nameEn: 'Primary School (Class 1-5)',
          badgeBn: '১ম - ৫ম শ্রেণি',
          badgeEn: 'Class 1 to 5',
          descBn: 'ছোটদের পড়ালেখা হোক আনন্দের ও সহজ। ১ম থেকে ৫ম শ্রেণির সকল বিষয়ের সহজ পাঠ ও ভিত্তি গঠন।',
          descEn: 'Foundational learning made enjoyable and simple for Class 1 to 5 students.',
          icon: School,
          colorBadge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
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
          nameBn: 'উচ্চ বিদ্যালয় (৬ষ্ঠ - ১০ম শ্রেণি)',
          nameEn: 'High School & SSC Preparation',
          badgeBn: '৬ষ্ঠ - ১০ম শ্রেণি (SSC)',
          badgeEn: 'Class 6 to 10 (SSC)',
          descBn: 'জেএসসি ও এসএসসি পরীক্ষার সেরা প্রস্তুতি এবং গণিত-বিজ্ঞানের বেসিক মজবুত করার পূর্ণাঙ্গ কোর্স।',
          descEn: 'Comprehensive preparation for high school and SSC board exam excellence.',
          icon: GraduationCap,
          colorBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
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
          nameEn: 'HSC & Intermediate Programs',
          badgeBn: 'একাদশ ও দ্বাদশ শ্রেণি',
          badgeEn: 'Class 11 & 12',
          descBn: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগের জন্য অভিজ্ঞ শিক্ষকদের সাথে পূর্ণাঙ্গ এইচএসসি প্রস্তুতি।',
          descEn: 'Complete HSC preparation across Science, Arts, and Commerce streams.',
          icon: Award,
          colorBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          classes: [
            { num: '11', bn: 'একাদশ শ্রেণি', en: 'Class 11' },
            { num: '12', bn: 'দ্বাদশ শ্রেণি', en: 'Class 12' },
          ]
        };
      case 'admission':
        return {
          id: 'admission',
          nameBn: 'বিশ্ববিদ্যালয় ভর্তি (Admission)',
          nameEn: 'University Admission Programs',
          badgeBn: 'মেডিকেল / ইঞ্জিনিয়ারিং / ভার্সিটি',
          badgeEn: 'Medical / Engg / Varsity',
          descBn: 'বুয়েট, মেডিকেল, ঢাকা বিশ্ববিদ্যালয় সহ শীর্ষ বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার সফল প্রস্তুতি।',
          descEn: 'Targeted preparation for Medical, BUET, and University admission tests.',
          icon: Building2,
          colorBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
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
          nameEn: 'Honours / Masters Degree Courses',
          badgeBn: 'সকল ডিপার্টমেন্ট ও বর্ষ',
          badgeEn: 'All Departments & Years',
          descBn: 'জাতীয় ও পাবলিক বিশ্ববিদ্যালয়ের বিভিন্ন বিষয়ের একাডেমিক সিলেবাস ও পরীক্ষার দিকনির্দেশনা।',
          descEn: 'University degree level academic curriculum and semester guidelines.',
          icon: Library,
          colorBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          classes: []
        };
      case 'skills':
      default:
        return {
          id: 'skills',
          nameBn: 'দক্ষতা ও ক্যারিয়ার (Skills)',
          nameEn: 'Professional Career Skills',
          badgeBn: 'আইটি ও প্রফেশনাল স্কিলস',
          badgeEn: 'IT & Professional',
          descBn: 'প্রোগ্রামিং, ডিজাইন, ডিজিটাল মার্কেটিং এবং আধুনিক ফ্রিল্যান্সিং ক্যারিয়ার গড়ে তোলার কোর্স।',
          descEn: 'Practical career skills in programming, digital design, and freelancing.',
          icon: Sparkles,
          colorBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          classes: []
        };
    }
  };

  const mainCategoriesList = ['primary', 'high_school', 'intermediate', 'admission', 'honours_masters', 'skills'];

  // Filter courses for active subview
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

  // Horizontal Scroll Handler for Mentors
  const scrollMentors = (containerId: string, direction: 'left' | 'right') => {
    const el = document.getElementById(containerId);
    if (el) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] pt-24 pb-20 bg-background text-foreground">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* CASE 1: GLOBAL MARKETPLACE MAIN COURSES HUB (NO CATEGORY SELECTED)       */}
        {/* ========================================================================= */}
        {isMarketplaceMode && !isCategoryViewActive && (
          <div className="space-y-12">
            
            {/* Top Clean Header */}
            <div className="border-b border-foreground/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {isBn ? 'গ্লোবাল লার্নিং মার্কেটপ্লেস' : 'All Courses & Academies'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                  {isBn ? 'সকল শিক্ষাগত স্তর ও ক্যাটাগরি' : 'Educational Levels & Category Hub'}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1 max-w-2xl">
                  {isBn 
                    ? 'আপনার পছন্দের বিষয় বা শ্রেণির কোর্স নির্বাচন করুন এবং সেরা শিক্ষকদের সাথে প্রস্তুতি নিন।' 
                    : 'Discover curated learning paths from primary foundation to board exams and university admission.'}
                </p>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/70 shrink-0">
                <span className="px-3 py-1.5 rounded-md bg-foreground/5 border border-foreground/10">
                  {toBnNum(courses.length)} {isBn ? 'টি সক্রিয় কোর্স' : 'Active Courses'}
                </span>
              </div>
            </div>

            {/* 🌟 Big Category Showcase Cards (Flat, No Shadows, Minimal Radius) */}
            <div className="space-y-10">
              {mainCategoriesList.map((catId) => {
                const meta = getCategoryMeta(catId);
                const Icon = meta.icon;
                const mentors = categoryMentors[catId] || categoryMentors.primary;
                const sliderId = `mentor-slider-${catId}`;

                // Filter courses belonging to this category
                const catCourses = courses.filter(c => {
                  if (catId === 'honours_masters') return c.category === 'honours' || c.category === 'masters';
                  return c.category?.toLowerCase() === catId;
                });

                return (
                  <section 
                    key={catId}
                    className="rounded-xl border border-foreground/10 bg-foreground/[0.015] p-5 sm:p-7 space-y-6"
                  >
                    {/* 1. Category Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-foreground">
                              {isBn ? meta.nameBn : meta.nameEn}
                            </h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.colorBadge}`}>
                              {isBn ? meta.badgeBn : meta.badgeEn}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            {isBn ? meta.descBn : meta.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Right Action: Category View Link */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(catId)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-foreground/5 hover:bg-primary hover:text-white border border-foreground/10 text-xs font-bold text-foreground transition-all self-start sm:self-auto shrink-0 group"
                      >
                        <span>{isBn ? `সকল ${meta.nameBn} কোর্স দেখুন` : `View All Courses`}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* 2. Featured Category Courses Horizontal / Grid Showcase */}
                    {catCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {catCourses.slice(0, 3).map((course) => (
                          <div 
                            key={course.id}
                            className="rounded-lg border border-foreground/10 bg-background p-4 flex flex-col justify-between hover:border-primary/50 transition-colors"
                          >
                            <div className="space-y-3">
                              {/* Thumbnail & Badge */}
                              <div className="relative aspect-video w-full rounded-md bg-foreground/5 overflow-hidden border border-foreground/10">
                                {course.thumbnailUrl ? (
                                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-primary/40">
                                    <BookOpen className="w-8 h-8" />
                                  </div>
                                )}
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white uppercase tracking-wider">
                                  {course.category || 'Course'}
                                </span>
                              </div>

                              {/* Details */}
                              <div>
                                <p className="text-[11px] font-semibold text-primary">
                                  {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                                </p>
                                <h3 className="font-bold text-sm text-foreground line-clamp-2 mt-0.5">
                                  {course.title}
                                </h3>
                                {course.subtitle && (
                                  <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                                    {course.subtitle}
                                  </p>
                                )}
                              </div>

                              {/* Key Highlights Bullet points */}
                              <div className="space-y-1 text-[11px] text-foreground/75 pt-1">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span className="truncate">পূর্ণাঙ্গ সিলেবাস ও লাইভ ক্লাস সাপোর্ট</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span className="truncate">অধ্যায়ভিত্তিক এক্সাম ও সলভ শীট</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="pt-3 mt-3 border-t border-foreground/10 flex items-center justify-between">
                              <div className="font-extrabold text-sm text-foreground">
                                {course.price === 0 || !course.price ? (
                                  <span className="text-emerald-500 font-bold">ফ্রি (Free)</span>
                                ) : (
                                  <span>৳{toBnNum(course.price)}</span>
                                )}
                              </div>
                              <Link
                                href={generateCourseUrl(course)}
                                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                              >
                                {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center border border-dashed border-foreground/15 rounded-lg bg-background/50">
                        <p className="text-xs text-foreground/50">
                          {isBn ? 'এই ক্যাটাগরিতে নতুন কোর্স শীঘ্রই যুক্ত করা হচ্ছে।' : 'New courses for this category are in preparation.'}
                        </p>
                      </div>
                    )}

                    {/* 3. Top Mentors Horizontal Carousel Strip */}
                    <div className="pt-3 border-t border-foreground/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{isBn ? 'শীর্ষ শিক্ষকবৃন্দ (Top Mentors)' : 'Top Instructors'}</span>
                        </p>

                        {/* Slider Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => scrollMentors(sliderId, 'left')}
                            className="w-7 h-7 rounded-md border border-foreground/10 bg-background hover:bg-foreground/5 flex items-center justify-center text-foreground/70 transition-colors"
                            aria-label="Previous teachers"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollMentors(sliderId, 'right')}
                            className="w-7 h-7 rounded-md border border-foreground/10 bg-background hover:bg-foreground/5 flex items-center justify-center text-foreground/70 transition-colors"
                            aria-label="Next teachers"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mentors Horizontal Row */}
                      <div 
                        id={sliderId}
                        className="flex gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                      >
                        {mentors.map((m, idx) => (
                          <Link
                            key={idx}
                            href={`/teachers/${m.slug}`}
                            className="min-w-[230px] sm:min-w-[260px] p-2.5 rounded-lg border border-foreground/10 bg-background hover:border-primary/40 hover:bg-primary/[0.02] flex items-center gap-3 transition-all shrink-0 group"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-foreground/10">
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground group-hover:text-primary truncate transition-colors">
                                {m.name}
                              </p>
                              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold truncate">
                                {m.institute}
                              </p>
                              <p className="text-[10px] text-foreground/50 truncate">
                                {m.exp}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                  </section>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: DEDICATED CATEGORY SUBVIEW (WITH CLEAN FLAT BACK BUTTON & FILTERS) */}
        {/* ========================================================================= */}
        {(!isMarketplaceMode || isCategoryViewActive) && (
          <div className="space-y-6">
            
            {/* Top Back Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foreground/10">
              <button
                type="button"
                onClick={handleBackToAllCategories}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-foreground/5 hover:bg-primary hover:text-white text-xs font-bold text-foreground transition-all self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isBn ? '← সকল ক্যাটাগরিতে ফিরে যান' : '← Back to All Categories'}</span>
              </button>

              <span className="text-xs font-semibold text-foreground/60">
                {isBn ? 'মোট প্রাপ্ত কোর্স:' : 'Total Results:'} <strong className="text-foreground">{toBnNum(filteredCourses.length)}</strong>
              </span>
            </div>

            {/* Category Banner Card */}
            <div className="p-6 rounded-xl border border-foreground/10 bg-foreground/[0.015] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${activeCategoryMeta.colorBadge}`}>
                    {isBn ? activeCategoryMeta.badgeBn : activeCategoryMeta.badgeEn}
                  </span>
                  {selectedClassFilter && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {isBn ? `ক্লাস: ${selectedClassFilter}` : `Class: ${selectedClassFilter}`}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  {searchQuery ? `"${searchQuery}" এর কোর্স ফলাফল` : (isBn ? activeCategoryMeta.nameBn : activeCategoryMeta.nameEn)}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/65 max-w-xl">
                  {isBn ? activeCategoryMeta.descBn : activeCategoryMeta.descEn}
                </p>
              </div>

              {/* Class Sub-Filter Pills */}
              {activeCategoryMeta.classes.length > 0 && (
                <div className="p-2.5 rounded-lg border border-foreground/10 bg-background self-start shrink-0 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 px-1">
                    {isBn ? 'ক্লাস অনুযায়ী দেখুন:' : 'Filter by Class:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedClassFilter(null)}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
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
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
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

            {/* Courses List Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="rounded-lg border border-foreground/10 bg-background p-4 flex flex-col justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Thumbnail & Category Badge */}
                      <div className="relative aspect-video w-full rounded-md bg-foreground/5 overflow-hidden border border-foreground/10">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/40">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white uppercase tracking-wider">
                          {course.category || 'Course'}
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <p className="text-[11px] font-semibold text-primary">
                          {course.coachingName || course.instructorName || 'Instructor'}
                        </p>
                        <h3 className="font-bold text-sm text-foreground line-clamp-2 mt-0.5">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 mt-3 border-t border-foreground/10 flex items-center justify-between">
                      <div className="font-extrabold text-sm text-foreground">
                        {course.price === 0 || !course.price ? (
                          <span className="text-emerald-500 font-bold">ফ্রি (Free)</span>
                        ) : (
                          <span>৳{toBnNum(course.price)}</span>
                        )}
                      </div>
                      <Link
                        href={generateCourseUrl(course)}
                        className="px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                      >
                        {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-xl border border-foreground/10 bg-foreground/[0.015] space-y-4">
                <BookOpen className="w-10 h-10 text-primary mx-auto opacity-40" />
                <h3 className="text-base font-bold text-foreground">
                  {isBn ? 'এই ক্যাটাগরিতে বর্তমানে কোনো কোর্স নেই' : 'No courses found'}
                </h3>
                <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                  {isBn ? 'নতুন কোর্স শীঘ্রই যুক্ত করা হবে।' : 'New courses will be added soon.'}
                </p>
                <button
                  type="button"
                  onClick={handleBackToAllCategories}
                  className="px-4 py-2 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  {isBn ? 'সকল ক্যাটাগরিতে ফিরে যান' : 'Back to All Categories'}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
