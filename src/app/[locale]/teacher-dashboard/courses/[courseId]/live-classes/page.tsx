"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video, Plus, Trash2, Calendar, Clock, Link as LinkIcon, Save } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

type LiveClass = {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
};

export default function CourseLiveClassesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);

  // New Class Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLink, setNewLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          setCourse(data);
          setLiveClasses(data.liveClasses || []);
        } else {
          router.push('/teacher-dashboard/courses');
        }
      } catch (err) {
        console.error("Error fetching course", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [user, courseId, router]);

  const handleAddLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime || !newLink) {
      setError('All fields are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    const newClass: LiveClass = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      time: newTime,
      meetLink: newLink
    };

    const updatedClasses = [...liveClasses, newClass];
    
    // Sort by date/time theoretically, but keeping it simple for now (latest added at bottom)
    
    try {
      await updateDoc(doc(db, 'courses', courseId), { liveClasses: updatedClasses });
      setLiveClasses(updatedClasses);
      setIsAdding(false);
      setNewTitle('');
      setNewDate('');
      setNewTime('');
      setNewLink('');
    } catch (err) {
      console.error(err);
      setError('Failed to add live class.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;
    
    const updatedClasses = liveClasses.filter(c => c.id !== id);
    try {
      await updateDoc(doc(db, 'courses', courseId), { liveClasses: updatedClasses });
      setLiveClasses(updatedClasses);
    } catch (err) {
      console.error(err);
      alert('Failed to delete live class.');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Live Classes</h1>
          <p className="text-foreground/70">Schedule and manage live sessions via Google Meet or Zoom.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Schedule Class
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddLiveClass} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Schedule New Live Class</h2>
            <button type="button" onClick={() => setIsAdding(false)} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Topic / Title <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Problem Solving" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time <span className="text-red-500">*</span></label>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Meeting Link (Zoom / Meet) <span className="text-red-500">*</span></label>
              <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Class'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {liveClasses.length === 0 && !isAdding ? (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <Video className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No live classes scheduled yet.</p>
          </div>
        ) : (
          liveClasses.map((cls) => (
            <div key={cls.id} className="bg-background border border-foreground/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors shadow-sm">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{cls.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-foreground/70 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-500" /> {cls.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {cls.time}</span>
                  <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-orange-500" /> <a href={cls.meetLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 underline underline-offset-2">Join Link</a></span>
                </div>
              </div>
              <button onClick={() => handleDelete(cls.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
