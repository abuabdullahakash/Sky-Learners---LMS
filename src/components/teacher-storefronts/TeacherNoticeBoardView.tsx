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
  BookOpen
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
}

export default function TeacherNoticeBoardView({
  teacherName,
  teacherHeadline,
  teacherAvatar,
  teacherId,
  teacherPhone,
  teacherWhatsapp,
  firestoreNotices = []
}: TeacherNoticeBoardViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

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

  // Combine Firestore Live Posts (if any) with Institutional Notices
  const allNotices: NoticeItem[] = useMemo(() => {
    if (firestoreNotices.length > 0) {
      const mappedFirestore: NoticeItem[] = firestoreNotices.map((fn, idx) => ({
        id: fn.id || `fs_${idx}`,
        refNo: `FB/NOT-2026/${String(idx + 10).padStart(2, '0')}`,
        title: fn.title || 'অফিসিয়াল বিজ্ঞপ্তি',
        category: (fn.category as any) || 'general',
        categoryLabel: fn.category === 'exam' ? 'পরীক্ষা' : (fn.category === 'routine' ? 'রুটিন' : 'সাধারণ বিজ্ঞপ্তি'),
        date: fn.createdAt?.toDate ? fn.createdAt.toDate().toLocaleDateString('bn-BD') : 'সম্প্রতি',
        isPinned: Boolean(fn.isPinned),
        isUrgent: Boolean(fn.isUrgent),
        publishedBy: teacherName,
        content: fn.content || fn.description || '',
        hasAttachment: Boolean(fn.attachmentUrl || fn.pdfUrl),
        attachmentName: fn.attachmentName || 'Official-Notice-Document.pdf',
        attachmentSize: fn.attachmentSize || '১.২ মেগাবাইট'
      }));
      return [...mappedFirestore, ...defaultInstitutionalNotices];
    }
    return defaultInstitutionalNotices;
  }, [firestoreNotices, defaultInstitutionalNotices, teacherName]);

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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. URGENT BREAKING NOTICE TICKER (জরুরি স্ক্রোলিং নোটিশ বার) */}
      {pinnedNotice && (
        <div className="rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 p-3 flex items-center justify-between gap-3 shadow-md overflow-hidden relative backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-[11px] font-black uppercase shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>জরুরি বিজ্ঞপ্তি</span>
            </div>
            <p className="text-xs text-foreground font-semibold truncate hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedNotice(pinnedNotice)}>
              {pinnedNotice.refNo}: {pinnedNotice.title}
            </p>
          </div>
          <button
            onClick={() => setSelectedNotice(pinnedNotice)}
            className="text-[11px] font-extrabold text-primary hover:text-primary/80 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 shrink-0 transition-all flex items-center gap-1"
          >
            <span>বিস্তারিত</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUNNING HERO SECTION WITH IMAGE & OVERLAY GRADIENT                     */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-slate-950 text-white">
        
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop')`
          }}
        />

        {/* Multi-layer Gradient Color Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-purple-950/90 to-slate-950/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-purple-950/30" />
        
        {/* Decorative Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-6">
          
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{teacherName}&apos;s Official Notice Board</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-2xl bg-black/50 border border-purple-500/30 text-right backdrop-blur-md">
                <span className="text-[10px] text-purple-200 block font-medium">শিক্ষাবর্ষ</span>
                <span className="text-xs font-black text-amber-400 font-mono">২০২৬ সেশন (Active)</span>
              </div>
            </div>
          </div>

          {/* Main Hero Headline & Subtitle */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-snug drop-shadow-md">
              সকল ব্যাচের একাডেমিক নোটিশ ও অফিসিয়াল সার্কুলার
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
              {teacherName}-এর সকল অনলাইন ও অফলাইন ব্যাচের ক্লাস রুটিন, পরীক্ষার সময়সূচি, ফলাফল, ফি এবং জরুরি আপডেটসমূহ এখান থেকে সরাসরি সংগ্রহ করুন।
            </p>
          </div>

          {/* 4 Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">মোট সক্রিয় নোটিশ</span>
              <span className="text-sm font-black text-white font-mono">{allNotices.length}টি প্রকাশনা</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">সর্বশেষ আপডেট</span>
              <span className="text-sm font-black text-emerald-400 font-mono">আজ প্রকাশিত</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">ক্যাটারগরি ফিল্টার</span>
              <span className="text-sm font-black text-purple-300 font-mono">৬টি বিষয়ভিত্তিক</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">অনুমোদন স্ট্যাটাস</span>
              <span className="text-sm font-black text-amber-300 font-mono">১০০% ভেরিফাইড</span>
            </div>
          </div>

          {/* Search Bar & Reset Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নোটিশের শিরোনাম, স্মারক নম্বর (Ref No) বা বিষয় দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/30 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 transition-all shadow-inner backdrop-blur-md"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-5 py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-white text-xs font-bold transition-all border border-purple-500/40 w-full sm:w-auto text-center backdrop-blur-md"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border select-none ${
                    isActive
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 scale-105'
                      : 'bg-slate-900/70 border-purple-500/20 text-slate-200 hover:bg-slate-800/80 hover:text-white backdrop-blur-md'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : (cat.color || 'text-purple-300')}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* 3. FEATURED PINNED CIRCULAR CARD */}
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
                  <span>PDF ডাউনলোড ({pinnedNotice.attachmentSize})</span>
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

      {/* 4. NOTICES STREAM & ARCHIVE CARDS */}
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

      {/* 5. NOTICE ALERTS & WHATSAPP SUBSCRIPTION BOX */}
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
          {teacherWhatsapp ? (
            <a
              href={`https://wa.me/${teacherWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp নোটিশ গ্রুপে যুক্ত হোন</span>
            </a>
          ) : (
            <a
              href="#contact"
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary/30 hover:scale-105"
            >
              <Bell className="w-4 h-4" />
              <span>নোটিশ নোটিফিকেশন অন করুন</span>
            </a>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. NOTICE DETAILS INTERACTIVE MODAL (নোটিশ বিস্তারিত পপআপ)                 */}
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
                    <p className="font-bold text-xs text-foreground truncate">{selectedNotice.attachmentName}</p>
                    <p className="text-[10px] text-muted-foreground">পিডিএফ ডকুমেন্ট • সাইজ: {selectedNotice.attachmentSize}</p>
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
