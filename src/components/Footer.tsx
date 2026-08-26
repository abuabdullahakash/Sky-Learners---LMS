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
  // CASE A: TEACHER STOREFRONT FOOTER (Category 2 & 3: Teacher Branded Footer)
  // =========================================================================
  if (isTeacherStorefrontMode && teacherData) {
    const displayName = teacherData.displayName || teacherData.academyName || 'Teacher Academy';
    const headline = teacherData.headline || teacherData.bio || 'অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম।';
    const customNavs = (teacherData.customNavLinks || []).filter((c: any) => c.enabled !== false);
    const photo = teacherData.profilePhoto || teacherData.photoUrl || teacherData.logoUrl;

    const contactPhone = teacherData.contactPhone || teacherData.phone || '01700000000';
    const contactWhatsapp = teacherData.contactWhatsapp || teacherData.whatsapp || contactPhone;
    const contactEmail = teacherData.contactEmail || teacherData.email || 'support@skylearners.com';
    const contactAddress = teacherData.contactAddress || teacherData.address || 'ঢাকা, বাংলাদেশ';
    const contactOfficeHours = teacherData.contactOfficeHours || 'প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা';

    return (
      <footer className="bg-background/90 backdrop-blur-md border-t border-foreground/10 pt-16 pb-8 mt-20 relative overflow-hidden">
        {/* Glowing Orbs matching teacher theme */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-[1280px] mx-auto w-full px-[15px] md:px-[20px] lg:px-[30px] relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-12">
            
            {/* 1. Teacher Brand & Bio */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                {photo ? (
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-md shadow-orange-500/20 shrink-0">
                    <img src={photo} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shadow-lg shadow-orange-500/20 text-lg shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-lg leading-tight text-foreground group-hover:text-orange-500 transition-colors">
                    {displayName}
                  </h3>
                  <span className="text-xs font-bold text-orange-500">
                    অফিশিয়াল একাডেমি
                  </span>
                </div>
              </Link>

              <p className="text-foreground/70 text-sm leading-relaxed line-clamp-3">
                {headline}
              </p>

              {/* Social Channels */}
              <div className="flex items-center gap-3 pt-2">
                {teacherData.socialFacebook && (
                  <a href={teacherData.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {teacherData.socialYoutube && (
                  <a href={teacherData.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                <a href={`https://wa.me/${contactWhatsapp.replace(/[^\d+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 2. Teacher Quick Links */}
            <div>
              <h4 className="font-bold text-base text-foreground mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>একাডেমি পেইজসমূহ</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-orange-500 transition-colors" />
                    <span>হোম (Home)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-orange-500 transition-colors" />
                    <span>কোর্সসমূহ (Courses)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-orange-500 transition-colors" />
                    <span>আমাদের সম্পর্কে (About)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-orange-500 transition-colors" />
                    <span>যোগাযোগ (Contact)</span>
                  </Link>
                </li>
                {customNavs.map((c: any) => (
                  <li key={c.id || c.slug}>
                    <Link href={c.slug} className="text-foreground/70 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-orange-500 transition-colors" />
                      <span>{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Learning & Resources */}
            <div>
              <h4 className="font-bold text-base text-foreground mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>কোর্স ক্যাটাগরি ও প্রস্তুতি</span>
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-amber-500 transition-colors" />
                    <span>অনলাইন রেকর্ডেড ক্লাস</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-amber-500 transition-colors" />
                    <span>লাইভ ইন্টারঅ্যাক্টিভ ব্যাচ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-foreground/70 hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-amber-500 transition-colors" />
                    <span>ডেইলি এক্সাম ও সলভ শিট</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Direct Teacher Contact */}
            <div>
              <h4 className="font-bold text-base text-foreground mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>সরাসরি যোগাযোগ</span>
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5 text-foreground/70">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-1" />
                  <span>{contactAddress}</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/70">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{contactPhone}</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/70">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground/70">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs">{contactOfficeHours}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar with Teacher Academy Copyright */}
          <div className="pt-6 border-t border-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/50">
            <p>
              © {new Date().getFullYear()} {displayName}. সর্বস্বত্ব সংরক্ষিত। Powered by SkyLearners.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">প্রাইভেসি পলিসি</Link>
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
