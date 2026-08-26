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
          sectionBg: 'bg-[#FFF9F2] dark:bg-[#251A10] border-amber-200/90 dark:border-amber-900/60',
          colorBadge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
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
          sectionBg: 'bg-[#F4F9FF] dark:bg-[#0F1E33] border-blue-200/90 dark:border-blue-900/60',
          colorBadge: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
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
          sectionBg: 'bg-[#F2FAF5] dark:bg-[#0D241A] border-emerald-200/90 dark:border-emerald-900/60',
          colorBadge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
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
          sectionBg: 'bg-[#F9F5FF] dark:bg-[#201435] border-purple-200/90 dark:border-purple-900/60',
          colorBadge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
          btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
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
          sectionBg: 'bg-[#FFF5F7] dark:bg-[#271018] border-rose-200/90 dark:border-rose-900/60',
          colorBadge: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
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
          sectionBg: 'bg-[#F0FDFA] dark:bg-[#0E2421] border-teal-200/90 dark:border-teal-900/60',
          colorBadge: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800',
          btnBg: 'bg-teal-600 hover:bg-teal-700 text-white',
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
                    className={`rounded-xl border ${meta.sectionBg} p-5 sm:p-7 space-y-6 transition-all`}
                  >
                    {/* 1. Category Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-background text-foreground flex items-center justify-center shrink-0 border border-foreground/15">
                          <Icon className="w-5 h-5 text-foreground" />
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
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md ${meta.btnBg} text-xs font-bold transition-all self-start sm:self-auto shrink-0 group`}
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
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[230px] sm:min-w-[260px] p-2.5 rounded-lg border border-foreground/10 bg-background hover:border-primary/40 hover:bg-primary/[0.02] flex items-center gap-3 transition-all shrink-0 group cursor-pointer"
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
            <div className={`p-6 rounded-xl border ${activeCategoryMeta.sectionBg} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
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
