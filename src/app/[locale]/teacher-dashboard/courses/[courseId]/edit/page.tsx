"use client";

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { generateCourseSlug, generateCategorySlug, resolveCourseBySlugOrId } from '@/lib/slug';
import { ImagePlus, Loader2, ArrowLeft, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [slugHistory, setSlugHistory] = useState<string[]>([]);
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [realCourseId, setRealCourseId] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [courseType, setCourseType] = useState('coaching');
  const [category, setCategory] = useState(''); // Education Level
  const [eduClass, setEduClass] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [coachingName, setCoachingName] = useState('');
  const [price, setPrice] = useState('');
  
  // Marketing Stats
  const [totalLiveClasses, setTotalLiveClasses] = useState('');
  const [totalVideoLessons, setTotalVideoLessons] = useState('');
  const [totalExams, setTotalExams] = useState('');
  const [totalPdfs, setTotalPdfs] = useState('');
  const [hasDoubtSolving, setHasDoubtSolving] = useState(false);

  // Pricing & Dates
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountValidUntil, setDiscountValidUntil] = useState('');
  const [classStartDate, setClassStartDate] = useState('');
  const [courseValidity, setCourseValidity] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Course Coverage
  const [specificSubjects, setSpecificSubjects] = useState<any[]>([]);

  const handleAddSubject = () => {
    setSpecificSubjects([...specificSubjects, { name: '', instructor: '', liveClasses: '', videoLessons: '', exams: '' }]);
  };

  const removeSubject = (index: number) => {
    setSpecificSubjects(specificSubjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: string, value: string) => {
    const updated = [...specificSubjects];
    updated[index][field] = value;
    setSpecificSubjects(updated);
    
    if (field === 'liveClasses' || field === 'videoLessons' || field === 'exams') {
       let tl = 0, tv = 0, te = 0;
       updated.forEach(sub => {
         tl += Number(sub.liveClasses || 0);
         tv += Number(sub.videoLessons || 0);
         te += Number(sub.exams || 0);
       });
       if (tl > 0) setTotalLiveClasses(String(tl));
       if (tv > 0) setTotalVideoLessons(String(tv));
       if (te > 0) setTotalExams(String(te));
    }
  };

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const resolved = await resolveCourseBySlugOrId(db, courseId);
        if (resolved) {
          setRealCourseId(resolved.id);
          setTitle(resolved.title || '');
          setCustomSlug(resolved.slug || '');
          setSlugHistory(resolved.slugHistory || []);
          setSubtitle(resolved.subtitle || '');
          setCourseType(resolved.courseType || 'coaching');
          setCategory(resolved.category || '');
          setEduClass(resolved.eduClass || '');
          setDepartment(resolved.department || '');
          setYear(resolved.year || '');
          setCoachingName(resolved.coachingName || '');
          setPrice(resolved.price !== undefined && resolved.price !== null ? resolved.price.toString() : '');
          setThumbnailPreview(resolved.thumbnailUrl || '');
          
          setTotalLiveClasses(resolved.totalLiveClasses ? resolved.totalLiveClasses.toString() : '');
          setTotalVideoLessons(resolved.totalVideoLessons ? resolved.totalVideoLessons.toString() : '');
          setTotalExams(resolved.totalExams ? resolved.totalExams.toString() : '');
          setTotalPdfs(resolved.totalPdfs ? resolved.totalPdfs.toString() : '');
          setHasDoubtSolving(resolved.hasDoubtSolving || false);
          
          setDiscountPrice(resolved.discountPrice !== undefined && resolved.discountPrice !== null ? resolved.discountPrice.toString() : '');
          setDiscountValidUntil(resolved.discountValidUntil || '');
          setClassStartDate(resolved.classStartDate || '');
          setCourseValidity(resolved.courseValidity || '');
          setContactNumber(resolved.contactNumber || '');
          
          let parsedSubjects: any[] = [];
          if (resolved.specificSubjects && Array.isArray(resolved.specificSubjects)) {
            parsedSubjects = resolved.specificSubjects.map((sub: any) => {
              if (typeof sub === 'string') {
                return { name: sub, instructor: '', liveClasses: '', videoLessons: '', exams: '' };
              }
              return sub;
            });
          }
          setSpecificSubjects(parsedSubjects);
        }
      } catch (err) {
        console.error("Error fetching course", err);
        setError("Failed to load course details.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = realCourseId || courseId;
    if (!user || !targetId) return;
    if (!title || !category || price === '' || price === undefined || price === null || (!thumbnail && !thumbnailPreview)) {
      setError('Please fill in all required fields and upload a thumbnail.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Upload Thumbnail to ImgBB if changed
      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        thumbnailUrl = await uploadImageToImgBB(thumbnail);
      }

      const teacherIdentifier = (courseType === 'coaching' && coachingName) ? coachingName : (user.displayName || user.email?.split('@')[0] || '');
      const finalSlug = generateCourseSlug(customSlug || title, teacherIdentifier);
      const existingHistory = slugHistory || [];
      const updatedHistory = existingHistory.includes(finalSlug)
        ? existingHistory
        : (customSlug ? [...existingHistory, customSlug, finalSlug] : [finalSlug]);
      const cleanHistory = Array.from(new Set(updatedHistory.filter(Boolean)));

      // 2. Update Course in Firestore
      const courseData = {
        title,
        slug: finalSlug,
        slugHistory: cleanHistory,
        subtitle,
        courseType,
        category, // Used as Education Level
        eduClass: (category === 'primary' || category === 'high_school' || category === 'intermediate') ? eduClass : '',
        department: (category === 'intermediate' || category === 'honours' || category === 'masters' || category === 'admission') ? department : '',
        year: (category === 'honours' || category === 'masters') ? year : '',
        coachingName: courseType === 'coaching' ? coachingName : '',
        specificSubjects: specificSubjects,
        totalLiveClasses: totalLiveClasses ? Number(totalLiveClasses) : null,
        totalVideoLessons: totalVideoLessons ? Number(totalVideoLessons) : 0,
        totalExams: totalExams ? Number(totalExams) : 0,
        totalPdfs: totalPdfs ? Number(totalPdfs) : 0,
        hasDoubtSolving,
        price: Number(price),
        discountPrice: (discountPrice !== '' && discountPrice !== null && discountPrice !== undefined) ? Number(discountPrice) : null,
        discountValidUntil,
        classStartDate,
        courseValidity,
        contactNumber,
        thumbnailUrl,
      };

      await updateDoc(doc(db, 'courses', targetId), courseData);
      setCustomSlug(finalSlug);
      setSlugHistory(cleanHistory);
      
      toast.success('Course updated successfully!');
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Error updating course:', err);
      setError(err.message || 'Failed to update course. Please try again.');
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Header Banner (0px border radius / rounded-none) */}
      <div className="relative overflow-hidden rounded-none p-4 sm:p-6 md:p-9 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border-b border-white/10 -mx-2 -mt-2 sm:-mx-4 sm:-mt-4 md:-mx-8 md:-mt-8 mb-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Course Management
              </span>
            </div>

            <Link 
              href="/teacher-dashboard/courses" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Courses
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Basic Information</span>
          </h1>

          <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed font-medium pt-1">
            Change the core identity, pricing, subject distribution, and marketing details of your course.
          </p>
        </div>
      </div>

      {/* Main Form Container (Compact Padding on Mobile: p-2.5 sm:p-6 md:p-8) */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 md:p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Course Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val);
                    if (!isSlugTouched) {
                      const auto = val.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '').replace(/-+/g, '-');
                      setCustomSlug(auto);
                    }
                  }}
                  placeholder="e.g. গাণিতিক পদার্থবিজ্ঞান বা Master React in 30 Days"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80">Course URL Slug (ইউআরএল স্লাগ)</label>
                  <span className="text-[10px] text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded-md">
                    ℹ️ ইংরেজি অক্ষর (a-z, 0-9)
                  </span>
                </div>
                <input 
                  type="text" 
                  value={customSlug}
                  onChange={(e) => {
                    setIsSlugTouched(true);
                    const formatted = e.target.value
                      .toLowerCase()
                      .replace(/[\s_]+/g, '-')
                      .replace(/[^\w-]/g, '')
                      .replace(/-+/g, '-');
                    setCustomSlug(formatted);
                  }}
                  placeholder="e.g. ganitik-physics or master-react"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Live URL Preview Bar */}
            {(title || customSlug) && (
              <div className="p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-xl flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="font-bold text-orange-500 flex items-center gap-1 shrink-0">
                  <span>🔗</span> লাইভ লিংক প্রিভিউ:
                </span>
                <span className="text-foreground/90 font-semibold bg-background/60 px-2.5 py-1 rounded-lg border border-foreground/10">
                  sky-learners.com/courses/{generateCategorySlug(category)}/{generateCourseSlug(customSlug || title, (courseType === 'coaching' && coachingName) ? coachingName : (user?.displayName || user?.email?.split('@')[0] || ''))}
                </span>
              </div>
            )}

            {/* Subtitle */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Subtitle / Short Description</label>
              <textarea 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A brief catchy description of what students will learn..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium resize-none custom-scrollbar"
              ></textarea>
            </div>

            {/* Course Type in 1 Row (2 Columns like Create Course page) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Course Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 sm:p-3 rounded-xl border transition-all ${courseType === 'individual' ? 'border-orange-500 bg-orange-500/10 text-foreground font-bold shadow-xs' : 'border-foreground/15 bg-background hover:border-orange-500/40 text-foreground/70'}`}>
                  <input type="radio" name="courseType" value="individual" checked={courseType === 'individual'} onChange={() => setCourseType('individual')} className="accent-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold truncate">Individual Teacher</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer p-2.5 sm:p-3 rounded-xl border transition-all ${courseType === 'coaching' ? 'border-orange-500 bg-orange-500/10 text-foreground font-bold shadow-xs' : 'border-foreground/15 bg-background hover:border-orange-500/40 text-foreground/70'}`}>
                  <input type="radio" name="courseType" value="coaching" checked={courseType === 'coaching'} onChange={() => setCourseType('coaching')} className="accent-orange-500 w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold truncate">Coaching Center</span>
                </label>
              </div>
            </div>

            {/* Education Level & Coaching Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={courseType === 'individual' ? "md:col-span-2" : ""}>
                <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Education Level (Category) <span className="text-red-500">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setEduClass('');
                    setDepartment('');
                    setYear('');
                    setSpecificSubjects([]);
                  }}
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium appearance-none"
                  required
                >
                  <option value="" disabled className="bg-background text-foreground">Select Level</option>
                  <option value="primary" className="bg-background text-foreground">Primary School</option>
                  <option value="high_school" className="bg-background text-foreground">High School</option>
                  <option value="intermediate" className="bg-background text-foreground">Intermediate / HSC</option>
                  <option value="admission" className="bg-background text-foreground">Admission</option>
                  <option value="honours" className="bg-background text-foreground">Honours / Undergrad</option>
                  <option value="masters" className="bg-background text-foreground">Masters / Postgrad</option>
                  <option value="skills" className="bg-background text-foreground">Skills / Others</option>
                </select>
              </div>
              {courseType === 'coaching' && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Your School / Coaching Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={coachingName}
                    onChange={(e) => setCoachingName(e.target.value)}
                    placeholder="e.g. ABC Coaching Center"
                    className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                    required
                  />
                </div>
              )}
            </div>

            {/* Primary & High School Class Select */}
            {(category === 'primary' || category === 'high_school') && (
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Class <span className="text-red-500">*</span></label>
                <select 
                  value={eduClass}
                  onChange={(e) => setEduClass(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium appearance-none"
                  required
                >
                  <option value="" disabled className="bg-background text-foreground">Select Class</option>
                  {category === 'primary' 
                    ? Array.from({length: 5}, (_, i) => <option key={i+1} value={i+1} className="bg-background text-foreground">Class {i+1}</option>)
                    : Array.from({length: 5}, (_, i) => <option key={i+6} value={i+6} className="bg-background text-foreground">Class {i+6}</option>)
                  }
                </select>
              </div>
            )}

            {/* Intermediate Class & Group Select */}
            {category === 'intermediate' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Class <span className="text-red-500">*</span></label>
                  <select value={eduClass} onChange={(e) => setEduClass(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium appearance-none" required>
                    <option value="" disabled className="bg-background text-foreground">Select Class</option>
                    <option value="11" className="bg-background text-foreground">Class 11</option>
                    <option value="12" className="bg-background text-foreground">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Group <span className="text-red-500">*</span></label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium appearance-none" required>
                    <option value="" disabled className="bg-background text-foreground">Select Group</option>
                    <option value="science" className="bg-background text-foreground">Science</option>
                    <option value="arts" className="bg-background text-foreground">Arts (Humanities)</option>
                    <option value="commerce" className="bg-background text-foreground">Commerce</option>
                  </select>
                </div>
              </div>
            )}

            {/* Admission Unit Select */}
            {category === 'admission' && (
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Target Segment / Unit <span className="text-red-500">*</span></label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium appearance-none" required>
                  <option value="" disabled className="bg-background text-foreground">Select Target Segment</option>
                  <option value="engineering" className="bg-background text-foreground">Engineering</option>
                  <option value="medical" className="bg-background text-foreground">Medical</option>
                  <option value="university" className="bg-background text-foreground">University (A/B/C/D Unit)</option>
                  <option value="iba" className="bg-background text-foreground">IBA / BUP</option>
                </select>
              </div>
            )}

            {/* Honours & Masters inputs */}
            {(category === 'honours' || category === 'masters') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Department / Subject <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-1.5 text-foreground/80">Year / Semester <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 1st Year"
                    className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {/* Course Subjects & Class Distribution (Enhanced Mobile UI & Proper Remove Button) */}
            {category && category !== 'skills' && (
              <div className="bg-foreground/5 p-2.5 sm:p-5 rounded-2xl border border-foreground/10 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-foreground/90">Course Subjects & Class Distribution <span className="text-red-500">*</span></label>
                    <p className="text-[11px] sm:text-xs text-foreground/60">Define subject-wise class breakdown for your students.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddSubject} 
                    className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-bold rounded-xl transition-all border border-orange-500/20 cursor-pointer shadow-xs"
                  >
                    + Add Subject
                  </button>
                </div>

                <div className="space-y-2.5">
                  {specificSubjects.map((sub, idx) => (
                    <div key={idx} className="p-2.5 sm:p-4 bg-background rounded-2xl border border-foreground/10 space-y-2.5 shadow-xs">
                      {/* Subject Header Row with Clean Remove Button */}
                      <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Subject #{idx + 1}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => removeSubject(idx)} 
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1 border border-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                      
                      {/* All Subject Fields in 1 Single Row on Desktop/Laptop */}
                      <div className={`grid grid-cols-1 ${courseType === 'coaching' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-2.5 items-end`}>
                        <div>
                          <label className="block text-[11px] font-bold text-foreground/70 mb-1">Subject Name</label>
                          <input 
                            type="text" 
                            value={sub.name} 
                            onChange={e => updateSubject(idx, 'name', e.target.value)} 
                            placeholder="e.g. Physics" 
                            className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500 text-xs sm:text-sm font-medium" 
                            required 
                          />
                        </div>
                        {courseType === 'coaching' && (
                          <div>
                            <label className="block text-[11px] font-bold text-foreground/70 mb-1">Instructor Name</label>
                            <input 
                              type="text" 
                              value={sub.instructor || ''} 
                              onChange={e => updateSubject(idx, 'instructor', e.target.value)} 
                              placeholder="e.g. Dr. Rahat" 
                              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500 text-xs sm:text-sm font-medium" 
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-[11px] font-bold text-foreground/70 mb-1 text-center">Live Classes</label>
                          <input 
                            type="number" 
                            value={sub.liveClasses || ''} 
                            onChange={e => updateSubject(idx, 'liveClasses', e.target.value)} 
                            placeholder="0" 
                            className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-medium text-center" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-foreground/70 mb-1 text-center">Videos</label>
                          <input 
                            type="number" 
                            value={sub.videoLessons || ''} 
                            onChange={e => updateSubject(idx, 'videoLessons', e.target.value)} 
                            placeholder="0" 
                            className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-medium text-center" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-foreground/70 mb-1 text-center">Exams</label>
                          <input 
                            type="number" 
                            value={sub.exams || ''} 
                            onChange={e => updateSubject(idx, 'exams', e.target.value)} 
                            placeholder="0" 
                            className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500 text-xs font-medium text-center" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {specificSubjects.length === 0 && (
                    <div className="text-center py-6 text-xs text-foreground/50 border border-dashed border-foreground/15 rounded-2xl">
                      No subjects added yet. Click "+ Add Subject" to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Marketing Stats & Features */}
            <div className="space-y-4 p-2.5 sm:p-6 bg-foreground/5 rounded-2xl border border-foreground/10">
              <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 mb-4">Marketing Stats & Features</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Total Live Classes</label>
                  <input type="number" value={totalLiveClasses} onChange={e => setTotalLiveClasses(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Total Videos</label>
                  <input type="number" value={totalVideoLessons} onChange={e => setTotalVideoLessons(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Total Exams</label>
                  <input type="number" value={totalExams} onChange={e => setTotalExams(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Total Notes/PDFs</label>
                  <input type="number" value={totalPdfs} onChange={e => setTotalPdfs(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 text-sm font-medium" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="doubtSolving" 
                  checked={hasDoubtSolving} 
                  onChange={e => setHasDoubtSolving(e.target.checked)} 
                  className="w-5 h-5 accent-orange-500 shrink-0 cursor-pointer"
                />
                <label htmlFor="doubtSolving" className="text-xs sm:text-sm font-semibold cursor-pointer text-foreground/90">
                  Includes 24/7 Doubt Solving Support / Group
                </label>
              </div>
            </div>

            {/* Pricing, Dates & Contact Section */}
            <div className="space-y-4 p-2.5 sm:p-6 bg-foreground/5 rounded-2xl border border-foreground/10">
              <h3 className="font-bold text-base sm:text-lg border-b border-foreground/10 pb-2 mb-4">Pricing, Dates & Contact</h3>
              
              {/* Regular Price & Discount Price in 1 Row on Mobile (grid grid-cols-2) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 items-end">
                <div className="flex flex-col justify-end h-full">
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1 leading-snug min-h-[32px] sm:min-h-[36px] flex items-end">
                    <span>Regular Price (BDT) <span className="text-red-500">*</span></span>
                  </label>
                  <input 
                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end h-full">
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1 leading-snug min-h-[32px] sm:min-h-[36px] flex items-end">
                    <span>Discount Price (Optional)</span>
                  </label>
                  <input 
                    type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-semibold"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col justify-end h-full mt-1 md:mt-0">
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1 leading-snug min-h-[32px] sm:min-h-[36px] flex items-end">
                    <span>Discount Valid Until</span>
                  </label>
                  <input 
                    type="date" value={discountValidUntil} onChange={e => setDiscountValidUntil(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-medium"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Class Start Date</label>
                  <input 
                    type="date" value={classStartDate} onChange={e => setClassStartDate(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Course Validity</label>
                  <input 
                    type="text" value={courseValidity} onChange={e => setCourseValidity(e.target.value)} placeholder="e.g. 6 Months, Till Admission Test"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-foreground/80 mb-1">Contact Number (For Inquiries)</label>
                <input 
                  type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)}
                  placeholder="e.g. 16910 or 017XXXXXXX"
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-background border border-foreground/15 rounded-xl focus:border-orange-500 transition-colors text-sm font-medium"
                />
              </div>
            </div>

            {/* Course Thumbnail */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 text-foreground/80">Course Thumbnail <span className="text-red-500">*</span></label>
              
              <div className="relative group w-full aspect-video md:aspect-[21/9] rounded-2xl border-2 border-dashed border-foreground/20 hover:border-orange-500/50 bg-foreground/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail Preview" fill className="object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <ImagePlus className="w-10 h-10 text-foreground/40 mx-auto mb-2 group-hover:text-orange-500 transition-colors" />
                    <p className="font-medium text-foreground/70 text-sm">Click to upload thumbnail</p>
                    <p className="text-xs text-foreground/40 mt-1">1920x1080 (16:9) recommended. JPG, PNG or WEBP.</p>
                  </div>
                )}
                
                {thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2 text-sm">
                      <ImagePlus className="w-5 h-5" /> Change Image
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-6 border-t border-foreground/10 flex justify-end gap-3">
            <Link 
              href="/teacher-dashboard/courses"
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-bold text-xs sm:text-sm transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
