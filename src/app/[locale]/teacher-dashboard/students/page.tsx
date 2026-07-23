"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Eye, Users, UserCheck, UserPlus, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function StudentsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('All');
  
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5);
  }, [searchTerm, filterCourseId]);

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const fetchCoursesAndStudents = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1 & 2. Fetch courses and enrollments concurrently
        const [coursesSnapshot, enrollmentsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'courses'), where('teacherId', '==', user.uid))),
          getDocs(query(collection(db, 'enrollments'), where('teacherId', '==', user.uid)))
        ]);

        const fetchedCourses: any[] = [];
        const courseInfoMap: Record<string, { title: string, totalVideoLessons: number }> = {};
        const courseIds: string[] = [];

        coursesSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCourses.push({ id: doc.id, ...data });
          courseIds.push(doc.id);
          courseInfoMap[doc.id] = {
            title: data.title || '',
            totalVideoLessons: Number(data.totalVideoLessons) || 0
          };
        });
        
        setCourses(fetchedCourses);

        if (courseIds.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        const enrollmentsData: any[] = [];
        const studentIds = new Set<string>();
        
        enrollmentsSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.studentId) {
            studentIds.add(data.studentId);
            enrollmentsData.push({
              id: docSnap.id,
              ...data,
            });
          }
        });

        // 4. Prepare promises for users and last_accessed (executed concurrently)
        const studentIdsArray = Array.from(studentIds);
        const activeStudentIds = new Set<string>();
        const usersDataMap: Record<string, any> = {};
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        const userAndAccessPromises = studentIdsArray.map(async (studentId) => {
          try {
            const [lastAccessedDoc, userDoc] = await Promise.all([
              getDoc(doc(db, 'last_accessed', studentId)),
              getDoc(doc(db, 'users', studentId))
            ]);
            
            if (lastAccessedDoc.exists()) {
              const data = lastAccessedDoc.data();
              if (data.timestamp && data.timestamp >= sevenDaysAgoISO) {
                activeStudentIds.add(studentId);
              }
            }

            if (userDoc.exists()) {
              usersDataMap[studentId] = userDoc.data();
            }
          } catch (e) {
            console.error("Error fetching user/accessed data for", studentId, e);
          }
        });

        // Await all background data simultaneously
        await Promise.all(userAndAccessPromises);


        // 5. Combine and calculate top stats
        let newThisMonthCount = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const finalStudents = enrollmentsData.map(enrollment => {
          const courseId = enrollment.courseId;
          const studentId = enrollment.studentId;
          const courseInfo = courseInfoMap[courseId] || { title: enrollment.courseTitle || 'Unknown', totalVideoLessons: 0 };
          const userProfile = usersDataMap[studentId] || {};
          

          // Get profile data directly from users collection, fallback to checkout data
          const finalName = userProfile.name || enrollment.studentName || 'Unknown Student';
          const finalEmail = userProfile.email || enrollment.studentEmail || '';
          const finalPhone = userProfile.phone || userProfile.phoneNumber || enrollment.offlinePhone || enrollment.senderNumber || '';
          const finalAvatar = userProfile.photoURL || userProfile.imageUrl || enrollment.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=random`;

          const hasEmail = finalEmail && finalEmail.trim() !== '' && !finalEmail.includes('no-email');

          let enrollDateStr = 'Unknown';
          let createdAtDate = new Date(0);
          
          if (enrollment.createdAt) {
            createdAtDate = enrollment.createdAt.toDate ? enrollment.createdAt.toDate() : new Date(enrollment.createdAt);
            enrollDateStr = createdAtDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            // Count total enrollments this month
            if (createdAtDate.getMonth() === currentMonth && createdAtDate.getFullYear() === currentYear) {
              newThisMonthCount++;
            }
          }

          return {
            id: enrollment.id,
            studentId: studentId,
            name: finalName,
            email: finalEmail,
            phone: finalPhone,
            hasEmail: hasEmail,
            avatar: finalAvatar,
            courseTitle: courseInfo.title,
            courseId: courseId,
            enrollDate: enrollDateStr,
            createdAtDate: createdAtDate,
            isActive: activeStudentIds.has(studentId)
          };
        });

        // Sort by newest enrollment first
        finalStudents.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());

        setStudents(finalStudents);
        setStats({
          totalStudents: studentIds.size, // Unique students
          activeStudents: activeStudentIds.size, // Unique active students
          newThisMonth: newThisMonthCount // Total new enrollments
        });

      } catch (error) {
        console.error("Error fetching courses and students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoursesAndStudents();
  }, [user]);

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourseId === 'All' || student.courseId === filterCourseId;
    return matchesSearch && matchesCourse;
  });

  const displayedStudents = filteredStudents.slice(0, visibleCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Hero Header Banner (0px border radius / rounded-none) */}
      <div className="relative overflow-hidden rounded-none p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border-b border-white/10 -mx-4 -mt-4 mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
            Student Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            Students
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
            Manage and track your enrolled students&apos; progress across your courses.
          </p>
        </div>
      </div>

      {/* Stats Cards - 2 Columns on Mobile (grid-cols-2) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-2 sm:mb-3">
            <Users className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium">Total Students</p>
          <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">{stats.totalStudents}</h3>
        </div>
        
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2 sm:mb-3">
            <UserCheck className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium">Active Students</p>
          <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">{stats.activeStudents}</h3>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mb-2 sm:mb-3">
            <UserPlus className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium">New Enrollments</p>
          <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">{stats.newThisMonth}</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar - Search & Filter in 1 Row on Mobile */}
        <div className="p-3.5 sm:p-4 border-b border-foreground/10 bg-background/50">
          <div className="flex flex-row gap-2 w-full items-center">
            <div className="relative flex-[1.6] min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search name, email or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            
            <div className="relative flex-[1] min-w-0">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
              <select 
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2 pl-8 pr-2 text-xs sm:text-sm appearance-none focus:outline-none focus:border-orange-500 transition-colors cursor-pointer truncate font-semibold"
              >
                <option value="All" className="bg-slate-900 text-white font-bold py-2">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="bg-slate-900 text-white font-medium py-2">
                    {course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-foreground/5 text-foreground/60 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Course Enrolled</th>
                <th className="px-6 py-3.5">Enroll Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-sm">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground/50">
                    You haven&apos;t created any courses yet.
                  </td>
                </tr>
              ) : displayedStudents.length > 0 ? (
                displayedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-9 h-9 rounded-full object-cover border border-foreground/10"
                        />
                        <div>
                          <p className="font-bold text-foreground">{student.name}</p>
                          <p className="text-xs text-foreground/60">
                            {student.hasEmail ? student.email : student.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-bold">
                        {student.courseTitle}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-foreground/70 font-medium">
                      {student.enrollDate}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.hasEmail ? (
                          <a 
                            href={`mailto:${student.email}`}
                            className="p-2 hover:bg-orange-500/10 hover:text-orange-500 rounded-lg transition-colors" 
                            title="Email Student"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        ) : (
                          <a 
                            href={`tel:${student.phone}`}
                            className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors" 
                            title="Call Student"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground/50">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Shows All Columns Cleanly without Overflow) */}
        <div className="block md:hidden divide-y divide-foreground/10">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-xs text-foreground/50">You haven&apos;t created any courses yet.</div>
          ) : displayedStudents.length > 0 ? (
            displayedStudents.map((student) => (
              <div key={student.id} className="p-3.5 flex flex-col gap-2 hover:bg-foreground/5 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-9 h-9 rounded-full object-cover border border-foreground/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate text-foreground">{student.name}</p>
                      <p className="text-[11px] text-foreground/60 truncate">
                        {student.hasEmail ? student.email : student.phone}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {student.hasEmail ? (
                      <a 
                        href={`mailto:${student.email}`}
                        className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg inline-flex items-center justify-center" 
                        title="Email Student"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    ) : (
                      <a 
                        href={`tel:${student.phone}`}
                        className="p-1.5 bg-green-500/10 text-green-500 rounded-lg inline-flex items-center justify-center" 
                        title="Call Student"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-foreground/60 pt-1 border-t border-foreground/5">
                  <span className="inline-block px-2.5 py-0.5 bg-orange-500/10 text-orange-600 font-bold rounded-full truncate max-w-[200px]">
                    {student.courseTitle}
                  </span>
                  <span className="font-medium shrink-0 text-[10px] text-foreground/50">
                    {student.enrollDate}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-foreground/50">No students found matching your criteria.</div>
          )}
        </div>
        
        {/* Load More Section */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-foreground/10 flex flex-col items-center justify-center gap-3 bg-background/50">
            <p className="text-xs text-foreground/60">
              Showing {displayedStudents.length} of {filteredStudents.length} enrollments
            </p>
            {visibleCount < filteredStudents.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 50)}
                className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md hover:shadow-orange-500/30"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
