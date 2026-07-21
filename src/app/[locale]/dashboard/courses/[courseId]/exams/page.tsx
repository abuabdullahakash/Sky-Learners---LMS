"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Clock, CheckCircle2, Circle, ExternalLink, PlayCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Exam } from '@/app/[locale]/teacher-dashboard/courses/[courseId]/exams/page';

type CompletedExamData = {
  score?: number;
  totalMarks?: number;
  timeTakenSeconds?: number;
  isLate?: boolean;
};

export default function StudentExams() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  const t = useTranslations('Exam');
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<Record<string, CompletedExamData>>({});
  const [totalExamsSet, setTotalExamsSet] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    // Real-time listener for exams
    const unsubscribe = onSnapshot(doc(db, 'courses', courseId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExams(data.exams || []);
        setTotalExamsSet(data.totalExams || 0);
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
            totalMarks: data.totalMarks,
            timeTakenSeconds: data.timeTakenSeconds,
            isLate: !!data.isLate
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

  const formatTimeTaken = (seconds: number | undefined) => {
    if (seconds === undefined) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">{t('loading')}</div>;
  }

  return (
    <div className="w-full max-w-7xl space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <FileText className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Student Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">{t('examsAndQuizzes')}</h1>
            <p className="text-gray-300 text-sm font-medium">{t('takeYourExams')}</p>
          </div>
          {totalExamsSet > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-sm font-bold shadow-sm shrink-0">
              <span className="text-white/70">Total Exams:</span>
              <span className="text-white">{exams.length} / {totalExamsSet}</span>
            </div>
          )}
        </div>
      </div>

      {exams.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
          <p className="text-foreground/50 font-medium text-lg">{t('noExams')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {exams.filter(e => e.isPublished !== false).map((exam, idx) => {
          const completionData = completedExams[exam.id];
          const isCompleted = !!completionData;
          const isBuiltIn = exam.isBuiltIn || exam.questions;
          
          const now = new Date();
          const hasEnded = exam.endTime ? now > new Date(exam.endTime) : false;
          const canShowResult = isCompleted && (!exam.endTime || hasEnded);
          const canTakeExam = !isCompleted && (!hasEnded || exam.allowLateSubmission);
          
          return (
            <div 
              key={exam.id} 
              className="bg-background border border-foreground/10 rounded p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-primary/30 hover:shadow-md animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  {exam.title}
                  {isCompleted && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">{t('completed')}</span>}
                  {completionData?.isLate && <span className="text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">{t('lateBadge')}</span>}
                  {isCompleted && completionData?.timeTakenSeconds !== undefined && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTimeTaken(completionData.timeTakenSeconds)}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-1.5 bg-foreground/5 px-2 py-1 rounded-md">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span>{exam.totalMarks} {t('marks')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-foreground/5 px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{exam.durationMinutes} {t('minutes')}</span>
                  </div>
                  {exam.endTime && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-md text-red-600 font-bold dark:text-red-400">
                      <Clock className="w-4 h-4" />
                      <span>{hasEnded ? t('deadlineOver') : `${t('deadline')}: ${new Date(exam.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {isBuiltIn ? (
                  <>
                    {isCompleted && canShowResult && (
                      <div className="flex items-center justify-between gap-3 px-5 h-12 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl min-w-[140px]">
                        <div className="flex flex-col items-start justify-center">
                          <span className="text-[10px] uppercase font-bold opacity-70 leading-none mb-1">{t('yourScore')}</span>
                          <span className="font-black text-xl leading-none">{completionData.score} <span className="text-sm opacity-50">/ {completionData.totalMarks}</span></span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 opacity-70 shrink-0" />
                      </div>
                    )}
                    {isCompleted && !canShowResult && (
                      <div className="flex items-center gap-3 px-5 h-12 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{t('submitted')}</span>
                      </div>
                    )}
                    {canShowResult && (
                      <Link 
                        href={`/dashboard/courses/${courseId}/exams/${exam.id}/result`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-500/20 transition-colors font-bold rounded-xl"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('seeResult')}
                      </Link>
                    )}
                    {canTakeExam && (
                      <Link 
                        href={`/dashboard/courses/${courseId}/exams/${exam.id}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-primary/30"
                      >
                        <PlayCircle className="w-5 h-5" />
                        {t('startQuiz')}
                      </Link>
                    )}
                    {!canTakeExam && !isCompleted && (
                      <div className="px-5 h-12 bg-foreground/5 text-foreground/50 font-bold rounded-xl flex items-center gap-2 border border-foreground/10">
                        <Clock className="w-4 h-4" />
                        {t('examEnded')}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {!isCompleted && (
                      <a 
                        href={exam.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-primary/30"
                      >
                        <ExternalLink className="w-5 h-5" />
                        {t('startQuiz')}
                      </a>
                    )}
                    
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
