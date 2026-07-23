"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link, useRouter } from '@/i18n/routing';
import { PlusCircle, Search, Video, Edit, Users, CheckSquare, Calendar, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';

type Course = {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnailUrl: string;
  isPublished: boolean;
  createdAt: any;
  totalVideoLessons?: number;
  totalExams?: number;
  courseValidity?: string;
  discountPrice?: number;
  discountValidUntil?: any;
  enrolledStudents?: number;
};

export default function CoursesListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('teacherId', '==', user.uid)
        );
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('teacherId', '==', user.uid),
          where('status', '==', 'approved')
        );

        const [coursesSnap, enrollmentsSnap] = await Promise.all([
          getDocs(coursesQuery),
          getDocs(enrollmentsQuery),
        ]);

        const enrollmentCounts: Record<string, number> = {};
        enrollmentsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.courseId) {
            enrollmentCounts[data.courseId] = (enrollmentCounts[data.courseId] || 0) + 1;
          }
        });

        const fetchedCourses: Course[] = [];
        coursesSnap.forEach((doc) => {
          const data = doc.data();
          fetchedCourses.push({
            id: doc.id,
            ...data,
            enrolledStudents: enrollmentCounts[doc.id] || data.enrolledStudents || 0,
          } as Course);
        });
        
        // Sort in memory
        fetchedCourses.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return dateB - dateA;
        });

        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (course.title && course.title.toLowerCase().includes(q)) ||
      (course.category && course.category.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && course.isPublished) ||
      (statusFilter === 'draft' && !course.isPublished);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-orange-500 font-bold">Loading courses...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Hero Header Banner (0px border radius / rounded-none) */}
      <div className="relative rounded-none p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border-b border-white/10 -mx-4 -mt-4 mb-6 z-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
              Course Management
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              My Courses
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
              Manage your existing courses or create new ones.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Icon Button */}
            <button 
              onClick={() => {
                setShowSearchModal(!showSearchModal);
                setShowFilterModal(false);
              }}
              className={`relative p-3 rounded-xl border transition-all ${
                searchQuery ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Search Courses"
            >
              <Search className="w-5 h-5" />
              {searchQuery && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
              )}
            </button>

            {/* Filter Icon Button */}
            <button 
              onClick={() => {
                setShowFilterModal(!showFilterModal);
                setShowSearchModal(false);
              }}
              className={`relative p-3 rounded-xl border transition-all ${
                statusFilter !== 'all' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Filter Status"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {statusFilter !== 'all' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
              )}
            </button>

            {/* Create Course Button */}
            <Link 
              href="/teacher-dashboard/courses/create" 
              className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {/* Popover Overlay for Search */}
        {showSearchModal && (
          <div className="relative z-50 mt-4 p-4 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Search Courses</span>
              <button onClick={() => setShowSearchModal(false)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input 
                type="text" 
                placeholder="Type course title or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs font-bold bg-white/10 rounded-full w-5 h-5 flex items-center justify-center">✕</button>
              )}
            </div>
          </div>
        )}

        {/* Popover Overlay for Status Filter */}
        {showFilterModal && (
          <div className="relative z-20 mt-4 p-4 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Filter by Status</span>
              <button onClick={() => setShowFilterModal(false)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2">
              {(['all', 'published', 'draft'] as const).map((st) => (
                <button 
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setShowFilterModal(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    statusFilter === st 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30' 
                      : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                  }`}
                >
                  {st === 'all' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Bar if applied */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-foreground/80 flex-wrap">
            <span className="font-bold text-orange-500">Active Filters:</span>
            {searchQuery && <span className="bg-foreground/10 px-2 py-0.5 rounded font-mono">&quot;{searchQuery}&quot;</span>}
            {statusFilter !== 'all' && <span className="bg-foreground/10 px-2 py-0.5 rounded capitalize">{statusFilter}</span>}
          </div>
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-orange-500 hover:underline font-bold shrink-0 ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-2xl border border-foreground/10 p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Courses Yet</h2>
          <p className="text-foreground/60 max-w-md text-sm mb-6">You haven&apos;t created any courses yet. Start sharing your knowledge by creating your first course today.</p>
          <Link 
            href="/teacher-dashboard/courses/create" 
            className="px-6 py-2.5 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
          >
            Create Your First Course
          </Link>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-foreground/5 rounded-2xl border border-foreground/10 p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold mb-2">No Courses Found</h2>
          <p className="text-foreground/60 max-w-md text-xs mb-5">No courses matched your search or status filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-5 py-2 bg-foreground/10 hover:bg-orange-500 hover:text-white font-bold text-xs rounded-xl transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => router.push(`/teacher-dashboard/courses/${course.id}`)}
              className="cursor-pointer group bg-foreground/5 rounded-2xl border border-foreground/10 overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all flex flex-col"
            >
              
              <div className="relative aspect-[16/9] w-full bg-foreground/10">
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/30 text-xs font-bold">No Image</div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${course.isPublished ? 'bg-green-500 text-white' : 'bg-foreground/60 text-white backdrop-blur-md'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="text-xs font-extrabold text-orange-500 mb-1 tracking-wide">{(course.category || '').toUpperCase()}</div>
                <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2" title={course.title}>{course.title}</h3>
                
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 mb-4 text-xs text-foreground/60 font-medium">
                  <div className="flex items-center gap-1" title="Enrolled Students"><Users className="w-3.5 h-3.5 text-orange-500" /> {course.enrolledStudents || 0}</div>
                  <div className="flex items-center gap-1" title="Total Videos"><Video className="w-3.5 h-3.5 text-blue-500" /> {course.totalVideoLessons || 0}</div>
                  <div className="flex items-center gap-1" title="Total Exams"><CheckSquare className="w-3.5 h-3.5 text-green-500" /> {course.totalExams || 0}</div>
                  <div className="flex items-center gap-1" title="Validity"><Calendar className="w-3.5 h-3.5 text-purple-500" /> {course.courseValidity || 'N/A'}</div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/10">
                  <div className="flex flex-col">
                    {(() => {
                      const hasDiscount = course.discountPrice !== undefined && course.discountPrice !== null && (course.discountPrice as any) !== '';
                      const isDiscountValid = hasDiscount && course.discountValidUntil && new Date() <= (course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil));
                      const activeP = isDiscountValid ? Number(course.discountPrice) : Number(course.price || 0);
                      const isFree = activeP === 0;

                      if (isFree) {
                        return isDiscountValid ? (
                          <>
                            <span className="text-[10px] text-foreground/50 line-through">৳{course.price}</span>
                            <span className="text-base font-extrabold text-emerald-500">ফ্রি</span>
                          </>
                        ) : (
                          <span className="text-base font-extrabold text-emerald-500">ফ্রি</span>
                        );
                      }

                      return isDiscountValid ? (
                        <>
                          <span className="text-[10px] text-foreground/50 line-through">৳{course.price}</span>
                          <span className="text-base font-extrabold text-orange-500">৳{course.discountPrice}</span>
                        </>
                      ) : (
                        <span className="text-base font-extrabold">৳{course.price}</span>
                      );
                    })()}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/teacher-dashboard/courses/${course.id}/edit`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/10 hover:bg-orange-500 hover:text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Course
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
