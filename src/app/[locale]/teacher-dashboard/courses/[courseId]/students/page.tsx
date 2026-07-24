"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Search, Users, Phone, Link, Mail, UserCircle, LayoutGrid, List as ListIcon } from 'lucide-react';

type Student = {
  id: string;
  studentId: string;
  studentName: string;
  offlinePhone?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  contactEmail?: string;
  profileImageUrl?: string;
  createdAt: any;
};

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Progress tracking states
  const [totalCourseLessons, setTotalCourseLessons] = useState(0);
  const [studentProgress, setStudentProgress] = useState<Record<string, number>>({});

  // Fetch approved enrollments to get students
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId),
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      const fetched: Student[] = [];
      querySnapshot.forEach((document) => {
        fetched.push({ id: document.id, ...document.data() } as Student);
      });
      
      // Sort by date descending
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      
      // Fetch course data for total lessons
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      let totalLessons = 0;
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        if (courseData.modules) {
          courseData.modules.forEach((module: any) => {
            if (module.lessons) {
              totalLessons += module.lessons.length;
            }
          });
        }
      }
      setTotalCourseLessons(totalLessons);

      // Fetch all completed lessons for this course
      const completedQuery = query(
        collection(db, 'completed_lessons'),
        where('courseId', '==', courseId)
      );
      const completedSnap = await getDocs(completedQuery);
      const progressCounts: Record<string, number> = {};
      completedSnap.forEach((document) => {
        const data = document.data();
        if (data.studentId) {
          progressCounts[data.studentId] = (progressCounts[data.studentId] || 0) + 1;
        }
      });
      setStudentProgress(progressCounts);
      
      setStudents(fetched);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchStudents();
  }, [courseId]);

  // Filter logic
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.studentName?.toLowerCase().includes(term) ||
      student.offlinePhone?.toLowerCase().includes(term) ||
      student.whatsappNumber?.toLowerCase().includes(term) ||
      student.contactEmail?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">

      {/* Hero Section */}
      <div className="relative w-full mb-4 shadow-lg">
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 bg-[#111827]"/>
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
          <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Teacher Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Enrolled Students</h1>
          <p className="text-gray-300 text-sm font-medium">View details and contact information of approved students.</p>
        </div>
      </div>

      {/* Overview Stats */}
      {students.length > 0 && totalCourseLessons > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-1.5 w-full sm:w-auto">
            <span className="inline-block px-2.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-orange-500/30">
              Batch Metrics
            </span>
            <h3 className="text-base sm:text-xl font-black text-white leading-snug">Batch Performance</h3>
            <p className="text-xs text-gray-300 hidden sm:block">Average course completion across all students.</p>
          </div>

          <div className="relative z-10 flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="text-left sm:text-right flex-1 sm:flex-initial">
              <p className="text-2xl sm:text-3xl font-black text-orange-400">
                {Math.round((Object.values(studentProgress).reduce((a, b) => a + b, 0) / (students.length * totalCourseLessons)) * 100) || 0}%
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Avg Progress</p>
            </div>
            <div className="text-right flex-1 sm:flex-initial pl-4 sm:pl-6 border-l border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {Object.keys(studentProgress).length}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Active Students</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        
        {/* Header: Total Count & Search Bar Next To It */}
        <div className="p-3 sm:p-4 border-b border-foreground/10 flex items-center gap-3 bg-background/50">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-500 rounded-xl font-bold text-xs shrink-0 border border-green-500/20">
            <Users className="w-3.5 h-3.5" /> <span>Total: {students.length}</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search name, phone, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-foreground/20 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
              <Users className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No students found.</p>
            </div>
          ) : (
            <div className="p-2 sm:p-4 space-y-3">
              {filteredStudents.map((student) => {
                const pct = totalCourseLessons > 0 ? Math.round(((studentProgress[student.studentId] || 0) / totalCourseLessons) * 100) : 0;

                return (
                  <div key={student.id} className="bg-background border border-foreground/10 rounded-2xl p-3.5 sm:p-5 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    
                    {/* Student Info & Progress */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {student.profileImageUrl ? (
                        <img src={student.profileImageUrl} alt={student.studentName} className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-primary/20 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 border border-foreground/10 shrink-0">
                          <UserCircle className="w-7 h-7 sm:w-9 sm:h-9" />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                          <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{student.studentName || 'Student'}</h3>
                          <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            {pct}% Progress
                          </span>
                        </div>
                        
                        <p className="text-[10px] sm:text-xs text-foreground/50 truncate mb-1.5">
                          Enrolled: {new Date(student.createdAt?.toDate?.() || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>

                        {/* Progress Bar */}
                        {totalCourseLessons > 0 && (
                          <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Action Icons */}
                    <div className="flex items-center gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-foreground/10 shrink-0 flex-wrap">
                      {student.offlinePhone && (
                        <a href={`tel:${student.offlinePhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-semibold text-foreground/80 transition-colors border border-foreground/10" title={student.offlinePhone}>
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span className="truncate max-w-[110px]">{student.offlinePhone}</span>
                        </a>
                      )}
                      {student.whatsappNumber && (
                        <a href={`https://wa.me/${student.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-semibold text-emerald-500 transition-all border border-emerald-500/20" title={student.whatsappNumber}>
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="truncate max-w-[110px]">{student.whatsappNumber}</span>
                        </a>
                      )}
                      {student.contactEmail && (
                        <a href={`mailto:${student.contactEmail}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-semibold transition-all border border-orange-500/20" title={student.contactEmail}>
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {student.facebookUrl && (
                        <a href={student.facebookUrl.startsWith('http') ? student.facebookUrl : `https://${student.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl text-xs font-semibold transition-all border border-blue-500/20" title="Facebook Profile">
                          <Link className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
