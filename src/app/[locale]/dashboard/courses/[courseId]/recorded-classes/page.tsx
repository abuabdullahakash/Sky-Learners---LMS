"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video as VideoIcon, Loader2, LayoutGrid, List as ListIcon, PlayCircle, Search, Filter, BookOpen, Calendar, User, FileText } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function StudentRecordedClasses() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  // Flatten and process all lessons
  const allLessons = useMemo(() => {
    if (!course || !course.modules) return [];
    
    return course.modules.flatMap((module: any, mIndex: number) => 
      (module.lessons || []).map((lesson: any, lIndex: number) => ({
        ...lesson,
        moduleTitle: module.title,
        moduleId: module.id,
        moduleIndex: mIndex + 1,
        lessonIndex: lIndex + 1
      }))
    );
  }, [course]);

  // Extract unique filters
  const availableModules = useMemo(() => {
    if (!course || !course.modules) return [];
    return course.modules.map((m: any) => ({ id: m.id, title: m.title }));
  }, [course]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allLessons.forEach((lesson: any) => {
      if (lesson.subject) subjects.add(lesson.subject);
    });
    return Array.from(subjects);
  }, [allLessons]);

  // Apply filters
  const filteredLessons = useMemo(() => {
    return allLessons.filter((lesson: any) => {
      // Module filter
      if (selectedModule !== 'All' && lesson.moduleId !== selectedModule) return false;
      
      // Subject filter
      if (selectedSubject !== 'All' && lesson.subject !== selectedSubject) return false;

      // Search query filter (checks title and lesson index)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(query);
        const matchesIndex = lesson.lessonIndex.toString() === query;
        if (!matchesTitle && !matchesIndex) return false;
      }

      return true;
    });
  }, [allLessons, searchQuery, selectedModule, selectedSubject]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="text-center py-20 bg-background rounded-3xl border border-foreground/10">
        <VideoIcon className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Recorded Classes</h2>
        <p className="text-foreground/60">The teacher has not added any lessons to this course yet.</p>
      </div>
    );
  }

  const getRandomGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-amber-400',
      'from-emerald-500 to-teal-400',
      'from-rose-500 to-red-500',
      'from-indigo-500 to-blue-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Header & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Recorded Classes</h1>
          <p className="text-foreground/70 mt-1">Watch your class recordings and download notes.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-foreground/5 p-1 rounded-xl border border-foreground/10">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-orange-500' : 'text-foreground/60 hover:text-foreground'}`}
            title="List View"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-orange-500' : 'text-foreground/60 hover:text-foreground'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-background border border-foreground/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 relative z-10">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search by lesson title or no..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-transparent pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        
        {/* Module Filter */}
        <div className="w-full md:w-48 relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 z-10 pointer-events-none" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full bg-foreground/5 border border-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors appearance-none text-foreground dark:bg-[#1f1f1f] cursor-pointer"
          >
            <option value="All" className="bg-background text-foreground">All Modules</option>
            {availableModules.map((mod: any, idx: number) => (
              <option key={mod.id} value={mod.id} className="bg-background text-foreground">Module {idx + 1}: {mod.title}</option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        {availableSubjects.length > 0 && (
          <div className="w-full md:w-48 relative">
            <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 z-10 pointer-events-none" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-foreground/5 border border-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-orange-500/50 transition-colors appearance-none text-foreground dark:bg-[#1f1f1f] cursor-pointer"
            >
              <option value="All" className="bg-background text-foreground">All Subjects</option>
              {availableSubjects.map((sub: string) => (
                <option key={sub} value={sub} className="bg-background text-foreground">{sub}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-20 bg-background rounded-3xl border border-foreground/10">
          <Search className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No matching lessons found</h2>
          <p className="text-foreground/60">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedModule('All'); setSelectedSubject('All'); }}
            className="mt-4 px-6 py-2 bg-orange-500/10 text-orange-500 font-bold rounded-lg hover:bg-orange-500/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        // --- LIST VIEW ---
        <div className="space-y-4">
          {filteredLessons.map((lesson: any, index: number) => (
            <Link 
              href={`/dashboard/courses/${courseId}/recorded-classes/${lesson.id}`} 
              key={lesson.id}
              className="group flex flex-col sm:flex-row gap-5 p-4 bg-background border border-foreground/10 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Highlight bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              
              {/* Thumbnail */}
              <div className="relative w-full sm:w-64 h-40 sm:h-auto rounded-xl overflow-hidden flex-shrink-0">
                {lesson.thumbnailUrl ? (
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getRandomGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <VideoIcon className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                {/* Lesson Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
                  Lesson {lesson.lessonIndex}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center flex-1 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-md">
                    Mod {lesson.moduleIndex}
                  </span>
                  <span className="text-xs font-semibold text-foreground/60 line-clamp-1">
                    {lesson.moduleTitle}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                  {lesson.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto text-xs font-medium text-foreground/70">
                  {lesson.subject && (
                    <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">
                      <BookOpen className="w-3.5 h-3.5" /> {lesson.subject}
                    </span>
                  )}
                  {lesson.instructor && (
                    <span className="flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
                      <User className="w-3.5 h-3.5" /> {lesson.instructor}
                    </span>
                  )}
                  {lesson.uploadDate && (
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(lesson.uploadDate).toLocaleDateString()}
                    </span>
                  )}
                  {lesson.noteUrl && (
                    <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full ml-auto">
                      <FileText className="w-3.5 h-3.5" /> Class Note
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // --- GRID VIEW ---
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson: any, index: number) => (
            <Link 
              href={`/dashboard/courses/${courseId}/recorded-classes/${lesson.id}`} 
              key={lesson.id}
              className="group flex flex-col bg-background border border-foreground/10 rounded-2xl hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden"
            >
              <div className="relative w-full aspect-video overflow-hidden bg-foreground/5">
                {lesson.thumbnailUrl ? (
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getRandomGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`}>
                    <VideoIcon className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  Lesson {lesson.lessonIndex}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 relative">
                {/* Decorative top border on content */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded">
                    Mod {lesson.moduleIndex}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider line-clamp-1">
                    {lesson.moduleTitle}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-4 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                  {lesson.title}
                </h3>
                
                <div className="mt-auto space-y-2">
                  {(lesson.subject || lesson.instructor) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {lesson.subject && (
                        <span className="flex items-center gap-1 text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          <BookOpen className="w-3 h-3" /> {lesson.subject}
                        </span>
                      )}
                      {lesson.instructor && (
                        <span className="flex items-center gap-1 text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                          <User className="w-3 h-3" /> {lesson.instructor}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-foreground/5 text-[11px] font-medium">
                    {lesson.uploadDate ? (
                      <span className="flex items-center gap-1 text-foreground/60">
                        <Calendar className="w-3 h-3" /> {new Date(lesson.uploadDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-foreground/40">No date</span>
                    )}
                    
                    {lesson.noteUrl && (
                      <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        <FileText className="w-3 h-3" /> Note
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
