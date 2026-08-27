"use client";

import { useState, useRef, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Building2, 
  Library, 
  Sparkles, 
  ArrowRight,
  School
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface CourseMegaMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function CourseMegaMenu({ isMobile = false, onItemClick }: CourseMegaMenuProps) {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const pathname = usePathname();
  const isCoursesActive = pathname === '/courses' || pathname.startsWith('/courses/');

  const [isOpen, setIsOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>('primary');
  
  // Level 3 active states
  const [activeHscClass, setActiveHscClass] = useState<string>('11');
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  
  // Mobile accordion states
  const [mobileExpandedLevel, setMobileExpandedLevel] = useState<string | null>(null);
  const [mobileExpandedHscClass, setMobileExpandedHscClass] = useState<string | null>(null);
  const [mobileExpandedDept, setMobileExpandedDept] = useState<string | null>(null);

  // Dynamic state from published courses in Firestore
  const [deptToYearsMap, setDeptToYearsMap] = useState<Record<string, string[]>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    primary: 0,
    high_school: 0,
    intermediate: 0,
    admission: 0,
    honours: 0,
    skills: 0,
  });
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});
  const [deptCounts, setDeptCounts] = useState<Record<string, number>>({});
  const [deptYearCounts, setDeptYearCounts] = useState<Record<string, number>>({});
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Convert numbers to Bengali digits when in Bengali mode
  const formatCount = (count: number | undefined) => {
    const val = count || 0;
    if (!isBn) return `(${val})`;
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bnStr = String(val).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
    return `(${bnStr})`;
  };

  // Helper for year translation
  const formatYearLabel = (yr: string) => {
    const lower = yr.toLowerCase();
    if (isBn) {
      if (lower.includes('1st') || lower === '1') return '১ম বর্ষ';
      if (lower.includes('2nd') || lower === '2') return '২য় বর্ষ';
      if (lower.includes('3rd') || lower === '3') return '৩য় বর্ষ';
      if (lower.includes('4th') || lower === '4') return '৪র্থ বর্ষ';
      if (lower.includes('master')) return 'মাস্টার্স';
      return yr;
    }
    return yr;
  };

  // Fetch unique subjects, exact years and course counts from Firestore
  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const q = query(
          collection(db, 'courses'),
          where('isPublished', '==', true)
        );
        const snap = await getDocs(q);
        const map: Record<string, string[]> = {};
        const catCnt: Record<string, number> = {
          primary: 0,
          high_school: 0,
          intermediate: 0,
          admission: 0,
          honours: 0,
          skills: 0,
        };
        const clsCnt: Record<string, number> = {};
        const grpCnt: Record<string, number> = {};
        const dptCnt: Record<string, number> = {};
        const dptYrCnt: Record<string, number> = {};
        
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const cat = (data.category || '').toLowerCase();
          
          if (cat === 'honours' || cat === 'masters') {
            catCnt.honours = (catCnt.honours || 0) + 1;
            if (data.department) {
              const dept = data.department.trim();
              if (!map[dept]) {
                map[dept] = [];
              }
              dptCnt[dept] = (dptCnt[dept] || 0) + 1;
              if (data.year && data.year.trim()) {
                const yr = data.year.trim();
                if (!map[dept].includes(yr)) {
                  map[dept].push(yr);
                }
                const yrKey = `${dept}_${yr}`;
                dptYrCnt[yrKey] = (dptYrCnt[yrKey] || 0) + 1;
              }
            }
          } else if (catCnt[cat] !== undefined) {
            catCnt[cat] = (catCnt[cat] || 0) + 1;
          }

          // Class level counting
          if (data.eduClass || data.class) {
            const cls = String(data.eduClass || data.class);
            const clsKey = `${cat}_${cls}`;
            clsCnt[clsKey] = (clsCnt[clsKey] || 0) + 1;

            // Group level counting for HSC
            if (cat === 'intermediate' && data.department) {
              const grpKey = `intermediate_${cls}_${data.department.toLowerCase()}`;
              grpCnt[grpKey] = (grpCnt[grpKey] || 0) + 1;
            }
          }

          // Admission unit counting
          if (cat === 'admission' && data.department) {
            const admKey = `admission_${data.department.toLowerCase()}`;
            grpCnt[admKey] = (grpCnt[admKey] || 0) + 1;
          }
        });
        
        setDeptToYearsMap(map);
        setCategoryCounts(catCnt);
        setClassCounts(clsCnt);
        setGroupCounts(grpCnt);
        setDeptCounts(dptCnt);
        setDeptYearCounts(dptYrCnt);
      } catch (err) {
        console.error("Failed to fetch dynamic counts for mega menu:", err);
      }
    };
    fetchDynamicCategories();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // 1. Primary Classes (Form matched: Class 1 to 5)
  const primaryClasses = [
    { classNum: '1', en: 'Class 1', bn: 'প্রথম শ্রেণি' },
    { classNum: '2', en: 'Class 2', bn: 'দ্বিতীয় শ্রেণি' },
    { classNum: '3', en: 'Class 3', bn: 'তৃতীয় শ্রেণি' },
    { classNum: '4', en: 'Class 4', bn: 'চতুর্থ শ্রেণি' },
    { classNum: '5', en: 'Class 5', bn: 'পঞ্চম শ্রেণি' },
  ];

  // 2. High School Classes (Form matched: Class 6 to 10)
  const highSchoolClasses = [
    { classNum: '6', en: 'Class 6', bn: 'ষষ্ঠ শ্রেণি' },
    { classNum: '7', en: 'Class 7', bn: 'সপ্তম শ্রেণি' },
    { classNum: '8', en: 'Class 8', bn: 'অষ্টম শ্রেণি' },
    { classNum: '9', en: 'Class 9', bn: 'নবম শ্রেণি' },
    { classNum: '10', en: 'Class 10 (SSC)', bn: 'দশম শ্রেণি (এসএসসি)' },
  ];

  // 3. HSC Classes & Groups (Form matched: Class 11 & 12 + Science, Arts, Commerce)
  const hscClasses = [
    { classNum: '11', en: 'Class 11', bn: 'একাদশ শ্রেণি' },
    { classNum: '12', en: 'Class 12', bn: 'দ্বাদশ শ্রেণি' },
  ];

  const hscGroups = [
    { id: 'science', en: 'Science Group', bn: 'বিজ্ঞান বিভাগ' },
    { id: 'arts', en: 'Arts (Humanities)', bn: 'মানবিক বিভাগ' },
    { id: 'commerce', en: 'Business Studies / Commerce', bn: 'ব্যবসায় শিক্ষা বিভাগ' },
  ];

  // 4. University Admission Segments (Form matched: Engineering, Medical, University, IBA)
  const admissionSegments = [
    { id: 'engineering', en: 'Engineering Admission', bn: 'প্রকৌশল (ইঞ্জিনিয়ারিং) ভর্তি' },
    { id: 'medical', en: 'Medical Admission', bn: 'মেডিকেল ভর্তি প্রস্তুতি' },
    { id: 'university', en: 'Varsity (A/B/C/D Unit)', bn: 'বিশ্ববিদ্যালয় (A/B/C/D ইউনিট)' },
    { id: 'iba', en: 'IBA / BUP / Private Varsity', bn: 'আইবিএ / বিউপি / প্রাইভেট' },
  ];

  const dynamicDeptList = Object.keys(deptToYearsMap);

  // Main Categories
  const categories = [
    { 
      id: 'primary', 
      labelEn: 'Primary School', 
      labelBn: 'প্রাথমিক বিদ্যালয়', 
      icon: School,
      hasSubMenu: true,
      href: '/courses?category=primary'
    },
    { 
      id: 'high_school', 
      labelEn: 'High School', 
      labelBn: 'উচ্চ বিদ্যালয়', 
      icon: GraduationCap,
      hasSubMenu: true,
      href: '/courses?category=high_school'
    },
    { 
      id: 'intermediate', 
      labelEn: 'HSC', 
      labelBn: 'উচ্চ মাধ্যমিক', 
      icon: Award,
      hasSubMenu: true,
      href: '/courses?category=intermediate'
    },
    { 
      id: 'admission', 
      labelEn: 'University Admission', 
      labelBn: 'বিশ্ববিদ্যালয় ভর্তি', 
      icon: Building2,
      hasSubMenu: true,
      href: '/courses?category=admission'
    },
    { 
      id: 'honours_masters', 
      labelEn: 'Honours / Masters', 
      labelBn: 'অনার্স / মাস্টার্স', 
      icon: Library,
      // Only show sub-menu if teachers actually created dynamic departments
      hasSubMenu: dynamicDeptList.length > 0,
      href: '/courses?category=honours'
    },
    { 
      id: 'skills', 
      labelEn: 'Skills', 
      labelBn: 'দক্ষতা', 
      icon: Sparkles,
      hasSubMenu: false, // Direct clickable link
      href: '/courses?category=skills'
    },
  ];

  // ----------------------------------------------------
  // MOBILE ACCORDION VIEW (Clean & Touch-friendly)
  // ----------------------------------------------------
  if (isMobile) {
    return (
      <div className="w-full space-y-1.5">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-medium text-base transition-all cursor-pointer ${
            isCoursesActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground/90 hover:bg-foreground/5'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>{isBn ? 'কোর্স ক্যাটাগরি' : 'Courses & Categories'}</span>
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-foreground/50'}`} />
        </div>

        {isOpen && (
          <div className="pl-2 pr-1 py-2 space-y-2 border-l-2 border-primary/25 ml-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* View all button */}
            <Link
              href="/courses"
              onClick={onItemClick}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium shadow-md hover:bg-primary/90 transition-all"
            >
              <span>{isBn ? '🔍 সকল কোর্স একসাথে দেখুন' : '🔍 Browse All Courses'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = mobileExpandedLevel === cat.id;
              const countBadge = formatCount(categoryCounts[cat.id === 'honours_masters' ? 'honours' : cat.id]);

              if (!cat.hasSubMenu) {
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    onClick={onItemClick}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-primary/10 hover:text-primary transition-all text-foreground font-medium text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                      <span className="text-xs text-foreground/50 font-normal">{countBadge}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Link>
                );
              }

              return (
                <div key={cat.id} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedLevel(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-foreground/5 transition-all font-medium text-sm text-foreground"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                      <span className="text-xs text-foreground/50 font-normal">{countBadge}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-0 bg-background/60 border-t border-foreground/5 space-y-2">
                      {/* 1. Primary Mobile */}
                      {cat.id === 'primary' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {primaryClasses.map((item) => {
                            const cCount = classCounts[`primary_${item.classNum}`] || 0;
                            return (
                              <Link
                                key={item.classNum}
                                href={`/courses?category=primary&class=${item.classNum}`}
                                onClick={onItemClick}
                                className="px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground transition-all flex items-center justify-between"
                              >
                                <span>{isBn ? item.bn : item.en} <span className="text-xs text-foreground/50">{formatCount(cCount)}</span></span>
                                <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. High School Mobile */}
                      {cat.id === 'high_school' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {highSchoolClasses.map((item) => {
                            const cCount = classCounts[`high_school_${item.classNum}`] || 0;
                            return (
                              <Link
                                key={item.classNum}
                                href={`/courses?category=high_school&class=${item.classNum}`}
                                onClick={onItemClick}
                                className="px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground transition-all flex items-center justify-between"
                              >
                                <span>{isBn ? item.bn : item.en} <span className="text-xs text-foreground/50">{formatCount(cCount)}</span></span>
                                <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. HSC Mobile (Class ➔ Group) */}
                      {cat.id === 'intermediate' && (
                        <div className="space-y-2 pt-2">
                          {hscClasses.map((cls) => {
                            const isClsExpanded = mobileExpandedHscClass === cls.classNum;
                            const cCount = classCounts[`intermediate_${cls.classNum}`] || 0;

                            return (
                              <div key={cls.classNum} className="rounded-xl border border-foreground/10 bg-background p-2 space-y-2">
                                <div 
                                  onClick={() => setMobileExpandedHscClass(isClsExpanded ? null : cls.classNum)}
                                  className="flex items-center justify-between p-2 cursor-pointer font-medium text-sm text-foreground hover:text-primary"
                                >
                                  <span>{isBn ? cls.bn : cls.en} <span className="text-xs text-foreground/50">{formatCount(cCount)}</span></span>
                                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isClsExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {isClsExpanded && (
                                  <div className="pl-2 space-y-1.5 pt-1 border-t border-foreground/5">
                                    {hscGroups.map((grp) => {
                                      const gCount = groupCounts[`intermediate_${cls.classNum}_${grp.id}`] || 0;
                                      return (
                                        <Link
                                          key={grp.id}
                                          href={`/courses?category=intermediate&class=${cls.classNum}&group=${grp.id}`}
                                          onClick={onItemClick}
                                          className="w-full px-3 py-2 rounded-lg bg-foreground/5 hover:bg-orange-500/10 hover:text-orange-500 text-xs font-medium text-foreground transition-all flex items-center justify-between"
                                        >
                                          <span>{isBn ? grp.bn : grp.en} <span className="text-[10px] text-foreground/50">{formatCount(gCount)}</span></span>
                                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                        </Link>
                                      );
                                    })}
                                    <Link
                                      href={`/courses?category=intermediate&class=${cls.classNum}`}
                                      onClick={onItemClick}
                                      className="block text-center py-1.5 text-xs font-medium text-primary hover:underline"
                                    >
                                      {isBn ? `এই শ্রেণির সকল কোর্স →` : `All Class ${cls.classNum} Courses →`}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. Admission Mobile */}
                      {cat.id === 'admission' && (
                        <div className="space-y-2 pt-2">
                          {admissionSegments.map((item) => {
                            const admCount = groupCounts[`admission_${item.id}`] || 0;
                            return (
                              <Link
                                key={item.id}
                                href={`/courses?category=admission&group=${item.id}`}
                                onClick={onItemClick}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground transition-all flex items-center justify-between"
                              >
                                <span>{isBn ? item.bn : item.en} <span className="text-xs text-foreground/50">{formatCount(admCount)}</span></span>
                                <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* 5. Honours & Masters Mobile */}
                      {cat.id === 'honours_masters' && dynamicDeptList.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {dynamicDeptList.map((dept) => {
                            const isDeptExpanded = mobileExpandedDept === dept;
                            const years = deptToYearsMap[dept] || [];
                            const dCount = deptCounts[dept] || 0;
                            
                            return (
                              <div key={dept} className="rounded-xl border border-foreground/10 bg-background p-2 space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => setMobileExpandedDept(isDeptExpanded ? null : dept)}
                                  className="w-full flex items-center justify-between p-2 text-left text-sm font-medium"
                                >
                                  <span>{dept} <span className="text-xs text-foreground/50">{formatCount(dCount)}</span></span>
                                  {years.length > 0 && (
                                    <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isDeptExpanded ? 'rotate-180' : ''}`} />
                                  )}
                                </button>
                                {isDeptExpanded && years.length > 0 && (
                                  <div className="p-2 bg-foreground/5 rounded-lg flex flex-col gap-1.5">
                                    {years.map((yr) => {
                                      const yrCount = deptYearCounts[`${dept}_${yr}`] || 0;
                                      return (
                                        <Link
                                          key={yr}
                                          href={`/courses?department=${encodeURIComponent(dept)}&year=${encodeURIComponent(yr)}`}
                                          onClick={onItemClick}
                                          className="px-3 py-2 rounded-md bg-background hover:bg-orange-500/10 hover:text-orange-500 text-xs font-medium text-foreground flex items-center justify-between shadow-xs"
                                        >
                                          <span>{formatYearLabel(yr)} <span className="text-[10px] text-foreground/50">{formatCount(yrCount)}</span></span>
                                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Bottom Category Page Link for Mobile */}
                      <div className="pt-2 border-t border-foreground/10">
                        <Link
                          href={cat.href}
                          onClick={onItemClick}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 text-xs font-medium text-primary transition-all"
                        >
                          <span>{isBn ? `সকল ${cat.labelBn} কোর্স দেখুন` : `View all ${cat.labelEn} courses`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // DESKTOP MEGA MENU VIEW (Font-Medium, Dynamic Live Counts, Sleek & Clean)
  // ----------------------------------------------------
  const currentCategory = categories.find(c => c.id === activeLevel) || categories[0];
  const activeDeptYears = activeDepartment ? (deptToYearsMap[activeDepartment] || []) : [];

  return (
    <div 
      ref={menuRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navbar Link Trigger */}
      <Link 
        href="/courses"
        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 group ${
          isCoursesActive || isOpen 
            ? 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 shadow-xs' 
            : 'text-foreground/80 hover:text-foreground hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]'
        }`}
      >
        <span>{t('courses') || (isBn ? 'কোর্স' : 'Courses')}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-orange-500' : 'text-foreground/50 group-hover:text-foreground'
          }`} 
        />
      </Link>

      {/* 10 Minute School Style Clean Dropdown Container */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="bg-background/95 backdrop-blur-2xl border border-foreground/15 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden flex flex-row divide-x divide-foreground/10 items-stretch">
            
            {/* PANEL 1: Left Category List (Level 1) */}
            <div className="w-[260px] p-2 space-y-1 bg-foreground/[0.015] self-stretch flex flex-col">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeLevel === cat.id;
                const countBadge = formatCount(categoryCounts[cat.id === 'honours_masters' ? 'honours' : cat.id]);

                // Direct clickable category (when no 2nd layer exists, e.g. Skills)
                if (!cat.hasSubMenu) {
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      onMouseEnter={() => setActiveLevel(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' 
                          : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-primary text-white shadow-xs' : 'bg-foreground/5 text-foreground/70'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{isBn ? cat.labelBn : cat.labelEn}</span>
                        <span className={`text-xs ${isActive ? 'text-primary/80 font-normal' : 'text-foreground/45 font-normal'}`}>
                          {countBadge}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-primary opacity-60 shrink-0" />
                    </Link>
                  );
                }

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseEnter={() => {
                      setActiveLevel(cat.id);
                      if (cat.id === 'intermediate') {
                        setActiveHscClass('11');
                      } else if (cat.id === 'honours_masters' && dynamicDeptList.length > 0) {
                        setActiveDepartment(dynamicDeptList[0]);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' 
                        : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-primary text-white shadow-xs' : 'bg-foreground/5 text-foreground/70'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{isBn ? cat.labelBn : cat.labelEn}</span>
                      <span className={`text-xs ${isActive ? 'text-primary/80 font-normal' : 'text-foreground/45 font-normal'}`}>
                        {countBadge}
                      </span>
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-primary' : 'text-foreground/30'}`} />
                  </button>
                );
              })}
            </div>

            {/* PANEL 2: Middle Sub-Items (Level 2) */}
            {currentCategory.hasSubMenu && (
              <div className="w-[260px] p-2 bg-background/50 self-stretch flex flex-col justify-between">
                <div className="space-y-1 flex-1">
                  
                  {/* 1. Primary Level 2 */}
                  {activeLevel === 'primary' && (
                    <>
                      {primaryClasses.map((item) => {
                        const cCount = classCounts[`primary_${item.classNum}`] || 0;
                        return (
                          <Link
                            key={item.classNum}
                            href={`/courses?category=primary&class=${item.classNum}`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground/90 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <span>{isBn ? item.bn : item.en}</span>
                              <span className="text-xs text-foreground/45 font-normal">{formatCount(cCount)}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                          </Link>
                        );
                      })}
                    </>
                  )}

                  {/* 2. High School Level 2 */}
                  {activeLevel === 'high_school' && (
                    <>
                      {highSchoolClasses.map((item) => {
                        const cCount = classCounts[`high_school_${item.classNum}`] || 0;
                        return (
                          <Link
                            key={item.classNum}
                            href={`/courses?category=high_school&class=${item.classNum}`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground/90 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <span>{isBn ? item.bn : item.en}</span>
                              <span className="text-xs text-foreground/45 font-normal">{formatCount(cCount)}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                          </Link>
                        );
                      })}
                    </>
                  )}

                  {/* 3. HSC Level 2 (Class 11 & 12) */}
                  {activeLevel === 'intermediate' && (
                    <>
                      {hscClasses.map((cls) => {
                        const isClsActive = activeHscClass === cls.classNum;
                        const cCount = classCounts[`intermediate_${cls.classNum}`] || 0;
                        return (
                          <div
                            key={cls.classNum}
                            onMouseEnter={() => setActiveHscClass(cls.classNum)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                              isClsActive
                                ? 'bg-orange-500/15 text-orange-500 border border-orange-500/25 shadow-xs'
                                : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{isBn ? cls.bn : cls.en}</span>
                              <span className={`text-xs ${isClsActive ? 'text-orange-500/80' : 'text-foreground/45'}`}>
                                {formatCount(cCount)}
                              </span>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isClsActive ? 'text-orange-500 translate-x-0.5' : 'text-foreground/30'}`} />
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* 4. University Admission Level 2 */}
                  {activeLevel === 'admission' && (
                    <>
                      {admissionSegments.map((item) => {
                        const admCount = groupCounts[`admission_${item.id}`] || 0;
                        return (
                          <Link
                            key={item.id}
                            href={`/courses?category=admission&group=${item.id}`}
                            className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <span>{isBn ? item.bn : item.en}</span>
                              <span className="text-xs text-foreground/45 font-normal">{formatCount(admCount)}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary" />
                          </Link>
                        );
                      })}
                    </>
                  )}

                  {/* 5. Honours & Masters Level 2 */}
                  {activeLevel === 'honours_masters' && dynamicDeptList.length > 0 && (
                    <>
                      {dynamicDeptList.map((dept) => {
                        const isDeptActive = activeDepartment === dept;
                        const hasYears = (deptToYearsMap[dept] || []).length > 0;
                        const dCount = deptCounts[dept] || 0;
                        
                        return (
                          <div
                            key={dept}
                            onMouseEnter={() => setActiveDepartment(dept)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                              isDeptActive
                                ? 'bg-primary/15 text-primary border border-primary/25 shadow-xs'
                                : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{dept}</span>
                              <span className={`text-xs ${isDeptActive ? 'text-primary/80' : 'text-foreground/45'}`}>
                                {formatCount(dCount)}
                              </span>
                            </div>
                            {hasYears && (
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isDeptActive ? 'text-primary translate-x-0.5' : 'text-foreground/30'}`} />
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Bottom View Category Page Link (Pinned to the very bottom) */}
                <div className="pt-2 mt-auto border-t border-foreground/10">
                  <Link
                    href={currentCategory.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 text-xs font-medium text-primary transition-all group"
                  >
                    <span>{isBn ? `সকল ${currentCategory.labelBn} কোর্স দেখুন` : `View all ${currentCategory.labelEn} courses`}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* PANEL 3: Level 3 Flyout */}
            {/* Case A: HSC Groups (Science, Arts, Commerce) */}
            {activeLevel === 'intermediate' && (
              <div className="w-[240px] p-2 bg-foreground/[0.01] self-stretch animate-in fade-in duration-100 flex flex-col justify-between">
                <div className="space-y-1 flex-1">
                  {hscGroups.map((grp) => {
                    const gCount = groupCounts[`intermediate_${activeHscClass}_${grp.id}`] || 0;
                    return (
                      <Link
                        key={grp.id}
                        href={`/courses?category=intermediate&class=${activeHscClass}&group=${grp.id}`}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 text-sm font-medium text-foreground/90 transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span>{isBn ? grp.bn : grp.en}</span>
                          <span className="text-xs text-foreground/45 font-normal">{formatCount(gCount)}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-orange-500 transition-all group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom Class Link (Pinned to the very bottom) */}
                <div className="pt-2 mt-auto border-t border-foreground/10">
                  <Link
                    href={`/courses?category=intermediate&class=${activeHscClass}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-orange-500/10 text-xs font-medium text-orange-500 transition-all group"
                  >
                    <span>{isBn ? `এই শ্রেণির সকল কোর্স দেখুন` : `View all Class ${activeHscClass} courses`}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* Case B: Honours & Masters Dynamic Years */}
            {activeLevel === 'honours_masters' && activeDepartment && activeDeptYears.length > 0 && (
              <div className="w-[220px] p-2 bg-foreground/[0.01] self-stretch animate-in fade-in duration-100 flex flex-col justify-between">
                <div className="space-y-1 flex-1">
                  {activeDeptYears.map((yr) => {
                    const yrCount = deptYearCounts[`${activeDepartment}_${yr}`] || 0;
                    return (
                      <Link
                        key={yr}
                        href={`/courses?department=${encodeURIComponent(activeDepartment)}&year=${encodeURIComponent(yr)}`}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-medium text-foreground transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span>{formatYearLabel(yr)}</span>
                          <span className="text-xs text-foreground/45 font-normal">{formatCount(yrCount)}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-all group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom Subject Link (Pinned to the very bottom) */}
                <div className="pt-2 mt-auto border-t border-foreground/10">
                  <Link
                    href={`/courses?department=${encodeURIComponent(activeDepartment)}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 text-xs font-medium text-primary transition-all group"
                  >
                    <span>{isBn ? `${activeDepartment}-এর সকল কোর্স` : `All ${activeDepartment} courses`}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
