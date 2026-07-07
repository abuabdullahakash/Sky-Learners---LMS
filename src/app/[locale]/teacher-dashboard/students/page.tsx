"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Eye, Users, UserCheck, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Base mock names to generate dynamic students for real courses
const MOCK_NAMES = [
  { n: 'Rahim Uddin', e: 'rahim@example.com' },
  { n: 'Jannatul Ferdous', e: 'jannatul@example.com' },
  { n: 'Hasan Mahmud', e: 'hasan@example.com' },
  { n: 'Sumaiya Akter', e: 'sumaiya@example.com' },
  { n: 'Karimul Islam', e: 'karimul@example.com' },
  { n: 'Ayesha Siddiqa', e: 'ayesha@example.com' },
  { n: 'Tariqul Islam', e: 'tariqul@example.com' },
];

export default function StudentsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('All');

  useEffect(() => {
    const fetchCoursesAndStudents = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch real courses created by this teacher
        const q = query(
          collection(db, 'courses'),
          where('teacherId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() });
        });
        
        setCourses(fetchedCourses);

        // Dynamically assign mock students to the teacher's real courses
        if (fetchedCourses.length > 0) {
          const generatedStudents = MOCK_NAMES.map((person, i) => {
            const course = fetchedCourses[i % fetchedCourses.length];
            const progress = Math.floor(Math.random() * 100);
            return {
              id: i,
              name: person.n,
              email: person.e,
              avatar: `https://i.pravatar.cc/150?img=${(i % 50) + 10}`, // Randomize avatar slightly
              courseTitle: course.title,
              courseId: course.id,
              enrollDate: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              progress: progress,
              status: progress === 100 ? 'Completed' : 'Active'
            };
          });
          setStudents(generatedStudents);
        } else {
          setStudents([]);
        }

      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoursesAndStudents();
  }, [user]);

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourseId === 'All' || student.courseId === filterCourseId;
    return matchesSearch && matchesCourse;
  });

  const activeStudentsCount = students.filter(s => s.status === 'Active').length;

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
            <h3 className="text-2xl font-bold">{students.length}</h3>
          </div>
        </div>
        
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Active Students</p>
            <h3 className="text-2xl font-bold">{activeStudentsCount}</h3>
          </div>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">New This Month</p>
            <h3 className="text-2xl font-bold">{Math.floor(students.length / 3)}</h3>
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
              placeholder="Search by name or email..." 
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
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
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
                          <p className="text-xs text-foreground/60">{student.email}</p>
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
                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors tooltip-trigger" title="Message Student">
                          <Mail className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors tooltip-trigger" title="View Profile">
                          <Eye className="w-5 h-5" />
                        </button>
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
        
        {/* Pagination Dummy */}
        {students.length > 0 && (
          <div className="p-4 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60 bg-background/50">
            <p>Showing {filteredStudents.length} of {students.length} students</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 rounded bg-primary text-white">1</button>
              <button className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50" disabled={filteredStudents.length === 0}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
