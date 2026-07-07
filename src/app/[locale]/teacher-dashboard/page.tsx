"use client";

import { useAuth } from '@/context/AuthContext';
import { Users, Video, DollarSign, Star, PlusCircle, CheckCircle2, Clock, Loader2, UserCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';

export default function TeacherDashboard() {
  const { user, userData } = useAuth();
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'recent'>('pending');

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      
      // Fetch Pending Requests
      const pendingQuery = query(
        enrollmentsRef,
        where('teacherId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const pendingSnap = await getDocs(pendingQuery);
      const pending: any[] = [];
      pendingSnap.forEach(doc => {
        pending.push({ id: doc.id, ...doc.data() });
      });
      setPendingRequests(pending);

      // Fetch Recent Approved Enrollments
      const recentQuery = query(
        enrollmentsRef,
        where('teacherId', '==', user.uid),
        where('status', '==', 'approved')
      );
      const recentSnap = await getDocs(recentQuery);
      const recent: any[] = [];
      recentSnap.forEach(doc => {
        recent.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort in memory by updatedAt descending and limit to 5
      recent.sort((a, b) => {
        const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
        const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setRecentEnrollments(recent.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleApprove = async (enrollmentId: string) => {
    try {
      const docRef = doc(db, 'enrollments', enrollmentId);
      await updateDoc(docRef, {
        status: 'approved',
        updatedAt: Timestamp.now()
      });
      fetchDashboardData(); // refresh both tabs
    } catch (error) {
      console.error("Error approving enrollment", error);
    }
  };

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Courses', value: '12', icon: Video, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Total Earnings', value: '$4,560', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Average Rating', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-foreground/5 p-8 rounded-3xl border border-foreground/10 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || userData?.name || 'Teacher'}! 👋</h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Here&apos;s what&apos;s happening with your courses today. You have <span className="font-semibold text-orange-500">{pendingRequests.length}</span> pending payment verification requests.
          </p>
        </div>
        
        <Link 
          href="/teacher-dashboard/courses/create" 
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Course
        </Link>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-foreground/5 p-6 rounded-3xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-foreground/60 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollments Activity Widget */}
      <div className="bg-foreground/5 rounded-3xl border border-foreground/10 overflow-hidden">
        
        <div className="p-4 border-b border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'recent' ? 'bg-background shadow text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Recent Enrollments
            </button>
          </div>
          <Link href="/teacher-dashboard/students" className="text-sm text-primary hover:underline font-medium">View All Students</Link>
        </div>
        
        <div className="divide-y divide-foreground/5 min-h-[200px]">
          {isLoadingRequests ? (
             <div className="p-12 flex justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : activeTab === 'pending' ? (
            pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-foreground/50">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No pending enrollment requests right now.</p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{req.studentName}</h4>
                    <p className="text-sm text-foreground/50 mb-1">Requested enrollment for <span className="font-medium text-foreground/70">{req.courseTitle}</span></p>
                    <div className="flex gap-4 text-xs font-medium text-foreground/60">
                      <span>Sender: <span className="text-foreground">{req.senderNumber}</span></span>
                      <span>TrxID: <span className="text-foreground font-mono">{req.trxId}</span></span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            recentEnrollments.length === 0 ? (
              <div className="p-12 text-center text-foreground/50">
                <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No recent enrollments found.</p>
              </div>
            ) : (
              recentEnrollments.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold">
                    {req.studentName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{req.studentName}</h4>
                    <p className="text-sm text-foreground/50">Successfully enrolled in <span className="font-medium text-foreground/70">&quot;{req.courseTitle}&quot;</span></p>
                  </div>
                  <div className="text-sm text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Approved
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

    </div>
  );
}
