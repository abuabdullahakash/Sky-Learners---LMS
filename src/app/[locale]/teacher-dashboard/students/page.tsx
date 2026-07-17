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
        // 1. Fetch real courses created by this teacher
        const q = query(
          collection(db, 'courses'),
          where('teacherId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses: any[] = [];
        const courseInfoMap: Record<string, { title: string, totalVideoLessons: number }> = {};
        const courseIds: string[] = [];

        querySnapshot.forEach((doc) => {
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

        // 2. Fetch enrollments for the teacher
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('teacherId', '==', user.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
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

        // 3. Fetch completed lessons to calculate progress
        const completedLessonsMap: Record<string, number> = {}; // "studentId_courseId" -> count
        const chunkArray = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
        const courseChunks = chunkArray(courseIds, 10);
        
        for (const chunk of courseChunks) {
          const completedQuery = query(
            collection(db, 'completed_lessons'),
            where('courseId', 'in', chunk)
          );
          const completedSnapshot = await getDocs(completedQuery);
          completedSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.studentId && data.courseId) {
              const key = `${data.studentId}_${data.courseId}`;
              completedLessonsMap[key] = (completedLessonsMap[key] || 0) + 1;
            }
          });
        }

        // 4. Fetch last_accessed for "Active Students" logic and users for real-time profile data
        const studentIdsArray = Array.from(studentIds);
        const studentChunks = chunkArray(studentIdsArray, 10);
        const activeStudentIds = new Set<string>();
        const usersDataMap: Record<string, any> = {};
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        for (const chunk of studentChunks) {
          await Promise.all(chunk.map(async (studentId) => {
            try {
              // Fetch last_accessed
              const lastAccessedDoc = await getDoc(doc(db, 'last_accessed', studentId));
              if (lastAccessedDoc.exists()) {
                const data = lastAccessedDoc.data();
                if (data.timestamp && data.timestamp >= sevenDaysAgoISO) {
                  activeStudentIds.add(studentId);
                }
              }

              // Fetch real-time user profile
              const userDoc = await getDoc(doc(db, 'users', studentId));
              if (userDoc.exists()) {
                usersDataMap[studentId] = userDoc.data();
              }
            } catch (e) {
              console.error("Error fetching user/accessed data for", studentId, e);
            }
          }));
        }

        // 5. Combine and calculate top stats
        let newThisMonthCount = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const finalStudents = enrollmentsData.map(enrollment => {
          const courseId = enrollment.courseId;
          const studentId = enrollment.studentId;
          const courseInfo = courseInfoMap[courseId] || { title: enrollment.courseTitle || 'Unknown', totalVideoLessons: 0 };
          const userProfile = usersDataMap[studentId] || {};
          
          const completedCount = completedLessonsMap[`${studentId}_${courseId}`] || 0;
          const totalVideos = courseInfo.totalVideoLessons;
          const progress = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
          
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
            progress: Math.min(progress, 100),
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Students</h1>
        <p className="text-foreground/60">Manage and track your enrolled students' progress across your courses.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Total Students</p>
            <h3 className="text-2xl font-bold">{stats.totalStudents}</h3>
          </div>
        </div>
        
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Active Students</p>
            <h3 className="text-2xl font-bold">{stats.activeStudents}</h3>
          </div>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">New Enrollments</p>
            <h3 className="text-2xl font-bold">{stats.newThisMonth}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-foreground/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <select 
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full sm:w-56 bg-background border border-foreground/20 rounded-xl py-2.5 pl-9 pr-4 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="All">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-foreground/5 text-foreground/60 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course Enrolled</th>
                <th className="px-6 py-4 font-medium">Enroll Date</th>
                <th className="px-6 py-4 font-medium text-center">Progress</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    You haven't created any courses yet.
                  </td>
                </tr>
              ) : displayedStudents.length > 0 ? (
                displayedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover border border-foreground/10"
                        />
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs text-foreground/60">
                            {student.hasEmail ? student.email : student.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-foreground/10 rounded-full text-sm font-medium">
                        {student.courseTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/70">
                      {student.enrollDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{student.progress}%</span>
                        <div className="w-24 h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              student.progress === 100 ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.hasEmail ? (
                          <a 
                            href={`mailto:${student.email}`}
                            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors tooltip-trigger" 
                            title="Email Student"
                          >
                            <Mail className="w-5 h-5" />
                          </a>
                        ) : (
                          <a 
                            href={`tel:${student.phone}`}
                            className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors tooltip-trigger" 
                            title="Call Student"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        )}
                        {/* <button className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors tooltip-trigger" title="View Profile">
                          <Eye className="w-5 h-5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Section */}
        {filteredStudents.length > 0 && (
          <div className="p-6 border-t border-foreground/10 flex flex-col items-center justify-center gap-4 bg-background/50">
            <p className="text-sm text-foreground/60">
              Showing {displayedStudents.length} of {filteredStudents.length} enrollments
            </p>
            {visibleCount < filteredStudents.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 50)}
                className="px-8 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:scale-95"
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
