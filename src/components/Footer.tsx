"use client";

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { resolveTeacherBySlugOrId } from '@/lib/slug';
import { Mail, MapPin, Phone, MessageCircle, Clock, Globe, Sparkles, BookOpen, User } from 'lucide-react';
import Image from 'next/image';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const isBn = locale === 'bn';
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isForcedMarketplace = searchParams.get('view') === 'marketplace';
  const { user, userData } = useAuth();

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/teacher-dashboard') || pathname.startsWith('/admin');

  // Teacher Storefront Mode Detection
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || user?.email?.toLowerCase().trim() === 'abuabdullahakash@gmail.com' || Boolean(user?.email?.toLowerCase().includes('abuabdullahakash'));
  const isTeacher = isAdmin || userData?.role === 'teacher';
  const isStudent = !isAdmin && userData?.role === 'student';
  const preferredTeacherId = userData?.preferredTeacherId && userData.preferredTeacherId !== 'global' ? userData.preferredTeacherId : null;

  const [guestTeacherId, setGuestTeacherId] = useState<string | null>(null);
  const [teacherData, setTeacherData] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('referralTeacherId') || localStorage.getItem('referralTeacherId');
      if (stored && stored !== 'global') {
        setGuestTeacherId(stored);
      }
    }
  }, []);

  let routeTeacherId: string | null = null;
  if (pathname.includes('/teachers/')) {
    const parts = pathname.split('/teachers/');
    if (parts[1]) {
      routeTeacherId = parts[1].split('/')[0].split('#')[0].split('?')[0];
    }
  }

  const isTeacherStorefrontMode = !isForcedMarketplace && Boolean(
    routeTeacherId ||
    (user && isTeacher) ||
    (isStudent && preferredTeacherId && preferredTeacherId !== 'global') ||
    (!user && guestTeacherId && guestTeacherId !== 'global')
  );

  const effectiveTeacherId = isForcedMarketplace
    ? null
    : (routeTeacherId 
        ? routeTeacherId 
        : (isStudent 
            ? (preferredTeacherId && preferredTeacherId !== 'global' ? preferredTeacherId : null)
            : (isTeacher 
                ? user?.uid 
                : (!user && guestTeacherId && guestTeacherId !== 'global' ? guestTeacherId : null)
              )
          )
      );

  useEffect(() => {
    if (!effectiveTeacherId || !isTeacherStorefrontMode) {
      setTeacherData(null);
      return;
    }

    let isMounted = true;
    const fetchTeacher = async () => {
      try {
        const resolved = await resolveTeacherBySlugOrId(db, effectiveTeacherId);
        if (resolved && isMounted) {
          setTeacherData(resolved);
        } else {
          const docRef = doc(db, 'teacherProfiles', effectiveTeacherId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isMounted) {
            setTeacherData(docSnap.data());
          }
        }
      } catch (err) {
        console.error("Error loading teacher profile in footer:", err);
      }
    };

    fetchTeacher();

    return () => {
      isMounted = false;
    };
  }, [effectiveTeacherId, isTeacherStorefrontMode]);

  if (isDashboard) {
    return null;
  }

  // =========================================================================
  // CASE A: TEACHER STOREFRONT FOOTER (Category 2 & 3: Teacher Branded Liquid Footer)
  // =========================================================================
  if (isTeacherStorefrontMode && teacherData) {
    const displayName = teacherData.displayName || teacherData.academyName || 'Teacher Academy';
    const headline = teacherData.headline || teacherData.bio || (isBn ? 'অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম।' : 'A specialized learning platform for academic excellence and exam preparation.');
    const customNavs = (teacherData.customNavLinks || []).filter((c: any) => c.enabled !== false);
    const photo = teacherData.profilePhoto || teacherData.photoUrl || teacherData.logoUrl;

    const contactPhone = teacherData.contactPhone || teacherData.phone || '01700000000';
    const contactWhatsapp = teacherData.contactWhatsapp || teacherData.whatsapp || contactPhone;
    const contactEmail = teacherData.contactEmail || teacherData.email || 'support@skylearners.com';
    const contactAddress = teacherData.contactAddress || teacherData.address || (isBn ? 'অনলাইন একাডেমি, বাংলাদেশ' : 'Online Academy, Bangladesh');
    const contactOfficeHours = teacherData.contactOfficeHours || (isBn ? 'প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা' : 'Everyday 9:00 AM — 10:00 PM');

    return (
      <footer className="relative overflow-hidden pt-16 sm:pt-20 pb-10 mt-20 border-t border-foreground/10 bg-gradient-to-b from-foreground/[0.02] via-background/95 to-background backdrop-blur-2xl">
        {/* Soft Liquid Ambient Glowing Orbs */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-[300px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[450px] h-[300px] bg-amber-500/[0.08] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            
            {/* 1. Teacher Brand & Bio Card */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3.5 group">
                {teacherData.headerLogo || teacherData.logoUrl ? (
                  <div className="h-11 sm:h-12 w-auto max-w-[210px] flex items-center justify-start py-0.5">
                    <img 
                      src={teacherData.headerLogo || teacherData.logoUrl} 
                      alt={displayName} 
                      className="h-full w-auto max-h-12 max-w-[210px] object-contain object-left" 
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {photo ? (
                      <div className="relative w-13 h-13 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-md shadow-orange-500/20 shrink-0 bg-orange-500/10">
                        <img src={photo} alt={displayName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shadow-lg shadow-orange-500/25 text-lg shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h3 className="font-black text-lg leading-tight text-foreground group-hover:text-orange-500 transition-colors">
                        {displayName}
                      </h3>
                      <span className="text-[11px] font-bold text-orange-500">
                        {teacherData.headerTagline || (isBn ? 'অফিশিয়াল একাডেমি' : 'Official Academy')}
                      </span>
                    </div>
                  </div>
                )}
              </Link>

              <p className="text-foreground/75 text-xs sm:text-sm leading-relaxed line-clamp-3 font-medium">
                {headline}
              </p>

              {/* Social Channels - Modern Liquid Glass Capsules */}
              <div className="flex items-center gap-2.5 pt-2">
                {teacherData.socialFacebook && (
                  <a 
                    href={teacherData.socialFacebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-blue-500/25 hover:-translate-y-0.5"
                    title="Facebook Page / Group"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {teacherData.socialYoutube && (
                  <a 
                    href={teacherData.socialYoutube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-red-500/25 hover:-translate-y-0.5"
                    title="YouTube Channel"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${contactWhatsapp.replace(/[^\d+]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-emerald-500/25 hover:-translate-y-0.5"
                  title="Direct WhatsApp Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 2. Teacher Quick Links (Localized) */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/40" />
                <span>{isBn ? 'একাডেমি পেইজসমূহ' : 'Academy Pages'}</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'হোম' : 'Home'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'কোর্সসমূহ' : 'Courses'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'যোগাযোগ' : 'Contact'}</span>
                  </Link>
                </li>
                {customNavs.map((c: any) => {
                  const navLabel = isBn ? (c.nameBn || c.name || c.title) : (c.nameEn || c.name || c.title);
                  return (
                    <li key={c.id || c.slug}>
                      <Link href={c.slug} className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                        <span>{navLabel}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 3. Learning & Resources (Localized) */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-xs shadow-amber-500/40" />
                <span>{isBn ? 'কোর্স ক্যাটাগরি ও প্রস্তুতি' : 'Course Tracks & Prep'}</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/courses?type=paid" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'অনলাইন রেকর্ডেড ক্লাস' : 'Recorded Video Courses'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses?type=paid" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'লাইভ ইন্টারঅ্যাক্টিভ ব্যাচ' : 'Live Interactive Batches'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses?type=free" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'ফ্রি ক্লাস ও ডেমো লেকচার' : 'Free Demo Classes'}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>{isBn ? 'ডেইলি এক্সাম ও সলভ শিট' : 'Daily Exams & Solves'}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Direct Teacher Contact with Glass Icon Badges (Localized) */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/40" />
                <span>{isBn ? 'সরাসরি যোগাযোগ' : 'Direct Contact'}</span>
              </h4>
              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex items-start gap-3 text-foreground/75">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-snug">{contactAddress}</span>
                </li>
                <li className="flex items-center gap-3 text-foreground/75">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <a href={`tel:${contactPhone}`} className="hover:text-emerald-500 transition-colors font-semibold">
                    {contactPhone}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-foreground/75">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href={`mailto:${contactEmail}`} className="hover:text-blue-500 transition-colors truncate font-semibold">
                    {contactEmail}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-foreground/75">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">{contactOfficeHours}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar with Teacher Academy Copyright & Legal Links */}
          <div className="pt-8 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-foreground/60">
            <p>
              © {new Date().getFullYear()} <span className="text-foreground font-bold">{displayName}</span>. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'} Powered by <span className="font-bold text-orange-500">SkyLearners</span>.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                {isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
              </Link>
              <span className="text-foreground/20">•</span>
              <Link href="/terms" className="hover:text-orange-500 transition-colors">
                {isBn ? 'শর্তাবলী' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // =========================================================================
  // CASE B: GLOBAL MARKETPLACE FOOTER (Category 1: Central Marketplace Liquid Footer)
  // =========================================================================
  return (
    <footer className="relative overflow-hidden pt-16 sm:pt-20 pb-10 mt-20 border-t border-foreground/[0.08] dark:border-white/[0.08] bg-gradient-to-b from-background/90 via-background/95 to-background dark:from-[#070b14]/90 dark:via-[#05080f]/95 dark:to-[#020408] backdrop-blur-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.35)]">
      {/* Top subtle liquid accent highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none" />

      {/* Decorative Soft Liquid Ambient Glowing Orbs */}
      <div className="absolute -top-28 left-1/4 w-[500px] h-[320px] bg-orange-500/10 dark:bg-orange-500/[0.08] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[300px] bg-amber-500/[0.08] dark:bg-amber-500/[0.06] blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
          
          {/* 1. Brand Logo, Mission & Animated Social Capsules */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative w-[170px] h-[46px] sm:w-[200px] sm:h-[52px] md:w-[220px] md:h-[56px] flex items-center justify-start">
                <Image src="/Skylearnars Academy logo.png" alt="Sky Learners Logo" fill className="object-contain object-left" priority />
              </div>
            </Link>

            <p className="text-foreground/75 text-xs sm:text-sm leading-relaxed font-medium">
              {t('about') || (isBn ? 'দেশের শীর্ষ শিক্ষক ও মানসম্মত কোচিং সেন্টারের সেরা একাডেমিক ও দক্ষতা উন্নয়ন কোর্সসমূহ।' : 'Nationwide top educators and coaching centers for academic excellence and skill mastery.')}
            </p>

            {/* Social Media Channels - Animated Liquid Glass Capsules */}
            <div className="flex items-center gap-2.5 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 hover:scale-110 active:scale-95"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4 transition-transform duration-300" />
              </a>

              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-2xl bg-foreground/[0.05] text-foreground/80 hover:bg-foreground hover:text-background border border-foreground/10 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:scale-110 active:scale-95"
                title="X / Twitter"
              >
                <TwitterIcon className="w-4 h-4 transition-transform duration-300" />
              </a>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 text-rose-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-500 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-1 hover:scale-110 active:scale-95"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4 transition-transform duration-300" />
              </a>

              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 flex items-center justify-center transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 hover:scale-110 active:scale-95"
                title="YouTube"
              >
                <YoutubeIcon className="w-4 h-4 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links (Liquid Hover Items) */}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/40" />
              <span>{t('quickLinks') || (isBn ? 'প্রয়োজনীয় লিংক' : 'Quick Links')}</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{t('home') || (isBn ? 'হোম' : 'Home')}</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{t('courses') || (isBn ? 'সকল কোর্স' : 'All Courses')}</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{t('aboutUs') || (isBn ? 'আমাদের সম্পর্কে' : 'About Us')}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{isBn ? 'যোগাযোগ' : 'Contact Support'}</span>
                </Link>
              </li>
              <li>
                <Link href="/onboarding?role=teacher" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{isBn ? 'শিক্ষক হিসেবে যুক্ত হোন' : 'Become an Instructor'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Legal & Guidelines */}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/40" />
              <span>{t('legal') || (isBn ? 'নীতিমালা ও শর্তাবলী' : 'Legal & Policies')}</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/privacy" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{t('privacy') || (isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy')}</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{t('terms') || (isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service')}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/75 hover:text-orange-500 transition-colors flex items-center gap-2.5 group py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-150 transition-all duration-200" />
                  <span>{isBn ? 'হেল্প ও এফএকিউ' : 'FAQ & Help Center'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact Info with Interactive Liquid Badges */}
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/40" />
              <span>{t('contact') || (isBn ? 'যোগাযোগ' : 'Contact Us')}</span>
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm font-medium">
              <li className="flex items-start gap-3 text-foreground/80 group">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1.5 leading-relaxed font-medium">
                  {isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
                </span>
              </li>

              <li className="flex items-center gap-3 text-foreground/80 group">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <a href="tel:+8801700000000" className="hover:text-orange-500 transition-colors font-medium">
                  +880 1700-000000
                </a>
              </li>

              <li className="flex items-center gap-3 text-foreground/80 group">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <a href="mailto:support@skylearners.com" className="hover:text-orange-500 transition-colors font-medium truncate">
                  support@skylearners.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Trust Bar */}
        <div className="pt-8 border-t border-foreground/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-foreground/60">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <span className="font-bold text-foreground">SkyLearners</span>. {t('rights') || (isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.')}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              {t('privacy') || (isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy')}
            </Link>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              {t('terms') || (isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
