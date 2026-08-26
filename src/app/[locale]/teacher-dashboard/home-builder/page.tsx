"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { 
  Sparkles, 
  Sparkle,
  Globe,
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  BadgeCheck,
  FileCheck,
  FilePlus,
  Pin,
  AlertCircle,
  Copy,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Boxes,
  Sliders,
  BookOpen,
  Bookmark,
  BookMarked,
  Library,
  School,
  Pencil,
  Grid,
  Info,
  Phone,
  HelpCircle,
  Clock,
  Mail,
  MapPin,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Video,
  FileText,
  FileCode,
  FolderGit2,
  Users,
  UserCheck,
  UserPlus,
  MessagesSquare,
  MessageCircle,
  Compass,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Crosshair,
  Send,
  Share2,
  Megaphone,
  Briefcase,
  Building2,
  User,
  GraduationCap,
  Upload,
  Edit2,
  Camera,
  X,
  Search,
  RotateCcw,
  RefreshCw,
  Palette,
  Brush,
  Music,
  Film,
  Gift,
  Coffee,
  HeartHandshake,
  Heart,
  HeartPulse,
  Smile,
  ThumbsUp,
  Handshake,
  Zap,
  Gauge,
  Timer,
  FastForward,
  Footprints,
  Sun,
  Anchor,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  ShieldCheck,
  Shield,
  ShieldAlert,
  Lock,
  Key,
  Mountain,
  Lightbulb,
  Brain,
  Atom,
  Microscope,
  Dna,
  Binary,
  Cpu,
  Orbit,
  Puzzle,
  Rocket,
  Star,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Radio,
  Tv,
  Terminal,
  Database,
  Server,
  Wifi,
  Cloud,
  Bot,
  Code,
  type LucideIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ValueCardItem {
  id: string;
  icon: string;
  customSvg?: string;
  title: string;
  subtitle: string;
  desc: string;
  colorTheme?: string;
}

export const DEFAULT_VALUE_CARDS: ValueCardItem[] = [
  {
    id: 'val-1',
    icon: 'HeartHandshake',
    title: 'LEARNER FIRST',
    subtitle: 'শিক্ষার্থীই সবার আগে',
    desc: 'আমাদের প্রতিটি কোর্স ও সিদ্ধান্তের কেন্দ্রে থাকে শিক্ষার্থীর সর্বোচ্চ সুবিধা ও তার ভবিষ্যৎ সাফল্যের নিশ্চয়তা।',
    colorTheme: 'rose'
  },
  {
    id: 'val-2',
    icon: 'Zap',
    title: 'EXECUTE AT SPEED',
    subtitle: 'গতি ও নিখুঁত পাঠদান',
    desc: 'সিলেবাস দ্রুত ও নিখুঁতভাবে শেষ করা এবং যেকোনো প্রশ্ন বা ডাউট তাৎক্ষণিকভাবে সমাধান করাই আমাদের অঙ্গীকার।',
    colorTheme: 'amber'
  },
  {
    id: 'val-3',
    icon: 'TrendingUp',
    title: 'GROW 100X',
    subtitle: 'শতগুণ প্রবৃদ্ধি ও রূপান্তর',
    desc: 'একজন সাধারণ শিক্ষার্থীকেও ধারাবাহিক চর্চা ও সঠিক গাইডলাইনের মাধ্যমে মেধার শীর্ষে পৌঁছে দেওয়ার মানসিকতা।',
    colorTheme: 'blue'
  },
  {
    id: 'val-4',
    icon: 'ShieldCheck',
    title: 'SEIZE OWNERSHIP',
    subtitle: 'পূর্ণ দায়বদ্ধতা ও দায়িত্বশীলতা',
    desc: 'শিক্ষার্থীদের প্রতিটি পরীক্ষার ফলাফল ও প্রস্তুতির দায় আমরা নিজের কাঁধে তুলে নিই এবং শেষ পর্যন্ত পাশে থাকি।',
    colorTheme: 'emerald'
  },
  {
    id: 'val-5',
    icon: 'Mountain',
    title: 'STRIVE FOR EXCELLENCE',
    subtitle: 'শ্রেষ্ঠত্বের নিরন্তর সাধনা',
    desc: 'লেকচার শিট, পরীক্ষা পদ্ধতি কিংবা ভিডিও কোয়ালিটি—প্রতিটি ক্ষেত্রে সেরা মান নিশ্চিত করাই আমাদের লক্ষ্য।',
    colorTheme: 'orange'
  },
  {
    id: 'val-6',
    icon: 'Lightbulb',
    title: 'THINK DIFFERENT',
    subtitle: 'ভিন্ন ও আধুনিক দৃষ্টিভঙ্গি',
    desc: 'গতানুগতিক নিয়মের বাইরে গিয়ে বাস্তব উদাহরণ ও সহজ টেকনিকের সাহায্যে কঠিন বিষয়গুলোকে সহজবোধ্য করে তোলা।',
    colorTheme: 'purple'
  }
];

export const DEFAULT_INSTITUTIONAL_NOTICES = [
  {
    id: 'not_01',
    refNo: 'FB/NOT-2026/08-01',
    title: 'এইচএসসি ২০২৬ চূড়ান্ত মডেল টেস্ট ও স্পেশাল রিভিশন ক্লাসের সময়সূচি প্রকাশ',
    category: 'urgent',
    categoryLabel: 'জরুরি নোটিশ',
    date: '২৪ আগস্ট, ২০২৬',
    isPinned: true,
    isUrgent: true,
    content: `এইচএসসি ২০২৬ শিক্ষাবর্ষের সকল শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১ সেপ্টেম্বর ২০২৬ থেকে আমাদের একাডেমির চূড়ান্ত মডেল টেস্ট ও স্পেশাল রিভিশন ক্লাস শুরু হতে যাচ্ছে। 

১. সকল শিক্ষার্থীকে নির্ধারিত সময়ে প্রবেশপত্র সংগ্রহ করার নির্দেশ দেওয়া হচ্ছে।
২. মডেল টেস্টের পূর্ণাঙ্গ রুটিন ও পরীক্ষার নিয়মাবলী নিচের সংযুক্ত পিডিএফ ফাইলে দেওয়া হলো।
৩. কোনো শিক্ষার্থী পরীক্ষায় অনুপস্থিত থাকলে তাকে পরবর্তীতে অতিরিক্ত ফি দিয়ে রি-টেস্টে বসতে হবে।`,
    hasAttachment: true,
    attachmentName: 'HSC-2026-Final-Model-Test-Routine.pdf',
    attachmentSize: '১.৪ মেগাবাইট',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'not_02',
    refNo: 'FB/NOT-2026/08-02',
    title: 'অনলাইন লাইভ ক্লাসের পরিবর্তিত সাপ্তাহিক রুটিন ও জুম লিংক সংক্রান্ত বিজ্ঞপ্তি',
    category: 'routine',
    categoryLabel: 'ক্লাস রুটিন',
    date: '২২ আগস্ট, ২০২৬',
    isPinned: true,
    content: `শিক্ষার্থীদের সুবিধার্থে এবং লোডশেডিংয়ের সময় সমন্বয়ের জন্য আগামী শনিবার থেকে অনলাইন লাইভ ক্লাসের সময়ে সাময়িক পরিবর্তন আনা হয়েছে। 

প্রতি শনি, সোম ও বুধবার রাত ৮:৩০ মিনিটে এবং রবি ও মঙ্গলবার সন্ধ্যা ৭:০০ টায় নির্ধারিত জুম লিংকের মাধ্যমে ক্লাস পরিচালিত হবে। ক্লাস শুরুর ১৫ মিনিট আগে গ্রুপে পাসকোড প্রদান করা হবে।`,
    hasAttachment: true,
    attachmentName: 'Updated-Live-Class-Schedule.pdf',
    attachmentSize: '৮৫০ কিলোবাইট',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'not_03',
    refNo: 'FB/NOT-2026/08-03',
    title: 'সাপ্তাহিক অধ্যায়ভিত্তিক মেধা যাচাই পরীক্ষা ও স্কলারশিপ পুরস্কার বিতরণ',
    category: 'exam',
    categoryLabel: 'পরীক্ষা ও ফলাফল',
    date: '১৯ আগস্ট, ২০২৬',
    content: `সকল ব্যাচের শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী শুক্রবার বিকাল ৩:০০ টায় অধ্যায়ভিত্তিক বিশেষ মেধা যাচাই পরীক্ষা অনুষ্ঠিত হবে। 

উক্ত পরীক্ষায় শীর্ষস্থান অর্জনকারী শিক্ষার্থীদের পরবর্তী মাসের টিউশন ফিতে ৫০% পর্যন্ত স্কলারশিপ ওয়েভার এবং আকর্ষণীয় গিফট হ্যাম্পার প্রদান করা হবে। সময়মতো পরীক্ষায় উপস্থিত থাকার জন্য বলা হলো।`,
    hasAttachment: true,
    attachmentName: 'Weekly-Scholarship-Exam-Guidelines.pdf',
    attachmentSize: '১.১ মেগাবাইট',
    attachmentUrl: 'https://drive.google.com'
  },
  {
    id: 'not_04',
    refNo: 'FB/NOT-2026/08-04',
    title: 'সেপ্টেম্বর ২০২৬ সেশনের নতুন ব্যাচে ভর্তি ফি মওকুফ ও রেজিস্ট্রেশন শুরু',
    category: 'fees',
    categoryLabel: 'ফি ও ভর্তি',
    date: '১৫ আগস্ট, ২০২৬',
    content: `নতুন সেশনের জন্য অগ্রিম রেজিস্ট্রেশন শুরু হয়েছে। ২৫ আগস্টের মধ্যে ভর্তি নিশ্চিত করলে ২০% বিশেষ ছাড় প্রযোজ্য হবে। 

বিকাশ/নগদ পেমেন্টের মাধ্যমে সরাসরি ওয়েবসাইট থেকে রেজিস্ট্রেশন সম্পন্ন করা যাবে। যেকোনো সহায়তার জন্য সরাসরি অফিসিয়াল নম্বরে যোগাযোগ করতে অনুরোধ করা হচ্ছে।`,
    hasAttachment: false,
    attachmentName: '',
    attachmentSize: '',
    attachmentUrl: ''
  },
  {
    id: 'not_05',
    refNo: 'FB/NOT-2026/08-05',
    title: 'পবিত্র জন্মাষ্টমী ও সাপ্তাহিক বন্ধ উপলক্ষে সকল ক্লাস বন্ধ সংক্রান্ত নোটিশ',
    category: 'holiday',
    categoryLabel: 'ছুটির বিজ্ঞপ্তি',
    date: '১২ আগস্ট, ২০২৬',
    content: `সকল শিক্ষার্থী ও অভিভাবকদের সদয় অবগতির জন্য জানানো যাচ্ছে যে, সরকারি ছুটি উপলক্ষে আগামী রবিবার একাডেমির সকল অনলাইন ও অফলাইন ক্লাস বন্ধ থাকবে। 

পরবর্তী সোমবার থেকে যথারীতি রুটিন অনুযায়ী সকল ক্লাস পরিচালিত হবে। বন্ধের সময়ে পেন্ডিং বাড়ির কাজ ও রেকর্ডেড ক্লাস সম্পন্ন করতে পরামর্শ দেওয়া হলো।`,
    hasAttachment: false,
    attachmentName: '',
    attachmentSize: '',
    attachmentUrl: ''
  }
];

export const VALUE_ICON_MAP: Record<string, LucideIcon> = {
  // Values & Emotions
  HeartHandshake, Heart, HeartPulse, Smile, ThumbsUp, Handshake, Sun, Flame, Sparkles, Sparkle,
  // Speed & Action
  Zap, Rocket, Activity, Gauge, Timer, FastForward, Compass, Footprints,
  // Growth & Excellence
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Target, Crosshair, Award, Trophy, Medal, Crown, Gem, Mountain,
  // Trust & Security
  ShieldCheck, Shield, ShieldAlert, Lock, Key, CheckCircle2, BadgeCheck, FileCheck, Anchor, Eye,
  // Education & Knowledge
  BookOpen, GraduationCap, Bookmark, BookMarked, Library, School, Pencil, FileText, FileCode, FolderGit2, Layers, Boxes,
  // Science & Ideas
  Brain, Lightbulb, Atom, Microscope, Dna, Binary, Cpu, Orbit, Puzzle,
  // Tech & Media
  Laptop, Monitor, Smartphone, Video, Globe, Code, Headphones, Radio, Tv, Terminal, Database, Server, Wifi, Cloud, Bot,
  // Community & Work
  Users, UserCheck, UserPlus, MessagesSquare, MessageCircle, Briefcase, Building2, Megaphone, Share2, Send,
  // Lifestyle & Creative
  Palette, Brush, Camera, Music, Film, Gift, Coffee, Star, Check
};

