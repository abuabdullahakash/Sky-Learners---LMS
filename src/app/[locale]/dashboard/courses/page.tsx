"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link } from '@/i18n/routing';
import { BookOpen, Clock, CheckCircle2, PlayCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

type EnrolledCourse = {
  enrollmentId: string;
  courseId: string;
  status: 'pending' | 'approved';
  enrolledAt: Date;
  courseDetails: any; 
};

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      try {
        // Fetch enrollments for the current student
        const q = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const enrollmentsPromises = querySnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const courseId = enrollmentData.courseId;
          
          let courseDetails = null;
          if (courseId) {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              courseDetails = { id: courseSnap.id, ...courseSnap.data() };
            }
          }

          return {
            enrollmentId: enrollmentDoc.id,
            courseId: courseId,
            status: enrollmentData.status,
            enrolledAt: enrollmentData.createdAt?.toDate() || new Date(),
            courseDetails,
          } as EnrolledCourse;
        });

        const fetchedCourses = await Promise.all(enrollmentsPromises);
        
        // Sort by enrolledAt descending
        fetchedCourses.sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime());

        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCourses = courses.filter(c => c.status === 'pending');
  const approvedCourses = courses.filter(c => c.status === 'approved');

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">My Courses</h1>
        <p className="text-foreground/70 text-lg">Track your learning progress and pending enrollments.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Courses Found</h2>
          <p className="text-foreground/60 max-w-md mb-8">You haven't enrolled in any courses yet. Explore our catalog and start learning today!</p>
          <Link 
            href="/courses" 
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Pending Courses Section */}
          {pendingCourses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-500" />
                Pending Approval
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Approved Courses Section */}
          {approvedCourses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Active Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedCourses.map((item) => (
                  <CourseCard key={item.enrollmentId} item={item} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ item }: { item: EnrolledCourse }) {
  const course = item.courseDetails;
  
  if (!course) {
    return (
      <div className="bg-foreground/5 rounded-3xl border border-foreground/10 p-6 flex items-center gap-4 text-foreground/50">
        <AlertCircle className="w-6 h-6" />
        Course details unavailable
      </div>
    );
  }

  const isPending = item.status === 'pending';

  return (
    <div className="group bg-foreground/5 rounded-3xl border border-foreground/10 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full">
      
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full bg-foreground/10 flex-shrink-0">
        {course.thumbnailUrl ? (
          <Image src={course.thumbnailUrl} alt={course.title || 'Course'} fill className={`object-cover transition-transform duration-500 ${!isPending && 'group-hover:scale-105'}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30">No Image</div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 ${
            isPending ? 'bg-orange-500/90 text-white' : 'bg-green-500/90 text-white'
          }`}>
            {isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {isPending ? 'Pending' : 'Active'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
          {course.category || 'Course'}
        </div>
        <h3 className="text-xl font-bold mb-3 line-clamp-2">{course.title}</h3>
        
        {/* Progress (Mocked for active courses) */}
        {!isPending && (
          <div className="mt-auto pt-4 mb-4">
             <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-primary">Progress</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden shadow-inner">
                <div className="bg-primary h-full rounded-full w-[0%]"></div>
              </div>
          </div>
        )}

        <div className={`mt-auto pt-4 border-t border-foreground/10 ${isPending ? 'pt-4' : ''}`}>
          {isPending ? (
            <div className="w-full py-2.5 bg-foreground/5 text-foreground/50 rounded-xl font-semibold text-center text-sm flex items-center justify-center gap-2 cursor-not-allowed">
              <Clock className="w-4 h-4" />
              Waiting for Approval
            </div>
          ) : (
            <Link 
              href={`/dashboard/courses/${course.id}`}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4" />
              Start Learning
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
