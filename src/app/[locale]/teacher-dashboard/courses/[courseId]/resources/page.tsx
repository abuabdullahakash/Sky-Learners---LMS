"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Link as LinkIcon, Save, FileText, Info } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

type Resource = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
};

export default function CourseResourcesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);

  // New Resource Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('PDF');
  const [newUrl, setNewUrl] = useState('');
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
          setResources(data.resources || []);
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

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      setError('Title and Drive Link are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    const newResource: Resource = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      fileUrl: newUrl
    };

    const updatedResources = [...resources, newResource];
    
    try {
      await updateDoc(doc(db, 'courses', courseId), { resources: updatedResources });
      setResources(updatedResources);
      setIsAdding(false);
      setNewTitle('');
      setNewType('PDF');
      setNewUrl('');
    } catch (err) {
      console.error(err);
      setError('Failed to add resource.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource link?')) return;
    
    const updatedResources = resources.filter(r => r.id !== id);
    try {
      await updateDoc(doc(db, 'courses', courseId), { resources: updatedResources });
      setResources(updatedResources);
    } catch (err) {
      console.error(err);
      alert('Failed to delete resource.');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Notes & Resources</h1>
          <p className="text-foreground/70">Share PDFs, slides, and class materials via Google Drive links.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add Resource
          </button>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex gap-4 items-start shadow-sm">
        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-500 mb-1">How to share resources?</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            1. Open your <strong>Google Drive</strong> and create a folder for this course.<br/>
            2. Upload your PDF notes, slides, or documents into that folder.<br/>
            3. Right-click the file, click <strong>Share</strong>, and set the access to <strong>"Anyone with the link"</strong>.<br/>
            4. Click "Add Resource" above, write the file name, and paste that Google Drive link!
          </p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddResource} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Add New Resource Link</h2>
            <button type="button" onClick={() => setIsAdding(false)} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Resource Title <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Physics Chapter 1 Note" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 appearance-none">
                <option value="PDF">PDF Document</option>
                <option value="Slide">Presentation / Slide</option>
                <option value="Image">Image</option>
                <option value="Other Link">Other Link</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium mb-1">Google Drive Shareable Link <span className="text-red-500">*</span></label>
              <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 mt-6">
        {resources.length === 0 && !isAdding ? (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <FileText className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No resources added yet.</p>
          </div>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="bg-background border border-foreground/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors shadow-sm">
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">{res.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                    <span className="bg-foreground/10 px-2 py-0.5 rounded-md text-xs font-bold text-foreground">{res.type}</span>
                    <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-orange-500 truncate">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" /> Open Link
                    </a>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(res.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
