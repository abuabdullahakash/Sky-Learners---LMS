"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseIssuesPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    if (!user || !courseId) return;
    try {
      const q = query(
        collection(db, 'lesson_issues'),
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const issuesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(issuesData);
    } catch (error) {
      console.error("Error fetching issues:", error);
      // Fallback if index is not ready yet for orderBy
      try {
        const q2 = query(collection(db, 'lesson_issues'), where('courseId', '==', courseId));
        const querySnapshot = await getDocs(q2);
        let issuesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        issuesData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setIssues(issuesData);
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

  const handleMarkAsSolved = async (issueId: string) => {
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

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Issues & Reports</h1>
          <p className="text-foreground/60 text-sm mt-1">Manage and resolve issues reported by students for this course.</p>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="bg-foreground/5 rounded-3xl p-12 text-center border border-foreground/10">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No issues reported!</h3>
          <p className="text-foreground/60">Your students haven't reported any issues with the lessons.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {issues.map(issue => (
            <div key={issue.id} className={`bg-background border rounded-2xl p-5 md:p-6 transition-all ${issue.status === 'solved' ? 'border-green-500/30' : 'border-orange-500/30 shadow-md shadow-orange-500/5'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Left side details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${issue.status === 'solved' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500 flex items-center gap-1.5'}`}>
                          {issue.status === 'solved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {issue.status}
                        </span>
                        <span className="text-xs text-foreground/50">{new Date(issue.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mt-2">{issue.subject}</h3>
                    </div>
                  </div>

                  <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10">
                    <p className="text-sm font-medium text-foreground mb-1">Lesson: {issue.lessonTitle}</p>
                    <p className="text-sm text-foreground/70 whitespace-pre-wrap">{issue.note}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-foreground/60">
                    <span className="font-medium text-foreground">Reported by:</span>
                    <span>{issue.studentName || 'Unknown Student'}</span>
                  </div>
                </div>

                {/* Right side actions and screenshot */}
                <div className="flex flex-col gap-4 md:w-64 shrink-0">
                  {issue.status === 'open' && (
                    <button 
                      onClick={() => handleMarkAsSolved(issue.id)}
                      className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Solved
                    </button>
                  )}
                  
                  {issue.screenshotUrl && (
                    <div className="border border-foreground/10 rounded-xl overflow-hidden group relative">
                      <img src={issue.screenshotUrl} alt="Screenshot" className="w-full h-auto aspect-video object-cover" />
                      <a 
                        href={issue.screenshotUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3" /> View Full Image
                        </span>
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
