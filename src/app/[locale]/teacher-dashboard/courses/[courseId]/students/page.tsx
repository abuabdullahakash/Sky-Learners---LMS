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
      <div>
        <h2 className="text-2xl font-bold">Enrolled Students</h2>
        <p className="text-foreground/60 text-sm">View details and contact information of approved students.</p>
      </div>

      {/* Overview Stats */}
      {students.length > 0 && totalCourseLessons > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-primary">Batch Performance</h3>
            <p className="text-sm text-foreground/60">Average course completion across all students.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {Math.round((Object.values(studentProgress).reduce((a, b) => a + b, 0) / (students.length * totalCourseLessons)) * 100) || 0}%
              </p>
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Avg Progress</p>
            </div>
            <div className="text-right pl-4 border-l border-foreground/10">
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {Object.keys(studentProgress).length}
              </p>
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Active Students</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background/50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg font-bold text-sm">
            <Users className="w-4 h-4" /> Total: {students.length}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search by name, phone, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-background border border-foreground/20 rounded-xl p-1 shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-foreground/40 hover:text-foreground/80'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-foreground/40 hover:text-foreground/80'}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
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
              <p>No students found.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" : "flex flex-col gap-3 p-4"}>
              {filteredStudents.map((student) => (
                <div key={student.id} className={`bg-background border border-foreground/10 rounded-2xl hover:shadow-lg transition-shadow relative group ${viewMode === 'grid' ? 'p-5 flex flex-col' : 'p-4 flex flex-col md:flex-row md:items-center gap-6'}`}>
                  
                  {/* User Profile Info & Progress */}
                  <div className={`flex flex-col gap-3 ${viewMode === 'grid' ? 'mb-4 pb-4 border-b border-foreground/10' : 'md:w-1/3 shrink-0'}`}>
                    <div className="flex items-center gap-4">
                      {student.profileImageUrl ? (
                        <img src={student.profileImageUrl} alt={student.studentName} className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-14 h-14'} rounded-full object-cover border-2 border-primary/20 shrink-0`} />
                      ) : (
                        <div className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-14 h-14'} rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 border border-foreground/10 shrink-0`}>
                          <UserCircle className={`${viewMode === 'grid' ? 'w-8 h-8' : 'w-9 h-9'}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{student.studentName}</h3>
                        <p className="text-xs text-foreground/50 mt-1">Enrolled: {new Date(student.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {totalCourseLessons > 0 && (
                      <div className="w-full mt-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                          <span>Progress</span>
                          <span>{Math.round(((studentProgress[student.studentId] || 0) / totalCourseLessons) * 100)}%</span>
                        </div>
                        <div className="w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((studentProgress[student.studentId] || 0) / totalCourseLessons) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className={`text-sm flex-1 ${viewMode === 'grid' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
                    {student.offlinePhone ? (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">Phone</p>
                          <a href={`tel:${student.offlinePhone}`} className="font-semibold hover:text-primary transition-colors">{student.offlinePhone}</a>
                        </div>
                      </div>
                    ) : <div className={viewMode === 'list' ? 'hidden lg:block opacity-0' : 'hidden'}></div>}

                    {student.whatsappNumber ? (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">WhatsApp</p>
                          <a href={`https://wa.me/${student.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-500 hover:underline">{student.whatsappNumber}</a>
                        </div>
                      </div>
                    ) : <div className={viewMode === 'list' ? 'hidden lg:block opacity-0' : 'hidden'}></div>}

                    {student.contactEmail ? (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground/50">Email</p>
                          <a href={`mailto:${student.contactEmail}`} className="font-medium text-foreground/80 hover:text-primary transition-colors truncate block">{student.contactEmail}</a>
                        </div>
                      </div>
                    ) : <div className={viewMode === 'list' ? 'hidden lg:block opacity-0' : 'hidden'}></div>}

                    {student.facebookUrl ? (
                      <div className="flex items-start gap-2">
                        <Link className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground/50">Facebook</p>
                          <a href={student.facebookUrl.startsWith('http') ? student.facebookUrl : `https://${student.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block">{student.facebookUrl}</a>
                        </div>
                      </div>
                    ) : <div className={viewMode === 'list' ? 'hidden lg:block opacity-0' : 'hidden'}></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
