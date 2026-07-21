"use client";

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { ImagePlus, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function CreateCoursePage() {
  const router = useRouter();
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
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !category || price === '' || price === undefined || price === null || !thumbnail) {
      setError('Please fill in all required fields and upload a thumbnail.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Upload Thumbnail to ImgBB
      const thumbnailUrl = await uploadImageToImgBB(thumbnail);

      // 2. Save Course to Firestore
      const courseData = {
        title,
        subtitle,
        teacherId: user.uid,
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
        isPublished: false, // Draft by default
        modules: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'courses'), courseData);
      
      // 3. Redirect to the course builder page
      router.push(`/teacher-dashboard/courses/${docRef.id}`);
      
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <Link href="/teacher-dashboard" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold mb-2">Create a New Course</h1>
        <p className="text-foreground/70">Start by giving your course a name and basic details. You can add videos and curriculum later.</p>
      </div>

      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-3xl p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1 text-foreground/80">Course Type <span className="text-red-500">*</span></label>
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground/80">Subtitle / Short Description</label>
              <textarea 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A brief catchy description of what students will learn..."
                rows={2}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none custom-scrollbar"
              ></textarea>
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
                    setSpecificSubjects([]);
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
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-foreground/80">Course Subjects & Class Distribution <span className="text-red-500">*</span></label>
                  <button type="button" onClick={handleAddSubject} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors">
                    + Add Subject
                  </button>
                </div>

                <div className="space-y-3">
                  {specificSubjects.map((sub, idx) => (
                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 p-3 bg-background rounded-xl border border-foreground/10 relative pr-10">
                      <button type="button" onClick={() => removeSubject(idx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-red-500 transition-colors">✖</button>
                      
                      <div className="w-full md:w-1/3">
                        <input type="text" value={sub.name} onChange={e => updateSubject(idx, 'name', e.target.value)} placeholder="Subject Name (e.g. Physics)" className="w-full px-3 py-2 bg-foreground/5 border border-transparent rounded-lg focus:outline-none focus:border-primary/50 text-sm" required />
                      </div>
                      
                      {courseType === 'coaching' && (
                        <div className="w-full md:w-1/4">
                          <input type="text" value={sub.instructor || ''} onChange={e => updateSubject(idx, 'instructor', e.target.value)} placeholder="Instructor Name" className="w-full px-3 py-2 bg-foreground/5 border border-transparent rounded-lg focus:outline-none focus:border-primary/50 text-sm" />
                        </div>
                      )}
                      
                      <div className="w-full md:w-24">
                        <input type="number" value={sub.liveClasses || ''} onChange={e => updateSubject(idx, 'liveClasses', e.target.value)} placeholder="Live" className="w-full px-3 py-2 bg-foreground/5 border border-transparent rounded-lg focus:outline-none focus:border-primary/50 text-sm" />
                      </div>
                      <div className="w-full md:w-24">
                        <input type="number" value={sub.videoLessons || ''} onChange={e => updateSubject(idx, 'videoLessons', e.target.value)} placeholder="Videos" className="w-full px-3 py-2 bg-foreground/5 border border-transparent rounded-lg focus:outline-none focus:border-primary/50 text-sm" />
                      </div>
                      <div className="w-full md:w-24">
                        <input type="number" value={sub.exams || ''} onChange={e => updateSubject(idx, 'exams', e.target.value)} placeholder="Exams" className="w-full px-3 py-2 bg-foreground/5 border border-transparent rounded-lg focus:outline-none focus:border-primary/50 text-sm" />
                      </div>
                    </div>
                  ))}
                  {specificSubjects.length === 0 && (
                    <div className="text-center py-4 text-sm text-foreground/40">No subjects added. Click "+ Add Subject" to start.</div>
                  )}
                </div>
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
                  required
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
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
              ) : (
                'Create Course & Continue'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
