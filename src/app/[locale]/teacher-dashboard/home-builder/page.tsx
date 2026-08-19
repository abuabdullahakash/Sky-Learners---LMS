"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { 
  Sparkles, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sliders,
  BookOpen,
  Grid,
  Info,
  Phone,
  HelpCircle,
  Award,
  Video,
  FileText,
  Users,
  Compass,
  Trophy,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherHomePageBuilderPage() {
  const { user } = useAuth();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [activeTab, setActiveTab] = useState<
    'sliders' | 'quickCards' | 'categories' | 'features' | 'admission' | 'about' | 'contact' | 'trustBanner' | 'gallery' | 'helpBar'
  >('sliders');

  // 1. Sliders State
  const [heroSliders, setHeroSliders] = useState<
    Array<{ id: string; imageUrl: string; targetCourseId: string; title?: string }>
  >([
    {
      id: 'slide-1',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      targetCourseId: '',
      title: 'HSC & Admission Special Batch'
    }
  ]);
  const [uploadingSlideImg, setUploadingSlideImg] = useState(false);

  // 2. Quick Cards State
  const [quickCards, setQuickCards] = useState({
    paidTitle: 'পেইড কোর্সসমূহ',
    paidSubtitle: 'ভর্তি চলছে এমন সকল প্রিমিয়াম ব্যাচ ও লাইভ কোর্স দেখুন',
    freeTitle: 'ফ্রি কোর্স ও ডেমো',
    freeSubtitle: 'ফ্রি স্পেশাল ক্লাস ও ডেমো লেকচার দেখে প্রস্তুতি শুরু করুন',
    freeLink: '#courses'
  });

  // 3. Custom Categories & Course Section Subtitle
  const [coursesSubtitle, setCoursesSubtitle] = useState('সেরা মেন্টরদের সাথে ঘরে বসেই নাও শতভাগ প্রস্তুতি। সঠিক গাইডলাইনে নিশ্চিত করো তোমার সাফল্য।');
  const [customCategories, setCustomCategories] = useState<string[]>([
    'সকল কোর্স',
    'এইচএসসি সাইকেল',
    'মেডিকেল এডমিশন',
    'ভার্সিটি ক ইউনিট',
    'ইঞ্জিনিয়ারিং স্পেশাল'
  ]);
  const [newCatInput, setNewCatInput] = useState('');

  // 4. Feature Cards State ("যা যা প্রয়োজন")
  const [featuresTitle, setFeaturesTitle] = useState('একজন শিক্ষার্থীর পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন');
  const [featuresSubtitle, setFeaturesSubtitle] = useState('আমাদের প্রতিটি কোর্সে সেরা প্রস্তুতির জন্য রয়েছে সমন্বিত ফিচারসমূহ');
  const [featureCards, setFeatureCards] = useState<
    Array<{ id: string; icon: string; title: string; desc: string }>
  >([
    { id: 'f-1', icon: 'Video', title: 'ইন্টারঅ্যাক্টিভ লাইভ ক্লাস', desc: 'টপ টিচারদের সরাসরি ক্লাস ও রিয়েলটাইম ডাউট সলভিং' },
    { id: 'f-2', icon: 'FileText', title: 'ডেইলি ও উইকলি এক্সাম', desc: 'প্রতিদিনের ক্লাসের পর স্ট্যান্ডার্ড এমসিকিউ ও সিকিউ পরীক্ষা' },
    { id: 'f-3', icon: 'Trophy', title: 'ইনস্ট্যান্ট লিডারবোর্ড', desc: 'পরীক্ষা শেষেই পূর্ণাঙ্গ ফলাফল, র‍্যাংক ও ব্যাখ্যা' },
    { id: 'f-4', icon: 'BookOpen', title: 'ক্লাস নোট ও প্র্যাকটিস শিট', desc: 'প্রতিটি অধ্যায়ের গোছানো লেকচার নোট ও দাগানো বই' },
    { id: 'f-5', icon: 'Users', title: 'ডেডিকেটেড ডাউট সল্ভিং', desc: 'যেকোনো প্রশ্নে মেন্টরদের সরাসরি সহায়তা ও আলোচনা' }
  ]);

  // 5. Admission Info State ("ভর্তি তথ্য")
  const [admissionTitle, setAdmissionTitle] = useState('ভর্তি তথ্য এখন এক জায়গায়');
  const [admissionSubtitle, setAdmissionSubtitle] = useState('সহজ কয়েকটি ধাপে কোর্সে ভর্তি সম্পন্ন করুন');
  const [admissionSteps, setAdmissionSteps] = useState<
    Array<{ id: string; stepNumber: number; title: string; desc: string }>
  >([
    { id: 's-1', stepNumber: 1, title: 'কোর্স নির্বাচন করুন', desc: 'আপনার ক্লাসের জন্য সঠিক কোর্সটি সিলেক্ট করে এনরোল বাটনে চাপুন।' },
    { id: 's-2', stepNumber: 2, title: 'পেমেন্ট সম্পন্ন করুন', desc: 'বিকাশ, নগদ বা কার্ডের মাধ্যমে ফি পরিশোধ করুন।' },
    { id: 's-3', stepNumber: 3, title: 'ক্লাস ও এক্সামে যুক্ত হোন', desc: 'ড্যাশবোর্ড থেকে তাৎক্ষণিক লাইভ ক্লাস ও এক্সামে অংশগ্রহণ করুন।' }
  ]);
  const [admissionNotice, setAdmissionNotice] = useState('যেকোনো প্রয়োজনে আমাদের সাপোর্ট হেল্পলাইনে সরাসরি কল করতে পারেন।');

  // 6. About Section State ("আমাদের সম্পর্কে")
  const [aboutTitle, setAboutTitle] = useState('আমাদের সম্পর্কে');
  const [aboutHeadline, setAboutHeadline] = useState('স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছি আমরা');
  const [founderTitle, setFounderTitle] = useState('প্রতিষ্ঠাতা ও পরিচালক');
  const [aboutBio, setAboutBio] = useState(
    'আমাদের লক্ষ্য প্রতিটি শিক্ষার্থীকে কনসেপ্ট ক্লিয়ার করে মুখস্থবিদ্যার বাইরে গিয়ে বাস্তবসম্মতভাবে পড়ানো। অভিজ্ঞ মেন্টর ও উন্নত প্রযুক্তির সমন্বয়ে আমরা তৈরি করেছি সেরা প্ল্যাটফর্ম।'
  );
  const [aboutStats, setAboutStats] = useState<Array<{ id: string; label: string; value: string }>>([
    { id: 'st-1', label: 'Courses', value: '10+' },
    { id: 'st-2', label: 'Exams', value: '10K+' },
    { id: 'st-3', label: 'Students', value: '100K+' }
  ]);

  // 7. Contact Section State & Social Channels ("আমাদের সাথে যোগাযোগ করো")
  const [contactTitle, setContactTitle] = useState('আমাদের সাথে যোগাযোগ করো');
  const [contactPhone, setContactPhone] = useState('01700000000');
  const [contactWhatsapp, setContactWhatsapp] = useState('01700000000');
  const [contactEmail, setContactEmail] = useState('support@academy.com');
  const [contactFacebookPage, setContactFacebookPage] = useState('https://facebook.com');
  const [contactFacebookGroup, setContactFacebookGroup] = useState('https://facebook.com/groups');
  const [contactYoutube, setContactYoutube] = useState('https://youtube.com');
  const [contactTelegram, setContactTelegram] = useState('https://t.me');

  // 8. Trust Banner State (with Corner Student Image)
  const [trustTitle, setTrustTitle] = useState('বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতিতে');
  const [trustSubtitle, setTrustSubtitle] = useState('ভর্তি প্রস্তুতির শুরু হোক আজ থেকেই। সঠিক দিকনির্দেশনা ও প্রয়োজনীয় রিসোর্সের সাথে এগিয়ে যাও তোমার লক্ষ্যের দিকে।');
  const [trustPaidBtnText, setTrustPaidBtnText] = useState('পেইড কোর্স');
  const [trustFreeBtnText, setTrustFreeBtnText] = useState('ফ্রি কোর্স');
  const [trustFreeLink, setTrustFreeLink] = useState('#courses');
  const [trustCornerImage, setTrustCornerImage] = useState('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop');
  const [uploadingTrustImg, setUploadingTrustImg] = useState(false);

  // 9. Photo Gallery State ("সাফল্যের পথে এগিয়ে চলেছে")
  const [galleryTitle, setGalleryTitle] = useState('আমাদের হাত ধরে সাফল্যের পথে এগিয়ে চলেছে');
  const [gallerySubtitle, setGallerySubtitle] = useState('আমাদের শিক্ষার্থীদের অর্জন ও স্মরণীয় মুহূর্তগুলো');
  const [galleryPhotos, setGalleryPhotos] = useState<Array<{ id: string; imageUrl: string; caption?: string }>>([
    { id: 'g-1', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-2', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-3', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-4', imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-5', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
    { id: 'g-6', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop' }
  ]);
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);

  // 10. Help Bar State
  const [helpBarTitle, setHelpBarTitle] = useState('সাহায্যের প্রয়োজন?');
  const [helpBarPhone, setHelpBarPhone] = useState('01700000000');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      try {
        // Fetch courses for dropdown
        const coursesRef = collection(db, 'courses');
        const qCourses = query(coursesRef, where('teacherId', '==', user.uid));
        const coursesSnap = await getDocs(qCourses);
        const courseList: { id: string; title: string }[] = [];
        coursesSnap.forEach(d => {
          courseList.push({ id: d.id, title: d.data().title || 'Untitled Course' });
        });
        setCourses(courseList);

        // Fetch existing home page config
        const profileRef = doc(db, 'teacherProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          const config = data.homePageConfig;
          if (config) {
            if (config.heroSliders && config.heroSliders.length > 0) setHeroSliders(config.heroSliders);
            if (config.quickCards) setQuickCards(config.quickCards);
            if (config.coursesSubtitle) setCoursesSubtitle(config.coursesSubtitle);
            if (config.customCategories && config.customCategories.length > 0) setCustomCategories(config.customCategories);
            if (config.featureCards && config.featureCards.length > 0) setFeatureCards(config.featureCards);
            if (config.featuresTitle) setFeaturesTitle(config.featuresTitle);
            if (config.featuresSubtitle) setFeaturesSubtitle(config.featuresSubtitle);
            if (config.admissionSteps && config.admissionSteps.length > 0) setAdmissionSteps(config.admissionSteps);
            if (config.admissionTitle) setAdmissionTitle(config.admissionTitle);
            if (config.admissionSubtitle) setAdmissionSubtitle(config.admissionSubtitle);
            if (config.admissionNotice) setAdmissionNotice(config.admissionNotice);
            if (config.aboutTitle) setAboutTitle(config.aboutTitle);
            if (config.aboutHeadline) setAboutHeadline(config.aboutHeadline);
            if (config.founderTitle) setFounderTitle(config.founderTitle);
            if (config.aboutBio) setAboutBio(config.aboutBio);
            if (config.aboutStats && config.aboutStats.length > 0) setAboutStats(config.aboutStats);
            if (config.contactTitle) setContactTitle(config.contactTitle);
            if (config.contactPhone) setContactPhone(config.contactPhone);
            if (config.contactWhatsapp) setContactWhatsapp(config.contactWhatsapp);
            if (config.contactEmail) setContactEmail(config.contactEmail);
            if (config.contactFacebookPage) setContactFacebookPage(config.contactFacebookPage);
            if (config.contactFacebookGroup) setContactFacebookGroup(config.contactFacebookGroup);
            if (config.contactYoutube) setContactYoutube(config.contactYoutube);
            if (config.contactTelegram) setContactTelegram(config.contactTelegram);
            if (config.trustTitle) setTrustTitle(config.trustTitle);
            if (config.trustSubtitle) setTrustSubtitle(config.trustSubtitle);
            if (config.trustPaidBtnText) setTrustPaidBtnText(config.trustPaidBtnText);
            if (config.trustFreeBtnText) setTrustFreeBtnText(config.trustFreeBtnText);
            if (config.trustFreeLink) setTrustFreeLink(config.trustFreeLink);
            if (config.trustCornerImage) setTrustCornerImage(config.trustCornerImage);
            if (config.galleryPhotos && config.galleryPhotos.length > 0) setGalleryPhotos(config.galleryPhotos);
            if (config.galleryTitle) setGalleryTitle(config.galleryTitle);
            if (config.gallerySubtitle) setGallerySubtitle(config.gallerySubtitle);
            if (config.helpBarTitle) setHelpBarTitle(config.helpBarTitle);
            if (config.helpBarPhone) setHelpBarPhone(config.helpBarPhone);
          }
        }
      } catch (err) {
        console.error('Error fetching home builder config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Save all config to Firestore
  const handleSaveConfig = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const fullConfig = {
        heroSliders,
        quickCards,
        coursesSubtitle,
        customCategories,
        featuresTitle,
        featuresSubtitle,
        featureCards,
        admissionTitle,
        admissionSubtitle,
        admissionSteps,
        admissionNotice,
        aboutTitle,
        aboutHeadline,
        founderTitle,
        aboutBio,
        aboutStats,
        contactTitle,
        contactPhone,
        contactWhatsapp,
        contactEmail,
        contactFacebookPage,
        contactFacebookGroup,
        contactYoutube,
        contactTelegram,
        trustTitle,
        trustSubtitle,
        trustPaidBtnText,
        trustFreeBtnText,
        trustFreeLink,
        trustCornerImage,
        galleryTitle,
        gallerySubtitle,
        galleryPhotos,
        helpBarTitle,
        helpBarPhone,
        updatedAt: new Date().toISOString()
      };

      const profileRef = doc(db, 'teacherProfiles', user.uid);
      await setDoc(profileRef, { homePageConfig: fullConfig }, { merge: true });

      toast.success(locale === 'bn' ? 'হোম পেজের সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Home page configuration saved successfully!');
    } catch (err) {
      console.error('Error saving home page config:', err);
      toast.error(locale === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Slider image upload handler
  const handleAddSlideImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlideImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setHeroSliders(prev => [
        ...prev,
        {
          id: `slide-${Date.now()}`,
          imageUrl: url,
          targetCourseId: courses[0]?.id || '',
          title: `Slide Banner ${prev.length + 1}`
        }
      ]);
      toast.success(locale === 'bn' ? 'স্লাইডার ব্যানার যুক্ত হয়েছে!' : 'Slider banner added!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ইমেজ আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingSlideImg(false);
    }
  };

  // Trust Banner Corner image upload handler
  const handleUploadTrustCornerImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTrustImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setTrustCornerImage(url);
      toast.success(locale === 'bn' ? 'ব্যানার ইমেজ আপলোড হয়েছে!' : 'Banner image uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ইমেজ আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingTrustImg(false);
    }
  };

  // Gallery photo upload handler
  const handleAddGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setGalleryPhotos(prev => [
        ...prev,
        {
          id: `photo-${Date.now()}`,
          imageUrl: url
        }
      ]);
      toast.success(locale === 'bn' ? 'গ্যালারি ফটো যুক্ত হয়েছে!' : 'Gallery photo added!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ফটো আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingGalleryImg(false);
    }
  };

  const tabs = [
    { id: 'sliders', label: '১. ব্যানার স্লাইডার', icon: Sliders },
    { id: 'quickCards', label: '২. পেইড/ফ্রি কার্ডস', icon: Layers },
    { id: 'categories', label: '৩. কোর্স ও ক্যাটাগরি', icon: Grid },
    { id: 'features', label: '৪. প্রস্তুতিতে যা প্রয়োজন', icon: Award },
    { id: 'admission', label: '৫. ভর্তি তথ্য', icon: Info },
    { id: 'about', label: '৬. আমাদের সম্পর্কে', icon: Users },
    { id: 'contact', label: '৭. যোগাযোগ ও সোশ্যাল লিঙ্ক', icon: Phone },
    { id: 'trustBanner', label: '৮. আস্থার ব্যানার', icon: Flame },
    { id: 'gallery', label: '৯. ফটো গ্যালারি', icon: ImageIcon },
    { id: 'helpBar', label: '১০. হেল্পবার', icon: HelpCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen">
      
      {/* ========================================================================= */}
      {/* DEDICATED HOME PAGE BUILDER SIDEBAR (Replaces Main Sidebar on Desktop)     */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 lg:w-[280px] flex-shrink-0 bg-background border-r border-foreground/10 fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar flex-col justify-between">
        
        {/* Top Header & Back Button */}
        <div>
          <div className="p-4 border-b border-foreground/10 space-y-3">
            <Link 
              href="/teacher-dashboard" 
              className="inline-flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div>
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>হোম পেজ বিল্ডার</span>
              </h3>
              <p className="text-[11px] text-foreground/50 mt-0.5">
                আপনার ওয়েবসাইট কাস্টমাইজ করুন
              </p>
            </div>
          </div>

          {/* 10 Builder Section Items */}
          <div className="p-2.5 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md font-bold'
                      : 'hover:bg-foreground/5 text-foreground/75 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-foreground/30'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Action Buttons */}
        <div className="p-3 border-t border-foreground/10 space-y-2">
          {user?.uid && (
            <Link
              href={`/teachers/${user.uid}`}
              target="_blank"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[11px] font-bold text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-orange-500" />
                <span>লাইভ ওয়েবসাইট</span>
              </div>
              <ExternalLink className="w-3 h-3 text-foreground/40" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
          </button>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN FULL-WIDTH CONTENT AREA (Shifted by sidebar width on Desktop)        */}
      {/* ========================================================================= */}
      <div className="md:ml-64 lg:ml-[280px] p-2 sm:p-4 md:p-6 space-y-6">
        
        {/* Mobile Horizontal Tabs Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-foreground/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-foreground/5 text-foreground/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top Hero / Action Card */}
        <div className="p-6 rounded-3xl bg-background border border-foreground/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Storefront Website Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 mt-1">
              আপনার ওয়েবসাইটের এই সেকশনটির তথ্য ও ডিজাইন কাস্টমাইজ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.uid && (
              <Link
                href={`/teachers/${user.uid}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4 text-orange-500" />
                <span>লাইভ প্রিভিউ</span>
                <ExternalLink className="w-3.5 h-3.5 text-foreground/40" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>

        {/* Full Width Active Tab Form Container */}
        <div className="w-full bg-background border border-foreground/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {/* TAB 1: HERO SLIDERS */}
          {activeTab === 'sliders' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <span>১. ব্যানার ইমেজ স্লাইডার (Hero Carousel)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  এখানে আপলোড করা বড় ব্যানারগুলো আপনার হোম পেজের শীর্ষে স্লাইডারে ঘুরবে। ব্যানারে ক্লিক করলে শিক্ষার্থীকে নির্দিষ্ট কোর্সে নিয়ে যাওয়া হবে।
                </p>
              </div>

              <div className="space-y-4">
                {heroSliders.map((slide, index) => (
                  <div key={slide.id} className="p-4 sm:p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-500">ব্যানার #{index + 1}</span>
                      {heroSliders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHeroSliders(heroSliders.filter(s => s.id !== slide.id))}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="relative aspect-[21/9] sm:aspect-video rounded-2xl overflow-hidden bg-foreground/10 border border-foreground/10">
                        <img src={slide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                            টার্গেট কোর্স লিঙ্ক (ক্লিক করলে যেখানে যাবে)
                          </label>
                          <select
                            value={slide.targetCourseId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroSliders(heroSliders.map(s => s.id === slide.id ? { ...s, targetCourseId: val } : s));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-semibold focus:outline-none focus:border-orange-500"
                          >
                            <option value="">-- কোনো কোর্স লিঙ্ক নেই --</option>
                            {courses.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                            ইমেজ লিংক (URL) বা সরাসরি পেস্ট করুন
                          </label>
                          <input
                            type="text"
                            value={slide.imageUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHeroSliders(heroSliders.map(s => s.id === slide.id ? { ...s, imageUrl: val } : s));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold cursor-pointer transition-colors">
                    {uploadingSlideImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{uploadingSlideImg ? 'ইমেজ আপলোড হচ্ছে...' : '+ নতুন ব্যানার ইমেজ আপলোড করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleAddSlideImage} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK CARDS */}
          {activeTab === 'quickCards' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span>২. পেইড কোর্স ও ফ্রি কোর্স কুইক কার্ডস</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  স্লাইডারের ঠিক নিচে থাকা দুটি কার্ডের টেক্সট ও লিংক কনফিগার করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span>🎓 পেইড কোর্স কার্ড</span>
                  </h4>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">শিরোনাম</label>
                    <input
                      type="text"
                      value={quickCards.paidTitle}
                      onChange={(e) => setQuickCards({ ...quickCards, paidTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">সাবটাইটেল / বিবরণ</label>
                    <input
                      type="text"
                      value={quickCards.paidSubtitle}
                      onChange={(e) => setQuickCards({ ...quickCards, paidSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span>🎁 ফ্রি কোর্স কার্ড</span>
                  </h4>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">শিরোনাম</label>
                    <input
                      type="text"
                      value={quickCards.freeTitle}
                      onChange={(e) => setQuickCards({ ...quickCards, freeTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">সাবটাইটেল / বিবরণ</label>
                    <input
                      type="text"
                      value={quickCards.freeSubtitle}
                      onChange={(e) => setQuickCards({ ...quickCards, freeSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CATEGORIES & SUBTITLE */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Grid className="w-5 h-5 text-orange-500" />
                  <span>৩. আমাদের কোর্সসমূহ ও ক্যাটাগরি ম্যানেজার</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  আপনার "আমাদের কোর্সসমূহ" সেকশনের সাবটাইটেল এবং ফিল্টার ক্যাটাগরিগুলো তৈরি ও সাজান।
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                  কোর্স সেকশনের সাবটাইটেল
                </label>
                <input
                  type="text"
                  value={coursesSubtitle}
                  onChange={(e) => setCoursesSubtitle(e.target.value)}
                  placeholder="যেমন: সেরা মেন্টরদের সাথে ঘরে বসেই নাও শতভাগ প্রস্তুতি।"
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-foreground/70 block">
                  ক্যাটাগরি ফিল্টারসমূহ
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="নতুন ক্যাটাগরি নাম লিখুন (যেমন: মেডিকেল এডমিশন, ভার্সিটি ক ইউনিট)"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatInput.trim() && !customCategories.includes(newCatInput.trim())) {
                        setCustomCategories([...customCategories, newCatInput.trim()]);
                        setNewCatInput('');
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>যোগ করুন</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {customCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground shadow-sm"
                    >
                      <span>{cat}</span>
                      {cat !== 'সকল কোর্স' && (
                        <button
                          type="button"
                          onClick={() => setCustomCategories(customCategories.filter(c => c !== cat))}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE CARDS */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <span>৪. একজন শিক্ষার্থীর পূর্ণাঙ্গ প্রস্তুতিতে যা যা প্রয়োজন</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  এই সেকশনের কার্ডগুলো ও টেক্সট কনফিগার করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={featuresTitle}
                    onChange={(e) => setFeaturesTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সেকশন সাবটাইটেল</label>
                  <input
                    type="text"
                    value={featuresSubtitle}
                    onChange={(e) => setFeaturesSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {featureCards.map((card) => (
                  <div key={card.id} className="p-4 sm:p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-foreground/50 block mb-1">কার্ড টাইটেল</label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFeatureCards(featureCards.map(c => c.id === card.id ? { ...c, title: val } : c));
                          }}
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-semibold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-foreground/50 block mb-1">কার্ড বিবরণ</label>
                        <input
                          type="text"
                          value={card.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFeatureCards(featureCards.map(c => c.id === card.id ? { ...c, desc: val } : c));
                          }}
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFeatureCards(featureCards.filter(c => c.id !== card.id))}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setFeatureCards([...featureCards, { id: `f-${Date.now()}`, icon: 'Check', title: 'নতুন ফিচার', desc: 'ফিচারের বিবরণ লিখুন' }])}
                  className="px-5 py-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন ফিচার কার্ড যোগ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: ADMISSION INFO */}
          {activeTab === 'admission' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-500" />
                  <span>৫. ভর্তি তথ্য এখন এক জায়গায়</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  কোর্সে ভর্তি হওয়ার নিয়মাবলি ও ধাপসমূহ সাজান।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={admissionTitle}
                    onChange={(e) => setAdmissionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সেকশন সাবটাইটেল</label>
                  <input
                    type="text"
                    value={admissionSubtitle}
                    onChange={(e) => setAdmissionSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {admissionSteps.map((step, idx) => (
                  <div key={step.id} className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdmissionSteps(admissionSteps.map(s => s.id === step.id ? { ...s, title: val } : s));
                        }}
                        placeholder="ধাপের নাম"
                        className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-semibold focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        value={step.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdmissionSteps(admissionSteps.map(s => s.id === step.id ? { ...s, desc: val } : s));
                        }}
                        placeholder="ধাপের বিবরণ"
                        className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">গুরুত্বপূর্ণ নোটিশ / হেল্প টেক্সট</label>
                <input
                  type="text"
                  value={admissionNotice}
                  onChange={(e) => setAdmissionNotice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span>৬. আমাদের সম্পর্কে (About Us & Founder Showcase)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  শিক্ষক বা একাডেমির পরিচিতি, অনুপ্রেরণামূলক শিরোনাম ও অর্জনের পরিসংখ্যান।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সেকশন টাইটেল</label>
                  <input
                    type="text"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">পদবী / রোল (যেমন: প্রতিষ্ঠাতা ও পরিচালক)</label>
                  <input
                    type="text"
                    value={founderTitle}
                    onChange={(e) => setFounderTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">অনুপ্রেরণামূলক প্রধান শিরোনাম</label>
                <input
                  type="text"
                  value={aboutHeadline}
                  onChange={(e) => setAboutHeadline(e.target.value)}
                  placeholder='যেমন: স্বপ্ন ছোঁয়ার আশা থাকলে সেই স্বপ্নের ভিত তৈরিতে সাথে আছি আমরা'
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-foreground/10 text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground/70 block mb-1">পরিচিতি ও প্ল্যাটফর্মের মিশন বিবরণ</label>
                <textarea
                  rows={4}
                  value={aboutBio}
                  onChange={(e) => setAboutBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-foreground/10 text-xs leading-relaxed focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-foreground/70 block">পরিসংখ্যান কাউন্টার বক্সসমূহ</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aboutStats.map((st) => (
                    <div key={st.id} className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAboutStats(aboutStats.map(s => s.id === st.id ? { ...s, value: val } : s));
                        }}
                        placeholder="মান (যেমন: 10+, 100K+)"
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs font-black text-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAboutStats(aboutStats.map(s => s.id === st.id ? { ...s, label: val } : s));
                        }}
                        placeholder="লেবেল (যেমন: Courses, Students)"
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-foreground/10 text-[11px] font-semibold text-foreground/70 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT & SOCIAL LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>৭. আমাদের সাথে যোগাযোগ ও সোশ্যাল চ্যানেল লিঙ্কস</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  শিক্ষার্থীদের জন্য ফেসবুক পেজ, গ্রুপ, ইউটিউব, টেলিগ্রাম ও হেল্পলাইন লিঙ্ক কনফিগার করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">হেল্পলাইন ফোন নম্বর</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">WhatsApp নম্বর</label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">Facebook Page লিংক</label>
                  <input
                    type="text"
                    value={contactFacebookPage}
                    onChange={(e) => setContactFacebookPage(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">Facebook Group লিংক</label>
                  <input
                    type="text"
                    value={contactFacebookGroup}
                    onChange={(e) => setContactFacebookGroup(e.target.value)}
                    placeholder="https://facebook.com/groups/yourgroup"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">YouTube Channel লিংক</label>
                  <input
                    type="text"
                    value={contactYoutube}
                    onChange={(e) => setContactYoutube(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">Telegram Channel লিংক</label>
                  <input
                    type="text"
                    value={contactTelegram}
                    onChange={(e) => setContactTelegram(e.target.value)}
                    placeholder="https://t.me/yourchannel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TRUST BANNER */}
          {activeTab === 'trustBanner' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>৮. আস্থার নাম ও কল-টু-অ্যাকশন ব্যানার (Physics Hunters Style)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  যেমন: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতিতে [একাডেমি নাম] একটি আস্থার নাম" ব্যানার এবং কর্নারের ছবি কাস্টমাইজ করুন।
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">প্রধান শিরোনাম প্রিফিক্স</label>
                  <input
                    type="text"
                    value={trustTitle}
                    onChange={(e) => setTrustTitle(e.target.value)}
                    placeholder="যেমন: বিশ্ববিদ্যালয় ভর্তি প্রস্তুতিতে"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={trustSubtitle}
                    onChange={(e) => setTrustSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">পেইড বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={trustPaidBtnText}
                      onChange={(e) => setTrustPaidBtnText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">ফ্রি বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={trustFreeBtnText}
                      onChange={(e) => setTrustFreeBtnText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Trust Corner Image Upload */}
                <div className="p-4 sm:p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                  <label className="text-[11px] font-bold text-foreground/70 block">
                    ব্যানারের কর্নার ছবি (শিক্ষার্থী বা মেন্টরের ছবি)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-foreground/10 border border-foreground/10 flex-shrink-0">
                      <img src={trustCornerImage} alt="Corner Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={trustCornerImage}
                        onChange={(e) => setTrustCornerImage(e.target.value)}
                        placeholder="ইমেজ URL"
                        className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                      />

                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold cursor-pointer transition-colors border border-orange-500/20">
                        {uploadingTrustImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{uploadingTrustImg ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন / আপলোড করুন'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadTrustCornerImg} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: GALLERY PHOTOS */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-orange-500" />
                  <span>৯. ফটো গ্যালারি (সাফল্যের পথে এগিয়ে চলেছে)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  ক্লাসরুম, সেমিনার ও শিক্ষার্থীদের অর্জনের ফটোগুলো আপলোড করুন (যা হোম পেজে স্বয়ংক্রিয়ভাবে দুই সারিতে ফাঁকা জায়গা ছাড়া অবিরাম স্লাইড করবে)।
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-2xl overflow-hidden aspect-video border border-foreground/10 bg-foreground/5">
                    <img src={photo.imageUrl} alt="Gallery Photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryPhotos(galleryPhotos.filter(p => p.id !== photo.id))}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingGalleryImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{uploadingGalleryImg ? 'ফটো আপলোড হচ্ছে...' : '+ নতুন গ্যালারি ফটো আপলোড করুন'}</span>
                  <input type="file" accept="image/*" onChange={handleAddGalleryPhoto} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 10: HELP BAR */}
          {activeTab === 'helpBar' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-orange-500" />
                  <span>১০. সাহায্যের প্রয়োজন হেল্পবার</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  পেজের নিচে ভাসমান সাপোর্ট স্ট্রিপ।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">হেল্পবার প্রধান টেক্সট</label>
                  <input
                    type="text"
                    value={helpBarTitle}
                    onChange={(e) => setHelpBarTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">হেল্পলাইন নম্বর</label>
                  <input
                    type="text"
                    value={helpBarPhone}
                    onChange={(e) => setHelpBarPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
