"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save, ImagePlus, Trash2, X, Loader2, Plus } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { IconPicker } from '@/components/ui/IconPicker';

export default function CourseSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingSlider, setIsUploadingSlider] = useState(false);

  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingCover(true);
      try {
        const url = await uploadImageToImgBB(e.target.files[0]);
        setCourse((prev: any) => ({ ...prev, coverImageUrl: url }));
      } catch (err) {
        console.error(err);
        alert('Failed to upload cover image.');
      }
      setIsUploadingCover(false);
    }
  };

  const handleUploadSlider = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingSlider(true);
      try {
        const url = await uploadImageToImgBB(e.target.files[0]);
        setCourse((prev: any) => ({ ...prev, sliderImages: [...(prev.sliderImages || []), url] }));
      } catch (err) {
        console.error(err);
        alert('Failed to upload slider image.');
      }
      setIsUploadingSlider(false);
    }
  };

  const removeSliderImage = (index: number) => {
    const updated = [...(course.sliderImages || [])];
    updated.splice(index, 1);
    setCourse({ ...course, sliderImages: updated });
  };

  const handleUploadGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingGallery(true);
      try {
        const url = await uploadImageToImgBB(e.target.files[0]);
        setCourse((prev: any) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), url] }));
      } catch (err) {
        console.error(err);
        alert('Failed to upload gallery image.');
      }
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const updated = [...(course.galleryImages || [])];
    updated.splice(index, 1);
    setCourse({ ...course, galleryImages: updated });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          if (data.learningOutcomes) {
            data.learningOutcomes = data.learningOutcomes.map((item: any) => {
              if (typeof item === 'string') return { text: item, icon: 'CheckCircle2' };
              return item;
            });
          }
          setCourse(data);
        } else {
          router.push('/teacher-dashboard/courses');
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [user, courseId, router]);

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setIsSaving(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        title: course.title,
        subtitle: course.subtitle,
        detailedDescription: course.detailedDescription || '',
        coverImageUrl: course.coverImageUrl || '',
        sliderImages: course.sliderImages || [],
        galleryImages: course.galleryImages || [],
        introVideoUrl: course.introVideoUrl || '',
        price: Number(course.price),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
        discountValidUntil: course.discountValidUntil || '',
        classStartDate: course.classStartDate || '',
        courseValidity: course.courseValidity || '',
        totalLiveClasses: course.totalLiveClasses ? Number(course.totalLiveClasses) : 0,
        totalVideoLessons: course.totalVideoLessons ? Number(course.totalVideoLessons) : 0,
        totalExams: course.totalExams ? Number(course.totalExams) : 0,
        totalPdfs: course.totalPdfs ? Number(course.totalPdfs) : 0,
        hasDoubtSolving: course.hasDoubtSolving || false,
        category: course.category,
        eduClass: (course.category === 'primary' || course.category === 'high_school' || course.category === 'intermediate') ? course.eduClass : '',
        department: (course.category === 'intermediate' || course.category === 'honours' || course.category === 'masters') ? course.department : '',
        year: (course.category === 'honours' || course.category === 'masters') ? course.year : '',
        coachingName: course.coachingName || '',
        contactNumber: course.contactNumber || '',
        faqs: course.faqs || [],
        learningOutcomes: course.learningOutcomes || [],
        targetAudience: course.targetAudience || '',
        testimonials: course.testimonials || [],
        parentMessage: (course.category === 'primary' || course.category === 'high_school') ? (course.parentMessage || '') : '',
        successMessage: course.category === 'intermediate' ? (course.successMessage || '') : '',
        careerMessage: (course.category === 'honours' || course.category === 'masters' || course.category === 'skills') ? (course.careerMessage || '') : '',
        studyRoutineUrl: course.studyRoutineUrl || '',
      });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating course", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    const newStatus = !course.isPublished;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'courses', courseId), { isPublished: newStatus });
      setCourse({ ...course, isPublished: newStatus });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!course) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Course Settings</h1>
        <p className="text-foreground/70">Manage basic information and visibility of your course.</p>
      </div>

      <form onSubmit={handleSaveBasicInfo} className="bg-background p-6 md:p-8 rounded-3xl border border-foreground/10 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Basic Information</h2>
        {message && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl mb-4 font-medium">{message}</div>}
        
        <div className="space-y-4">
          {/* Cover & Slider Images */}
          <div className="space-y-6 p-6 bg-foreground/5 rounded-2xl border border-foreground/10">
            <div>
              <label className="block text-sm font-medium mb-2">Background Cover Image (Optional)</label>
              <div className="flex items-center gap-4">
                {course.coverImageUrl && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-foreground/20">
                    <img src={course.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCourse({...course, coverImageUrl: ''})} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-32 h-20 bg-background border-2 border-dashed border-foreground/20 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-colors">
                  {isUploadingCover ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : <ImagePlus className="w-6 h-6 text-foreground/40" />}
                  <span className="text-xs text-foreground/50 mt-1">Upload</span>
                  <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" disabled={isUploadingCover} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Section Slider Images (Optional)</label>
              <p className="text-xs text-foreground/50 mb-3">Upload multiple images to show a beautiful auto-sliding gallery in the course details page.</p>
              <div className="flex flex-wrap items-center gap-4">
                {course.sliderImages && course.sliderImages.map((url: string, index: number) => (
                  <div key={index} className="relative w-32 h-20 rounded-lg overflow-hidden border border-foreground/20 group">
                    <img src={url} alt={`Slider ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeSliderImage(index)} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-32 h-20 bg-background border-2 border-dashed border-foreground/20 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-colors">
                  {isUploadingSlider ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : <ImagePlus className="w-6 h-6 text-foreground/40" />}
                  <span className="text-xs text-foreground/50 mt-1">Add Image</span>
                  <input type="file" accept="image/*" onChange={handleUploadSlider} className="hidden" disabled={isUploadingSlider} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course Gallery Images (Optional)</label>
              <p className="text-xs text-foreground/50 mb-3">Upload multiple images to show a beautiful gallery section in the course details page.</p>
              <div className="flex flex-wrap items-center gap-4">
                {course.galleryImages && course.galleryImages.map((url: string, index: number) => (
                  <div key={index} className="relative w-32 h-20 rounded-lg overflow-hidden border border-foreground/20 group">
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-32 h-20 bg-background border-2 border-dashed border-foreground/20 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-colors">
                  {isUploadingGallery ? <Loader2 className="w-6 h-6 animate-spin text-orange-500" /> : <ImagePlus className="w-6 h-6 text-foreground/40" />}
                  <span className="text-xs text-foreground/50 mt-1">Add Image</span>
                  <input type="file" accept="image/*" onChange={handleUploadGallery} className="hidden" disabled={isUploadingGallery} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input 
              type="text" value={course.title || ''} onChange={e => setCourse({...course, title: e.target.value})}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number (For Inquiries)</label>
            <input 
              type="text" value={course.contactNumber || ''} onChange={e => setCourse({...course, contactNumber: e.target.value})}
              placeholder="e.g. 16910 or 017XXXXXXX"
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Intro Video URL (YouTube/Facebook)</label>
            <input 
              type="text" value={course.introVideoUrl || ''} onChange={e => setCourse({...course, introVideoUrl: e.target.value})}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <textarea 
              value={course.subtitle || ''} onChange={e => setCourse({...course, subtitle: e.target.value})} rows={3}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors custom-scrollbar"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Detailed Description (HTML/Text)</label>
            <textarea 
              value={course.detailedDescription || ''} onChange={e => setCourse({...course, detailedDescription: e.target.value})} rows={6}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors custom-scrollbar"
              placeholder="Provide a detailed description of what this course offers..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Study Routine / Syllabus Link (Optional PDF or Drive Link)</label>
            <input 
              type="text" value={course.studyRoutineUrl || ''} onChange={e => setCourse({...course, studyRoutineUrl: e.target.value})}
              placeholder="https://drive.google.com/..."
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Education Level (Category)</label>
              <select 
                value={course.category || ''} 
                onChange={e => setCourse({...course, category: e.target.value, eduClass: '', department: '', year: ''})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none"
              >
                <option value="" disabled>Select Level</option>
                <option value="primary">Primary School</option>
                <option value="high_school">High School</option>
                <option value="intermediate">Intermediate / HSC</option>
                <option value="honours">Honours / Undergrad</option>
                <option value="masters">Masters / Postgrad</option>
                <option value="skills">Skills / Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your School / Coaching Name</label>
              <input 
                type="text" value={course.coachingName || ''} onChange={e => setCourse({...course, coachingName: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                placeholder="e.g. ABC Coaching Center"
              />
            </div>
          </div>

          {(course.category === 'primary' || course.category === 'high_school') && (
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select 
                value={course.eduClass || ''} onChange={e => setCourse({...course, eduClass: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none"
              >
                <option value="" disabled>Select Class</option>
                {course.category === 'primary' 
                  ? Array.from({length: 5}, (_, i) => <option key={i+1} value={i+1}>Class {i+1}</option>)
                  : Array.from({length: 5}, (_, i) => <option key={i+6} value={i+6}>Class {i+6}</option>)
                }
              </select>
            </div>
          )}

          {course.category === 'intermediate' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select value={course.eduClass || ''} onChange={e => setCourse({...course, eduClass: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none">
                  <option value="" disabled>Select Class</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <select value={course.department || ''} onChange={e => setCourse({...course, department: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none">
                  <option value="" disabled>Select Group</option>
                  <option value="science">Science</option>
                  <option value="arts">Arts (Humanities)</option>
                  <option value="commerce">Commerce</option>
                </select>
              </div>
            </div>
          )}

          {(course.category === 'honours' || course.category === 'masters') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department / Subject</label>
                <input 
                  type="text" value={course.department || ''} onChange={e => setCourse({...course, department: e.target.value})}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  placeholder="e.g. Physics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year / Semester</label>
                <input 
                  type="text" value={course.year || ''} onChange={e => setCourse({...course, year: e.target.value})}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                  placeholder="e.g. 1st Year"
                />
              </div>
            </div>
          )}

          {/* Category-Specific Dynamic Fields */}
          {(course.category === 'primary' || course.category === 'high_school') && (
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <label className="block text-sm font-medium mb-1 text-blue-600">অভিভাবকদের উদ্দেশ্যে বার্তা (Message for Parents)</label>
              <textarea 
                value={course.parentMessage || ''} onChange={e => setCourse({...course, parentMessage: e.target.value})} rows={3}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-blue-500 transition-colors custom-scrollbar"
                placeholder="উদাহরণ: আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য একটি শক্ত ভিত্তি তৈরি করা অত্যন্ত জরুরি..."
              />
            </div>
          )}

          {course.category === 'intermediate' && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <label className="block text-sm font-medium mb-1 text-red-600">চান্স পাওয়ার নিশ্চয়তা / স্পেশাল ফোকাস (Success Message)</label>
              <textarea 
                value={course.successMessage || ''} onChange={e => setCourse({...course, successMessage: e.target.value})} rows={3}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-red-500 transition-colors custom-scrollbar"
                placeholder="উদাহরণ: ঢাকা বিশ্ববিদ্যালয়ে চান্স পাওয়ার ১০০% প্রস্তুতি এবং স্পেশাল গাইডলাইন..."
              />
            </div>
          )}

          {(course.category === 'honours' || course.category === 'masters' || course.category === 'skills') && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <label className="block text-sm font-medium mb-1 text-emerald-600">ক্যারিয়ার গাইডেন্স / পোর্টফোলিও (Career Message)</label>
              <textarea 
                value={course.careerMessage || ''} onChange={e => setCourse({...course, careerMessage: e.target.value})} rows={3}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-emerald-500 transition-colors custom-scrollbar"
                placeholder="উদাহরণ: কোর্স শেষে আপনার প্রফেশনাল পোর্টফোলিও তৈরি করা হবে যা চাকরিতে সাহায্য করবে..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Regular Price (BDT)</label>
              <input 
                type="number" value={course.price || ''} onChange={e => setCourse({...course, price: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Price (Optional)</label>
              <input 
                type="number" value={course.discountPrice || ''} onChange={e => setCourse({...course, discountPrice: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Valid Until</label>
              <input 
                type="date" value={course.discountValidUntil || ''} onChange={e => setCourse({...course, discountValidUntil: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class Start Date</label>
              <input 
                type="date" value={course.classStartDate || ''} onChange={e => setCourse({...course, classStartDate: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course Validity</label>
              <input 
                type="text" value={course.courseValidity || ''} onChange={e => setCourse({...course, courseValidity: e.target.value})} placeholder="e.g. 6 Months, Till Admission Test"
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <hr className="border-foreground/10 my-6" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Frequently Asked Questions (FAQs)</h2>
            <button 
              type="button" 
              onClick={() => setCourse({ ...course, faqs: [...(course.faqs || []), { question: '', answer: '' }] })}
              className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>
          
          <div className="space-y-4">
            {(!course.faqs || course.faqs.length === 0) ? (
              <div className="text-center p-6 border border-dashed border-foreground/20 rounded-xl text-foreground/50">
                No FAQs added yet.
              </div>
            ) : (
              course.faqs.map((faq: any, index: number) => (
                <div key={index} className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl space-y-3 relative group">
                  <button 
                    type="button" 
                    onClick={() => {
                      const newFaqs = [...course.faqs];
                      newFaqs.splice(index, 1);
                      setCourse({ ...course, faqs: newFaqs });
                    }}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-12">
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Question</label>
                    <input 
                      type="text" 
                      value={faq.question} 
                      onChange={e => {
                        const newFaqs = [...course.faqs];
                        newFaqs[index].question = e.target.value;
                        setCourse({ ...course, faqs: newFaqs });
                      }}
                      placeholder="e.g. What is this course about?"
                      className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Answer</label>
                    <textarea 
                      value={faq.answer} 
                      onChange={e => {
                        const newFaqs = [...course.faqs];
                        newFaqs[index].answer = e.target.value;
                        setCourse({ ...course, faqs: newFaqs });
                      }}
                      placeholder="Answer goes here..."
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors custom-scrollbar"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-foreground/10 my-6" />

          {/* Learning Outcomes */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Learning Outcomes (কী কী শিখবেন)</h2>
            <button 
              type="button" 
              onClick={() => setCourse({ ...course, learningOutcomes: [...(course.learningOutcomes || []), { text: '', icon: 'CheckCircle2' }] })}
              className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Outcome
            </button>
          </div>
          <div className="space-y-3">
            {(!course.learningOutcomes || course.learningOutcomes.length === 0) ? (
              <div className="text-center p-6 border border-dashed border-foreground/20 rounded-xl text-foreground/50">
                No learning outcomes added yet.
              </div>
            ) : (
              course.learningOutcomes.map((outcome: any, index: number) => (
                <div key={index} className="flex items-center gap-3 relative z-10">
                  <IconPicker 
                    selectedIcon={outcome.icon || 'CheckCircle2'}
                    onSelect={(iconName) => {
                      const newOutcomes = [...course.learningOutcomes];
                      newOutcomes[index] = { ...newOutcomes[index], icon: iconName };
                      setCourse({ ...course, learningOutcomes: newOutcomes });
                    }}
                  />
                  <input 
                    type="text" 
                    value={outcome.text || ''} 
                    onChange={e => {
                      const newOutcomes = [...course.learningOutcomes];
                      newOutcomes[index] = { ...newOutcomes[index], text: e.target.value };
                      setCourse({ ...course, learningOutcomes: newOutcomes });
                    }}
                    placeholder={`e.g. ${course.category === 'intermediate' ? 'ঢাকা বিশ্ববিদ্যালয়ে চান্স পাওয়ার ১০০% প্রস্তুতি' : 'বাস্তব জীবনের প্রজেক্ট তৈরি করা'}`}
                    className="w-full px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newOutcomes = [...course.learningOutcomes];
                      newOutcomes.splice(index, 1);
                      setCourse({ ...course, learningOutcomes: newOutcomes });
                    }}
                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Target Audience (কাদের জন্য)</label>
            <textarea 
              value={course.targetAudience || ''} onChange={e => setCourse({...course, targetAudience: e.target.value})} rows={2}
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors custom-scrollbar"
              placeholder={`e.g. ${course.category === 'primary' ? '৩য় থেকে ৫ম শ্রেণীর বাচ্চাদের জন্য' : 'যারা ওয়েব ডেভেলপমেন্ট শিখতে চায়'}`}
            />
          </div>

          <hr className="border-foreground/10 my-6" />

          {/* Testimonials */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Student Testimonials (শিক্ষার্থীদের মতামত)</h2>
            <button 
              type="button" 
              onClick={() => setCourse({ ...course, testimonials: [...(course.testimonials || []), { name: '', role: '', text: '', rating: 5 }] })}
              className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Testimonial
            </button>
          </div>
          <div className="space-y-4">
            {(!course.testimonials || course.testimonials.length === 0) ? (
              <div className="text-center p-6 border border-dashed border-foreground/20 rounded-xl text-foreground/50">
                No testimonials added yet.
              </div>
            ) : (
              course.testimonials.map((testi: any, index: number) => (
                <div key={index} className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl space-y-3 relative group">
                  <button 
                    type="button" 
                    onClick={() => {
                      const newTesti = [...course.testimonials];
                      newTesti.splice(index, 1);
                      setCourse({ ...course, testimonials: newTesti });
                    }}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-12">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Student Name</label>
                      <input 
                        type="text" value={testi.name} 
                        onChange={e => { const arr = [...course.testimonials]; arr[index].name = e.target.value; setCourse({ ...course, testimonials: arr }); }}
                        className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Role / University</label>
                      <input 
                        type="text" value={testi.role} placeholder="e.g. DU Student"
                        onChange={e => { const arr = [...course.testimonials]; arr[index].role = e.target.value; setCourse({ ...course, testimonials: arr }); }}
                        className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Rating (1-5)</label>
                      <input 
                        type="number" min="1" max="5" value={testi.rating} 
                        onChange={e => { const arr = [...course.testimonials]; arr[index].rating = Number(e.target.value); setCourse({ ...course, testimonials: arr }); }}
                        className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-foreground/60">Review Text</label>
                    <textarea 
                      value={testi.text} rows={2}
                      onChange={e => { const arr = [...course.testimonials]; arr[index].text = e.target.value; setCourse({ ...course, testimonials: arr }); }}
                      className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-orange-500 transition-colors custom-scrollbar"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-foreground/10 my-6" />
          <h2 className="text-xl font-bold mb-4">Marketing Stats & Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Live Classes</label>
              <input type="number" value={course.totalLiveClasses || ''} onChange={e => setCourse({...course, totalLiveClasses: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Videos</label>
              <input type="number" value={course.totalVideoLessons || ''} onChange={e => setCourse({...course, totalVideoLessons: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Exams</label>
              <input type="number" value={course.totalExams || ''} onChange={e => setCourse({...course, totalExams: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Notes/PDFs</label>
              <input type="number" value={course.totalPdfs || ''} onChange={e => setCourse({...course, totalPdfs: e.target.value})} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <input 
              type="checkbox" 
              id="doubtSolving" 
              checked={course.hasDoubtSolving || false} 
              onChange={e => setCourse({...course, hasDoubtSolving: e.target.checked})} 
              className="w-5 h-5 accent-orange-500"
            />
            <label htmlFor="doubtSolving" className="text-sm font-medium cursor-pointer">
              Includes 24/7 Doubt Solving Support / Group
            </label>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-foreground/10 mt-6">
          <button type="submit" disabled={isSaving} className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
            <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div className="bg-background p-6 md:p-8 rounded-3xl border border-foreground/10 space-y-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Publish Course</h2>
          <p className="text-foreground/70 text-sm max-w-lg">
            Once published, your course will be visible to students in the marketplace. You can unpublish it anytime.
          </p>
          <div className="mt-2">
            <span className="font-semibold text-sm">Status: </span>
            <span className={course.isPublished ? 'text-green-500 font-bold' : 'text-orange-500 font-bold'}>{course.isPublished ? 'Published' : 'Draft'}</span>
          </div>
        </div>
        <button 
          onClick={handleTogglePublish}
          disabled={isSaving}
          className={`px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 whitespace-nowrap ${
            course.isPublished 
              ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30' 
              : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30'
          }`}
        >
          {isSaving ? 'Processing...' : (course.isPublished ? 'Unpublish Course' : 'Publish Course Now')}
        </button>
      </div>
    </div>
  );
}
