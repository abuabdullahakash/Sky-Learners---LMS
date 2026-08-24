"use client";

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  Calendar, 
  Clock, 
  Search, 
  Sparkles, 
  MessageCircle, 
  Bell, 
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Pin,
  Filter,
  GraduationCap,
  ShieldCheck,
  Eye,
  FileCheck,
  Building2,
  Bookmark,
  Layers,
  BookOpen,
  ArrowRight,
  Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface NoticeItem {
  id: string;
  refNo: string;
  title: string;
  category: 'exam' | 'routine' | 'fees' | 'holiday' | 'urgent' | 'general';
  categoryLabel: string;
  date: string;
  isPinned?: boolean;
  isUrgent?: boolean;
  content: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
  publishedBy: string;
}

interface TeacherNoticeBoardViewProps {
  teacherName: string;
  teacherHeadline?: string;
  teacherAvatar?: string;
  teacherId: string;
  teacherPhone?: string;
  teacherWhatsapp?: string;
  firestoreNotices?: any[];
  pageConfig?: any;
}

export default function TeacherNoticeBoardView({
  teacherName,
  teacherHeadline,
  teacherAvatar,
  teacherId,
  teacherPhone,
  teacherWhatsapp,
  firestoreNotices = [],
  pageConfig = {}
}: TeacherNoticeBoardViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Dynamic values configured from Teacher Website Builder
  const heroHeading = pageConfig?.heroHeading || 'সকল ব্যাচের একাডেমিক নোটিশ ও অফিসিয়াল সার্কুলার';
  const heroSubtitle = pageConfig?.heroSubtitle || `${teacherName}, দেশজুড়ে সকল ব্যাচের ক্লাস রুটিন, পরীক্ষার সময়সূচি, ফলাফল, ফি এবং জরুরি আপডেটসমূহ নিয়মিত এখান থেকে প্রকাশ করা হয়।`;
  const heroTopBadge = pageConfig?.heroTopBadge || `${teacherName}'s Official Notice Hub`;
  const heroBgImage = pageConfig?.heroBgImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop';
  const sessionYear = pageConfig?.sessionYear || '২০২৬ সেশন (Active)';
  const effectiveWhatsapp = pageConfig?.noticeWhatsapp || teacherWhatsapp;
  const customUploadedNotices: NoticeItem[] = Array.isArray(pageConfig?.notices) ? pageConfig.notices : [];

  // Realistic Bangladeshi Institutional Notices tailored for Teacher Academy
  const defaultInstitutionalNotices: NoticeItem[] = useMemo(() => [
    {
      id: 'not_01',
      refNo: 'FB/NOT-2026/08-01',
      title: 'এইচএসসি ২০২৬ চূড়ান্ত মডেল টেস্ট ও স্পেশাল রিভিশন ক্লাসের সময়সূচি প্রকাশ',
      category: 'urgent',
      categoryLabel: 'জরুরি নোটিশ',
      date: '২৪ আগস্ট, ২০২৬',
      isPinned: true,
      isUrgent: true,
      publishedBy: teacherName,
      content: `এইচএসসি ২০২৬ শিক্ষাবর্ষের সকল শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১ সেপ্টেম্বর ২০২৬ থেকে আমাদের একাডেমির চূড়ান্ত মডেল টেস্ট ও স্পেশাল রিভিশন ক্লাস শুরু হতে যাচ্ছে। 

১. সকল শিক্ষার্থীকে নির্ধারিত সময়ে প্রবেশপত্র সংগ্রহ করার নির্দেশ দেওয়া হচ্ছে।
২. মডেল টেস্টের পূর্ণাঙ্গ রুটিন ও পরীক্ষার নিয়মাবলী নিচের সংযুক্ত পিডিএফ ফাইলে দেওয়া হলো।
৩. কোনো শিক্ষার্থী পরীক্ষায় অনুপস্থিত থাকলে তাকে পরবর্তীতে অতিরিক্ত ফি দিয়ে রি-টেস্টে বসতে হবে।`,
      hasAttachment: true,
      attachmentName: 'HSC-2026-Final-Model-Test-Routine.pdf',
      attachmentSize: '১.৪ মেগাবাইট'
    },
    {
      id: 'not_02',
      refNo: 'FB/NOT-2026/08-02',
      title: 'অনলাইন লাইভ ক্লাসের পরিবর্তিত সাপ্তাহিক রুটিন ও জুম লিংক সংক্রান্ত বিজ্ঞপ্তি',
      category: 'routine',
      categoryLabel: 'ক্লাস রুটিন',
      date: '২২ আগস্ট, ২০২৬',
      isPinned: true,
      publishedBy: teacherName,
      content: `শিক্ষার্থীদের সুবিধার্থে এবং লোডশেডিংয়ের সময় সমন্বয়ের জন্য আগামী শনিবার থেকে অনলাইন লাইভ ক্লাসের সময়ে সাময়িক পরিবর্তন আনা হয়েছে। 

প্রতি শনি, সোম ও বুধবার রাত ৮:৩০ মিনিটে এবং রবি ও মঙ্গলবার সন্ধ্যা ৭:০০ টায় নির্ধারিত জুম লিংকের মাধ্যমে ক্লাস পরিচালিত হবে। ক্লাস শুরুর ১৫ মিনিট আগে গ্রুপে পাসকোড প্রদান করা হবে।`,
      hasAttachment: true,
      attachmentName: 'Updated-Live-Class-Schedule.pdf',
      attachmentSize: '৮৫০ কিলোবাইট'
    },
    {
      id: 'not_03',
      refNo: 'FB/NOT-2026/08-03',
      title: 'সাপ্তাহিক অধ্যায়ভিত্তিক মেধা যাচাই পরীক্ষা ও স্কলারশিপ পুরস্কার বিতরণ',
      category: 'exam',
      categoryLabel: 'পরীক্ষা ও ফলাফল',
      date: '১৯ আগস্ট, ২০২৬',
      publishedBy: teacherName,
      content: `সকল ব্যাচের শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী শুক্রবার বিকাল ৩:০০ টায় অধ্যায়ভিত্তিক বিশেষ মেধা যাচাই পরীক্ষা অনুষ্ঠিত হবে। 

উক্ত পরীক্ষায় শীর্ষস্থান অর্জনকারী শিক্ষার্থীদের পরবর্তী মাসের টিউশন ফিতে ৫০% পর্যন্ত স্কলারশিপ ওয়েভার এবং আকর্ষণীয় গিফট হ্যাম্পার প্রদান করা হবে। সময়মতো পরীক্ষায় উপস্থিত থাকার জন্য বলা হলো।`,
      hasAttachment: true,
      attachmentName: 'Weekly-Scholarship-Exam-Guidelines.pdf',
      attachmentSize: '১.১ মেগাবাইট'
    },
    {
      id: 'not_04',
      refNo: 'FB/NOT-2026/08-04',
      title: 'সেপ্টেম্বর ২০২৬ সেশনের নতুন ব্যাচে ভর্তি ফি মওকুফ ও রেজিস্ট্রেশন শুরু',
      category: 'fees',
      categoryLabel: 'ফি ও ভর্তি',
      date: '১৫ আগস্ট, ২০২৬',
      publishedBy: teacherName,
      content: `নতুন সেশনের জন্য অগ্রিম রেজিস্ট্রেশন শুরু হয়েছে। ২৫ আগস্টের মধ্যে ভর্তি নিশ্চিত করলে ২০% বিশেষ ছাড় প্রযোজ্য হবে। 

বিকাশ/নগদ পেমেন্টের মাধ্যমে সরাসরি ওয়েবসাইট থেকে রেজিস্ট্রেশন সম্পন্ন করা যাবে। যেকোনো সহায়তার জন্য সরাসরি অফিসিয়াল নম্বরে যোগাযোগ করতে অনুরোধ করা হচ্ছে।`,
      hasAttachment: false
    },
    {
      id: 'not_05',
      refNo: 'FB/NOT-2026/08-05',
      title: 'পবিত্র জন্মাষ্টমী ও সাপ্তাহিক বন্ধ উপলক্ষে সকল ক্লাস বন্ধ সংক্রান্ত নোটিশ',
      category: 'holiday',
      categoryLabel: 'ছুটির বিজ্ঞপ্তি',
      date: '১২ আগস্ট, ২০২৬',
      publishedBy: teacherName,
      content: `সকল শিক্ষার্থী ও অভিভাবকদের সদয় অবগতির জন্য জানানো যাচ্ছে যে, সরকারি ছুটি উপলক্ষে আগামী রবিবার একাডেমির সকল অনলাইন ও অফলাইন ক্লাস বন্ধ থাকবে। 

পরবর্তী সোমবার থেকে যথারীতি রুটিন অনুযায়ী সকল ক্লাস পরিচালিত হবে। বন্ধের সময়ে পেন্ডিং বাড়ির কাজ ও রেকর্ডেড ক্লাস সম্পন্ন করতে পরামর্শ দেওয়া হলো।`,
      hasAttachment: false
    }
  ], [teacherName]);

  // Combine Custom Uploaded Notices + Firestore Live Posts + Institutional Notices
  const allNotices: NoticeItem[] = useMemo(() => {
    let combined: NoticeItem[] = [];

    if (customUploadedNotices.length > 0) {
      combined = [...customUploadedNotices];
    }

    if (firestoreNotices.length > 0) {
      const mappedFirestore: NoticeItem[] = firestoreNotices.map((fn, idx) => ({
        id: fn.id || `fs_${idx}`,
        refNo: fn.refNo || `FB/NOT-2026/${String(idx + 10).padStart(2, '0')}`,
        title: fn.title || 'অফিসিয়াল বিজ্ঞপ্তি',
        category: (fn.category as any) || 'general',
        categoryLabel: fn.category === 'exam' ? 'পরীক্ষা ও ফলাফল' : (fn.category === 'routine' ? 'ক্লাস রুটিন' : 'সাধারণ বিজ্ঞপ্তি'),
        date: fn.createdAt?.toDate ? fn.createdAt.toDate().toLocaleDateString('bn-BD') : 'সম্প্রতি',
        isPinned: Boolean(fn.isPinned),
        isUrgent: Boolean(fn.isUrgent),
        publishedBy: teacherName,
        content: fn.content || fn.description || '',
        hasAttachment: Boolean(fn.attachmentUrl || fn.pdfUrl),
        attachmentName: fn.attachmentName || 'Official-Notice-Document.pdf',
        attachmentSize: fn.attachmentSize || '১.২ মেগাবাইট',
        attachmentUrl: fn.attachmentUrl || fn.pdfUrl
      }));
      combined = [...combined, ...mappedFirestore];
    }

    if (combined.length === 0) {
      combined = defaultInstitutionalNotices;
    }

    return combined;
  }, [customUploadedNotices, firestoreNotices, defaultInstitutionalNotices, teacherName]);

  // Filter Notices by Category & Search
  const filteredNotices = useMemo(() => {
    return allNotices.filter((n) => {
      const matchCat = activeCategory === 'all' || n.category === activeCategory;
      const matchSearch = searchQuery.trim() === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allNotices, activeCategory, searchQuery]);

  const pinnedNotice = useMemo(() => allNotices.find(n => n.isPinned || n.isUrgent) || allNotices[0], [allNotices]);

  // Categories with live badge counts
  const categoryFilters = [
    { id: 'all', label: 'সকল নোটিশ', count: allNotices.length, icon: Bell },
    { id: 'urgent', label: 'জরুরি বিজ্ঞপ্তি', count: allNotices.filter(n => n.category === 'urgent' || n.isUrgent).length, icon: AlertCircle, color: 'text-rose-500' },
    { id: 'exam', label: 'পরীক্ষা ও ফলাফল', count: allNotices.filter(n => n.category === 'exam').length, icon: FileCheck, color: 'text-amber-500' },
    { id: 'routine', label: 'ক্লাস রুটিন', count: allNotices.filter(n => n.category === 'routine').length, icon: Calendar, color: 'text-purple-500' },
    { id: 'fees', label: 'ফি ও ভর্তি', count: allNotices.filter(n => n.category === 'fees').length, icon: ShieldCheck, color: 'text-emerald-500' },
    { id: 'holiday', label: 'ছুটির নোটিশ', count: allNotices.filter(n => n.category === 'holiday').length, icon: Clock, color: 'text-blue-500' },
  ];

  const handleDownloadNoticePDF = (notice: NoticeItem) => {
    toast.success(`"${notice.title}"-এর অফিসিয়াল পিডিএফ ডাউনলোড হচ্ছে...`, { icon: '📄' });
  };

  const handleShareNotice = (notice: NoticeItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/notice?ref=${notice.refNo}`;
    navigator.clipboard.writeText(`${notice.title}\n${shareUrl}`);
    toast.success('নোটিশের লিংক কপি করা হয়েছে!', { icon: '🔗' });
  };

  const handlePrintNotice = () => {
    window.print();
  };

  return (
    <div className="w-full bg-background text-foreground selection:bg-orange-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. 100% FULL-WIDTH TOP HERO BANNER (Exact Style Match with /about Hero)    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center justify-center border-b border-foreground/10 w-full">
        
        {/* Full Background Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-90"
          />
          {/* Smooth Gradient Overlay matching Site Theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/80 to-[#09090b]/40 sm:from-[#09090b]/95 sm:via-[#1c120c]/85 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        </div>

        {/* Centered Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Slogan, Headline & Action Buttons */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left text-white">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>{heroTopBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] drop-shadow-md">
                {heroHeading}
              </h1>

              <p className="text-white/90 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow">
                {heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#notices-section"
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>সকল নোটিশ দেখুন</span>
                </a>

                {pinnedNotice && (
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(pinnedNotice)}
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <span>সর্বশেষ সার্কুলার</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </button>
                )}
              </div>

              {/* 4 Quick Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 max-w-xl mx-auto lg:mx-0">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/60 block font-medium">মোট নোটিশ</span>
                  <span className="text-xs font-black text-white font-mono">{allNotices.length}টি প্রকাশনা</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/60 block font-medium">সর্বশেষ আপডেট</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">আজ প্রকাশিত</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/60 block font-medium">ক্যাটাগরি</span>
                  <span className="text-xs font-black text-amber-300 font-mono">৬টি ফিল্টার</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-white/60 block font-medium">শিক্ষাবর্ষ</span>
                  <span className="text-xs font-black text-orange-300 font-mono">{sessionYear}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Featured Interactive Notice Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div 
                onClick={() => pinnedNotice && setSelectedNotice(pinnedNotice)}
                className="w-full max-w-sm sm:max-w-md aspect-[16/10] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 hover:border-orange-400 shadow-2xl relative group cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              >
                <img 
                  src={heroBgImage} 
                  alt="Featured Notice" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
                
                {/* Subtle Gradient Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />

                {/* Centered Play / Notice Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300 ring-8 ring-white/30">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                </div>

                {/* Corner caption badge */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="text-[11px] font-black text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 truncate max-w-[80%]">
                    {pinnedNotice?.title || 'আমি শিখবো, আমি জিতবো'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-black/70 px-2 py-0.5 rounded-md">
                    {pinnedNotice?.refNo || 'NOTICE'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN NOTICES CONTENT AREA (Centered Container)                          */}
      {/* ========================================================================= */}
      <div id="notices-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Urgent Breaking Notice Ticker */}
        {(pageConfig?.tickerHeadline || pinnedNotice) && (
          <div className="rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 p-3 flex items-center justify-between gap-3 shadow-md overflow-hidden relative backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-[11px] font-black uppercase shrink-0">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>জরুরি বিজ্ঞপ্তি</span>
              </div>
              <p className="text-xs text-foreground font-semibold truncate hover:text-primary transition-colors cursor-pointer" onClick={() => pinnedNotice && setSelectedNotice(pinnedNotice)}>
                {pageConfig?.tickerRefNo ? `${pageConfig.tickerRefNo}: ` : (pinnedNotice ? `${pinnedNotice.refNo}: ` : '')}
                {pageConfig?.tickerHeadline || pinnedNotice?.title}
              </p>
            </div>
            {pinnedNotice && (
              <button
                onClick={() => setSelectedNotice(pinnedNotice)}
                className="text-[11px] font-extrabold text-primary hover:text-primary/80 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 shrink-0 transition-all flex items-center gap-1"
              >
                <span>বিস্তারিত</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Search Bar & Categories Toolbar */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নোটিশের শিরোনাম, স্মারক নম্বর (Ref No) বা কিওয়ার্ড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2.5 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-colors border border-border w-full sm:w-auto text-center"
            >
              রিসেট
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border select-none ${
                    isActive
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105'
                      : 'bg-background border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : (cat.color || 'text-primary')}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-primary-foreground/20 text-white' : 'bg-foreground/10 text-muted-foreground'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Pinned Circular Card */}
        {pinnedNotice && activeCategory === 'all' && !searchQuery && (
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-primary/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>পিনযুক্ত গুরুত্বপূর্ণ বিজ্ঞপ্তি</span>
                </span>
                <span className="text-xs text-primary font-mono bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                  {pinnedNotice.refNo}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{pinnedNotice.date}</span>
              </span>
            </div>

            <div className="space-y-2">
              <h3 
                onClick={() => setSelectedNotice(pinnedNotice)} 
                className="text-lg sm:text-xl font-black text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
              >
                {pinnedNotice.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {pinnedNotice.content}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNotice(pinnedNotice)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/30"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>সম্পূর্ণ নোটিশ পড়ুন</span>
                </button>

                {pinnedNotice.hasAttachment && (
                  <button
                    onClick={() => handleDownloadNoticePDF(pinnedNotice)}
                    className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>PDF ডাউনলোড ({pinnedNotice.attachmentSize || '১.২ MB'})</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleShareNotice(pinnedNotice)}
                className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground border border-border text-xs transition-colors"
                title="শেয়ার করুন"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Notices Stream List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>সকল সার্কুলার ও বিজ্ঞপ্তির তালিকা ({filteredNotices.length})</span>
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              সর্বশেষ আপডেট: <strong className="text-foreground">আজ</strong>
            </span>
          </div>

          {filteredNotices.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-foreground">কোনো নোটিশ পাওয়া যায়নি</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                আপনার অনুসন্ধান অনুযায়ী এই ক্যাটাগরিতে কোনো বিজ্ঞপ্তি নেই। অন্য কোনো কিওয়ার্ড বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all shadow-md"
              >
                সকল নোটিশ দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredNotices.map((notice) => {
                const isPinned = notice.isPinned || notice.isUrgent;
                return (
                  <div
                    key={notice.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 hover:shadow-xl space-y-3 relative group ${
                      isPinned
                        ? 'bg-card border-primary/40 hover:border-primary/70 shadow-md'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    {/* Notice Meta Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase ${
                          notice.category === 'urgent'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                            : (notice.category === 'exam'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                                : (notice.category === 'routine'
                                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                                    : 'bg-foreground/5 text-foreground border border-border'))
                        }`}>
                          {notice.categoryLabel}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono bg-foreground/5 px-2 py-0.5 rounded border border-border">
                          {notice.refNo}
                        </span>
                        {isPinned && (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-amber-500" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{notice.date}</span>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <div className="space-y-1.5">
                      <h4 
                        onClick={() => setSelectedNotice(notice)}
                        className="font-extrabold text-base text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
                      >
                        {notice.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedNotice(notice)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত দেখুন</span>
                        </button>

                        {notice.hasAttachment && (
                          <button
                            onClick={() => handleDownloadNoticePDF(notice)}
                            className="px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border text-xs font-medium flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShareNotice(notice)}
                          className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors border border-border"
                          title="লিংক শেয়ার করুন"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notice Alerts & WhatsApp Subscription Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-card to-purple-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-black uppercase">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>তাৎক্ষণিক নোটিশ আপডেট</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-foreground">
              ক্লাস ও পরীক্ষার নোটিশ সরাসরি WhatsApp-এ পেতে চান?
            </h4>
            <p className="text-xs text-muted-foreground max-w-xl">
              {teacherName}-এর অফিশিয়াল নোটিশ গ্রুপে যুক্ত থাকলে প্রতিটি সার্কুলার ও ক্লাসের জুম লিংক স্বয়ংক্রিয়ভাবে পেয়ে যাবেন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {effectiveWhatsapp ? (
              <a
                href={`https://wa.me/${effectiveWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp নোটিশ গ্রুপে যুক্ত হোন</span>
              </a>
            ) : (
              <a
                href="#notices-section"
                className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary/30 hover:scale-105"
              >
                <Bell className="w-4 h-4" />
                <span>নোটিশ নোটিফিকেশন অন করুন</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. NOTICE DETAILS INTERACTIVE MODAL (নোটিশ বিস্তারিত পপআপ)                 */}
      {/* ========================================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-card-foreground max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-black uppercase">
                    {selectedNotice.categoryLabel}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono bg-foreground/5 px-2 py-0.5 rounded border border-border">
                    {selectedNotice.refNo}
                  </span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-foreground pt-1">
                  {selectedNotice.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>প্রকাশের তারিখ: {selectedNotice.date}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Notice Body Content */}
            <div className="bg-background p-5 sm:p-6 rounded-2xl border border-border space-y-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
              {selectedNotice.content}
            </div>

            {/* Attachment Box (if any) */}
            {selectedNotice.hasAttachment && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{selectedNotice.attachmentName || 'Notice-Attachment.pdf'}</p>
                    <p className="text-[10px] text-muted-foreground">পিডিএফ ডকুমেন্ট • সাইজ: {selectedNotice.attachmentSize || '১.২ মেগাবাইট'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadNoticePDF(selectedNotice)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড করুন</span>
                </button>
              </div>
            )}

            {/* Official Signature & Authority Stamp Block */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground block font-medium">কর্তৃপক্ষ অনুমোদন</span>
                <span className="font-extrabold text-foreground flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{teacherName}</span>
                </span>
                <span className="text-[10px] text-primary font-semibold">{teacherHeadline || 'অফিসিয়াল ইনস্ট্রাক্টর'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintNotice}
                  className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs flex items-center gap-1.5 transition-colors border border-border"
                >
                  <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>প্রিন্ট করুন</span>
                </button>

                <button
                  onClick={() => handleShareNotice(selectedNotice)}
                  className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs flex items-center gap-1.5 transition-colors border border-border"
                >
                  <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>শেয়ার</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
