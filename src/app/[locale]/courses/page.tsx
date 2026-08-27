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
  ExternalLink,
  Flame,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { generateCourseUrl, resolveTeacherBySlugOrId } from '@/lib/slug';
import { Link } from '@/i18n/routing';

// Top Mentors Data for Global Marketplace
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
  
  // Strict Isolation: Teacher Storefront Mode vs Marketplace Mode
  const activeTeacherId = isForcedMarketplace ? null : (isTeacher ? user?.uid : (preferredTeacherId || queryTeacherId || (!user ? guestTeacherId : null)));

  // URL Filters from Mega Menu & Search
  const urlCategory = searchParams.get('category');
  const urlClass = searchParams.get('class') || searchParams.get('eduClass');
  const urlGroup = searchParams.get('group');
  const urlDepartment = searchParams.get('department');
  const urlYear = searchParams.get('year');
  const urlSearch = searchParams.get('search');

  const urlType = searchParams.get('type') || searchParams.get('filter');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'paid' | 'free'>((urlType === 'paid' || urlType === 'free') ? urlType : 'all');

  const [courses, setCourses] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(urlClass || null);
  const [loading, setLoading] = useState(true);

  // Category Carousel Horizontal Scroll State
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkCategoryScroll();
    window.addEventListener('resize', checkCategoryScroll);
    return () => window.removeEventListener('resize', checkCategoryScroll);
  }, []);

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkCategoryScroll, 300);
    }
  };

  // Sync selectedCategory with urlCategory if present
  useEffect(() => {
    if (urlCategory && urlCategory !== 'all') {
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
    } else {
      setSearchQuery('');
    }
    if (urlType === 'paid' || urlType === 'free') {
      setSelectedTypeFilter(urlType);
    } else {
      setSelectedTypeFilter('all');
    }
  }, [urlCategory, urlClass, urlSearch, urlType]);

  useEffect(() => {
    if (authLoading) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        let q;

        // If in teacher storefront mode, fetch ONLY that teacher's courses
        if (activeTeacherId) {
          let resolvedUid = activeTeacherId;
          const teacherInfo = await resolveTeacherBySlugOrId(db, activeTeacherId);
          if (teacherInfo) {
            resolvedUid = teacherInfo.uid || activeTeacherId;
            setTeacherProfile(teacherInfo);
            if (typeof window !== 'undefined' && guestTeacherId === activeTeacherId) {
              sessionStorage.setItem('referralTeacherId', resolvedUid);
            }
          } else {
            try {
              const tDoc = await getDoc(doc(db, 'teacherProfiles', activeTeacherId));
              if (tDoc.exists()) {
                setTeacherProfile(tDoc.data());
              }
            } catch (e) {
              console.error("Error fetching teacher profile:", e);
            }
          }

          q = query(
            coursesRef, 
            where('teacherId', '==', resolvedUid), 
            where('isPublished', '==', true)
          );
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

  const getClassLabel = (cls: string) => {
    const map: Record<string, string> = {
      '1': isBn ? '১ম শ্রেণি' : 'Class 1',
      '2': isBn ? '২য় শ্রেণি' : 'Class 2',
      '3': isBn ? '৩য় শ্রেণি' : 'Class 3',
      '4': isBn ? '৪র্থ শ্রেণি' : 'Class 4',
      '5': isBn ? '৫ম শ্রেণি' : 'Class 5',
      '6': isBn ? '৬ষ্ঠ শ্রেণি' : 'Class 6',
      '7': isBn ? '৭ম শ্রেণি' : 'Class 7',
      '8': isBn ? '৮ম শ্রেণি' : 'Class 8',
      '9': isBn ? '৯ম শ্রেণি' : 'Class 9',
      '10': isBn ? '১০ম শ্রেণি' : 'Class 10',
      '11': isBn ? '১১শ শ্রেণি' : 'Class 11',
      '12': isBn ? '১২শ শ্রেণি' : 'Class 12',
    };
    return map[cls] || (isBn ? `ক্লাস ${cls}` : `Class ${cls}`);
  };

  const getGroupLabel = (grp: string) => {
    const map: Record<string, string> = {
      'science': isBn ? 'বিজ্ঞান' : 'Science',
      'arts': isBn ? 'মানবিক' : 'Humanities',
      'commerce': isBn ? 'ব্যবসায় শিক্ষা' : 'Business Studies',
      'medical': isBn ? 'মেডিকেল' : 'Medical',
      'engineering': isBn ? 'ইঞ্জিনিয়ারিং' : 'Engineering',
      'varsity_a': isBn ? 'ভার্সিটি A ইউনিট' : 'Varsity A Unit',
      'varsity_b': isBn ? 'ভার্সিটি B ইউনিট' : 'Varsity B Unit',
      'varsity_c': isBn ? 'ভার্সিটি C ইউনিট' : 'Varsity C Unit',
      'iba': isBn ? 'IBA / BUP' : 'IBA / BUP',
    };
    return map[grp] || grp;
  };

  // Helper for Category Metadata in Marketplace Mode
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
          glowOrb: 'from-amber-500/30 via-orange-500/20 to-transparent',
          accentText: 'text-amber-500 dark:text-amber-400',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
          sectionBg: 'bg-gradient-to-br from-amber-500/[0.05] via-background/95 to-background dark:from-amber-950/25 dark:via-[#0d0f17] dark:to-[#080a10] border-amber-500/25 dark:border-amber-500/35 shadow-[0_4px_30px_rgba(245,158,11,0.04)]',
          colorBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          btnBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/40',
          cardHoverBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/50',
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
          glowOrb: 'from-sky-500/30 via-blue-500/20 to-transparent',
          accentText: 'text-sky-500 dark:text-sky-400',
          iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
          sectionBg: 'bg-gradient-to-br from-sky-500/[0.05] via-background/95 to-background dark:from-blue-950/25 dark:via-[#09121f] dark:to-[#060c14] border-sky-500/25 dark:border-sky-500/35 shadow-[0_4px_30px_rgba(14,165,233,0.04)]',
          colorBadge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
          btnBg: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/40',
          cardHoverBorder: 'hover:border-sky-500/40 dark:hover:border-sky-500/50',
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
          glowOrb: 'from-purple-500/30 via-indigo-500/20 to-transparent',
          accentText: 'text-purple-500 dark:text-purple-400',
          iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
          sectionBg: 'bg-gradient-to-br from-purple-500/[0.05] via-background/95 to-background dark:from-purple-950/25 dark:via-[#140b21] dark:to-[#0c0715] border-purple-500/25 dark:border-purple-500/35 shadow-[0_4px_30px_rgba(168,85,247,0.04)]',
          colorBadge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          btnBg: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/40',
          cardHoverBorder: 'hover:border-purple-500/40 dark:hover:border-purple-500/50',
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
          glowOrb: 'from-emerald-500/30 via-teal-500/20 to-transparent',
          accentText: 'text-emerald-500 dark:text-emerald-400',
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          sectionBg: 'bg-gradient-to-br from-emerald-500/[0.05] via-background/95 to-background dark:from-emerald-950/25 dark:via-[#081f15] dark:to-[#04120c] border-emerald-500/25 dark:border-emerald-500/35 shadow-[0_4px_30px_rgba(16,185,129,0.04)]',
          colorBadge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          btnBg: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40',
          cardHoverBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/50',
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
          glowOrb: 'from-rose-500/30 via-pink-500/20 to-transparent',
          accentText: 'text-rose-500 dark:text-rose-400',
          iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
          sectionBg: 'bg-gradient-to-br from-rose-500/[0.05] via-background/95 to-background dark:from-rose-950/25 dark:via-[#210913] dark:to-[#12050b] border-rose-500/25 dark:border-rose-500/35 shadow-[0_4px_30px_rgba(244,63,94,0.04)]',
          colorBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          btnBg: 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/40',
          cardHoverBorder: 'hover:border-rose-500/40 dark:hover:border-rose-500/50',
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
          glowOrb: 'from-cyan-500/30 via-violet-500/20 to-transparent',
          accentText: 'text-cyan-500 dark:text-cyan-400',
          iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
          sectionBg: 'bg-gradient-to-br from-cyan-500/[0.05] via-background/95 to-background dark:from-cyan-950/25 dark:via-[#091b24] dark:to-[#040e14] border-cyan-500/25 dark:border-cyan-500/35 shadow-[0_4px_30px_rgba(6,182,212,0.04)]',
          colorBadge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
          btnBg: 'bg-gradient-to-r from-cyan-500 via-violet-600 to-cyan-600 hover:from-cyan-600 hover:to-violet-700 text-white shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/40',
          cardHoverBorder: 'hover:border-cyan-500/40 dark:hover:border-cyan-500/50',
          classes: []
        };
    }
  };

  const mainCategoriesList = ['primary', 'high_school', 'intermediate', 'admission', 'honours_masters', 'skills'];

  // Render Dynamic Distinct Layout For Each Category Box
  const renderCategoryCustomShowcase = (catId: string, catCourses: any[], meta: any) => {
    if (!catCourses || catCourses.length === 0) {
      return (
        <div className="py-8 text-center border border-dashed border-foreground/15 rounded-2xl bg-background/50 relative z-10">
          <p className="text-xs sm:text-sm font-medium text-foreground/50">
            {isBn ? 'এই ক্যাটাগরিতে নতুন কোর্স শীঘ্রই যুক্ত করা হচ্ছে।' : 'New courses for this category are in preparation.'}
          </p>
        </div>
      );
    }

    // 1. PRIMARY SCHOOL (Class 1-5) -> Playful Soft Floating Cards
    if (catId === 'primary') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {catCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className={`rounded-2xl border border-amber-500/15 dark:border-amber-500/25 bg-background/85 dark:bg-[#0f1420]/85 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${meta.cardHoverBorder}`}
            >
              <div className="space-y-3.5 relative z-10">
                <div className="relative aspect-video w-full rounded-xl bg-amber-500/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500/40">
                      <School className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-black text-white uppercase tracking-wide shadow-sm">
                    {course.eduClass ? `${isBn ? 'শ্রেণি' : 'Class'} ${toBnNum(course.eduClass)}` : (course.category || 'Primary')}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300">
                    {isBn ? 'সহজ পাঠ' : 'Foundations'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
                    {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                  </p>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-amber-500 transition-colors">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-foreground/60 line-clamp-2 mt-1 leading-relaxed">
                      {course.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{isBn ? 'সহজ ব্যাখ্যা ও রঙিন হ্যান্ডনোট' : 'Colorful notes & simple lessons'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{isBn ? 'সাপ্তাহিক কুইজ ও হোমওয়ার্ক সাপোর্ট' : 'Weekly quizzes & tutor support'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                  <div className="font-black text-base text-foreground mt-0.5">
                    {course.price === 0 || !course.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(course.price)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={generateCourseUrl(course)}
                  className={`px-4 py-2 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
                >
                  <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 2. HIGH SCHOOL (Class 6-10 / SSC) -> 3 Columns on Desktop, 2 on Tablet, 1 on Mobile
    if (catId === 'high_school') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {catCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className={`rounded-2xl border border-sky-500/15 dark:border-sky-500/25 bg-background/85 dark:bg-[#09121f]/85 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${meta.cardHoverBorder}`}
            >
              {/* Card Subtle Top Glow on Hover */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${meta.glowOrb} blur-[40px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="space-y-3.5 relative z-10">
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video w-full rounded-xl bg-sky-500/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sky-500/40">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-sky-600/95 text-[10px] font-black text-white uppercase tracking-wide shadow-sm">
                    {course.eduClass ? `${isBn ? 'শ্রেণি' : 'Class'} ${toBnNum(course.eduClass)}` : 'SSC 2026'}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-sky-300">
                    {isBn ? 'বোর্ড স্ট্যান্ডার্ড' : 'Board Standard'}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate">
                    {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                  </p>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-sky-500 transition-colors">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-foreground/60 line-clamp-2 mt-1 leading-relaxed">
                      {course.subtitle}
                    </p>
                  )}
                </div>

                {/* Key Highlights Bullet points */}
                <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'পূর্ণাঙ্গ সিলেবাস ও লাইভ ক্লাস' : 'Full Syllabus & Live'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'অধ্যায়ভিত্তিক এক্সাম ও টেস্ট পেপার সলভ' : 'Chapter-wise Exams'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                  <div className="font-black text-base text-foreground mt-0.5">
                    {course.price === 0 || !course.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(course.price)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={generateCourseUrl(course)}
                  className={`px-4 py-2 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
                >
                  <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 3. INTERMEDIATE (HSC) -> Spotlight Hero + 2 Stacked Cards
    if (catId === 'intermediate') {
      const mainCourse = catCourses[0];
      const sideCourses = catCourses.slice(1, 3);
      return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
          {mainCourse && (
            <div className="lg:col-span-7 rounded-3xl border border-purple-500/20 dark:border-purple-500/30 bg-background/90 dark:bg-[#140b21]/90 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="relative aspect-video w-full rounded-2xl bg-purple-500/10 overflow-hidden border border-foreground/10 group-hover/card:shadow-md">
                  {mainCourse.thumbnailUrl ? (
                    <img src={mainCourse.thumbnailUrl} alt={mainCourse.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-500/40">
                      <Award className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600/95 backdrop-blur-md text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ফ্ল্যাগশিপ এইচএসসি ব্যাচ' : 'Flagship HSC Batch'}</span>
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-bold text-purple-300">
                    {mainCourse.category || 'HSC'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {mainCourse.coachingName || mainCourse.instructorName || 'Sky Learners Academy'}
                  </p>
                  <h3 className="font-black text-base sm:text-xl text-foreground mt-1 leading-snug group-hover/card:text-purple-500 transition-colors">
                    {mainCourse.title}
                  </h3>
                  {mainCourse.subtitle && (
                    <p className="text-xs sm:text-sm text-foreground/65 mt-1.5 line-clamp-2">
                      {mainCourse.subtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/75 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isBn ? 'লাইভ মাস্টারক্লাস + আনলিমিটেড ডাউট সলভিং' : 'Live Masterclass & Doubt Solve'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isBn ? 'অধ্যায়ভিত্তিক প্রিন্টেড সলভ লেকচার শিট' : 'Lecture sheets & study notes'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isBn ? 'ডেইলি ও উইকলি সিলেক্টিভ বোর্ড মক টেস্ট' : 'Weekly Board Mock Tests'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isBn ? 'টপ র‍্যাঙ্কারদের মেন্টরশিপ সাপোর্ট' : 'Top Ranker Mentorship'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-4 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                  <div className="font-black text-xl text-foreground mt-0.5">
                    {mainCourse.price === 0 || !mainCourse.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(mainCourse.price)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={generateCourseUrl(mainCourse)}
                  className={`px-5 py-2.5 rounded-2xl ${meta.btnBg} text-white text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2`}
                >
                  <span>{isBn ? 'এনরোল করুন' : 'Enroll Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Right Column (Stacked 2 Cards) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {sideCourses.map((course) => (
              <div
                key={course.id}
                className="flex-1 rounded-2xl border border-purple-500/15 dark:border-purple-500/25 bg-background/85 dark:bg-[#140b21]/85 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group/card relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-24 sm:w-28 aspect-video rounded-xl bg-purple-500/10 overflow-hidden border border-foreground/10 shrink-0">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-500/40">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
                      {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                    </p>
                    <h3 className="font-extrabold text-sm text-foreground line-clamp-2 mt-0.5 group-hover/card:text-purple-500 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-foreground/60 line-clamp-1 mt-0.5">
                      {course.subtitle || (isBn ? 'এইচএসসি স্পেশাল কোর্স' : 'HSC Academic')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="font-black text-sm text-foreground">
                    {course.price === 0 || !course.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(course.price)}</span>
                    )}
                  </div>
                  <Link
                    href={generateCourseUrl(course)}
                    className={`px-3.5 py-1.5 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105`}
                  >
                    {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. ADMISSION -> Futuristic Borderless Floating Glass Cards
    if (catId === 'admission') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {catCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className={`rounded-2xl border border-emerald-500/15 dark:border-emerald-500/25 bg-background/85 dark:bg-[#081f15]/85 backdrop-blur-xl p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${meta.cardHoverBorder}`}
            >
              <div className="space-y-3.5 relative z-10">
                <div className="relative aspect-video w-full rounded-xl bg-emerald-500/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-500/40">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                    {isBn ? 'এডমিশন স্পেশাল' : 'Admission Program'}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-emerald-300">
                    {isBn ? 'প্রশ্নব্যাংক সলভ' : 'Question Bank'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                  </p>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-emerald-500 transition-colors">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                      {course.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'টপ ভার্সিটি প্রশ্নব্যাংক ও স্পেশাল ট্রিকস' : 'Question Bank Analysis'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'ডেইলি লাইভ সিবিটি এক্সাম ও মেরিট লিস্ট' : 'Daily Live CBT Mock Exams'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                  <div className="font-black text-base text-foreground mt-0.5">
                    {course.price === 0 || !course.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(course.price)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={generateCourseUrl(course)}
                  className={`px-4 py-2 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
                >
                  <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 5. HONOURS & MASTERS -> Academic Departmental Dossier
    if (catId === 'honours_masters' || catId === 'honours' || catId === 'masters') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {catCourses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className={`rounded-2xl border border-rose-500/15 dark:border-rose-500/25 bg-background/85 dark:bg-[#210913]/85 backdrop-blur-xl p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${meta.cardHoverBorder}`}
            >
              <div className="space-y-3.5 relative z-10">
                <div className="relative aspect-video w-full rounded-xl bg-rose-500/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-rose-500/40">
                      <Library className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                    {course.department || (isBn ? 'ডিগ্রি / অনার্স' : 'Honours')}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-rose-300">
                    {isBn ? 'সেমিস্টার গাইড' : 'Semester Guide'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate">
                    {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                  </p>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-rose-500 transition-colors">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                      {course.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'সিলেবাস ভিত্তিক চ্যাপ্টার লেকচার' : 'Curriculum Chapter Lectures'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'সাজেশন, ব্রড প্রশ্ন ও সলভ শীট' : 'Suggestions & Solved PDFs'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                  <div className="font-black text-base text-foreground mt-0.5">
                    {course.price === 0 || !course.price ? (
                      <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                    ) : (
                      <span>৳{toBnNum(course.price)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={generateCourseUrl(course)}
                  className={`px-4 py-2 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
                >
                  <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 6. SKILLS & IT -> Interactive Cyber/Tech Floating Grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        {catCourses.slice(0, 3).map((course) => (
          <div
            key={course.id}
            className={`rounded-2xl border border-cyan-500/15 dark:border-cyan-500/25 bg-background/85 dark:bg-[#091b24]/85 backdrop-blur-xl p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${meta.cardHoverBorder}`}
          >
            <div className="space-y-3.5 relative z-10">
              <div className="relative aspect-video w-full rounded-xl bg-cyan-500/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cyan-500/40">
                    <Sparkles className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
                  {isBn ? 'প্রজেক্ট বেসড' : 'Project Based'}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-cyan-300">
                  {isBn ? 'সার্টিফিকেট সহ' : 'With Certificate'}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 truncate">
                  {course.coachingName || course.instructorName || 'Sky Learners Academy'}
                </p>
                <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-cyan-500 transition-colors">
                  {course.title}
                </h3>
                {course.subtitle && (
                  <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                    {course.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{isBn ? 'হ্যান্ডস-অন প্র্যাকটিক্যাল রিয়েল লাইফ প্রজেক্ট' : 'Real-life portfolio projects'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{isBn ? 'মার্কেটপ্লেস ও ক্যারিয়ার গাইডলাইন' : 'Freelancing & Career Guide'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                <div className="font-black text-base text-foreground mt-0.5">
                  {course.price === 0 || !course.price ? (
                    <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                  ) : (
                    <span>৳{toBnNum(course.price)}</span>
                  )}
                </div>
              </div>
              <Link
                href={generateCourseUrl(course)}
                className={`px-4 py-2 rounded-xl ${meta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
              >
                <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

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

  const isTeacherStorefrontMode = Boolean(activeTeacherId);
  const isMarketplaceCategorySubView = Boolean((urlCategory && urlCategory !== 'all') || searchQuery.trim().length > 0 || urlClass);

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

  // =========================================================================
  // SECTION A: TEACHER STOREFRONT COURSE CATALOG (LIQUID HERO & DEDICATED CATALOG)
  // =========================================================================
  if (isTeacherStorefrontMode) {
    const isPaidCourse = (c: any) => {
      const activePrice = Number(c.discountPrice !== undefined && c.discountPrice !== null && c.discountPrice !== '' ? c.discountPrice : c.price || 0);
      return activePrice > 0;
    };

    // Teacher Filtered Courses
    const teacherFilteredCourses = courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' || 
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.instructorName?.toLowerCase().includes(q) ||
        (c.specificSubjects && c.specificSubjects.some((s: any) => (typeof s === 'string' ? s : s.name)?.toLowerCase().includes(q)));

      // Type Filter (all / paid / free)
      let matchesType = true;
      if (selectedTypeFilter === 'paid') {
        matchesType = isPaidCourse(c);
      } else if (selectedTypeFilter === 'free') {
        matchesType = !isPaidCourse(c);
      }

      // Category Filter
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'intermediate') matchesCategory = c.category === 'intermediate';
        else if (selectedCategory === 'high_school') matchesCategory = c.category === 'high_school';
        else if (selectedCategory === 'primary') matchesCategory = c.category === 'primary';
        else if (selectedCategory === 'admission') matchesCategory = c.category === 'admission';
        else if (selectedCategory === 'skills') matchesCategory = c.category === 'skills';
        else matchesCategory = c.category?.toLowerCase() === selectedCategory.toLowerCase();
      }

      return matchesSearch && matchesType && matchesCategory;
    });

    const teacherName = teacherProfile?.displayName || teacherProfile?.academyName || 'Teacher Academy';
    const teacherPhoto = teacherProfile?.photoURL || teacherProfile?.profilePhoto;

    return (
      <div className="min-h-[calc(100vh-80px)] pt-20 pb-20 bg-background text-foreground">
        
        {/* ========================================================================= */}
        {/* ULTRA-PREMIUM FLOATING LIQUID GLASSMORPHIC HERO SECTION                     */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-6 pb-8 sm:pb-10 bg-gradient-to-b from-orange-500/[0.07] via-background/95 to-background border-b border-foreground/10">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[260px] bg-orange-500/15 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-10 right-1/4 w-[450px] h-[260px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            
            {/* 1. Floating Glass Back Button (Shows only when navigated from quick cards or external links) */}
            {Boolean(urlType || searchParams.get('from') || searchParams.get('category')) && (
              <div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 hover:bg-orange-500/15 dark:bg-foreground/[0.06] dark:hover:bg-orange-500/20 text-foreground/80 hover:text-orange-500 border border-foreground/10 hover:border-orange-500/30 text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-orange-500/10 group backdrop-blur-xl cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>{isBn ? 'পূর্ববর্তী পেজে ফিরুন' : 'Back to Previous Page'}</span>
                </button>
              </div>
            )}

            {/* 2. Floating Liquid Glass Capsule Box (Ultra-Responsive on Mobile & Tablet) */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 lg:p-9 bg-gradient-to-br from-foreground/[0.03] via-card/70 to-foreground/[0.01] dark:from-foreground/[0.06] dark:via-card/60 dark:to-foreground/[0.02] border border-foreground/10 shadow-xl shadow-orange-500/[0.03] backdrop-blur-2xl overflow-hidden">
              
              {/* Subtle Glass Highlight Lines */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 relative z-10">
                
                {/* Left: Avatar & Text */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 w-full">
                  
                  {/* Teacher Avatar with Glowing Ring */}
                  <div className="relative shrink-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 shadow-lg shadow-orange-500/25">
                      <div className="w-full h-full rounded-[14px] sm:rounded-[22px] overflow-hidden bg-background">
                        {teacherPhoto ? (
                          <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl sm:text-3xl font-black text-orange-500 bg-orange-500/10">
                            {teacherName.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black flex items-center gap-1 shadow-md border-2 border-background">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{isBn ? 'ভেরিফাইড' : 'Verified'}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-orange-500/30 shadow-xs">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 animate-pulse" />
                        <span>{teacherProfile?.coachingName || (isBn ? 'অফিশিয়াল একাডেমি' : 'Official Academy')}</span>
                      </span>
                      {teacherProfile?.designation && (
                        <span className="text-[11px] sm:text-xs font-bold text-foreground/60">
                          • {teacherProfile.designation}
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-foreground tracking-tight leading-snug">
                      {selectedTypeFilter === 'paid' ? (
                        isBn ? (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">প্রিমিয়াম ব্যাচ</span> ও পেইড কোর্সসমূহ
                          </>
                        ) : (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Premium Batches</span> & Paid Courses
                          </>
                        )
                      ) : selectedTypeFilter === 'free' ? (
                        isBn ? (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">ফ্রি কোর্স</span> ও ডেমো লেকচারসমূহ
                          </>
                        ) : (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Free Courses</span> & Demo Lectures
                          </>
                        )
                      ) : (
                        isBn ? (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{teacherName}</span> এর সকল কোর্সসমূহ
                          </>
                        ) : (
                          <>
                            All Courses by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{teacherName}</span>
                          </>
                        )
                      )}
                    </h1>

                    <p className="text-foreground/75 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
                      {teacherProfile?.bio || teacherProfile?.headline || (isBn ? 'ভর্তি চলছে এমন সকল লাইভ ব্যাচ, রেকর্ডেড ক্লাস ও পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি।' : 'Explore structured curriculum, recorded video lessons, and active batches.')}
                    </p>
                  </div>

                </div>

                {/* Right: Sleek Glass Stat Badges (Ultra-Responsive: 2-col on mobile, col on desktop) */}
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-foreground/10 pt-4 lg:pt-0 lg:pl-8">
                  
                  {/* Stat 1: Total Available Courses */}
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 sm:px-4 rounded-2xl bg-foreground/[0.03] dark:bg-foreground/[0.06] border border-foreground/10 shadow-xs">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-foreground/50 font-bold block uppercase tracking-wider truncate">
                        {isBn ? 'উপলব্ধ কোর্স' : 'Available'}
                      </span>
                      <span className="text-xs sm:text-base lg:text-lg font-black text-foreground truncate block">
                        {toBnNum(teacherFilteredCourses.length)} {isBn ? 'টি কোর্স' : 'Courses'}
                      </span>
                    </div>
                  </div>

                  {/* Stat 2: Active Preparation Track */}
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 sm:px-4 rounded-2xl bg-foreground/[0.03] dark:bg-foreground/[0.06] border border-foreground/10 shadow-xs">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[10px] text-foreground/50 font-bold block uppercase tracking-wider truncate">
                        {isBn ? 'প্রস্তুতি সুবিধা' : 'Preparation'}
                      </span>
                      <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground truncate block">
                        {isBn ? 'লাইভ ও রেকর্ডেড' : 'Live & Recorded'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* CONTROLS BAR: TYPE TABS, CATEGORY PILLS & SEARCH BAR                      */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
            
            {/* Main Type Filters (All / Paid / Free) with Spring Sliding Indicator */}
            <div className="flex items-center p-1 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.07] border border-foreground/10 backdrop-blur-md shadow-xs overflow-x-auto scrollbar-none w-fit">
              {[
                { id: 'all', label: isBn ? 'সকল কোর্স' : 'All Courses' },
                { id: 'paid', label: isBn ? '🔥 পেইড ব্যাচসমূহ' : '🔥 Paid Batches' },
                { id: 'free', label: isBn ? '🎁 ফ্রি ও ডেমো' : '🎁 Free & Demo' },
              ].map((tab) => {
                const isSelected = selectedTypeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTypeFilter(tab.id as any)}
                    className="relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 whitespace-nowrap cursor-pointer"
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeTeacherCourseTypePill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/25 pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors ${isSelected ? 'text-white font-black' : 'text-foreground/75 hover:text-foreground'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-4 h-4" />
              <input
                type="text"
                placeholder={isBn ? 'কোর্স খুঁজুন...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-foreground/[0.03] dark:bg-foreground/[0.06] border border-foreground/10 rounded-2xl py-2.5 pl-11 pr-10 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Academic Categories Filter Pills Carousel with Dynamic Left/Right Nav Arrows */}
          <div className="relative group/cat mb-8">
            
            {/* Left Scroll Arrow Button */}
            {canScrollLeft && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center pr-2 bg-gradient-to-r from-background via-background/95 to-transparent pl-0.5">
                <button
                  onClick={() => handleCategoryScroll('left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/90 hover:bg-orange-500 text-foreground/70 hover:text-white border border-foreground/15 shadow-md flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable Container */}
            <div
              ref={categoryScrollRef}
              onScroll={checkCategoryScroll}
              className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth px-1"
            >
              {[
                { id: 'all', label: isBn ? 'সকল ক্যাটাগরি' : 'All Categories' },
                { id: 'intermediate', label: isBn ? 'এইচএসসি (HSC)' : 'HSC' },
                { id: 'high_school', label: isBn ? 'এসএসসি (SSC)' : 'SSC' },
                { id: 'primary', label: isBn ? 'প্রাথমিক' : 'Primary' },
                { id: 'admission', label: isBn ? 'ভর্তি পরীক্ষা (Admission)' : 'Admission' },
                { id: 'skills', label: isBn ? 'দক্ষতা ও ক্যারিয়ার (Skills)' : 'Skills' },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer shrink-0 active:scale-95 ${
                      isSelected
                        ? 'bg-orange-500/15 text-orange-500 border-orange-500/40 shadow-xs'
                        : 'bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 border-foreground/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow Button */}
            {canScrollRight && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center pl-2 bg-gradient-to-l from-background via-background/95 to-transparent pr-0.5">
                <button
                  onClick={() => handleCategoryScroll('right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/90 hover:bg-orange-500 text-foreground/70 hover:text-white border border-foreground/15 shadow-md flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* COURSE LISTING GRID (Ultra-Responsive & Modern Cards)                     */}
          {/* ========================================================================= */}
          {teacherFilteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-foreground/[0.02] rounded-3xl border border-foreground/10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {isBn ? 'কোনো কোর্স পাওয়া যায়নি' : 'No courses found'}
                </h3>
                <p className="text-foreground/60 text-xs sm:text-sm max-w-sm mx-auto">
                  {isBn ? 'অনুগ্রহ করে ভিন্ন ফিল্টার বা সার্চ কীওয়ার্ড নির্বাচন করুন।' : 'Try searching with different keywords or changing filter.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTypeFilter('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
              >
                {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teacherFilteredCourses.map((course) => {
                let badgeText = course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? (isBn ? 'প্রাথমিক' : 'Primary') : course.category === 'high_school' ? (isBn ? 'উচ্চ বিদ্যালয়' : 'High School') : (course.category || 'Course');
                if (course.eduClass) badgeText += ` - ${getClassLabel(String(course.eduClass))}`;
                if (course.department && course.category !== 'admission' && course.category !== 'honours' && course.category !== 'masters') {
                  badgeText += ` (${getGroupLabel(course.department)})`;
                }

                const hasDiscountPrice = course.discountPrice !== undefined && course.discountPrice !== null && course.discountPrice !== '' && Number(course.discountPrice) < Number(course.price || 0);
                let isDiscountValid = false;
                let expiryDate: any = null;
                if (hasDiscountPrice && course.discountValidUntil) {
                  expiryDate = course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil);
                  if (expiryDate && expiryDate > new Date()) {
                    isDiscountValid = true;
                  }
                }

                const activePrice = isDiscountValid ? Number(course.discountPrice) : Number(course.price || 0);
                const isFree = activePrice === 0;

                return (
                  <div 
                    key={course.id} 
                    className="bg-background rounded-3xl border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden group flex flex-col relative"
                  >
                    {/* Discount Top Banner */}
                    {isDiscountValid && (
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black py-1 px-4 text-center uppercase tracking-widest shadow-xs">
                        {isBn ? 'বিশেষ ছাড় অফার চলছে' : 'Limited Discount Offer'}
                      </div>
                    )}

                    {/* Thumbnail Container */}
                    <div className="h-48 w-full bg-foreground/5 relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/30 bg-gradient-to-br from-foreground/5 to-foreground/10">
                          <BookOpen size={44} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Floating Free Badge */}
                      {isFree && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                          🎁 {isBn ? '১০০% ফ্রি' : '100% Free'}
                        </div>
                      )}
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col relative z-10 bg-background">
                      
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/20">
                          {badgeText}
                        </span>
                        {course.courseType === 'live' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black flex items-center gap-1 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE BATCH
                          </span>
                        )}
                      </div>

                      {/* Course Title */}
                      <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 leading-snug text-foreground group-hover:text-orange-500 transition-colors">
                        {course.title}
                      </h3>

                      {/* Subtitle / Description */}
                      <p className="text-foreground/70 mb-5 line-clamp-2 text-xs sm:text-sm leading-relaxed">
                        {course.subtitle || (isBn ? 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক ও অধ্যায়ভিত্তিক প্রস্তুতি শিখতে পারবেন।' : 'Structured lessons, exams, and class notes.')}
                      </p>
                      
                      {/* Meta Features Row */}
                      <div className="flex items-center gap-3 text-xs font-bold text-foreground/70 mb-5 w-full pt-2 border-t border-foreground/5">
                        {course.totalVideoLessons ? (
                          <span className="flex items-center gap-1.5" title="Total Classes">
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                            <span>{toBnNum(course.totalVideoLessons)} {isBn ? 'ক্লাস' : 'Classes'}</span>
                          </span>
                        ) : null}
                        
                        {course.totalExams ? (
                          <span className="flex items-center gap-1.5" title="Total Exams">
                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{toBnNum(course.totalExams)} {isBn ? 'এক্সাম' : 'Exams'}</span>
                          </span>
                        ) : null}
                        
                        <span className="flex items-center gap-1.5 ml-auto text-[11px] font-semibold text-foreground/60">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{course.courseValidity || (isBn ? 'লাইফ-টাইম' : 'Lifetime')}</span>
                        </span>
                      </div>

                      {/* Card Footer: Price & Details Button */}
                      <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          {isFree ? (
                            <span className="font-black text-xl sm:text-2xl text-emerald-500">{isBn ? 'ফ্রি' : 'Free'}</span>
                          ) : isDiscountValid ? (
                            <>
                              <span className="text-[11px] text-foreground/50 line-through font-medium leading-none">৳{toBnNum(course.price)}</span>
                              <span className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                                ৳{toBnNum(course.discountPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="font-black text-xl sm:text-2xl text-foreground">
                              ৳{toBnNum(course.price || 0)}
                            </span>
                          )}
                        </div>

                        <Link 
                          href={generateCourseUrl(course)}
                          className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-orange-500/25 active:scale-95 flex items-center gap-1.5 shrink-0"
                        >
                          <span>{isBn ? 'এনরোল করুন' : 'Enroll Now'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>
    );
  }

  // =========================================================================
  // SECTION B: GLOBAL MARKETPLACE MODE (MAIN COURSES HUB & CATEGORY SUBVIEWS)
  // =========================================================================
  return (
    <div className="min-h-[calc(100vh-80px)] pt-24 pb-20 bg-background text-foreground">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* CASE 1: GLOBAL MARKETPLACE MAIN COURSES HUB (NO CATEGORY SELECTED) */}
        {!isMarketplaceCategorySubView && (
          <div className="space-y-12">
            
            {/* Top Clean Header */}
            <div className="border-b border-foreground/[0.08] dark:border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black tracking-wider uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{isBn ? 'গ্লোবাল লার্নিং মার্কেটপ্লেস' : 'All Courses & Academies'}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                  {isBn ? 'সকল শিক্ষাগত স্তর ও ক্যাটাগরি' : 'Educational Levels & Category Hub'}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/65 mt-1.5 max-w-2xl font-medium leading-relaxed">
                  {isBn 
                    ? 'আপনার পছন্দের বিষয় বা শ্রেণির কোর্স নির্বাচন করুন এবং সেরা শিক্ষকদের সাথে প্রস্তুতি নিন।' 
                    : 'Discover curated learning paths from primary foundation to board exams and university admission.'}
                </p>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/75 shrink-0">
                <span className="px-4 py-2 rounded-2xl bg-foreground/[0.04] dark:bg-white/[0.04] border border-foreground/[0.08] dark:border-white/[0.08] backdrop-blur-md shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{toBnNum(courses.length)} {isBn ? 'টি সক্রিয় কোর্স' : 'Active Courses'}</span>
                </span>
              </div>
            </div>

            {/* 🌟 Big Category Showcase Cards (Each with unique pastel tint background) */}
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
                    className={`relative rounded-3xl border ${meta.sectionBg} p-5 sm:p-8 space-y-6 sm:space-y-8 transition-all duration-500 group overflow-hidden backdrop-blur-xl hover:shadow-2xl`}
                  >
                    {/* Blooming Colorful Flower Aura Glow on Hover */}
                    <div className={`absolute -top-28 -right-28 w-96 h-96 bg-gradient-to-br ${meta.glowOrb} blur-[110px] rounded-full group-hover:scale-135 group-hover:opacity-100 opacity-50 transition-all duration-700 pointer-events-none`} />
                    <div className={`absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr ${meta.glowOrb} blur-[100px] rounded-full group-hover:scale-125 group-hover:opacity-80 opacity-30 transition-all duration-700 pointer-events-none`} />

                    {/* 1. Category Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/[0.08] dark:border-white/[0.08] pb-5 relative z-10">
                      <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                              {isBn ? meta.nameBn : meta.nameEn}
                            </h2>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${meta.colorBadge}`}>
                              {isBn ? meta.badgeBn : meta.badgeEn}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/65 mt-1 font-medium">
                            {isBn ? meta.descBn : meta.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Right Action: Category View Link */}
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(catId)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl ${meta.btnBg} text-xs font-black transition-all self-start sm:self-auto shrink-0 group/btn`}
                      >
                        <span>{isBn ? `সকল ${meta.nameBn} কোর্স দেখুন` : `View All Courses`}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* 2. Featured Category Courses Horizontal / Grid / Spotlight Showcase */}
                    {renderCategoryCustomShowcase(catId, catCourses, meta)}

                    {/* 3. Top Mentors Horizontal Carousel Strip */}
                    <div className="pt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-foreground/75 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${meta.accentText} bg-current`} />
                          <Users className="w-3.5 h-3.5 text-foreground/70" />
                          <span>{isBn ? 'শীর্ষ শিক্ষকবৃন্দ (Top Mentors)' : 'Top Instructors'}</span>
                        </p>

                        {/* Slider Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => scrollMentors(sliderId, 'left')}
                            className="w-8 h-8 rounded-xl border border-foreground/10 bg-background/80 hover:bg-foreground/10 flex items-center justify-center text-foreground/70 transition-all shadow-xs active:scale-90"
                            aria-label="Previous teachers"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollMentors(sliderId, 'right')}
                            className="w-8 h-8 rounded-xl border border-foreground/10 bg-background/80 hover:bg-foreground/10 flex items-center justify-center text-foreground/70 transition-all shadow-xs active:scale-90"
                            aria-label="Next teachers"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mentors Horizontal Row */}
                      <div 
                        id={sliderId}
                        className="flex gap-3.5 overflow-x-auto scrollbar-none py-1.5 scroll-smooth"
                      >
                        {mentors.map((m, idx) => (
                          <Link
                            key={idx}
                            href={`/teachers/${m.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[240px] sm:min-w-[270px] p-3 rounded-2xl border border-foreground/[0.08] dark:border-white/[0.08] bg-background/90 dark:bg-[#0e1522]/90 backdrop-blur-md hover:border-foreground/25 hover:shadow-lg flex items-center gap-3.5 transition-all shrink-0 group/mentor cursor-pointer"
                          >
                            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 ring-2 ring-foreground/10 group-hover/mentor:ring-orange-500/50 group-hover/mentor:scale-105 transition-all duration-300">
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground group-hover/mentor:text-orange-500 truncate transition-colors">
                                {m.name}
                              </p>
                              <p className={`text-[10px] ${meta.accentText} font-bold truncate`}>
                                {m.institute}
                              </p>
                              <p className="text-[10px] text-foreground/55 truncate font-medium">
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

        {/* CASE 2: DEDICATED CATEGORY SUBVIEW (WITH CLEAN FLAT BACK BUTTON & FILTERS) */}
        {isMarketplaceCategorySubView && (
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

            {/* Category Banner Card with specific section tint */}
            <div className={`relative p-6 sm:p-8 rounded-3xl border ${activeCategoryMeta.sectionBg} flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden backdrop-blur-xl shadow-lg`}>
              {/* Subtle Ambient Glow */}
              <div className={`absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br ${activeCategoryMeta.glowOrb} blur-[90px] rounded-full pointer-events-none opacity-60`} />

              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeCategoryMeta.colorBadge}`}>
                    {isBn ? activeCategoryMeta.badgeBn : activeCategoryMeta.badgeEn}
                  </span>
                  {selectedClassFilter && (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      {isBn ? `ক্লাস: ${selectedClassFilter}` : `Class: ${selectedClassFilter}`}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {searchQuery ? `"${searchQuery}" এর কোর্স ফলাফল` : (isBn ? activeCategoryMeta.nameBn : activeCategoryMeta.nameEn)}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/65 max-w-xl font-medium">
                  {isBn ? activeCategoryMeta.descBn : activeCategoryMeta.descEn}
                </p>
              </div>

              {/* Class Sub-Filter Pills */}
              {activeCategoryMeta.classes.length > 0 && (
                <div className="p-3 rounded-2xl border border-foreground/[0.08] dark:border-white/[0.08] bg-background/80 dark:bg-[#0e1522]/80 backdrop-blur-md self-start shrink-0 space-y-2 relative z-10 shadow-xs">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/50 px-1">
                    {isBn ? 'ক্লাস ফিল্টার:' : 'Filter by Class:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedClassFilter(null)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                        !selectedClassFilter 
                          ? `${activeCategoryMeta.btnBg}` 
                          : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
                      }`}
                    >
                      {isBn ? 'সব' : 'All'}
                    </button>
                    {activeCategoryMeta.classes.map((c) => (
                      <button
                        key={c.num}
                        type="button"
                        onClick={() => setSelectedClassFilter(c.num)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                          selectedClassFilter === c.num 
                            ? `${activeCategoryMeta.btnBg}` 
                            : 'bg-foreground/5 text-foreground hover:bg-foreground/10'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id}
                    className={`rounded-2xl border border-foreground/[0.08] dark:border-white/[0.08] bg-background/80 dark:bg-[#0c121e]/85 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card relative overflow-hidden ${activeCategoryMeta.cardHoverBorder}`}
                  >
                    <div className="space-y-3.5 relative z-10">
                      {/* Thumbnail & Category Badge */}
                      <div className="relative aspect-video w-full rounded-xl bg-foreground/5 overflow-hidden border border-foreground/10 group-hover/card:shadow-md transition-all">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/40">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/15">
                          {course.category || 'Course'}
                        </span>
                      </div>

                      {/* Details */}
                      <div>
                        <p className={`text-xs font-bold ${activeCategoryMeta.accentText} truncate`}>
                          {course.coachingName || course.instructorName || 'Instructor'}
                        </p>
                        <h3 className="font-extrabold text-sm sm:text-base text-foreground line-clamp-2 mt-1 leading-snug group-hover/card:text-orange-500 transition-colors">
                          {course.title}
                        </h3>
                        {course.subtitle && (
                          <p className="text-xs text-foreground/60 line-clamp-2 mt-1 leading-relaxed">
                            {course.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3.5 mt-4 border-t border-foreground/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-foreground/50 block leading-none">Course Fee</span>
                        <div className="font-black text-base text-foreground mt-0.5">
                          {course.price === 0 || !course.price ? (
                            <span className="text-emerald-500 font-extrabold">ফ্রি (Free)</span>
                          ) : (
                            <span>৳{toBnNum(course.price)}</span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={generateCourseUrl(course)}
                        className={`px-4 py-2 rounded-xl ${activeCategoryMeta.btnBg} text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0`}
                      >
                        <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-3xl border border-foreground/[0.08] dark:border-white/[0.08] bg-foreground/[0.015] backdrop-blur-md space-y-4">
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
                  className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
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
