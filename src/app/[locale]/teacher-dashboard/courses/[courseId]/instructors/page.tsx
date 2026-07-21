"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Save, Users, ImagePlus, User, Edit2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { uploadImageToImgBB } from '@/lib/imgbb';

type Instructor = {
  id: string;
  name: string;
  background: string;
  role: string;
  photoUrl: string;
  coverUrl?: string;
  bio?: string;
  responsibility?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  profileUrl?: string;
};

export default function CourseInstructorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // New Instructor Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newBackground, setNewBackground] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newFacebookUrl, setNewFacebookUrl] = useState('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newLinkedinUrl, setNewLinkedinUrl] = useState('');
  const [newProfileUrl, setNewProfileUrl] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [newCover, setNewCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
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
          setInstructors(data.instructors || []);
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingInstructorId(null);
    setNewName('');
    setNewBackground('');
    setNewRole('');
    setNewBio('');
    setNewResponsibility('');
    setNewFacebookUrl('');
    setNewYoutubeUrl('');
    setNewLinkedinUrl('');
    setNewProfileUrl('');
    setNewPhoto(null);
    setPhotoPreview('');
    setNewCover(null);
    setCoverPreview('');
    setError('');
  };

  const handleEdit = (inst: Instructor) => {
    setEditingInstructorId(inst.id);
    setNewName(inst.name);
    setNewBackground(inst.background);
    setNewRole(inst.role);
    setNewBio(inst.bio || '');
    setNewResponsibility(inst.responsibility || '');
    setNewFacebookUrl(inst.facebookUrl || '');
    setNewYoutubeUrl(inst.youtubeUrl || '');
    setNewLinkedinUrl(inst.linkedinUrl || '');
    setNewProfileUrl(inst.profileUrl || '');
    setPhotoPreview(inst.photoUrl);
    setCoverPreview(inst.coverUrl || '');
    setNewCover(null);
    setNewPhoto(null);
    setIsAdding(true);
  };

  const handleSaveInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBackground || !newRole) {
      setError('Name, Background, and Role are required.');
      return;
    }
    if (!editingInstructorId && !newPhoto && !photoPreview) {
      setError('Photo is required.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let photoUrl = photoPreview;
      if (newPhoto) photoUrl = await uploadImageToImgBB(newPhoto);
      let coverUrl = coverPreview;
      if (newCover) coverUrl = await uploadImageToImgBB(newCover);

      let updatedInstructors;
      
      if (editingInstructorId) {
        updatedInstructors = instructors.map(inst => 
          inst.id === editingInstructorId 
            ? { ...inst, name: newName, background: newBackground, role: newRole,
            coverUrl, photoUrl, bio: newBio, responsibility: newResponsibility, facebookUrl: newFacebookUrl, youtubeUrl: newYoutubeUrl, linkedinUrl: newLinkedinUrl, profileUrl: newProfileUrl }
            : inst
        );
      } else {
        const newInstructor: Instructor = {
          id: Date.now().toString(),
          name: newName,
          background: newBackground,
          role: newRole,
          photoUrl,
          coverUrl,
          bio: newBio,
          responsibility: newResponsibility,
          facebookUrl: newFacebookUrl,
          youtubeUrl: newYoutubeUrl,
          linkedinUrl: newLinkedinUrl,
          profileUrl: newProfileUrl
        };
        updatedInstructors = [...instructors, newInstructor];
      }
      
      await updateDoc(doc(db, 'courses', courseId), { instructors: updatedInstructors });
      setInstructors(updatedInstructors);
      
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Failed to save instructor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this instructor?')) return;
    
    const updatedInstructors = instructors.filter(i => i.id !== id);
    try {
      await updateDoc(doc(db, 'courses', courseId), { instructors: updatedInstructors });
      setInstructors(updatedInstructors);
    } catch (err) {
      console.error(err);
      alert('Failed to remove instructor.');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero Section */}
      <div className="relative w-full mb-4 shadow-lg">
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 bg-[#111827]"/>
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
          <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Teacher Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Instructors</h1>
            <p className="text-gray-300 text-sm font-medium">Add teachers, guest lecturers, or doubt solving assistants for this course.</p>
          </div>
          {!isAdding && (
            <button onClick={() => { resetForm(); setIsAdding(true); }} className="px-5 py-2.5 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap shrink-0">
              <Plus className="w-5 h-5" /> Add Instructor
            </button>
          )}
        </div>
      </div>


      {isAdding && (
        <form onSubmit={handleSaveInstructor} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">{editingInstructorId ? 'Edit Instructor' : 'Add New Instructor'}</h2>
            <button type="button" onClick={resetForm} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0 flex flex-col items-center">
              <label className="block text-sm font-medium mb-1 text-center">Profile Photo <span className="text-red-500">*</span></label>
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-foreground/20 bg-foreground/5 hover:border-orange-500/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                <input 
                  type="file" accept="image/*" onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  {...(!editingInstructorId && !photoPreview ? { required: true } : {})}
                />
                {photoPreview ? (
                  <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-foreground/40 group-hover:text-orange-500 mb-1" />
                    <span className="text-xs text-foreground/50 font-medium">Upload Photo</span>
                  </>
                )}
                {photoPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                )}
              </div>
            </div>

            
            <div className="shrink-0 flex flex-col items-center">
              <label className="block text-sm font-medium mb-1 text-center">Cover Photo</label>
              <div className="relative w-48 h-32 rounded-2xl border-2 border-dashed border-foreground/20 bg-foreground/5 hover:border-orange-500/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                <input 
                  type="file" accept="image/*" onChange={handleCoverChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-foreground/40 group-hover:text-orange-500 mb-1" />
                    <span className="text-xs text-foreground/50 font-medium text-center px-2">Upload Cover<br/>(Optional)</span>
                  </>
                )}
                {coverPreview && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ayman Sadiq" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background / University <span className="text-red-500">*</span></label>
                <input type="text" value={newBackground} onChange={e => setNewBackground(e.target.value)} placeholder="e.g. BSc in EEE, BUET" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></label>
                <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. Lead Instructor, Math Expert" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
              </div>
            </div>
          </div>

          {/* Extended Information */}
          <div className="space-y-4 pt-4 border-t border-foreground/5">
            <h3 className="font-bold text-sm text-foreground/70 uppercase tracking-wider">Additional Details (Optional)</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic / Responsibility (কী পড়াবেন)</label>
                <input type="text" value={newResponsibility} onChange={e => setNewResponsibility(e.target.value)} placeholder="e.g. Physics 1st Paper, MCQ Solving" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Bio</label>
                <textarea value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="e.g. 5+ years of teaching experience..." rows={2} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 custom-scrollbar" />
              </div>
            </div>

            <h3 className="font-bold text-sm text-foreground/70 uppercase tracking-wider pt-2">Social Links & Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook URL</label>
                <input type="text" value={newFacebookUrl} onChange={e => setNewFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <input type="text" value={newYoutubeUrl} onChange={e => setNewYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input type="text" value={newLinkedinUrl} onChange={e => setNewLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website Profile URL</label>
                <input type="text" value={newProfileUrl} onChange={e => setNewProfileUrl(e.target.value)} placeholder="Link to profile on SkyLearners..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-foreground/10">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Uploading...' : 'Save Instructor'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.length === 0 && !isAdding ? (
          <div className="col-span-full text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <Users className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No instructors added yet.</p>
            <p className="text-foreground/40 text-sm mt-2">Add the teachers who will be taking this course.</p>
          </div>
        ) : (
          instructors.map((inst) => (
            <div key={inst.id} className="bg-background border border-foreground/10 p-5 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-orange-500/30 transition-colors shadow-sm relative group">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEdit(inst)} 
                  className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                  title="Edit Instructor"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(inst.id)} 
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  title="Remove Instructor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-foreground/10 bg-foreground/5 shrink-0 relative">
                {inst.photoUrl ? (
                  <Image src={inst.photoUrl} alt={inst.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-foreground/30" /></div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-1">{inst.name}</h3>
                <p className="text-sm font-medium text-orange-500 mb-1">{inst.role}</p>
                <p className="text-xs text-foreground/60">{inst.background}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
