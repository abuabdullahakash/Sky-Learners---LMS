"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Clock, Trophy, CheckCircle, ArrowLeft, AlertCircle, CheckSquare } from 'lucide-react';
import { Exam, Question } from '@/app/[locale]/teacher-dashboard/courses/[courseId]/exams/page';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function TakeExamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const examId = params.examId as string;
  const t = useTranslations('Exam');

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [result, setResult] = useState<{ score: number, totalMarks: number, timeTakenSeconds?: number } | null>(null);

  // Exam State
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Check if already completed
        const q = query(
          collection(db, 'completed_exams'),
          where('studentId', '==', user.uid),
          where('courseId', '==', courseId),
          where('examId', '==', examId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setHasCompleted(true);
          const data = snap.docs[0].data();
          if (data.score !== undefined) {
            setResult({ 
              score: data.score, 
              totalMarks: data.totalMarks,
              timeTakenSeconds: data.timeTakenSeconds 
            });
          }
        }

        // Fetch Exam
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courseData = docSnap.data();
          const targetExam = courseData.exams?.find((e: Exam) => e.id === examId);
          if (targetExam && (targetExam.isBuiltIn || targetExam.questions)) {
            if (targetExam.endTime && !targetExam.allowLateSubmission) {
              const now = new Date();
              const end = new Date(targetExam.endTime);
              if (now > end) {
                router.push(`/dashboard/courses/${courseId}/exams`);
                return;
              }
            }
            setExam(targetExam);
            setTimeLeft(targetExam.durationMinutes * 60);
          } else {
            // Not a built-in exam or doesn't exist
            router.push(`/dashboard/courses/${courseId}/exams`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, courseId, examId, router]);

  useEffect(() => {
    if (hasStarted && !hasCompleted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, hasCompleted, timeLeft]); // Note: handleSubmit is not in dependency array to avoid stale closures, we'll use a ref or simple call

  // Fix for stale closure on handleSubmit within setInterval
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!exam || !user || hasCompleted) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    let score = 0;
    exam.questions?.forEach((q) => {
      if (answersRef.current[q.id] === q.correctOptionIndex) {
        score += Number(q.marks);
      }
    });

    const timeTakenSeconds = (exam.durationMinutes * 60) - timeLeft;
    const now = new Date();
    const isLate = !!(exam.endTime && exam.allowLateSubmission && now > new Date(exam.endTime));

    try {
      await addDoc(collection(db, 'completed_exams'), {
        studentId: user.uid,
        courseId,
        examId,
        score,
        totalMarks: exam.totalMarks,
        answers: answersRef.current,
        timeTakenSeconds,
        isLate,
        completedAt: Timestamp.now()
      });

      setResult({ score, totalMarks: exam.totalMarks, timeTakenSeconds });
      setHasCompleted(true);
    } catch (err) {
      console.error("Failed to submit exam", err);
      alert("Failed to submit exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (timeLeft === 0 && exam?.strictTimeLimit) {
      alert("Time is up! Please submit your exam.");
      return;
    }
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTimeTaken = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  if (!exam) return null;

  if (hasCompleted) {
    const now = new Date();
    const hasEnded = exam.endTime ? now > new Date(exam.endTime) : true;
    const canShowResult = !exam.endTime || hasEnded;

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-background border border-foreground/10 rounded-3xl p-8 md:p-12 text-center animate-in zoom-in-95 duration-500 shadow-xl max-w-2xl mx-auto mt-10">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t('examCompleted')}</h2>
        <p className="text-xl text-foreground/60 mb-8">{exam.title}</p>

        <div className="flex justify-center mb-8">
          {result && canShowResult ? (
            <div className="inline-block bg-primary/5 border border-primary/20 rounded-2xl px-12 py-8">
              <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">{t('yourScore')}</p>
              <div className="text-5xl font-black text-primary">
                {result.score} <span className="text-2xl text-primary/50">/ {result.totalMarks}</span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm font-medium text-foreground/70">
                <span>{t('percentage')}: {Math.round((result.score / result.totalMarks) * 100)}%</span>
                {result.timeTakenSeconds !== undefined && (
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {t('timeTaken')}: {formatTimeTaken(result.timeTakenSeconds)}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="inline-block bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 mb-8 max-w-md">
              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <p className="text-foreground/80 font-medium">{t('motivationalMsg')}</p>
              {result?.timeTakenSeconds !== undefined && (
                <p className="text-sm text-foreground/60 mt-4 font-bold">
                  {t('timeTaken')}: {formatTimeTaken(result.timeTakenSeconds)}
                </p>
              )}
            </div>
          )}
        </div>

        <Link 
          href={`/dashboard/courses/${courseId}/exams`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToExams')}
        </Link>
      </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-background border border-foreground/10 rounded-3xl p-8 text-center shadow-xl">
          <h1 className="text-3xl font-extrabold mb-4">{exam.title}</h1>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex flex-col items-center p-4 bg-foreground/5 rounded-2xl min-w-[120px]">
              <Trophy className="w-6 h-6 text-orange-500 mb-2" />
              <span className="font-bold text-lg">{exam.totalMarks}</span>
              <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold">{t('totalMarks')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-foreground/5 rounded-2xl min-w-[120px]">
              <Clock className="w-6 h-6 text-blue-500 mb-2" />
              <span className="font-bold text-lg">{exam.durationMinutes}</span>
              <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold">{t('minutes')}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-foreground/5 rounded-2xl min-w-[120px]">
              <CheckSquare className="w-6 h-6 text-green-500 mb-2" />
              <span className="font-bold text-lg">{exam.questions?.length || 0}</span>
              <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold">{t('questions')}</span>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 text-left mb-8 text-orange-600 dark:text-orange-400">
            <h3 className="font-bold flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5" /> {t('instructions')}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('instruction1')}</li>
              <li>{t('instruction2')}</li>
              {exam.strictTimeLimit === false ? null : <li>{t('instruction3')}</li>}
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <Link href={`/dashboard/courses/${courseId}/exams`} className="px-6 py-3 bg-foreground/5 hover:bg-foreground/10 font-bold rounded-xl transition-colors">
              {t('cancel')}
            </Link>
            <button onClick={() => setHasStarted(true)} className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/30">
              {t('startExamNow')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-foreground/10 p-4 mb-8 flex justify-between items-center rounded-b-2xl shadow-sm">
        <h1 className="font-bold text-lg truncate max-w-[50%]">{exam.title}</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold font-mono text-lg ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-4">
        {exam.questions?.map((q, idx) => (
          <div key={q.id} className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start gap-4 mb-6">
              <h3 className="font-bold text-lg leading-relaxed"><span className="text-primary mr-2">{idx + 1}.</span> {q.text}</h3>
              <span className="shrink-0 bg-foreground/5 px-2 py-1 rounded text-xs font-bold text-foreground/50">{q.marks} Marks</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt, optIdx) => (
                <label 
                  key={optIdx} 
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[q.id] === optIdx ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),0.5)]' : 'border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers[q.id] === optIdx ? 'border-primary' : 'border-foreground/30'}`}>
                    {answers[q.id] === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={optIdx}
                    checked={answers[q.id] === optIdx}
                    onChange={() => handleSelectAnswer(q.id, optIdx)}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-background border border-foreground/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <p className="text-foreground/60 font-medium">Please review your answers before submitting.</p>
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}