export const COLOR_THEME_OPTIONS = [
  { id: 'rose', name: 'গোলাপি / Rose', border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10' },
  { id: 'amber', name: 'সোনালী / Amber', border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'blue', name: 'নীল / Ocean Blue', border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'emerald', name: 'সবুজ / Emerald', border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'orange', name: 'কমলা / Orange', border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'purple', name: 'বেগুনি / Purple', border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'cyan', name: 'সায়ান / Cyan Teal', border: 'border-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'indigo', name: 'ইন্ডিগো / Indigo', border: 'border-indigo-500', text: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

export const ICON_CATEGORIES = [
  { id: 'all', label: 'সবগুলো (All)' },
  { id: 'values', label: 'মূল্যবোধ ও বিশ্বাস' },
  { id: 'speed', label: 'গতি ও কর্মতৎপরতা' },
  { id: 'growth', label: 'উন্নতি ও শ্রেষ্ঠত্ব' },
  { id: 'trust', label: 'সুরক্ষা ও নিশ্চয়তা' },
  { id: 'education', label: 'শিক্ষা ও একাডেমি' },
  { id: 'innovation', label: 'আইডিয়া ও উদ্ভাবন' },
  { id: 'tech', label: 'টেকনোলজি ও মিডিয়া' },
  { id: 'community', label: 'টিম ও কমিউনিটি' },
  { id: 'creative', label: 'ক্রিয়েটিভিটি ও লাইফস্টাইল' }
];

export const AVAILABLE_ICONS = [
  // 1. Values & Emotion
  { id: 'HeartHandshake', name: 'সহমর্মিতা ও বিশ্বাস', category: 'values' },
  { id: 'Heart', name: 'ভালোবাসা ও কেয়ার', category: 'values' },
  { id: 'HeartPulse', name: 'উদ্যম ও স্পন্দন', category: 'values' },
  { id: 'Smile', name: 'আনন্দময় লার্নিং', category: 'values' },
  { id: 'ThumbsUp', name: 'উৎসাহ ও সাপোর্ট', category: 'values' },
  { id: 'Handshake', name: 'অংশীদারিত্ব ও চুক্তি', category: 'values' },
  { id: 'Sun', name: 'উজ্জ্বল ভবিষ্যৎ', category: 'values' },
  { id: 'Flame', name: 'আগ্রহ ও প্যাশন', category: 'values' },
  { id: 'Sparkles', name: 'চমক ও স্পার্ক', category: 'values' },
  { id: 'Sparkle', name: 'বিশেষ আলো', category: 'values' },

  // 2. Speed & Momentum
  { id: 'Zap', name: 'বিদ্যুৎ গতি ও তৎপরতা', category: 'speed' },
  { id: 'Rocket', name: 'রকেট স্পিড ও প্রবৃদ্ধি', category: 'speed' },
  { id: 'Activity', name: 'সক্রিয়তা ও গতিশীলতা', category: 'speed' },
  { id: 'Gauge', name: 'গতিমাপক ও অ্যাক্সিলারেশন', category: 'speed' },
  { id: 'Timer', name: 'সময় সচেতনতা', category: 'speed' },
  { id: 'FastForward', name: 'দ্রুত এগিয়ে যাওয়া', category: 'speed' },
  { id: 'Compass', name: 'সঠিক দিকনির্দেশনা', category: 'speed' },
  { id: 'Footprints', name: 'ধারাবাহিক পদচিহ্ন', category: 'speed' },

  // 3. Growth & Excellence
  { id: 'TrendingUp', name: 'শতগুণ প্রবৃদ্ধি (100X)', category: 'growth' },
  { id: 'TrendingDown', name: 'ঝুঁকি কমানো', category: 'growth' },
  { id: 'BarChart3', name: 'উন্নতির বার চার্ট', category: 'growth' },
  { id: 'PieChart', name: 'পরিমাপ ও অ্যানালিটিক্স', category: 'growth' },
  { id: 'LineChart', name: 'ক্রমাগত উন্নতি', category: 'growth' },
  { id: 'Target', name: 'স্পষ্ট লক্ষ্য ও ফোকাস', category: 'growth' },
  { id: 'Crosshair', name: 'নিখুঁত নিশানা', category: 'growth' },
  { id: 'Award', name: 'শ্রেষ্ঠত্ব ও মেডেল', category: 'growth' },
  { id: 'Trophy', name: 'সাফল্য ট্রফি', category: 'growth' },
  { id: 'Medal', name: 'বিশেষ সম্মাননা', category: 'growth' },
  { id: 'Crown', name: 'শীর্ষ স্থান ও নেতৃত্ব', category: 'growth' },
  { id: 'Gem', name: 'প্রিমিয়াম কোয়ালিটি', category: 'growth' },
  { id: 'Mountain', name: 'সর্বোচ্চ শিখরে পৌঁছানো', category: 'growth' },

  // 4. Trust & Security
  { id: 'ShieldCheck', name: 'পূর্ণ দায়বদ্ধতা ও নিশ্চয়তা', category: 'trust' },
  { id: 'Shield', name: 'নিরাপত্তা শিল্ড', category: 'trust' },
  { id: 'ShieldAlert', name: 'সতর্ক প্রতিরক্ষা', category: 'trust' },
  { id: 'Lock', name: 'গোপনীয়তা ও নিরাপত্তা', category: 'trust' },
  { id: 'Key', name: 'সাফল্যের চাবিকাঠি', category: 'trust' },
  { id: 'CheckCircle2', name: 'শতভাগ নিশ্চয়তা', category: 'trust' },
  { id: 'BadgeCheck', name: 'ভেরিফায়েড ও পরীক্ষিত', category: 'trust' },
  { id: 'FileCheck', name: 'নিখুঁত ডকুমেন্টস', category: 'trust' },
  { id: 'Anchor', name: 'দৃঢ় ভিত্তি ও নির্ভরতা', category: 'trust' },
  { id: 'Eye', name: 'স্বচ্ছতা ও দৃষ্টি', category: 'trust' },

  // 5. Education & Knowledge
  { id: 'BookOpen', name: 'উন্মুক্ত বই ও পাঠদান', category: 'education' },
  { id: 'GraduationCap', name: 'উচ্চশিক্ষা ও একাডেমি', category: 'education' },
  { id: 'Bookmark', name: 'গুরুত্বপূর্ণ রিসোর্স', category: 'education' },
  { id: 'BookMarked', name: 'সংরক্ষিত লেকচার', category: 'education' },
  { id: 'Library', name: 'বিশাল লাইব্রেরি', category: 'education' },
  { id: 'School', name: 'ডিজিটাল ক্যাম্পাস', category: 'education' },
  { id: 'Pencil', name: 'অনুশীলন ও নোট', category: 'education' },
  { id: 'FileText', name: 'লেকচার শিট ও সিলেবাস', category: 'education' },
  { id: 'FileCode', name: 'কোড ফাইল ও প্রজেক্ট', category: 'education' },
  { id: 'FolderGit2', name: 'রিসোর্স ভোল্ট', category: 'education' },
  { id: 'Layers', name: 'ধাপভিত্তিক সিলেবাস', category: 'education' },
  { id: 'Boxes', name: 'কমপ্লিট কোর্স প্যাকেজ', category: 'education' },

  // 6. Science & Ideas
  { id: 'Brain', name: 'তীক্ষ্ণ মেধা ও কনসেপ্ট', category: 'innovation' },
  { id: 'Lightbulb', name: 'ভিন্নধর্মী আইডিয়া ও চিন্তা', category: 'innovation' },
  { id: 'Atom', name: 'গভীর বিজ্ঞান ও সূত্র', category: 'innovation' },
  { id: 'Microscope', name: 'সূক্ষ্ম পর্যবেক্ষণ', category: 'innovation' },
  { id: 'Dna', name: 'মৌলিক ভিত্তি', category: 'innovation' },
  { id: 'Binary', name: 'লজিক্যাল থিংকিং', category: 'innovation' },
  { id: 'Cpu', name: 'স্মার্ট মেথডলজি', category: 'innovation' },
  { id: 'Orbit', name: 'পরিকল্পিত গতিপথ', category: 'innovation' },
  { id: 'Puzzle', name: 'প্রবলেম সলভিং স্কিল', category: 'innovation' },

  // 7. Tech & Media
  { id: 'Laptop', name: 'অনলাইন লাইভ লার্নিং', category: 'tech' },
  { id: 'Monitor', name: 'বড় স্ক্রিন ক্লাস', category: 'tech' },
  { id: 'Smartphone', name: 'মোবাইল ফ্রেন্ডলি অ্যাপ', category: 'tech' },
  { id: 'Video', name: 'HD ভিডিও লেকচার', category: 'tech' },
  { id: 'Globe', name: 'দেশব্যাপী সুযোগ', category: 'tech' },
  { id: 'Code', name: 'প্রোগ্রামিং ও টেকনিক', category: 'tech' },
  { id: 'Headphones', name: 'মনোযোগ ও অডিও লিসেনিং', category: 'tech' },
  { id: 'Radio', name: 'সরাসরি ব্রডকাস্ট', category: 'tech' },
  { id: 'Tv', name: 'স্মার্ট টিভি ক্লাসরুম', category: 'tech' },
  { id: 'Terminal', name: 'হ্যান্ডস-অন প্র্যাকটিস', category: 'tech' },
  { id: 'Database', name: 'প্রশ্নব্যাংক ও আর্কাইভ', category: 'tech' },
  { id: 'Server', name: '২৪/৭ সার্ভার সাপোর্ট', category: 'tech' },
  { id: 'Wifi', name: 'হাই-স্পিড কানেক্টিভিটি', category: 'tech' },
  { id: 'Cloud', name: 'ক্লাউড অ্যাক্সেস', category: 'tech' },
  { id: 'Bot', name: 'AI অ্যাসিস্ট্যান্ট সাপোর্ট', category: 'tech' },

  // 8. Community & Work
  { id: 'Users', name: 'টিম ও শিক্ষার্থী কমিউনিটি', category: 'community' },
  { id: 'UserCheck', name: 'ব্যক্তিগত মেন্টরশিপ', category: 'community' },
  { id: 'UserPlus', name: 'সহজ অ্যাডমিশন', category: 'community' },
  { id: 'MessagesSquare', name: 'লাইভ ডাউট সলভ ফোরাম', category: 'community' },
  { id: 'MessageCircle', name: '২৪/৭ হেল্পলাইন চ্যাট', category: 'community' },
  { id: 'Briefcase', name: 'ক্যারিয়ার ও প্রফেশনাল তৈরি', category: 'community' },
  { id: 'Building2', name: 'প্রতিষ্ঠানের মর্যাদা', category: 'community' },
  { id: 'Megaphone', name: 'জরুরি নোটিশ ও অ্যানাউন্সমেন্ট', category: 'community' },
  { id: 'Share2', name: 'জ্ঞান বিনিময়', category: 'community' },
  { id: 'Send', name: 'সরাসরি প্রতিক্রিয়া', category: 'community' },

  // 9. Lifestyle & Creativity
  { id: 'Palette', name: 'সৃজনশীল ডিজাইন ও আর্ট', category: 'creative' },
  { id: 'Brush', name: 'দক্ষতা পরিমার্জন', category: 'creative' },
  { id: 'Camera', name: 'স্মরণীয় মোমেন্টস', category: 'creative' },
  { id: 'Music', name: 'ছন্দ ও আনন্দ', category: 'creative' },
  { id: 'Film', name: 'ভিজ্যুয়াল স্টোরিটেলিং', category: 'creative' },
  { id: 'Gift', name: 'বিশেষ স্কলারশিপ ও গিফট', category: 'creative' },
  { id: 'Coffee', name: 'অবিরাম পরিশ্রম ও চর্চা', category: 'creative' },
  { id: 'Star', name: '৫ স্টার কোয়ালিটি', category: 'creative' },
  { id: 'Check', name: 'সম্পূর্ণ কমপ্লিট সিলেবাস', category: 'creative' }
];

function ImageSizeGuideBadge({ size, note }: { size: string; note?: string }) {
  return (
    <div className="relative inline-flex items-center group">
      <button
        type="button"
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30 text-[11px] font-black transition-all cursor-pointer shadow-xs"
      >
        <Info className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <span>সাইজ গাইড</span>
      </button>

      {/* Floating Hover/Click Tooltip Popover (Right aligned to prevent overflow) */}
      <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block group-focus-within:block z-50 w-64 sm:w-72 p-3.5 rounded-2xl bg-zinc-950 text-white border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs font-black text-orange-400 border-b border-white/10 pb-1.5 mb-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>প্রস্তাবিত রেজোলিউশন (Pixels)</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/70 font-medium">সাইজ:</span>
            <span className="px-2 py-0.5 rounded-lg bg-orange-500/25 text-orange-300 font-mono font-black border border-orange-500/40 text-[12px]">{size}</span>
          </div>
          {note && (
            <p className="text-[11px] text-white/80 leading-relaxed pt-0.5">
              {note}
            </p>
          )}
          <div className="pt-1.5 border-t border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Desktop, Tablet ও Mobile-এ পারফেক্ট ফিট হবে</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherHomePageBuilderPage() {
  const { user } = useAuth();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [activeTab, setActiveTab] = useState<
    'branding' | 'headerSettings' | 'footerSettings' | 'faculty' | 'sliders' | 'quickCards' | 'categories' | 'features' | 'admission' | 'about' | 'contact' | 'trustBanner' | 'gallery' | 'helpBar' | 'aboutHero' | 'aboutStory' | 'aboutValues' | 'aboutShowcase' | 'aboutFounder' | 'aboutCta' | 'contactHero' | 'contactCards' | 'contactSchedule' | 'contactSocial' | 'contactFaq' | 'contactCta'
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

  // 0.0 Header & Footer Dedicated States
  const [headerLogo, setHeaderLogo] = useState('');
  const [uploadingHeaderLogo, setUploadingHeaderLogo] = useState(false);
  const [headerTagline, setHeaderTagline] = useState('Teacher Academy');
  const [footerBio, setFooterBio] = useState('অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম।');
  const [footerCopyright, setFooterCopyright] = useState('');

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
  const [contactAddress, setContactAddress] = useState('ফার্মগেট / মৌচাক শাখা, ঢাকা, বাংলাদেশ');
  const [contactOfficeHours, setContactOfficeHours] = useState('প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা');
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
  const [aboutValueCards, setAboutValueCards] = useState<ValueCardItem[]>(DEFAULT_VALUE_CARDS);
  const [iconPickerCardId, setIconPickerCardId] = useState<string | null>(null);
  const [iconPickerTab, setIconPickerTab] = useState<'lucide' | 'svg'>('lucide');
  const [customSvgInput, setCustomSvgInput] = useState('');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [iconCategoryFilter, setIconCategoryFilter] = useState('all');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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

  // 12. Full Contact Page Builder State (📞 যোগাযোগ পেজ)
  const [contactHeroTag, setContactHeroTag] = useState('');
  const [contactHeroTitle, setContactHeroTitle] = useState('যেকোনো প্রয়োজনে আমরা আছি তোমার পাশে');
  const [contactHeroSubtitle, setContactHeroSubtitle] = useState('দেশসেরা মেন্টরদের সাথে শতভাগ প্রস্তুতি');
  const [contactBadge1, setContactBadge1] = useState('ইনস্ট্যান্ট হোয়াটসঅ্যাপ রিপ্লাই');
  const [contactBadge2, setContactBadge2] = useState('২৪/৭ ডিরেক্ট কল সার্ভিস');
  const [contactResponseTime, setContactResponseTime] = useState('৫ — ১৫ মিনিট');
  const [contactMapUrl, setContactMapUrl] = useState('');
  const [contactFaqs, setContactFaqs] = useState<Array<{ id: string; q: string; a: string }>>([
    {
      id: 'faq-1',
      q: 'আমি কীভাবে পছন্দের কোর্সে ভর্তি নিশ্চিত করব?',
      a: 'কোর্স পেজে গিয়ে পছন্দের কোর্সটি সিলেক্ট করে "এনরোল করুন" বাটনে চাপুন। এরপর বিকাশ, নগদ বা রকেটের মাধ্যমে কোর্স ফি পাঠিয়ে ট্রানজ্যাকশন আইডি (TrxID) সাবমিট করলেই কিছুক্ষণের মধ্যে ড্যাশবোর্ডে কোর্সটি আনলক হয়ে যাবে।'
    },
    {
      id: 'faq-2',
      q: 'পেমেন্ট সম্পন্ন করার পর কী করতে হবে?',
      a: 'পেমেন্ট সাবমিটের পর আপনার রিকোয়েস্টটি পেন্ডিং থাকবে। শিক্ষক বা অ্যাডমিন ভেরিফাই করে অ্যাপ্রুভ করার সাথে সাথে আপনার ড্যাশবোর্ডে সব ক্লাস, লেকচার শিট ও এক্সাম স্বয়ংক্রিয়ভাবে ওপেন হয়ে যাবে।'
    },
    {
      id: 'faq-3',
      q: 'লাইভ ক্লাস মিস হলে পরবর্তীতে রেকর্ডেড ক্লাস পাওয়া যাবে কি?',
      a: 'হ্যাঁ, অবশ্যই! প্রতিটি লাইভ ক্লাসের পর ফুল এইচডি রেকর্ডেড ভিডিও লেকচার স্টুডেন্ট ড্যাশবোর্ডের "রেকর্ডেড ক্লাসেস" সেকশনে যুক্ত হয়ে যায়, যা কোর্স ভ্যালিডিটি চলাকালীন যতবার ইচ্ছা রিভিশন দেওয়া যায়।'
    },
    {
      id: 'faq-4',
      q: 'অফলাইন শিট ও দাগানো বই কীভাবে সংগ্রহ করব?',
      a: 'আমাদের অফলাইন ব্রাঞ্চে এসে সরাসরি লেকচার শিট সংগ্রহ করা যাবে অথবা ড্যাশবোর্ডের রিসোর্স সেকশন থেকে হাই-কোয়ালিটি PDF ডাউনলোড করে প্রিন্ট করে নিতে পারবেন।'
    },
    {
      id: 'faq-5',
      q: 'যেকোনো জরুরি প্রয়োজনে তাৎক্ষণিক সমাধান কীভাবে পাব?',
      a: 'আমাদের সরাসরি হোয়াটসঅ্যাপ হেল্পলাইনে মেসেজ দিন অথবা এই পেজের ফর্মটি পূরণ করে পাঠান। আমাদের ডেডিকেটেড সাপোর্ট টিম দ্রুততম সময়ে সমাধান করে দেবে।'
    }
  ]);
  const [contactCtaBadge, setContactCtaBadge] = useState('সাফল্যের সূচনা হোক আজই');
  const [contactCtaTitle, setContactCtaTitle] = useState('তোমার স্বপ্নের সেরা প্রস্তুতিতে আমরা আছি সাথে');
  const [contactCtaSubtitle, setContactCtaSubtitle] = useState('লাইভ ক্লাস, নিয়মিত মডেল টেস্ট ও স্পেশালাইজড শিটের সাথে এখনই তোমার পছন্দের ব্যাচে যুক্ত হও।');
  const [contactCtaBtn1Text, setContactCtaBtn1Text] = useState('সকল কোর্সসমূহ দেখুন');
  const [contactCtaBtn2Text, setContactCtaBtn2Text] = useState('হেল্পলাইনে কল দিন');

  // 13. Dynamic Custom Pages & Controls State
  const [customNavLinks, setCustomNavLinks] = useState<any[]>([]);
  const [customPagesConfig, setCustomPagesConfig] = useState<Record<string, any>>({});

  // Notice Form State for Notice Management Tab
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeRefNo, setNewNoticeRefNo] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'urgent' | 'exam' | 'routine' | 'fees' | 'holiday' | 'general'>('exam');
  const [newNoticeDate, setNewNoticeDate] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeAttachmentName, setNewNoticeAttachmentName] = useState('');
  const [newNoticeAttachmentSize, setNewNoticeAttachmentSize] = useState('');
  const [newNoticeAttachmentUrl, setNewNoticeAttachmentUrl] = useState('');
  const [newNoticeIsPinned, setNewNoticeIsPinned] = useState(false);
  const [newNoticeIsUrgent, setNewNoticeIsUrgent] = useState(false);
  const [uploadingNoticeHeroBg, setUploadingNoticeHeroBg] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Excluded & Disabled Pages State
  const [disabledStandardPages, setDisabledStandardPages] = useState<string[]>([]);
  const [globallyExcludedPages, setGloballyExcludedPages] = useState<string[]>([]);

  // Track Unsaved Changes & Section Navigation Guard
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);
  const [pendingGroupSwitch, setPendingGroupSwitch] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
          if (data.customNavLinks && Array.isArray(data.customNavLinks)) {
            setCustomNavLinks(data.customNavLinks);
          }
          if (data.disabledPages && Array.isArray(data.disabledPages)) {
            setDisabledStandardPages(data.disabledPages);
          } else if (data.disabledStandardPages && Array.isArray(data.disabledStandardPages)) {
            setDisabledStandardPages(data.disabledStandardPages);
          }

          // Fetch globally excluded pages for this teacher
          try {
            const globalPagesSnap = await getDoc(doc(db, 'platformSettings', 'globalTeacherPages'));
            if (globalPagesSnap.exists()) {
              const gData = globalPagesSnap.data();
              if (gData.pages && Array.isArray(gData.pages)) {
                const excludedIds: string[] = [];
                gData.pages.forEach((gp: any) => {
                  if (gp.excludedTeacherIds && Array.isArray(gp.excludedTeacherIds) && gp.excludedTeacherIds.includes(user.uid)) {
                    if (gp.id) excludedIds.push(gp.id.toLowerCase());
                    if (gp.slug) {
                      excludedIds.push(gp.slug.toLowerCase());
                      excludedIds.push(gp.slug.replace('/', '').toLowerCase());
                    }
                  }
                });
                setGloballyExcludedPages(excludedIds);
              }
            }
          } catch (gErr) {
            console.error("Error fetching global excluded pages in builder:", gErr);
          }

          const config = data.homePageConfig;
          if (config) {
            if (config.customPagesConfig) {
              setCustomPagesConfig(config.customPagesConfig);
            }
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
            if (data.headerLogo || data.logoUrl || config.headerLogo) setHeaderLogo(data.headerLogo || data.logoUrl || config.headerLogo);
            if (data.headerTagline || config.headerTagline) setHeaderTagline(data.headerTagline || config.headerTagline);
            if (data.footerBio || config.footerBio) setFooterBio(data.footerBio || config.footerBio);
            if (data.footerCopyright || config.footerCopyright) setFooterCopyright(data.footerCopyright || config.footerCopyright);

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
            if (config.contactAddress) setContactAddress(config.contactAddress);
            if (config.contactOfficeHours) setContactOfficeHours(config.contactOfficeHours);
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
            if (abConfig.valueCards && Array.isArray(abConfig.valueCards) && abConfig.valueCards.length > 0) {
              setAboutValueCards(abConfig.valueCards);
            }
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

            // Populate Contact Page Config
            const ctConfig = config.contactPageConfig || data.contactPageConfig || {};
            if (ctConfig.heroTag) setContactHeroTag(ctConfig.heroTag);
            if (ctConfig.heroTitle) setContactHeroTitle(ctConfig.heroTitle);
            if (ctConfig.heroSubtitle) setContactHeroSubtitle(ctConfig.heroSubtitle);
            if (ctConfig.badge1) setContactBadge1(ctConfig.badge1);
            if (ctConfig.badge2) setContactBadge2(ctConfig.badge2);
            if (ctConfig.responseTime) setContactResponseTime(ctConfig.responseTime);
            if (ctConfig.mapUrl) setContactMapUrl(ctConfig.mapUrl);
            if (ctConfig.faqs && Array.isArray(ctConfig.faqs) && ctConfig.faqs.length > 0) {
              setContactFaqs(ctConfig.faqs);
            }
            if (ctConfig.ctaBadge) setContactCtaBadge(ctConfig.ctaBadge);
            if (ctConfig.ctaTitle) setContactCtaTitle(ctConfig.ctaTitle);
            if (ctConfig.ctaSubtitle) setContactCtaSubtitle(ctConfig.ctaSubtitle);
            if (ctConfig.ctaBtn1Text) setContactCtaBtn1Text(ctConfig.ctaBtn1Text);
            if (ctConfig.ctaBtn2Text) setContactCtaBtn2Text(ctConfig.ctaBtn2Text);
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
        customPagesConfig,
        headerLogo,
        headerTagline,
        footerBio,
        footerCopyright,
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
        contactAddress,
        contactOfficeHours,
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
          valueCards: aboutValueCards,
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
        contactPageConfig: {
          heroTag: contactHeroTag,
          heroTitle: contactHeroTitle,
          heroSubtitle: contactHeroSubtitle,
          badge1: contactBadge1,
          badge2: contactBadge2,
          responseTime: contactResponseTime,
          mapUrl: contactMapUrl,
          faqs: contactFaqs,
          ctaBadge: contactCtaBadge,
          ctaTitle: contactCtaTitle,
          ctaSubtitle: contactCtaSubtitle,
          ctaBtn1Text: contactCtaBtn1Text,
          ctaBtn2Text: contactCtaBtn2Text
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
        headerLogo: headerLogo || profilePhoto,
        logoUrl: headerLogo || profilePhoto,
        headerTagline: headerTagline || 'Teacher Academy',
        footerBio: footerBio || headline || bio || '',
        footerCopyright: footerCopyright || '',
        coverPhoto,
        teachersRoster,
        contactPhone,
        contactWhatsapp,
        contactEmail,
        contactAddress,
        contactOfficeHours,
        contactFacebookPage,
        contactFacebookGroup,
        contactYoutube,
        contactTelegram,
        homePageConfig: fullConfig,
        customPagesConfig: customPagesConfig,
        aboutPageConfig: fullConfig.aboutPageConfig,
        contactPageConfig: fullConfig.contactPageConfig
      }, { merge: true });

      // Also update users collection if displayName or photo changed
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName || user.displayName,
        photoURL: profilePhoto || user.photoURL,
        profilePhoto: profilePhoto || user.photoURL,
      }, { merge: true }).catch(() => {});

      setHasUnsavedChanges(false);

      let pageName = 'হোম';
      if (activeTab === 'branding') {
        pageName = 'ব্র্যান্ডিং ও পরিচিতি';
      } else if (activeTab.startsWith('about')) {
        pageName = 'অ্যাবাউট';
      } else if (activeTab.startsWith('contact')) {
        pageName = 'যোগাযোগ';
      } else if (activeTab.startsWith('custom_')) {
        const matchingNav = customNavLinks.find(c => activeTab.startsWith(`custom_${(c.slug || '').replace('/', '').toLowerCase()}`));
        pageName = matchingNav ? matchingNav.name : 'নোটিশ';
      }

      toast.success(
        locale === 'bn' 
          ? `${pageName} পেজের সেটিংস সফলভাবে সংরক্ষিত হয়েছে!` 
          : `${pageName} page settings saved successfully!`,
        { icon: '💾' }
      );
      return true;
    } catch (err) {
      console.error('Error saving home page config:', err);
      toast.error(locale === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save configuration');
      return false;
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
      if (!headerLogo) setHeaderLogo(url);
      setHasUnsavedChanges(true);
      toast.success(locale === 'bn' ? 'প্রোফাইল/লোগো ছবি আপলোড হয়েছে!' : 'Profile/Logo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  // Header Dedicated Logo upload handler
  const handleUploadHeaderLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeaderLogo(true);
    try {
      const url = await uploadImageToImgBB(file);
      setHeaderLogo(url);
      setHasUnsavedChanges(true);
      toast.success(locale === 'bn' ? 'হেডার লোগো সফলভাবে আপলোড হয়েছে!' : 'Header logo uploaded!');
    } catch (err) {
      toast.error(locale === 'bn' ? 'লোগো আপলোড ব্যর্থ হয়েছে' : 'Failed to upload header logo');
    } finally {
      setUploadingHeaderLogo(false);
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

  // Notice Management Handlers
  const handleStartEditNotice = (notice: any) => {
    setEditingNoticeId(notice.id);
    setNewNoticeTitle(notice.title || '');
    setNewNoticeRefNo(notice.refNo || '');
    setNewNoticeCategory(notice.category || 'exam');
    setNewNoticeDate(notice.date || '');
    setNewNoticeContent(notice.content || '');
    setNewNoticeAttachmentName(notice.attachmentName || '');
    setNewNoticeAttachmentSize(notice.attachmentSize || '');
    setNewNoticeAttachmentUrl(notice.attachmentUrl || '');
    setNewNoticeIsPinned(Boolean(notice.isPinned));
    setNewNoticeIsUrgent(Boolean(notice.isUrgent));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('নোটিশ এডিট মোড সক্রিয় হয়েছে', { icon: '✏️' });
  };

  const handleCancelEditNotice = () => {
    setEditingNoticeId(null);
    setNewNoticeTitle('');
    setNewNoticeRefNo('');
    setNewNoticeCategory('exam');
    setNewNoticeDate('');
    setNewNoticeContent('');
    setNewNoticeAttachmentName('');
    setNewNoticeAttachmentSize('');
    setNewNoticeAttachmentUrl('');
    setNewNoticeIsPinned(false);
    setNewNoticeIsUrgent(false);
  };

  const handleSaveOrAddNotice = (slugKey: string) => {
    if (!newNoticeTitle.trim()) {
      toast.error('অনুগ্রহ করে নোটিশের শিরোনাম লিখুন');
      return;
    }

    const currentList = customPagesConfig[slugKey]?.notices !== undefined
      ? (customPagesConfig[slugKey]?.notices || [])
      : DEFAULT_INSTITUTIONAL_NOTICES;

    const categoryLabels: Record<string, string> = {
      urgent: 'জরুরি বিজ্ঞপ্তি',
      exam: 'পরীক্ষা ও ফলাফল',
      routine: 'ক্লাস রুটিন',
      fees: 'ফি ও ভর্তি',
      holiday: 'ছুটির নোটিশ',
      general: 'সাধারণ বিজ্ঞপ্তি'
    };

    if (editingNoticeId) {
      const updatedList = currentList.map((n: any) => {
        if (n.id === editingNoticeId) {
          return {
            ...n,
            title: newNoticeTitle.trim(),
            refNo: newNoticeRefNo.trim() || n.refNo || `FB/NOT-2026/08-${Math.floor(Math.random() * 90 + 10)}`,
            category: newNoticeCategory,
            categoryLabel: categoryLabels[newNoticeCategory] || 'সাধারণ বিজ্ঞপ্তি',
            date: newNoticeDate.trim() || n.date,
            content: newNoticeContent.trim(),
            hasAttachment: Boolean(newNoticeAttachmentUrl.trim() || newNoticeAttachmentName.trim()),
            attachmentName: newNoticeAttachmentName.trim() || (newNoticeAttachmentUrl.trim() ? 'Notice-Document.pdf' : ''),
            attachmentSize: newNoticeAttachmentSize.trim() || (newNoticeAttachmentUrl.trim() ? '১.২ মেগাবাইট' : ''),
            attachmentUrl: newNoticeAttachmentUrl.trim(),
            isPinned: newNoticeIsPinned,
            isUrgent: newNoticeIsUrgent
          };
        }
        return n;
      });

      setCustomPagesConfig(prev => ({
        ...prev,
        [slugKey]: {
          ...(prev[slugKey] || {}),
          notices: updatedList
        }
      }));

      handleCancelEditNotice();
      toast.success('নোটিশ সফলভাবে আপডেট হয়েছে!', { icon: '💾' });
    } else {
      const newNoticeObj = {
        id: `notice_${Date.now()}`,
        refNo: newNoticeRefNo.trim() || `FB/NOT-2026/08-${Math.floor(Math.random() * 90 + 10)}`,
        title: newNoticeTitle.trim(),
        category: newNoticeCategory,
        categoryLabel: categoryLabels[newNoticeCategory] || 'সাধারণ বিজ্ঞপ্তি',
        date: newNoticeDate.trim() || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        content: newNoticeContent.trim() || 'বিস্তারিত তথ্যের জন্য সংশ্লিষ্ট কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
        hasAttachment: Boolean(newNoticeAttachmentUrl.trim() || newNoticeAttachmentName.trim()),
        attachmentName: newNoticeAttachmentName.trim() || (newNoticeAttachmentUrl.trim() ? 'Notice-Document.pdf' : ''),
        attachmentSize: newNoticeAttachmentSize.trim() || (newNoticeAttachmentUrl.trim() ? '১.২ মেগাবাইট' : ''),
        attachmentUrl: newNoticeAttachmentUrl.trim(),
        isPinned: newNoticeIsPinned,
        isUrgent: newNoticeIsUrgent
      };

      setCustomPagesConfig(prev => ({
        ...prev,
        [slugKey]: {
          ...(prev[slugKey] || {}),
          notices: [newNoticeObj, ...currentList]
        }
      }));

      handleCancelEditNotice();
      toast.success('নতুন নোটিশ সফলভাবে যোগ হয়েছে!', { icon: '🎉' });
    }
  };

  const handleDeleteCustomNotice = (slugKey: string, noticeId: string) => {
    const currentList = customPagesConfig[slugKey]?.notices !== undefined
      ? (customPagesConfig[slugKey]?.notices || [])
      : DEFAULT_INSTITUTIONAL_NOTICES;

    const filtered = currentList.filter((n: any) => n.id !== noticeId);
    setCustomPagesConfig(prev => ({
      ...prev,
      [slugKey]: {
        ...(prev[slugKey] || {}),
        notices: filtered
      }
    }));
    if (editingNoticeId === noticeId) {
      handleCancelEditNotice();
    }
    toast.success('নোটিশটি মুছে ফেলা হয়েছে! লাইভ করতে "সেটিংস সংরক্ষণ করুন" বাটনে চাপুন।');
  };

  const handleRestoreDefaultNotices = (slugKey: string) => {
    if (confirm('আপনি কি সত্যিই মূল ৫টি ডিফল্ট প্রাতিষ্ঠানিক নোটিশ রিস্টোর করতে চান?')) {
      setCustomPagesConfig(prev => ({
        ...prev,
        [slugKey]: {
          ...(prev[slugKey] || {}),
          notices: DEFAULT_INSTITUTIONAL_NOTICES
        }
      }));
      handleCancelEditNotice();
      toast.success('ডিফল্ট নোটিশ রিস্টোর করা হয়েছে! লাইভ করতে "সেটিংস সংরক্ষণ করুন" বাটনে চাপুন।');
    }
  };

  const handleUploadNoticeHeroBg = async (e: React.ChangeEvent<HTMLInputElement>, slugKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNoticeHeroBg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setCustomPagesConfig(prev => ({
        ...prev,
        [slugKey]: {
          ...(prev[slugKey] || {}),
          heroBgImage: url
        }
      }));
      toast.success('হিরো ব্যাকগ্রাউন্ড ইমেজ আপলোড হয়েছে!');
    } catch (err) {
      toast.error('ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploadingNoticeHeroBg(false);
    }
  };

  // Value Cards Handlers
  const handleRestoreDefaultValueCards = () => {
    if (confirm(locale === 'bn' ? 'আপনি কি সত্যিই মূল ৬টি ডিফল্ট ভ্যালু কার্ড রিস্টোর করতে চান?' : 'Do you want to restore default value cards?')) {
      setAboutValueCards(DEFAULT_VALUE_CARDS);
      toast.success(locale === 'bn' ? 'ডিফল্ট ভ্যালু কার্ড রিস্টোর করা হয়েছে!' : 'Default value cards restored!');
    }
  };

  const handleAddValueCard = () => {
    const newCard: ValueCardItem = {
      id: `val-${Date.now()}`,
      icon: 'Sparkles',
      title: 'NEW VALUE',
      subtitle: 'নতুন মূল্যবোধ',
      desc: 'আপনার একাডেমির বিশেষ অঙ্গীকার বা মূলনীতির সংক্ষিপ্ত বিবরণ এখানে লিখুন...',
      colorTheme: 'orange'
    };
    setAboutValueCards(prev => [...prev, newCard]);
    toast.success(locale === 'bn' ? 'নতুন ভ্যালু কার্ড যোগ করা হয়েছে!' : 'New value card added!');
  };

  const handleDeleteValueCard = (id: string) => {
    if (aboutValueCards.length <= 1) {
      toast.error(locale === 'bn' ? 'কমপক্ষে ১টি ভ্যালু কার্ড রাখা আবশ্যক!' : 'At least 1 value card required!');
      return;
    }
    setAboutValueCards(prev => prev.filter(c => c.id !== id));
    toast.success(locale === 'bn' ? 'কার্ড মুছে ফেলা হয়েছে' : 'Card removed');
  };

  const handleUpdateValueCard = (id: string, field: keyof ValueCardItem, value: any) => {
    setAboutValueCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSelectIcon = (iconId: string) => {
    if (!iconPickerCardId) return;
    handleUpdateValueCard(iconPickerCardId, 'icon', iconId);
    handleUpdateValueCard(iconPickerCardId, 'customSvg', '');
    setIconPickerCardId(null);
    setIconSearchQuery('');
    toast.success(locale === 'bn' ? 'আইকন পরিবর্তন হয়েছে!' : 'Icon updated!');
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
    }
  };

  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      toast.error(locale === 'bn' ? 'দয়া করে একটি বৈধ .svg ফাইল নির্বাচন করুন' : 'Please select a valid .svg file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && content.includes('<svg')) {
        setCustomSvgInput(content);
        toast.success(locale === 'bn' ? 'SVG কোড সফলভাবে লোড হয়েছে!' : 'SVG loaded successfully!');
      } else {
        toast.error(locale === 'bn' ? 'ফাইলের মধ্যে কোনো বৈধ SVG ট্যাগ পাওয়া যায়নি' : 'No valid SVG tag found');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCustomSvg = () => {
    if (!iconPickerCardId) return;
    if (!customSvgInput.trim() || !customSvgInput.includes('<svg')) {
      toast.error(locale === 'bn' ? 'সঠিক SVG কোড লিখুন বা .svg ফাইল আপলোড করুন' : 'Please provide valid SVG code');
      return;
    }
    handleUpdateValueCard(iconPickerCardId, 'icon', 'custom-svg');
    handleUpdateValueCard(iconPickerCardId, 'customSvg', customSvgInput.trim());
    setIconPickerCardId(null);
    setCustomSvgInput('');
    toast.success(locale === 'bn' ? 'কাস্টম SVG আইকন সফলভাবে সেট হয়েছে!' : 'Custom SVG icon applied!');
  };

  const isAboutDisabled = disabledStandardPages.includes('about') || globallyExcludedPages.includes('about') || globallyExcludedPages.includes('/about');
  const isContactDisabled = disabledStandardPages.includes('contact') || globallyExcludedPages.includes('contact') || globallyExcludedPages.includes('/contact');
  const isBn = locale === 'bn';

  const tabGroups = [
    {
      id: 'branding',
      groupName: isBn ? '🎨 ব্র্যান্ডিং ও পরিচিতি' : '🎨 Branding & Identity',
      items: [
        { id: 'branding', label: isBn ? 'ব্র্যান্ডিং ও একাউন্ট টাইপ' : 'Branding & Account Mode', icon: Building2 },
      ]
    },
    {
      id: 'headerFooter',
      groupName: isBn ? '📐 হেডার ও ফুটার' : '📐 Header & Footer',
      items: [
        { id: 'headerSettings', label: isBn ? '১. হেডার লোগো ও ব্র্যান্ডিং' : '1. Header Logo & Branding', icon: LayoutDashboard },
        { id: 'footerSettings', label: isBn ? '২. ফুটার তথ্য ও সোশ্যাল লিঙ্ক' : '2. Footer Information & Socials', icon: Layers },
      ]
    },
    {
      id: 'home',
      groupName: isBn ? '🏠 হোম পেজ' : '🏠 Home Page',
      items: [
        { id: 'sliders', label: isBn ? '১. ব্যানার স্লাইডার' : '1. Hero Banner Sliders', icon: Sliders },
        { id: 'quickCards', label: isBn ? '২. পেইড ও ফ্রি কার্ডস' : '2. Paid & Free Cards', icon: Layers },
        { id: 'categories', label: isBn ? '৩. কোর্স ও ক্যাটাগরি' : '3. Course Categories', icon: Grid },
        { id: 'features', label: isBn ? '৪. প্রস্তুতিতে যা প্রয়োজন' : '4. Essential Features', icon: Award },
        { id: 'admission', label: isBn ? '৫. ভর্তি তথ্য ও নিয়ম' : '5. Admission Info & Steps', icon: Info },
        { id: 'about', label: isBn ? '৬. পরিচিতি ও বায়ো সেকশন' : '6. Teacher Bio & Intro', icon: Users },
        ...(profileType === 'institution' ? [{ id: 'faculty', label: isBn ? '৭. শিক্ষক মণ্ডলী প্যানেল' : '7. Faculty Roster', icon: Users }] : []),
        { id: 'trustBanner', label: isBn ? '৮. আস্থার ব্যানার' : '8. Trust Banner', icon: Flame },
        { id: 'gallery', label: isBn ? '৯. স্মরণীয় মুহূর্ত ও ছবি' : '9. Gallery & Moments', icon: ImageIcon },
        { id: 'contact', label: isBn ? '১০. যোগাযোগ ও সোশ্যাল লিঙ্ক' : '10. Contact & Social Links', icon: Phone },
        { id: 'helpBar', label: isBn ? '১১. হেল্প ও সাপোর্ট বার' : '11. Helpline & Support Bar', icon: HelpCircle },
      ]
    },
    ...(!isAboutDisabled ? [{
      id: 'aboutUs',
      groupName: isBn ? '📄 আমাদের সম্পর্কে' : '📄 About Us Page',
      items: [
        { id: 'aboutHero', label: isBn ? '১. হিরো ব্যানার ও স্লোগান' : '1. Hero Banner & Tagline', icon: Flame },
        { id: 'aboutStory', label: isBn ? '২. আমাদের গল্প ও পরিসংখ্যান' : '2. Our Story & Stats', icon: BookOpen },
        { id: 'aboutValues', label: isBn ? '৩. আমাদের মূল ভিত্তি (Values)' : '3. Core Values & Principles', icon: Award },
        { id: 'aboutShowcase', label: isBn ? '৪. ক্যাম্পাস ও টিম মোমেন্টস' : '4. Campus & Team Moments', icon: ImageIcon },
        { id: 'aboutFounder', label: isBn ? '৫. ফাউন্ডার ও মেন্টর প্রোফাইল' : '5. Founder & Mentor Profile', icon: User },
        { id: 'aboutCta', label: isBn ? '৬. মেগা অ্যাকশন ব্যানার (CTA)' : '6. Action Banner (CTA)', icon: Target },
      ]
    }] : []),
    ...(!isContactDisabled ? [{
      id: 'contactUs',
      groupName: isBn ? '📞 যোগাযোগ পেজ' : '📞 Contact Us Page',
      items: [
        { id: 'contactHero', label: isBn ? '১. হিরো ও লাইভ সাপোর্ট' : '1. Hero & Live Support', icon: Headphones },
        { id: 'contactCards', label: isBn ? '২. ৪টি কুইক অ্যাকশন কার্ডস' : '2. Quick Contact Cards', icon: Phone },
        { id: 'contactSchedule', label: isBn ? '৩. সাপোর্ট সময় ও ব্রাঞ্চ লোকেশন' : '3. Support Hours & Location', icon: Clock },
        { id: 'contactSocial', label: isBn ? '৪. সোশ্যাল ও ভিআইপি কমিউনিটি' : '4. Social & VIP Community', icon: Globe },
        { id: 'contactFaq', label: isBn ? '৫. সচরাচর জিজ্ঞাসা (FAQ)' : '5. Frequently Asked Questions', icon: HelpCircle },
        { id: 'contactCta', label: isBn ? '৬. মেগা অ্যাকশন ব্যানার (CTA)' : '6. Action Banner (CTA)', icon: Target },
      ]
    }] : []),
    // Dynamic Custom Pages Created for this Teacher
    ...(customNavLinks && customNavLinks.length > 0 ? customNavLinks.map((customPage: any, idx: number) => {
      const cleanSlug = (customPage.slug || `page_${idx}`).replace('/', '').toLowerCase();
      const groupKey = `custom_${cleanSlug}`;
      const isNotice = cleanSlug === 'notice';

      const items = isNotice
        ? [
            { 
              id: `${groupKey}_settings`, 
              label: isBn ? `১. ${customPage.name} পেজ ও হিরো সেটিংস` : `1. ${customPage.name} Page & Hero`, 
              icon: Sliders,
              customPage: customPage
            },
            { 
              id: `${groupKey}_manager`, 
              label: isBn ? `২. নোটিশ আপলোড ও ম্যানেজমেন্ট` : `2. Notice Upload & Management`, 
              icon: FilePlus,
              customPage: customPage
            }
          ]
        : [
            { 
              id: `${groupKey}_settings`, 
              label: isBn ? `১. ${customPage.name} পেজ কন্ট্রোলস` : `1. ${customPage.name} Page Controls`, 
              icon: Sliders,
              customPage: customPage
            }
          ];

      return {
        id: groupKey,
        groupName: `📢 ${customPage.name}`,
        isCustomPage: true,
        customPageData: customPage,
        items
      };
    }) : [])
  ];

  const allTabs = tabGroups.flatMap(g => g.items);

  const currentParentGroup = tabGroups.find(g => g.items.some(it => it.id === activeTab));
  let currentActiveSectionName = 'হোম পেজ';
  if (currentParentGroup) {
    const cpData = (currentParentGroup as any).customPageData;
    if ((currentParentGroup as any).isCustomPage) {
      currentActiveSectionName = `${cpData?.name || 'নোটিশ'} পেজ`;
    } else if (currentParentGroup.id === 'aboutUs') {
      currentActiveSectionName = 'অ্যাবাউট পেজ';
    } else if (currentParentGroup.id === 'contactUs') {
      currentActiveSectionName = 'যোগাযোগ পেজ';
    } else if (currentParentGroup.id === 'branding') {
      currentActiveSectionName = 'ব্র্যান্ডিং ও পরিচিতি';
    } else if (currentParentGroup.id === 'headerFooter') {
      currentActiveSectionName = 'হেডার ও ফুটার';
    } else if (currentParentGroup.id === 'home') {
      currentActiveSectionName = 'হোম পেজ';
    }
  }

  const handleRequestTabSwitch = (targetTabId: string, targetGroupId?: string) => {
    if (targetTabId === activeTab) return;
    if (hasUnsavedChanges) {
      setPendingTabSwitch(targetTabId);
      if (targetGroupId) setPendingGroupSwitch(targetGroupId);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(targetTabId as any);
      if (targetGroupId) setOpenGroup(targetGroupId);
    }
  };

  const handleSaveAndSwitch = async () => {
    const success = await handleSaveConfig();
    if (success) {
      if (pendingTabSwitch) setActiveTab(pendingTabSwitch as any);
      if (pendingGroupSwitch) setOpenGroup(pendingGroupSwitch);
      setPendingTabSwitch(null);
      setPendingGroupSwitch(null);
      setShowUnsavedModal(false);
    }
  };

  const handleDiscardAndSwitch = () => {
    setHasUnsavedChanges(false);
    if (pendingTabSwitch) setActiveTab(pendingTabSwitch as any);
    if (pendingGroupSwitch) setOpenGroup(pendingGroupSwitch);
    setPendingTabSwitch(null);
    setPendingGroupSwitch(null);
    setShowUnsavedModal(false);
  };

  const handleCancelSwitch = () => {
    setPendingTabSwitch(null);
    setPendingGroupSwitch(null);
    setShowUnsavedModal(false);
  };

  // Accordion open group state (defaults to 'home')
  const [openGroup, setOpenGroup] = useState<string>('home');

  // Auto-open corresponding accordion when activeTab changes
  useEffect(() => {
    const parentGroup = tabGroups.find(g => g.items.some(it => it.id === activeTab));
    if (parentGroup && openGroup !== parentGroup.id) {
      setOpenGroup(parentGroup.id);
    }
  }, [activeTab]);

  // Auto-switch away if activeTab belongs to an excluded or hidden group
  useEffect(() => {
    const isTabAvailable = allTabs.some(t => t.id === activeTab);
    if (!isTabAvailable && allTabs.length > 0) {
      setActiveTab('sliders');
    }
  }, [allTabs, activeTab]);

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
      {/* DEDICATED WEBSITE BUILDER SIDEBAR (Soft Liquid Glassmorphism)             */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 lg:w-[290px] xl:w-[305px] flex-shrink-0 bg-background/80 backdrop-blur-xl border-r border-foreground/[0.08] fixed left-0 top-[80px] h-[calc(100vh-80px)] z-40 overflow-y-auto custom-scrollbar flex-col justify-between">
        
        {/* Top Header & Back Button */}
        <div>
          <div className="p-4 border-b border-foreground/[0.08] space-y-3 bg-gradient-to-b from-foreground/[0.02] to-transparent">
            <Link 
              href="/teacher-dashboard" 
              className="inline-flex items-center gap-2 text-xs font-bold text-foreground/60 hover:text-orange-500 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>{isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
            </Link>

            <div>
              <h3 className="font-black text-base lg:text-lg text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <span>{isBn ? 'ওয়েবসাইট বিল্ডার' : 'Website Builder'}</span>
              </h3>
              <p className="text-xs text-foreground/50 mt-0.5">
                {isBn ? 'আপনার একাডেমি সাইট কাস্টমাইজ করুন' : 'Customize your academy website'}
              </p>
            </div>
          </div>

          {/* Accordion Grouped Builder Section Items (Soft Liquid Style) */}
          <div className="p-2.5 space-y-2">
            {tabGroups.map((group) => {
              const isOpen = openGroup === group.id;
              const hasActiveChild = group.items.some(it => it.id === activeTab);
              return (
                <div 
                  key={group.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-orange-500/30 bg-gradient-to-b from-orange-500/[0.07] via-orange-500/[0.02] to-transparent shadow-lg shadow-orange-500/[0.03]'
                      : hasActiveChild
                        ? 'border-orange-500/20 bg-orange-500/[0.03] shadow-xs'
                        : 'border-foreground/[0.07] bg-foreground/[0.015] hover:bg-foreground/[0.035] hover:border-foreground/15'
                  }`}
                >
                  {/* Accordion Header Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isOpen) {
                        setOpenGroup('');
                      } else {
                        if (!hasActiveChild && group.items.length > 0) {
                          handleRequestTabSwitch(group.items[0].id, group.id);
                        } else {
                          setOpenGroup(group.id);
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] sm:text-sm transition-all duration-200 cursor-pointer text-left ${
                      isOpen
                        ? 'text-orange-500 font-extrabold border-b border-orange-500/15'
                        : hasActiveChild 
                          ? 'text-orange-500 font-bold'
                          : 'text-foreground/80 hover:text-foreground font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 leading-snug">
                      <span>{group.groupName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        isOpen 
                          ? 'bg-orange-500/20 text-orange-500' 
                          : 'bg-foreground/[0.06] text-foreground/60'
                      }`}>
                        {group.items.length}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-orange-500' : 'text-foreground/40'
                        }`} 
                      />
                    </div>
                  </button>

                  {/* Accordion Body Items (Liquid Pills) */}
                  {isOpen && (
                    <div className="p-1.5 space-y-1 bg-foreground/[0.01] animate-in fade-in duration-200">
                      {group.items.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleRequestTabSwitch(tab.id, group.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12.5px] sm:text-[13px] transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-500 font-bold shadow-xs shadow-orange-500/10'
                                : 'hover:bg-foreground/[0.04] text-foreground/70 hover:text-foreground font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isActive ? (
                                <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 shadow-sm shadow-orange-500/50 shrink-0" />
                              ) : (
                                <Icon className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                              )}
                              <span>{tab.label}</span>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'text-orange-500 translate-x-0.5' : 'text-foreground/30'}`} />
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
        <div className="p-3 border-t border-foreground/[0.08] space-y-3 bg-gradient-to-t from-foreground/[0.02] to-transparent">
          
          {/* Website Setup Completion Progress Bar */}
          <div className="p-3 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-foreground/[0.02] border border-orange-500/20 rounded-2xl space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>{isBn ? 'সাইট রেডি প্রগ্রেস' : 'Site Setup Progress'}</span>
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
              <span>{progressPercent === 100 ? (isBn ? '🎉 সম্পূর্ণ রেডি!' : '🎉 All Ready!') : (isBn ? `${checklist.length - completedCount}টি তথ্য বাকি` : `${checklist.length - completedCount} items left`)}</span>
              <span className="font-bold">{completedCount}/{checklist.length} {isBn ? 'টি পূর্ণ' : 'done'}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN FULL-WIDTH CONTENT AREA (Shifted by sidebar width on Desktop)        */}
      {/* ========================================================================= */}
      <div className="md:ml-64 lg:ml-[290px] xl:ml-[305px] p-2 sm:p-4 md:p-6 space-y-6">
        
        {/* Mobile Horizontal Tabs Bar (Liquid Pills) */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-foreground/10">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleRequestTabSwitch(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/35 shadow-xs' 
                    : 'bg-foreground/[0.03] text-foreground/70 border border-foreground/[0.06] hover:bg-foreground/[0.06]'
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

          <div className="flex items-center gap-2.5">
            {/* Context-aware Quick Action Tooltips */}
            {(() => {
              const currentGroup = tabGroups.find(g => g.items.some(it => it.id === activeTab));
              const customPage = (currentGroup as any)?.customPageData;
              
              if (customPage) {
                return (
                  <div className="flex items-center gap-2">
                    {/* Status Badge Tooltip */}
                    <div className="relative group">
                      <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        customPage.isPublished 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold whitespace-nowrap shadow-2xl border border-foreground/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30">
                        {customPage.isPublished ? '🟢 লাইভ পাবলিশড (Live Published)' : '🟡 ড্রাফট মোড (Draft Mode)'}
                      </div>
                    </div>

                    {/* Live Preview Button Tooltip */}
                    <div className="relative group">
                      <a
                        href={customPage.slug}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/25 transition-all shadow-sm flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 text-orange-200 text-[11px] font-bold whitespace-nowrap shadow-2xl border border-orange-500/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30">
                        👁️ লাইভ প্রিভিউ দেখুন (নতুন ট্যাব)
                      </div>
                    </div>

                    {/* Copy Link Tooltip */}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const url = typeof window !== 'undefined' ? `${window.location.origin}${customPage.slug}` : customPage.slug;
                          navigator.clipboard.writeText(url);
                          toast.success('পেজের লিংক কপি করা হয়েছে!', { icon: '🔗' });
                        }}
                        className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border border-foreground/10 transition-all flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 text-[11px] font-bold whitespace-nowrap shadow-2xl border border-foreground/15 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30">
                        🔗 পেজ লিংক কপি করুন
                      </div>
                    </div>
                  </div>
                );
              }

              // Default Storefront Preview Button
              return (
                <div className="relative group">
                  <a
                    href={`/teachers/${user?.uid || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border border-foreground/10 transition-all flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-bold whitespace-nowrap shadow-2xl border border-foreground/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-30">
                    👁️ টিচার স্টোরফ্রন্ট লাইভ দেখুন
                  </div>
                </div>
              );
            })()}

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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground/70 block">
                      কভার ব্যানার ফটো (Cover Banner)
                    </label>
                    <ImageSizeGuideBadge size="1200 × 400 px" note="কম্পিউটার ও মোবাইলের হেডারে কোনো অংশ কাটা ছাড়া নিখুঁত ফিট হবে।" />
                  </div>
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
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-foreground">
                          {profileType === 'institution' ? 'প্রতিষ্ঠানের লোগো (Brand Logo)' : 'প্রোফাইল ছবি (Teacher Portrait)'}
                        </h5>
                        <ImageSizeGuideBadge size="500 × 500 px" note="স্কয়ার বা রাউন্ড ফ্রেমে ক্রিস্প ও স্পষ্টভাবে প্রদর্শিত হবে।" />
                      </div>
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

          {/* TAB: HEADER SETTINGS (হেডার লোগো ও ব্র্যান্ডিং) */}
          {activeTab === 'headerSettings' && (
            <div className="space-y-8">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-orange-500" />
                  <span>১. হেডার লোগো ও ব্র্যান্ডিং (Header & Branding)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  আপনার স্টোরফ্রন্ট ওয়েবসাইটের শীর্ষ হেডার বারের লোগো, নাম, ট্যাগলাইন এবং নেভিগেশন ডিসপ্লে কাস্টমাইজ করুন।
                </p>
              </div>

              {/* Live Interactive Header Preview Banner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground/80 block uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-500" />
                    <span>হেডার লাইভ প্রিভিউ (Live Header Preview)</span>
                  </label>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>রিয়েলটাইম প্রিভিউ</span>
                  </span>
                </div>

                {/* Preview Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 shadow-xl overflow-hidden relative">
                  <div className="flex items-center justify-between gap-4">
                    {/* Brand Logo & Name Slot */}
                    <div className="flex items-center gap-3">
                      {headerLogo || profilePhoto ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-orange-500/40 bg-orange-500/10 shadow-sm shrink-0 flex items-center justify-center">
                          <img src={headerLogo || profilePhoto} alt={displayName || 'Logo'} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-base shadow-md shadow-orange-500/20 shrink-0">
                          {(displayName || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-sm sm:text-base text-white leading-tight">
                          {displayName || 'আপনার একাডেমি নাম'}
                        </div>
                        <div className="text-[10px] font-semibold text-orange-400 leading-none mt-0.5">
                          {headerTagline || 'Teacher Academy'}
                        </div>
                      </div>
                    </div>

                    {/* Nav Links in Preview */}
                    <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-white/80">
                      <span className="text-orange-400 border-b-2 border-orange-500 pb-0.5">হোম</span>
                      <span className="hover:text-white transition-colors cursor-pointer">কোর্সসমূহ</span>
                      <span className="hover:text-white transition-colors cursor-pointer">আমাদের সম্পর্কে</span>
                      <span className="hover:text-white transition-colors cursor-pointer">যোগাযোগ</span>
                      {customNavLinks && customNavLinks.filter((c: any) => c.enabled !== false).map((c: any) => (
                        <span key={c.id || c.slug} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                          {c.name}
                        </span>
                      ))}
                    </div>

                    {/* Right side demo action */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[11px] font-bold">
                        অফিশিয়াল স্টোরফ্রন্ট
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Logo Upload & Configuration */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      <span>হেডার ডেডিকেটেড লোগো (Header Custom Logo)</span>
                    </h4>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      ওয়েবসাইটের হেডারের জন্য আলাদা লোগো বা ব্র্যান্ড ইমেজ আপলোড করুন। খালি রাখলে প্রোফাইল ছবি ব্যবহার হবে।
                    </p>
                  </div>
                  <ImageSizeGuideBadge size="300 × 80 px (বা 500 × 500 px স্কয়ার)" note="ট্রান্সপারেন্ট PNG লোগো সবচেয়ে সুন্দর দেখাবে।" />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10">
                  {/* Logo Preview */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-foreground/20 bg-foreground/5 flex items-center justify-center shrink-0">
                    {headerLogo ? (
                      <img src={headerLogo} alt="Header Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="text-center p-2 text-foreground/40">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-60" />
                        <span className="text-[10px] font-semibold block">লোগো নেই</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={headerLogo}
                        onChange={(e) => { setHeaderLogo(e.target.value); setHasUnsavedChanges(true); }}
                        placeholder="হেডার লোগোর সরাসরি URL পেস্ট করুন"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                      />
                      <label className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold cursor-pointer hover:bg-orange-600 transition-colors flex items-center gap-1.5 shrink-0">
                        {uploadingHeaderLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{uploadingHeaderLogo ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadHeaderLogo} className="hidden" />
                      </label>
                      {headerLogo && (
                        <button
                          type="button"
                          onClick={() => { setHeaderLogo(''); setHasUnsavedChanges(true); }}
                          className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold shrink-0"
                          title="লোগো মুছে ফেলুন"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-foreground/50">
                      💡 টিপস: আপনি এখানে কোনো লোগো আপলোড না করলে স্বয়ংক্রিয়ভাবে আপনার প্রোফাইল ছবি ও নাম ব্যবহার করা হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Header Text & Tagline Configuration */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground">হেডার টেক্সট ও ট্যাগলাইন</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      হেডারে প্রদর্শিত নাম (Brand / Teacher Name) *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: Abu Abdullah Akash"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      হেডার সাব-ট্যাগলাইন (Header Tagline Badge)
                    </label>
                    <input
                      type="text"
                      value={headerTagline}
                      onChange={(e) => { setHeaderTagline(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: Teacher Academy বা অনলাইন লার্নিং প্ল্যাটফর্ম"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Links Status Summary */}
              <div className="p-4 rounded-2xl bg-orange-500/[0.04] border border-orange-500/20 space-y-2">
                <h5 className="text-xs font-bold text-orange-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>হেডার নেভিগেশন মেনু লিঙ্কসমূহ (Active Header Menu)</span>
                </h5>
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  আপনার হেডারে ডিফল্টভাবে <strong>হোম (Home)</strong>, <strong>কোর্সসমূহ (Courses)</strong>, <strong>আমাদের সম্পর্কে (About)</strong> ও <strong>যোগাযোগ (Contact)</strong> মেনু থাকবে। এছাড়া সুপার অ্যাডমিন বা আপনার তৈরি করা কাস্টম পেজগুলো (যেমন: নোটিশ পেজ) স্বয়ংক্রিয়ভাবে হেডারের সাথে যুক্ত থাকবে।
                </p>
              </div>

            </div>
          )}

          {/* TAB: FOOTER SETTINGS (ফুটার তথ্য ও সোশ্যাল লিঙ্ক) */}
          {activeTab === 'footerSettings' && (
            <div className="space-y-8">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span>২. ফুটার তথ্য ও সোশ্যাল লিঙ্ক (Footer Information & Socials)</span>
                </h3>
                <p className="text-xs text-foreground/60 mt-1">
                  আপনার স্টোরফ্রন্ট ওয়েবসাইটের নিচের ফুটার অংশের ব্র্যান্ডিং, সরাসরি যোগাযোগের ঠিকানা, হেল্পলাইন ও সোশ্যাল মিডিয়া লিঙ্ক কনফিগার করুন।
                </p>
              </div>

              {/* Live Interactive Footer Preview Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground/80 block uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-500" />
                    <span>ফুটার লাইভ প্রিভিউ (Live Footer Preview)</span>
                  </label>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>রিয়েলটাইম প্রিভিউ</span>
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl text-white overflow-hidden space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs border-b border-white/10 pb-6">
                    {/* Col 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        {headerLogo || profilePhoto ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/40 bg-orange-500/10 shrink-0">
                            <img src={headerLogo || profilePhoto} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                            {(displayName || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white leading-tight">{displayName || 'একাডেমি নাম'}</div>
                          <div className="text-[10px] text-orange-400">অফিশিয়াল একাডেমি</div>
                        </div>
                      </div>
                      <p className="text-white/60 text-[11px] leading-relaxed line-clamp-3">
                        {footerBio || 'অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম।'}
                      </p>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-2">
                      <div className="font-bold text-orange-400 text-xs mb-2">একাডেমি পেইজসমূহ</div>
                      <div className="text-white/60 space-y-1 text-[11px]">
                        <div>• হোম (Home)</div>
                        <div>• কোর্সসমূহ (Courses)</div>
                        <div>• আমাদের সম্পর্কে (About)</div>
                        <div>• যোগাযোগ (Contact)</div>
                      </div>
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-2">
                      <div className="font-bold text-amber-400 text-xs mb-2">কোর্স ও প্রস্তুতি</div>
                      <div className="text-white/60 space-y-1 text-[11px]">
                        <div>• অনলাইন রেকর্ডেড ক্লাস</div>
                        <div>• লাইভ ইন্টারঅ্যাক্টিভ ব্যাচ</div>
                        <div>• ডেইলি এক্সাম ও সলভ শিট</div>
                      </div>
                    </div>

                    {/* Col 4 */}
                    <div className="space-y-2">
                      <div className="font-bold text-emerald-400 text-xs mb-2">সরাসরি যোগাযোগ</div>
                      <div className="text-white/70 space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                          <span className="truncate">{contactAddress || 'ঢাকা, বাংলাদেশ'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{contactPhone || '01700000000'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="truncate">{contactEmail || 'support@skylearners.com'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom preview bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/50 pt-2">
                    <p>
                      {footerCopyright || `© ${new Date().getFullYear()} ${displayName || 'Teacher Academy'}. সর্বস্বত্ব সংরক্ষিত। Powered by SkyLearners.`}
                    </p>
                    <div className="flex items-center gap-4">
                      <span>প্রাইভেসি পলিসি</span>
                      <span>শর্তাবলী</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Footer Brand Bio */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground">ফুটার সংক্ষিপ্ত পরিচিতি বা স্লোগান</h4>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    ফুটার পরিচিতি টেক্সট (Footer Bio / Vision Statement)
                  </label>
                  <textarea
                    rows={2}
                    value={footerBio}
                    onChange={(e) => { setFooterBio(e.target.value); setHasUnsavedChanges(true); }}
                    placeholder="অনলাইন একাডেমিক ও ভর্তি পরীক্ষার জন্য একটি বিশেষায়িত লার্নিং প্ল্যাটফর্ম..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Direct Contact Information */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>সরাসরি যোগাযোগের ঠিকানা ও হেল্পলাইন</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      ক্যাম্পাস / ব্রাঞ্চ ঠিকানা (Campus Address)
                    </label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) => { setContactAddress(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      সরাসরি হেল্পলাইন ফোন (Helpline Phone)
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => { setContactPhone(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: 01712-345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      সরাসরি হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)
                    </label>
                    <input
                      type="text"
                      value={contactWhatsapp}
                      onChange={(e) => { setContactWhatsapp(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: 01712-345678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      অফিশিয়াল সাপোর্ট ইমেইল (Official Email)
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => { setContactEmail(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: support@myacademy.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      সাপোর্ট ও অফিস সময় (Office & Support Hours)
                    </label>
                    <input
                      type="text"
                      value={contactOfficeHours}
                      onChange={(e) => { setContactOfficeHours(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="যেমন: প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Social Media Channels */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <span>সোশ্যাল মিডিয়া ও কমিউনিটি লিঙ্ক</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      ফেসবুক পেইজ লিংক (Facebook Page URL)
                    </label>
                    <input
                      type="text"
                      value={contactFacebookPage}
                      onChange={(e) => { setContactFacebookPage(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      ফেসবুক গ্রুপ লিংক (Facebook Group / Community)
                    </label>
                    <input
                      type="text"
                      value={contactFacebookGroup}
                      onChange={(e) => { setContactFacebookGroup(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="https://facebook.com/groups/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      ইউটিউব চ্যানেল লিংক (YouTube Channel URL)
                    </label>
                    <input
                      type="text"
                      value={contactYoutube}
                      onChange={(e) => { setContactYoutube(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                      টেলিগ্রাম চ্যানেল / গ্রুপ (Telegram Community)
                    </label>
                    <input
                      type="text"
                      value={contactTelegram}
                      onChange={(e) => { setContactTelegram(e.target.value); setHasUnsavedChanges(true); }}
                      placeholder="https://t.me/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Footer Custom Copyright */}
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-sm font-bold text-foreground">ফুটার কপিরাইট বার্তা</h4>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">
                    কাস্টম কপিরাইট টেক্সট (Custom Copyright Text)
                  </label>
                  <input
                    type="text"
                    value={footerCopyright}
                    onChange={(e) => { setFooterCopyright(e.target.value); setHasUnsavedChanges(true); }}
                    placeholder={`যেমন: © ${new Date().getFullYear()} ${displayName || 'Teacher Academy'}. সর্বস্বত্ব সংরক্ষিত। Powered by SkyLearners.`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-foreground/50 mt-1">
                    খালি রাখলে স্বয়ংক্রিয়ভাবে ডিফল্ট কপিরাইট ও আপনার নাম যুক্ত থাকবে।
                  </p>
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
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[11px] font-bold text-foreground/70">শিক্ষকের ছবি</span>
                        <ImageSizeGuideBadge size="600 × 600 px" note="ফ্যাকাল্টি রোস্টারের গোল ফ্রেমে পারফেক্ট দেখাবে।" />
                      </div>
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

                {/* Dimension & Pixel Guideline Alert */}
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">📐 প্রস্তাবিত ব্যানার সাইজ:</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/20 font-mono font-black text-orange-600 dark:text-orange-300 border border-orange-500/30">1920 × 650 px</span>
                      <span className="text-[11px] text-foreground/70">বা</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/20 font-mono font-black text-orange-600 dark:text-orange-300 border border-orange-500/30">1600 × 600 px</span>
                    </div>
                    <p className="text-[11px] text-foreground/75 leading-relaxed">
                      এই রেজুলেশনের ছবি ব্যবহার করলে মোবাইল, ট্যাবলেট ও কম্পিউটার সব স্ক্রিনেই কোনো অংশ কাটা ছাড়া নিখুঁত ফিট হবে।
                    </p>
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

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold cursor-pointer transition-colors">
                    {uploadingSlideImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{uploadingSlideImg ? 'ইমেজ আপলোড হচ্ছে...' : '+ নতুন ব্যানার ইমেজ আপলোড করুন'}</span>
                    <input type="file" accept="image/*" onChange={handleAddSlideImage} className="hidden" />
                  </label>
                  <ImageSizeGuideBadge size="1920 × 650 px" note="হিরো ক্যারোজেল স্লাইডারের জন্য সবচেয়ে আইডিয়াল রেজোলিউশন।" />
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
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-foreground/70 block">
                        যোগাযোগ সেকশনের প্রতিনিধি বা শিক্ষকের ছবি (Transparent PNG)
                      </label>
                      <ImageSizeGuideBadge size="800 × 1000 px" note="ব্যাকগ্রাউন্ড ছাড়া ট্রান্সপারেন্ট PNG দিলে কার্ডের নিচে অসাধারণ দেখাবে।" />
                    </div>
                    <p className="text-[11px] text-orange-500 font-semibold mt-0.5">
                      💡 ব্যাকগ্রাউন্ড ছাড়া ট্রান্সপারেন্ট PNG ছবি ব্যবহার করলে কোনো বর্ডার বা ব্যাকগ্রাউন্ড বক্স ছাড়াই হোম পেজে স্বচ্ছভাবে ফুটে উঠবে।
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
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">অফলাইন ব্রাঞ্চ / ক্লাসরুমের ঠিকানা</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="যেমন: ফার্মগেট / মৌচাক শাখা, ঢাকা"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground/70 block mb-1">সাপোর্ট ও অফিস সময়সূচি</label>
                  <input
                    type="text"
                    value={contactOfficeHours}
                    onChange={(e) => setContactOfficeHours(e.target.value)}
                    placeholder="যেমন: প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা"
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
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-foreground/70 block">
                        ব্যানারের স্লাইডার ছবি (শিক্ষার্থী বা মেন্টরের ছবি)
                      </label>
                      <ImageSizeGuideBadge size="800 × 1000 px" note="লম্বালম্বি পোর্ট্রেট ফটো ব্যানার কর্নারে নিখুঁতভাবে ফিট হবে।" />
                    </div>
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

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingGalleryImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{uploadingGalleryImg ? 'ফটো আপলোড হচ্ছে...' : '+ নতুন গ্যালারি ফটো আপলোড করুন'}</span>
                  <input type="file" accept="image/*" onChange={handleAddGalleryPhoto} className="hidden" />
                </label>
                <ImageSizeGuideBadge size="1200 × 800 px" note="অটো-স্ক্রলিং গ্যালারিতে ছবি ক্রিস্প ও ক্লিয়ার থাকবে।" />
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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground/80 block">
                      হিরো ব্যাকগ্রাউন্ড ও ভিডিও কার্ড কভার ফটো
                    </label>
                    <ImageSizeGuideBadge size="1920 × 800 px" note="ফুল-উইডথ হিরো ব্যাকগ্রাউন্ড ও ভিডিও থাম্বনেইলের জন্য পারফেক্ট।" />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground/80 block">স্টোরি সেকশন ছবি</label>
                    <ImageSizeGuideBadge size="1200 × 800 px" note="মোবাইল ও ল্যাপটপে লেখার পাশে নিখুঁতভাবে প্রদর্শিত হবে।" />
                  </div>
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
                    অ্যাবাউট পেজের ভ্যালু কার্ডগুলোর আইকন, শিরোনাম, সাবটাইটেল ও বিবরণ কাস্টমাইজ করুন।
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRestoreDefaultValueCards}
                    className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground/80 hover:text-foreground font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="মূল ৬টি ডিফল্ট কার্ড রিস্টোর করুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                    <span>ডিফল্ট রিস্টোর</span>
                  </button>
                  <Link
                    href="/about"
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>লাইভ পেজ দেখুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Section Heading & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10">
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

              {/* Value Cards Grid Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">ভ্যালু পোস্টার কার্ডসমূহ</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-black text-xs">
                    {aboutValueCards.length}টি কার্ড
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddValueCard}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন কার্ড যোগ করুন</span>
                </button>
              </div>

              {/* Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {aboutValueCards.map((card, idx) => {
                  const CurrentIcon = VALUE_ICON_MAP[card.icon] || Award;
                  const currentTheme = COLOR_THEME_OPTIONS.find(t => t.id === card.colorTheme) || COLOR_THEME_OPTIONS[0];

                  return (
                    <div 
                      key={card.id || idx}
                      className="p-5 rounded-2xl bg-foreground/[0.02] hover:bg-foreground/[0.04] border border-foreground/10 space-y-4 relative transition-all shadow-xs"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-3 border-b border-foreground/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-foreground/10 text-foreground font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground/80">কার্ড #{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Color Theme Selector */}
                          <div className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-xl border border-foreground/10">
                            <Palette className="w-3.5 h-3.5 text-foreground/60" />
                            <select
                              value={card.colorTheme || 'rose'}
                              onChange={(e) => handleUpdateValueCard(card.id, 'colorTheme', e.target.value)}
                              className="bg-transparent text-[11px] font-bold text-foreground focus:outline-none cursor-pointer"
                            >
                              {COLOR_THEME_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id} className="bg-background text-foreground">
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Delete Card Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteValueCard(card.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                            title="এই কার্ডটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Icon Picker Trigger & Preview */}
                      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-background border border-foreground/10">
                        <div className={`w-12 h-12 rounded-xl ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center shrink-0 border border-foreground/10 shadow-xs`}>
                          {card.icon === 'custom-svg' && card.customSvg ? (
                            <div 
                              className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:stroke-current"
                              dangerouslySetInnerHTML={{ __html: card.customSvg }}
                            />
                          ) : (
                            <CurrentIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-foreground/60">
                            বর্তমান আইকন: <span className="text-foreground font-black">{card.icon === 'custom-svg' ? 'কাস্টম SVG আইকন' : card.icon}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIconPickerCardId(card.id);
                              setIconPickerTab(card.icon === 'custom-svg' ? 'svg' : 'lucide');
                              setCustomSvgInput(card.customSvg || '');
                              setIconSearchQuery('');
                              setIconCategoryFilter('all');
                            }}
                            className="mt-1 px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>আইকন চুজ / SVG আপলোড</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Subtitle Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-foreground/80 block mb-1">কার্ড হেডিং (Title)</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => handleUpdateValueCard(card.id, 'title', e.target.value)}
                            placeholder="LEARNER FIRST"
                            className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold uppercase focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-foreground/80 block mb-1">সাবটাইটেল (Subtitle)</label>
                          <input
                            type="text"
                            value={card.subtitle}
                            onChange={(e) => handleUpdateValueCard(card.id, 'subtitle', e.target.value)}
                            placeholder="শিক্ষার্থীই সবার আগে"
                            className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Description Textarea */}
                      <div>
                        <label className="text-[11px] font-bold text-foreground/80 block mb-1">সংক্ষিপ্ত বিবরণ (Description)</label>
                        <textarea
                          rows={3}
                          value={card.desc}
                          onChange={(e) => handleUpdateValueCard(card.id, 'desc', e.target.value)}
                          placeholder="আমাদের প্রতিটি কোর্স ও সিদ্ধান্তের কেন্দ্রে থাকে শিক্ষার্থীর সর্বোচ্চ সুবিধা..."
                          className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Value Card Button (Full Width Dashed) */}
              <button
                type="button"
                onClick={handleAddValueCard}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-foreground/20 hover:border-orange-500/50 bg-foreground/[0.01] hover:bg-orange-500/[0.03] text-foreground/70 hover:text-orange-500 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন ভ্যালু পোস্টার কার্ড যোগ করুন</span>
              </button>

              {/* Interactive Icon Picker & SVG Upload Modal */}
              {iconPickerCardId && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-card border border-foreground/15 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    
                    {/* Modal Header */}
                    <div className="p-5 border-b border-foreground/10 flex items-center justify-between bg-foreground/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-foreground">আইকন ও ভেক্টর নির্বাচন</h4>
                          <p className="text-xs text-foreground/60">লুসিড আইকন লাইব্রেরি থেকে পছন্দ করুন অথবা নিজস্ব SVG আপলোড করুন</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIconPickerCardId(null)}
                        className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mode Tabs: Lucide Pack vs Custom SVG */}
                    <div className="flex border-b border-foreground/10 bg-foreground/[0.01] p-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIconPickerTab('lucide')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          iconPickerTab === 'lucide'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'hover:bg-foreground/5 text-foreground/70'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>লুসিড আইকন লাইব্রেরি (১০০+ Icons)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIconPickerTab('svg')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          iconPickerTab === 'svg'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'hover:bg-foreground/5 text-foreground/70'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>কাস্টম SVG আপলোড / পেস্ট</span>
                      </button>
                    </div>

                    {/* TAB 1: LUCIDE ICONS */}
                    {iconPickerTab === 'lucide' && (
                      <>
                        {/* Search & Horizontal Category Slider */}
                        <div className="p-4 border-b border-foreground/10 space-y-3 bg-background">
                          <div className="relative">
                            <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={iconSearchQuery}
                              onChange={(e) => setIconSearchQuery(e.target.value)}
                              placeholder="আইকন খুঁজুন (যেমন: Heart, Zap, Star, Trophy, Shield, Brain, Laptop...)"
                              className="w-full pl-10 pr-4 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/10 text-xs font-medium focus:outline-none focus:border-orange-500"
                            />
                            {iconSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setIconSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs font-bold"
                              >
                                মুছুন
                              </button>
                            )}
                          </div>

                          {/* Horizontal Category Carousel with < > Arrows */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => scrollCategory('left')}
                              className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-foreground/10"
                              title="বামে স্ক্রোল করুন"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div 
                              ref={categoryScrollRef}
                              className="overflow-x-auto scroll-smooth flex items-center gap-1.5 py-1 px-1 flex-1"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                              {ICON_CATEGORIES.map(cat => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setIconCategoryFilter(cat.id)}
                                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                                    iconCategoryFilter === cat.id
                                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                      : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border-foreground/10'
                                  }`}
                                >
                                  {cat.label}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => scrollCategory('right')}
                              className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-foreground/10"
                              title="ডানে স্ক্রোল করুন"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Icons Grid Content */}
                        <div className="p-4 overflow-y-auto max-h-[380px] bg-foreground/[0.01]">
                          {(() => {
                            const filtered = AVAILABLE_ICONS.filter(item => {
                              const matchesSearch = iconSearchQuery === '' || 
                                item.id.toLowerCase().includes(iconSearchQuery.toLowerCase()) || 
                                item.name.toLowerCase().includes(iconSearchQuery.toLowerCase());
                              const matchesCat = iconCategoryFilter === 'all' || item.category === iconCategoryFilter;
                              return matchesSearch && matchesCat;
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="py-12 text-center text-foreground/60 text-xs font-bold space-y-2">
                                  <p>কোনো আইকন খুঁজে পাওয়া যায়নি!</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIconSearchQuery('');
                                      setIconCategoryFilter('all');
                                    }}
                                    className="text-orange-500 underline cursor-pointer"
                                  >
                                    সব আইকন দেখুন
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {filtered.map(item => {
                                  const ItemIcon = VALUE_ICON_MAP[item.id] || Sparkles;
                                  const currentCard = aboutValueCards.find(c => c.id === iconPickerCardId);
                                  const isSelected = currentCard?.icon === item.id;

                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => handleSelectIcon(item.id)}
                                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer group ${
                                        isSelected
                                          ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold shadow-xs'
                                          : 'bg-background hover:bg-foreground/5 border-foreground/10 text-foreground/80 hover:text-foreground'
                                      }`}
                                    >
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                        isSelected ? 'bg-orange-500 text-white' : 'bg-foreground/5 text-foreground'
                                      }`}>
                                        <ItemIcon className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0 w-full">
                                        <p className="text-xs font-bold truncate">{item.id}</p>
                                        <p className="text-[10px] text-foreground/50 truncate">{item.name}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    )}

                    {/* TAB 2: CUSTOM SVG UPLOAD */}
                    {iconPickerTab === 'svg' && (
                      <div className="p-6 overflow-y-auto max-h-[420px] space-y-5 bg-background">
                        {/* File Upload Trigger */}
                        <div className="p-5 rounded-2xl border-2 border-dashed border-foreground/20 hover:border-orange-500/50 bg-foreground/[0.02] text-center space-y-2 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">আপনার কম্পিউটার থেকে SVG ফাইল আপলোড করুন</p>
                            <p className="text-[11px] text-foreground/60 mt-0.5">শুধুমাত্র .svg ফরম্যাট সমর্থিত</p>
                          </div>
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>SVG ফাইল নির্বাচন করুন</span>
                            <input type="file" accept=".svg,image/svg+xml" onChange={handleSvgFileUpload} className="hidden" />
                          </label>
                        </div>

                        {/* Raw SVG Textarea */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-foreground/80 block">অথবা সরাসরি SVG কোড পেস্ট করুন (&lt;svg&gt;...&lt;/svg&gt;):</label>
                          <textarea
                            rows={4}
                            value={customSvgInput}
                            onChange={(e) => setCustomSvgInput(e.target.value)}
                            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg>'
                            className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-foreground/10 text-xs font-mono focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        {/* Live SVG Preview Box */}
                        {customSvgInput && customSvgInput.includes('<svg') && (
                          <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                            <div className="text-[11px] font-bold text-foreground/70">লাইভ প্রিভিউ:</div>
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center p-3 border border-orange-500/30 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:stroke-current">
                                <div 
                                  className="w-full h-full flex items-center justify-center"
                                  dangerouslySetInnerHTML={{ __html: customSvgInput }}
                                />
                              </div>
                              <div className="text-xs space-y-1">
                                <p className="font-bold text-emerald-500 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>SVG কোড সঠিকভাবে লোড হয়েছে</span>
                                </p>
                                <p className="text-[11px] text-foreground/60">কার্ডের থিম কালার অনুযায়ী এটি স্বয়ংক্রিয়ভাবে মানানসই রঙ ধারণ করবে।</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Apply SVG Button */}
                        <button
                          type="button"
                          onClick={handleApplyCustomSvg}
                          disabled={!customSvgInput || !customSvgInput.includes('<svg')}
                          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>এই SVG আইকনটি কার্ডে প্রয়োগ করুন</span>
                        </button>
                      </div>
                    )}

                    {/* Modal Footer */}
                    <div className="p-3 border-t border-foreground/10 bg-background flex items-center justify-between text-xs text-foreground/60 px-5">
                      <span>আইকনে ক্লিক করলে বা SVG অ্যাপ্লাই করলে স্বয়ংক্রিয়ভাবে কার্ডে যুক্ত হবে।</span>
                      <button
                        type="button"
                        onClick={() => setIconPickerCardId(null)}
                        className="px-4 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold transition-colors cursor-pointer"
                      >
                        বন্ধ করুন
                      </button>
                    </div>

                  </div>
                </div>
              )}

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
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-foreground/80 block">মেন্টরের বিশেষ ছবি</label>
                    <ImageSizeGuideBadge size="800 × 1000 px" note="ফাউন্ডার গ্লাস বেন্টো কার্ডে প্রিমিয়াম পোর্ট্রেট ফিট হবে।" />
                  </div>
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

          {/* ========================================================================= */}
          {/* CONTACT PAGE BUILDER TABS                                                */}
          {/* ========================================================================= */}

          {/* 1. TAB: CONTACT HERO */}
          {activeTab === 'contactHero' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-orange-500" />
                    <span>১. হিরো ও লাইভ সাপোর্ট ব্যাজ (Hero & Live Badges)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    যোগাযোগ পেজের শীর্ষ হিরো সেকশনের হেডিং, সাবটাইটেল এবং লাইভ স্ট্যাটাস ব্যাজগুলো কাস্টমাইজ করুন।
                  </p>
                </div>
                <Link
                  href="/contact"
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
                  <label className="text-xs font-bold text-foreground/80 block mb-1">শীর্ষ ট্যাগ / ব্যাজ (Hero Tag)</label>
                  <input
                    type="text"
                    value={contactHeroTag}
                    onChange={(e) => setContactHeroTag(e.target.value)}
                    placeholder={displayName ? `${displayName} • স্টুডেন্ট সাপোর্ট সেন্টার` : 'আমাদের একাডেমি • স্টুডেন্ট সাপোর্ট সেন্টার'}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">প্রধান শিরোনাম (Hero Heading)</label>
                  <input
                    type="text"
                    value={contactHeroTitle}
                    onChange={(e) => setContactHeroTitle(e.target.value)}
                    placeholder="যেকোনো প্রয়োজনে আমরা আছি তোমার পাশে"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সাবটাইটেল / বিবরণ</label>
                  <input
                    type="text"
                    value={contactHeroSubtitle}
                    onChange={(e) => setContactHeroSubtitle(e.target.value)}
                    placeholder={headline || 'দেশসেরা মেন্টরদের সাথে শতভাগ প্রস্তুতি'}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* 3 Live Badges */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3 sm:col-span-2">
                  <span className="text-xs font-black text-orange-500">৩টি লাইভ সাপোর্ট স্ট্যাটাস ব্যাজ</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/70 block mb-1">ব্যাজ ১ (WhatsApp)</label>
                      <input
                        type="text"
                        value={contactBadge1}
                        onChange={(e) => setContactBadge1(e.target.value)}
                        placeholder="ইনস্ট্যান্ট হোয়াটসঅ্যাপ রিপ্লাই"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-foreground/70 block mb-1">ব্যাজ ২ (Helpline)</label>
                      <input
                        type="text"
                        value={contactBadge2}
                        onChange={(e) => setContactBadge2(e.target.value)}
                        placeholder="২৪/৭ ডিরেক্ট কল সার্ভিস"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-foreground/70 block mb-1">ব্যাজ ৩ (অফিস সময়)</label>
                      <input
                        type="text"
                        value={contactOfficeHours}
                        onChange={(e) => setContactOfficeHours(e.target.value)}
                        placeholder="প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-purple-600 dark:text-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TAB: CONTACT CARDS */}
          {activeTab === 'contactCards' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Phone className="w-5 h-5 text-orange-500" />
                    <span>২. ৪টি কুইক অ্যাকশন কার্ডস (Quick Action Cards)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    শিক্ষার্থীদের দ্রুত যোগাযোগের জন্য ফোন, হোয়াটসঅ্যাপ, ইমেইল ও ব্রাঞ্চ কার্ডের তথ্য কনফিগার করুন।
                  </p>
                </div>
                <Link
                  href="/contact"
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>লাইভ পেজ দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Helpline Phone */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-500">
                    <Phone className="w-4 h-4" />
                    <span>১. ২৪/৭ হেল্পলাইন ফোন নম্বর</span>
                  </div>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-foreground/50">শিক্ষার্থী ক্লিক করলে সরাসরি ডায়াল প্যাড ওপেন হবে।</p>
                </div>

                {/* WhatsApp */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>২. WhatsApp সাপোর্ট নম্বর</span>
                  </div>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-foreground/50">ক্লিক করলে প্রি-ফিল্ড মেসেজসহ WhatsApp চ্যাট ওপেন হবে।</p>
                </div>

                {/* Email */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                    <Mail className="w-4 h-4" />
                    <span>৩. অফিসিয়াল সাপোর্ট ইমেইল</span>
                  </div>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="support@academy.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-foreground/50">যেকোনো দাপ্তরিক বা কোর্স ইনফো প্রেরণের জন্য।</p>
                </div>

                {/* Campus Address */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-500">
                    <MapPin className="w-4 h-4" />
                    <span>৪. অফলাইন ব্রাঞ্চ / ক্লাসরুম ঠিকানা</span>
                  </div>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="ফার্মগেট / মৌচাক শাখা, ঢাকা, বাংলাদেশ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-foreground/50">শিক্ষার্থী সরাসরি এসে ভর্তি ও পরামর্শ নিতে পারবে।</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TAB: CONTACT SCHEDULE */}
          {activeTab === 'contactSchedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>৩. সাপোর্ট সময়সূচি ও ব্রাঞ্চ লোকেশন (Schedule & Branch)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    অফিস সময়সূচি, রেসপন্স টাইম এবং Google Maps লোকেশন লিঙ্ক কনফিগার করুন।
                  </p>
                </div>
                <Link
                  href="/contact"
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
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সাপোর্ট ও অফিস সময়সূচি</label>
                  <input
                    type="text"
                    value={contactOfficeHours}
                    onChange={(e) => setContactOfficeHours(e.target.value)}
                    placeholder="প্রতিদিন সকাল ৯:০০ টা — রাত ১০:০০ টা"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">গড় রেসপন্স টাইম প্রতিশ্রুতি</label>
                  <input
                    type="text"
                    value={contactResponseTime}
                    onChange={(e) => setContactResponseTime(e.target.value)}
                    placeholder="৫ — ১৫ মিনিট"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">ক্যাম্পাস / ব্রাঞ্চের পূর্ণ ঠিকানা</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="ফার্মগেট / মৌচাক শাখা, ঢাকা, বাংলাদেশ"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">Google Maps লোকেশন বা ডিরেকশন লিংক (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={contactMapUrl}
                    onChange={(e) => setContactMapUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-foreground/50 mt-1">খালি রাখলে ব্রাঞ্চের ঠিকানা অনুযায়ী স্বয়ংক্রিয়ভাবে ম্যাপ সার্চ ওপেন হবে।</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. TAB: CONTACT SOCIAL */}
          {activeTab === 'contactSocial' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    <span>৪. সোশ্যাল ও ভিআইপি কমিউনিটি (Community & Social Hub)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    ফেসবুক ভিআইপি গ্রুপ, টেলিগ্রাম চ্যানেল, ইউটিউব লেকচার এবং অফিশিয়াল পেজের লিংক সেট করুন।
                  </p>
                </div>
                <Link
                  href="/contact"
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
                  <label className="text-xs font-bold text-foreground/80 block mb-1">Facebook VIP Group লিংক</label>
                  <input
                    type="text"
                    value={contactFacebookGroup}
                    onChange={(e) => setContactFacebookGroup(e.target.value)}
                    placeholder="https://facebook.com/groups/yourgroup"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">Telegram Channel লিংক</label>
                  <input
                    type="text"
                    value={contactTelegram}
                    onChange={(e) => setContactTelegram(e.target.value)}
                    placeholder="https://t.me/yourchannel"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">YouTube Channel লিংক</label>
                  <input
                    type="text"
                    value={contactYoutube}
                    onChange={(e) => setContactYoutube(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">Facebook Page লিংক</label>
                  <input
                    type="text"
                    value={contactFacebookPage}
                    onChange={(e) => setContactFacebookPage(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. TAB: CONTACT FAQ MANAGER */}
          {activeTab === 'contactFaq' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                    <span>৫. সচরাচর জিজ্ঞাসা (FAQ Manager)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    কন্টাক্ট পেজের জন্য প্রয়োজনীয় সাধারণ প্রশ্নোত্তর যুক্ত করুন এবং কাস্টমাইজ করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setContactFaqs(prev => [
                        ...prev,
                        { id: `faq-${Date.now()}`, q: '', a: '' }
                      ]);
                      toast.success(locale === 'bn' ? 'নতুন FAQ যুক্ত হয়েছে!' : 'New FAQ added!');
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন FAQ যোগ করুন</span>
                  </button>
                  <Link
                    href="/contact"
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>প্রিভিউ</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {contactFaqs.map((faq, index) => (
                  <div key={faq.id || index} className="p-4 sm:p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-orange-500">FAQ #{index + 1}</span>
                      {contactFaqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setContactFaqs(prev => prev.filter(f => f.id !== faq.id));
                            toast.success(locale === 'bn' ? 'FAQ মুছে ফেলা হয়েছে' : 'FAQ removed');
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Remove FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/70 block mb-1">প্রশ্ন (Question)</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContactFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, q: val } : f));
                        }}
                        placeholder="যেমন: আমি কীভাবে কোর্সে ভর্তি নিশ্চিত করব?"
                        className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold text-foreground focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/70 block mb-1">উত্তর (Answer)</label>
                      <textarea
                        rows={3}
                        value={faq.a}
                        onChange={(e) => {
                          const val = e.target.value;
                          setContactFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, a: val } : f));
                        }}
                        placeholder="বিস্তারিত উত্তর লিখুন..."
                        className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs text-foreground/80 focus:outline-none focus:border-orange-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. TAB: CONTACT CTA */}
          {activeTab === 'contactCta' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span>৬. মেগা অ্যাকশন ব্যানার (Mega CTA Banner)</span>
                  </h3>
                  <p className="text-xs text-foreground/60 mt-1">
                    কন্টাক্ট পেজের নিচের কল-টু-অ্যাকশন ব্যানার, শিরোনাম ও বাটনসমূহ কাস্টমাইজ করুন।
                  </p>
                </div>
                <Link
                  href="/contact"
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
                    value={contactCtaBadge}
                    onChange={(e) => setContactCtaBadge(e.target.value)}
                    placeholder="সাফল্যের সূচনা হোক আজই"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">প্রধান হেডিং</label>
                  <input
                    type="text"
                    value={contactCtaTitle}
                    onChange={(e) => setContactCtaTitle(e.target.value)}
                    placeholder="তোমার স্বপ্নের সেরা প্রস্তুতিতে আমরা আছি সাথে"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-foreground/80 block mb-1">সাবহেডিং / বিবরণ</label>
                  <input
                    type="text"
                    value={contactCtaSubtitle}
                    onChange={(e) => setContactCtaSubtitle(e.target.value)}
                    placeholder="লাইভ ক্লাস, নিয়মিত মডেল টেস্ট ও স্পেশালাইজড শিটের সাথে এখনই তোমার পছন্দের ব্যাচে যুক্ত হও।"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Button 1 */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <span className="text-xs font-black text-orange-500">প্রাইমারি অ্যাকশন বাটন টেক্সট</span>
                  <input
                    type="text"
                    value={contactCtaBtn1Text}
                    onChange={(e) => setContactCtaBtn1Text(e.target.value)}
                    placeholder="সকল কোর্সসমূহ দেখুন"
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Button 2 */}
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2">
                  <span className="text-xs font-black text-foreground/70">হেল্পলাইন বাটন টেক্সট</span>
                  <input
                    type="text"
                    value={contactCtaBtn2Text}
                    onChange={(e) => setContactCtaBtn2Text(e.target.value)}
                    placeholder="হেল্পলাইনে কল দিন"
                    className="w-full px-3.5 py-2 rounded-xl bg-background border border-foreground/10 text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: DYNAMIC CUSTOM PAGE CONTROLS */}
          {activeTab.startsWith('custom_') && (() => {
            const currentGroup = tabGroups.find(g => g.items.some(it => it.id === activeTab));
            const customPage = (currentGroup as any)?.customPageData;
            if (!customPage) return null;
            const slugKey = (customPage.slug || '').replace('/', '').toLowerCase();
            const pageConfig = customPagesConfig[slugKey] || {};

            const updateCustomPageField = (field: string, value: any) => {
              setCustomPagesConfig(prev => ({
                ...prev,
                [slugKey]: {
                  ...(prev[slugKey] || {}),
                  [field]: value
                }
              }));
            };

            const isNotice = slugKey === 'notice';
            const isNoticeManager = isNotice && activeTab.endsWith('_manager');
            const noticeList = pageConfig.notices || [];

            return (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Clean Header Info */}
                <div className="border-b border-foreground/10 pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                      {isNoticeManager ? (
                        <>
                          <FilePlus className="w-5 h-5 text-orange-500" />
                          <span>নোটিশ আপলোড ও ম্যানেজমেন্ট প্যানেল</span>
                        </>
                      ) : (
                        <>
                          <Sliders className="w-5 h-5 text-orange-500" />
                          <span>{customPage.name} পেজ ও হিরো সেটিংস</span>
                        </>
                      )}
                    </h3>
                    <span className="text-xs font-mono bg-foreground/5 text-foreground/70 px-2.5 py-0.5 rounded-lg border border-foreground/10">
                      {customPage.slug}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    {isNoticeManager 
                      ? 'শিক্ষার্থীদের জন্য নতুন নোটিশ, পরীক্ষার সময়সূচি বা ছুটির সার্কুলার প্রকাশ ও নিয়ন্ত্রণ করুন।' 
                      : `${customPage.name} পেজের হিরো ব্যানার, শিরোনাম ও টেক্সট কাস্টমাইজেশন ম্যানেজ করুন।`}
                  </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. NOTICE TAB 2: NOTICE UPLOAD & MANAGEMENT                   */}
                {/* ------------------------------------------------------------- */}
                {isNoticeManager ? (() => {
                  const displayNotices = (pageConfig.notices !== undefined) 
                    ? (pageConfig.notices || []) 
                    : DEFAULT_INSTITUTIONAL_NOTICES;

                  return (
                    <div className="space-y-8">
                      {/* Add / Edit Notice Form */}
                      <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                              {editingNoticeId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">
                                {editingNoticeId ? '১. নির্বাচিত নোটিশটি এডিট / সংশোধন করুন' : '১. নতুন অফিসিয়াল নোটিশ প্রকাশ করুন'}
                              </h4>
                              <p className="text-xs text-foreground/60">
                                {editingNoticeId ? 'তথ্য সংশোধন করে নিচে "নোটিশ আপডেট করুন" বাটনে চাপুন।' : 'ফর্মটি পূরণ করে নিচে "নোটিশ যুক্ত করুন" বাটনে চাপুন।'}
                              </p>
                            </div>
                          </div>

                          {editingNoticeId && (
                            <button
                              type="button"
                              onClick={handleCancelEditNotice}
                              className="px-3.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 text-xs font-bold transition-all border border-foreground/10 flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>এডিট বাতিল</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">
                              নোটিশের শিরোনাম <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newNoticeTitle}
                              onChange={(e) => setNewNoticeTitle(e.target.value)}
                              placeholder="যেমন: এইচএসসি ২০২৬ চূড়ান্ত মডেল টেস্ট ও বিশেষ ক্লাসের সময়সূচি"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">স্মারক নম্বর (Reference No)</label>
                            <input
                              type="text"
                              value={newNoticeRefNo}
                              onChange={(e) => setNewNoticeRefNo(e.target.value)}
                              placeholder="FB/NOT-2026/08-06"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">নোটিশের ক্যাটাগরি</label>
                            <select
                              value={newNoticeCategory}
                              onChange={(e: any) => setNewNoticeCategory(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            >
                              <option value="urgent">🚨 জরুরি বিজ্ঞপ্তি</option>
                              <option value="exam">📝 পরীক্ষা ও ফলাফল</option>
                              <option value="routine">📅 ক্লাস রুটিন</option>
                              <option value="fees">💳 ফি ও ভর্তি</option>
                              <option value="holiday">🏖️ ছুটির নোটিশ</option>
                              <option value="general">📄 সাধারণ বিজ্ঞপ্তি</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">প্রকাশের তারিখ</label>
                            <input
                              type="text"
                              value={newNoticeDate}
                              onChange={(e) => setNewNoticeDate(e.target.value)}
                              placeholder="২৪ আগস্ট, ২০২৬ (খালি রাখলে আজকের তারিখ বসবে)"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">সংযুক্ত PDF ফাইলের নাম (ঐচ্ছিক)</label>
                            <input
                              type="text"
                              value={newNoticeAttachmentName}
                              onChange={(e) => setNewNoticeAttachmentName(e.target.value)}
                              placeholder="Model-Test-Routine-2026.pdf"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* PDF Download / Google Drive Link Input */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-foreground/70 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                                <span>সংযুক্ত PDF / Google Drive ডাউনলোড লিংক (ঐচ্ছিক)</span>
                              </span>
                              <span className="text-[10px] text-foreground/50">Google Drive, Dropbox বা সরাসরি PDF লিংক</span>
                            </label>
                            <input
                              type="url"
                              value={newNoticeAttachmentUrl}
                              onChange={(e) => setNewNoticeAttachmentUrl(e.target.value)}
                              placeholder="https://drive.google.com/file/d/... অথবা সরাসরি ফাইলের লিংক"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500 font-mono"
                            />
                            <p className="text-[11px] text-foreground/50">
                              💡 Google Drive-এ আপলোড করা পিডিএফ ফাইলের &quot;Anyone with the link can view&quot; শেয়ার লিংকটি এখানে পেস্ট করলে শিক্ষার্থীরা সরাসরি ডাউনলোড করতে পারবে।
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">নোটিশের পূর্ণ বিবরণ ও নির্দেশনা</label>
                            <textarea
                              rows={4}
                              value={newNoticeContent}
                              onChange={(e) => setNewNoticeContent(e.target.value)}
                              placeholder="এখানে নোটিশের যাবতীয় বিস্তারিত নির্দেশনা ও তথ্য লিখুন..."
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 p-3.5 rounded-2xl bg-background border border-foreground/10">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                              <input
                                type="checkbox"
                                checked={newNoticeIsPinned}
                                onChange={(e) => setNewNoticeIsPinned(e.target.checked)}
                                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                              />
                              <span>📌 গুরুত্বপূর্ণ নোটিশ হিসেবে শীর্ষে পিন করুন</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                              <input
                                type="checkbox"
                                checked={newNoticeIsUrgent}
                                onChange={(e) => setNewNoticeIsUrgent(e.target.checked)}
                                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                              />
                              <span>🚨 জরুরি নোটিশ হিসেবে মার্ক করুন</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          {editingNoticeId && (
                            <button
                              type="button"
                              onClick={handleCancelEditNotice}
                              className="px-5 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold text-xs transition-all border border-foreground/10"
                            >
                              বাতিল করুন
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSaveOrAddNotice(slugKey)}
                            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                          >
                            {editingNoticeId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span>{editingNoticeId ? 'নোটিশ আপডেট করুন (Save Changes)' : 'নোটিশ যুক্ত করুন (Add Notice)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Published Notices List */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-foreground/10 pb-3">
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" />
                            <span>আপনার প্রকাশিত নোটিশসমূহ ({displayNotices.length})</span>
                          </h4>

                          <button
                            type="button"
                            onClick={() => handleRestoreDefaultNotices(slugKey)}
                            className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1.5 transition-all self-start sm:self-auto"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>ডিফল্ট ৫টি নোটিশ রিস্টোর করুন</span>
                          </button>
                        </div>

                        {displayNotices.length === 0 ? (
                          <div className="p-8 rounded-3xl bg-foreground/[0.02] border border-dashed border-foreground/15 text-center space-y-2">
                            <p className="text-xs font-bold text-foreground">এখনো কোনো নোটিশ নেই।</p>
                            <p className="text-[11px] text-foreground/60 max-w-md mx-auto">
                              আপনি উপরের ফর্ম থেকে নতুন নোটিশ যোগ করতে পারেন অথবা উপরের &quot;ডিফল্ট ৫টি নোটিশ রিস্টোর করুন&quot; বাটনে চাপুন।
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {displayNotices.map((not: any) => (
                              <div
                                key={not.id}
                                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                                  editingNoticeId === not.id 
                                    ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30' 
                                    : 'bg-card border-foreground/10 hover:border-foreground/20'
                                }`}
                              >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300 text-[10px] font-black uppercase">
                                      {not.categoryLabel || not.category}
                                    </span>
                                    <span className="text-[11px] font-mono text-foreground/60 bg-foreground/5 px-2 py-0.5 rounded">
                                      {not.refNo}
                                    </span>
                                    {not.isPinned && (
                                      <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                                        <Pin className="w-3 h-3 fill-amber-500" />
                                        <span>Pinned</span>
                                      </span>
                                    )}
                                    {not.isUrgent && (
                                      <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                        <Flame className="w-3 h-3 text-rose-500" />
                                        <span>Urgent</span>
                                      </span>
                                    )}
                                    {not.attachmentUrl && (
                                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                                        <ExternalLink className="w-2.5 h-2.5" />
                                        <span>PDF Link</span>
                                      </span>
                                    )}
                                    <span className="text-[11px] text-foreground/50">{not.date}</span>
                                  </div>

                                  <h5 className="font-bold text-xs sm:text-sm text-foreground truncate">{not.title}</h5>
                                  <p className="text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">{not.content}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditNotice(not)}
                                    className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/25 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                    title="নোটিশটি এডিট করুন"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>এডিট</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomNotice(slugKey, not.id)}
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                                    title="নোটিশটি মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : isNotice ? (
                  /* ------------------------------------------------------------- */
                  /* 2. NOTICE TAB 1: HERO SECTION & GENERAL NOTICE SETTINGS       */
                  /* ------------------------------------------------------------- */
                  <div className="space-y-8">
                    {/* 1. HERO SECTION CONTROLS */}
                    <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">১. হিরো সেকশন ও ব্যানার ডিজাইন (Hero Section Controls)</h4>
                          <p className="text-xs text-foreground/60">নোটিশ বোর্ডের মূল হেডার ব্যানার, শিরোনাম, বিবরণ ও ব্যাকগ্রাউন্ড ইমেজ পরিবর্তন করুন।</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Hero Headline */}
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">
                            হিরো প্রধান শিরোনাম (Hero Main Headline)
                          </label>
                          <input
                            type="text"
                            value={pageConfig.heroHeading || ''}
                            onChange={(e) => updateCustomPageField('heroHeading', e.target.value)}
                            placeholder="সকল ব্যাচের একাডেমিক নোটিশ ও অফিসিয়াল সার্কুলার"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500 font-bold"
                          />
                        </div>

                        {/* Hero Subtitle */}
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">
                            হিরো সাবটাইটেল / বিবরণ (Hero Subtitle / Description)
                          </label>
                          <textarea
                            rows={3}
                            value={pageConfig.heroSubtitle || ''}
                            onChange={(e) => updateCustomPageField('heroSubtitle', e.target.value)}
                            placeholder={`${displayName || 'আমাদের'}-এর সকল অনলাইন ও অফলাইন ব্যাচের ক্লাস রুটিন, পরীক্ষার সময়সূচি, ফলাফল, ফি এবং জরুরি আপডেটসমূহ এখান থেকে সরাসরি সংগ্রহ করুন।`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        {/* Hero Top Badge Text */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">
                              হিরো টপ ব্যাজ টেক্সট (Top Pill Badge)
                            </label>
                            <input
                              type="text"
                              value={pageConfig.heroTopBadge || ''}
                              onChange={(e) => updateCustomPageField('heroTopBadge', e.target.value)}
                              placeholder={`${displayName || 'Teacher'}'s Official Notice Board`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* Hero Background Image URL */}
                          <div>
                            <label className="text-xs font-semibold text-foreground/70 block mb-1">
                              হিরো ব্যাকগ্রাউন্ড ইমেজ URL
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={pageConfig.heroBgImage || ''}
                                onChange={(e) => updateCustomPageField('heroBgImage', e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                              />
                              <label className="px-3.5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/25 cursor-pointer text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all">
                                {uploadingNoticeHeroBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                <span>আপলোড</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleUploadNoticeHeroBg(e, slugKey)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Live Hero Preview Box */}
                        <div className="p-5 rounded-2xl bg-slate-950 text-white border border-purple-500/30 space-y-2 relative overflow-hidden shadow-lg">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                              {pageConfig.heroTopBadge || `${displayName || 'Teacher'}'s Official Notice Board`}
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              {pageConfig.sessionYear || '২০২৬ সেশন (Active)'}
                            </span>
                          </div>
                          <h5 className="font-black text-sm text-white pt-1">
                            {pageConfig.heroHeading || 'সকল ব্যাচের একাডেমিক নোটিশ ও অফিসিয়াল সার্কুলার'}
                          </h5>
                          <p className="text-[11px] text-slate-300 line-clamp-2">
                            {pageConfig.heroSubtitle || `${displayName || 'আমাদের'}-এর সকল অনলাইন ও অফলাইন ব্যাচের ক্লাস রুটিন, পরীক্ষার সময়সূচি, ফলাফল, ফি এবং জরুরি আপডেটসমূহ এখান থেকে সরাসরি সংগ্রহ করুন।`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. BREAKING NOTICE TICKER */}
                    <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">২. জরুরি স্ক্রোলিং নোটিশ বার (Breaking Urgent Notice Ticker)</h4>
                          <p className="text-xs text-foreground/60">পেজের শীর্ষে চলমান লাল ব্রেকিং নিউজের শিরোনাম নির্ধারণ করুন।</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">জরুরি নোটিশের শিরোনাম</label>
                          <input
                            type="text"
                            value={pageConfig.tickerHeadline || ''}
                            onChange={(e) => updateCustomPageField('tickerHeadline', e.target.value)}
                            placeholder="এইচএসসি ২০২৬ চূড়ান্ত মডেল টেস্ট ও স্পেশাল রিভিশন ক্লাসের সময়সূচি প্রকাশ"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">স্মারক নম্বর (Reference No)</label>
                          <input
                            type="text"
                            value={pageConfig.tickerRefNo || ''}
                            onChange={(e) => updateCustomPageField('tickerRefNo', e.target.value)}
                            placeholder="FB/NOT-2026/08-01"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. SESSION & HELPLINE */}
                    <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">৩. শিক্ষাবর্ষ ও নোটিশ হেল্পলাইন</h4>
                          <p className="text-xs text-foreground/60">সেশন ব্যাজ ও হোয়াটসঅ্যাপ নোটিফিকেশন নম্বর কাস্টমাইজ করুন।</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">শিক্ষাবর্ষ সেশন ব্যাজ</label>
                          <input
                            type="text"
                            value={pageConfig.sessionYear || ''}
                            onChange={(e) => updateCustomPageField('sessionYear', e.target.value)}
                            placeholder="২০২৬ সেশন (Active)"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">WhatsApp নোটিশ সাপোর্ট নম্বর</label>
                          <input
                            type="text"
                            value={pageConfig.noticeWhatsapp || ''}
                            onChange={(e) => updateCustomPageField('noticeWhatsapp', e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ------------------------------------------------------------- */
                  /* 3. GENERAL CUSTOM PAGE CONTROLS                               */
                  /* ------------------------------------------------------------- */
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <h4 className="text-sm font-bold text-foreground">১. মূল শিরোনাম ও বর্ণনা</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">পেজ শিরোনাম (Heading)</label>
                          <input
                            type="text"
                            value={pageConfig.heading || ''}
                            onChange={(e) => updateCustomPageField('heading', e.target.value)}
                            placeholder={`${customPage.name} - ${displayName || 'আমাদের একাডেমি'}`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-foreground/70 block mb-1">পেজ সাবটাইটেল / বিবরণ</label>
                          <textarea
                            rows={3}
                            value={pageConfig.description || ''}
                            onChange={(e) => updateCustomPageField('description', e.target.value)}
                            placeholder="এই পেজের মূল বিষয়বস্তু ও বিবরণ এখানে লিখুন..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* Floating Circular Master Save Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 group">
        <button
          type="button"
          onClick={handleSaveConfig}
          disabled={saving}
          aria-label={`${currentActiveSectionName} সংরক্ষণ করুন`}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/80 transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-orange-500/25 border-2 border-white/30 disabled:opacity-50 cursor-pointer ${
            saving ? 'animate-pulse' : ''
          }`}
          title={`${currentActiveSectionName} সংরক্ষণ করুন (Save)`}
        >
          {saving ? (
            <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" />
          ) : (
            <Save className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>

        {/* Floating Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3.5 py-1.5 rounded-xl bg-slate-950/95 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 flex items-center gap-1.5 z-50 backdrop-blur-md">
          <Save className="w-3.5 h-3.5 text-orange-400" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : `${currentActiveSectionName} সংরক্ষণ করুন`}</span>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-foreground/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">অসংরক্ষিত পরিবর্তন রয়েছে!</h3>
                <p className="text-xs text-foreground/60">Unsaved Changes Detected</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              আপনি <strong className="text-orange-500">{currentActiveSectionName}</strong>-এ কিছু পরিবর্তন করেছেন যা এখনো সংরক্ষণ করা হয়নি। আপনি কি সেভ করে পরের সেকশনে যেতে চান?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveAndSwitch}
                disabled={saving}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>সেভ করে যান</span>
              </button>

              <button
                type="button"
                onClick={handleDiscardAndSwitch}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs transition-all"
              >
                সেভ ছাড়াই যান
              </button>

              <button
                type="button"
                onClick={handleCancelSwitch}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/70 font-bold text-xs transition-all border border-foreground/10"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
