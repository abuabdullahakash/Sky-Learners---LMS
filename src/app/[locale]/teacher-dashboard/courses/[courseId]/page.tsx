"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Save, Plus, GripVertical, Trash2, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CourseBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [activeTab, setActiveTab] = useState<'basic' | 'curriculum' | 'publish'>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          // Ensure modules array exists
          if (!data.modules) data.modules = [];
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
        price: Number(course.price),
        category: course.category,
        eduClass: (course.category === 'primary' || course.category === 'high_school' || course.category === 'intermediate') ? course.eduClass : '',
        department: (course.category === 'intermediate' || course.category === 'honours' || course.category === 'masters') ? course.department : '',
        coachingName: course.coachingName || ''
      });
      setMessage('Basic info updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating course", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddModule = async () => {
    const newModule = {
      id: Date.now().toString(),
      title: 'New Module',
      lessons: []
    };
    const updatedModules = [...course.modules, newModule];
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  const handleAddLesson = async (moduleId: string) => {
    const updatedModules = course.modules.map((mod: any) => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: [...mod.lessons, { id: Date.now().toString(), title: 'New Lesson', videoUrl: '', isFreePreview: false }]
        };
      }
      return mod;
    });
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  const handleUpdateModule = async (moduleId: string, newTitle: string) => {
    const updatedModules = course.modules.map((mod: any) => 
      mod.id === moduleId ? { ...mod, title: newTitle } : mod
    );
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  const handleUpdateLesson = async (moduleId: string, lessonId: string, field: string, value: any) => {
    const updatedModules = course.modules.map((mod: any) => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.map((lesson: any) => 
            lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
          )
        };
      }
      return mod;
    });
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
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
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link href="/teacher-dashboard/courses" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            Course Builder
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${course.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </h1>
          <p className="text-foreground/70 mt-1">{course.title}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-foreground/10 mb-8 overflow-x-auto">
        {['basic', 'curriculum', 'publish'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'border-b-2 border-orange-500 text-orange-500' 
                : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <form onSubmit={handleSaveBasicInfo} className="bg-foreground/5 p-8 rounded-3xl border border-foreground/10 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
          {message && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl mb-4">{message}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input 
              type="text" value={course.title} onChange={e => setCourse({...course, title: e.target.value})}
              className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <textarea 
              value={course.subtitle} onChange={e => setCourse({...course, subtitle: e.target.value})} rows={3}
              className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Education Level (Category)</label>
              <select 
                value={course.category || ''} 
                onChange={e => setCourse({...course, category: e.target.value, eduClass: '', department: ''})}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none"
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
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                placeholder="e.g. ABC Coaching Center"
              />
            </div>
          </div>

          {(course.category === 'primary' || course.category === 'high_school') && (
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select 
                value={course.eduClass || ''} onChange={e => setCourse({...course, eduClass: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select value={course.eduClass || ''} onChange={e => setCourse({...course, eduClass: e.target.value})} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none">
                  <option value="" disabled>Select Class</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <select value={course.department || ''} onChange={e => setCourse({...course, department: e.target.value})} className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none">
                  <option value="" disabled>Select Group</option>
                  <option value="science">Science</option>
                  <option value="arts">Arts (Humanities)</option>
                  <option value="commerce">Commerce</option>
                </select>
              </div>
            </div>
          )}

          {(course.category === 'honours' || course.category === 'masters') && (
            <div>
              <label className="block text-sm font-medium mb-1">Department / Subject</label>
              <input 
                type="text" value={course.department || ''} onChange={e => setCourse({...course, department: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
                placeholder="e.g. Physics"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (BDT)</label>
              <input 
                type="number" value={course.price || ''} onChange={e => setCourse({...course, price: e.target.value})}
                className="w-full px-4 py-3 bg-background border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
              <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && (
        <div className="bg-foreground/5 p-8 rounded-3xl border border-foreground/10 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Curriculum Builder</h2>
            <button onClick={handleAddModule} className="px-4 py-2 bg-foreground/10 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Module
            </button>
          </div>

          <div className="space-y-6">
            {course.modules?.map((module: any, mIndex: number) => (
              <div key={module.id} className="bg-background rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
                <div className="bg-foreground/5 p-4 flex items-center gap-4 border-b border-foreground/10">
                  <GripVertical className="text-foreground/30 cursor-move" />
                  <span className="font-bold text-orange-500">Module {mIndex + 1}:</span>
                  <input 
                    type="text" value={module.title}
                    onChange={(e) => handleUpdateModule(module.id, e.target.value)}
                    className="flex-1 bg-transparent font-bold focus:outline-none border-b border-transparent focus:border-orange-500/50"
                  />
                  <button onClick={() => handleAddLesson(module.id)} className="text-sm px-3 py-1.5 bg-background border border-foreground/10 rounded-lg hover:border-orange-500 hover:text-orange-500 font-medium transition-colors">
                    + Add Lesson
                  </button>
                </div>
                
                <div className="p-4 space-y-3">
                  {module.lessons?.length === 0 ? (
                    <div className="text-center p-4 text-foreground/40 text-sm">No lessons added yet.</div>
                  ) : (
                    module.lessons?.map((lesson: any, lIndex: number) => (
                      <div key={lesson.id} className="flex flex-col gap-3 p-4 bg-foreground/5 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <VideoIcon className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold text-sm">Lesson {lIndex + 1}:</span>
                          <input 
                            type="text" value={lesson.title}
                            onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'title', e.target.value)}
                            className="flex-1 bg-background px-3 py-1.5 rounded-lg border border-foreground/10 text-sm focus:outline-none focus:border-orange-500"
                            placeholder="Lesson Title"
                          />
                        </div>
                        <div className="flex items-center gap-3 pl-7">
                          <input 
                            type="text" value={lesson.videoUrl}
                            onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'videoUrl', e.target.value)}
                            className="flex-1 bg-background px-3 py-1.5 rounded-lg border border-foreground/10 text-sm focus:outline-none focus:border-orange-500"
                            placeholder="YouTube or Vimeo URL"
                          />
                          <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                            <input 
                              type="checkbox" checked={lesson.isFreePreview}
                              onChange={(e) => handleUpdateLesson(module.id, lesson.id, 'isFreePreview', e.target.checked)}
                              className="w-4 h-4 accent-orange-500"
                            />
                            Free Preview
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            
            {course.modules?.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-2xl">
                <p className="text-foreground/50 font-medium">Your curriculum is empty. Start by adding a module.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Tab */}
      {activeTab === 'publish' && (
        <div className="bg-foreground/5 p-8 rounded-3xl border border-foreground/10 space-y-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Publish Your Course</h2>
          <p className="text-foreground/60 max-w-lg mx-auto mb-8">
            Make sure you have completed the basic information and added all your modules and lessons before publishing. Once published, students will be able to enroll in this course.
          </p>
          
          <div className="p-8 bg-background rounded-2xl border border-foreground/10 inline-block">
            <h3 className="text-xl font-bold mb-2">Current Status: <span className={course.isPublished ? 'text-green-500' : 'text-orange-500'}>{course.isPublished ? 'Published' : 'Draft'}</span></h3>
            <button 
              onClick={handleTogglePublish}
              disabled={isSaving}
              className={`mt-4 px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 ${
                course.isPublished 
                  ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30' 
                  : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30'
              }`}
            >
              {isSaving ? 'Processing...' : (course.isPublished ? 'Unpublish Course' : 'Publish Course Now')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
