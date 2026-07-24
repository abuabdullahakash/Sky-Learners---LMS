"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, GripVertical, Video as VideoIcon, Image as ImageIcon, Trash2, Upload, Loader2, X, FileText, Settings, Calendar, User, BookOpen, CheckCircle, Search, ChevronDown, ChevronRight, Edit2, HardDrive, Link as LinkIcon, AlertTriangle, PlayCircle } from 'lucide-react';
import { uploadImageToImgBB } from '@/lib/imgbb';
import toast from 'react-hot-toast';

const scanVideoUrl = (url: string, isPrivateGroupCheck: boolean = false) => {
  if (!url) return null;
  const isFb = url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com');
  const isFbPrivate = isPrivateGroupCheck || (isFb && url.includes('/groups/'));

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { type: 'youtube', platform: 'YouTube', icon: <PlayCircle className="w-5 h-5 text-red-500" />, valid: true, message: 'Valid YouTube URL. Tracking supported.' };
  }
  if (isFb) {
    if (isFbPrivate) {
      return { type: 'facebook_private', platform: 'Private Facebook Group', icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, valid: true, message: 'Private group video. Cannot be embedded, but students can watch directly on Facebook. Tracking disabled.' };
    }
    return { type: 'facebook_public', platform: 'Public Facebook Video', icon: <LinkIcon className="w-5 h-5 text-blue-500" />, valid: true, message: 'Valid public Facebook video. Tracking supported.' };
  }
  if (url.includes('drive.google.com')) {
    return { type: 'drive', platform: 'Google Drive', icon: <HardDrive className="w-5 h-5 text-green-500" />, valid: true, message: 'Google Drive link. Will be embedded via iframe. Tracking disabled.' };
  }
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return { type: 'direct', platform: 'Direct Video File', icon: <VideoIcon className="w-5 h-5 text-purple-500" />, valid: true, message: 'Direct video file. Tracking supported.' };
  }
  return { type: 'unknown', platform: 'Unknown / Other', icon: <LinkIcon className="w-5 h-5 text-gray-500" />, valid: false, message: 'Unrecognized URL. System will try to embed it via iframe. Tracking disabled. May not play properly.' };
};

