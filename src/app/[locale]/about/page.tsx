"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { 
  Building2, 
  Users, 
  Sparkles, 
  Award, 
  Star, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Video, 
  Phone, 
  Mail, 
  MessageCircle, 
  ArrowRight, 
  Edit3, 
  CheckCircle2,
  Globe,
  Flame,
  Compass,
  Trophy,
  UserCheck
} from 'lucide-react';

export default function AboutPage() {
  const { user, userData, loading: authLoading } = useAuth();

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchAboutData = async () => {
      setLoading(true);
      try {
        if (user && isTeacher) {
          // Fetch teacher's profile and custom config
          const docRef = doc(db, 'teacherProfiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTeacherProfile(docSnap.data());
          }

          // Count teacher's published courses
          const coursesQ = query(collection(db, 'courses'), where('teacherId', '==', user.uid), where('isPublished', '==', true));
          const coursesSnap = await getDocs(coursesQ);
          setCoursesCount(coursesSnap.size);
        }
      } catch (err) {
        console.error("Error fetching about page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [user, isTeacher, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================================
  // CASE 1: LOGGED IN TEACHER (Custom Teacher / Academy About Page)
  // =========================================================================
  if (user && isTeacher) {
    const config = teacherProfile?.homePageConfig || {};
    const isInstitution = teacherProfile?.type === 'institution';
    const displayName = teacherProfile?.displayName || user.displayName || 'আমাদের একাডেমি';
    const headline = teacherProfile?.headline || config.aboutHeadline || 'শ্রেষ্ঠ শিক্ষা ও উজ্জ্বল ভবিষ্যৎ গড়ার বিশ্বস্ত সঙ্গী';
    const bio = config.aboutBio || teacherProfile?.bio || 'ভর্তি প্রস্তুতি ও একাডেমিক সাফল্য অর্জনের জন্য নিবেদিতপ্রাণ একটি প্ল্যাটফর্ম। মানসম্মত লেকচার, নিয়মিত পরীক্ষা ও আন্তরিক মেন্টরশিপের মাধ্যমে শিক্ষার্থীদের স্বপ্ন পূরণে আমরা সর্বদা পাশে আছি।';
    const founderTitle = config.founderTitle || (isInstitution ? 'প্রতিষ্ঠাতা ও পরিচালক' : 'চিফ মেন্টর ও পরিচালক');
    const founderPhoto = config.aboutPhoto || teacherProfile?.profilePhoto || user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid;
    const teachersRoster = isInstitution ? (teacherProfile?.teachersRoster || []) : [];
    const galleryPhotos = (config.trustSliders && config.trustSliders.length > 0) ? config.trustSliders : [];

    const stats = config.aboutStats && config.aboutStats.length > 0 ? config.aboutStats : [
      { label: 'কোর্সসমূহ', value: `${coursesCount || 5}+` },
      { label: 'সক্রিয় শিক্ষার্থী', value: '১,২০০+' },
      { label: 'ডেইলি এক্সাম', value: '৫০০+' },
      { label: 'সন্তুষ্টি রেটিং', value: '৪.৯ ★' }
    ];

    return (
      <div className="min-h-screen pt-28 pb-20 bg-background text-foreground selection:bg-primary selection:text-white">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header Badge & Title */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>{isInstitution ? 'প্রতিষ্ঠান পরিচিতি' : 'শিক্ষক পরিচিতি'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-primary bg-clip-text text-transparent">
                {displayName}
              </span>-এর পরিচিতি ও লক্ষ্য
            </h1>

            <p className="text-foreground/75 text-base sm:text-lg leading-relaxed">
              {headline}
            </p>
          </div>

          {/* Founder / About Spotlight Card */}
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-foreground/[0.04] via-background to-foreground/[0.02] border border-foreground/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* Photo */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative group">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-orange-500/30 shadow-2xl group-hover:border-orange-500 transition-colors">
                    <img 
                      src={founderPhoto} 
                      alt={displayName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-orange-500 text-white p-2.5 rounded-2xl shadow-lg">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <div className="text-orange-500 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1">
                    {founderTitle}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                    {displayName}
                  </h2>
                </div>

                <p className="text-foreground/80 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                  {bio}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link 
                    href="/courses"
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>সকল কোর্স দেখুন</span>
                  </Link>

                  <Link 
                    href="/teacher-dashboard/home-builder"
                    className="px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-orange-500" />
                    <span>তথ্য কাস্টমাইজ করুন</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Stats Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats.map((stat: any, idx: number) => (
              <div key={idx} className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 shadow-sm hover:border-orange-500/30 transition-colors">
                <div className="text-3xl sm:text-4xl font-black text-orange-500 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Faculty / Instructors Roster (If any exists) */}
          {teachersRoster.length > 0 && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>ইন্সট্রাক্টর প্যানেল</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের অভিজ্ঞ শিক্ষকবৃন্দ</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachersRoster.map((teacher: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/40 transition-all shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10 flex-shrink-0">
                      <img 
                        src={teacher.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (teacher.name || idx)} 
                        alt={teacher.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{teacher.name || 'Instructor'}</h3>
                      <p className="text-xs text-orange-500 font-semibold">{teacher.role || teacher.subject || 'Faculty Member'}</p>
                      <p className="text-xs text-foreground/60 line-clamp-1 mt-0.5">{teacher.institution || 'SkyLearners Faculty'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campus Moments / Gallery */}
          {galleryPhotos.length > 0 && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>স্মরণীয় মুহূর্তগুলো</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের ক্লাসরুম ও সফলতার কিছু ছবি</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryPhotos.map((photoUrl: string, idx: number) => (
                  <div key={idx} className="h-56 rounded-2xl overflow-hidden border border-foreground/10 shadow-md group">
                    <img 
                      src={photoUrl} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-foreground/[0.03] border border-foreground/10 text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-foreground">যেকোনো তথ্যের জন্য যোগাযোগ করুন</h3>
            <p className="text-sm text-foreground/70">আমাদের সাপোর্ট টিম আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {config.contactPhone && (
                <a href={`tel:${config.contactPhone}`} className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-orange-500 hover:text-white border border-foreground/10 text-xs font-bold transition-colors flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> <span>{config.contactPhone}</span>
                </a>
              )}
              {config.contactWhatsapp && (
                <a href={`https://wa.me/${config.contactWhatsapp}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" /> <span>WhatsApp</span>
                </a>
              )}
              {config.contactEmail && (
                <a href={`mailto:${config.contactEmail}`} className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-orange-500 hover:text-white border border-foreground/10 text-xs font-bold transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> <span>{config.contactEmail}</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: GUEST / STUDENT (SkyLearners Platform Overview & Vision)
  // =========================================================================
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Platform Hero */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>SkyLearners LMS প্ল্যাটফর্ম সম্পর্কে</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            বাংলাদেশের শিক্ষা ব্যবস্থাকে <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">স্মার্ট ও সহজ</span> করার প্রয়াস
          </h1>

          <p className="text-foreground/75 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            স্কাই লার্নার্স (SkyLearners) এমন একটি আধুনিক এডুকেশন হাব—যেখানে দেশসেরা শিক্ষক, স্বনামধন্য কোচিং সেন্টার এবং হাজারো শিক্ষার্থী একই ছাদের নিচে যুক্ত হয়ে শিক্ষা গ্রহণ ও পরিচালনা করতে পারে।
          </p>
        </div>

        {/* Mission & Vision Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের মিশন (Mission)</h2>
            <p className="text-foreground/75 leading-relaxed text-sm sm:text-base">
              প্রত্যেক শিক্ষার্থীর হাতের নাগালে মানসম্মত শিক্ষা পৌঁছে দেওয়া এবং প্রতিটি শিক্ষক ও একাডেমিকে নিজস্ব ব্র্যান্ডেড ডিজিটাল একাডেমি পরিচালনার অত্যাধুনিক প্রযুক্তি ও টুলস প্রদান করা।
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-6">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">আমাদের ভিশন (Vision)</h2>
            <p className="text-foreground/75 leading-relaxed text-sm sm:text-base">
              বাংলাদেশের এক নম্বর অল-ইন-ওয়ান এডুকেটর ও লার্নার্স ইকোসিস্টেম তৈরি করা, যা একাডেমিক পরীক্ষা থেকে শুরু করে ক্যারিয়ার স্কিল পর্যন্ত প্রতিটি ধাপে সাফল্যের নিশ্চয়তা দেয়।
            </p>
          </div>
        </div>

        {/* Platform Live Stats */}
        <div className="py-12 px-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-primary mb-1">১০,০০০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">সক্রিয় শিক্ষার্থী</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-orange-500 mb-1">৫০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">ভেরিফাইড শিক্ষক ও কোচিং</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-purple-500 mb-1">১০০+</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">অনলাইন ও অফলাইন কোর্স</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-black text-emerald-500 mb-1">৯৯%</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70">ইতিবাচক ফিডব্যাক</div>
            </div>
          </div>
        </div>

        {/* Why SkyLearners Features */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">কেন স্কাই লার্নার্স সেরা?</h2>
            <p className="text-foreground/70 text-sm sm:text-base">আধুনিক প্রযুক্তির সমন্বয়ে আমাদের প্রতিটি ফিচারে রয়েছে শ্রেষ্ঠত্বের ছোঁয়া</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-background border border-foreground/10 hover:border-primary/40 transition-all shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">ইন্টারেক্টিভ লাইভ ও রেকর্ডেড ক্লাস</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">এইচডি কোয়ালিটি ভিডিও প্লেয়ার, রিয়েল-টাইম কমেন্ট ও ডাউট ক্লিয়ারিং সাপোর্ট।</p>
            </div>

            <div className="p-7 rounded-3xl bg-background border border-foreground/10 hover:border-orange-500/40 transition-all shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">ডেইলি এক্সাম ও ইনস্ট্যান্ট লিডারবোর্ড</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">বোর্ড ও এডমিশন স্টাইল কুইজ, নেগেটিভ মার্কিং এবং বিস্তারিত রেজাল্ট অ্যানালাইসিস।</p>
            </div>

            <div className="p-7 rounded-3xl bg-background border border-foreground/10 hover:border-purple-500/40 transition-all shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">শিক্ষকদের জন্য কাস্টম একাডেমি সাইট</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">প্রতিটি শিক্ষক পান নিজস্ব ব্র্যান্ডিং, হোম বিল্ডার, পেমেন্ট ও স্টুডেন্ট ম্যানেজমেন্ট হাব।</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-14 rounded-[2.5rem] bg-gradient-to-r from-primary via-indigo-950 to-orange-950 text-white text-center shadow-2xl relative overflow-hidden space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black">আজই আপনার যাত্রা শুরু করুন</h2>
            <p className="text-gray-200 text-sm sm:text-base">নতুন কিছু শিখুন অথবা একজন শিক্ষক হিসেবে আপনার একাডেমি গড়ে তুলুন।</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link 
                href="/courses"
                className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
              >
                কোর্স এক্সপ্লোর করুন
              </Link>
              <Link 
                href="/register"
                className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg hover:scale-105"
              >
                ফ্রি একাউন্ট খুলুন
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
