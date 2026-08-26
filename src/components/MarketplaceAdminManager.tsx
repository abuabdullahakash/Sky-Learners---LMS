"use client";

import { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  PlusCircle, 
  BookOpen, 
  School, 
  GraduationCap, 
  Award, 
  Building2, 
  Library, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { generateCourseUrl } from '@/lib/slug';

interface MarketplaceAdminManagerProps {
  courses: any[];
  onRefresh: () => void;
}

const defaultDemoCourses = [
  // 1. Primary School
  {
    title: 'প্রাথমিক গণিত আনন্দময় পাঠ (১ম শ্রেণি)',
    subtitle: 'মজার ছলে সহজে গণনা ও প্রাথমিক যোগ-বিয়োগ শিক্ষা।',
    category: 'primary',
    eduClass: '1',
    price: 0,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    description: '১ম শ্রেণির শিক্ষার্থীদের জন্য রঙিন ও আকর্ষণীয় গণিত ক্লাস।',
  },
  {
    title: 'ছোটদের ইংরেজি স্পোকেন ও ওয়ার্ড বিল্ডিং (২য় শ্রেণি)',
    subtitle: 'ধ্বনি ও ছবির মাধ্যমে সহজে ইংরেজি রিডিং ও স্পিকিং দক্ষতা।',
    category: 'primary',
    eduClass: '2',
    price: 500,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    description: '২য় শ্রেণির শিশুদের জন্য স্পোকেন ইংলিশ ফাউন্ডেশন।',
  },
  {
    title: 'প্রাথমিক বিজ্ঞান ও পরিবেশ পরিচিতি (৩য় শ্রেণি)',
    subtitle: 'জীব ও জড়, উদ্ভিদ ও প্রাণীর জগতের মজার সব তথ্য।',
    category: 'primary',
    eduClass: '3',
    price: 0,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    description: '৩য় শ্রেণির বিজ্ঞান পাঠ্যবইয়ের প্রতিটি অধ্যায়ের সহজ সমাধান।',
  },
  {
    title: 'গণিত ফাউন্ডেশন ও অলিম্পিয়াড প্রস্তুতি (৪র্থ শ্রেণি)',
    subtitle: 'গুণ, ভাগ, জ্যামিতি ও লজিক্যাল গণিত সমস্যার সহজ কৌশল।',
    category: 'primary',
    eduClass: '4',
    price: 750,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
    description: '৪র্থ শ্রেণির গণিতে ফুল মার্কস পাওয়ার সেরা গাইডলাইন।',
  },
  {
    title: 'প্রাথমিক বৃত্তি ও সমাপনী চূড়ান্ত প্রস্তুতি (৫ম শ্রেণি)',
    subtitle: 'বাংলা, ইংরেজি, গণিত ও বিজ্ঞানের মডেল টেস্ট ও সাজেস্টিক রিভিশন।',
    category: 'primary',
    eduClass: '5',
    price: 999,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80',
    description: '৫ম শ্রেণির বৃত্তি পরীক্ষার জন্য পূর্ণাঙ্গ সহায়িকা।',
  },

  // 2. High School
  {
    title: 'ক্লাস ৬ গণিত ও বিজ্ঞান মাস্টারক্লাস (নতুন কারিকুলাম)',
    subtitle: 'নতুন কারিকুলাম অনুসারে বাস্তবসম্মত প্রজেক্ট ভিত্তিক শিক্ষা।',
    category: 'high_school',
    eduClass: '6',
    price: 800,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'এসএসসি পদার্থবিজ্ঞান ও রসায়ন ক্র্যাশ কোর্স (১০ম শ্রেণি)',
    subtitle: 'বোর্ড প্রশ্ন সমাধান, সৃজনশীল প্র্যাকটিস এবং গাণিতিক সমস্যার সমাধান।',
    category: 'high_school',
    eduClass: '10',
    price: 1500,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
  },

  // 3. HSC
  {
    title: 'HSC উচ্চতর গণিত ১ম ও ২য় পত্র (বিজ্ঞান বিভাগ)',
    subtitle: 'ক্যালকুলাস, ত্রিকোণমিতি, ভেক্টর ও কনিক্সের কনসেপ্ট ক্লিয়ার কোর্স।',
    category: 'intermediate',
    eduClass: '11',
    department: 'science',
    price: 2000,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
  },

  // 4. Admission
  {
    title: 'মেডিকেল বায়োলজি ও জিকে চূড়ান্ত এডমিশন প্রোগ্রাম',
    subtitle: 'বিগত ২০ বছরের প্রশ্ন বিশ্লেষণ, লাইভ এক্সাম ও অধ্যায়ভিত্তিক শর্টকাট।',
    category: 'admission',
    department: 'medical',
    price: 2500,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  },

  // 5. Skills
  {
    title: 'কমপ্লিট ওয়েব ডেভেলপমেন্ট ও ফ্রিল্যান্সিং বুটক্যাম্প',
    subtitle: 'HTML, CSS, JavaScript, React ও Next.js শিখে প্রজেক্ট তৈরির পূর্ণাঙ্গ কোর্স।',
    category: 'skills',
    price: 3000,
    isPublished: true,
    isDemo: true,
    instructorName: 'Sky Learners Academy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
  }
];

export default function MarketplaceAdminManager({ courses, onRefresh }: MarketplaceAdminManagerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const demoCourses = courses.filter(c => c.isDemo === true);
  const teacherCourses = courses.filter(c => !c.isDemo);

  const handleSeedDemoCourses = async () => {
    setLoading(true);
    try {
      const coursesRef = collection(db, 'courses');
      for (const demo of defaultDemoCourses) {
        const newDocRef = doc(coursesRef);
        await setDoc(newDocRef, {
          ...demo,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      toast.success('🎉 সফলভাবে ডেমো কোর্সগুলো মার্কেটপ্লেসে যুক্ত করা হয়েছে!');
      onRefresh();
    } catch (err) {
      console.error("Error seeding demo courses:", err);
      toast.error('ডেমো কোর্স যুক্ত করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllDemoCourses = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে সকল ডেমো কোর্স মুছে ফেলতে চান? (শিক্ষকদের আসল কোর্স নিরাপদ থাকবে)')) return;
    setLoading(true);
    try {
      for (const c of demoCourses) {
        await deleteDoc(doc(db, 'courses', c.id));
      }
      toast.success(`🗑️ মোট ${demoCourses.length} টি ডেমো কোর্স মুছে ফেলা হয়েছে!`);
      onRefresh();
    } catch (err) {
      console.error("Error deleting demo courses:", err);
      toast.error('ডেমো কোর্স মুছতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingleCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast.success(`"${title}" সফলভাবে ডিলিট করা হয়েছে`);
      onRefresh();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error('কোর্স ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'courses', courseId), { isPublished: !currentStatus });
      toast.success(currentStatus ? 'কোর্সটি ড্রাফট করা হয়েছে' : 'কোর্সটি পাবলিশ করা হয়েছে');
      onRefresh();
    } catch (err) {
      console.error("Error updating course publish status:", err);
      toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const categories = [
    { id: 'all', name: 'সকল ক্যাটাগরি', icon: Layers },
    { id: 'primary', name: 'প্রাথমিক বিদ্যালয় (Primary)', icon: School },
    { id: 'high_school', name: 'উচ্চ বিদ্যালয় (High School)', icon: GraduationCap },
    { id: 'intermediate', name: 'উচ্চ মাধ্যমিক (HSC)', icon: Award },
    { id: 'admission', name: 'বিশ্ববিদ্যালয় ভর্তি', icon: Building2 },
    { id: 'honours', name: 'অনার্স / মাস্টার্স', icon: Library },
    { id: 'skills', name: 'দক্ষতা (Skills)', icon: Sparkles },
  ];

  const filteredDisplayCourses = courses.filter(c => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'honours') return c.category === 'honours' || c.category === 'masters';
    return c.category === selectedCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-slate-900 border border-orange-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Marketplace Content & Demo Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            মার্কেটপ্লেস ও ডেমো কোর্স কন্ট্রোল সেন্টার
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            এখান থেকে আপনি মূল মার্কেটপ্লেসের সকল ক্যাটাগরির জন্য ডেমো কোর্স যুক্ত করতে পারবেন এবং প্রয়োজনমতো এক ক্লিকে মুছে ফেলতে পারবেন। শিক্ষকদের নিজস্ব কোর্স সুরক্ষিত থাকবে।
          </p>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSeedDemoCourses}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>✨ সিড ডেমো কোর্স যুক্ত করুন</span>
          </button>

          {demoCourses.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllDemoCourses}
              disabled={loading}
              className="px-4 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>🗑️ ডেমো কোর্স মুছুন ({demoCourses.length})</span>
            </button>
          )}

          <Link
            href="/courses"
            target="_blank"
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>মার্কেটপ্লেস দেখুন</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">মোট মার্কেটপ্লেস কোর্স</p>
          <p className="text-2xl font-black text-white mt-1">{courses.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-orange-500/30 p-5 rounded-2xl">
          <p className="text-xs text-orange-400 font-medium">সক্রিয় ডেমো কোর্স (Demo)</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{demoCourses.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs text-blue-400 font-medium">শিক্ষকদের আসল কোর্স (Live)</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{teacherCourses.length}</p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Courses List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <span>কোর্স তালিকা ({filteredDisplayCourses.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">কোর্স টাইটেল</th>
                <th className="px-4 py-3.5">ক্যাটাগরি / শ্রেণি</th>
                <th className="px-4 py-3.5">টাইপ</th>
                <th className="px-4 py-3.5">মূল্য</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDisplayCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                        {c.thumbnailUrl ? (
                          <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-500 m-auto" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs line-clamp-1">{c.title}</p>
                        <p className="text-[10px] text-slate-400">{c.instructorName || 'Instructor'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">
                    <span className="capitalize font-bold text-slate-200">{c.category || 'General'}</span>
                    {c.eduClass && <span className="text-[10px] text-slate-400 block">Class: {c.eduClass}</span>}
                    {c.department && <span className="text-[10px] text-slate-400 block">{c.department}</span>}
                  </td>
                  <td className="px-4 py-4">
                    {c.isDemo ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        ✨ Demo
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Teacher Live
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-bold text-white">
                    {c.price === 0 || !c.price ? (
                      <span className="text-emerald-400">Free</span>
                    ) : (
                      <span>৳{c.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(c.id, c.isPublished !== false)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        c.isPublished !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {c.isPublished !== false ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={generateCourseUrl(c)}
                        target="_blank"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="কোর্স প্রিভিউ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleCourse(c.id, c.title)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors"
                        title="কোর্স মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
