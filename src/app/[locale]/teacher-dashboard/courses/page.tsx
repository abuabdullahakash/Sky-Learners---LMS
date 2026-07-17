"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link, useRouter } from '@/i18n/routing';
import { PlusCircle, Search, Video, MoreVertical, Edit, Trash2, Users, CheckSquare, Calendar } from 'lucide-react';
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
};

export default function CoursesListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'courses'),
          where('teacherId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        
        // Sort in memory to avoid needing a composite index in Firestore immediately
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading courses...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">My Courses</h1>
          <p className="text-foreground/70">Manage your existing courses or create new ones.</p>
        </div>
        <Link 
          href="/teacher-dashboard/courses/create" 
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Create Course
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-foreground/5 p-4 rounded-2xl border border-foreground/10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="w-full pl-12 pr-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="w-full sm:w-auto px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 appearance-none">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Courses Yet</h2>
          <p className="text-foreground/60 max-w-md mb-8">You haven't created any courses yet. Start sharing your knowledge by creating your first course today.</p>
          <Link 
            href="/teacher-dashboard/courses/create" 
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30"
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => router.push(`/teacher-dashboard/courses/${course.id}`)}
              className="cursor-pointer group bg-foreground/5 rounded-3xl border border-foreground/10 overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all flex flex-col"
            >
              
              <div className="relative aspect-[16/9] w-full bg-foreground/10">
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/30">No Image</div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.isPublished ? 'bg-green-500 text-white' : 'bg-foreground/60 text-white backdrop-blur-md'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="text-sm font-medium text-orange-500 mb-2">{course.category.toUpperCase()}</div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2" title={course.title}>{course.title}</h3>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 mb-6 text-xs text-foreground/60 font-medium">
                  <div className="flex items-center gap-1.5" title="Enrolled Students"><Users className="w-4 h-4" /> 0</div>
                  <div className="flex items-center gap-1.5" title="Total Videos"><Video className="w-4 h-4" /> {course.totalVideoLessons || 0}</div>
                  <div className="flex items-center gap-1.5" title="Total Exams"><CheckSquare className="w-4 h-4" /> {course.totalExams || 0}</div>
                  <div className="flex items-center gap-1.5" title="Validity"><Calendar className="w-4 h-4" /> {course.courseValidity || 'N/A'}</div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/10">
                  <div className="flex flex-col">
                    {course.discountPrice && course.discountValidUntil && new Date() <= (course.discountValidUntil?.toDate ? course.discountValidUntil.toDate() : new Date(course.discountValidUntil)) ? (
                      <>
                        <span className="text-[10px] text-foreground/50 line-through">৳{course.price}</span>
                        <span className="text-lg font-extrabold text-orange-500">৳{course.discountPrice}</span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold">৳{course.price}</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/teacher-dashboard/courses/${course.id}/edit`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-orange-500 hover:text-white rounded-lg font-semibold transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit Course
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