export default function CourseCurriculumPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  // Syllabus state
  const [activeView, setActiveView] = useState<'curriculum' | 'syllabus'>('curriculum');
  const [syllabusObjectives, setSyllabusObjectives] = useState('');
  const [syllabusPrerequisites, setSyllabusPrerequisites] = useState('');
  const [syllabusGrading, setSyllabusGrading] = useState('');
  const [syllabusModules, setSyllabusModules] = useState<any[]>([]);
  const [uploadingModuleImage, setUploadingModuleImage] = useState<string | null>(null);
  
  // Lesson form state
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonInstructor, setLessonInstructor] = useState('');
  const [lessonSubject, setLessonSubject] = useState('');
  const [lessonNoteUrl, setLessonNoteUrl] = useState('');
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const [lessonThumbnail, setLessonThumbnail] = useState<File | null>(null);
  const [lessonThumbnailUrl, setLessonThumbnailUrl] = useState('');
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);

  // Hybrid Video states
  const [isVideoFacebook, setIsVideoFacebook] = useState(false);
  const [isFacebookPrivate, setIsFacebookPrivate] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          if (!data.modules) data.modules = [];
          if (!data.subjects) data.subjects = [];
          if (!data.instructors) data.instructors = [];
          if (!data.syllabus) data.syllabus = {};
          setCourse(data);
          
          setSyllabusObjectives(data.syllabus.objectives || '');
          setSyllabusPrerequisites(data.syllabus.prerequisites || '');
          setSyllabusGrading(data.syllabus.grading || '');
          setSyllabusModules(data.syllabus.modules || []);
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [user, courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const handleAddModule = async () => {
    const newModuleId = Date.now().toString();
    const newModule = {
      id: newModuleId,
      title: 'New Module',
      lessons: []
    };
    const updatedModules = [...course.modules, newModule];
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
    setExpandedModules([...expandedModules, newModuleId]); // Expand the new module
  };

  const handleUpdateModule = async (moduleId: string, newTitle: string) => {
    const updatedModules = course.modules.map((mod: any) => 
      mod.id === moduleId ? { ...mod, title: newTitle } : mod
    );
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  const handleRemoveModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and ALL of its lessons? This action cannot be undone.')) return;
    
    const updatedModules = course.modules.filter((mod: any) => mod.id !== moduleId);
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  // --- Subject Management ---
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    const updatedSubjects = [...(course.subjects || []), newSubject.trim()];
    setCourse({ ...course, subjects: updatedSubjects });
    await updateDoc(doc(db, 'courses', courseId), { subjects: updatedSubjects });
    setNewSubject('');
  };

  const handleRemoveSubject = async (index: number) => {
    const updatedSubjects = [...course.subjects];
    updatedSubjects.splice(index, 1);
    setCourse({ ...course, subjects: updatedSubjects });
    await updateDoc(doc(db, 'courses', courseId), { subjects: updatedSubjects });
  };

  const handleSaveSyllabus = async () => {
    const toastId = toast.loading('Saving syllabus...');
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        syllabus: {
          objectives: syllabusObjectives,
          prerequisites: syllabusPrerequisites,
          grading: syllabusGrading,
          modules: syllabusModules,
        }
      });
      toast.success('Syllabus saved successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to save syllabus', { id: toastId });
    }
  };

  // --- Syllabus Module Management ---
  const handleAddSyllabusModule = () => {
    setSyllabusModules([...syllabusModules, {
      id: Date.now().toString(),
      title: '',
      imageUrl: '',
      lessons: []
    }]);
  };

  const handleUpdateSyllabusModule = (moduleId: string, field: string, value: any) => {
    setSyllabusModules(prev => prev.map(m => m.id === moduleId ? { ...m, [field]: value } : m));
  };

  const handleRemoveSyllabusModule = (moduleId: string) => {
    if (confirm('Are you sure you want to delete this syllabus module?')) {
      setSyllabusModules(prev => prev.filter(m => m.id !== moduleId));
    }
  };

  const handleSyllabusImageUpload = async (moduleId: string, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    try {
      setUploadingModuleImage(moduleId);
      const url = await uploadImageToImgBB(file);
      if (url) {
        handleUpdateSyllabusModule(moduleId, 'imageUrl', url);
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('An error occurred during image upload.');
    } finally {
      setUploadingModuleImage(null);
    }
  };

  const handleAddSyllabusLesson = (moduleId: string) => {
    setSyllabusModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...(m.lessons || []), {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title: '',
            videoCount: 1,
            examCount: 0,
            noteCount: 0
          }]
        };
      }
      return m;
    }));
  };

  const handleUpdateSyllabusLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    setSyllabusModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map((l: any) => l.id === lessonId ? { ...l, [field]: value } : l)
        };
      }
      return m;
    }));
  };

  const handleRemoveSyllabusLesson = (moduleId: string, lessonId: string) => {
    setSyllabusModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter((l: any) => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  // --- Lesson Management ---
  const openLessonModal = (moduleId?: string, lesson?: any) => {
    if (lesson) {
      // Edit mode
      setEditingModuleId(moduleId || null);
      setEditingLessonId(lesson.id);
      setLessonTitle(lesson.title || '');
      setLessonVideoUrl(lesson.videoUrl || '');
      setLessonInstructor(lesson.instructor || '');
      setLessonSubject(lesson.subject || '');
      setLessonNoteUrl(lesson.noteUrl || '');
      setLessonFreePreview(lesson.isFreePreview || false);
      setLessonThumbnail(null);
      setLessonThumbnailUrl(lesson.thumbnailUrl || '');
      
      const source = lesson.videoSource || 'youtube';
      setIsVideoFacebook(source.includes('facebook'));
      setIsFacebookPrivate(source === 'facebook_private');
    } else {
      // Add mode
      setEditingModuleId(moduleId || (course.modules?.length > 0 ? course.modules[0].id : null));
      setEditingLessonId(null);
      setLessonTitle('');
      setLessonVideoUrl('');
      setLessonInstructor('');
      setLessonSubject('');
      setLessonNoteUrl('');
      setLessonFreePreview(false);
      setLessonThumbnail(null);
      setLessonThumbnailUrl('');
      setIsVideoFacebook(false);
      setIsFacebookPrivate(false);
    }
    setIsLessonModalOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLessonThumbnail(file);
      setLessonThumbnailUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModuleId || !lessonTitle || !lessonVideoUrl) return;
    
    setIsUploadingLesson(true);
    try {
      let finalThumbnailUrl = lessonThumbnailUrl;
      if (lessonThumbnail) {
        finalThumbnailUrl = await uploadImageToImgBB(lessonThumbnail);
      }

      let updatedModules = [...course.modules];

      let videoSource = 'unknown';
      const scanResult = scanVideoUrl(lessonVideoUrl, isFacebookPrivate);
      if (scanResult) {
        videoSource = scanResult.type;
      }

      if (editingLessonId) {
        // Edit existing lesson
        updatedModules = updatedModules.map((mod: any) => {
          if (mod.id === editingModuleId) {
            return {
              ...mod,
              lessons: mod.lessons.map((l: any) => 
                l.id === editingLessonId ? {
                  ...l,
                  title: lessonTitle,
                  videoUrl: lessonVideoUrl,
                  instructor: lessonInstructor,
                  subject: lessonSubject,
                  noteUrl: lessonNoteUrl,
                  isFreePreview: lessonFreePreview,
                  thumbnailUrl: finalThumbnailUrl,
                  videoSource: videoSource,
                } : l
              )
            };
          }
          return mod;
        });
      } else {
        // Add new lesson
        const newLesson = {
          id: Date.now().toString(),
          title: lessonTitle,
          videoUrl: lessonVideoUrl,
          instructor: lessonInstructor,
          subject: lessonSubject,
          noteUrl: lessonNoteUrl,
          isFreePreview: lessonFreePreview,
          thumbnailUrl: finalThumbnailUrl,
          videoSource: videoSource,
          uploadDate: new Date().toISOString()
        };

        updatedModules = updatedModules.map((mod: any) => {
          if (mod.id === editingModuleId) {
            return {
              ...mod,
              lessons: [...(mod.lessons || []), newLesson]
            };
          }
          return mod;
        });
      }

      setCourse({ ...course, modules: updatedModules });
      await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
      
      // Auto expand module if we added a lesson to it
      if (!expandedModules.includes(editingModuleId)) {
        setExpandedModules([...expandedModules, editingModuleId]);
      }
      
      setIsLessonModalOpen(false);
    } catch (error) {
      console.error("Error saving lesson", error);
    } finally {
      setIsUploadingLesson(false);
    }
  };

  const handleRemoveLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    const updatedModules = course.modules.map((mod: any) => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.filter((l: any) => l.id !== lessonId)
        };
      }
      return mod;
    });
    setCourse({ ...course, modules: updatedModules });
    await updateDoc(doc(db, 'courses', courseId), { modules: updatedModules });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  if (!course) return null;

  const filteredModules = course.modules?.filter((module: any) => 
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      

      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#111827]"/>
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
          <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Teacher Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Curriculum Builder</h1>
            <p className="text-gray-300 text-sm font-medium">Organize your course into modules and add video lessons.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-20">
            {/* Search Popup */}
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" title="Search Modules">
                <Search className="w-5 h-5" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-background border border-foreground/10 p-2 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                   <div className="relative">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                     <input 
                        type="text" 
                        placeholder="Search modules..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-foreground/5 border border-transparent pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-orange-500/50 transition-colors text-foreground"
                      />
                   </div>
                </div>
              )}
            </div>

            {/* Edit Syllabus */}
            <button onClick={() => setActiveView(prev => prev === 'syllabus' ? 'curriculum' : 'syllabus')} className={`p-2.5 border text-white rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${activeView === 'syllabus' ? 'bg-orange-500 border-orange-400' : 'bg-white/10 border-white/20 hover:bg-white/20'}`} title="Edit Syllabus Settings">
              <FileText className="w-5 h-5" />
            </button>

            {/* Subjects */}
            <button onClick={() => { setActiveView('curriculum'); setIsSubjectModalOpen(true); }} className="p-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" title="Manage Subjects">
              <BookOpen className="w-5 h-5" />
            </button>

            {/* Add Module */}
            <button onClick={() => { setActiveView('curriculum'); handleAddModule(); }} className="p-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" title="Add Module">
              <Plus className="w-5 h-5" />
            </button>

            {/* Add Lesson */}
            <button onClick={() => { setActiveView('curriculum'); openLessonModal(); }} className="p-2.5 bg-orange-500 border border-orange-400 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50" title="Add Lesson">
              <VideoIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {activeView === 'curriculum' ? (
      <div className="space-y-4">
        {filteredModules?.map((module: any, mIndex: number) => {
          const isExpanded = expandedModules.includes(module.id) || searchQuery !== '';
          return (
            <div key={module.id} className="bg-background rounded-lg border border-foreground/10 overflow-hidden shadow-sm transition-all duration-300">
              <div className="bg-foreground/5 p-2.5 sm:p-3 flex items-center justify-between gap-2 border-b border-foreground/10 hover:bg-foreground/10 transition-colors rounded-t-lg">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="p-1.5 hover:bg-foreground/10 rounded-md transition-colors flex items-center justify-center text-foreground/60 shrink-0"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <GripVertical className="text-foreground/30 cursor-move hidden sm:block shrink-0" />
                <span className="font-bold text-orange-500 whitespace-nowrap text-xs sm:text-base shrink-0">
                  Module {course.modules.findIndex((m:any) => m.id === module.id) + 1}:
                </span>
                <input 
                  type="text" value={module.title}
                  onChange={(e) => handleUpdateModule(module.id, e.target.value)}
                  className="flex-1 min-w-0 bg-transparent font-bold text-xs sm:text-base focus:outline-none border-b border-transparent focus:border-orange-500/50 py-1"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    onClick={() => openLessonModal(module.id)} 
                    className="text-xs px-2.5 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> <span>Add Lesson</span>
                  </button>
                  <button 
                    onClick={() => handleRemoveModule(module.id)} 
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0" 
                    title="Delete Module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-3 sm:p-4 space-y-3">
                  {module.lessons?.length === 0 ? (
                    <div className="text-center p-4 text-foreground/40 text-sm">No lessons added yet.</div>
                  ) : (
                    module.lessons?.map((lesson: any, lIndex: number) => (
                      <div key={lesson.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-foreground/5 rounded-lg border border-foreground/10 hover:border-orange-500/30 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {lesson.thumbnailUrl ? (
                            <img src={lesson.thumbnailUrl} alt="Thumbnail" className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-md border border-foreground/10 flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-10 sm:w-20 sm:h-12 bg-foreground/10 rounded-md flex items-center justify-center flex-shrink-0">
                              <VideoIcon className="w-5 h-5 text-foreground/30" />
                            </div>
                          )}
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                              <span className="text-orange-500">Lesson {lIndex + 1}:</span> <span className="truncate">{lesson.title}</span>
                              {lesson.isFreePreview && (
                                <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Free Preview</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-foreground/60 flex-wrap">
                              {lesson.subject && (
                                <span className="flex items-center gap-1 truncate"><BookOpen className="w-3 h-3 text-orange-500" /> {lesson.subject}</span>
                              )}
                              {lesson.instructor && (
                                <span className="flex items-center gap-1 truncate"><User className="w-3 h-3 text-blue-500" /> {lesson.instructor}</span>
                              )}
                              {lesson.uploadDate && (
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-foreground/40" /> {new Date(lesson.uploadDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-foreground/10 w-full sm:w-auto justify-end">
                          <button onClick={() => openLessonModal(module.id, lesson)} className="p-1.5 sm:p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" title="Edit Lesson">
                            <Edit2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Edit</span>
                          </button>
                          <button onClick={() => handleRemoveLesson(module.id, lesson.id)} className="p-1.5 sm:p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" title="Delete Lesson">
                            <Trash2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {course.modules?.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-2xl bg-background/50">
            <p className="text-foreground/50 font-medium text-lg">Your curriculum is empty.</p>
            <p className="text-foreground/40 text-sm mt-1">Start by adding a module to organize your video lessons.</p>
          </div>
        )}
      </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content: Outline */}
          <div className="lg:col-span-8 bg-background rounded-2xl p-6 shadow-sm border border-foreground/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" /> Syllabus Outline
              </h3>
              <button onClick={handleAddSyllabusModule} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-5 h-5" /> Add Module
              </button>
            </div>

            {syllabusModules.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-2xl bg-foreground/5 text-foreground/50 text-sm">
                No syllabus modules added. Click "Add Module" to start building your course outline.
              </div>
            ) : (
              <div className="space-y-6">
                {syllabusModules.map((module: any, mIndex: number) => (
                  <div key={module.id} className="border border-foreground/10 rounded-2xl overflow-hidden shadow-sm bg-background transition-colors focus-within:border-orange-500/30">
                    <div className="bg-foreground/[0.02] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-foreground/10">
                      
                      <div 
                        className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-background border-2 border-dashed border-foreground/20 rounded-xl overflow-hidden group cursor-pointer hover:border-orange-500 transition-colors flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        onClick={() => document.getElementById(`syllabus-img-${module.id}`)?.click()}
                        onPaste={(e) => {
                          const file = e.clipboardData.files[0];
                          if (file) handleSyllabusImageUpload(module.id, file);
                        }}
                        tabIndex={0}
                        title="Click to browse or paste an image"
                      >
                        <input 
                          type="file" 
                          id={`syllabus-img-${module.id}`}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSyllabusImageUpload(module.id, file);
                          }}
                        />
                        {uploadingModuleImage === module.id ? (
                          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                        ) : module.imageUrl ? (
                          <>
                            <img src={module.imageUrl} alt="Module Icon" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <ImageIcon className="w-5 h-5 text-foreground/40 mx-auto mb-1 group-hover:text-orange-500 transition-colors" />
                            <span className="text-[10px] text-foreground/40 font-bold uppercase group-hover:text-orange-500 transition-colors">Upload</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <div className="font-bold text-orange-500 text-sm">MODULE {mIndex + 1}</div>
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={(e) => handleUpdateSyllabusModule(module.id, 'title', e.target.value)}
                          placeholder="Module Title (e.g. English, Math)"
                          className="w-full bg-background border-b-2 border-foreground/10 px-2 py-1.5 text-lg font-bold focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 self-end sm:self-center w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                        <button onClick={() => handleAddSyllabusLesson(module.id)} className="w-full sm:w-auto px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Add Topic
                        </button>
                        <button onClick={() => handleRemoveSyllabusModule(module.id)} className="w-full sm:w-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex justify-center" title="Delete Module">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3 bg-background">
                      {(!module.lessons || module.lessons.length === 0) ? (
                        <div className="text-center p-6 border-2 border-dashed border-foreground/10 rounded-xl bg-foreground/5 text-foreground/40 text-sm">No topics added to this module yet.</div>
                      ) : (
                        module.lessons.map((lesson: any, lIndex: number) => (
                          <div key={lesson.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-foreground/[0.02] rounded-xl border border-foreground/10 focus-within:border-orange-500/30 transition-colors group">
                            <span className="text-sm font-bold text-foreground/30 hidden sm:block w-6 text-center">{lIndex + 1}.</span>
                            <div className="flex-1 w-full">
                              <input 
                                type="text" 
                                value={lesson.title}
                                onChange={(e) => handleUpdateSyllabusLesson(module.id, lesson.id, 'title', e.target.value)}
                                placeholder="Topic Title (e.g. Lesson 18: Make Your Snacks)"
                                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                              <div className="flex items-center gap-2 bg-background border border-foreground/10 rounded-lg px-3 py-1.5 focus-within:border-orange-500 transition-colors">
                                <VideoIcon className="w-4 h-4 text-blue-500" />
                                <input 
                                  type="number" min="0"
                                  value={lesson.videoCount}
                                  onChange={(e) => handleUpdateSyllabusLesson(module.id, lesson.id, 'videoCount', parseInt(e.target.value) || 0)}
                                  className="w-12 bg-transparent text-sm font-bold text-center focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2 bg-background border border-foreground/10 rounded-lg px-3 py-1.5 focus-within:border-orange-500 transition-colors">
                                <FileText className="w-4 h-4 text-purple-500" />
                                <input 
                                  type="number" min="0"
                                  value={lesson.examCount}
                                  onChange={(e) => handleUpdateSyllabusLesson(module.id, lesson.id, 'examCount', parseInt(e.target.value) || 0)}
                                  className="w-12 bg-transparent text-sm font-bold text-center focus:outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2 bg-background border border-foreground/10 rounded-lg px-3 py-1.5 focus-within:border-orange-500 transition-colors">
                                <BookOpen className="w-4 h-4 text-green-500" />
                                <input 
                                  type="number" min="0"
                                  value={lesson.noteCount}
                                  onChange={(e) => handleUpdateSyllabusLesson(module.id, lesson.id, 'noteCount', parseInt(e.target.value) || 0)}
                                  className="w-12 bg-transparent text-sm font-bold text-center focus:outline-none"
                                />
                              </div>
                              <button onClick={() => handleRemoveSyllabusLesson(module.id, lesson.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-auto md:ml-0" title="Delete Topic">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Settings */}
          <div className="lg:col-span-4 bg-background rounded-2xl p-6 shadow-sm border border-foreground/10 space-y-6 sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground"><Settings className="w-5 h-5 text-orange-500" /> Syllabus Settings</h2>
                <p className="text-sm text-foreground/60 mt-1">Details displayed on the student syllabus.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">What you will learn (Objectives)</label>
                <textarea 
                  value={syllabusObjectives} 
                  onChange={(e) => setSyllabusObjectives(e.target.value)}
                  placeholder="Enter key takeaways (e.g. You will learn how to build websites...)"
                  className="w-full bg-foreground/5 border border-foreground/10 px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 min-h-[120px] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Prerequisites & Requirements</label>
                <textarea 
                  value={syllabusPrerequisites} 
                  onChange={(e) => setSyllabusPrerequisites(e.target.value)}
                  placeholder="e.g. Basic understanding of HTML, a laptop..."
                  className="w-full bg-foreground/5 border border-foreground/10 px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 min-h-[120px] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Grading & Certification Info</label>
                <textarea 
                  value={syllabusGrading} 
                  onChange={(e) => setSyllabusGrading(e.target.value)}
                  placeholder="e.g. 80% passing score required to obtain a certificate."
                  className="w-full bg-foreground/5 border border-foreground/10 px-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 min-h-[120px] transition-colors"
                />
              </div>
            </div>

            <button onClick={handleSaveSyllabus} className="w-full px-5 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Save Details
            </button>
          </div>
        </div>
      )}


      {/* --- Subject Settings Modal --- */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 pb-20 md:pb-4">
          <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-2xl relative my-auto">
            <button onClick={() => setIsSubjectModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-foreground/50" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-orange-500" /> Course Subjects</h2>
            <p className="text-sm text-foreground/60 mb-4">Add subjects here to select them easily when uploading lessons.</p>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Physics 1st Paper"
                className="flex-1 bg-foreground/5 px-4 py-2.5 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <button onClick={handleAddSubject} className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {course.subjects?.length === 0 ? (
                <div className="text-center py-6 text-foreground/40 text-sm">No subjects added yet.</div>
              ) : (
                course.subjects?.map((subject: string, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-foreground/5 px-4 py-2.5 rounded-xl border border-foreground/10">
                    <span className="text-sm font-medium">{subject}</span>
                    <button onClick={() => handleRemoveSubject(idx)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Add/Edit Lesson Modal --- */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 pb-20 md:pb-4">
          <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[82vh] md:max-h-[88vh] flex flex-col my-auto">
            <div className="bg-background/95 backdrop-blur-sm z-10 p-5 sm:p-6 border-b border-foreground/10 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-orange-500" /> 
                {editingLessonId ? 'Edit Lesson' : 'Upload Lesson'}
              </h2>
              <button onClick={() => setIsLessonModalOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-foreground/50" />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6">
              <form id="lesson-form" onSubmit={handleSaveLesson} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Select Module *</label>
                  <select 
                    required 
                    value={editingModuleId || ''} 
                    onChange={(e) => setEditingModuleId(e.target.value)}
                    className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none dark:bg-[#1f1f1f]"
                    disabled={course.modules?.length === 0}
                  >
                    {course.modules?.length === 0 && <option value="" className="bg-background text-foreground">No modules available - Add a module first</option>}
                    {course.modules?.map((mod: any, idx: number) => (
                      <option key={mod.id} value={mod.id} className="bg-background text-foreground">Module {idx + 1}: {mod.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Lesson Title *</label>
                  <input 
                    type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Newton's First Law"
                    className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                    <label className="text-sm font-bold text-foreground/80">Video URL *</label>
                    <input 
                      type="url" required 
                      value={lessonVideoUrl} 
                      onChange={(e) => {
                        const url = e.target.value;
                        setLessonVideoUrl(url);
                        const isFb = url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com');
                        setIsVideoFacebook(isFb);
                        if (isFb && url.includes('/groups/')) {
                          setIsFacebookPrivate(true);
                        } else if (!isFb) {
                          setIsFacebookPrivate(false);
                        }
                      }}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 mt-1 transition-colors"
                    />
                  </div>

                  {lessonVideoUrl && (() => {
                    const scan = scanVideoUrl(lessonVideoUrl, isFacebookPrivate);
                    if (!scan) return null;
                    return (
                      <div className={`mt-2 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in zoom-in duration-300 ${scan.valid ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="mt-0.5 p-1.5 bg-background rounded-lg shadow-sm">
                          {scan.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${scan.valid ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                            {scan.platform}
                          </p>
                          <p className="text-xs text-foreground/70 mt-1">
                            {scan.message}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {isVideoFacebook && !lessonVideoUrl.includes('/groups/') && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          id="privateGroupCheck"
                          checked={isFacebookPrivate}
                          onChange={(e) => setIsFacebookPrivate(e.target.checked)}
                          className="w-4 h-4 rounded border-foreground/20 text-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="privateGroupCheck" className="text-sm font-bold text-foreground cursor-pointer">
                          Is this video from a Private Facebook Group?
                        </label>
                        <p className="text-xs text-foreground/60 mt-1">
                          Private group videos cannot be embedded. Students will see a button to watch it directly on Facebook instead.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.courseType === 'coaching' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground/80">Instructor (Optional)</label>
                      <select 
                        value={lessonInstructor} onChange={(e) => setLessonInstructor(e.target.value)}
                        className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none dark:bg-[#1f1f1f]"
                      >
                        <option value="" className="bg-background text-foreground">Select Instructor...</option>
                        {course.instructors?.map((inst: any) => (
                          <option key={inst.id} value={inst.name} className="bg-background text-foreground">{inst.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground/80">Subject (Optional)</label>
                    <select 
                      value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)}
                      className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none dark:bg-[#1f1f1f]"
                    >
                      <option value="" className="bg-background text-foreground">Select Subject...</option>
                      {course.subjects?.map((sub: string, idx: number) => (
                        <option key={idx} value={sub} className="bg-background text-foreground">{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Class Note PDF Link (Optional)</label>
                  <div className="flex relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input 
                      type="url" value={lessonNoteUrl} onChange={(e) => setLessonNoteUrl(e.target.value)}
                      placeholder="Google Drive link (Anyone with the link)"
                      className="w-full bg-foreground/5 pl-10 pr-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Video Thumbnail (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 bg-foreground/5 rounded-xl border border-dashed border-foreground/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {lessonThumbnailUrl ? (
                        <img src={lessonThumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <input 
                        type="file" accept="image/*" onChange={handleThumbnailChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="bg-foreground/5 border border-foreground/10 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 flex items-center gap-2 hover:bg-foreground/10 transition-colors inline-flex">
                        <Upload className="w-4 h-4" /> Choose Image
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" checked={lessonFreePreview} onChange={(e) => setLessonFreePreview(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-foreground/30 rounded flex items-center justify-center transition-all peer-checked:bg-orange-500 peer-checked:border-orange-500">
                        <CheckCircle className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Free Preview</span>
                      <span className="text-xs text-foreground/60 block">Allow anyone to watch this video for free.</span>
                    </div>
                  </label>
                </div>

                {!editingLessonId && (
                  <div className="flex items-center gap-2 text-xs text-foreground/50 pt-2">
                    <Calendar className="w-3 h-3" />
                    Upload Date: {new Date().toLocaleDateString()}
                  </div>
                )}
              </form>
            </div>
            
            <div className="bg-background p-4 border-t border-foreground/10 rounded-b-3xl flex-shrink-0 sticky bottom-0 z-20">
              <button 
                type="submit" 
                form="lesson-form"
                disabled={isUploadingLesson || !editingModuleId}
                className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploadingLesson ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : editingLessonId ? 'Save Changes' : 'Upload Lesson'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
