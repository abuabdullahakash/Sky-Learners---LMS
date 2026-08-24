"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, limit, getDocs } from 'firebase/firestore';
import { useLocale } from 'next-intl';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  User, 
  Users,
  GraduationCap, 
  Globe, 
  ExternalLink, 
  Video, 
  ShieldCheck, 
  Headphones, 
  Compass, 
  ArrowRight, 
  Loader2, 
  Edit2, 
  AlertCircle,
  MessagesSquare,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function ContactPageContent() {
  const locale = useLocale();
  const { user, userData, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const queryTeacherId = searchParams.get('teacherId');
  const isForcedMarketplace = searchParams.get('view') === 'marketplace';

  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
      if (stored && stored !== 'global') {
        setGuestTeacherId(stored);
      }
    }
  }, []);

  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';

  const preferredTeacherId = userData?.preferredTeacherId && userData.preferredTeacherId !== 'global' ? userData.preferredTeacherId : null;
  const activeTeacherId = isForcedMarketplace ? null : (isTeacher ? user?.uid : (preferredTeacherId || queryTeacherId || (!user ? guestTeacherId : null)));
  const isOwner = Boolean(user && isTeacher && user?.uid === activeTeacherId);

  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State (Starts completely clean and empty)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    level: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (authLoading) return;

    const fetchContactData = async () => {
      setLoading(true);
      try {
        if (activeTeacherId) {
          const docRef = doc(db, 'teacherProfiles', activeTeacherId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTeacherProfile(docSnap.data());
          } else {
            const userRef = doc(db, 'users', activeTeacherId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setTeacherProfile(userSnap.data());
            }
          }
        } else {
          // If in general context, fallback to primary available teacher profile
          const tpSnap = await getDocs(query(collection(db, 'teacherProfiles'), limit(1)));
          if (!tpSnap.empty) {
            setTeacherProfile(tpSnap.docs[0].data());
          } else {
            // Default placeholder profile
            setTeacherProfile({
              displayName: 'SkyLearners Academy',
              headline: 'দেশসেরা মেন্টরদের সাথে শতভাগ প্রস্তুতি',
              contactPhone: '01700000000',
              contactWhatsapp: '01700000000',
              contactEmail: 'support@skylearners.com',
              contactAddress: 'ফার্মগেট / মৌচাক শাখা, ঢাকা, বাংলাদেশ',
              contactOfficeHours: 'প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা'
            });
          }
        }
      } catch (err) {
        console.error("Error fetching contact page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [activeTeacherId, authLoading]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে নাম, ফোন নম্বর ও মেসেজ পূরণ করুন।' : 'Please fill in your name, phone, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiryPayload = {
        targetTeacherId: activeTeacherId || 'general',
        teacherName: teacherProfile?.displayName || teacherProfile?.academyName || 'Teacher Support',
        studentName: formData.name.trim(),
        studentPhone: formData.phone.trim(),
        studentEmail: formData.email.trim() || '',
        level: formData.level,
        category: formData.category,
        message: formData.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        senderUid: user?.uid || null
      };

      await addDoc(collection(db, 'teacher_inquiries'), inquiryPayload);
      setIsSuccessModalOpen(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        level: '',
        category: '',
        message: ''
      });
      toast.success(locale === 'bn' ? 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Your inquiry has been submitted successfully!');
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast.error(locale === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper variables for Teacher Mode
  const academyName = teacherProfile?.displayName || teacherProfile?.academyName || (locale === 'bn' ? 'আমাদের একাডেমি' : 'Our Academy');
  const headline = teacherProfile?.headline || (locale === 'bn' ? 'দেশসেরা মেন্টরদের সাথে শতভাগ প্রস্তুতি' : 'Top-tier mentorship & learning');
  const phone = teacherProfile?.contactPhone || teacherProfile?.helpBarPhone || teacherProfile?.phone || '01700000000';
  const rawWhatsapp = teacherProfile?.contactWhatsapp || teacherProfile?.whatsappNumber || phone;
  const whatsappClean = (rawWhatsapp || '').replace(/[^0-9]/g, '');
  const whatsappNumber = whatsappClean.startsWith('880') ? whatsappClean : (whatsappClean.startsWith('0') ? `88${whatsappClean}` : `880${whatsappClean}`);
  const email = teacherProfile?.contactEmail || teacherProfile?.email || 'support@skylearners.com';
  const address = teacherProfile?.contactAddress || teacherProfile?.address || (locale === 'bn' ? 'ফার্মগেট / মৌচাক শাখা, ঢাকা, বাংলাদেশ' : 'Farmgate / Mouchak Branch, Dhaka, Bangladesh');
  const officeHours = teacherProfile?.contactOfficeHours || (locale === 'bn' ? 'প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা' : 'Daily 9:00 AM — 10:00 PM');
  
  // Social channels
  const facebookPage = teacherProfile?.contactFacebookPage || teacherProfile?.facebookUrl || 'https://facebook.com';
  const facebookGroup = teacherProfile?.contactFacebookGroup || teacherProfile?.facebookGroupUrl || 'https://facebook.com/groups';
  const telegram = teacherProfile?.contactTelegram || teacherProfile?.telegramUrl || 'https://t.me';
  const youtube = teacherProfile?.contactYoutube || teacherProfile?.youtubeUrl || 'https://youtube.com';

  const defaultFaqs = [
    {
      id: 'faq-1',
      q: locale === 'bn' ? 'আমি কীভাবে পছন্দের কোর্সে ভর্তি নিশ্চিত করব?' : 'How do I enroll in a course?',
      a: locale === 'bn' 
        ? 'কোর্স পেজে গিয়ে পছন্দের কোর্সটি সিলেক্ট করে "এনরোল করুন" বাটনে চাপুন। এরপর বিকাশ, নগদ বা রকেটের মাধ্যমে কোর্স ফি পাঠিয়ে ট্রানজ্যাকশন আইডি (TrxID) সাবমিট করলেই কিছুক্ষণের মধ্যে ড্যাশবোর্ডে কোর্সটি আনলক হয়ে যাবে।'
        : 'Visit the Courses page, select your course, and click "Enroll". Pay via bKash/Nagad/Rocket, submit the TrxID, and your access will be approved shortly.'
    },
    {
      id: 'faq-2',
      q: locale === 'bn' ? 'পেমেন্ট সম্পন্ন করার পর কী করতে হবে?' : 'What should I do after completing payment?',
      a: locale === 'bn'
        ? 'পেমেন্ট সাবমিটের পর আপনার রিকোয়েস্টটি পেন্ডিং থাকবে। শিক্ষক বা অ্যাডমিন ভেরিফাই করে অ্যাপ্রুভ করার সাথে সাথে আপনার ড্যাশবোর্ডে সব ক্লাস, লেকচার শিট ও এক্সাম স্বয়ংক্রিয়ভাবে ওপেন হয়ে যাবে।'
        : 'After submitting the TrxID, your request will be reviewed. Once approved, all lectures, notes, and exams will unlock immediately on your dashboard.'
    },
    {
      id: 'faq-3',
      q: locale === 'bn' ? 'লাইভ ক্লাস মিস হলে পরবর্তীতে রেকর্ডেড ক্লাস পাওয়া যাবে কি?' : 'Can I watch recorded lectures if I miss a live class?',
      a: locale === 'bn'
        ? 'হ্যাঁ, অবশ্যই! প্রতিটি লাইভ ক্লাসের পর ফুল এইচডি রেকর্ডেড ভিডিও লেকচার স্টুডেন্ট ড্যাশবোর্ডের "রেকর্ডেড ক্লাসেস" সেকশনে যুক্ত হয়ে যায়, যা কোর্স ভ্যালিডিটি চলাকালীন যতবার ইচ্ছা রিভিশন দেওয়া যায়।'
        : 'Yes, absolutely! Every live class is recorded in Full HD and uploaded to your Recorded Classes tab, accessible anytime for revision.'
    },
    {
      id: 'faq-4',
      q: locale === 'bn' ? 'অফলাইন শিট ও দাগানো বই কীভাবে সংগ্রহ করব?' : 'How do I collect physical lecture sheets or books?',
      a: locale === 'bn'
        ? 'আমাদের অফলাইন ব্রাঞ্চে এসে সরাসরি লেকচার শিট সংগ্রহ করা যাবে অথবা ড্যাশবোর্ডের রিসোর্স সেকশন থেকে হাই-কোয়ালিটি PDF ডাউনলোড করে প্রিন্ট করে নিতে পারবেন।'
        : 'You can collect physical sheets from our branch or download printable high-resolution PDFs directly from the Resources tab.'
    },
    {
      id: 'faq-5',
      q: locale === 'bn' ? 'যেকোনো জরুরি প্রয়োজনে তাৎক্ষণিক সমাধান কীভাবে পাব?' : 'How can I get instant support for technical issues?',
      a: locale === 'bn'
        ? 'আমাদের সরাসরি হোয়াটসঅ্যাপ হেল্পলাইনে মেসেজ দিন অথবা এই পেজের ফর্মটি পূরণ করে পাঠান। আমাদের ডেডিকেটেড সাপোর্ট টিম দ্রুততম সময়ে সমাধান করে দেবে।'
        : 'Message our official WhatsApp hotline directly or submit the inquiry form above. Our support team will resolve it swiftly.'
    }
  ];

  // Dynamic Contact Page Config from Website Builder
  const ctConfig = teacherProfile?.contactPageConfig || {};
  const heroTag = ctConfig.heroTag || (activeTeacherId ? (locale === 'bn' ? `${academyName} • স্টুডেন্ট সাপোর্ট সেন্টার` : `${academyName} • Student Support Center`) : (locale === 'bn' ? 'SkyLearners প্ল্যাটফর্ম হেল্পডেস্ক' : 'SkyLearners Platform Helpdesk'));
  const heroTitle = ctConfig.heroTitle || (locale === 'bn' ? 'যেকোনো প্রয়োজনে আমরা আছি তোমার পাশে' : 'We are here to Support Your Journey');
  const heroSubtitle = ctConfig.heroSubtitle || headline;
  const badge1 = ctConfig.badge1 || (locale === 'bn' ? 'ইনস্ট্যান্ট হোয়াটসঅ্যাপ রিপ্লাই' : 'Instant WhatsApp Response');
  const badge2 = ctConfig.badge2 || (locale === 'bn' ? '২৪/৭ ডিরেক্ট কল সার্ভিস' : 'Direct Helpline Support');
  const responseTime = ctConfig.responseTime || (locale === 'bn' ? '৫ — ১৫ মিনিট' : '5 — 15 Minutes');
  const mapUrl = ctConfig.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const faqs = (ctConfig.faqs && Array.isArray(ctConfig.faqs) && ctConfig.faqs.length > 0) ? ctConfig.faqs : defaultFaqs;
  const ctaBadge = ctConfig.ctaBadge || (locale === 'bn' ? 'সাফল্যের সূচনা হোক আজই' : 'Start Your Journey');
  const ctaTitle = ctConfig.ctaTitle || (locale === 'bn' ? 'তোমার স্বপ্নের সেরা প্রস্তুতিতে আমরা আছি সাথে' : 'Prepare for Success with Top Mentors');
  const ctaSubtitle = ctConfig.ctaSubtitle || (locale === 'bn' ? 'লাইভ ক্লাস, নিয়মিত মডেল টেস্ট ও স্পেশালাইজড শিটের সাথে এখনই তোমার পছন্দের ব্যাচে যুক্ত হও।' : 'Enroll in our specialized batches with live classes, exams, and comprehensive materials.');
  const ctaBtn1Text = ctConfig.ctaBtn1Text || (locale === 'bn' ? 'সকল কোর্সসমূহ দেখুন' : 'Explore Courses');
  const ctaBtn2Text = ctConfig.ctaBtn2Text || (locale === 'bn' ? 'হেল্পলাইনে কল দিন' : 'Call Helpline');

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-foreground/60 animate-pulse">
          {locale === 'bn' ? 'যোগাযোগ পেজ লোড হচ্ছে...' : 'Loading contact details...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-orange-500 selection:text-white pt-24 pb-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Dynamic Gradient & Glowing Live Badges                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-14 border-b border-foreground/10 bg-gradient-to-b from-foreground/[0.02] via-background to-background">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-orange-500/10 dark:bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-500/10 dark:blue-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Owner Quick Edit Shortcut Button */}
          {isOwner && (
            <div className="mb-6 flex justify-end">
              <Link 
                href="/teacher-dashboard/home-builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs transition-all shadow-sm hover:scale-[1.02]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? '⚙️ যোগাযোগ তথ্য এডিট করুন (Website Builder)' : '⚙️ Edit Contact Info in Builder'}</span>
              </Link>
            </div>
          )}

          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs">
              <Headphones className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{heroTag}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-2xl mx-auto">
              {heroSubtitle}
            </p>

            {/* Floating Live Support Status Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs font-bold">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{badge1}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 shadow-xs">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>{badge2}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>{officeHours}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. QUICK ACTION CONTACT CARDS (4-Column Grid)                            */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Direct Hotline Call */}
          <div className="group p-6 rounded-3xl bg-background/90 dark:bg-card/90 backdrop-blur-md border border-foreground/10 hover:border-orange-500/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shadow-xs">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? '২৪/৭ হেল্পলাইন' : 'Helpline Support'}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{locale === 'bn' ? 'সরাসরি কথা বলতে কল করুন' : 'Call directly for support'}</p>
              </div>
              <p className="font-black text-lg text-orange-600 dark:text-orange-400 tracking-tight">{phone}</p>
            </div>
            <a 
              href={`tel:${phone}`}
              className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'সরাসরি কল দিন' : 'Call Now'}</span>
            </a>
          </div>

          {/* Card 2: Instant WhatsApp Chat */}
          <div className="group p-6 rounded-3xl bg-background/90 dark:bg-card/90 backdrop-blur-md border border-foreground/10 hover:border-emerald-500/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? 'হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support'}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{locale === 'bn' ? 'মেসেজ দিয়ে দ্রুত রিপ্লাই পান' : 'Fast chat on WhatsApp'}</p>
              </div>
              <p className="font-black text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">{rawWhatsapp}</p>
            </div>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`হ্যালো ${academyName}! আমি আপনার কোর্স সংক্রান্ত তথ্য জানতে যোগাযোগ করছি।`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'হোয়াটসঅ্যাপে চ্যাট' : 'Chat on WhatsApp'}</span>
            </a>
          </div>

          {/* Card 3: Official Email */}
          <div className="group p-6 rounded-3xl bg-background/90 dark:bg-card/90 backdrop-blur-md border border-foreground/10 hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Email Inquiry'}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{locale === 'bn' ? 'যেকোনো দাপ্তরিক বা কোর্স তথ্য' : 'Official communications'}</p>
              </div>
              <p className="font-bold text-sm text-blue-600 dark:text-blue-400 truncate" title={email}>{email}</p>
            </div>
            <a 
              href={`mailto:${email}?subject=Course Inquiry - ${academyName}`}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ইমেইল পাঠান' : 'Send Email'}</span>
            </a>
          </div>

          {/* Card 4: Physical Campus / Classroom */}
          <div className="group p-6 rounded-3xl bg-background/90 dark:bg-card/90 backdrop-blur-md border border-foreground/10 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? 'অফলাইন ক্লাসরুম' : 'Campus Location'}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{locale === 'bn' ? 'সরাসরি এসে ভর্তি ও কাউন্সেলিং' : 'Direct counseling & visit'}</p>
              </div>
              <p className="text-xs font-semibold text-foreground/80 line-clamp-2 leading-relaxed">{address}</p>
            </div>
            <a 
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{locale === 'bn' ? 'ম্যাপে লোকেশন দেখুন' : 'View on Map'}</span>
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: Interactive Inquiry Form & Campus Info                 */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Cols): Direct Query / Message Form */}
          <div className="lg:col-span-7 bg-background dark:bg-card border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full pointer-events-none" />
            
            <div className="mb-6 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-orange-500 uppercase tracking-wider">
                <Send className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'সরাসরি বার্তা পাঠান' : 'Direct Message'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {locale === 'bn' ? 'যেকোনো প্রশ্ন বা তথ্যের জন্য ফর্মটি পূরণ করুন' : 'Submit Your Query / Inquiry'}
              </h2>
              <p className="text-xs sm:text-sm text-foreground/60">
                {locale === 'bn' 
                  ? 'আপনার বিস্তারিত তথ্য ও প্রশ্ন লিখে সাবমিট করুন। আমাদের প্রতিনিধি খুব দ্রুত যোগাযোগ করবেন।' 
                  : 'Fill in your details below and our team will get in touch with you shortly.'}
              </p>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-4 sm:space-y-5">
              
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>{locale === 'bn' ? 'শিক্ষার্থীর নাম *' : 'Student Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={locale === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] dark:bg-slate-900/90 border border-foreground/15 dark:border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-foreground outline-none transition-all placeholder:text-foreground/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>{locale === 'bn' ? 'মোবাইল / WhatsApp নম্বর *' : 'Phone / WhatsApp Number *'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={locale === 'bn' ? 'যেমন: 017xxxxxxxx' : 'e.g. 017xxxxxxxx'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] dark:bg-slate-900/90 border border-foreground/15 dark:border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-foreground outline-none transition-all placeholder:text-foreground/40"
                  />
                </div>
              </div>

              {/* Row 2: Level/Batch & Query Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                    <span>{locale === 'bn' ? 'ক্লাস / ব্যাচ' : 'Class / Batch'}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-background dark:bg-slate-900/90 text-foreground border border-foreground/15 dark:border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium outline-none transition-all appearance-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                    >
                      <option value="" className="bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400 py-2 font-medium">
                        {locale === 'bn' ? '-- আপনার ক্লাস / ব্যাচ সিলেক্ট করুন --' : '-- Select Your Class / Batch --'}
                      </option>
                      <option value="HSC 2026" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">HSC 2026</option>
                      <option value="HSC 2025" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">HSC 2025</option>
                      <option value="Medical Admission" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Medical Admission</option>
                      <option value="Varsity 'Ka' Unit" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Varsity &apos;Ka&apos; Unit</option>
                      <option value="Engineering Special" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Engineering Special</option>
                      <option value="Class 9-10 (SSC)" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Class 9-10 (SSC)</option>
                      <option value="Class 6-8" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Class 6-8</option>
                      <option value="Honours / University" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">Honours / University</option>
                      <option value="অন্যান্য / Other" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">{locale === 'bn' ? 'অন্যান্য / Other' : 'Other'}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                    <span>{locale === 'bn' ? 'প্রশ্নের ধরন / বিষয়' : 'Query Topic'}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-background dark:bg-slate-900/90 text-foreground border border-foreground/15 dark:border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium outline-none transition-all appearance-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                    >
                      <option value="" className="bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400 py-2 font-medium">
                        {locale === 'bn' ? '-- বিষয় / ক্যাটাগরি সিলেক্ট করুন --' : '-- Select Query Topic --'}
                      </option>
                      <option value="ভর্তি ও ব্যাচ সংক্রান্ত তথ্য" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">
                        {locale === 'bn' ? 'ভর্তি ও ব্যাচ সংক্রান্ত তথ্য' : 'Admission & Batch Info'}
                      </option>
                      <option value="কোর্স অ্যাক্সেস ও টেকনিক্যাল হেল্প" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">
                        {locale === 'bn' ? 'কোর্স অ্যাক্সেস ও টেকনিক্যাল হেল্প' : 'Course Access & Tech Help'}
                      </option>
                      <option value="পেমেন্ট ও ট্রানজ্যাকশন সাপোর্ট" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">
                        {locale === 'bn' ? 'পেমেন্ট ও ট্রানজ্যাকশন সাপোর্ট' : 'Payment & Transaction Help'}
                      </option>
                      <option value="অফলাইন শিট ও ম্যাটেরিয়ালস" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">
                        {locale === 'bn' ? 'অফলাইন শিট ও ম্যাটেরিয়ালস' : 'Lecture Sheets & Materials'}
                      </option>
                      <option value="সাধারণ পরামর্শ ও কাউন্সেলিং" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-2 font-medium">
                        {locale === 'bn' ? 'সাধারণ পরামর্শ ও কাউন্সেলিং' : 'General Counseling & Inquiry'}
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                  <MessagesSquare className="w-3.5 h-3.5 text-orange-500" />
                  <span>{locale === 'bn' ? 'আপনার বিস্তারিত বার্তা / প্রশ্ন *' : 'Your Detailed Message *'}</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={locale === 'bn' ? 'এখানে আপনার প্রশ্ন বা বিষয়টি বিস্তারিতভাবে লিখুন...' : 'Write your questions or message in detail here...'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] dark:bg-slate-900/90 border border-foreground/15 dark:border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium text-foreground outline-none transition-all resize-none placeholder:text-foreground/40"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{locale === 'bn' ? 'বার্তা পাঠানো হচ্ছে...' : 'Sending Message...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{locale === 'bn' ? 'বার্তা পাঠান (Submit Query)' : 'Send Message'}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-foreground/50">
                🔒 {locale === 'bn' ? 'আপনার মোবাইল নম্বর ও তথ্য সম্পূর্ণ গোপনীয় থাকবে।' : 'Your contact information is strictly confidential.'}
              </p>

            </form>
          </div>

          {/* Right Column (5 Cols): Office Info, Schedule & VIP Community Channels */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Box 1: Support Working Schedule & Response Commitment */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 via-background to-amber-500/5 border border-orange-500/25 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? 'সাপোর্ট সময়সূচি' : 'Support Schedule'}</h3>
                  <p className="text-xs text-foreground/60">{locale === 'bn' ? 'নিয়মিত কাউন্সেলিং ও সহায়তা' : 'Daily assistance & guidance'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/80 border border-foreground/10">
                  <span className="font-bold text-foreground/70">{locale === 'bn' ? 'কল ও হোয়াটসঅ্যাপ:' : 'Call & WhatsApp:'}</span>
                  <span className="font-extrabold text-orange-600 dark:text-orange-400">{officeHours}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/80 border border-foreground/10">
                  <span className="font-bold text-foreground/70">{locale === 'bn' ? 'গড় রেসপন্স টাইম:' : 'Avg. Response Time:'}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{responseTime}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Campus Address & Google Maps Embed */}
            <div className="p-6 rounded-3xl bg-background dark:bg-card border border-foreground/10 shadow-lg space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">{locale === 'bn' ? 'প্রধান ক্যাম্পাস ও শাখা' : 'Main Branch Location'}</h3>
                  <p className="text-xs text-foreground/60">{address}</p>
                </div>
              </div>

              {/* Map Preview Banner */}
              <div className="w-full h-36 rounded-2xl bg-foreground/[0.04] border border-foreground/10 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-orange-500/10 pointer-events-none" />
                <MapPin className="w-8 h-8 text-orange-500 animate-bounce mb-1" />
                <p className="text-xs font-extrabold text-foreground line-clamp-1">{address}</p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 px-4 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
                >
                  <span>{locale === 'bn' ? 'Google Maps-এ ডিরেকশন' : 'Get Directions'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Box 3: VIP Community Social Channels */}
            <div className="p-6 rounded-3xl bg-background dark:bg-card border border-foreground/10 shadow-lg space-y-3">
              <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                <span>{locale === 'bn' ? 'অফিসিয়াল সোশ্যাল ও কমিউনিটি হাব' : 'Official Community Channels'}</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {facebookGroup && (
                  <a
                    href={facebookGroup}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-500/20 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'bn' ? 'ফেসবুক ভিআইপি গ্রুপ' : 'Facebook VIP'}</span>
                  </a>
                )}
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white border border-sky-500/20 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'bn' ? 'টেলিগ্রাম চ্যানেল' : 'Telegram Channel'}</span>
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/20 text-xs font-bold transition-all flex items-center gap-2 col-span-2 sm:col-span-1"
                  >
                    <Video className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'bn' ? 'ইউটিউব লেকচার' : 'YouTube Lectures'}</span>
                  </a>
                )}
                {facebookPage && (
                  <a
                    href={facebookPage}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-blue-700/10 hover:bg-blue-700 text-blue-700 hover:text-white border border-blue-600/20 text-xs font-bold transition-all flex items-center gap-2 col-span-2 sm:col-span-1"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'bn' ? 'অফিসিয়াল পেজ' : 'Official Page'}</span>
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FAQ ACCORDION SECTION: EdTech Student Standard Questions             */}
      {/* ========================================================================= */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Common Questions'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {locale === 'bn' ? 'ভর্তি ও কোর্স সংক্রান্ত সাধারণ প্রশ্নোত্তর' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 max-w-xl mx-auto">
            {locale === 'bn' ? 'শিক্ষার্থীদের সচরাচর যেসব প্রশ্ন থাকে, তার সহজ উত্তর এখানে দেওয়া হলো।' : 'Quick answers to common queries regarding courses and admission.'}
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq: any, index: number) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={faq.id || index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-foreground/[0.03] dark:bg-card border-orange-500/30 shadow-md' 
                    : 'bg-background hover:bg-foreground/[0.02] border-foreground/10'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-foreground/5 text-foreground/60'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-foreground/75 leading-relaxed border-t border-foreground/5 whitespace-pre-line">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HIGH-CONVERSION BOTTOM CTA BANNER                                     */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-slate-900 via-orange-950 to-indigo-950 text-white shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-black rounded-full uppercase tracking-wider border border-orange-500/30">
                {ctaBadge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                {ctaTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                {ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/30 hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>{ctaBtn1Text}</span>
              </Link>
              <a
                href={`tel:${phone}`}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>{ctaBtn2Text}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SUCCESS CONFIRMATION MODAL                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md bg-background dark:bg-card border border-foreground/15 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  {locale === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Inquiry Submitted!'}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
                  {locale === 'bn' 
                    ? `ধন্যবাদ! আপনার বার্তাটি ${academyName} সাপোর্ট টিমে জমা হয়েছে। আমরা শীঘ্রই আপনার মোবাইল নম্বরে যোগাযোগ করব।`
                    : `Thank you! Your message has been received by ${academyName} support team. We will contact you shortly.`}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/20"
                >
                  {locale === 'bn' ? 'ঠিক আছে (Close)' : 'Got it'}
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`হ্যালো! আমি এইমাত্র ওয়েবসাইটে একটি মেসেজ পাঠিয়েছি।`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? 'জরুরি হলে সরাসরি হোয়াটসঅ্যাপ করুন' : 'Instant WhatsApp Follow-up'}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-foreground/60 animate-pulse">
          Loading contact details...
        </p>
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
}
