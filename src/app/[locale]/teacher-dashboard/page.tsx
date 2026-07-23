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
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalEarnings: 0,
    averageRating: 4.8
  });

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      
      // Fetch All Enrollments to calculate stats & separate pending/recent
      const allEnrollmentsQuery = query(
        enrollmentsRef,
        where('teacherId', '==', user.uid)
      );
      const allSnap = await getDocs(allEnrollmentsQuery);
      
      const pending: any[] = [];
      const recent: any[] = [];
      let totalEarnings = 0;
      let totalStudents = 0;

      allSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending') {
          pending.push({ id: doc.id, ...data });
        } else if (data.status === 'approved' || data.status === 'completed') {
          recent.push({ id: doc.id, ...data });
          totalEarnings += Number(data.amount) || 0;
          totalStudents += 1;
        }
      });
      
      setPendingRequests(pending);

      // Sort in memory by updatedAt descending and limit to 5
      recent.sort((a, b) => {
        const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
        const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setRecentEnrollments(recent.slice(0, 5));

      // Fetch Active Courses
      const coursesRef = collection(db, 'courses');
      const activeCoursesQuery = query(
        coursesRef,
        where('teacherId', '==', user.uid),
        where('isPublished', '==', true)
      );
      const activeCoursesSnap = await getDocs(activeCoursesQuery);
      
      setDashboardStats({
        totalStudents,
        activeCourses: activeCoursesSnap.size,
        totalEarnings,
        averageRating: 4.8
      });

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
    { title: 'Total Students', value: dashboardStats.totalStudents.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Courses', value: dashboardStats.activeCourses.toString(), icon: Video, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Total Earnings', value: `৳${dashboardStats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Average Rating', value: dashboardStats.averageRating.toString(), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Welcome Section (Border Radius 0px / rounded-none for flush edge-to-edge) */}
      <div className="relative overflow-hidden rounded-none p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border-b border-white/10 -mx-4 -mt-4 mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
              Teacher Dashboard
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              Welcome back, {user?.displayName || userData?.name || 'Teacher'}! 👋
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Here&apos;s what&apos;s happening with your courses today. You have <span className="font-extrabold text-orange-400">{pendingRequests.length}</span> pending payment verification requests.
            </p>
          </div>
          
          <Link 
            href="/teacher-dashboard/courses/create" 
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid - 2 Columns on Mobile (grid-cols-2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-foreground/5 p-3.5 sm:p-6 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-foreground/60 text-xs sm:text-sm font-medium mb-0.5 truncate">{stat.title}</h3>
                <p className="text-xl sm:text-3xl font-extrabold text-foreground">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollments Activity Widget */}
      <div className="bg-foreground/5 rounded-2xl border border-foreground/10 overflow-hidden">
        
        <div className="p-3.5 sm:p-4 border-b border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-background/50">
          {/* Tabs with Orange Active Color */}
          <div className="flex gap-1.5 p-1 bg-foreground/5 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pending' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <span className="bg-white text-orange-600 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">{pendingRequests.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                activeTab === 'recent' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <span>Recent Enrollments</span>
            </button>
          </div>
          <Link href="/teacher-dashboard/students" className="text-xs sm:text-sm text-orange-500 hover:underline font-bold self-end sm:self-center">View All Students →</Link>
        </div>
        
        {/* Compact List Rendering */}
        <div className="divide-y divide-foreground/5 min-h-[160px]">
          {isLoadingRequests ? (
             <div className="p-10 flex justify-center text-orange-500"><Loader2 className="w-7 h-7 animate-spin" /></div>
          ) : activeTab === 'pending' ? (
            pendingRequests.length === 0 ? (
              <div className="p-10 text-center text-foreground/50">
                <Clock className="w-9 h-9 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No pending enrollment requests right now.</p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{req.studentName}</h4>
                      <p className="text-xs text-foreground/60 truncate">Requested for <span className="font-semibold text-foreground/80">{req.courseTitle}</span></p>
                      <div className="flex gap-3 text-[11px] font-medium text-foreground/60 mt-0.5">
                        <span>Sender: <strong className="text-primary font-semibold">{req.senderNumber}</strong></span>
                        <span>TrxID: <code className="font-mono bg-foreground/10 px-1 py-0.2 rounded font-bold">{req.trxId}</code></span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    <button 
                      onClick={() => handleApprove(req.id)}
                      className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow transition-all flex items-center gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            recentEnrollments.length === 0 ? (
              <div className="p-10 text-center text-foreground/50">
                <UserCheck className="w-9 h-9 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent enrollments found.</p>
              </div>
            ) : (
              recentEnrollments.map((req) => (
                <div key={req.id} className="p-3.5 sm:p-5 flex items-center justify-between gap-3 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-extrabold text-sm sm:text-base border border-blue-500/20">
                      {req.studentName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{req.studentName}</h4>
                      <p className="text-xs text-foreground/60 truncate">Enrolled in <span className="font-semibold text-foreground/80">&quot;{req.courseTitle}&quot;</span></p>
                    </div>
                  </div>
                  <div className="text-[11px] sm:text-xs text-green-500 font-bold bg-green-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
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
