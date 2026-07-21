"use client";
import { useTranslations } from 'next-intl';
import { BookOpen, ChevronDown, ChevronRight, Video, FileText, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function SyllabusPage() {
  const tHero = useTranslations('Dashboard.studentHero');
  const tSyllabus = useTranslations('Dashboard.syllabus');
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data());
          // Expand the first module by default
          if (docSnap.data().syllabus?.modules && docSnap.data().syllabus.modules.length > 0) {
            setExpandedModules([docSnap.data().syllabus.modules[0].id]);
          }
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const hasSyllabusDetails = course?.syllabus?.objectives || course?.syllabus?.prerequisites || course?.syllabus?.grading;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <BookOpen className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">{tHero('badge')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">{tHero('syllabusTitle')}</h1>
            <p className="text-gray-300 text-sm font-medium">{tHero('syllabusSubtitle')}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full md:w-[96%] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Curriculum */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" /> Course Curriculum
              </h2>
              
              {(!course?.syllabus?.modules || course.syllabus.modules.length === 0) ? (
                <div className="text-center py-10 bg-foreground/5 rounded-xl border-2 border-dashed border-foreground/10">
                  <p className="text-foreground/50 font-medium">Curriculum is being prepared.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.syllabus.modules.map((module: any, mIndex: number) => {
                    const isExpanded = expandedModules.includes(module.id);
                    return (
                      <div key={module.id} className="border border-foreground/10 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                        {/* Module Header */}
                        <button 
                          onClick={() => toggleModule(module.id)}
                          className="w-full bg-foreground/5 hover:bg-foreground/10 p-4 flex items-center justify-between transition-colors text-left"
                        >
                          <div className="flex items-center gap-4">
                            {module.imageUrl ? (
                              <img src={module.imageUrl} alt={module.title} className="w-10 h-10 object-cover rounded-lg bg-white" />
                            ) : (
                              <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-0.5">Module {mIndex + 1}</span>
                              <span className="font-bold text-foreground text-lg">{module.title}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-foreground/50 bg-background px-3 py-1.5 rounded-full border border-foreground/10">
                              <span>{module.lessons?.length || 0} Lessons</span>
                            </div>
                            <div className="text-foreground/50 bg-background p-1.5 rounded-lg border border-foreground/10">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                          </div>
                        </button>
                        
                        {/* Lessons List */}
                        {isExpanded && (
                          <div className="bg-background divide-y divide-foreground/5">
                            {(!module.lessons || module.lessons.length === 0) ? (
                              <div className="p-4 text-sm text-foreground/40 text-center">No topics added yet.</div>
                            ) : (
                              module.lessons.map((lesson: any, lIndex: number) => {
                                const vCount = lesson.videoCount || 0;
                                const eCount = lesson.examCount || 0;
                                const nCount = lesson.noteCount || 0;
                                const metaData = [];
                                if (vCount > 0) metaData.push(tSyllabus('videoCount', { count: vCount }));
                                if (eCount > 0) metaData.push(tSyllabus('examCount', { count: eCount }));
                                if (nCount > 0) metaData.push(tSyllabus('noteCount', { count: nCount }));
                                
                                return (
                                  <div key={lesson.id} className="p-4 flex items-start sm:items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                                    <div className="mt-1 sm:mt-0 text-foreground/30 bg-foreground/5 p-2 rounded-lg">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-bold text-foreground mb-1">
                                        {lesson.title}
                                      </h4>
                                      <div className="text-xs text-foreground/50 font-medium flex items-center flex-wrap gap-2">
                                        {metaData.length > 0 ? metaData.map((meta, i) => (
                                          <span key={i} className="flex items-center gap-2">
                                            {meta} {i < metaData.length - 1 && <span className="text-foreground/20">•</span>}
                                          </span>
                                        )) : (
                                          <span>No items</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Details */}
          <div className="lg:col-span-1 space-y-6">
            {!hasSyllabusDetails ? (
              <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm text-center">
                <BookOpen className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">More details coming soon.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {course?.syllabus?.objectives && (
                  <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> What you will learn
                    </h3>
                    <div className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                      {course.syllabus.objectives}
                    </div>
                  </div>
                )}
                
                {course?.syllabus?.prerequisites && (
                  <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" /> Requirements
                    </h3>
                    <div className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                      {course.syllabus.prerequisites}
                    </div>
                  </div>
                )}

                {course?.syllabus?.grading && (
                  <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" /> Certification & Grading
                    </h3>
                    <div className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                      {course.syllabus.grading}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
