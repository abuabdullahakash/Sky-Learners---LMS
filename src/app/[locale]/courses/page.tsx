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

  const [courses, setCourses] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string | null>(urlClass || null);
  const [loading, setLoading] = useState(true);

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
  }, [urlCategory, urlClass, urlSearch]);

  useEffect(() => {
    if (authLoading) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesRef = collection(db, 'courses');
        let q;

        // If in teacher storefront mode, fetch ONLY that teacher's courses
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
  // SECTION A: TEACHER STOREFRONT COURSE CATALOG (100% PRESERVED & UNCHANGED)
  // =========================================================================
  if (isTeacherStorefrontMode) {
    return (
      <div className="min-h-[calc(100vh-80px)] pt-24 pb-20 bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Teacher Profile Hero Header */}
          {teacherProfile && (
            <div className="bg-background rounded-3xl p-8 mb-10 border border-foreground/10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500 shrink-0 bg-foreground/5">
                {teacherProfile.photoURL ? (
                  <img src={teacherProfile.photoURL} alt={teacherProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-500">
                    {teacherProfile.displayName?.charAt(0) || 'T'}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{teacherProfile.coachingName || 'Teacher Academy'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{teacherProfile.displayName || 'Teacher'} এর সকল কোর্স</h1>
                <p className="text-foreground/60 text-sm mt-1 max-w-2xl">{teacherProfile.bio || 'এখানে শিক্ষকের সকল প্রিমিয়াম ও ফ্রি কোর্সসমূহ পাওয়া যাবে।'}</p>
              </div>
              <div className="bg-foreground/5 px-6 py-4 rounded-2xl border border-foreground/10 text-center shrink-0">
                <span className="text-xs text-foreground/50 font-bold block uppercase">মোট কোর্স</span>
                <span className="text-2xl font-black text-orange-500">{courses.length}</span>
              </div>
            </div>
          )}

          {/* Teacher Search & Categories */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-4 h-4" />
              <input
                type="text"
                placeholder={isBn ? 'কোর্স খুঁজুন...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-foreground/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: isBn ? 'সকল কোর্স' : 'All Courses' },
                { id: 'intermediate', label: isBn ? 'এইচএসসি' : 'HSC' },
                { id: 'high_school', label: isBn ? 'এসএসসি' : 'SSC' },
                { id: 'primary', label: isBn ? 'প্রাথমিক' : 'Primary' },
                { id: 'admission', label: isBn ? 'ভর্তি' : 'Admission' },
                { id: 'skills', label: isBn ? 'স্কিলস' : 'Skills' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                      : 'bg-background hover:bg-foreground/5 text-foreground/70 border-foreground/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-foreground/10">
              <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">কোনো কোর্স পাওয়া যায়নি</h3>
              <p className="text-foreground/60 text-sm">ভিন্ন কীওয়ার্ড দিয়ে সার্চ করুন অথবা অন্য ক্যাটাগরি নির্বাচন করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => {
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

                const hasDiscountPrice = course.discountPrice !== undefined && course.discountPrice !== null && course.discountPrice !== '' && Number(course.discountPrice) < Number(course.price || 0);
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
                      <div className="text-orange-500 text-[12px] font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        {course.courseType === 'coaching' || course.coachingName ? (
                          <><Building2 className="w-3.5 h-3.5" /> <span>{course.coachingName || 'Coaching Center'}</span></>
                        ) : (
                          <><Users className="w-3.5 h-3.5" /> <span>{course.instructorName || 'Instructor'}</span></>
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                      
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
