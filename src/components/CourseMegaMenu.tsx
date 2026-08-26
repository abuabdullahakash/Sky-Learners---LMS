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
  School,
  Search,
  ExternalLink
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

  // Dynamic teacher-created departments from Firestore (Strictly no hardcoding)
  const [dynamicDepartments, setDynamicDepartments] = useState<string[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch unique subjects/departments created by teachers
  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const q = query(
          collection(db, 'courses'),
          where('isPublished', '==', true)
        );
        const snap = await getDocs(q);
        const depts = new Set<string>();
        snap.forEach(docSnap => {
          const data = docSnap.data();
          if ((data.category === 'honours' || data.category === 'masters') && data.department) {
            depts.add(data.department.trim());
          }
        });
        setDynamicDepartments(Array.from(depts));
      } catch (err) {
        console.error("Failed to fetch dynamic subjects for mega menu:", err);
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
    { classNum: '11', en: 'Class 11 (HSC 1st Year)', bn: 'একাদশ শ্রেণি (এইচএসসি ১ম বর্ষ)' },
    { classNum: '12', en: 'Class 12 (HSC 2nd Year)', bn: 'দ্বাদশ শ্রেণি (এইচএসসি ২য় বর্ষ)' },
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

  // Years for dynamic honours departments
  const academicYears = [
    { id: '1st Year', en: '1st Year', bn: '১ম বর্ষ' },
    { id: '2nd Year', en: '2nd Year', bn: '২য় বর্ষ' },
    { id: '3rd Year', en: '3rd Year', bn: '৩য় বর্ষ' },
    { id: '4th Year', en: '4th Year', bn: '৪র্থ বর্ষ' },
    { id: 'Masters', en: 'Masters / Postgrad', bn: 'মাস্টার্স' },
  ];

  // Main Categories
  const categories = [
    { 
      id: 'primary', 
      labelEn: 'Primary School', 
      labelBn: 'প্রাথমিক বিদ্যালয়', 
      descEn: 'Class 1 to Class 5',
      descBn: '১ম থেকে ৫ম শ্রেণি',
      icon: School,
      hasSubMenu: true,
      href: '/courses?category=primary'
    },
    { 
      id: 'high_school', 
      labelEn: 'High School', 
      labelBn: 'উচ্চ বিদ্যালয়', 
      descEn: 'Class 6 to Class 10 (SSC)',
      descBn: '৬ষ্ঠ থেকে ১০ম শ্রেণি (এসএসসি)',
      icon: GraduationCap,
      hasSubMenu: true,
      href: '/courses?category=high_school'
    },
    { 
      id: 'intermediate', 
      labelEn: 'HSC', 
      labelBn: 'উচ্চ মাধ্যমিক', 
      descEn: 'Class 11, 12 & Groups',
      descBn: 'একাদশ, দ্বাদশ ও বিভাগসমূহ',
      icon: Award,
      hasSubMenu: true,
      hasLevel3: true,
      href: '/courses?category=intermediate'
    },
    { 
      id: 'admission', 
      labelEn: 'University Admission', 
      labelBn: 'বিশ্ববিদ্যালয় ভর্তি', 
      descEn: 'Varsity, Medical, Engr, IBA',
      descBn: 'বিশ্ববিদ্যালয়, মেডিকেল, ইঞ্জিনিয়ারিং',
      icon: Building2,
      hasSubMenu: true,
      href: '/courses?category=admission'
    },
    { 
      id: 'honours_masters', 
      labelEn: 'Honours / Masters', 
      labelBn: 'অনার্স / মাস্টার্স', 
      descEn: 'Subject & Year wise',
      descBn: 'বিষয় ও বর্ষভিত্তিক কোর্স',
      icon: Library,
      // Only show sub-menu if teachers actually created dynamic departments
      hasSubMenu: dynamicDepartments.length > 0,
      hasLevel3: dynamicDepartments.length > 0,
      href: '/courses?category=honours'
    },
    { 
      id: 'skills', 
      labelEn: 'Skills', 
      labelBn: 'দক্ষতা', 
      descEn: 'Professional Skill Courses',
      descBn: 'স্কিল ডেভেলপমেন্ট কোর্সসমূহ',
      icon: Sparkles,
      hasSubMenu: false, // Direct link, no fake tracks
      href: '/courses?category=skills'
    },
  ];

  // ----------------------------------------------------
  // MOBILE ACCORDION VIEW (Large readable touch targets)
  // ----------------------------------------------------
  if (isMobile) {
    return (
      <div className="w-full space-y-1.5">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
            isCoursesActive ? 'bg-primary/10 text-primary' : 'text-foreground/90 hover:bg-foreground/5'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>{isBn ? 'কোর্স ক্যাটাগরি ও ক্লাস' : 'Courses & Categories'}</span>
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-foreground/50'}`} />
        </div>

        {isOpen && (
          <div className="pl-2 pr-1 py-2 space-y-2 border-l-2 border-primary/25 ml-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* View all button */}
            <Link
              href="/courses"
              onClick={onItemClick}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
            >
              <span>{isBn ? '🔍 সকল কোর্স একসাথে দেখুন' : '🔍 Browse All Courses'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = mobileExpandedLevel === cat.id;

              // If category doesn't have sub-menu (like Skills or empty Honours), render direct link
              if (!cat.hasSubMenu) {
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    onClick={onItemClick}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-primary/10 hover:text-primary transition-all text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{isBn ? cat.labelBn : cat.labelEn}</p>
                        <p className="text-xs text-foreground/50">{isBn ? cat.descBn : cat.descEn}</p>
                      </div>
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
                    className="w-full flex items-center justify-between p-3.5 text-left hover:bg-foreground/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{isBn ? cat.labelBn : cat.labelEn}</p>
                        <p className="text-xs text-foreground/50">{isBn ? cat.descBn : cat.descEn}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-0 bg-background/60 border-t border-foreground/5 space-y-2">
                      {/* 1. Primary Mobile */}
                      {cat.id === 'primary' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {primaryClasses.map((item) => (
                            <Link
                              key={item.classNum}
                              href={`/courses?category=primary&class=${item.classNum}`}
                              onClick={onItemClick}
                              className="px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 2. High School Mobile */}
                      {cat.id === 'high_school' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {highSchoolClasses.map((item) => (
                            <Link
                              key={item.classNum}
                              href={`/courses?category=high_school&class=${item.classNum}`}
                              onClick={onItemClick}
                              className="px-3 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 3. HSC Mobile (Class ➔ Group) */}
                      {cat.id === 'intermediate' && (
                        <div className="space-y-3 pt-2">
                          {hscClasses.map((cls) => {
                            const isClsExpanded = mobileExpandedHscClass === cls.classNum;
                            return (
                              <div key={cls.classNum} className="rounded-xl border border-foreground/10 bg-background p-2 space-y-2">
                                <div 
                                  onClick={() => setMobileExpandedHscClass(isClsExpanded ? null : cls.classNum)}
                                  className="flex items-center justify-between p-2 cursor-pointer font-bold text-sm text-foreground hover:text-primary"
                                >
                                  <span>{isBn ? cls.bn : cls.en}</span>
                                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isClsExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {isClsExpanded && (
                                  <div className="pl-2 space-y-1.5 pt-1 border-t border-foreground/5">
                                    <p className="text-xs font-bold text-foreground/50 px-1">{isBn ? 'বিভাগ নির্বাচন করুন:' : 'Select Group:'}</p>
                                    {hscGroups.map((grp) => (
                                      <Link
                                        key={grp.id}
                                        href={`/courses?category=intermediate&class=${cls.classNum}&group=${grp.id}`}
                                        onClick={onItemClick}
                                        className="w-full px-3 py-2 rounded-lg bg-foreground/5 hover:bg-orange-500/10 hover:text-orange-500 text-xs font-bold text-foreground transition-all flex items-center justify-between"
                                      >
                                        <span>{isBn ? grp.bn : grp.en}</span>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                      </Link>
                                    ))}
                                    <Link
                                      href={`/courses?category=intermediate&class=${cls.classNum}`}
                                      onClick={onItemClick}
                                      className="block text-center py-1.5 text-xs font-bold text-primary hover:underline"
                                    >
                                      {isBn ? `এই ক্লাসের সকল কোর্স →` : `All Class ${cls.classNum} Courses →`}
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
                          {admissionSegments.map((item) => (
                            <Link
                              key={item.id}
                              href={`/courses?category=admission&group=${item.id}`}
                              onClick={onItemClick}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-4 h-4 text-primary opacity-60" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 5. Honours & Masters Mobile (Only if teacher created subjects exist) */}
                      {cat.id === 'honours_masters' && dynamicDepartments.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {dynamicDepartments.map((dept) => {
                            const isDeptExpanded = mobileExpandedDept === dept;
                            return (
                              <div key={dept} className="rounded-xl border border-foreground/10 bg-background p-2 space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => setMobileExpandedDept(isDeptExpanded ? null : dept)}
                                  className="w-full flex items-center justify-between p-2 text-left text-sm font-bold"
                                >
                                  <span>{dept}</span>
                                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isDeptExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isDeptExpanded && (
                                  <div className="p-2 bg-foreground/5 rounded-lg grid grid-cols-2 gap-1.5">
                                    {academicYears.map((yr) => (
                                      <Link
                                        key={yr.id}
                                        href={`/courses?department=${encodeURIComponent(dept)}&year=${encodeURIComponent(yr.id)}`}
                                        onClick={onItemClick}
                                        className="px-2.5 py-2 rounded-md bg-background hover:bg-orange-500/10 hover:text-orange-500 text-xs font-bold text-foreground text-center shadow-xs"
                                      >
                                        {isBn ? yr.bn : yr.en}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
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
  // DESKTOP MEGA MENU VIEW (Bold, Clear, 15px/16px Fonts)
  // ----------------------------------------------------
  const currentCategory = categories.find(c => c.id === activeLevel) || categories[0];

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
        className={`flex items-center gap-1.5 font-bold text-base transition-colors py-2 group ${
          isCoursesActive || isOpen ? 'text-primary' : 'text-foreground/85 hover:text-primary'
        }`}
      >
        <span>{t('courses') || (isBn ? 'কোর্স' : 'Courses')}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : 'text-foreground/50 group-hover:text-primary'
          }`} 
        />
      </Link>

      {/* Mega Menu Flyout Dropdown */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="bg-background/95 backdrop-blur-2xl border border-foreground/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col min-w-[320px]">
            
            {/* Main Multi-Panel Row */}
            <div className="flex divide-x divide-foreground/10 min-h-[360px]">
              
              {/* PANEL 1: Left Category Sidebar (Level 1) */}
              <div className="w-[260px] p-3 space-y-1.5 bg-foreground/[0.02]">
                <p className="text-xs font-black uppercase tracking-wider text-foreground/45 px-3 py-1.5">
                  {isBn ? 'শিক্ষা স্তর (ক্যাটাগরি)' : 'Education Levels'}
                </p>

                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeLevel === cat.id;

                  // If category has no sub-menu (like Skills or empty Honours), clicking takes directly to link
                  if (!cat.hasSubMenu) {
                    return (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onMouseEnter={() => setActiveLevel(cat.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all ${
                          isActive 
                            ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm' 
                            : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isActive ? 'bg-primary text-white shadow-sm' : 'bg-foreground/5 text-foreground/70'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold leading-tight truncate">
                              {isBn ? cat.labelBn : cat.labelEn}
                            </p>
                            <p className="text-xs leading-tight truncate text-foreground/50 pt-0.5">
                              {isBn ? cat.descBn : cat.descEn}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary opacity-70 shrink-0" />
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
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm' 
                          : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-primary text-white shadow-sm' : 'bg-foreground/5 text-foreground/70'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold leading-tight truncate">
                            {isBn ? cat.labelBn : cat.labelEn}
                          </p>
                          <p className={`text-xs leading-tight truncate pt-0.5 ${isActive ? 'text-primary/70 font-medium' : 'text-foreground/50'}`}>
                            {isBn ? cat.descBn : cat.descEn}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-primary' : 'text-foreground/30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* PANEL 2: Middle Sub-Items (Level 2 - Classes / Groups / Units) */}
              {currentCategory.hasSubMenu && (
                <div className="w-[300px] p-4 flex flex-col justify-between bg-background/50">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-foreground/10">
                      <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
                        <currentCategory.icon className="w-4 h-4 text-primary" />
                        <span>{isBn ? currentCategory.labelBn : currentCategory.labelEn}</span>
                      </p>
                      <Link
                        href={currentCategory.href}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        {isBn ? 'সকল কোর্স' : 'All Courses'} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* 1. Primary Level 2 */}
                    {activeLevel === 'primary' && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1 mb-2">
                          {isBn ? 'ক্লাস নির্বাচন করুন' : 'Select Class'}
                        </p>
                        {primaryClasses.map((item) => (
                          <Link
                            key={item.classNum}
                            href={`/courses?category=primary&class=${item.classNum}`}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground/90 transition-all border border-transparent hover:border-primary/20 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-foreground/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-xs font-black transition-colors">
                                {item.classNum}
                              </div>
                              <span>{isBn ? item.bn : item.en}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 2. High School Level 2 */}
                    {activeLevel === 'high_school' && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1 mb-2">
                          {isBn ? 'ক্লাস নির্বাচন করুন' : 'Select Class'}
                        </p>
                        {highSchoolClasses.map((item) => (
                          <Link
                            key={item.classNum}
                            href={`/courses?category=high_school&class=${item.classNum}`}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground/90 transition-all border border-transparent hover:border-primary/20 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-foreground/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-xs font-black transition-colors">
                                {item.classNum}
                              </div>
                              <span>{isBn ? item.bn : item.en}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 3. HSC Level 2 (Class 11 & 12 which trigger Level 3 Groups on hover) */}
                    {activeLevel === 'intermediate' && (
                      <div className="space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1 mb-2">
                          {isBn ? 'শ্রেণি নির্বাচন করুন (হোভার করুন)' : 'Select Class (Hover for Groups)'}
                        </p>
                        {hscClasses.map((cls) => {
                          const isClsActive = activeHscClass === cls.classNum;
                          return (
                            <div
                              key={cls.classNum}
                              onMouseEnter={() => setActiveHscClass(cls.classNum)}
                              className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all ${
                                isClsActive
                                  ? 'bg-orange-500/15 text-orange-500 border border-orange-500/30 shadow-xs'
                                  : 'text-foreground/85 hover:bg-foreground/5 hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                                  isClsActive ? 'bg-orange-500 text-white' : 'bg-foreground/5 text-foreground/70'
                                }`}>
                                  {cls.classNum}
                                </div>
                                <span>{isBn ? cls.bn : cls.en}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 transition-transform ${isClsActive ? 'text-orange-500 translate-x-0.5' : 'text-foreground/30'}`} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 4. University Admission Level 2 */}
                    {activeLevel === 'admission' && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1 mb-2">
                          {isBn ? 'টার্গেট ইউনিট ও প্রস্তুতি' : 'Target Admission Units'}
                        </p>
                        {admissionSegments.map((item) => (
                          <Link
                            key={item.id}
                            href={`/courses?category=admission&group=${item.id}`}
                            className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all border border-transparent hover:border-primary/20 group"
                          >
                            <span>{isBn ? item.bn : item.en}</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* 5. Dynamic Honours & Masters Level 2 (Strictly dynamic) */}
                    {activeLevel === 'honours_masters' && dynamicDepartments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1 mb-2">
                          {isBn ? 'শিক্ষকদের তৈরি বিষয়সমূহ' : 'Available Subjects'}
                        </p>
                        <div className="max-h-[260px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                          {dynamicDepartments.map((dept) => {
                            const isDeptActive = activeDepartment === dept;
                            return (
                              <div
                                key={dept}
                                onMouseEnter={() => setActiveDepartment(dept)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                                  isDeptActive
                                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-xs'
                                    : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                                }`}
                              >
                                <span>{dept}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isDeptActive ? 'text-primary translate-x-0.5' : 'text-foreground/30'}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sub-Panel Footer */}
                  <div className="pt-3 border-t border-foreground/10">
                    <Link
                      href={currentCategory.href}
                      className="text-xs font-bold text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <span>{isBn ? `${currentCategory.labelBn}-এর সকল কোর্স` : `View all in ${currentCategory.labelEn}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* PANEL 3: Level 3 Flyout */}
              {/* Case A: HSC Groups (Science, Arts, Commerce) */}
              {activeLevel === 'intermediate' && (
                <div className="w-[280px] p-4 flex flex-col justify-between bg-foreground/[0.01] animate-in fade-in duration-150">
                  <div>
                    <div className="pb-3 mb-3 border-b border-foreground/10">
                      <p className="text-sm font-black text-orange-500">
                        {isBn ? (activeHscClass === '11' ? 'একাদশ শ্রেণি (Class 11)' : 'দ্বাদশ শ্রেণি (Class 12)') : `Class ${activeHscClass}`}
                      </p>
                      <p className="text-xs text-foreground/50 pt-0.5">
                        {isBn ? 'বিভাগ (গ্রুপ) নির্বাচন করুন' : 'Select Academic Group'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {hscGroups.map((grp) => (
                        <Link
                          key={grp.id}
                          href={`/courses?category=intermediate&class=${activeHscClass}&group=${grp.id}`}
                          className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 text-sm font-bold text-foreground/90 transition-all border border-transparent hover:border-orange-500/20 group"
                        >
                          <span>{isBn ? grp.bn : grp.en}</span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-orange-500 transition-all group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-foreground/10">
                    <Link
                      href={`/courses?category=intermediate&class=${activeHscClass}`}
                      className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1"
                    >
                      <span>{isBn ? `ক্লাস ${activeHscClass}-এর সকল কোর্স` : `All Class ${activeHscClass} Courses`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Case B: Honours & Masters Dynamic Years (Only if active department exists) */}
              {activeLevel === 'honours_masters' && activeDepartment && (
                <div className="w-[260px] p-4 flex flex-col justify-between bg-foreground/[0.01] animate-in fade-in duration-150">
                  <div>
                    <div className="pb-3 mb-3 border-b border-foreground/10">
                      <p className="text-sm font-black text-primary truncate">
                        {activeDepartment}
                      </p>
                      <p className="text-xs text-foreground/50 pt-0.5">
                        {isBn ? 'বর্ষ / সেমিস্টার নির্বাচন করুন' : 'Select Year / Semester'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {academicYears.map((yr) => (
                        <Link
                          key={yr.id}
                          href={`/courses?department=${encodeURIComponent(activeDepartment)}&year=${encodeURIComponent(yr.id)}`}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-sm font-bold text-foreground transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <span>{isBn ? yr.bn : yr.en}</span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-all group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-foreground/10">
                    <Link
                      href={`/courses?department=${encodeURIComponent(activeDepartment)}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{isBn ? 'এই বিষয়ের সকল কোর্স' : 'All courses in subject'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Mega Menu Bar */}
            <div className="px-5 py-3.5 bg-foreground/[0.04] border-t border-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground/60">
                <Search className="w-4 h-4 text-primary" />
                <span>{isBn ? 'পছন্দের ক্লাস বা বিষয় নির্বাচন করে সরাসরি কোর্স খুঁজুন' : 'Select your class or stream to jump directly into courses'}</span>
              </div>
              <Link 
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-sm"
              >
                <span>{isBn ? 'সকল কোর্স ব্রাউজ করুন' : 'Browse All Courses'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
