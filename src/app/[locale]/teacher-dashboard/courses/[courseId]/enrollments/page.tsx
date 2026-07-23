"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { Search, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

type Enrollment = {
  id: string;
  studentName: string;
  senderNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  courseId: string;
};

export default function CourseEnrollmentsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      const fetched: Enrollment[] = [];
      querySnapshot.forEach((document) => {
        fetched.push({ id: document.id, ...document.data() } as Enrollment);
      });
      
      // Sort by date descending
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      
      setEnrollments(fetched);
    } catch (error) {
      console.error("Error fetching enrollments", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchEnrollments();
  }, [courseId]);

  const handleApprove = async (enrollmentId: string) => {
    try {
      const docRef = doc(db, 'enrollments', enrollmentId);
      await updateDoc(docRef, {
        status: 'approved',
        updatedAt: Timestamp.now()
      });
      // Refresh list
      fetchEnrollments();
    } catch (error) {
      console.error("Error approving enrollment", error);
      alert("Failed to approve enrollment.");
    }
  };

  const handleReject = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      const docRef = doc(db, 'enrollments', enrollmentId);
      await updateDoc(docRef, {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });
      // Refresh list
      fetchEnrollments();
    } catch (error) {
      console.error("Error rejecting enrollment", error);
    }
  };

  // Filter logic
  const filteredEnrollments = enrollments
    .filter(enc => enc.status === activeTab)
    .filter(enc => {
      const term = searchTerm.toLowerCase();
      return (
        enc.senderNumber?.toLowerCase().includes(term) ||
        enc.trxId?.toLowerCase().includes(term) ||
        enc.studentName?.toLowerCase().includes(term)
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Course Enrollments</h1>
          <p className="text-gray-300 text-sm font-medium">Manage student payment verifications for this course.</p>
        </div>
      </div>

      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        
        {/* Tabs & Search */}
        <div className="p-4 border-b border-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background/50">
          <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Pending Requests
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {enrollments.filter(e => e.status === 'pending').length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'approved' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Approved
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search TrxID or Number..." 
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
              Loading requests...
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center text-foreground/50 flex flex-col items-center">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p>No {activeTab} enrollments found.</p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/10">
              {filteredEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-foreground/[0.02] transition-colors">
                  
                  {/* Left Metadata - Compact Layout */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
                      <p className="font-bold text-sm sm:text-base text-foreground">
                        {enrollment.studentName || 'Student'}
                      </p>
                      {activeTab === 'approved' && (
                        <span className="sm:hidden flex items-center gap-1 text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-foreground/70 flex-wrap">
                      <span><span className="text-foreground/40 font-medium">Number:</span> <strong className="text-primary font-semibold">{enrollment.senderNumber}</strong></span>
                      <span className="border-l border-foreground/10 pl-4"><span className="text-foreground/40 font-medium">TrxID:</span> <code className="font-mono bg-foreground/10 px-1.5 py-0.5 rounded text-[11px] font-bold">{enrollment.trxId || 'N/A'}</code></span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 sm:border-l sm:border-foreground/10 sm:pl-4">
                    {activeTab === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleReject(enrollment.id)}
                          className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(enrollment.id)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 shadow rounded-lg transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      </>
                    ) : (
                      <span className="hidden sm:flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </span>
                    )}
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
