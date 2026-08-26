"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Search, X, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { generateCourseUrl } from '@/lib/slug';

interface HeaderSearchBarProps {
  isTeacherStorefrontMode?: boolean;
  activeTeacherId?: string | null;
}

export default function HeaderSearchBar({ isTeacherStorefrontMode = false, activeTeacherId = null }: HeaderSearchBarProps) {
  const router = useRouter();
  const locale = useLocale();
  const isBn = locale === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch courses once for quick live search
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setLoading(true);
        const coursesRef = collection(db, 'courses');
        let q;
        if (isTeacherStorefrontMode && activeTeacherId) {
          q = query(
            coursesRef, 
            where('teacherId', '==', activeTeacherId), 
            where('isPublished', '==', true)
          );
        } else {
          q = query(coursesRef, where('isPublished', '==', true));
        }
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCourses(list);
      } catch (err) {
        console.error("Failed to load search index:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchData();
  }, [isTeacherStorefrontMode, activeTeacherId]);

  // Filter suggestions on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = courses.filter(c => 
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q) ||
      c.instructorName?.toLowerCase().includes(q) ||
      c.coachingName?.toLowerCase().includes(q) ||
      (c.specificSubjects && c.specificSubjects.some((s: any) => (typeof s === 'string' ? s : s.name)?.toLowerCase().includes(q)))
    ).slice(0, 5);

    setFilteredSuggestions(matches);
  }, [searchQuery, courses]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsOpen(false);
    
    let target = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
    if (isTeacherStorefrontMode && activeTeacherId) {
      target += `&teacherId=${activeTeacherId}`;
    }
    router.push(target);
  };

  const handleSuggestionClick = (course: any) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(generateCourseUrl(course));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-foreground/45 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isBn ? "সার্চ করুন..." : "Search courses..."}
          className="w-full pl-9 pr-8 py-2 text-sm bg-foreground/[0.04] hover:bg-foreground/[0.07] focus:bg-background border border-foreground/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 rounded-full transition-all text-foreground placeholder:text-foreground/45 focus:outline-none"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilteredSuggestions([]);
            }}
            className="absolute right-3 text-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Live Search Instant Suggestion Flyout Dropdown */}
      {isOpen && searchQuery.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-background/95 backdrop-blur-2xl border border-foreground/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {filteredSuggestions.length > 0 ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 px-3 py-1">
                  {isBn ? 'কোর্স সাজেশন' : 'Course Suggestions'}
                </p>
                {filteredSuggestions.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleSuggestionClick(course)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-foreground/5 overflow-hidden flex items-center justify-center shrink-0 border border-foreground/10">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary truncate leading-tight">
                        {course.title}
                      </p>
                      <p className="text-[10px] text-foreground/50 truncate leading-tight pt-0.5">
                        {course.coachingName || course.instructorName || (isBn ? 'কোর্স' : 'Course')} {course.category ? `• ${course.category}` : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full mt-1 p-2 text-center text-xs font-bold text-primary bg-primary/5 hover:bg-primary/15 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isBn ? `"${searchQuery}" দিয়ে সকল ফলাফল দেখুন` : `View all results for "${searchQuery}"`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="p-4 text-center text-xs text-foreground/50">
                {isBn ? 'কোনো কোর্স খুঁজে পাওয়া যায়নি' : 'No matching courses found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
