"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, CheckCircle2, XCircle, Info, HelpCircle } from 'lucide-react';
import { Exam } from '@/app/[locale]/teacher-dashboard/courses/[courseId]/exams/page';
import Link from 'next/link';

export default function ExamResultPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch Exam to ensure it exists and get questions
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        let targetExam: Exam | null = null;
        
        if (docSnap.exists()) {
          const courseData = docSnap.data();
          targetExam = courseData.exams?.find((e: Exam) => e.id === examId);
          if (!targetExam || (!targetExam.isBuiltIn && !targetExam.questions)) {
            router.push(`/dashboard/courses/${courseId}/exams`);
            return;
          }
          setExam(targetExam);
        } else {
          router.push(`/dashboard/courses`);
          return;
        }

        // Fetch Completed Exam for answers
        const q = query(
          collection(db, 'completed_exams'),
          where('studentId', '==', user.uid),
          where('courseId', '==', courseId),
          where('examId', '==', examId)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setAnswers(data.answers || {});
          setScore(data.score || 0);

          // Additional security: Only show result if End Time has passed (or doesn't exist)
          if (targetExam.endTime) {
            const now = new Date();
            const end = new Date(targetExam.endTime);
            if (now < end) {
              // End time hasn't passed yet.
              router.push(`/dashboard/courses/${courseId}/exams`);
              return;
            }
          }
        } else {
          // Hasn't completed it yet
          router.push(`/dashboard/courses/${courseId}/exams`);
          return;
        }
      } catch (err) {
        console.error("Failed to load result", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, courseId, examId, router]);

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading Result...</div>;
  if (!exam || !answers) return null;

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href={`/dashboard/courses/${courseId}/exams`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Exam Result</h1>
        <p className="text-foreground/70">{exam.title}</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 mb-8 text-center shadow-sm">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Final Score</p>
        <div className="text-6xl font-black text-primary mb-2">
          {score} <span className="text-3xl text-primary/50">/ {exam.totalMarks}</span>
        </div>
        <p className="text-foreground/60 font-medium">Percentage: {Math.round((score / exam.totalMarks) * 100)}%</p>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-foreground/10 pb-2">Review Answers</h2>
        
        {exam.questions?.map((q, idx) => {
          const studentAnswer = answers[q.id];
          const isCorrect = studentAnswer === q.correctOptionIndex;
          const skipped = studentAnswer === undefined;

          return (
            <div key={q.id} className={`border rounded-2xl overflow-hidden shadow-sm ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className={`p-6 ${isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <div className="flex justify-between items-start gap-4 mb-6">
                  <h3 className="font-bold text-lg leading-relaxed flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <span><span className="text-foreground/50 mr-1">{idx + 1}.</span> {q.text}</span>
                  </h3>
                  <div className="text-right shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {isCorrect ? `${q.marks} / ${q.marks} Marks` : `0 / ${q.marks} Marks`}
                    </span>
                    {skipped && <p className="text-xs text-red-500 mt-1 font-medium text-center">Skipped</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = studentAnswer === optIdx;
                    const isActualCorrect = q.correctOptionIndex === optIdx;
                    
                    let bgClass = "bg-background border-foreground/10";
                    let icon = <div className="w-5 h-5 rounded-full border-2 border-foreground/20" />;

                    if (isActualCorrect) {
                      bgClass = "bg-green-500/10 border-green-500 border-2";
                      icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                    } else if (isSelected && !isActualCorrect) {
                      bgClass = "bg-red-500/10 border-red-500 border-2";
                      icon = <XCircle className="w-5 h-5 text-red-600" />;
                    } else {
                      bgClass = "bg-background/50 border border-foreground/10 opacity-70";
                    }

                    return (
                      <div key={optIdx} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${bgClass}`}>
                        <div className="shrink-0">{icon}</div>
                        <span className={`font-medium ${isActualCorrect ? 'text-green-700 dark:text-green-400' : isSelected ? 'text-red-700 dark:text-red-400' : 'text-foreground/70'}`}>{opt}</span>
                        {isSelected && <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-50">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {q.explanation && (
                <div className="bg-blue-500/5 border-t border-blue-500/10 p-5">
                  <h4 className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                    <Info className="w-5 h-5" /> Explanation
                  </h4>
                  <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap pl-7">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
