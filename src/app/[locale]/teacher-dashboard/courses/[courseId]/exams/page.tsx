"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Link as LinkIcon, Save, CheckSquare, Clock, Trophy } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

type Exam = {
  id: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
  link: string;
};

export default function CourseExamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);

  // New Exam Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTotalMarks, setNewTotalMarks] = useState<number | ''>('');
  const [newDuration, setNewDuration] = useState<number | ''>('');
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
          setExams(data.exams || []);
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

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTotalMarks || !newDuration || !newLink) {
      setError('All fields are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    const newExam: Exam = {
      id: Date.now().toString(),
      title: newTitle,
      totalMarks: Number(newTotalMarks),
      durationMinutes: Number(newDuration),
      link: newLink
    };

    const updatedExams = [...exams, newExam];
    
    try {
      await updateDoc(doc(db, 'courses', courseId), { exams: updatedExams });
      setExams(updatedExams);
      setIsAdding(false);
      setNewTitle('');
      setNewTotalMarks('');
      setNewDuration('');
      setNewLink('');
    } catch (err) {
      console.error(err);
      setError('Failed to add exam.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam link?')) return;
    
    const updatedExams = exams.filter(e => e.id !== id);
    try {
      await updateDoc(doc(db, 'courses', courseId), { exams: updatedExams });
      setExams(updatedExams);
    } catch (err) {
      console.error(err);
      alert('Failed to delete exam.');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Exams & Quizzes</h1>
          <p className="text-foreground/70">Add Google Form or Quizizz links for your students to take exams.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add Exam
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddExam} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Add New Exam Link</h2>
            <button type="button" onClick={() => setIsAdding(false)} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Exam Title <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Final Exam" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={newTotalMarks} onChange={e => setNewTotalMarks(Number(e.target.value) || '')} placeholder="e.g. 50" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Minutes) <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={newDuration} onChange={e => setNewDuration(Number(e.target.value) || '')} placeholder="e.g. 45" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Exam Link (Google Form, etc.) <span className="text-red-500">*</span></label>
              <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://forms.gle/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {exams.length === 0 && !isAdding ? (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <CheckSquare className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No exams added yet.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="bg-background border border-foreground/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors shadow-sm">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{exam.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-foreground/70 font-medium">
                  <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-orange-500" /> {exam.totalMarks} Marks</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {exam.durationMinutes} Minutes</span>
                  <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-orange-500" /> <a href={exam.link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 underline underline-offset-2">Exam Link</a></span>
                </div>
              </div>
              <button onClick={() => handleDelete(exam.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
