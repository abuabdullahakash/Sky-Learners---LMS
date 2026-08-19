"use client";

import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { 
  Building2, 
  User, 
  Link as LinkIcon, 
  CheckCircle2, 
  Globe, 
  Star, 
  Users, 
  Video, 
  GraduationCap, 
  Briefcase, 
  Presentation,
  BookOpen,
  Megaphone,
  ArrowRight,
  Pin,
  Sparkles,
  Flame,
  Play,
  Calendar,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CourseItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  price?: number;
  regularPrice?: number;
  enrolledCount?: number;
  rating?: number;
  duration?: string;
}

interface TeacherPost {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'tips' | 'promo' | 'exam_alert';
  imageUrl?: string;
  linkedCourseId?: string;
  linkedCourseTitle?: string;
  isPinned?: boolean;
  createdAt: any;
}

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;
  const locale = useLocale();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [posts, setPosts] = useState<TeacherPost[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'posts' | 'about'>('courses');

  useEffect(() => {
    const fetchProfileAndContent = async () => {
      try {
        // 1. Fetch Teacher Profile
        const docRef = doc(db, 'teacherProfiles', teacherId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }

        // 2. Fetch Teacher's Published Courses
        const coursesRef = collection(db, 'courses');
        const qCourses = query(coursesRef, where('teacherId', '==', teacherId), where('isPublished', '==', true));
        const coursesSnap = await getDocs(qCourses);
        const fetchedCourses: CourseItem[] = [];
        coursesSnap.forEach(d => {
          const data = d.data();
          fetchedCourses.push({
            id: d.id,
            title: data.title || 'Untitled Course',
            thumbnailUrl: data.thumbnailUrl,
            category: data.category,
            price: data.price,
            regularPrice: data.regularPrice,
            enrolledCount: data.enrolledCount || 0,
            rating: 4.9,
            duration: data.duration,
          });
        });
        setCourses(fetchedCourses);

        // 3. Fetch Teacher's Posts / Notices
        const postsRef = collection(db, 'teacher_posts');
        const qPosts = query(postsRef, where('teacherId', '==', teacherId), limit(20));
        const postsSnap = await getDocs(qPosts);
        const fetchedPosts: TeacherPost[] = [];
        postsSnap.forEach(d => {
          fetchedPosts.push({ id: d.id, ...d.data() } as TeacherPost);
        });

        // Sort posts
        fetchedPosts.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setPosts(fetchedPosts);

      } catch (error) {
        console.error("Error fetching teacher storefront", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileAndContent();
  }, [teacherId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(locale === 'bn' ? 'প্রোফাইল লিংক কপি করা হয়েছে!' : 'Profile link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-foreground/70 bg-background space-y-4">
        <Building2 className="w-16 h-16 text-foreground/30" />
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Link href="/" className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  const isInstitution = profileData.type === 'institution' || (profileData.teachersRoster && profileData.teachersRoster.length > 0);
  const featuredCourse = courses[0];

  const typeBadges = {
    notice: { label: locale === 'bn' ? '📢 নোটিশ' : '📢 Notice', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    tips: { label: locale === 'bn' ? '💡 পড়ার টিপস' : '💡 Study Tips', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    promo: { label: locale === 'bn' ? '🔥 নতুন কোর্স' : '🔥 Course Promo', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    exam_alert: { label: locale === 'bn' ? '📝 পরীক্ষার বার্তা' : '📝 Exam Alert', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  };

  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-300 pt-16 sm:pt-20 w-full max-w-full overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. COVER PHOTO & STOREFRONT HERO BANNER                                  */}
      {/* ========================================================================= */}
      <div className="h-52 sm:h-64 md:h-80 relative bg-foreground/10 w-full overflow-hidden">
        <img 
          src={profileData.coverPhoto || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'} 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full bg-background flex flex-col">

          {/* Profile Header Block */}
          <div className="relative pb-6 sm:pb-8 border-b border-foreground/10">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 md:-mt-24 mb-6">
              
              {/* Avatar & Basic Info */}
              <div className="flex items-end gap-4 sm:gap-6">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shadow-2xl z-10 flex-shrink-0">
                  <img 
                    src={profileData.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                    alt="Profile" 
                    className={`w-full h-full object-cover border-4 border-background bg-background shadow-xl ${isInstitution ? 'rounded-3xl' : 'rounded-full'}`}
                  />
                </div>

                <div className="pb-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">
                      {profileData.displayName || (isInstitution ? 'Academy Name' : 'Teacher Name')}
                    </h1>
                    <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  </div>
                  
                  <p className="text-primary font-bold text-sm sm:text-base md:text-lg">
                    {profileData.headline || (isInstitution ? 'Premier Coaching & Training Academy' : 'Senior Instructor')}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60">
                    <span className="px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10">
                      {isInstitution ? '🏛️ Coaching Center' : '👤 Individual Instructor'}
                    </span>
                    {profileData.experiences?.[0]?.institution && (
                      <span>• {profileData.experiences[0].institution}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Share & Actions */}
              <div className="flex items-center gap-2 self-start sm:self-end pt-2 sm:pt-0">
                <button
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'শেয়ার করুন' : 'Share Storefront'}</span>
                </button>
              </div>

            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 text-center">
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-foreground">
                  {courses.length}
                </div>
                <div className="text-xs text-foreground/60 font-semibold">
                  {locale === 'bn' ? 'মোট কোর্স' : 'Total Courses'}
                </div>
              </div>

              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-orange-500">
                  {posts.length}
                </div>
                <div className="text-xs text-foreground/60 font-semibold">
                  {locale === 'bn' ? 'পোস্ট ও নোটিশ' : 'Posts & Notices'}
                </div>
              </div>

              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-primary">
                  {isInstitution ? (profileData.teachersRoster?.length || 4) : '500+'}
                </div>
                <div className="text-xs text-foreground/60 font-semibold">
                  {isInstitution ? (locale === 'bn' ? 'শিক্ষক প্যানেল' : 'Faculty Teachers') : (locale === 'bn' ? 'শিক্ষার্থী' : 'Students')}
                </div>
              </div>

              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>4.9</span>
                </div>
                <div className="text-xs text-foreground/60 font-semibold">
                  {locale === 'bn' ? 'রেটিং' : 'Rating'}
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 2. FEATURED COURSE PROMO BANNER (বিজ্ঞাপন)                                */}
          {/* ========================================================================= */}
          {featuredCourse && (
            <div className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-indigo-950/40 border border-orange-500/30 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'স্পেশাল ফিচারড কোর্স' : 'Featured Course'}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
                    {featuredCourse.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                    {locale === 'bn'
                      ? 'সেরা প্রস্তুতি ও পূর্ণাঙ্গ গাইডলাইন পেতে এই কোর্সে আজই যুক্ত হোন।'
                      : 'Enroll today to get full curriculum access, live classes, daily exams, and expert support.'}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-2xl font-black text-orange-400">
                      ৳{featuredCourse.price || 'Free'}
                    </span>
                    {featuredCourse.regularPrice && featuredCourse.regularPrice > (featuredCourse.price || 0) && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{featuredCourse.regularPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
                  <Link
                    href={`/courses/${featuredCourse.id}`}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-xl hover:shadow-orange-500/40 text-center flex items-center justify-center gap-2"
                  >
                    <span>{locale === 'bn' ? 'কোর্সে ভর্তি হোন' : 'Enroll in Course'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. STOREFRONT TABS: Courses / Posts & Notices / About                     */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 border-b border-foreground/10 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-3.5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'courses'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{locale === 'bn' ? `কোর্সসমূহ (${courses.length})` : `Courses (${courses.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3.5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'posts'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{locale === 'bn' ? `পোস্ট ও নোটিশ (${posts.length})` : `Posts & Notices (${posts.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-3.5 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'about'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{isInstitution ? (locale === 'bn' ? 'ফ্যাকাল্টি ও পরিচিতি' : 'Faculty & About') : (locale === 'bn' ? 'শিক্ষকের পরিচিতি' : 'About')}</span>
            </button>
          </div>

          {/* TAB 1: COURSES CATALOG */}
          {activeTab === 'courses' && (
            <div>
              {courses.length === 0 ? (
                <div className="text-center py-16 px-4 bg-foreground/[0.02] border border-foreground/10 rounded-3xl">
                  <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">
                    {locale === 'bn' ? 'বর্তমানে কোনো কোর্স সক্রিয় নেই' : 'No Active Courses Found'}
                  </h3>
                  <p className="text-sm text-foreground/60 mt-1">
                    {locale === 'bn' ? 'এই শিক্ষক শীঘ্রই নতুন কোর্স পাবলিশ করবেন।' : 'This instructor will publish new courses soon.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div 
                      key={course.id}
                      className="group rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/50 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col overflow-hidden"
                    >
                      <div className="relative aspect-video w-full bg-foreground/10 overflow-hidden">
                        {course.thumbnailUrl ? (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                            <BookOpen className="w-10 h-10 text-orange-500" />
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                            {course.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-foreground/10 flex items-center justify-between">
                          <div>
                            {course.price && course.price > 0 ? (
                              <span className="text-lg font-black text-orange-500">
                                ৳{course.price}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                                Free
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/courses/${course.id}`}
                            className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white font-bold text-xs transition-all flex items-center gap-1"
                          >
                            <span>{locale === 'bn' ? 'বিস্তারিত' : 'View Details'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POSTS & NOTICES */}
          {activeTab === 'posts' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {posts.length === 0 ? (
                <div className="text-center py-16 px-4 bg-foreground/[0.02] border border-foreground/10 rounded-3xl">
                  <Megaphone className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-foreground">
                    {locale === 'bn' ? 'এখনো কোনো নোটিশ বা পোস্ট নেই' : 'No Posts or Notices Yet'}
                  </h3>
                  <p className="text-sm text-foreground/60 mt-1">
                    {locale === 'bn' ? 'শিক্ষক নোটিশ দিলে তা এখানে দেখা যাবে।' : 'Updates published by the instructor will appear here.'}
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div 
                    key={post.id}
                    className={`p-6 sm:p-8 rounded-3xl bg-background border shadow-sm space-y-4 ${
                      post.isPinned ? 'border-orange-500/40 bg-orange-500/[0.02]' : 'border-foreground/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                            <Pin className="w-3 h-3 fill-white" />
                            <span>{locale === 'bn' ? 'পিন করা' : 'Pinned'}</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeBadges[post.type]?.color}`}>
                          {typeBadges[post.type]?.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {post.imageUrl && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-foreground/10">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {post.linkedCourseId && (
                      <div className="pt-2">
                        <Link 
                          href={`/courses/${post.linkedCourseId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-bold transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>{post.linkedCourseTitle || (locale === 'bn' ? 'কোর্সের বিস্তারিত দেখুন' : 'View Course')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ABOUT & FACULTY */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                
                {/* Biography */}
                <div className="p-6 sm:p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-3">
                  <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    <span>{locale === 'bn' ? 'পরিচিতি ও বিবরণ' : 'About & Biography'}</span>
                  </h3>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
                    {profileData.bio || (locale === 'bn' ? 'কোনো বিবরণ দেওয়া হয়নি।' : 'No biography provided yet.')}
                  </p>
                </div>

                {/* Coaching Faculty Roster */}
                {isInstitution && profileData.teachersRoster && profileData.teachersRoster.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-6">
                    <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                      <Presentation className="w-5 h-5 text-orange-500" />
                      <span>{locale === 'bn' ? 'আমাদের শিক্ষক প্যানেল' : 'Our Faculty Teachers'}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profileData.teachersRoster.map((teacher: any) => (
                        <div key={teacher.id} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 flex gap-3.5 items-start">
                          <img 
                            src={teacher.image || profileData.profilePhoto} 
                            alt={teacher.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-orange-500/30 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-foreground truncate">{teacher.name || 'Teacher Name'}</h4>
                            {teacher.university && <p className="text-xs text-orange-500 font-bold truncate">{teacher.university}</p>}
                            <p className="text-xs text-foreground/70 mt-1"><span className="font-bold text-foreground">Subjects:</span> {teacher.subjects || 'N/A'}</p>
                            {teacher.classes && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {teacher.classes.split(',').map((cls: string, i: number) => cls.trim() && (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-background border border-foreground/10 rounded font-semibold text-foreground">
                                    {cls.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Experience */}
                {!isInstitution && profileData.experiences && profileData.experiences.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4">
                    <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-orange-500" />
                      <span>{locale === 'bn' ? 'শিক্ষকতার অভিজ্ঞতা' : 'Teaching Experience'}</span>
                    </h3>
                    <div className="space-y-3">
                      {profileData.experiences.map((exp: any) => (
                        <div key={exp.id} className="flex gap-4 p-3.5 bg-foreground/5 rounded-2xl border border-foreground/10">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{exp.role || 'Role'}</h4>
                            <p className="text-foreground/70 text-xs">{exp.institution || 'Institution'}</p>
                            {exp.current && <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded-full mt-1">Current</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar Info & Socials */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4">
                  <h3 className="font-bold uppercase text-xs tracking-wider text-foreground/50">
                    {locale === 'bn' ? 'যোগাযোগ ও সোশ্যাল মিডিয়া' : 'Follow & Connect'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profileData.website && (
                      <a href={profileData.website} target="_blank" rel="noreferrer" title="Website" className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.facebook && (
                      <a href={profileData.facebook} target="_blank" rel="noreferrer" title="Facebook" className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} target="_blank" rel="noreferrer" title="YouTube" className="w-10 h-10 rounded-xl bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
