"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export default function CourseSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

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
          setCourse(docSnap.data());
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
        year: (course.category === 'honours' || course.category === 'masters') ? course.year : '',
        coachingName: course.coachingName || ''
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
          <div>
            <label className="block text-sm font-medium mb-1">Course Title</label>
            <input 
              type="text" value={course.title || ''} onChange={e => setCourse({...course, title: e.target.value})}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (BDT)</label>
              <input 
                type="number" value={course.price || ''} onChange={e => setCourse({...course, price: e.target.value})}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
              />
            </div>
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
