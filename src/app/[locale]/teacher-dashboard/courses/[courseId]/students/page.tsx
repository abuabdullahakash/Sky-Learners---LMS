"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, Users, Phone, Link, Mail, UserCircle } from 'lucide-react';

type Student = {
  id: string;
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

      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background/50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg font-bold text-sm">
            <Users className="w-4 h-4" /> Total: {students.length}
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="bg-background border border-foreground/10 p-5 rounded-2xl hover:shadow-lg transition-shadow relative group flex flex-col">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-foreground/10">
                    {student.profileImageUrl ? (
                      <img src={student.profileImageUrl} alt={student.studentName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 border border-foreground/10">
                        <UserCircle className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">{student.studentName}</h3>
                      <p className="text-xs text-foreground/50 mt-1">Enrolled: {new Date(student.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm flex-1">
                    {student.offlinePhone ? (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">Phone</p>
                          <a href={`tel:${student.offlinePhone}`} className="font-semibold hover:text-primary transition-colors">{student.offlinePhone}</a>
                        </div>
                      </div>
                    ) : null}

                    {student.whatsappNumber ? (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">WhatsApp</p>
                          <a href={`https://wa.me/${student.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-500 hover:underline">{student.whatsappNumber}</a>
                        </div>
                      </div>
                    ) : null}

                    {student.contactEmail ? (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">Email</p>
                          <a href={`mailto:${student.contactEmail}`} className="font-medium text-foreground/80 hover:text-primary transition-colors truncate block max-w-[200px]">{student.contactEmail}</a>
                        </div>
                      </div>
                    ) : null}

                    {student.facebookUrl ? (
                      <div className="flex items-start gap-2">
                        <Link className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-foreground/50">Facebook</p>
                          <a href={student.facebookUrl.startsWith('http') ? student.facebookUrl : `https://${student.facebookUrl}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block max-w-[200px]">{student.facebookUrl}</a>
                        </div>
                      </div>
                    ) : null}
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
