"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Clock, CheckCircle2, Circle, ExternalLink, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Exam } from '@/app/[locale]/teacher-dashboard/courses/[courseId]/exams/page';

type CompletedExamData = {
  score?: number;
  totalMarks?: number;
};

export default function StudentExams() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<Record<string, CompletedExamData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    // Real-time listener for exams
    const unsubscribe = onSnapshot(doc(db, 'courses', courseId), (docSnap) => {
      if (docSnap.exists()) {
        setExams(docSnap.data().exams || []);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  useEffect(() => {
    // Fetch completed exams
    const fetchCompletedExams = async () => {
      if (!user || !courseId) return;
      const q = query(
        collection(db, 'completed_exams'),
        where('studentId', '==', user.uid),
        where('courseId', '==', courseId)
      );
      
      const unsubscribe = onSnapshot(q, (snap) => {
        const completed: Record<string, CompletedExamData> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          completed[data.examId] = {
            score: data.score,
            totalMarks: data.totalMarks
          };
        });
        setCompletedExams(completed);
      });

      return () => unsubscribe();
    };
    fetchCompletedExams();
  }, [user, courseId]);

  const toggleExamCompletion = async (examId: string) => {
    if (!user) return;
    
    const isCompleted = !!completedExams[examId];
    
    try {
      if (isCompleted) {
        // Remove completion (only for external links)
        const q = query(
          collection(db, 'completed_exams'),
          where('studentId', '==', user.uid),
          where('courseId', '==', courseId),
          where('examId', '==', examId)
        );
        const snap = await getDocs(q);
        snap.docs.forEach(async (d) => {
          await deleteDoc(doc(db, 'completed_exams', d.id));
        });
      } else {
        // Add completion (only for external links)
        await addDoc(collection(db, 'completed_exams'), {
          studentId: user.uid,
          courseId: courseId,
          examId: examId,
          completedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error toggling exam completion:", err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading exams...</div>;
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-20 max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Exams & Quizzes</h2>
        <p className="text-gray-600 dark:text-foreground/70 text-lg mb-8">
          There are no active exams or quizzes for this course at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Exams & Quizzes</h2>
        <p className="text-gray-600 dark:text-foreground/70">
          Take your exams and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam, idx) => {
          const completionData = completedExams[exam.id];
          const isCompleted = !!completionData;
          const isBuiltIn = exam.isBuiltIn || exam.questions;
          
          return (
            <div 
              key={exam.id} 
              className="bg-background border border-foreground/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-primary/30 hover:shadow-md animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  {exam.title}
                  {isCompleted && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Completed</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-1.5 bg-foreground/5 px-2 py-1 rounded-md">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span>{exam.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-foreground/5 px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{exam.durationMinutes} Minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {isBuiltIn ? (
                  isCompleted ? (
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl">
                      <div className="flex flex-col items-end">
                        <span className="text-xs uppercase font-bold opacity-70">Your Score</span>
                        <span className="font-black text-lg leading-none">{completionData.score} <span className="text-sm opacity-50">/ {completionData.totalMarks}</span></span>
                      </div>
                      <CheckCircle2 className="w-8 h-8 opacity-50" />
                    </div>
                  ) : (
                    <Link 
                      href={`/dashboard/courses/${courseId}/exams/${exam.id}`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-primary/30"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Quiz
                    </Link>
                  )
                ) : (
                  <>
                    <a 
                      href={exam.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 text-primary font-medium rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Take Exam
                    </a>
                    
                    <button 
                      onClick={() => toggleExamCompletion(exam.id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 font-medium rounded-xl border transition-all ${
                        isCompleted 
                          ? 'bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20 hover:border-green-500/30' 
                          : 'bg-background border-foreground/20 text-foreground/70 hover:border-foreground/40 hover:bg-foreground/5'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" />
                          Mark as Done
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
