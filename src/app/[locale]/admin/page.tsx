"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Ban, 
  CheckCircle, 
  Trash2, 
  UserCheck, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  Video, 
  BookMarked, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  Layers, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  X,
  Plus
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserItem {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
  phone?: string;
  photoURL?: string;
  profilePhoto?: string;
  photoUrl?: string;
  isBlocked?: boolean;
  onboardingComplete?: boolean;
  institution?: string;
  eduLevel?: string;
  class?: string;
  department?: string;
  subject?: string;
  experience?: string;
  createdAt?: any;
  [key: string]: any;
}

interface CourseItem {
  id: string;
  title: string;
  teacherId?: string;
  teacherName?: string;
  thumbnail?: string;
  price?: number;
  category?: string;
  isPublished?: boolean;
  studentsCount?: number;
  modules?: any[];
  [key: string]: any;
}

interface TeacherProfileItem {
  id: string;
  displayName?: string;
  profilePhoto?: string;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  subject?: string;
  experiences?: any[];
  customLinks?: any[];
  [key: string]: any;
}

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teachers' | 'courses'>('overview');

  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, TeacherProfileItem>>({});
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'blocked'>('all');
  
  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  // Selected Teacher for Deep Dive Modal
  const [selectedTeacher, setSelectedTeacher] = useState<UserItem | null>(null);

  // Confirmation Modals
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<CourseItem | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Fetch all database metrics
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList: UserItem[] = [];
      usersSnap.forEach((docSnap) => {
        usersList.push({ id: docSnap.id, ...docSnap.data() } as UserItem);
      });
      setUsers(usersList);

      // 2. Fetch Courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesList: CourseItem[] = [];
      coursesSnap.forEach((docSnap) => {
        coursesList.push({ id: docSnap.id, ...docSnap.data() } as CourseItem);
      });
      setCourses(coursesList);

      // 3. Fetch Teacher Profiles
      const tpSnap = await getDocs(collection(db, 'teacherProfiles'));
      const tpMap: Record<string, TeacherProfileItem> = {};
      tpSnap.forEach((docSnap) => {
        tpMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as TeacherProfileItem;
      });
      setTeacherProfiles(tpMap);

      // 4. Fetch Enrollments count
      try {
        const enrollSnap = await getDocs(collection(db, 'enrollments'));
        setEnrollmentsCount(enrollSnap.size);
      } catch (err) {
        console.error("Error fetching enrollments count:", err);
      }

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute Metrics
  const totalUsersCount = users.length;
  const teachersList = users.filter(u => u.role === 'teacher' || u.email?.toLowerCase().includes('abuabdullahakash'));
  const studentsList = users.filter(u => u.role === 'student' || (!u.role && u.onboardingComplete));
  const blockedUsersList = users.filter(u => u.isBlocked === true);
  
  const totalCoursesCount = courses.length;
  const publishedCoursesCount = courses.filter(c => c.isPublished !== false).length;
  const totalEstimatedRevenue = courses.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.studentsCount || 0)), 0);

  // Filtered Users List
  const filteredUsers = users.filter(user => {
    const name = (user.name || user.displayName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();
    const searchMatch = name.includes(userSearch.toLowerCase()) || 
                        email.includes(userSearch.toLowerCase()) || 
                        phone.includes(userSearch.toLowerCase());

    if (!searchMatch) return false;

    if (roleFilter === 'student') return user.role === 'student' || (!user.role && user.onboardingComplete);
    if (roleFilter === 'teacher') return user.role === 'teacher';
    if (roleFilter === 'blocked') return user.isBlocked === true;
    return true;
  });

  // User Actions
  const handleToggleBlockUser = async (targetUser: UserItem) => {
    setActionProcessing(true);
    try {
      const newStatus = !targetUser.isBlocked;
      await updateDoc(doc(db, 'users', targetUser.id), { isBlocked: newStatus });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isBlocked: newStatus } : u));
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(prev => prev ? { ...prev, isBlocked: newStatus } : null);
      }
    } catch (err) {
      console.error("Error toggling user block:", err);
      alert("Failed to update user block status.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleChangeUserRole = async (targetUser: UserItem, newRole: 'student' | 'teacher') => {
    setActionProcessing(true);
    try {
      await updateDoc(doc(db, 'users', targetUser.id), { role: newRole, onboardingComplete: true });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole, onboardingComplete: true } : u));
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole, onboardingComplete: true } : null);
      }
    } catch (err) {
      console.error("Error changing user role:", err);
      alert("Failed to change user role.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setActionProcessing(true);
    try {
      await deleteDoc(doc(db, 'users', deleteConfirmUser.id));
      setUsers(prev => prev.filter(u => u.id !== deleteConfirmUser.id));
      setDeleteConfirmUser(null);
      if (selectedUser?.id === deleteConfirmUser.id) setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user document.");
    } finally {
      setActionProcessing(false);
    }
  };

  // Course Actions
  const handleToggleCoursePublish = async (targetCourse: CourseItem) => {
    setActionProcessing(true);
    try {
      const newStatus = targetCourse.isPublished === false ? true : false;
      await updateDoc(doc(db, 'courses', targetCourse.id), { isPublished: newStatus });
      setCourses(prev => prev.map(c => c.id === targetCourse.id ? { ...c, isPublished: newStatus } : c));
    } catch (err) {
      console.error("Error updating course publish status:", err);
      alert("Failed to update course status.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteConfirmCourse) return;
    setActionProcessing(true);
    try {
      await deleteDoc(doc(db, 'courses', deleteConfirmCourse.id));
      setCourses(prev => prev.filter(c => c.id !== deleteConfirmCourse.id));
      setDeleteConfirmCourse(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Database'}
        </button>
      </div>

      {/* Primary Analytics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Users */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalUsers')}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalUsersCount}</p>
          <div className="mt-2 text-[10px] text-purple-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span> Live in Firestore
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalStudents')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{studentsList.length}</p>
          <div className="mt-2 text-[10px] text-blue-400 font-medium">
            Active Learners
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalTeachers')}</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{teachersList.length}</p>
          <div className="mt-2 text-[10px] text-orange-400 font-medium">
            Verified Instructors
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalCourses')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalCoursesCount}</p>
          <div className="mt-2 text-[10px] text-amber-400 font-medium">
            {publishedCoursesCount} Published
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalEnrollments')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{enrollmentsCount}</p>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium">
            Course Accesses
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('totalRevenue')}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">৳{totalEstimatedRevenue.toLocaleString()}</p>
          <div className="mt-2 text-[10px] text-rose-400 font-medium">
            Est. Total Value
          </div>
        </div>

      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> {t('tabs.overview')}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> {t('tabs.users')} ({totalUsersCount})
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> {t('tabs.teachers')} ({teachersList.length})
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> {t('tabs.courses')} ({totalCoursesCount})
        </button>
      </div>

      {/* Tab 1: Overview Quick Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Users List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Recent Registrations
              </h2>
              <button onClick={() => setActiveTab('users')} className="text-xs text-purple-400 hover:underline">
                View All →
              </button>
            </div>
            <div className="divide-y divide-slate-800/60">
              {users.slice(0, 6).map((u) => {
                const avatar = u.profilePhoto || u.photoURL || u.photoUrl;
                const isT = u.role === 'teacher' || u.email?.toLowerCase().includes('abuabdullahakash');
                return (
                  <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-300 text-xs overflow-hidden shrink-0">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.name || u.displayName || u.email || 'U')[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{u.name || u.displayName || 'No Name'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isT ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {isT ? 'Teacher' : 'Student'}
                      </span>
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Courses List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Platform Courses
              </h2>
              <button onClick={() => setActiveTab('courses')} className="text-xs text-amber-400 hover:underline">
                View All →
              </button>
            </div>
            <div className="divide-y divide-slate-800/60">
              {courses.slice(0, 6).map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-8 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">Course</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        By {c.teacherName || 'Instructor'} • ৳{c.price || 'Free'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    c.isPublished !== false ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {c.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Full User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('usersTab.searchPlaceholder')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {userSearch && (
                <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  roleFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('usersTab.filterAll')} ({totalUsersCount})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  roleFilter === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('usersTab.filterStudents')} ({studentsList.length})
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  roleFilter === 'teacher' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('usersTab.filterTeachers')} ({teachersList.length})
              </button>
              <button
                onClick={() => setRoleFilter('blocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  roleFilter === 'blocked' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('usersTab.filterBlocked')} ({blockedUsersList.length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 border-b border-slate-700/60 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">{t('usersTab.colName')}</th>
                    <th className="py-3.5 px-4">{t('usersTab.colRole')}</th>
                    <th className="py-3.5 px-4">{t('usersTab.colContact')}</th>
                    <th className="py-3.5 px-4">{t('usersTab.colStatus')}</th>
                    <th className="py-3.5 px-4 text-right">{t('usersTab.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const avatar = u.profilePhoto || u.photoURL || u.photoUrl;
                      const isT = u.role === 'teacher' || u.email?.toLowerCase().includes('abuabdullahakash');
                      const isOwnerAcc = u.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          
                          {/* User Avatar & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-300 text-xs overflow-hidden shrink-0 ring-1 ring-slate-700">
                                {avatar ? (
                                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  (u.name || u.displayName || u.email || 'U')[0].toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0 max-w-[180px] sm:max-w-xs">
                                <p className="font-bold text-white truncate flex items-center gap-1.5">
                                  {u.name || u.displayName || 'No Name Set'}
                                  {isOwnerAcc && (
                                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-black">Owner</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isT ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            }`}>
                              {isT ? 'Teacher' : 'Student'}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4">
                            <div className="text-[11px] text-slate-300">
                              <p className="truncate max-w-[140px]">{u.phone || 'No phone'}</p>
                              <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{u.institution || u.subject || '—'}</p>
                            </div>
                          </td>

                          {/* Status (Active / Blocked) */}
                          <td className="py-3 px-4">
                            {u.isBlocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <Ban className="w-3 h-3" /> {t('usersTab.blocked')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" /> {t('usersTab.active')}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedUser(u)}
                                title="View Details"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Block/Unblock (Cannot block platform owner) */}
                              {!isOwnerAcc && (
                                <button
                                  onClick={() => handleToggleBlockUser(u)}
                                  disabled={actionProcessing}
                                  title={u.isBlocked ? t('usersTab.unblock') : t('usersTab.block')}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    u.isBlocked 
                                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                                      : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                  }`}
                                >
                                  {u.isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Role Switch */}
                              {!isOwnerAcc && (
                                <button
                                  onClick={() => handleChangeUserRole(u, isT ? 'student' : 'teacher')}
                                  disabled={actionProcessing}
                                  title={isT ? t('usersTab.makeStudent') : t('usersTab.makeTeacher')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-purple-400 transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User */}
                              {!isOwnerAcc && (
                                <button
                                  onClick={() => setDeleteConfirmUser(u)}
                                  disabled={actionProcessing}
                                  title={t('usersTab.delete')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Teachers Deep Dive */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachersList.map((teacher) => {
              const tp = teacherProfiles[teacher.id] || {};
              const teacherCourses = courses.filter(c => c.teacherId === teacher.id || (!c.teacherId && teacher.email?.toLowerCase().includes('abuabdullahakash')));
              const totalTeacherStudents = teacherCourses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
              const avatar = teacher.profilePhoto || teacher.photoURL || tp.profilePhoto || tp.photoUrl;

              return (
                <div key={teacher.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-orange-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-400 text-sm overflow-hidden shrink-0">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (teacher.name || teacher.displayName || 'T')[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate text-sm">{teacher.name || teacher.displayName || tp.displayName || 'Instructor'}</p>
                        <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
                        <p className="text-[11px] text-orange-400 font-medium truncate mt-0.5">{tp.headline || teacher.subject || 'Academic Instructor'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800">
                      <div className="bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Courses Created</p>
                        <p className="text-lg font-black text-white">{teacherCourses.length}</p>
                      </div>
                      <div className="bg-slate-800/50 p-2.5 rounded-xl text-center">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Total Students</p>
                        <p className="text-lg font-black text-white">{totalTeacherStudents}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="w-full py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" /> View Courses & Resources
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: All Courses Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">
                
                {/* Course Thumbnail */}
                <div className="h-40 bg-slate-800 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-semibold">
                      No Thumbnail
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md ${
                    course.isPublished !== false ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {course.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Course Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Instructor: {course.teacherName || 'Not Set'}</p>
                    <div className="flex items-center justify-between text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                      <span>Price: <strong className="text-white">৳{course.price || 'Free'}</strong></span>
                      <span>Enrolled: <strong className="text-white">{course.studentsCount || 0}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3">
                    <button
                      onClick={() => handleToggleCoursePublish(course)}
                      disabled={actionProcessing}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        course.isPublished !== false 
                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {course.isPublished !== false ? 'Set Draft' : 'Publish'}
                    </button>

                    <button
                      onClick={() => setDeleteConfirmCourse(course)}
                      disabled={actionProcessing}
                      className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Details Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-300 text-base overflow-hidden ring-2 ring-purple-500/40">
                  {(selectedUser.profilePhoto || selectedUser.photoURL || selectedUser.photoUrl) ? (
                    <img src={selectedUser.profilePhoto || selectedUser.photoURL || selectedUser.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedUser.name || selectedUser.displayName || 'U')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{selectedUser.name || selectedUser.displayName || 'User Profile'}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Meta Data */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Role</span>
                <span className="font-bold text-white uppercase">{selectedUser.role || 'Student'}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Status</span>
                <span className={selectedUser.isBlocked ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedUser.isBlocked ? 'Suspended / Blocked' : 'Active'}
                </span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                <span className="font-medium text-white">{selectedUser.phone || 'Not provided'}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Education / Level</span>
                <span className="font-medium text-white">{selectedUser.eduLevel || selectedUser.class || 'Not specified'}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Institution</span>
                <span className="font-medium text-white">{selectedUser.institution || selectedUser.schoolName || selectedUser.collegeName || 'Not specified'}</span>
              </div>
              {selectedUser.department && (
                <div className="bg-slate-800/60 p-3 rounded-xl col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Department / Group</span>
                  <span className="font-medium text-white">{selectedUser.department}</span>
                </div>
              )}
            </div>

            {/* Quick Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleToggleBlockUser(selectedUser)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  selectedUser.isBlocked 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Teacher Deep Dive Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 text-base overflow-hidden">
                  {(selectedTeacher.profilePhoto || selectedTeacher.photoURL || selectedTeacher.photoUrl) ? (
                    <img src={selectedTeacher.profilePhoto || selectedTeacher.photoURL || selectedTeacher.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedTeacher.name || selectedTeacher.displayName || 'T')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{selectedTeacher.name || selectedTeacher.displayName || 'Instructor'}</h3>
                  <p className="text-xs text-slate-400">{selectedTeacher.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTeacher(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Teacher Courses List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-400" /> Courses Created by this Teacher
              </h4>
              
              {courses.filter(c => c.teacherId === selectedTeacher.id || (!c.teacherId && selectedTeacher.email?.toLowerCase().includes('abuabdullahakash'))).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No courses created yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.filter(c => c.teacherId === selectedTeacher.id || (!c.teacherId && selectedTeacher.email?.toLowerCase().includes('abuabdullahakash'))).map(c => (
                    <div key={c.id} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-slate-700 overflow-hidden shrink-0">
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">Course</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{c.title}</p>
                          <p className="text-[10px] text-slate-400">৳{c.price || 'Free'} • {c.studentsCount || 0} Students</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-700/60">
                        <span>Modules: {c.modules?.length || 0}</span>
                        <span className={c.isPublished !== false ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {c.isPublished !== false ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-white">Confirm User Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-white">{deleteConfirmUser.name || deleteConfirmUser.email}</strong>?
              This will remove their account record from the database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {deleteConfirmCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-white">Confirm Course Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete course <strong className="text-white">{deleteConfirmCourse.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCourse(null)}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
