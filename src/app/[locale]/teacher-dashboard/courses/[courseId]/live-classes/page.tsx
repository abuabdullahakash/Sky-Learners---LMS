"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Video, Plus, Trash2, Calendar, Clock, Link as LinkIcon, Save, Edit, PlayCircle, StopCircle, ChevronDown, ChevronRight, GripVertical, Filter } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

type LiveClass = {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  isLive?: boolean;
  liveStartedAt?: number;
  liveEndedAt?: number;
  isAutoStart?: boolean;
  moduleId?: string;
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
  const [liveModules, setLiveModules] = useState<{id: string, title: string}[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isAutoStart, setIsAutoStart] = useState(false);
  const [newModuleId, setNewModuleId] = useState('');
  const [error, setError] = useState('');
  
  // Prevent duplicate auto-starts
  const autoStartingRefs = useRef<Set<string>>(new Set());

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
          setLiveModules(data.liveModules || []);
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

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const handleAddModule = async () => {
    const newId = Date.now().toString();
    const newModule = { id: newId, title: 'New Module' };
    const updatedModules = [...liveModules, newModule];
    try {
      setLiveModules(updatedModules);
      await updateDoc(doc(db, 'courses', courseId), { liveModules: updatedModules });
      setExpandedModules([...expandedModules, newId]);
    } catch (err) {
      console.error(err);
      alert('Failed to add module');
    }
  };

  const handleUpdateModule = async (moduleId: string, newTitle: string) => {
    const updatedModules = liveModules.map(m => m.id === moduleId ? { ...m, title: newTitle } : m);
    setLiveModules(updatedModules);
    await updateDoc(doc(db, 'courses', courseId), { liveModules: updatedModules });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? Classes inside will be moved to General Classes.')) return;
    const updatedModules = liveModules.filter(m => m.id !== moduleId);
    
    let classesUpdated = false;
    const updatedClasses = liveClasses.map(c => {
      if (c.moduleId === moduleId) {
        classesUpdated = true;
        const newC = { ...c };
        delete newC.moduleId;
        return newC;
      }
      return c;
    });

    try {
      const updates: any = { liveModules: updatedModules };
      if (classesUpdated) updates.liveClasses = updatedClasses;
      await updateDoc(doc(db, 'courses', courseId), updates);
      setLiveModules(updatedModules);
      if (classesUpdated) setLiveClasses(updatedClasses);
    } catch (err) {
      console.error(err);
      alert('Failed to delete module');
    }
  };

  const handleOpenForm = (cls?: LiveClass, targetModuleId?: string) => {
    if (cls) {
      setEditingId(cls.id);
      setNewTitle(cls.title);
      setNewDate(cls.date);
      setNewTime(cls.time);
      setNewLink(cls.meetLink);
      setIsAutoStart(cls.isAutoStart ?? false);
      setNewModuleId(cls.moduleId || '');
    } else {
      setEditingId(null);
      setNewTitle('');
      setNewDate('');
      setNewTime('');
      setNewLink('');
      setIsAutoStart(false);
      setNewModuleId(targetModuleId || '');
    }
    setIsAdding(true);
    setError('');
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime || !newLink) {
      setError('All fields are required.');
      return;
    }

    setIsSaving(true);
    setError('');

    let updatedClasses = [...liveClasses];

    if (editingId) {
      updatedClasses = updatedClasses.map(cls => {
        if (cls.id === editingId) {
          const updated = { ...cls, title: newTitle, date: newDate, time: newTime, meetLink: newLink, isAutoStart };
          if (newModuleId) updated.moduleId = newModuleId;
          else delete updated.moduleId;
          return updated;
        }
        return cls;
      });
    } else {
      const newClass: LiveClass = {
        id: Date.now().toString(),
        title: newTitle,
        date: newDate,
        time: newTime,
        meetLink: newLink,
        isAutoStart,
        isLive: false
      };
      if (newModuleId) newClass.moduleId = newModuleId;
      updatedClasses.push(newClass);
    }
    
    try {
      await updateDoc(doc(db, 'courses', courseId), { liveClasses: updatedClasses });
      setLiveClasses(updatedClasses);
      handleCloseForm();
    } catch (err) {
      console.error(err);
      setError('Failed to save live class.');
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

  const toggleGoLive = async (cls: LiveClass) => {
    try {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return;
      
      const latestData = docSnap.data();
      const currentLiveClasses = latestData.liveClasses || [];

      const updatedStatus = !cls.isLive;
      const updatedClasses = currentLiveClasses.map((c: LiveClass) => {
        if (c.id === cls.id) {
          const newClass = { ...c, isLive: updatedStatus };
          if (updatedStatus) {
            newClass.liveStartedAt = Date.now();
            delete newClass.liveEndedAt;
          } else {
            newClass.liveEndedAt = Date.now();
          }
          
          Object.keys(newClass).forEach(key => {
            if (newClass[key as keyof LiveClass] === undefined) {
              delete newClass[key as keyof LiveClass];
            }
          });
          
          return newClass;
        }
        const cleanC = { ...c };
        Object.keys(cleanC).forEach(key => {
          if (cleanC[key as keyof LiveClass] === undefined) {
            delete cleanC[key as keyof LiveClass];
          }
        });
        return cleanC;
      });
      
      await updateDoc(docRef, { liveClasses: updatedClasses });
      setLiveClasses(updatedClasses);
    } catch (err) {
      console.error(err);
      alert('Failed to update live status.');
      throw err;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      liveClasses.forEach(cls => {
        if (cls.isAutoStart && !cls.isLive && !cls.liveEndedAt && !autoStartingRefs.current.has(cls.id)) {
          const scheduledTime = new Date(`${cls.date}T${cls.time}`);
          if (now >= scheduledTime) {
            autoStartingRefs.current.add(cls.id);
            toggleGoLive(cls).catch(() => {
              autoStartingRefs.current.delete(cls.id);
            });
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [liveClasses]);

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const formatDuration = (start: number, end: number) => {
    const diff = Math.floor((end - start) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  };

  const formatTime12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const renderClassCard = (cls: LiveClass) => (
    <div key={cls.id} className="bg-background border border-foreground/10 p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-500/30 transition-colors shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {cls.isLive ? (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider animate-pulse">Live Now</span>
          ) : cls.liveEndedAt ? (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded uppercase tracking-wider">Ended</span>
          ) : null}
          <h3 className="font-bold text-lg">{cls.title}</h3>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 font-medium">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-500" /> {cls.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {formatTime12Hour(cls.time)}</span>
          {cls.isAutoStart ? (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Auto-Start ON
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span> Manual Start
            </span>
          )}
          {cls.liveEndedAt && cls.liveStartedAt && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              Duration: {formatDuration(cls.liveStartedAt, cls.liveEndedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-orange-500" /> <a href={cls.meetLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 underline underline-offset-2">Join Link</a></span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={() => toggleGoLive(cls)} 
          className={`px-4 py-2 flex items-center gap-2 font-bold rounded transition-colors ${
            cls.isLive 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
              : cls.liveEndedAt
                ? 'bg-foreground/5 text-foreground/50 border border-foreground/10 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30'
                : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white'
          }`}
        >
          {cls.isLive ? <StopCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
          {cls.isLive ? 'End Live' : cls.liveEndedAt ? 'Go Live Again' : 'Go Live Now'}
        </button>
        <button onClick={() => handleOpenForm(cls, cls.moduleId)} className="p-2 text-foreground/40 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" title="Edit">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => handleDelete(cls.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const generalClasses = liveClasses.filter(c => !c.moduleId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Live Classes</h1>
          <p className="text-foreground/70">Schedule and manage live sessions via Google Meet, Zoom, or YouTube.</p>
        </div>
        <div className="flex gap-3">
          {!isAdding && (
            <>
              {liveModules.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilterMenu(p => !p)}
                    className="px-4 py-2.5 bg-background border border-foreground/10 text-foreground rounded font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                    title="Jump to module"
                  >
                    <Filter className="w-4 h-4 text-orange-500" />
                    <span className="hidden md:inline text-sm">Jump to Module</span>
                  </button>
                  {showFilterMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-background border border-foreground/10 rounded shadow-lg z-50 min-w-[200px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      {liveModules.map((m, i) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setShowFilterMenu(false);
                            setExpandedModules(prev => prev.includes(m.id) ? prev : [...prev, m.id]);
                            setTimeout(() => {
                              document.getElementById(`module-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/10 hover:text-orange-500 transition-colors flex items-center gap-2"
                        >
                          <span className="text-xs font-bold text-orange-400 w-16 shrink-0">Module {i + 1}</span>
                          <span className="font-medium truncate">{m.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleAddModule} className="px-5 py-2.5 bg-background border border-foreground/10 text-foreground rounded font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" /> Add Module
              </button>
              <button onClick={() => handleOpenForm()} className="px-5 py-2.5 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" /> Schedule Class
              </button>
            </>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSaveLiveClass} className="bg-background border border-foreground/10 p-6 rounded shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Live Class' : 'Schedule New Live Class'}</h2>
            <button type="button" onClick={handleCloseForm} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Module (Optional)</label>
              <select 
                value={newModuleId} 
                onChange={e => setNewModuleId(e.target.value)}
                className="w-full bg-foreground/5 px-4 py-3 rounded border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 appearance-none dark:bg-[#1f1f1f]"
              >
                <option value="">General Classes (No Module)</option>
                {liveModules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Topic / Title <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Problem Solving" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded focus:border-orange-500" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Time <span className="text-red-500">*</span></label>
                
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <span className="text-[11px] font-medium text-foreground/60 group-hover:text-foreground transition-colors">
                    Auto-start?
                  </span>
                  <div className={`w-7 h-4 rounded-full transition-colors relative flex-shrink-0 ${isAutoStart ? 'bg-orange-500' : 'bg-foreground/20'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${isAutoStart ? 'translate-x-3.5' : 'translate-x-0.5'}`}></div>
                  </div>
                  <span className={`text-[11px] font-bold transition-colors w-20 text-left ${isAutoStart ? 'text-orange-500' : 'text-foreground/50'}`}>
                    {isAutoStart ? 'Yes (Auto)' : 'No (Manual)'}
                  </span>
                  <input type="checkbox" checked={isAutoStart} onChange={e => setIsAutoStart(e.target.checked)} className="sr-only" />
                </label>
              </div>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded focus:border-orange-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Meeting/Live Link (Zoom / Meet / YouTube / FB) <span className="text-red-500">*</span></label>
              <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded focus:border-orange-500" required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : (editingId ? 'Update Class' : 'Save Class')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {liveModules.map((module, mIndex) => {
          const moduleClasses = liveClasses.filter(c => c.moduleId === module.id);
          const isExpanded = expandedModules.includes(module.id);
          return (
            <div id={`module-${module.id}`} key={module.id} className="bg-background rounded-none border-2 border-orange-500/30 hover:border-orange-500/50 overflow-hidden shadow-sm transition-all duration-300">
              <div className="bg-orange-500/15 dark:bg-orange-500/10 border-l-4 border-orange-500 p-2 flex items-center gap-3 transition-colors">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors flex items-center justify-center text-foreground/70"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <GripVertical className="text-foreground/30 cursor-move hidden sm:block" />
                <span className="font-bold text-orange-500 whitespace-nowrap hidden sm:block">Module {mIndex + 1}:</span>
                <input 
                  type="text" value={module.title}
                  onChange={(e) => handleUpdateModule(module.id, e.target.value)}
                  className="flex-1 bg-transparent font-bold focus:outline-none border-b border-transparent focus:border-orange-500/50 py-1 text-foreground"
                />
                <button onClick={() => handleOpenForm(undefined, module.id)} className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition-colors shadow-sm ml-2 whitespace-nowrap flex items-center gap-1">
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Class</span>
                </button>
                <button onClick={() => handleDeleteModule(module.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-1" title="Delete Module">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {moduleClasses.length === 0 ? (
                    <div className="text-center p-4 text-foreground/40 text-sm">No classes added to this module yet.</div>
                  ) : (
                    moduleClasses.map(cls => renderClassCard(cls))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {generalClasses.length > 0 && (
          <div className="bg-background rounded-none border border-foreground/10 overflow-hidden shadow-sm transition-all duration-300">
            <div className="bg-orange-500/15 dark:bg-orange-500/10 border-l-4 border-orange-500 text-foreground p-4 flex items-center gap-3 border-b border-foreground/10">
              <div className="p-1"><Video className="w-5 h-5 text-orange-500" /></div>
              <h3 className="font-bold text-lg">General Classes</h3>
              <span className="text-sm font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full ml-auto">
                {generalClasses.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {generalClasses.map(cls => renderClassCard(cls))}
            </div>
          </div>
        )}

        {liveClasses.length === 0 && liveModules.length === 0 && !isAdding && (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded bg-background/50">
            <Video className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No live classes or modules yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
