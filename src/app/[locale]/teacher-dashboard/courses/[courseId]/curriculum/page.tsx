"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, GripVertical, Video as VideoIcon } from 'lucide-react';

export default function CourseCurriculumPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          if (!data.modules) data.modules = [];
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

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!course) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Curriculum Builder</h1>
          <p className="text-foreground/70">Organize your course into modules and add video lessons.</p>
        </div>
        <button onClick={handleAddModule} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
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
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <p className="text-foreground/50 font-medium text-lg">Your curriculum is empty.</p>
            <p className="text-foreground/40 text-sm mt-1">Start by adding a module to organize your video lessons.</p>
          </div>
        )}
      </div>
    </div>
  );
}
