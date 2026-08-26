"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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
    (user && isTeacher) ||
    routeTeacherId || 
    (guestTeacherId && guestTeacherId !== 'global') ||
    (isStudent && preferredTeacherId && preferredTeacherId !== 'global')
  );

  const effectiveTeacherId = isForcedMarketplace
    ? null
    : (routeTeacherId || guestTeacherId || (isStudent && preferredTeacherId ? preferredTeacherId : (isTeacher ? user?.uid : null)));

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
    const headline = teacherData.headline || teacherData.bio || 'অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম।';
    const customNavs = (teacherData.customNavLinks || []).filter((c: any) => c.enabled !== false);
    const photo = teacherData.profilePhoto || teacherData.photoUrl || teacherData.logoUrl;

    const contactPhone = teacherData.contactPhone || teacherData.phone || '01700000000';
    const contactWhatsapp = teacherData.contactWhatsapp || teacherData.whatsapp || contactPhone;
    const contactEmail = teacherData.contactEmail || teacherData.email || 'support@skylearners.com';
    const contactAddress = teacherData.contactAddress || teacherData.address || 'অনলাইন একাডেমি, বাংলাদেশ';
    const contactOfficeHours = teacherData.contactOfficeHours || 'প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা';

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
                        {teacherData.headerTagline || 'অফিশিয়াল একাডেমি'}
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

            {/* 2. Teacher Quick Links */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xs shadow-orange-500/40" />
                <span>একাডেমি পেইজসমূহ</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>হোম (Home)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>কোর্সসমূহ (Courses)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>আমাদের সম্পর্কে (About)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                    <span>যোগাযোগ (Contact)</span>
                  </Link>
                </li>
                {customNavs.map((c: any) => (
                  <li key={c.id || c.slug}>
                    <Link href={c.slug} className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-orange-500 group-hover:scale-125 transition-all" />
                      <span>{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Learning & Resources */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-xs shadow-amber-500/40" />
                <span>কোর্স ক্যাটাগরি ও প্রস্তুতি</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/courses?type=paid" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>অনলাইন রেকর্ডেড ক্লাস</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses?type=paid" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>লাইভ ইন্টারঅ্যাক্টিভ ব্যাচ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses?type=free" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>ফ্রি ক্লাস ও ডেমো লেকচার</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover:bg-amber-500 group-hover:scale-125 transition-all" />
                    <span>ডেইলি এক্সাম ও সলভ শিট</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Direct Teacher Contact with Glass Icon Badges */}
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground mb-5 flex items-center gap-2.5 tracking-tight">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/40" />
                <span>সরাসরি যোগাযোগ</span>
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
              © {new Date().getFullYear()} <span className="text-foreground font-bold">{displayName}</span>. সর্বস্বত্ব সংরক্ষিত। Powered by <span className="font-bold text-orange-500">SkyLearners</span>.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">প্রাইভেসি পলিসি</Link>
              <span className="text-foreground/20">•</span>
              <Link href="/terms" className="hover:text-orange-500 transition-colors">শর্তাবলী</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // =========================================================================
  // CASE B: GLOBAL MARKETPLACE FOOTER (Category 1: Central Marketplace Footer)
  // =========================================================================
  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-foreground/10 pt-16 pb-8 mt-20 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="relative w-[180px] h-[50px] md:w-[240px] md:h-[60px] flex items-center justify-start">
                <Image src="/Skylearnars Academy logo.png" alt="Sky Learners Logo" fill className="object-contain object-left" priority />
              </div>
            </Link>
            <p className="text-foreground/70 leading-relaxed text-sm">
              {t('about')}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t('quickLinks')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {t('courses')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {t('aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t('legal')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">{t('contact')}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-foreground/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>123 Learning Street, Education City, 10001</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/70">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>support@skylearners.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/50 text-sm">
            © {new Date().getFullYear()} SkyLearners. {t('rights')}
          </p>
          <div className="flex items-center gap-6 text-sm text-foreground/50">
            <Link href="/privacy" className="hover:text-primary transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
