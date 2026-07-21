"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, Search, ChevronDown, ChevronUp, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseIssuesPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'solved'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchIssues = async () => {
    if (!user || !courseId) return;
    try {
      const q = query(
        collection(db, 'lesson_issues'),
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const validIssues = [];
      const now = new Date().getTime();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      for (let issueDoc of querySnapshot.docs) {
        const data = issueDoc.data();
        if (data.status === 'solved') {
           const age = now - new Date(data.createdAt).getTime();
           if (age > ONE_DAY) {
             try {
                await deleteDoc(issueDoc.ref);
                continue; // Skip adding to validIssues
             } catch (e) {
                console.error("Failed to auto-delete old issue", e);
             }
           }
        }
        validIssues.push({
          id: issueDoc.id,
          ...data
        });
      }
      setIssues(validIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      // Fallback if index is not ready yet for orderBy
      try {
        const q2 = query(collection(db, 'lesson_issues'), where('courseId', '==', courseId));
        const querySnapshot = await getDocs(q2);
        
        const validIssues = [];
        const now = new Date().getTime();
        const ONE_DAY = 24 * 60 * 60 * 1000;
  
        for (let issueDoc of querySnapshot.docs) {
          const data = issueDoc.data();
          if (data.status === 'solved') {
             const age = now - new Date(data.createdAt).getTime();
             if (age > ONE_DAY) {
               try {
                  await deleteDoc(issueDoc.ref);
                  continue; 
               } catch (e) {
                  console.error("Failed to auto-delete old issue", e);
               }
             }
          }
          validIssues.push({
            id: issueDoc.id,
            ...data
          });
        }
        validIssues.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setIssues(validIssues);
      } catch (e) {
        console.error("Fallback error", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [user, courseId]);

  const handleMarkAsSolved = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'lesson_issues', issueId), {
        status: 'solved'
      });
      toast.success("Issue marked as solved");
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: 'solved' } : issue
      ));
    } catch (error) {
      console.error("Error updating issue status", error);
      toast.error("Failed to update status");
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter;
    const matchesSearch = 
      (issue.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.lessonTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">

      {/* Hero Section */}
      <div className="relative w-full mb-4 shadow-lg">
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 bg-[#111827]"/>
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
          <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Teacher Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Student Issues & Reports</h1>
          <p className="text-gray-300 text-sm font-medium">Manage and resolve issues reported by students. Solved issues auto-delete after 24 hours.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search by student, lesson or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
          />
        </div>

        <div className="flex bg-foreground/5 p-1 rounded-xl w-full sm:w-auto">
          {['all', 'open', 'solved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl p-12 text-center border border-foreground/10">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No issues found!</h3>
          <p className="text-foreground/60">
            {searchTerm ? "No reports match your search." : "Your students haven't reported any issues."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map(issue => {
            const isExpanded = expandedId === issue.id;
            return (
              <div 
                key={issue.id} 
                className={`bg-background border rounded-2xl transition-all overflow-hidden cursor-pointer ${
                  issue.status === 'solved' 
                    ? 'border-green-500/20 hover:border-green-500/40' 
                    : 'border-orange-500/30 hover:border-orange-500/50 shadow-sm'
                }`}
                onClick={() => setExpandedId(isExpanded ? null : issue.id)}
              >
                {/* Accordion Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 overflow-hidden shrink-0 border border-foreground/10">
                      {issue.studentPhotoUrl ? (
                        <img src={issue.studentPhotoUrl} alt={issue.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/50 font-bold text-lg">
                          {issue.studentName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1 w-fit ${
                          issue.status === 'solved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}>
                          {issue.status === 'solved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {issue.status}
                        </span>
                        <span className="text-xs text-foreground/40 whitespace-nowrap hidden sm:inline-block">
                          {new Date(issue.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground truncate">{issue.subject}</h3>
                      <p className="text-xs text-foreground/60 truncate">
                        <span className="font-medium text-foreground/80">{issue.studentName}</span> reported on <span className="font-medium">{issue.lessonTitle}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {issue.status === 'open' && (
                      <button 
                        onClick={(e) => handleMarkAsSolved(issue.id, e)}
                        className="hidden sm:flex px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all items-center gap-2 shadow-sm shadow-green-500/20 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Solved
                      </button>
                    )}
                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:bg-foreground/10 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                <div 
                  className={`border-t border-foreground/5 bg-foreground/[0.02] transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[800px] opacity-100 p-4 sm:p-5' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground/80 mb-2 uppercase tracking-wide">Detailed Note</h4>
                      <div className="bg-background border border-foreground/10 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {issue.note}
                      </div>

                      {issue.status === 'open' && (
                        <button 
                          onClick={(e) => handleMarkAsSolved(issue.id, e)}
                          className="sm:hidden mt-4 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm shadow-green-500/20 active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Solved
                        </button>
                      )}
                    </div>
                    
                    {issue.screenshotUrl && (
                      <div className="md:w-64 shrink-0">
                        <h4 className="text-sm font-bold text-foreground/80 mb-2 uppercase tracking-wide">Screenshot</h4>
                        <div className="border border-foreground/10 rounded-xl overflow-hidden group relative bg-background p-1">
                          <img src={issue.screenshotUrl} alt="Screenshot" className="w-full h-auto aspect-video object-cover rounded-lg" />
                          <a 
                            href={issue.screenshotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg m-1 backdrop-blur-sm"
                          >
                            <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform">
                              <ImageIcon className="w-3 h-3" /> View Full Image
                            </span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
