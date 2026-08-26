"use client";

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { resolveTeacherBySlugOrId } from '@/lib/slug';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { 
  Globe, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Phone, 
  MessageCircle, 
  BookOpen, 
  Bell, 
  Clock, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import TeacherNoticeBoardView from '@/components/teacher-storefronts/TeacherNoticeBoardView';

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

export default function DynamicTeacherCustomPage({ params }: CustomPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { user, userData } = useAuth();
  const searchParams = useSearchParams();

  const isPreview = searchParams.get('preview') === 'true';
  const queryTeacherId = searchParams.get('teacherId');

  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageData, setPageData] = useState<any>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [teacherNotices, setTeacherNotices] = useState<any[]>([]);

  // Resolve Effective Teacher ID
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().includes('abuabdullahakash');
  const isTeacher = isAdmin || userData?.role === 'teacher';
  const preferredTeacherId = userData?.preferredTeacherId && userData.preferredTeacherId !== 'global' ? userData.preferredTeacherId : null;
  
  let guestTeacherId: string | null = null;
  if (typeof window !== 'undefined') {
    guestTeacherId = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
    if (guestTeacherId === 'global') guestTeacherId = null;
  }

  const effectiveTeacherId = queryTeacherId 
    ? queryTeacherId 
    : (isTeacher 
        ? user?.uid 
        : (preferredTeacherId || guestTeacherId || 'teacher_abuabdullahakash'));

  useEffect(() => {
    const fetchPageAndTeacherData = async () => {
      setLoading(true);
      try {
        const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;

        // 1. Fetch Teacher Profile
        if (effectiveTeacherId) {
          let resolvedUid = effectiveTeacherId;
          const teacherInfo = await resolveTeacherBySlugOrId(db, effectiveTeacherId);
          if (teacherInfo) {
            resolvedUid = teacherInfo.uid || effectiveTeacherId;
            setTeacherProfile(teacherInfo);
            const customNavs = teacherInfo.customNavLinks || [];
            const matched = customNavs.find((c: any) => c.slug === formattedSlug || c.slug === slug);
            if (matched) {
              setPageTitle(matched.name);
              setPageData(matched);
            }
          } else {
            const tDoc = await getDoc(doc(db, 'teacherProfiles', effectiveTeacherId));
            if (tDoc.exists()) {
              const tData = tDoc.data();
              setTeacherProfile(tData);

              // Find matching custom page
              const customNavs = tData.customNavLinks || [];
              const matched = customNavs.find((c: any) => c.slug === formattedSlug || c.slug === slug);
              if (matched) {
                setPageTitle(matched.name);
                setPageData(matched);
              }
            } else {
              const uDoc = await getDoc(doc(db, 'users', effectiveTeacherId));
              if (uDoc.exists()) {
                const uData = uDoc.data();
                setTeacherProfile({
                  displayName: uData.name || uData.displayName || 'Instructor',
                  headline: uData.subject || 'Academic Instructor',
                  profilePhoto: uData.profilePhoto || uData.photoURL || uData.photoUrl,
                  bio: uData.bio || ''
                });
              }
            }
          }
        }

        // 2. Check Global Platform Pages if not found in teacher
        if (!pageData) {
          const gpDoc = await getDoc(doc(db, 'platformSettings', 'globalTeacherPages'));
          if (gpDoc.exists()) {
            const gpData = gpDoc.data();
            const matchedGlobal = (gpData.pages || []).find((p: any) => p.slug === formattedSlug || p.slug === slug);
            if (matchedGlobal) {
              setPageTitle(matchedGlobal.name);
              setPageData(matchedGlobal);
            }
          }
        }

        // 3. If title still empty, format from slug
        if (!pageTitle) {
          const cleanName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
          setPageTitle(cleanName);
        }

        // 4. Fetch Teacher Posts/Notices
        if (effectiveTeacherId) {
          try {
            const postsQ = query(
              collection(db, 'posts'),
              where('teacherId', '==', effectiveTeacherId),
              limit(10)
            );
            const pSnap = await getDocs(postsQ);
            const notices: any[] = [];
            pSnap.forEach(d => notices.push({ id: d.id, ...d.data() }));
            setTeacherNotices(notices);
          } catch (e) {
            console.error("Error fetching teacher notices:", e);
          }
        }

      } catch (err) {
        console.error("Error loading dynamic custom page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageAndTeacherData();
  }, [slug, effectiveTeacherId]);

  const teacherName = teacherProfile?.displayName || teacherProfile?.academyName || 'Instructor';
  const teacherAvatar = teacherProfile?.profilePhoto || teacherProfile?.photoUrl;
  const teacherHeadline = teacherProfile?.headline || 'Academic Instructor & Mentor';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <div>
        
        {/* Preview Mode Alert Banner */}
        {isPreview && (
          <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border-b border-amber-500/40 px-4 py-2.5 text-center text-xs text-foreground flex flex-wrap items-center justify-center gap-2 sticky top-0 z-40 backdrop-blur-md shadow-md">
            <Eye className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span>
              <strong>👀 টিচার প্রিভিউ মোড:</strong> এটি <strong>&quot;{teacherName}&quot;</strong>-এর কাস্টম পেজের প্রিভিউ। স্ট্যাটাস: 
              <span className={`ml-1 font-extrabold px-2 py-0.5 rounded ${pageData?.isPublished ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'}`}>
                {pageData?.isPublished ? '✓ Live Published' : '⏳ Draft / Default Template'}
              </span>
            </span>
          </div>
        )}

        {/* Top Breadcrumb & Back Bar */}
        <div className="bg-card/70 border-b border-border/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link href="/" className="hover:text-primary flex items-center gap-1 transition-colors">
                <Globe className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-primary font-bold">{pageTitle || slug}</span>
            </div>

            {effectiveTeacherId && (
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <span>Teacher Academy:</span>
                <span className="font-bold text-foreground bg-foreground/5 px-2 py-0.5 rounded-md border border-border">
                  {teacherName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Route Content Router */}
        {slug === 'notice' ? (
          <TeacherNoticeBoardView
            teacherName={teacherName}
            teacherHeadline={teacherHeadline}
            teacherAvatar={teacherAvatar}
            teacherId={effectiveTeacherId}
            teacherPhone={teacherProfile?.contactPhone}
            teacherWhatsapp={teacherProfile?.contactWhatsapp}
            firestoreNotices={teacherNotices}
            pageConfig={teacherProfile?.homePageConfig?.customPagesConfig?.notice || teacherProfile?.customPagesConfig?.notice || {}}
          />
        ) : (
          <div>
            {/* Page Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-purple-500/10 via-background to-background border-b border-border/80 py-12 px-4 sm:px-6">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mt-20" />
              
              <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{teacherName}&apos;s Storefront</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
                  {pageTitle || 'Custom Page'}
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {pageData?.description || `${teacherName}-এর অফিশিয়াল একাডেমি পেজ এবং গুরুত্বপূর্ণ তথ্যসমূহ।`}
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
              
              {/* Teacher Profile Summary Card */}
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-orange-500 p-1 shrink-0 shadow-lg shadow-purple-500/10">
                  <div className="w-full h-full rounded-[22px] bg-card overflow-hidden flex items-center justify-center font-black text-2xl text-primary">
                    {teacherAvatar ? (
                      <img src={teacherAvatar} alt={teacherName} className="w-full h-full object-cover" />
                    ) : (
                      (teacherName || 'T')[0].toUpperCase()
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-black text-foreground">{teacherName}</h3>
                      <p className="text-xs text-primary font-semibold">{teacherHeadline}</p>
                    </div>
                    <Link
                      href="/courses"
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/30"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>সকল কোর্স দেখুন</span>
                    </Link>
                  </div>

                  {teacherProfile?.bio && (
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl pt-1">
                      {teacherProfile.bio}
                    </p>
                  )}

                  {/* Quick Contact Badges */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                    {teacherProfile?.contactPhone && (
                      <a 
                        href={`tel:${teacherProfile.contactPhone}`}
                        className="px-3 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border text-[11px] text-foreground flex items-center gap-1.5 transition-colors font-mono"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{teacherProfile.contactPhone}</span>
                      </a>
                    )}
                    {teacherProfile?.contactWhatsapp && (
                      <a 
                        href={`https://wa.me/${teacherProfile.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5 transition-colors font-bold"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-500" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Content or Announcements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span>গুরুত্বপূর্ণ নোটিশ ও আপডেটসমূহ</span>
                  </h3>
                </div>

                {teacherNotices.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {teacherNotices.map((notice) => (
                      <div 
                        key={notice.id} 
                        className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all space-y-2.5 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-extrabold text-sm text-foreground">{notice.title || 'নোটিশ'}</h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString('bn-BD') : 'সম্প্রতি'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {notice.content || notice.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">এখনও কোনো নোটিশ প্রকাশিত হয়নি</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      এই শিক্ষকের নতুন নোটিশ বা নিয়মিত ক্লাসের আপডেট প্রকাশিত হলে তা সরাসরি এই পেজে দেখতে পাবেন।
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/contact"
                        className="px-5 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs inline-flex items-center gap-2 transition-colors border border-border"
                      >
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span>শিক্ষকের সাথে সরাসরি যোগাযোগ করুন</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
