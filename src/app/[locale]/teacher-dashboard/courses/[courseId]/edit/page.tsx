"use client";

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { ImagePlus, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
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
  const [isFullClassCourse, setIsFullClassCourse] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');

  const handleAddSubject = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = subjectInput.trim();
      if (val && !subjects.includes(val)) {
        setSubjects([...subjects, val]);
      }
      setSubjectInput('');
    }
  };

  const removeSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
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
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          setTitle(data.title || '');
          setSubtitle(data.subtitle || '');
          setCourseType(data.courseType || 'coaching');
          setCategory(data.category || '');
          setEduClass(data.eduClass || '');
          setDepartment(data.department || '');
          setYear(data.year || '');
          setCoachingName(data.coachingName || '');
          setPrice(data.price ? data.price.toString() : '');
          setThumbnailPreview(data.thumbnailUrl || '');
          
          setTotalLiveClasses(data.totalLiveClasses ? data.totalLiveClasses.toString() : '');
          setTotalVideoLessons(data.totalVideoLessons ? data.totalVideoLessons.toString() : '');
          setTotalExams(data.totalExams ? data.totalExams.toString() : '');
          setTotalPdfs(data.totalPdfs ? data.totalPdfs.toString() : '');
          setHasDoubtSolving(data.hasDoubtSolving || false);
          
          setDiscountPrice(data.discountPrice ? data.discountPrice.toString() : '');
          setDiscountValidUntil(data.discountValidUntil || '');
          setClassStartDate(data.classStartDate || '');
          setCourseValidity(data.courseValidity || '');
          setContactNumber(data.contactNumber || '');
          
          setIsFullClassCourse(data.isFullClassCourse ?? true);
          setSubjects(data.subjects || []);
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
    if (!user || !courseId) return;
    if (!title || !category || !price || (!thumbnail && !thumbnailPreview)) {
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

      // 2. Update Course in Firestore
      const courseData = {
        title,
        subtitle,
        courseType,
        category, // Used as Education Level
        eduClass: (category === 'primary' || category === 'high_school' || category === 'intermediate') ? eduClass : '',
        department: (category === 'intermediate' || category === 'honours' || category === 'masters' || category === 'admission') ? department : '',
        year: (category === 'honours' || category === 'masters') ? year : '',
        coachingName: courseType === 'coaching' ? coachingName : '',
        isFullClassCourse,
        subjects: !isFullClassCourse ? subjects : [],
        totalLiveClasses: totalLiveClasses ? Number(totalLiveClasses) : 0,
        totalVideoLessons: totalVideoLessons ? Number(totalVideoLessons) : 0,
        totalExams: totalExams ? Number(totalExams) : 0,
        totalPdfs: totalPdfs ? Number(totalPdfs) : 0,
        hasDoubtSolving,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        discountValidUntil,
        classStartDate,
        courseValidity,
        contactNumber,
        thumbnailUrl,
      };

      await updateDoc(doc(db, 'courses', courseId), courseData);
      
      // 3. Redirect back to dashboard listing
      router.push('/teacher-dashboard/courses');
      
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
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <Link href="/teacher-dashboard/courses" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
        <h1 className="text-3xl font-extrabold mb-2">Edit Basic Information</h1>
        <p className="text-foreground/70">Change the core identity of your course.</p>
      </div>

      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-3xl p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground/80">Course Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master React in 30 Days"
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground/80">Subtitle / Short Description</label>
              <textarea 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A brief catchy description of what students will learn..."
                rows={3}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none custom-scrollbar"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Course Type <span className="text-red-500">*</span></label>
              <div className="flex gap-4 flex-col sm:flex-row">
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl flex-1 border transition-all ${courseType === 'individual' ? 'border-orange-500 bg-orange-500/5' : 'border-foreground/10 bg-foreground/5 hover:border-orange-500/30'}`}>
                  <input type="radio" name="courseType" value="individual" checked={courseType === 'individual'} onChange={() => setCourseType('individual')} className="accent-orange-500 w-4 h-4" />
                  <span className="text-sm font-medium">Individual Teacher</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl flex-1 border transition-all ${courseType === 'coaching' ? 'border-orange-500 bg-orange-500/5' : 'border-foreground/10 bg-foreground/5 hover:border-orange-500/30'}`}>
                  <input type="radio" name="courseType" value="coaching" checked={courseType === 'coaching'} onChange={() => setCourseType('coaching')} className="accent-orange-500 w-4 h-4" />
                  <span className="text-sm font-medium">Coaching Center</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={courseType === 'individual' ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium mb-1 text-foreground/80">Education Level (Category) <span className="text-red-500">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setEduClass('');
                    setDepartment('');
                    setYear('');
                    setIsFullClassCourse(true);
                    setSubjects([]);
                  }}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none"
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
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Your School / Coaching Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={coachingName}
                    onChange={(e) => setCoachingName(e.target.value)}
                    placeholder="e.g. ABC Coaching Center"
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {(category === 'primary' || category === 'high_school') && (
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground/80">Class <span className="text-red-500">*</span></label>
                <select 
                  value={eduClass}
                  onChange={(e) => setEduClass(e.target.value)}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all appearance-none"
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

            {category === 'intermediate' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Class <span className="text-red-500">*</span></label>
                  <select value={eduClass} onChange={(e) => setEduClass(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all appearance-none" required>
                    <option value="" disabled className="bg-background text-foreground">Select Class</option>
                    <option value="11" className="bg-background text-foreground">Class 11</option>
                    <option value="12" className="bg-background text-foreground">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Group <span className="text-red-500">*</span></label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all appearance-none" required>
                    <option value="" disabled className="bg-background text-foreground">Select Group</option>
                    <option value="science" className="bg-background text-foreground">Science</option>
                    <option value="arts" className="bg-background text-foreground">Arts (Humanities)</option>
                    <option value="commerce" className="bg-background text-foreground">Commerce</option>
                  </select>
                </div>
              </div>
            )}

            {category === 'admission' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground/80">Target Segment / Unit <span className="text-red-500">*</span></label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all appearance-none" required>
                  <option value="" disabled className="bg-background text-foreground">Select Target Segment</option>
                  <option value="engineering" className="bg-background text-foreground">Engineering</option>
                  <option value="medical" className="bg-background text-foreground">Medical</option>
                  <option value="university" className="bg-background text-foreground">University (A/B/C/D Unit)</option>
                  <option value="iba" className="bg-background text-foreground">IBA / BUP</option>
                </select>
              </div>
            )}

            {(category === 'honours' || category === 'masters') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Department / Subject <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/80">Year / Semester <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 1st Year"
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            )}


            {category && category !== 'skills' && (
              <div className="bg-foreground/5 p-5 rounded-2xl border border-foreground/10 space-y-4">
                <label className="block text-sm font-medium text-foreground/80">Course Coverage <span className="text-red-500">*</span></label>
                <div className="flex gap-4 flex-col sm:flex-row">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl flex-1 border transition-all ${isFullClassCourse ? 'border-primary bg-primary/5' : 'border-foreground/10 bg-background hover:border-primary/30'}`}>
                    <input type="radio" checked={isFullClassCourse} onChange={() => setIsFullClassCourse(true)} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Full Course (All Subjects)</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl flex-1 border transition-all ${!isFullClassCourse ? 'border-primary bg-primary/5' : 'border-foreground/10 bg-background hover:border-primary/30'}`}>
                    <input type="radio" checked={!isFullClassCourse} onChange={() => setIsFullClassCourse(false)} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Specific Subjects</span>
                  </label>
                </div>

                {!isFullClassCourse && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-2 text-foreground/80">Add Subjects <span className="text-foreground/50 text-xs font-normal">(Type and press Enter)</span></label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {subjects.map(sub => (
                        <span key={sub} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                          {sub}
                          <button type="button" onClick={() => removeSubject(sub)} className="hover:text-red-500 transition-colors">✖</button>
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={handleAddSubject}
                      placeholder="e.g. Physics, Math..."
                      className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 p-6 bg-foreground/5 rounded-2xl border border-foreground/10">
              <h3 className="font-bold text-lg border-b border-foreground/10 pb-2 mb-4">Marketing Stats & Features</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Live Classes</label>
                  <input type="number" value={totalLiveClasses} onChange={e => setTotalLiveClasses(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Videos</label>
                  <input type="number" value={totalVideoLessons} onChange={e => setTotalVideoLessons(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Exams</label>
                  <input type="number" value={totalExams} onChange={e => setTotalExams(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Notes/PDFs</label>
                  <input type="number" value={totalPdfs} onChange={e => setTotalPdfs(e.target.value)} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="doubtSolving" 
                  checked={hasDoubtSolving} 
                  onChange={e => setHasDoubtSolving(e.target.checked)} 
                  className="w-5 h-5 accent-orange-500"
                />
                <label htmlFor="doubtSolving" className="text-sm font-medium cursor-pointer">
                  Includes 24/7 Doubt Solving Support / Group
                </label>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-foreground/5 rounded-2xl border border-foreground/10">
              <h3 className="font-bold text-lg border-b border-foreground/10 pb-2 mb-4">Pricing, Dates & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Regular Price (BDT) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Price (Optional)</label>
                  <input 
                    type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Valid Until</label>
                  <input 
                    type="date" value={discountValidUntil} onChange={e => setDiscountValidUntil(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class Start Date</label>
                  <input 
                    type="date" value={classStartDate} onChange={e => setClassStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Course Validity</label>
                  <input 
                    type="text" value={courseValidity} onChange={e => setCourseValidity(e.target.value)} placeholder="e.g. 6 Months, Till Admission Test"
                    className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number (For Inquiries)</label>
                <input 
                  type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)}
                  placeholder="e.g. 16910 or 017XXXXXXX"
                  className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Course Thumbnail <span className="text-red-500">*</span></label>
              
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
                    <p className="font-medium text-foreground/70">Click to upload thumbnail</p>
                    <p className="text-xs text-foreground/40 mt-1">1920x1080 (16:9) recommended. JPG, PNG or WEBP.</p>
                  </div>
                )}
                
                {/* Overlay on hover if image exists */}
                {thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2">
                      <ImagePlus className="w-5 h-5" /> Change Image
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-foreground/10 flex justify-end gap-3">
            <Link 
              href="/teacher-dashboard"
              className="px-6 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
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
