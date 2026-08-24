"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
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
  CheckCircle2,
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
  Plus,
  Globe,
  SlidersHorizontal,
  Copy,
  Check,
  FileText,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  ArrowLeft,
  MapPin,
  Clock,
  Compass
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
  preferredTeacherId?: string;
  referralTeacherId?: string;
  referredByTeacherId?: string;
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

interface CustomNavItem {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  createdAt?: string;
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
  disabledPages?: string[];
  customNavLinks?: CustomNavItem[];
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  contactAddress?: string;
  [key: string]: any;
}

interface GlobalPageItem {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  isDefault?: boolean;
  excludedTeacherIds?: string[];
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');

  // Default Global Base Pages
  const defaultGlobalBasePages: GlobalPageItem[] = [
    { id: 'home', name: 'Home', nameBn: 'হোম', slug: '/', isDefault: true },
    { id: 'courses', name: 'Courses', nameBn: 'কোর্স', slug: '/courses', isDefault: true },
    { id: 'about', name: 'About', nameBn: 'পরিচিতি', slug: '/about', isDefault: true },
    { id: 'contact', name: 'Contact', nameBn: 'যোগাযোগ', slug: '/contact', isDefault: true },
  ];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teachers' | 'courses'>('overview');

  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, TeacherProfileItem>>({});
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);

  // Global Page Management States
  const [globalPages, setGlobalPages] = useState<GlobalPageItem[]>(defaultGlobalBasePages);
  const [isAddGlobalModalOpen, setIsAddGlobalModalOpen] = useState(false);
  const [isExcludeGlobalModalOpen, setIsExcludeGlobalModalOpen] = useState(false);
  const [selectedGlobalPageForExclusion, setSelectedGlobalPageForExclusion] = useState<GlobalPageItem | null>(null);
  const [newGlobalPageName, setNewGlobalPageName] = useState('');
  const [newGlobalPageSlug, setNewGlobalPageSlug] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Selected Teacher Modal & Split View States
  const [selectedTeacher, setSelectedTeacher] = useState<UserItem | null>(null);
  const [selectedTeacherTab, setSelectedTeacherTab] = useState<'overview' | 'courses' | 'pages'>('overview');
  const [newTeacherPageName, setNewTeacherPageName] = useState('');
  const [newTeacherPageSlug, setNewTeacherPageSlug] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [pageSaving, setPageSaving] = useState(false);

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'blocked'>('all');
  
  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Confirmation Modals
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);
  const [deleteMode, setDeleteMode] = useState<'both' | 'database_only' | 'auth_block'>('both');
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

      // 5. Fetch Global Teacher Pages config
      try {
        const gpDoc = await getDoc(doc(db, 'platformSettings', 'globalTeacherPages'));
        if (gpDoc.exists()) {
          const gpData = gpDoc.data();
          if (gpData.pages && Array.isArray(gpData.pages)) {
            // merge with default base pages ensuring defaults always exist
            const fetchedPages: GlobalPageItem[] = gpData.pages;
            const merged = [...defaultGlobalBasePages];
            fetchedPages.forEach(fp => {
              const idx = merged.findIndex(m => m.id === fp.id);
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...fp };
              } else {
                merged.push(fp);
              }
            });
            setGlobalPages(merged);
          }
        }
      } catch (err) {
        console.error("Error fetching global pages:", err);
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
      const uid = deleteConfirmUser.id;

      if (deleteMode === 'auth_block') {
        // Mode 3: Revoke Access / Block Login
        await updateDoc(doc(db, 'users', uid), { isBlocked: true });
        setUsers(prev => prev.map(u => u.id === uid ? { ...u, isBlocked: true } : u));
      } else {
        // Mode 1 ('both') & Mode 2 ('database_only'): Delete from Firestore
        await deleteDoc(doc(db, 'users', uid));
        await deleteDoc(doc(db, 'teacherProfiles', uid)).catch(() => {});
        
        if (deleteMode === 'both') {
          // Attempt to also clean related records
          try {
            const enrollQ = query(collection(db, 'enrollments'), where('studentId', '==', uid));
            const enrollSnap = await getDocs(enrollQ);
            enrollSnap.forEach(d => deleteDoc(d.ref).catch(() => {}));
          } catch (e) {}
        }
        
        setUsers(prev => prev.filter(u => u.id !== uid));
      }

      setDeleteConfirmUser(null);
      if (selectedUser?.id === deleteConfirmUser.id) setSelectedUser(null);
    } catch (err) {
      console.error("Error processing user deletion/action:", err);
      alert("Failed to process user action.");
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

  // Global & Teacher Page Handlers
  const handleAddGlobalPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGlobalPageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    let cleanSlug = (newGlobalPageSlug.trim() || newGlobalPageName.trim()).toLowerCase();
    if (!cleanSlug.startsWith('/')) cleanSlug = `/${cleanSlug}`;
    cleanSlug = cleanSlug.replace(/[^a-z0-9\-_/]/g, '-');

    if (globalPages.some(p => p.slug === cleanSlug)) {
      toast.error('এই স্লাগের একটি গ্লোবাল পেজ ইতিমধ্যে রয়েছে!');
      return;
    }

    setPageSaving(true);
    const newPage: GlobalPageItem = {
      id: 'gp_' + Date.now(),
      name: newGlobalPageName.trim(),
      slug: cleanSlug,
      isDefault: false,
      excludedTeacherIds: [],
      createdAt: new Date().toISOString()
    };

    const updated = [...globalPages, newPage];
    setGlobalPages(updated);
    try {
      await setDoc(doc(db, 'platformSettings', 'globalTeacherPages'), { pages: updated }, { merge: true });
      toast.success('নতুন গ্লোবাল পেজ সফলভাবে যুক্ত হয়েছে!');
      setIsAddGlobalModalOpen(false);
      setNewGlobalPageName('');
      setNewGlobalPageSlug('');
    } catch (err) {
      console.error("Error saving global page:", err);
      toast.error('গ্লোবাল পেজ সেভ করতে সমস্যা হয়েছে');
    } finally {
      setPageSaving(false);
    }
  };

  const handleToggleExcludeTeacher = async (pageId: string, teacherId: string) => {
    const updated = globalPages.map(gp => {
      if (gp.id === pageId) {
        const currentExcluded = gp.excludedTeacherIds || [];
        const exists = currentExcluded.includes(teacherId);
        const nextExcluded = exists 
          ? currentExcluded.filter(id => id !== teacherId) 
          : [...currentExcluded, teacherId];
        return { ...gp, excludedTeacherIds: nextExcluded };
      }
      return gp;
    });

    setGlobalPages(updated);
    try {
      await setDoc(doc(db, 'platformSettings', 'globalTeacherPages'), { pages: updated }, { merge: true });
      toast.success('টিচার এক্সক্লুশন আপডেট হয়েছে!');
    } catch (err) {
      console.error("Error updating exclusion:", err);
      toast.error('এক্সক্লুশন আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteGlobalPage = async (pageId: string) => {
    const updated = globalPages.filter(p => p.id !== pageId);
    setGlobalPages(updated);
    try {
      await setDoc(doc(db, 'platformSettings', 'globalTeacherPages'), { pages: updated }, { merge: true });
      toast.success('গ্লোবাল পেজ মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error("Error deleting global page:", err);
    }
  };

  const handleToggleTeacherStandardPage = async (teacherId: string, pageId: string) => {
    const currentProfile = teacherProfiles[teacherId] || { id: teacherId };
    const disabledList: string[] = currentProfile.disabledPages || [];
    const isCurrentlyDisabled = disabledList.includes(pageId);
    const newDisabledList = isCurrentlyDisabled
      ? disabledList.filter(id => id !== pageId)
      : [...disabledList, pageId];

    const updatedProfile = { ...currentProfile, disabledPages: newDisabledList };
    setTeacherProfiles(prev => ({ ...prev, [teacherId]: updatedProfile }));

    try {
      await setDoc(doc(db, 'teacherProfiles', teacherId), { disabledPages: newDisabledList }, { merge: true });
      toast.success(`পেজ স্ট্যাটাস ${isCurrentlyDisabled ? 'চালু (Active)' : 'বন্ধ (Deactivated)'} করা হয়েছে!`);
    } catch (err) {
      console.error("Error updating teacher page status:", err);
      toast.error('Failed to update page status');
    }
  };

  const handleAddTeacherCustomPage = async (teacherId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherPageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    let cleanSlug = (newTeacherPageSlug.trim() || newTeacherPageName.trim()).toLowerCase();
    if (!cleanSlug.startsWith('/')) cleanSlug = `/${cleanSlug}`;
    cleanSlug = cleanSlug.replace(/[^a-z0-9\-_/]/g, '-');

    const currentProfile = teacherProfiles[teacherId] || { id: teacherId };
    const existingCustomLinks: CustomNavItem[] = currentProfile.customNavLinks || [];

    if (existingCustomLinks.some(l => l.slug === cleanSlug)) {
      toast.error('এই স্লাগের একটি পেজ ইতিমধ্যে রয়েছে!');
      return;
    }

    setPageSaving(true);
    const newNavItem: CustomNavItem = {
      id: 'page_' + Date.now(),
      name: newTeacherPageName.trim(),
      slug: cleanSlug,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    const updatedNavLinks = [...existingCustomLinks, newNavItem];
    const updatedProfile = { ...currentProfile, customNavLinks: updatedNavLinks };
    setTeacherProfiles(prev => ({ ...prev, [teacherId]: updatedProfile }));

    try {
      await setDoc(doc(db, 'teacherProfiles', teacherId), { customNavLinks: updatedNavLinks }, { merge: true });
      toast.success(`"${newTeacherPageName.trim()}" পেজটি শুধুমাত্র এই শিক্ষকের সাইটে যুক্ত হয়েছে!`);
      setNewTeacherPageName('');
      setNewTeacherPageSlug('');
    } catch (err) {
      console.error("Error adding custom page:", err);
      toast.error('Failed to add custom page');
    } finally {
      setPageSaving(false);
    }
  };

  const handleDeleteTeacherCustomPage = async (teacherId: string, pageId: string) => {
    const currentProfile = teacherProfiles[teacherId] || { id: teacherId };
    const existingCustomLinks: CustomNavItem[] = currentProfile.customNavLinks || [];
    const updatedNavLinks = existingCustomLinks.filter(l => l.id !== pageId);

    const updatedProfile = { ...currentProfile, customNavLinks: updatedNavLinks };
    setTeacherProfiles(prev => ({ ...prev, [teacherId]: updatedProfile }));

    try {
      await setDoc(doc(db, 'teacherProfiles', teacherId), { customNavLinks: updatedNavLinks }, { merge: true });
      toast.success('কাস্টম পেজ মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error("Error deleting custom page:", err);
      toast.error('Failed to delete custom page');
    }
  };

  const handleToggleTeacherCustomPageStatus = async (teacherId: string, pageId: string) => {
    const currentProfile = teacherProfiles[teacherId] || { id: teacherId };
    const existingCustomLinks: CustomNavItem[] = currentProfile.customNavLinks || [];
    const updatedNavLinks = existingCustomLinks.map(l => {
      if (l.id === pageId) {
        return { ...l, enabled: !l.enabled };
      }
      return l;
    });

    const updatedProfile = { ...currentProfile, customNavLinks: updatedNavLinks };
    setTeacherProfiles(prev => ({ ...prev, [teacherId]: updatedProfile }));

    try {
      await setDoc(doc(db, 'teacherProfiles', teacherId), { customNavLinks: updatedNavLinks }, { merge: true });
      toast.success('পেজ ভিজিবিলিটি আপডেট হয়েছে!');
    } catch (err) {
      console.error("Error updating custom page status:", err);
      toast.error('Failed to update status');
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
                        <p className="text-[11px] text-slate-400 truncate">{u.email || u.phone || 'No Contact'}</p>
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
                                <p className="text-[11px] text-slate-400 truncate">{u.email || u.phone || 'No Contact'}</p>
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

      {/* Tab 3: Teachers Deep Dive & Storefront Management */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          
          {/* 1. GLOBAL TEACHER NAVIGATION & PAGE MANAGER HUB */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>গ্লোবাল টিচার নেভিগেশন ও পেজ কন্ট্রোল Hub</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Global Teacher Storefront Pages & Rules
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  এখান থেকে সকল শিক্ষকের ডিফল্ট পেজ কনফিগার করুন অথবা নতুন গ্লোবাল পেজ যোগ করুন। চাইলে যেকোনো পেজ থেকে নির্দিষ্ট শিক্ষককে বাদ (Exclude) দিতে পারবেন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsAddGlobalModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ নতুন গ্লোবাল পেজ যোগ করুন</span>
                </button>
                <button
                  onClick={() => setIsExcludeGlobalModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <span>টিচার এক্সক্লুশন রুলস</span>
                </button>
              </div>
            </div>

            {/* Global Pages Active Pills Grid */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2.5">
                {globalPages.map((gp) => {
                  const excludedCount = gp.excludedTeacherIds?.length || 0;
                  return (
                    <div 
                      key={gp.id}
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2.5 text-xs text-slate-200 shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">{gp.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700">{gp.slug}</span>
                      
                      {gp.isDefault ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-extrabold uppercase">Base</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteGlobalPage(gp.id)}
                          title="Delete Global Page"
                          className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {excludedCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {excludedCount} Excluded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 2. TEACHERS LIST & SEARCH */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                  সকল শিক্ষকের তালিকা ({teachersList.length})
                </h3>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="শিক্ষকের নাম / ইমেইল দিয়ে সার্চ করুন..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Teacher Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachersList
                .filter(t => {
                  const match = (t.name || t.displayName || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                                (t.email || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                                (t.phone || '').toLowerCase().includes(teacherSearch.toLowerCase());
                  return match;
                })
                .map((teacher) => {
                  const tp = teacherProfiles[teacher.id] || {};
                  const teacherCourses = courses.filter(c => c.teacherId === teacher.id || (!c.teacherId && teacher.email?.toLowerCase().includes('abuabdullahakash')));
                  const totalTeacherStudents = teacherCourses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
                  const avatar = teacher.profilePhoto || teacher.photoURL || tp.profilePhoto || tp.photoUrl;
                  
                  // Compute Referrals count
                  const referralStudents = users.filter(u => u.preferredTeacherId === teacher.id || u.referralTeacherId === teacher.id || u.referredByTeacherId === teacher.id);
                  const customPagesCount = tp.customNavLinks?.length || 0;

                  return (
                    <div 
                      key={teacher.id} 
                      className="bg-slate-900/70 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between group hover:shadow-2xl hover:shadow-orange-500/5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center font-black text-orange-400 text-base overflow-hidden shrink-0 shadow-inner">
                              {avatar ? (
                                <img src={avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (teacher.name || teacher.displayName || 'T')[0].toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-white truncate text-sm flex items-center gap-1.5">
                                <span>{teacher.name || teacher.displayName || tp.displayName || 'Instructor'}</span>
                              </p>
                              <p className="text-xs text-slate-400 truncate">{teacher.email || teacher.phone || 'No Contact'}</p>
                              <p className="text-[11px] text-orange-400 font-semibold truncate mt-0.5">{tp.headline || teacher.subject || 'Academic Instructor'}</p>
                            </div>
                          </div>
                        </div>

                        {/* 3 Metric Stat Boxes */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                          <div className="bg-slate-800/50 p-2 rounded-xl text-center border border-slate-700/40">
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Courses</p>
                            <p className="text-base font-black text-white">{teacherCourses.length}</p>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded-xl text-center border border-slate-700/40">
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Students</p>
                            <p className="text-base font-black text-white">{totalTeacherStudents}</p>
                          </div>
                          <div className="bg-orange-500/10 p-2 rounded-xl text-center border border-orange-500/30">
                            <p className="text-[9px] text-orange-400 font-bold uppercase truncate">Referrals</p>
                            <p className="text-base font-black text-orange-400">{referralStudents.length}</p>
                          </div>
                        </div>

                        {customPagesCount > 0 && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span>{customPagesCount} কাস্টম পেজ সক্রিয়</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setSelectedTeacherTab('overview');
                        }}
                        className="w-full py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-orange-500/30 shadow-md group-hover:scale-[1.02]"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Teacher Control Manager</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  );
                })}
            </div>
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
                  <p className="text-xs text-slate-400">{selectedUser.email || selectedUser.phone || 'No Contact'}</p>
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

      {/* ========================================================================= */}
      {/* 3. FULL SPLIT-VIEW TEACHER CONTROL MANAGER WORKSPACE                     */}
      {/* ========================================================================= */}
      {selectedTeacher && (() => {
        const tp = teacherProfiles[selectedTeacher.id] || {};
        const teacherCourses = courses.filter(c => c.teacherId === selectedTeacher.id || (!c.teacherId && selectedTeacher.email?.toLowerCase().includes('abuabdullahakash')));
        const totalTeacherStudents = teacherCourses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
        const avatar = selectedTeacher.profilePhoto || selectedTeacher.photoURL || tp.profilePhoto || tp.photoUrl;
        
        // Referral stats
        const referralStudents = users.filter(u => u.preferredTeacherId === selectedTeacher.id || u.referralTeacherId === selectedTeacher.id || u.referredByTeacherId === selectedTeacher.id);
        const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const referralLink = `${originUrl}/teachers/${selectedTeacher.id}`;

        const disabledPages: string[] = tp.disabledPages || [];
        const customNavLinks: CustomNavItem[] = tp.customNavLinks || [];

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden text-slate-200">
              
              {/* Modal Top Header Bar */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-sm overflow-hidden shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (selectedTeacher.name || selectedTeacher.displayName || 'T')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <span>{selectedTeacher.name || selectedTeacher.displayName || tp.displayName || 'Instructor Control Hub'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                        ID: {selectedTeacher.id.slice(0, 8)}...
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{selectedTeacher.email} • {selectedTeacher.phone || 'No Phone'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/teachers/${selectedTeacher.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>View Live Storefront</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                  <button 
                    onClick={() => setSelectedTeacher(null)} 
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Split Body Layout */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                
                {/* Left Sidebar Menu */}
                <div className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-3.5 space-y-1.5 shrink-0 overflow-y-auto">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                    ম্যানেজমেন্ট মেনু
                  </div>
                  
                  <button
                    onClick={() => setSelectedTeacherTab('overview')}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all border ${
                      selectedTeacherTab === 'overview'
                        ? 'bg-orange-500 text-white border-orange-400/40 shadow-lg shadow-orange-500/20'
                        : 'text-slate-300 hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4" />
                      <span>ওভারভিউ ও রেফারেল</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
                      {referralStudents.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedTeacherTab('courses')}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all border ${
                      selectedTeacherTab === 'courses'
                        ? 'bg-orange-500 text-white border-orange-400/40 shadow-lg shadow-orange-500/20'
                        : 'text-slate-300 hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4" />
                      <span>কোর্সসমূহ ({teacherCourses.length})</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedTeacherTab('pages')}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all border ${
                      selectedTeacherTab === 'pages'
                        ? 'bg-purple-600 text-white border-purple-400/40 shadow-lg shadow-purple-600/20'
                        : 'text-slate-300 hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4" />
                      <span>পেজ ও মেনু কন্ট্রোল</span>
                    </span>
                    {customNavLinks.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono">
                        +{customNavLinks.length}
                      </span>
                    )}
                  </button>

                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-950/40">
                  
                  {/* SUB-VIEW 1: OVERVIEW & REFERRAL ANALYTICS */}
                  {selectedTeacherTab === 'overview' && (
                    <div className="space-y-6">
                      
                      {/* Metric Stat Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courses Created</p>
                          <p className="text-2xl font-black text-white">{teacherCourses.length}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
                          <p className="text-2xl font-black text-white">{totalTeacherStudents}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/30 space-y-1 shadow-sm">
                          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">রেফারেল শিক্ষার্থী</p>
                          <p className="text-2xl font-black text-orange-400">{referralStudents.length}</p>
                        </div>
                      </div>

                      {/* Referral Link Box */}
                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-orange-400" />
                            <span>শিক্ষকের নিজস্ব রেফারেল ও একাডেমি শেয়ার লিংক</span>
                          </span>
                          <span className="text-[10px] text-slate-400">এই লিংকে আসা শিক্ষার্থীরা এই শিক্ষকের সাথে যুক্ত হয়</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={referralLink}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-200 outline-none select-all"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              setCopiedReferral(true);
                              toast.success('রেফারেল লিংক কপি হয়েছে!');
                              setTimeout(() => setCopiedReferral(false), 2000);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                          >
                            {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedReferral ? 'কপি হয়েছে' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Referral Students List */}
                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <span>এই শিক্ষকের রেফারেল লিংকে নিবন্ধিত শিক্ষার্থীরা ({referralStudents.length})</span>
                        </h4>

                        {referralStudents.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-xs font-medium bg-slate-900/40 rounded-xl border border-slate-800/60">
                            এখনও কোনো শিক্ষার্থী এই শিক্ষকের রেফারেল লিংক দিয়ে যুক্ত হয়নি।
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold">
                                <tr>
                                  <th className="py-2.5 px-3 rounded-l-lg">শিক্ষার্থী</th>
                                  <th className="py-2.5 px-3">মোবাইল / ইমেইল</th>
                                  <th className="py-2.5 px-3">শ্রেণি / প্রতিষ্ঠান</th>
                                  <th className="py-2.5 px-3 text-right rounded-r-lg">স্ট্যাটাস</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                {referralStudents.map(st => (
                                  <tr key={st.id} className="hover:bg-slate-800/30">
                                    <td className="py-2.5 px-3 font-bold text-white">
                                      {st.name || st.displayName || 'Learner'}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                                      {st.phone || st.email || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400">
                                      {st.eduLevel || st.class || st.institution || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                                        Active
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* SUB-VIEW 2: COURSES MANAGEMENT */}
                  {selectedTeacherTab === 'courses' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-orange-400" />
                          <span>এই শিক্ষকের কোর্সসমূহ ({teacherCourses.length})</span>
                        </h4>
                      </div>

                      {teacherCourses.length === 0 ? (
                        <p className="text-xs text-slate-500 py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                          এই শিক্ষকের কোনো কোর্স পাওয়া যায়নি।
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {teacherCourses.map(c => (
                            <div key={c.id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-11 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                  {c.thumbnail ? (
                                    <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold">Course</div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs text-white truncate">{c.title}</p>
                                  <p className="text-[11px] text-slate-400">৳{c.price || 'Free'} • {c.studentsCount || 0} Students</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                                <span className={c.isPublished !== false ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                  {c.isPublished !== false ? '● Live Published' : '○ Draft'}
                                </span>
                                <button
                                  onClick={() => handleToggleCoursePublish(c)}
                                  disabled={actionProcessing}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    c.isPublished !== false 
                                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  }`}
                                >
                                  {c.isPublished !== false ? 'Draft করুন' : 'Publish করুন'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-VIEW 3: DYNAMIC PAGE & MENU CONTROL */}
                  {selectedTeacherTab === 'pages' && (
                    <div className="space-y-6">
                      
                      {/* Section 1: Standard Base & Global Pages Control */}
                      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span>১. গ্লোবাল ও ডিফল্ট পেজসমূহ (Base & Global Pages)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            এই পেজগুলো সকল শিক্ষকের জন্য সক্রিয় থাকে। আপনি চাইলে এই শিক্ষকের মেনু থেকে যেকোনো পেজ চালু বা বন্ধ (Disable) করতে পারেন।
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {globalPages.map((gp) => {
                            const isExcludedGlobally = gp.excludedTeacherIds?.includes(selectedTeacher.id);
                            const isManuallyDisabled = disabledPages.includes(gp.id);
                            const isPageActive = !isExcludedGlobally && !isManuallyDisabled;

                            return (
                              <div 
                                key={gp.id}
                                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                                  isPageActive 
                                    ? 'bg-slate-800/60 border-slate-700/80' 
                                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">{gp.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{gp.slug}</span>
                                  </div>
                                  <span className={`text-[10px] font-extrabold ${isPageActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {isPageActive ? '● সক্রিয় (Active)' : '○ নিষ্ক্রিয় (Disabled)'}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleToggleTeacherStandardPage(selectedTeacher.id, gp.id)}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                                    isPageActive 
                                      ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30' 
                                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {isPageActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                  <span>{isPageActive ? 'বন্ধ করুন' : 'চালু করুন'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Teacher-Specific Custom Pages Manager */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 to-slate-900/80 border border-purple-500/30 space-y-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>কাস্টম পেজ ক্রিয়েটর</span>
                          </div>
                          <h4 className="text-sm font-black text-white mt-1">
                            ২. এই শিক্ষকের নিজস্ব কাস্টম পেজসমূহ (Exclusive Pages)
                          </h4>
                          <p className="text-[11px] text-slate-300">
                            এখান থেকে তৈরি করা পেজটি **শুধুমাত্র এই শিক্ষকের স্টোরফ্রন্ট মেনুতেই** লাইভ হবে। অন্য কোনো শিক্ষকের সাইটে থাকবে না।
                          </p>
                        </div>

                        {/* Add Page Form */}
                        <form onSubmit={(e) => handleAddTeacherCustomPage(selectedTeacher.id, e)} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-300">পেজের নাম (Page Name) *</label>
                              <input
                                type="text"
                                required
                                placeholder="যেমন: Notice, Routine, Success"
                                value={newTeacherPageName}
                                onChange={(e) => {
                                  setNewTeacherPageName(e.target.value);
                                  if (!newTeacherPageSlug) {
                                    setNewTeacherPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                  }
                                }}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-300">ক্লিন স্লাগ (Clean URL Slug) *</label>
                              <input
                                type="text"
                                required
                                placeholder="/notice"
                                value={newTeacherPageSlug}
                                onChange={(e) => setNewTeacherPageSlug(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={pageSaving}
                            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>{pageSaving ? 'পেজ যুক্ত হচ্ছে...' : 'এই শিক্ষকের জন্য পেজটি তৈরি করুন'}</span>
                          </button>
                        </form>

                        {/* List of Custom Pages */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            বিদ্যমান কাস্টম পেজসমূহ ({customNavLinks.length})
                          </h5>

                          {customNavLinks.length === 0 ? (
                            <div className="py-6 text-center text-slate-500 text-xs font-medium bg-slate-900/40 rounded-xl border border-slate-800/60">
                              এই শিক্ষকের জন্য এখনও কোনো স্পেশাল কাস্টম পেজ যোগ করা হয়নি।
                            </div>
                          ) : (
                            customNavLinks.map(page => (
                              <div 
                                key={page.id}
                                className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/25 flex items-center justify-between gap-3 shadow-sm"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-white">{page.name}</span>
                                    <span className="text-[11px] text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                      {page.slug}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <span>🔒 Only visible on {selectedTeacher.name || 'this teacher'}&apos;s storefront</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleTeacherCustomPageStatus(selectedTeacher.id, page.id)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                      page.enabled 
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {page.enabled ? 'সক্রিয় (Active)' : 'বন্ধ (Disabled)'}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTeacherCustomPage(selectedTeacher.id, page.id)}
                                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                                    title="Delete Page"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4. GLOBAL PAGE CREATION MODAL                                            */}
      {/* ========================================================================= */}
      {isAddGlobalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-purple-400">
                <Globe className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">নতুন গ্লোবাল পেজ তৈরি করুন</h3>
              </div>
              <button onClick={() => setIsAddGlobalModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              এই পেজটি যুক্ত করলে তা **সকল শিক্ষকের মেনুতে স্বয়ংক্রিয়ভাবে ডিফল্ট হিসেবে যুক্ত হবে**।
            </p>

            <form onSubmit={handleAddGlobalPage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">পেজের নাম (Page Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Gallery বা Notice"
                  value={newGlobalPageName}
                  onChange={(e) => {
                    setNewGlobalPageName(e.target.value);
                    if (!newGlobalPageSlug) {
                      setNewGlobalPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">স্লাগ (Clean URL Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="/gallery"
                  value={newGlobalPageSlug}
                  onChange={(e) => setNewGlobalPageSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGlobalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={pageSaving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {pageSaving ? 'সংরক্ষণ হচ্ছে...' : 'গ্লোবাল পেজ তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GLOBAL PAGE EXCLUSION RULES MODAL                                     */}
      {/* ========================================================================= */}
      {isExcludeGlobalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-purple-400">
                <SlidersHorizontal className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">গ্লোবাল পেজ টিচার এক্সক্লুশন রুলস</h3>
              </div>
              <button onClick={() => setIsExcludeGlobalModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              যেকোনো গ্লোবাল পেজ সিলেক্ট করুন এবং কোন কোন শিক্ষকের মেনু থেকে এই পেজটি **বাদ (Exclude)** থাকবে তা নির্ধারণ করুন:
            </p>

            <div className="space-y-4">
              {globalPages.map((gp) => {
                const excludedIds = gp.excludedTeacherIds || [];
                return (
                  <div key={gp.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{gp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{gp.slug}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                        {excludedIds.length} জন বাদ দেওয়া আছে
                      </span>
                    </div>

                    {/* Teacher Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-36 overflow-y-auto custom-scrollbar">
                      {teachersList.map((t) => {
                        const isExcluded = excludedIds.includes(t.id);
                        return (
                          <div 
                            key={t.id}
                            onClick={() => handleToggleExcludeTeacher(gp.id, t.id)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between select-none transition-all ${
                              isExcluded 
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300' 
                                : 'bg-slate-900/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate max-w-[140px] font-medium">{t.name || t.displayName || t.email}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${isExcluded ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                              {isExcluded ? 'Excluded' : 'Active'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setIsExcludeGlobalModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                হয়েছে (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Smart Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Delete User Account</h3>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{deleteConfirmUser.name || deleteConfirmUser.email}</p>
                </div>
              </div>
              <button onClick={() => setDeleteConfirmUser(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Choose how you want to delete or handle <strong className="text-white">{deleteConfirmUser.name || deleteConfirmUser.email}</strong>:
            </p>

            {/* Granular Option Cards */}
            <div className="space-y-2.5">
              
              {/* Option 1: Both / Complete (Recommended) */}
              <div 
                onClick={() => setDeleteMode('both')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  deleteMode === 'both'
                    ? 'bg-rose-500/15 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-all ${
                  deleteMode === 'both' ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-500'
                }`}>
                  {deleteMode === 'both' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-white">1. Delete Completely (Database & Records)</p>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 uppercase">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permanently deletes user profile, teacher data, and all database records from Firestore.
                  </p>
                </div>
              </div>

              {/* Option 2: Database Only */}
              <div 
                onClick={() => setDeleteMode('database_only')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  deleteMode === 'database_only'
                    ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-all ${
                  deleteMode === 'database_only' ? 'border-amber-500 bg-amber-500 text-black' : 'border-slate-500'
                }`}>
                  {deleteMode === 'database_only' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-white">2. Database Record Only</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Removes user profile and roles from Firestore database, keeping auth identity.
                  </p>
                </div>
              </div>

              {/* Option 3: Block / Suspend Login */}
              <div 
                onClick={() => setDeleteMode('auth_block')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  deleteMode === 'auth_block'
                    ? 'bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-500/40 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border transition-all ${
                  deleteMode === 'auth_block' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-500'
                }`}>
                  {deleteMode === 'auth_block' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-white">3. Suspend / Block Login</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Revokes site access immediately without deleting their historical data.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                disabled={actionProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                {actionProcessing ? 'Processing...' : 'Confirm Action'}
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
