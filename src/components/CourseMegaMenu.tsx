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
  Layers,
  Search
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface CourseMegaMenuProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function CourseMegaMenu({ isMobile = false, onItemClick }: CourseMegaMenuProps) {
  const t = useTranslations('Navigation');
  const tEdu = useTranslations('EducationLevels');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const pathname = usePathname();
  const isCoursesActive = pathname === '/courses' || pathname.startsWith('/courses/');

  const [isOpen, setIsOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string>('primary');
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  
  // Mobile accordion state
  const [mobileExpandedLevel, setMobileExpandedLevel] = useState<string | null>(null);
  const [mobileExpandedDept, setMobileExpandedDept] = useState<string | null>(null);

  // Dynamic subjects from published courses
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
        snap.forEach(doc => {
          const data = doc.data();
          if ((data.category === 'honours' || data.category === 'masters') && data.department) {
            depts.add(data.department.trim());
          }
        });
        if (depts.size > 0) {
          setDynamicDepartments(Array.from(depts));
        }
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
      setActiveDepartment(null);
    }, 200);
  };

  // 1. Primary Classes
  const primaryClasses = [
    { classNum: '1', en: 'Class 1', bn: 'প্রথম শ্রেণি' },
    { classNum: '2', en: 'Class 2', bn: 'দ্বিতীয় শ্রেণি' },
    { classNum: '3', en: 'Class 3', bn: 'তৃতীয় শ্রেণি' },
    { classNum: '4', en: 'Class 4', bn: 'চতুর্থ শ্রেণি' },
    { classNum: '5', en: 'Class 5', bn: 'পঞ্চম শ্রেণি' },
  ];

  // 2. High School Classes
  const highSchoolClasses = [
    { classNum: '6', en: 'Class 6', bn: 'ষষ্ঠ শ্রেণি' },
    { classNum: '7', en: 'Class 7', bn: 'সপ্তম শ্রেণি' },
    { classNum: '8', en: 'Class 8', bn: 'অষ্টম শ্রেণি' },
    { classNum: '9', en: 'Class 9', bn: 'নবম শ্রেণি' },
    { classNum: '10', en: 'Class 10 (SSC)', bn: 'দশম শ্রেণি (এসএসসি)' },
  ];

  // 3. HSC Classes & Groups
  const hscClasses = [
    { classNum: '11', en: 'Class 11 (HSC 1st Year)', bn: 'একাদশ শ্রেণি (এইচএসসি ১ম বর্ষ)' },
    { classNum: '12', en: 'Class 12 (HSC 2nd Year)', bn: 'দ্বাদশ শ্রেণি (এইচএসসি ২য় বর্ষ)' },
  ];

  const hscGroups = [
    { id: 'science', en: 'Science Group', bn: 'বিজ্ঞান বিভাগ' },
    { id: 'arts', en: 'Arts (Humanities)', bn: 'মানবিক বিভাগ' },
    { id: 'commerce', en: 'Business Studies / Commerce', bn: 'ব্যবসায় শিক্ষা বিভাগ' },
  ];

  // 4. University Admission Segments
  const admissionSegments = [
    { id: 'engineering', en: 'Engineering Admission', bn: 'প্রকৌশল (ইঞ্জিনিয়ারিং) ভর্তি' },
    { id: 'medical', en: 'Medical Admission', bn: 'মেডিকেল ভর্তি প্রস্তুতি' },
    { id: 'university', en: 'Varsity (A/B/C/D Unit)', bn: 'বিশ্ববিদ্যালয় (A/B/C/D ইউনিট)' },
    { id: 'iba', en: 'IBA / BUP / Private Varsity', bn: 'আইবিএ / বিউপি / প্রাইভেট' },
  ];

  // 5. Honours & Masters Standard Departments
  const defaultHonoursDepartments = [
    { name: 'Physics', bnName: 'পদার্থবিজ্ঞান' },
    { name: 'Chemistry', bnName: 'রসায়ন' },
    { name: 'Mathematics', bnName: 'গণিত' },
    { name: 'Accounting', bnName: 'হিসাববিজ্ঞান' },
    { name: 'Management', bnName: 'ব্যবস্থাপনা' },
    { name: 'English', bnName: 'ইংরেজি' },
    { name: 'Economics', bnName: 'অর্থনীতি' },
    { name: 'Political Science', bnName: 'রাষ্ট্রবিজ্ঞান' },
    { name: 'Botany', bnName: 'উদ্ভিদবিজ্ঞান' },
    { name: 'Zoology', bnName: 'প্রাণিবিদ্যা' },
  ];

  // Merge dynamic departments if any
  const mergedDepartments = [...defaultHonoursDepartments];
  dynamicDepartments.forEach(dept => {
    if (!mergedDepartments.some(d => d.name.toLowerCase() === dept.toLowerCase())) {
      mergedDepartments.push({ name: dept, bnName: dept });
    }
  });

  const academicYears = [
    { id: '1st Year', en: '1st Year', bn: '১ম বর্ষ' },
    { id: '2nd Year', en: '2nd Year', bn: '২য় বর্ষ' },
    { id: '3rd Year', en: '3rd Year', bn: '৩য় বর্ষ' },
    { id: '4th Year', en: '4th Year', bn: '৪র্থ বর্ষ' },
    { id: 'Masters', en: 'Masters / Postgrad', bn: 'মাস্টার্স / পোস্টগ্র্যাড' },
  ];

  // 6. Skills Tracks
  const skillTracks = [
    { id: 'web_dev', en: 'Web & App Development', bn: 'ওয়েব ও অ্যাপ ডেভেলপমেন্ট' },
    { id: 'graphic_design', en: 'Graphic & UI/UX Design', bn: 'গ্রাফিক্স ও ইউআই/ইউএক্স ডিজাইন' },
    { id: 'spoken_english', en: 'Spoken English & IELTS', bn: 'স্পোকেন ইংলিশ ও আইইএলটিএস' },
    { id: 'digital_marketing', en: 'Digital Marketing & SEO', bn: 'ডিজিটাল মার্কেটিং ও এসইও' },
    { id: 'programming', en: 'Programming & Data Science', bn: 'প্রোগ্রামিং ও ডাটা সায়েন্স' },
  ];

  // Category Configuration
  const categories = [
    { 
      id: 'primary', 
      labelEn: 'Primary School', 
      labelBn: 'প্রাথমিক বিদ্যালয়', 
      descEn: 'Class 1 to Class 5',
      descBn: '১ম থেকে ৫ম শ্রেণি',
      icon: School 
    },
    { 
      id: 'high_school', 
      labelEn: 'High School', 
      labelBn: 'উচ্চ বিদ্যালয়', 
      descEn: 'Class 6 to Class 10 (SSC)',
      descBn: '৬ষ্ঠ থেকে ১০ম শ্রেণি (এসএসসি)',
      icon: GraduationCap 
    },
    { 
      id: 'intermediate', 
      labelEn: 'HSC', 
      labelBn: 'উচ্চ মাধ্যমিক', 
      descEn: 'Class 11, 12 & Groups',
      descBn: 'একাদশ, দ্বাদশ ও বিভাগসমূহ',
      icon: Award 
    },
    { 
      id: 'admission', 
      labelEn: 'University Admission', 
      labelBn: 'বিশ্ববিদ্যালয় ভর্তি', 
      descEn: 'Varsity, Medical, Engr, IBA',
      descBn: 'বিশ্ববিদ্যালয়, মেডিকেল, ইঞ্জিনিয়ারিং',
      icon: Building2 
    },
    { 
      id: 'honours_masters', 
      labelEn: 'Honours / Masters', 
      labelBn: 'অনার্স / মাস্টার্স', 
      descEn: 'Department & Year wise',
      descBn: 'বিষয় ও বর্ষভিত্তিক কোর্স',
      icon: Library,
      hasLevel3: true
    },
    { 
      id: 'skills', 
      labelEn: 'Skills', 
      labelBn: 'দক্ষতা', 
      descEn: 'Career & Tech skills',
      descBn: 'ক্যারিয়ার ও স্কিল ডেভেলপমেন্ট',
      icon: Sparkles 
    },
  ];

  // ----------------------------------------------------
  // MOBILE ACCORDION VIEW
  // ----------------------------------------------------
  if (isMobile) {
    return (
      <div className="w-full space-y-1">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            isCoursesActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-foreground/5'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {isBn ? 'কোর্স ক্যাটাগরি' : 'Courses & Categories'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-foreground/40'}`} />
        </div>

        {isOpen && (
          <div className="pl-3 pr-1 py-2 space-y-2 border-l-2 border-primary/20 ml-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* View all button */}
            <Link
              href="/courses"
              onClick={onItemClick}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
            >
              <span>{isBn ? '🔍 সকল কোর্স এক সাথে দেখুন' : '🔍 Browse All Courses'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = mobileExpandedLevel === cat.id;

              return (
                <div key={cat.id} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedLevel(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-foreground/5 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{isBn ? cat.labelBn : cat.labelEn}</p>
                        <p className="text-[10px] text-foreground/50">{isBn ? cat.descBn : cat.descEn}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-foreground/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-2.5 pt-0 bg-background/50 border-t border-foreground/5 space-y-1">
                      {/* 1. Primary Mobile */}
                      {cat.id === 'primary' && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {primaryClasses.map((item) => (
                            <Link
                              key={item.classNum}
                              href={`/courses?category=primary&class=${item.classNum}`}
                              onClick={onItemClick}
                              className="px-2.5 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-3 h-3 opacity-40" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 2. High School Mobile */}
                      {cat.id === 'high_school' && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {highSchoolClasses.map((item) => (
                            <Link
                              key={item.classNum}
                              href={`/courses?category=high_school&class=${item.classNum}`}
                              onClick={onItemClick}
                              className="px-2.5 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-3 h-3 opacity-40" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 3. HSC Mobile */}
                      {cat.id === 'intermediate' && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[10px] font-bold uppercase text-foreground/40 px-1">{isBn ? 'শ্রেণি ভিত্তিক' : 'Classes'}</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {hscClasses.map((item) => (
                              <Link
                                key={item.classNum}
                                href={`/courses?category=intermediate&class=${item.classNum}`}
                                onClick={onItemClick}
                                className="px-2.5 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all"
                              >
                                {isBn ? item.bn : item.en}
                              </Link>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold uppercase text-foreground/40 px-1 pt-1">{isBn ? 'বিভাগ ভিত্তিক' : 'Groups'}</p>
                          <div className="space-y-1">
                            {hscGroups.map((grp) => (
                              <Link
                                key={grp.id}
                                href={`/courses?category=intermediate&group=${grp.id}`}
                                onClick={onItemClick}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all flex items-center justify-between"
                              >
                                <span>{isBn ? grp.bn : grp.en}</span>
                                <ChevronRight className="w-3 h-3 opacity-40" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Admission Mobile */}
                      {cat.id === 'admission' && (
                        <div className="space-y-1 pt-1">
                          {admissionSegments.map((item) => (
                            <Link
                              key={item.id}
                              href={`/courses?category=admission&group=${item.id}`}
                              onClick={onItemClick}
                              className="w-full px-2.5 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-3 h-3 opacity-40" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 5. Honours & Masters Mobile */}
                      {cat.id === 'honours_masters' && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold uppercase text-foreground/40 px-1">{isBn ? 'বিষয় নির্বাচন করুন' : 'Select Subject'}</p>
                          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {mergedDepartments.map((dept) => {
                              const isDeptExpanded = mobileExpandedDept === dept.name;
                              return (
                                <div key={dept.name} className="rounded-lg border border-foreground/5 bg-foreground/5 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setMobileExpandedDept(isDeptExpanded ? null : dept.name)}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[11px] font-medium"
                                  >
                                    <span>{isBn ? dept.bnName : dept.name}</span>
                                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isDeptExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isDeptExpanded && (
                                    <div className="p-1.5 bg-background/80 border-t border-foreground/5 grid grid-cols-2 gap-1">
                                      {academicYears.map((yr) => (
                                        <Link
                                          key={yr.id}
                                          href={`/courses?department=${encodeURIComponent(dept.name)}&year=${encodeURIComponent(yr.id)}`}
                                          onClick={onItemClick}
                                          className="px-2 py-1 rounded bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[10px] font-medium text-foreground"
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
                        </div>
                      )}

                      {/* 6. Skills Mobile */}
                      {cat.id === 'skills' && (
                        <div className="space-y-1 pt-1">
                          {skillTracks.map((item) => (
                            <Link
                              key={item.id}
                              href={`/courses?category=skills&track=${item.id}`}
                              onClick={onItemClick}
                              className="w-full px-2.5 py-2 rounded-lg bg-foreground/5 hover:bg-primary/10 hover:text-primary text-[11px] font-medium text-foreground transition-all flex items-center justify-between"
                            >
                              <span>{isBn ? item.bn : item.en}</span>
                              <ChevronRight className="w-3 h-3 opacity-40" />
                            </Link>
                          ))}
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
  // DESKTOP MEGA MENU VIEW
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
        className={`flex items-center gap-1.5 font-medium text-sm transition-colors py-2 group ${
          isCoursesActive || isOpen ? 'text-primary' : 'text-foreground/80 hover:text-primary'
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
          className={`absolute left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="bg-background/95 backdrop-blur-2xl border border-foreground/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            
            {/* Main Multi-Panel Row */}
            <div className="flex divide-x divide-foreground/10 min-h-[380px]">
              
              {/* PANEL 1: Left Category Sidebar (Level 1) */}
              <div className="w-[240px] p-3 space-y-1 bg-foreground/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-wider text-foreground/40 px-3 py-1.5">
                  {isBn ? 'শিক্ষা স্তর (ক্যাটাগরি)' : 'Education Levels'}
                </p>

                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeLevel === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => {
                        setActiveLevel(cat.id);
                        if (cat.id !== 'honours_masters') {
                          setActiveDepartment(null);
                        } else if (!activeDepartment && mergedDepartments.length > 0) {
                          setActiveDepartment(mergedDepartments[0].name);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm' 
                          : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-primary text-white shadow-sm' : 'bg-foreground/5 text-foreground/70'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold leading-tight truncate">
                            {isBn ? cat.labelBn : cat.labelEn}
                          </p>
                          <p className={`text-[10px] leading-tight truncate ${isActive ? 'text-primary/70' : 'text-foreground/45'}`}>
                            {isBn ? cat.descBn : cat.descEn}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-primary' : 'text-foreground/30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* PANEL 2: Middle Sub-Items (Level 2 - Classes / Groups / Subjects) */}
              <div className="w-[280px] p-4 flex flex-col justify-between bg-background/50">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-foreground/10">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <currentCategory.icon className="w-4 h-4 text-primary" />
                      {isBn ? currentCategory.labelBn : currentCategory.labelEn}
                    </p>
                    <Link
                      href={`/courses?category=${activeLevel === 'honours_masters' ? 'honours' : activeLevel}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      {isBn ? 'সকল' : 'All'} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* 1. Primary Level 2 */}
                  {activeLevel === 'primary' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-2">
                        {isBn ? 'ক্লাস নির্বাচন করুন' : 'Select Class'}
                      </p>
                      {primaryClasses.map((item) => (
                        <Link
                          key={item.classNum}
                          href={`/courses?category=primary&class=${item.classNum}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground/90 transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-foreground/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-[10px] font-black transition-colors">
                              {item.classNum}
                            </div>
                            <span>{isBn ? item.bn : item.en}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* 2. High School Level 2 */}
                  {activeLevel === 'high_school' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-2">
                        {isBn ? 'ক্লাস নির্বাচন করুন' : 'Select Class'}
                      </p>
                      {highSchoolClasses.map((item) => (
                        <Link
                          key={item.classNum}
                          href={`/courses?category=high_school&class=${item.classNum}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground/90 transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-foreground/5 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-[10px] font-black transition-colors">
                              {item.classNum}
                            </div>
                            <span>{isBn ? item.bn : item.en}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* 3. HSC Level 2 */}
                  {activeLevel === 'intermediate' && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-1.5">
                          {isBn ? 'শ্রেণি' : 'Class'}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {hscClasses.map((item) => (
                            <Link
                              key={item.classNum}
                              href={`/courses?category=intermediate&class=${item.classNum}`}
                              className="px-2.5 py-2 rounded-xl bg-foreground/5 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground transition-all text-center border border-foreground/5 hover:border-primary/20"
                            >
                              {isBn ? (item.classNum === '11' ? 'একাদশ শ্রেণি' : 'দ্বাদশ শ্রেণি') : `Class ${item.classNum}`}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-1.5">
                          {isBn ? 'বিভাগ (গ্রুপ)' : 'Academic Groups'}
                        </p>
                        <div className="space-y-1">
                          {hscGroups.map((grp) => (
                            <Link
                              key={grp.id}
                              href={`/courses?category=intermediate&group=${grp.id}`}
                              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-xs font-medium text-foreground transition-all group"
                            >
                              <span>{isBn ? grp.bn : grp.en}</span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. University Admission Level 2 */}
                  {activeLevel === 'admission' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-2">
                        {isBn ? 'টার্গেট ইউনিট ও বিষয়' : 'Target Segments'}
                      </p>
                      {admissionSegments.map((item) => (
                        <Link
                          key={item.id}
                          href={`/courses?category=admission&group=${item.id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <span>{isBn ? item.bn : item.en}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* 5. Honours & Masters Level 2 (Departments List) */}
                  {activeLevel === 'honours_masters' && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-1.5">
                        {isBn ? 'বিভাগ / বিষয় (হোভার করুন)' : 'Department / Subject (Hover)'}
                      </p>
                      <div className="max-h-[260px] overflow-y-auto custom-scrollbar pr-1 space-y-1">
                        {mergedDepartments.map((dept) => {
                          const isDeptActive = activeDepartment === dept.name;
                          return (
                            <div
                              key={dept.name}
                              onMouseEnter={() => setActiveDepartment(dept.name)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                                isDeptActive
                                  ? 'bg-primary/15 text-primary border border-primary/25 font-bold shadow-xs'
                                  : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground'
                              }`}
                            >
                              <span>{isBn ? dept.bnName : dept.name}</span>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isDeptActive ? 'text-primary translate-x-0.5' : 'text-foreground/30'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 6. Skills Level 2 */}
                  {activeLevel === 'skills' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-1 mb-2">
                        {isBn ? 'স্কিল ট্র্যাকসমূহ' : 'Specialized Tracks'}
                      </p>
                      {skillTracks.map((item) => (
                        <Link
                          key={item.id}
                          href={`/courses?category=skills&track=${item.id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <span>{isBn ? item.bn : item.en}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Panel Footer */}
                <div className="pt-3 border-t border-foreground/10">
                  <Link
                    href={`/courses?category=${activeLevel === 'honours_masters' ? 'honours' : activeLevel}`}
                    className="text-[11px] font-bold text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span>{isBn ? 'এই ক্যাটাগরির সকল কোর্স' : 'View all in this category'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* PANEL 3: Level 3 Flyout (Specifically for Honours / Masters Year & Semester) */}
              {activeLevel === 'honours_masters' && (
                <div className="w-[240px] p-4 flex flex-col justify-between bg-foreground/[0.01] animate-in fade-in duration-150">
                  <div>
                    <div className="pb-3 mb-3 border-b border-foreground/10">
                      <p className="text-xs font-black text-primary truncate">
                        {activeDepartment || 'Physics'}
                      </p>
                      <p className="text-[10px] text-foreground/50">
                        {isBn ? 'বর্ষ / সেমিস্টার নির্বাচন করুন' : 'Select Year / Semester'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {academicYears.map((yr) => {
                        const targetUrl = yr.id === 'Masters'
                          ? `/courses?category=masters&department=${encodeURIComponent(activeDepartment || 'Physics')}&year=${encodeURIComponent(yr.id)}`
                          : `/courses?category=honours&department=${encodeURIComponent(activeDepartment || 'Physics')}&year=${encodeURIComponent(yr.id)}`;

                        return (
                          <Link
                            key={yr.id}
                            href={targetUrl}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 text-xs font-semibold text-foreground/90 transition-all border border-transparent hover:border-orange-500/20 group"
                          >
                            <span>{isBn ? yr.bn : yr.en}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-orange-500 transition-all group-hover:translate-x-0.5" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-foreground/10">
                    <Link
                      href={`/courses?department=${encodeURIComponent(activeDepartment || 'Physics')}`}
                      className="text-[11px] font-bold text-orange-500 hover:underline flex items-center gap-1"
                    >
                      <span>{isBn ? 'এই বিষয়ের সকল কোর্স' : 'All courses in subject'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Mega Menu Bar */}
            <div className="px-5 py-3 bg-foreground/[0.04] border-t border-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span>{isBn ? 'পছন্দের ক্লাস বা বিষয় নির্বাচন করে সরাসরি কোর্স খুঁজুন' : 'Select your class or stream to jump directly into courses'}</span>
              </div>
              <Link 
                href="/courses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all shadow-xs"
              >
                <span>{isBn ? 'সকল কোর্স ব্রাউজ করুন' : 'Browse All Courses'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
