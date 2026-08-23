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
  Globe,
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
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Send,
  Building2,
  User,
  GraduationCap,
  Upload,
  Edit2,
  Camera,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherHomePageBuilderPage() {
  const { user } = useAuth();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [activeTab, setActiveTab] = useState<
    'branding' | 'faculty' | 'sliders' | 'quickCards' | 'categories' | 'features' | 'admission' | 'about' | 'contact' | 'trustBanner' | 'gallery' | 'helpBar' | 'aboutHero' | 'aboutStory' | 'aboutValues' | 'aboutShowcase' | 'aboutFounder' | 'aboutCta'
  >('branding');

  // 0. Branding & Identity State
  const [profileType, setProfileType] = useState<'individual' | 'institution'>('individual');
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop');
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);

  // 0.1 Faculty / Teachers Roster State (For Institutions)
  const [teachersRoster, setTeachersRoster] = useState<Array<{
    id: string;
    name: string;
    image: string;
    university: string;
    subjects: string;
    role?: string;
    bio?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
  }>>([]);
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState('');
  const [facultyRole, setFacultyRole] = useState('');
  const [facultyUniversity, setFacultyUniversity] = useState('');
  const [facultySubjects, setFacultySubjects] = useState('');
  const [facultyBio, setFacultyBio] = useState('');
  const [facultyImage, setFacultyImage] = useState('');
  const [facultyFacebook, setFacultyFacebook] = useState('');
  const [facultyYoutube, setFacultyYoutube] = useState('');
  const [uploadingFacultyImg, setUploadingFacultyImg] = useState(false);

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
  const [aboutPhoto, setAboutPhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
  const [uploadingAboutPhoto, setUploadingAboutPhoto] = useState(false);
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
  const [contactImage, setContactImage] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop');
  const [uploadingContactImg, setUploadingContactImg] = useState(false);

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

  // 11. Full About Page Builder State
  const [aboutHeroHeading, setAboutHeroHeading] = useState('শিখবো, জিতবো');
  const [aboutHeroSubtitle, setAboutHeroSubtitle] = useState('');
  const [aboutHeroBgImage, setAboutHeroBgImage] = useState('');
  const [aboutHeroVideoUrl, setAboutHeroVideoUrl] = useState('');
  const [aboutHeroBtn1Text, setAboutHeroBtn1Text] = useState('কোর্সগুলো দেখুন');
  const [aboutHeroBtn1Link, setAboutHeroBtn1Link] = useState('/courses');
  const [aboutHeroBtn2Text, setAboutHeroBtn2Text] = useState('আমাদের গল্প পড়ুন');
  const [aboutHeroBtn2Link, setAboutHeroBtn2Link] = useState('#story');

  const [aboutStoryHeading, setAboutStoryHeading] = useState('আমাদের গল্প');
  const [aboutStoryDesc, setAboutStoryDesc] = useState('');
  const [aboutStoryImage, setAboutStoryImage] = useState('');
  const [aboutStoryStat1Num, setAboutStoryStat1Num] = useState('১০০+');
  const [aboutStoryStat1Label, setAboutStoryStat1Label] = useState('স্পেশাল ব্যাচ ও কোর্স');
  const [aboutStoryStat2Num, setAboutStoryStat2Num] = useState('১,২০০+');
  const [aboutStoryStat2Label, setAboutStoryStat2Label] = useState('সফল শিক্ষার্থী');
  const [aboutStoryStat3Num, setAboutStoryStat3Num] = useState('৪.৯ ★');
  const [aboutStoryStat3Label, setAboutStoryStat3Label] = useState('গড় রেটিং');
  const [aboutStoryStat4Num, setAboutStoryStat4Num] = useState('৯৮%');
  const [aboutStoryStat4Label, setAboutStoryStat4Label] = useState('সন্তুষ্টি ও সাফল্য');

  const [aboutValuesHeading, setAboutValuesHeading] = useState('আমাদের মূল ভিত্তি');
  const [aboutValuesSubtitle, setAboutValuesSubtitle] = useState('যে মূলনীতি ও দৃষ্টিভঙ্গির ওপর ভিত্তি করে আমাদের শিক্ষা কার্যক্রম পরিচালিত হয়');

  const [aboutShowcaseHeading, setAboutShowcaseHeading] = useState('');
  const [aboutShowcaseSubtitle, setAboutShowcaseSubtitle] = useState('');

  const [aboutFounderTitle, setAboutFounderTitle] = useState('প্রতিষ্ঠাতা ও চিফ মেন্টর');
  const [aboutFounderBio, setAboutFounderBio] = useState('');
  const [aboutFounderPhoto, setAboutFounderPhoto] = useState('');

  const [aboutCtaBadge, setAboutCtaBadge] = useState('সাফল্যের শুরু হোক আজই');
  const [aboutCtaHeading, setAboutCtaHeading] = useState('তোমার স্বপ্নের সেরা প্রস্তুতিতে সাথে আছে');
  const [aboutCtaSubtitle, setAboutCtaSubtitle] = useState('দেশসেরা দিকনির্দেশনা, মানসম্মত লেকচার ও নিয়মিত মডেল টেস্টের মাধ্যমে ঘরে বসেই নাও শতভাগ প্রস্তুতি।');
  const [aboutCtaBtn1Text, setAboutCtaBtn1Text] = useState('সকল কোর্সসমূহ দেখুন');
  const [aboutCtaBtn1Link, setAboutCtaBtn1Link] = useState('/courses');
  const [aboutCtaBtn2Text, setAboutCtaBtn2Text] = useState('হেল্পলাইনে কল দিন');
  const [aboutCtaPhone, setAboutCtaPhone] = useState('');
  const [aboutCtaFeature1, setAboutCtaFeature1] = useState('লাইভ ক্লাস');
  const [aboutCtaFeature2, setAboutCtaFeature2] = useState('ডেইলি এক্সাম');
  const [aboutCtaFeature3, setAboutCtaFeature3] = useState('ডাউট সলভিং');
  const [aboutCtaFeature4, setAboutCtaFeature4] = useState('লেকচার শিট');

  const [uploadingAboutHeroBg, setUploadingAboutHeroBg] = useState(false);
  const [uploadingAboutStoryImg, setUploadingAboutStoryImg] = useState(false);
  const [uploadingAboutFounderImg, setUploadingAboutFounderImg] = useState(false);

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

        // Fetch existing teacher profile & home page config
        const profileRef = doc(db, 'teacherProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.type) setProfileType(data.type);
          if (data.displayName) setDisplayName(data.displayName);
          else if (user.displayName) setDisplayName(user.displayName);
          if (data.headline) setHeadline(data.headline);
          if (data.bio) setBio(data.bio);
          if (data.profilePhoto || data.photoUrl) setProfilePhoto(data.profilePhoto || data.photoUrl);
          else if (user.photoURL) setProfilePhoto(user.photoURL);
          if (data.coverPhoto) setCoverPhoto(data.coverPhoto);
          if (data.teachersRoster && Array.isArray(data.teachersRoster)) {
            setTeachersRoster(data.teachersRoster);
          }

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
            if (config.aboutPhoto) setAboutPhoto(config.aboutPhoto);
            else if (data.profilePhoto || data.photoUrl) setAboutPhoto(data.profilePhoto || data.photoUrl);
            if (config.aboutStats && config.aboutStats.length > 0) setAboutStats(config.aboutStats);
            if (config.contactTitle) setContactTitle(config.contactTitle);
            if (config.contactPhone) setContactPhone(config.contactPhone);
            if (config.contactWhatsapp) setContactWhatsapp(config.contactWhatsapp);
            if (config.contactEmail) setContactEmail(config.contactEmail);
            if (config.contactFacebookPage) setContactFacebookPage(config.contactFacebookPage);
            if (config.contactFacebookGroup) setContactFacebookGroup(config.contactFacebookGroup);
            if (config.contactYoutube) setContactYoutube(config.contactYoutube);
            if (config.contactTelegram) setContactTelegram(config.contactTelegram);
            if (config.contactImage) setContactImage(config.contactImage);
            if (config.trustTitle) setTrustTitle(config.trustTitle.replace(/একটি\s*আস্থার\s*নাম/gi, '').trim());
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

            // Populate About Page Config
            const abConfig = config.aboutPageConfig || data.aboutPageConfig || {};
            if (abConfig.heroHeading) setAboutHeroHeading(abConfig.heroHeading);
            if (abConfig.heroSubtitle) setAboutHeroSubtitle(abConfig.heroSubtitle);
            if (abConfig.heroBgImage) setAboutHeroBgImage(abConfig.heroBgImage);
            if (abConfig.heroVideoUrl) setAboutHeroVideoUrl(abConfig.heroVideoUrl);
            if (abConfig.heroBtn1Text) setAboutHeroBtn1Text(abConfig.heroBtn1Text);
            if (abConfig.heroBtn1Link) setAboutHeroBtn1Link(abConfig.heroBtn1Link);
            if (abConfig.heroBtn2Text) setAboutHeroBtn2Text(abConfig.heroBtn2Text);
            if (abConfig.heroBtn2Link) setAboutHeroBtn2Link(abConfig.heroBtn2Link);
            if (abConfig.storyHeading) setAboutStoryHeading(abConfig.storyHeading);
            if (abConfig.storyDesc) setAboutStoryDesc(abConfig.storyDesc);
            if (abConfig.storyImage) setAboutStoryImage(abConfig.storyImage);
            if (abConfig.storyStat1Num) setAboutStoryStat1Num(abConfig.storyStat1Num);
            if (abConfig.storyStat1Label) setAboutStoryStat1Label(abConfig.storyStat1Label);
            if (abConfig.storyStat2Num) setAboutStoryStat2Num(abConfig.storyStat2Num);
            if (abConfig.storyStat2Label) setAboutStoryStat2Label(abConfig.storyStat2Label);
            if (abConfig.storyStat3Num) setAboutStoryStat3Num(abConfig.storyStat3Num);
            if (abConfig.storyStat3Label) setAboutStoryStat3Label(abConfig.storyStat3Label);
            if (abConfig.storyStat4Num) setAboutStoryStat4Num(abConfig.storyStat4Num);
            if (abConfig.storyStat4Label) setAboutStoryStat4Label(abConfig.storyStat4Label);
            if (abConfig.valuesHeading) setAboutValuesHeading(abConfig.valuesHeading);
            if (abConfig.valuesSubtitle) setAboutValuesSubtitle(abConfig.valuesSubtitle);
            if (abConfig.showcaseHeading) setAboutShowcaseHeading(abConfig.showcaseHeading);
            if (abConfig.showcaseSubtitle) setAboutShowcaseSubtitle(abConfig.showcaseSubtitle);
            if (abConfig.founderTitle) setAboutFounderTitle(abConfig.founderTitle);
            if (abConfig.founderBio) setAboutFounderBio(abConfig.founderBio);
            if (abConfig.founderPhoto) setAboutFounderPhoto(abConfig.founderPhoto);
            if (abConfig.ctaBadge) setAboutCtaBadge(abConfig.ctaBadge);
            if (abConfig.ctaHeading) setAboutCtaHeading(abConfig.ctaHeading);
            if (abConfig.ctaSubtitle) setAboutCtaSubtitle(abConfig.ctaSubtitle);
            if (abConfig.ctaBtn1Text) setAboutCtaBtn1Text(abConfig.ctaBtn1Text);
            if (abConfig.ctaBtn1Link) setAboutCtaBtn1Link(abConfig.ctaBtn1Link);
            if (abConfig.ctaBtn2Text) setAboutCtaBtn2Text(abConfig.ctaBtn2Text);
            if (abConfig.ctaPhone) setAboutCtaPhone(abConfig.ctaPhone);
            if (abConfig.ctaFeature1) setAboutCtaFeature1(abConfig.ctaFeature1);
            if (abConfig.ctaFeature2) setAboutCtaFeature2(abConfig.ctaFeature2);
            if (abConfig.ctaFeature3) setAboutCtaFeature3(abConfig.ctaFeature3);
            if (abConfig.ctaFeature4) setAboutCtaFeature4(abConfig.ctaFeature4);
          } else if (data.profilePhoto || data.photoUrl) {
            setAboutPhoto(data.profilePhoto || data.photoUrl);
          }
        } else {
          if (user.displayName) setDisplayName(user.displayName);
          if (user.photoURL) {
            setProfilePhoto(user.photoURL);
            setAboutPhoto(user.photoURL);
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
        aboutPhoto,
        aboutStats,
        contactTitle,
        contactPhone,
        contactWhatsapp,
        contactEmail,
        contactFacebookPage,
        contactFacebookGroup,
        contactYoutube,
        contactTelegram,
        contactImage,
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
        aboutPageConfig: {
          heroHeading: aboutHeroHeading,
          heroSubtitle: aboutHeroSubtitle,
          heroBgImage: aboutHeroBgImage,
          heroVideoUrl: aboutHeroVideoUrl,
          heroBtn1Text: aboutHeroBtn1Text,
          heroBtn1Link: aboutHeroBtn1Link,
          heroBtn2Text: aboutHeroBtn2Text,
          heroBtn2Link: aboutHeroBtn2Link,
          storyHeading: aboutStoryHeading,
          storyDesc: aboutStoryDesc,
          storyImage: aboutStoryImage,
          storyStat1Num: aboutStoryStat1Num,
          storyStat1Label: aboutStoryStat1Label,
          storyStat2Num: aboutStoryStat2Num,
          storyStat2Label: aboutStoryStat2Label,
          storyStat3Num: aboutStoryStat3Num,
          storyStat3Label: aboutStoryStat3Label,
          storyStat4Num: aboutStoryStat4Num,
          storyStat4Label: aboutStoryStat4Label,
          valuesHeading: aboutValuesHeading,
          valuesSubtitle: aboutValuesSubtitle,
          showcaseHeading: aboutShowcaseHeading,
          showcaseSubtitle: aboutShowcaseSubtitle,
          founderTitle: aboutFounderTitle,
          founderBio: aboutFounderBio,
          founderPhoto: aboutFounderPhoto,
          ctaBadge: aboutCtaBadge,
          ctaHeading: aboutCtaHeading,
          ctaSubtitle: aboutCtaSubtitle,
          ctaBtn1Text: aboutCtaBtn1Text,
          ctaBtn1Link: aboutCtaBtn1Link,
          ctaBtn2Text: aboutCtaBtn2Text,
          ctaPhone: aboutCtaPhone,
          ctaFeature1: aboutCtaFeature1,
          ctaFeature2: aboutCtaFeature2,
          ctaFeature3: aboutCtaFeature3,
          ctaFeature4: aboutCtaFeature4
        },
        updatedAt: new Date().toISOString()
      };

      const profileRef = doc(db, 'teacherProfiles', user.uid);
      await setDoc(profileRef, { 
        type: profileType,
        displayName: displayName || user.displayName || 'Instructor',
        headline: headline || '',
        bio: bio || '',
        profilePhoto,
        photoUrl: profilePhoto,
        coverPhoto,
        teachersRoster,
        homePageConfig: fullConfig,
        aboutPageConfig: fullConfig.aboutPageConfig
      }, { merge: true });

      // Also update users collection if displayName or photo changed
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName || user.displayName,
        photoURL: profilePhoto || user.photoURL,
        profilePhoto: profilePhoto || user.photoURL,
      }, { merge: true }).catch(() => {});

      toast.success(locale === 'bn' ? 'হোম পেজের সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Home page configuration saved successfully!');
    } catch (err) {
      console.error('Error saving home page config:', err);
      toast.error(locale === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Profile Photo upload handler
  const handleUploadProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfilePhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setProfilePhoto(url);
      if (!aboutPhoto || aboutPhoto.includes('dicebear')) setAboutPhoto(url);
      toast.success(locale === 'bn' ? 'প্রোফাইল/লোগো ছবি আপলোড হয়েছে!' : 'Profile/Logo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  // Cover Photo upload handler
  const handleUploadCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCoverPhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setCoverPhoto(url);
      toast.success(locale === 'bn' ? 'কভার ব্যানার আপলোড হয়েছে!' : 'Cover photo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload cover');
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  // Faculty Photo upload handler
  const handleUploadFacultyPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFacultyImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setFacultyImage(url);
      toast.success(locale === 'bn' ? 'শিক্ষকের ছবি আপলোড হয়েছে!' : 'Teacher photo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingFacultyImg(false);
    }
  };

  // Faculty Management Helpers
  const resetFacultyForm = () => {
    setIsAddingFaculty(false);
    setEditingFacultyId(null);
    setFacultyName('');
    setFacultyRole('');
    setFacultyUniversity('');
    setFacultySubjects('');
    setFacultyBio('');
    setFacultyImage('');
    setFacultyFacebook('');
    setFacultyYoutube('');
  };

  const handleSaveFacultyMember = () => {
    if (!facultyName.trim()) {
      toast.error(locale === 'bn' ? 'শিক্ষকের নাম প্রয়োজন' : 'Teacher name is required');
      return;
    }
    if (editingFacultyId) {
      setTeachersRoster(prev => prev.map(t => t.id === editingFacultyId ? {
        ...t,
        name: facultyName,
        role: facultyRole,
        university: facultyUniversity,
        subjects: facultySubjects,
        bio: facultyBio,
        image: facultyImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(facultyName),
        facebookUrl: facultyFacebook,
        youtubeUrl: facultyYoutube
      } : t));
      toast.success(locale === 'bn' ? 'শিক্ষকের তথ্য আপডেট হয়েছে!' : 'Teacher updated!');
    } else {
      const newTeacher = {
        id: `faculty-${Date.now()}`,
        name: facultyName,
        role: facultyRole,
        university: facultyUniversity,
        subjects: facultySubjects,
        bio: facultyBio,
        image: facultyImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(facultyName),
        facebookUrl: facultyFacebook,
        youtubeUrl: facultyYoutube
      };
      setTeachersRoster(prev => [...prev, newTeacher]);
      toast.success(locale === 'bn' ? 'নতুন শিক্ষক যুক্ত হয়েছেন!' : 'New teacher added!');
    }
    resetFacultyForm();
  };

  const handleEditFaculty = (teacher: any) => {
    setEditingFacultyId(teacher.id);
    setFacultyName(teacher.name || '');
    setFacultyRole(teacher.role || '');
    setFacultyUniversity(teacher.university || '');
    setFacultySubjects(teacher.subjects || '');
    setFacultyBio(teacher.bio || '');
    setFacultyImage(teacher.image || '');
    setFacultyFacebook(teacher.facebookUrl || '');
    setFacultyYoutube(teacher.youtubeUrl || '');
    setIsAddingFaculty(true);
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

  // About Photo upload handler
  const handleUploadAboutPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutPhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setAboutPhoto(url);
      toast.success(locale === 'bn' ? 'প্রোফাইল ছবি আপলোড হয়েছে!' : 'About photo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingAboutPhoto(false);
    }
  };

  // Contact Standing image upload handler
  const handleUploadContactImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingContactImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setContactImage(url);
      toast.success(locale === 'bn' ? 'যোগাযোগ সেকশনের ছবি আপলোড হয়েছে!' : 'Contact image uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingContactImg(false);
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

  // About Page Hero Bg Image Handler
  const handleUploadAboutHeroBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutHeroBg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setAboutHeroBgImage(url);
      toast.success(locale === 'bn' ? 'হিরো ব্যাকগ্রাউন্ড ইমেজ আপলোড হয়েছে!' : 'Hero background uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingAboutHeroBg(false);
    }
  };

  // About Story Image Handler
  const handleUploadAboutStoryImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutStoryImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setAboutStoryImage(url);
      toast.success(locale === 'bn' ? 'স্টোরি ইমেজ আপলোড হয়েছে!' : 'Story image uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingAboutStoryImg(false);
    }
  };

  // About Founder Photo Handler
  const handleUploadAboutFounderImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutFounderImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setAboutFounderPhoto(url);
      toast.success(locale === 'bn' ? 'মেন্টরের ছবি আপলোড হয়েছে!' : 'Founder photo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingAboutFounderImg(false);
    }
  };

  const tabGroups = [
    {
      id: 'branding',
      groupName: '🎨 ব্র্যান্ডিং ও পরিচিতি (BRANDING)',
      items: [
        { id: 'branding', label: 'ব্র্যান্ডিং ও একাউন্ট টাইপ', icon: Building2 },
      ]
    },
    {
      id: 'home',
      groupName: '🏠 হোম পেজ (HOME PAGE)',
      items: [
        { id: 'sliders', label: '১. ব্যানার স্লাইডার', icon: Sliders },
        { id: 'quickCards', label: '২. পেইড ও ফ্রি কার্ডস', icon: Layers },
        { id: 'categories', label: '৩. কোর্স ও ক্যাটাগরি', icon: Grid },
        { id: 'features', label: '৪. প্রস্তুতিতে যা প্রয়োজন', icon: Award },
        { id: 'admission', label: '৫. ভর্তি তথ্য ও নিয়ম', icon: Info },
        { id: 'about', label: '৬. পরিচিতি ও বায়ো সেকশন', icon: Users },
        ...(profileType === 'institution' ? [{ id: 'faculty', label: '৭. শিক্ষক মণ্ডলী প্যানেল', icon: Users }] : []),
        { id: 'trustBanner', label: '৮. আস্থার ব্যানার', icon: Flame },
        { id: 'gallery', label: '৯. স্মরণীয় মুহূর্ত ও ছবি', icon: ImageIcon },
        { id: 'contact', label: '১০. যোগাযোগ ও সোশ্যাল লিঙ্ক', icon: Phone },
        { id: 'helpBar', label: '১১. হেল্প ও সাপোর্ট বার', icon: HelpCircle },
      ]
    },
    {
      id: 'aboutUs',
      groupName: '📄 অ্যাবাউট পেজ (ABOUT US)',
      items: [
        { id: 'aboutHero', label: '১. হিরো ব্যানার ও স্লোগান', icon: Flame },
        { id: 'aboutStory', label: '২. আমাদের গল্প ও পরিসংখ্যান', icon: BookOpen },
        { id: 'aboutValues', label: '৩. আমাদের মূল ভিত্তি (Values)', icon: Award },
        { id: 'aboutShowcase', label: '৪. ক্যাম্পাস ও টিম মোমেন্টস', icon: ImageIcon },
        { id: 'aboutFounder', label: '৫. ফাউন্ডার ও মেন্টর প্রোফাইল', icon: User },
        { id: 'aboutCta', label: '৬. মেগা অ্যাকশন ব্যানার (CTA)', icon: Target },
      ]
    }
  ];

  const allTabs = tabGroups.flatMap(g => g.items);

  // Accordion open group state (defaults to 'home')
  const [openGroup, setOpenGroup] = useState<string>('home');

  // Auto-open corresponding accordion when activeTab changes
  useEffect(() => {
    const parentGroup = tabGroups.find(g => g.items.some(it => it.id === activeTab));
    if (parentGroup && openGroup !== parentGroup.id) {
      setOpenGroup(parentGroup.id);
    }
  }, [activeTab]);

  // Website Setup Progress Calculation
  const checklist = [
    { label: 'একাডেমি নাম ও ব্র্যান্ডিং', done: Boolean(displayName && displayName.trim().length > 0) },
    { label: 'প্রোফাইল ছবি / লোগো', done: Boolean(profilePhoto && !profilePhoto.includes('Felix')) || Boolean(coverPhoto && !coverPhoto.includes('unsplash.com/photo-1516321318423')) },
    { label: 'ব্যানার স্লাইডার', done: Boolean(heroSliders && heroSliders.length > 0 && heroSliders.some(s => s.imageUrl && !s.imageUrl.includes('unsplash.com/photo-1516321318423'))) },
    { label: 'আমাদের সম্পর্কে ও বায়ো', done: Boolean((aboutBio && aboutBio.trim().length > 15) || (bio && bio.trim().length > 15)) },
    { label: 'যোগাযোগ ও সোশ্যাল তথ্য', done: Boolean(contactPhone || contactWhatsapp || contactEmail || contactFacebookPage) }
  ];

  const completedCount = checklist.filter(c => c.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

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
      {/* DEDICATED WEBSITE BUILDER SIDEBAR (Replaces Main Sidebar on Desktop)      */}
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
                <Globe className="w-4 h-4 text-orange-500" />
                <span>ওয়েবসাইট বিল্ডার</span>
              </h3>
              <p className="text-[11px] text-foreground/50 mt-0.5">
                আপনার একাডেমি সাইট কাস্টমাইজ করুন
              </p>
            </div>
          </div>

          {/* Accordion Grouped Builder Section Items */}
          <div className="p-2.5 space-y-2">
            {tabGroups.map((group) => {
              const isOpen = openGroup === group.id;
              const hasActiveChild = group.items.some(it => it.id === activeTab);
              return (
                <div key={group.id} className="rounded-2xl border border-foreground/10 bg-background/50 overflow-hidden shadow-sm transition-all duration-300">
                  {/* Accordion Header Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isOpen) {
                        setOpenGroup('');
                      } else {
                        setOpenGroup(group.id);
                        if (!hasActiveChild && group.items.length > 0) {
                          setActiveTab(group.items[0].id as any);
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-black tracking-wide transition-all duration-200 ${
                      isOpen
                        ? 'bg-orange-500/10 text-orange-500 border-b border-orange-500/20'
                        : hasActiveChild 
                          ? 'bg-foreground/5 text-orange-500 font-bold'
                          : 'hover:bg-foreground/5 text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{group.groupName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                        {group.items.length}
                      </span>
                      <ChevronDown 
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-orange-500' : 'text-foreground/40'
                        }`} 
                      />
                    </div>
                  </button>

                  {/* Accordion Body Items */}
                  {isOpen && (
                    <div className="p-1.5 space-y-1 bg-foreground/[0.02] animate-in fade-in duration-200">
                      {group.items.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                              isActive
                                ? 'bg-orange-500 text-white shadow-md font-bold'
                                : 'hover:bg-foreground/5 text-foreground/75 hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{tab.label}</span>
                            </div>
                            <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-foreground/30'}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Action Buttons with Progress Bar */}
        <div className="p-3 border-t border-foreground/10 space-y-3">
          
          {/* Website Setup Completion Progress Bar */}
          <div className="p-3 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-foreground/[0.02] border border-orange-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>সাইট রেডি প্রগ্রেস</span>
              </div>
              <span className={`text-xs font-black ${progressPercent === 100 ? 'text-emerald-500' : 'text-orange-500'}`}>
                {progressPercent}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  progressPercent === 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-foreground/60 pt-0.5">
              <span>{progressPercent === 100 ? '🎉 সম্পূর্ণ রেডি!' : `${checklist.length - completedCount}টি তথ্য বাকি`}</span>
              <span className="font-bold">{completedCount}/{checklist.length} টি পূর্ণ</span>
            </div>
          </div>

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
          {allTabs.map((tab) => {
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
              <Globe className="w-3.5 h-3.5" />
              <span>Storefront Website Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {allTabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/60 mt-1">
              আপনার ওয়েবসাইটের এই সেকশনটির তথ্য ও ডিজাইন কাস্টমাইজ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
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
          
          {/* TAB 0: BRANDING & IDENTITY */}
          {activeTab === 'branding' && (
            <div className="space-y-8">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <span>১. ব্র্যান্ডিং ও পরিচিতি (Branding & Identity)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  আপনার প্ল্যাটফর্ম বা অ্যাকাডেমির ধরন, ব্র্যান্ড লোগো, কভার ব্যানার এবং মূল পরিচয় নির্ধারণ করুন।
                </p>
              </div>

              {/* Account Type Selector Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground/80 block uppercase tracking-wider">
                  প্ল্যাটফর্মের ধরন (Account Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Individual Teacher */}
                  <div
                    onClick={() => setProfileType('individual')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                      profileType === 'individual'
                        ? 'border-orange-500 bg-orange-500/[0.06] shadow-lg shadow-orange-500/10'
                        : 'border-foreground/10 bg-foreground/[0.02] hover:border-foreground/25'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${profileType === 'individual' ? 'bg-orange-500 text-white' : 'bg-foreground/10 text-foreground/70'}`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">একক শিক্ষক (Individual Mentor)</h4>
                        {profileType === 'individual' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                        ব্যক্তিগত শিক্ষক প্রোফাইল। হোম পেজে আপনার একক পরিচয়, শিক্ষাগত যোগ্যতা ও বায়ো প্রদর্শিত হবে।
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Institution / Academy */}
                  <div
                    onClick={() => setProfileType('institution')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                      profileType === 'institution'
                        ? 'border-orange-500 bg-orange-500/[0.06] shadow-lg shadow-orange-500/10'
                        : 'border-foreground/10 bg-foreground/[0.02] hover:border-foreground/25'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${profileType === 'institution' ? 'bg-orange-500 text-white' : 'bg-foreground/10 text-foreground/70'}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">প্রতিষ্ঠান / একাডেমি (Institution / Academy)</h4>
                        {profileType === 'institution' && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                        একাধিক শিক্ষক ও কোচিং সেন্টার। হোম পেজে “শিক্ষক মণ্ডলী” সেকশন এবং কোর্সে শিক্ষক অ্যাসাইন করার সুবিধা পাবেন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media / Photos Section (Cover Banner & Profile Photo / Logo) */}
              <div className="space-y-6 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground">ব্র্যান্ড মিডিয়া ও ব্যানার</h4>

                {/* Cover Banner */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/70 block">
                    কভার ব্যানার ফটো (Cover Banner Photo) - ১২০০ × ৪০০ পিক্সেল রেকমেন্ডেড
                  </label>
                  <div className="relative aspect-[21/7] sm:aspect-[21/6] rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10 group">
                    <img src={coverPhoto} alt="Cover Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-lg">
                        {uploadingCoverPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                        <span>{uploadingCoverPhoto ? 'আপলোড হচ্ছে...' : 'কভার পরিবর্তন করুন'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadCoverPhoto} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={coverPhoto}
                      onChange={(e) => setCoverPhoto(e.target.value)}
                      placeholder="কভার ফটো URL"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 text-xs font-bold cursor-pointer transition-colors shrink-0">
                      <span>ফাইল সিলেক্ট</span>
                      <input type="file" accept="image/*" onChange={handleUploadCoverPhoto} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Profile Photo / Brand Logo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-foreground/10 border-2 border-orange-500/40 shrink-0 group">
                    <img src={profilePhoto} alt="Profile / Logo" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">পরিবর্তন</span>
                      <input type="file" accept="image/*" onChange={handleUploadProfilePhoto} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h5 className="text-xs font-bold text-foreground">
                        {profileType === 'institution' ? 'প্রতিষ্ঠানের লোগো (Brand Logo)' : 'প্রোফাইল ছবি (Teacher Portrait)'}
                      </h5>
                      <p className="text-[11px] text-foreground/60 mt-0.5">
                        PNG বা JPG ফরম্যাটে ১:১ স্কয়ার ছবি ব্যবহার করুন।
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={profilePhoto}
                        onChange={(e) => setProfilePhoto(e.target.value)}
                        placeholder="ছবির সরাসরি লিঙ্ক বা URL"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                      />
                      <label className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold cursor-pointer hover:bg-orange-600 transition-colors flex items-center gap-1.5 shrink-0">
                        {uploadingProfilePhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{uploadingProfilePhoto ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadProfilePhoto} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground">প্রাথমিক তথ্য</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      {profileType === 'institution' ? 'প্রতিষ্ঠানের নাম (Institution Name) *' : 'শিক্ষকের নাম (Display Name) *'}
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={profileType === 'institution' ? 'যেমন: SkyLearners Academy' : 'যেমন: Abu Abdullah Akash'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      {profileType === 'institution' ? 'ট্যাগলাইন বা স্লোগান (Tagline)' : 'পদবি বা বিষয় (Headline / Designation)'}
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder={profileType === 'institution' ? 'যেমন: Empowering Students to Succeed' : 'যেমন: Senior Physics Lecturer'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    সংক্ষিপ্ত পরিচিতি বা বায়ো (Short Bio / Overview)
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="আপনার অভিজ্ঞতা, উদ্দেশ্য ও শিক্ষার্থীদের প্রতি বার্তা..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 custom-scrollbar leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 0.1: FACULTY / TEACHERS ROSTER (INSTITUTION MODE ONLY) */}
          {activeTab === 'faculty' && profileType === 'institution' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <span>২. শিক্ষক মণ্ডলী ব্যবস্থাপনা (Our Faculty Roster)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    আপনার একাডেমির সকল শিক্ষক ও মেন্টরদের তালিকা তৈরি করুন। এরা হোম পেজে প্রদর্শিত হবে এবং কোর্সে সরাসরি অ্যাসাইন করা যাবে।
                  </p>
                </div>

                {!isAddingFaculty && (
                  <button
                    type="button"
                    onClick={() => { resetFacultyForm(); setIsAddingFaculty(true); }}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ নতুন শিক্ষক যোগ করুন</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Faculty Form Modal / Card */}
              {isAddingFaculty && (
                <div className="p-6 rounded-2xl bg-foreground/[0.03] border-2 border-orange-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-foreground/10">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-orange-500" />
                      <span>{editingFacultyId ? 'শিক্ষকের তথ্য সম্পাদনা করুন' : 'নতুন শিক্ষক যোগ করুন'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={resetFacultyForm}
                      className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Photo upload */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-background border border-foreground/10">
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-foreground/10 border border-foreground/15">
                        <img
                          src={facultyImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(facultyName || 'Mentor')}
                          alt="Faculty"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label className="w-full py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                        {uploadingFacultyImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{uploadingFacultyImg ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadFacultyPhoto} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={facultyImage}
                        onChange={(e) => setFacultyImage(e.target.value)}
                        placeholder="বা ছবির URL দিন"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-foreground/10 text-[11px] focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">শিক্ষকের নাম *</label>
                        <input
                          type="text"
                          value={facultyName}
                          onChange={(e) => setFacultyName(e.target.value)}
                          placeholder="যেমন: ড. রফিকুল ইসলাম"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">পদবি / ভূমিকা (Role) *</label>
                        <input
                          type="text"
                          value={facultyRole}
                          onChange={(e) => setFacultyRole(e.target.value)}
                          placeholder="যেমন: Senior Physics Instructor"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">শিক্ষাগত ব্যাকগ্রাউন্ড / বিশ্ববিদ্যালয়</label>
                        <input
                          type="text"
                          value={facultyUniversity}
                          onChange={(e) => setFacultyUniversity(e.target.value)}
                          placeholder="যেমন: BSc & MSc in Physics, BUET"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">পাঠদানের বিষয় (Subjects / Classes)</label>
                        <input
                          type="text"
                          value={facultySubjects}
                          onChange={(e) => setFacultySubjects(e.target.value)}
                          placeholder="যেমন: Physics 1st & 2nd Paper (HSC & Admission)"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">সংক্ষিপ্ত পরিচিতি বা বায়ো</label>
                        <textarea
                          value={facultyBio}
                          onChange={(e) => setFacultyBio(e.target.value)}
                          rows={2}
                          placeholder="অভিজ্ঞতা, পড়ানোর স্টাইল বা শিক্ষার্থীদের উদ্দেশ্যে বার্তা..."
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 custom-scrollbar"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">Facebook প্রোফাইল লিংক (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          value={facultyFacebook}
                          onChange={(e) => setFacultyFacebook(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-foreground/70 block mb-1">YouTube বা অন্যান্য লিংক (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          value={facultyYoutube}
                          onChange={(e) => setFacultyYoutube(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-foreground/10">
                    <button
                      type="button"
                      onClick={resetFacultyForm}
                      className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold text-foreground/70 transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFacultyMember}
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingFacultyId ? 'আপডেট সম্পন্ন করুন' : 'তালিকায় যুক্ত করুন'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Faculty List Grid */}
              {teachersRoster.length === 0 ? (
                <div className="p-10 rounded-2xl bg-foreground/[0.02] border-2 border-dashed border-foreground/15 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">এখনও কোনো শিক্ষক যুক্ত করা হয়নি</h4>
                  <p className="text-xs text-foreground/60 max-w-md mx-auto">
                    আপনার একাডেমি বা প্ল্যাটফর্মের সম্মানিত শিক্ষক ও ইন্সট্রাক্টরদের যোগ করতে উপরের “+ নতুন শিক্ষক যোগ করুন” বাটনে ক্লিক করুন।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachersRoster.map((teacher, idx) => (
                    <div
                      key={teacher.id || idx}
                      className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 hover:border-orange-500/40 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-foreground/10 border border-foreground/15 shrink-0">
                          <img
                            src={teacher.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(teacher.name)}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{teacher.name}</h4>
                          <p className="text-xs text-orange-500 font-semibold truncate">{teacher.role || 'Instructor'}</p>
                          {teacher.university && (
                            <p className="text-[11px] text-foreground/60 truncate mt-0.5">{teacher.university}</p>
                          )}
                        </div>
                      </div>

                      {teacher.subjects && (
                        <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-[11px] font-semibold truncate">
                          📚 {teacher.subjects}
                        </div>
                      )}

                      <div className="pt-2 border-t border-foreground/10 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditFaculty(teacher)}
                          className="p-1.5 rounded-lg bg-foreground/5 hover:bg-orange-500/10 text-foreground/70 hover:text-orange-500 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>এডিট</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(locale === 'bn' ? 'এই শিক্ষককে কি তালিকা থেকে মুছতে চান?' : 'Are you sure you want to remove this teacher?')) {
                              setTeachersRoster(prev => prev.filter(t => t.id !== teacher.id));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-foreground/5 hover:bg-red-500/10 text-foreground/70 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: HERO SLIDERS */}
          {activeTab === 'sliders' && (
            <div className="space-y-6">
              <div className="border-b border-foreground/10 pb-4 space-y-2">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <span>{profileType === 'institution' ? '৩. ব্যানার ইমেজ স্লাইডার (Hero Carousel)' : '২. ব্যানার ইমেজ স্লাইডার (Hero Carousel)'}</span>
                </h3>
                <p className="text-xs text-foreground/60">
                  এখানে আপলোড করা বড় ব্যানারগুলো আপনার হোম পেজের শীর্ষে স্লাইডারে ঘুরবে। ব্যানারে ক্লিক করলে শিক্ষার্থীকে নির্দিষ্ট কোর্সে নিয়ে যাওয়া হবে।
                </p>

                {/* Dimension & Aspect Ratio Guideline Alert */}
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">📐 প্রস্তাবিত ব্যানার সাইজ:</span> ১৯২০ × ৮০০ পিক্সেল (Aspect Ratio 2.4:1 বা 21:9) অথবা ১২০০ × ৫০০ পিক্সেল। এই রেজুলেশনের ছবি ব্যবহার করলে মোবাইলে ও কম্পিউটারে কোনো অংশ কাটা যাবে না।
                  </div>
                </div>
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

              {/* Custom Instructor Photo Upload */}
              <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                <label className="text-[11px] font-bold text-foreground/70 block">
                  আমাদের সম্পর্কে সেকশনের ছবি (মেন্টর / শিক্ষকের ফটো)
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-foreground/10 border-2 border-orange-500/40 flex-shrink-0">
                    <img src={aboutPhoto} alt="Instructor Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={aboutPhoto}
                      onChange={(e) => setAboutPhoto(e.target.value)}
                      placeholder="ছবির সরাসরি লিংক (URL)"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold cursor-pointer transition-colors border border-orange-500/20">
                      {uploadingAboutPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{uploadingAboutPhoto ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন / আপলোড করুন'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadAboutPhoto} className="hidden" />
                    </label>
                  </div>
                </div>
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

              {/* Standing Contact Representative Image Upload */}
              <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block">
                      যোগাযোগ সেকশনের প্রতিনিধি বা শিক্ষকের ছবি (Transparent PNG Image)
                    </label>
                    <p className="text-[11px] text-orange-500 font-semibold mt-0.5">
                      💡 প্রস্তাবিত: ব্যাকগ্রাউন্ড ছাড়া ট্রান্সপারেন্ট PNG ছবি (যেমন: ৮০০ × ৮০০ বা ৬০০ × ৮০০ পিক্সেল)। এটি কোনো বর্ডার বা ব্যাকগ্রাউন্ড বক্স ছাড়াই হোম পেজে স্বচ্ছভাবে ফুটে উঠবে।
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden bg-foreground/10 border-2 border-orange-500/40 flex-shrink-0 flex items-center justify-center p-1">
                    <img src={contactImage} alt="Contact Representative" className="w-full h-full object-contain object-bottom" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={contactImage}
                      onChange={(e) => setContactImage(e.target.value)}
                      placeholder="ছবির সরাসরি লিংক (URL)"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold cursor-pointer transition-colors border border-orange-500/20">
                      {uploadingContactImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{uploadingContactImg ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন / আপলোড করুন'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadContactImage} className="hidden" />
                    </label>
                  </div>
                </div>
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
                    placeholder="যেমন: বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতিতে"
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
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block">
                      ব্যানারের স্লাইডার ছবি (শিক্ষার্থী বা মেন্টরের ছবি)
                    </label>
                    <p className="text-[11px] text-foreground/60 mt-0.5">
                      📐 প্রস্তাবিত সাইজ: ৮০০ × ৯০০ পিক্সেল বা ৪:৫ অনুপাত (Portrait Photo)।
                    </p>
                  </div>
                  
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
                  ক্লাসরুম, সেমিনার ও শিক্ষার্থীদের অর্জনের ফটোগুলো আপলোড করুন (যা হোম পেজে স্বয়ংক্রিয়ভাবে দুই সারিতে ফাঁকা জায়গা ছাড়া ধীরগতিতে অবিরাম স্লাইড করবে)।
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

          {/* ========================================================================= */}
          {/* ABOUT US SUB-TABS (6 DEDICATED SECTIONS)                                  */}
          {/* ========================================================================= */}

          {/* 1. TAB: ABOUT HERO BANNER */}
          {activeTab === 'aboutHero' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>১. হিরো ব্যানার ও স্লোগান (Hero Banner & Intro)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অ্যাবাউট পেজের শীর্ষ ব্যানার, মূল স্লোগান, পরিচিতি ভিডিও ও বাটন কাস্টমাইজ করুন।
                  </p>
                </div>
                <Link
                  href="/about"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    মূল স্লোগান / প্রধান হেডিং (Default: "শিখবো, জিতবো")
                  </label>
                  <input
                    type="text"
                    value={aboutHeroHeading}
                    onChange={(e) => setAboutHeroHeading(e.target.value)}
                    placeholder="শিখবো, জিতবো"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    হিরো সাবটাইটেল / একাডেমি স্লোগান বিবরণ
                  </label>
                  <textarea
                    rows={3}
                    value={aboutHeroSubtitle}
                    onChange={(e) => setAboutHeroSubtitle(e.target.value)}
                    placeholder={`${displayName || 'আমাদের একাডেমি'}, দেশজুড়ে সবার জন্য মানসম্মত পড়াশোনা নিশ্চিত করতে অভিজ্ঞ মেন্টর এবং অত্যাধুনিক প্রযুক্তির সাহায্যে...`}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Button 1 Controls */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                  <span className="text-xs font-black text-orange-500">বাটন ১ (Primary Action Button)</span>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={aboutHeroBtn1Text}
                      onChange={(e) => setAboutHeroBtn1Text(e.target.value)}
                      placeholder="কোর্সগুলো দেখুন"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন লিংক / URL</label>
                    <input
                      type="text"
                      value={aboutHeroBtn1Link}
                      onChange={(e) => setAboutHeroBtn1Link(e.target.value)}
                      placeholder="/courses"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Button 2 Controls */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                  <span className="text-xs font-black text-foreground/70">বাটন ২ (Secondary Action Button)</span>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={aboutHeroBtn2Text}
                      onChange={(e) => setAboutHeroBtn2Text(e.target.value)}
                      placeholder="আমাদের গল্প পড়ুন"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন লিংক / Scroll Anchor</label>
                    <input
                      type="text"
                      value={aboutHeroBtn2Link}
                      onChange={(e) => setAboutHeroBtn2Link(e.target.value)}
                      placeholder="#story"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    পরিচিতি ভিডিও লিঙ্ক (YouTube Video URL)
                  </label>
                  <input
                    type="text"
                    value={aboutHeroVideoUrl}
                    onChange={(e) => setAboutHeroVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Hero Background Photo */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-foreground/80 block">
                    হিরো ব্যাকগ্রাউন্ড ও ভিডিও কার্ড কভার ফটো
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {aboutHeroBgImage && (
                      <img 
                        src={aboutHeroBgImage} 
                        alt="Hero Bg Preview" 
                        className="w-28 h-16 object-cover rounded-xl border border-foreground/10 shadow-sm" 
                      />
                    )}
                    <label className="px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold cursor-pointer flex items-center gap-2 transition-all">
                      {uploadingAboutHeroBg ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 text-orange-500" />}
                      <span>{uploadingAboutHeroBg ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন করুন'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadAboutHeroBg} className="hidden" disabled={uploadingAboutHeroBg} />
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. TAB: ABOUT STORY & STATS */}
          {activeTab === 'aboutStory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <span>২. আমাদের গল্প ও পরিসংখ্যান (Our Story & Live Stats)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    আপনার একাডেমির প্রতিষ্ঠাকালীন গল্প, অনুপ্রেরণামূলক বার্তা ও ৪টি প্রধান পরিসংখ্যান সেট করুন।
                  </p>
                </div>
                <Link
                  href="/about#story"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সেকশন হেডিং</label>
                  <input
                    type="text"
                    value={aboutStoryHeading}
                    onChange={(e) => setAboutStoryHeading(e.target.value)}
                    placeholder="আমাদের গল্প"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">গল্পের বিবরণ / বিস্তারিত বার্তা</label>
                  <textarea
                    rows={5}
                    value={aboutStoryDesc}
                    onChange={(e) => setAboutStoryDesc(e.target.value)}
                    placeholder="আমাদের লক্ষ্য প্রতিটি শিক্ষার্থীকে কনসেপ্ট ক্লিয়ার করে মুখস্থবিদ্যার বাইরে গিয়ে বাস্তবসম্মতভাবে পড়ানো..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Story Image */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-foreground/80 block">স্টোরি সেকশন ছবি</label>
                  <div className="flex flex-wrap items-center gap-4">
                    {aboutStoryImage && (
                      <img 
                        src={aboutStoryImage} 
                        alt="Story Preview" 
                        className="w-28 h-20 object-cover rounded-xl border border-foreground/10 shadow-sm" 
                      />
                    )}
                    <label className="px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold cursor-pointer flex items-center gap-2 transition-all">
                      {uploadingAboutStoryImg ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 text-orange-500" />}
                      <span>{uploadingAboutStoryImg ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন করুন'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadAboutStoryImg} className="hidden" disabled={uploadingAboutStoryImg} />
                    </label>
                  </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="sm:col-span-2 pt-2">
                  <label className="text-xs font-black text-foreground block mb-3">৪টি গুরুত্বপূর্ণ পরিসংখ্যান (Live Stats Numbers & Labels)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                      <label className="text-[10px] font-bold text-orange-500 block">স্ট্যাটাস ১</label>
                      <input
                        type="text"
                        value={aboutStoryStat1Num}
                        onChange={(e) => setAboutStoryStat1Num(e.target.value)}
                        placeholder="১০০+"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={aboutStoryStat1Label}
                        onChange={(e) => setAboutStoryStat1Label(e.target.value)}
                        placeholder="স্পেশাল ব্যাচ ও কোর্স"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-[11px]"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                      <label className="text-[10px] font-bold text-orange-500 block">স্ট্যাটাস ২</label>
                      <input
                        type="text"
                        value={aboutStoryStat2Num}
                        onChange={(e) => setAboutStoryStat2Num(e.target.value)}
                        placeholder="১,২০০+"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={aboutStoryStat2Label}
                        onChange={(e) => setAboutStoryStat2Label(e.target.value)}
                        placeholder="সফল শিক্ষার্থী"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-[11px]"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                      <label className="text-[10px] font-bold text-orange-500 block">স্ট্যাটাস ৩</label>
                      <input
                        type="text"
                        value={aboutStoryStat3Num}
                        onChange={(e) => setAboutStoryStat3Num(e.target.value)}
                        placeholder="৪.৯ ★"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={aboutStoryStat3Label}
                        onChange={(e) => setAboutStoryStat3Label(e.target.value)}
                        placeholder="গড় রেটিং"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-[11px]"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                      <label className="text-[10px] font-bold text-orange-500 block">স্ট্যাটাস ৪</label>
                      <input
                        type="text"
                        value={aboutStoryStat4Num}
                        onChange={(e) => setAboutStoryStat4Num(e.target.value)}
                        placeholder="৯৮%"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={aboutStoryStat4Label}
                        onChange={(e) => setAboutStoryStat4Label(e.target.value)}
                        placeholder="সন্তুষ্টি ও সাফল্য"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-foreground/10 text-[11px]"
                      />
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. TAB: ABOUT CORE VALUES */}
          {activeTab === 'aboutValues' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span>৩. আমাদের মূল ভিত্তি (Core Values Section)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অ্যাবাউট পেজের ৬টি ভ্যালু পোস্টারের শীর্ষ হেডিং ও সাবটাইটেল কাস্টমাইজ করুন।
                  </p>
                </div>
                <Link
                  href="/about"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সেকশন হেডিং (Default: "আমাদের মূল ভিত্তি")</label>
                  <input
                    type="text"
                    value={aboutValuesHeading}
                    onChange={(e) => setAboutValuesHeading(e.target.value)}
                    placeholder="আমাদের মূল ভিত্তি"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সাবটাইটেল / ভূমিকা</label>
                  <input
                    type="text"
                    value={aboutValuesSubtitle}
                    onChange={(e) => setAboutValuesSubtitle(e.target.value)}
                    placeholder="যে মূলনীতি ও দৃষ্টিভঙ্গির ওপর ভিত্তি করে আমাদের শিক্ষা কার্যক্রম পরিচালিত হয়"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. TAB: ABOUT SHOWCASE */}
          {activeTab === 'aboutShowcase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    <span>৪. ক্যাম্পাস ও টিম মোমেন্টস (Moments Showcase Slider)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অ্যাবাউট পেজের ইন্টারেক্টিভ ২-রো গ্যালারি স্লাইডারের শিরোনাম ও পরিচিতি টেক্সট পরিবর্তন করুন।
                  </p>
                </div>
                <Link
                  href="/about"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">গ্যালারি প্রধান হেডিং</label>
                  <input
                    type="text"
                    value={aboutShowcaseHeading}
                    onChange={(e) => setAboutShowcaseHeading(e.target.value)}
                    placeholder={`${displayName || 'আমাদের একাডেমি'} পরিবার`}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">গ্যালারি সাবটাইটেল</label>
                  <input
                    type="text"
                    value={aboutShowcaseSubtitle}
                    onChange={(e) => setAboutShowcaseSubtitle(e.target.value)}
                    placeholder="শিক্ষার্থীদের স্বপ্ন পূরণে নিবেদিত একদল প্রতিভাবান ও দক্ষ মেন্টর..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. TAB: ABOUT FOUNDER */}
          {activeTab === 'aboutFounder' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    <span>৫. ফাউন্ডার ও চিফ মেন্টর প্রোফাইল (Founder Spotlight)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অ্যাবাউট পেজের লাক্সারি গ্লাস মরফিক কার্ডে ফাউন্ডার/চিফ মেন্টরের বার্তা ও পোর্ট্রেট সেট করুন।
                  </p>
                </div>
                <Link
                  href="/about"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">মেন্টরের পদবি / রোল</label>
                  <input
                    type="text"
                    value={aboutFounderTitle}
                    onChange={(e) => setAboutFounderTitle(e.target.value)}
                    placeholder="প্রতিষ্ঠাতা ও চিফ মেন্টর"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Founder Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/80 block">মেন্টরের বিশেষ ছবি</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {aboutFounderPhoto && (
                      <img 
                        src={aboutFounderPhoto} 
                        alt="Founder Preview" 
                        className="w-12 h-12 rounded-xl object-cover border border-foreground/10 shadow-sm" 
                      />
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold cursor-pointer flex items-center gap-2 transition-all">
                      {uploadingAboutFounderImg ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /> : <Upload className="w-3.5 h-3.5 text-orange-500" />}
                      <span>{uploadingAboutFounderImg ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadAboutFounderImg} className="hidden" disabled={uploadingAboutFounderImg} />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">মেন্টরের বিশেষ বার্তা / কোটেশন</label>
                  <textarea
                    rows={4}
                    value={aboutFounderBio}
                    onChange={(e) => setAboutFounderBio(e.target.value)}
                    placeholder="আমাদের লক্ষ্য প্রতিটি শিক্ষার্থীকে কনসেপ্ট ক্লিয়ার করে মুখস্থবিদ্যার বাইরে গিয়ে বাস্তবসম্মতভাবে পড়ানো..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. TAB: ABOUT CTA */}
          {activeTab === 'aboutCta' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span>৬. মেগা অ্যাকশন ব্যানার (Mega CTA Banner)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অ্যাবাউট পেজের নিচের মেগা প্রস্তুতি ব্যানার, বাটন, হেল্পলাইন ও ৪টি সুবিধা চেকলিস্ট ব্যাজ কাস্টমাইজ করুন।
                  </p>
                </div>
                <Link
                  href="/about"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">শীর্ষ ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={aboutCtaBadge}
                    onChange={(e) => setAboutCtaBadge(e.target.value)}
                    placeholder="সাফল্যের শুরু হোক আজই"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">প্রধান হেডিং</label>
                  <input
                    type="text"
                    value={aboutCtaHeading}
                    onChange={(e) => setAboutCtaHeading(e.target.value)}
                    placeholder="তোমার স্বপ্নের সেরা প্রস্তুতিতে সাথে আছে"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সাবহেডিং / বিবরণ</label>
                  <input
                    type="text"
                    value={aboutCtaSubtitle}
                    onChange={(e) => setAboutCtaSubtitle(e.target.value)}
                    placeholder="দেশসেরা দিকনির্দেশনা, মানসম্মত লেকচার ও নিয়মিত মডেল টেস্টের মাধ্যমে ঘরে বসেই নাও শতভাগ প্রস্তুতি।"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* CTA Button 1 */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                  <span className="text-xs font-black text-orange-500">প্রাইমারি অ্যাকশন বাটন</span>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={aboutCtaBtn1Text}
                      onChange={(e) => setAboutCtaBtn1Text(e.target.value)}
                      placeholder="সকল কোর্সসমূহ দেখুন"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন লিংক / URL</label>
                    <input
                      type="text"
                      value={aboutCtaBtn1Link}
                      onChange={(e) => setAboutCtaBtn1Link(e.target.value)}
                      placeholder="/courses"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* CTA Button 2 */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3">
                  <span className="text-xs font-black text-foreground/70">হেল্পলাইন বাটন</span>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={aboutCtaBtn2Text}
                      onChange={(e) => setAboutCtaBtn2Text(e.target.value)}
                      placeholder="হেল্পলাইনে কল দিন"
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">হেল্পলাইন ফোন নম্বর</label>
                    <input
                      type="text"
                      value={aboutCtaPhone}
                      onChange={(e) => setAboutCtaPhone(e.target.value)}
                      placeholder={contactPhone || "017XXXXXXXX"}
                      className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* 4 Feature Checklist Badges */}
                <div className="sm:col-span-2 pt-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-2">৪টি সুবিধা চেকলিস্ট ব্যাজ</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      value={aboutCtaFeature1}
                      onChange={(e) => setAboutCtaFeature1(e.target.value)}
                      placeholder="লাইভ ক্লাস"
                      className="px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-center"
                    />
                    <input
                      type="text"
                      value={aboutCtaFeature2}
                      onChange={(e) => setAboutCtaFeature2(e.target.value)}
                      placeholder="ডেইলি এক্সাম"
                      className="px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-center"
                    />
                    <input
                      type="text"
                      value={aboutCtaFeature3}
                      onChange={(e) => setAboutCtaFeature3(e.target.value)}
                      placeholder="ডাউট সলভিং"
                      className="px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-center"
                    />
                    <input
                      type="text"
                      value={aboutCtaFeature4}
                      onChange={(e) => setAboutCtaFeature4(e.target.value)}
                      placeholder="লেকচার শিট"
                      className="px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-center"
                    />
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
