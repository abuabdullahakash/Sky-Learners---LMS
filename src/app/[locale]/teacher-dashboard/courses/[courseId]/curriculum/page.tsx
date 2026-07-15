"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, GripVertical, Video as VideoIcon, Image as ImageIcon, Trash2, Upload, Loader2, X, FileText, Settings, Calendar, User, BookOpen, CheckCircle, Search, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import { uploadImageToImgBB } from '@/lib/imgbb';

export default function CourseCurriculumPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
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
          setCourse(data);
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
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Curriculum Builder</h1>
          <p className="text-foreground/70">Organize your course into modules and add video lessons.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsSubjectModalOpen(true)} className="px-4 py-2 bg-background border border-foreground/10 text-foreground rounded-xl font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2">
            <Settings className="w-4 h-4" /> Subjects
          </button>
          <button onClick={handleAddModule} className="px-4 py-2 bg-background border border-foreground/10 text-foreground rounded-xl font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Module
          </button>
          <button onClick={() => openLessonModal()} className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
            <VideoIcon className="w-4 h-4" /> Add Lesson
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input 
          type="text" 
          placeholder="Search modules..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border border-foreground/10 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-orange-500 shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredModules?.map((module: any, mIndex: number) => {
          const isExpanded = expandedModules.includes(module.id) || searchQuery !== '';
          return (
            <div key={module.id} className="bg-background rounded-2xl border border-foreground/10 overflow-hidden shadow-sm transition-all duration-300">
              <div className="bg-foreground/5 p-2 flex items-center gap-3 border-b border-foreground/10 hover:bg-foreground/10 transition-colors">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="p-2 hover:bg-foreground/10 rounded-lg transition-colors flex items-center justify-center text-foreground/50"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <GripVertical className="text-foreground/30 cursor-move hidden sm:block" />
                <span className="font-bold text-orange-500 whitespace-nowrap hidden sm:block">Module {course.modules.findIndex((m:any) => m.id === module.id) + 1}:</span>
                <input 
                  type="text" value={module.title}
                  onChange={(e) => handleUpdateModule(module.id, e.target.value)}
                  className="flex-1 bg-transparent font-bold focus:outline-none border-b border-transparent focus:border-orange-500/50 py-1"
                />
                <button onClick={() => openLessonModal(module.id)} className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition-colors shadow-sm ml-2 whitespace-nowrap flex items-center gap-1">
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lesson</span>
                </button>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {module.lessons?.length === 0 ? (
                    <div className="text-center p-4 text-foreground/40 text-sm">No lessons added yet.</div>
                  ) : (
                    module.lessons?.map((lesson: any, lIndex: number) => (
                      <div key={lesson.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-foreground/5 rounded-xl border border-foreground/10 hover:border-orange-500/30 transition-colors group">
                        <div className="flex items-center gap-4 flex-1">
                          {lesson.thumbnailUrl ? (
                            <img src={lesson.thumbnailUrl} alt="Thumbnail" className="w-20 h-12 object-cover rounded-lg border border-foreground/10 flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-12 bg-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <VideoIcon className="w-6 h-6 text-foreground/30" />
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                              <span className="text-orange-500">Lesson {lIndex + 1}:</span> {lesson.title}
                              {lesson.isFreePreview && (
                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Free Preview</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/60">
                              {lesson.subject && (
                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {lesson.subject}</span>
                              )}
                              {lesson.instructor && (
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {lesson.instructor}</span>
                              )}
                              {lesson.uploadDate && (
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(lesson.uploadDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                          <button onClick={() => openLessonModal(module.id, lesson)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100" title="Edit Lesson">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRemoveLesson(module.id, lesson.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100" title="Delete Lesson">
                            <Trash2 className="w-4 h-4" />
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
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <p className="text-foreground/50 font-medium text-lg">Your curriculum is empty.</p>
            <p className="text-foreground/40 text-sm mt-1">Start by adding a module to organize your video lessons.</p>
          </div>
        )}
      </div>

      {/* --- Subject Settings Modal --- */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="bg-background/95 backdrop-blur-sm z-10 p-6 border-b border-foreground/10 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-orange-500" /> 
                {editingLessonId ? 'Edit Lesson' : 'Upload Lesson'}
              </h2>
              <button onClick={() => setIsLessonModalOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-foreground/50" />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar p-6">
              <form id="lesson-form" onSubmit={handleSaveLesson} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Select Module *</label>
                  <select 
                    required 
                    value={editingModuleId || ''} 
                    onChange={(e) => setEditingModuleId(e.target.value)}
                    className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none"
                    disabled={course.modules?.length === 0}
                  >
                    {course.modules?.length === 0 && <option value="">No modules available - Add a module first</option>}
                    {course.modules?.map((mod: any, idx: number) => (
                      <option key={mod.id} value={mod.id}>Module {idx + 1}: {mod.title}</option>
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

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground/80">Video URL *</label>
                  <input 
                    type="url" required value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="YouTube, Vimeo, Facebook, or Drive URL"
                    className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {course.courseType === 'coaching' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-foreground/80">Instructor (Optional)</label>
                      <select 
                        value={lessonInstructor} onChange={(e) => setLessonInstructor(e.target.value)}
                        className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none"
                      >
                        <option value="">Select Instructor...</option>
                        {course.instructors?.map((inst: any) => (
                          <option key={inst.id} value={inst.name}>{inst.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground/80">Subject (Optional)</label>
                    <select 
                      value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)}
                      className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none"
                    >
                      <option value="">Select Subject...</option>
                      {course.subjects?.map((sub: string, idx: number) => (
                        <option key={idx} value={sub}>{sub}</option>
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
            
            <div className="bg-background p-4 border-t border-foreground/10 rounded-b-3xl flex-shrink-0">
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
