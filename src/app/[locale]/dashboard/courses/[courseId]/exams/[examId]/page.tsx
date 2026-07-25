"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Clock, Trophy, CheckCircle, ArrowLeft, AlertCircle, CheckSquare, FileText, Send } from 'lucide-react';
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
  }, [hasStarted, hasCompleted, timeLeft]);

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

  const getOptionLabel = (idx: number) => {
    const bnLabels = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
    return bnLabels[idx] || String.fromCharCode(65 + idx);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-foreground/70 font-medium">Loading...</div>;

  if (!exam) return null;

  if (hasCompleted) {
    const now = new Date();
    const hasEnded = exam.endTime ? now > new Date(exam.endTime) : true;
    const canShowResult = !exam.endTime || hasEnded;

    return (
      <div className="max-w-3xl mx-auto py-4 sm:py-10 px-2.5 sm:px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-background border border-foreground/15 rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-center shadow-xl max-w-2xl mx-auto mt-2 sm:mt-6 relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">{t('examCompleted')}</h2>
          <p className="text-sm sm:text-lg text-foreground/70 mb-6 font-medium">{exam.title}</p>

          <div className="mb-6">
            {result && canShowResult ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-8 max-w-md mx-auto relative shadow-sm">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{t('yourScore')}</p>
                <div className="text-4xl sm:text-5xl font-black text-primary flex items-baseline justify-center gap-1">
                  {result.score} <span className="text-xl sm:text-2xl text-foreground/40 font-bold">/ {result.totalMarks}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-foreground/10 grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-foreground/80">
                  <div className="bg-background/80 p-2.5 rounded-xl border border-foreground/10 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-foreground/50 uppercase font-bold">{t('percentage')}</span>
                    <span className="text-sm sm:text-base font-extrabold text-foreground">{Math.round((result.score / result.totalMarks) * 100)}%</span>
                  </div>
                  {result.timeTakenSeconds !== undefined && (
                    <div className="bg-background/80 p-2.5 rounded-xl border border-foreground/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-foreground/50 uppercase font-bold">{t('timeTaken')}</span>
                      <span className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {formatTimeTaken(result.timeTakenSeconds)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6 max-w-md mx-auto text-left">
                <AlertCircle className="w-7 h-7 text-amber-500 mx-auto mb-2" />
                <p className="text-foreground/80 font-medium text-xs sm:text-sm text-center">{t('motivationalMsg')}</p>
                {result?.timeTakenSeconds !== undefined && (
                  <p className="text-xs text-foreground/60 mt-3 font-bold flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {t('timeTaken')}: {formatTimeTaken(result.timeTakenSeconds)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Link 
              href={`/dashboard/courses/${courseId}/exams`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl transition-colors shadow-md hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToExams')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto py-4 sm:py-10 px-2.5 sm:px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-background border border-foreground/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>পরীক্ষার বিস্তারিত / Exam Instructions</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold mb-5 text-foreground leading-snug">{exam.title}</h1>
          
          {/* 2-Column Mobile Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl transition-all hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl text-foreground">{exam.totalMarks}</span>
              <span className="text-[11px] sm:text-xs text-foreground/60 uppercase tracking-wider font-bold mt-0.5">{t('totalMarks')}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3.5 sm:p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl transition-all hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl text-foreground">{exam.durationMinutes}</span>
              <span className="text-[11px] sm:text-xs text-foreground/60 uppercase tracking-wider font-bold mt-0.5">{t('minutes')}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3.5 sm:p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl transition-all hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold text-xl sm:text-2xl text-foreground">{exam.questions?.length || 0}</span>
              <span className="text-[11px] sm:text-xs text-foreground/60 uppercase tracking-wider font-bold mt-0.5">{t('questions')}</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-6 text-left mb-6 sm:mb-8 text-amber-700 dark:text-amber-300">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-sm sm:text-base"><AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> {t('instructions')}</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm font-medium">
              <li>{t('instruction1')}</li>
              <li>{t('instruction2')}</li>
              {exam.strictTimeLimit === false ? null : <li>{t('instruction3')}</li>}
            </ul>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href={`/dashboard/courses/${courseId}/exams`} className="w-full sm:w-auto px-6 py-3 bg-foreground/5 hover:bg-foreground/10 font-bold rounded-xl transition-colors text-foreground text-center">
              {t('cancel')}
            </Link>
            <button onClick={() => setHasStarted(true)} className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm sm:text-base">
              {t('startExamNow')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-6 sm:pb-12 px-2 sm:px-4 animate-in fade-in duration-500">
      {/* Offline Board Exam Header Banner */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b-2 border-primary/20 p-3 sm:p-4 mb-4 sm:mb-6 shadow-md rounded-b-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center shrink-0 text-primary font-serif font-extrabold text-lg">
              📜
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                  পরীক্ষা / Exam Paper
                </span>
              </div>
              <h1 className="font-extrabold text-sm sm:text-lg text-foreground truncate mt-0.5">{exam.title}</h1>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold font-mono text-sm sm:text-lg shrink-0 border ${timeLeft < 60 ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Exam Paper Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {exam.questions?.map((q, idx) => (
          <div key={q.id} className="bg-card border border-border/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-sm relative overflow-hidden">
            {/* Paper Corner Strip */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/60" />

            <div className="flex justify-between items-start gap-3 mb-3.5 pl-1">
              <h3 className="font-bold text-base sm:text-lg leading-relaxed text-foreground flex items-start gap-2">
                <span className="text-primary font-extrabold shrink-0">{idx + 1}.</span>
                <span>{q.text}</span>
              </h3>
              <span className="shrink-0 bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-lg text-xs font-bold text-foreground/70">{q.marks} {t('marks')}</span>
            </div>

            {q.imageUrl && (
              <div className="mb-4 sm:mb-6 pl-1">
                <img src={q.imageUrl} alt={`Question ${idx + 1}`} className="max-h-72 w-auto object-contain rounded-xl border border-foreground/10 shadow-sm bg-background" />
              </div>
            )}
            
            {q.isMultipleStatement && q.statements && (
              <div className="mb-4 sm:mb-6 pl-3 sm:pl-6 space-y-1.5 sm:space-y-2 border-l-2 border-primary/20">
                {q.statements.map((stmt, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/80">
                    <span className="font-semibold text-foreground/60 min-w-[20px]">{['i.', 'ii.', 'iii.'][sIdx]}</span>
                    <span className="font-medium">{stmt}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[q.id] === optIdx;
                return (
                  <label 
                    key={optIdx} 
                    className={`flex flex-col p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(var(--primary),0.5)]' : 'border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-foreground/30'}`}>
                        {isSelected && <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-primary" />}
                      </div>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => handleSelectAnswer(q.id, optIdx)}
                        className="sr-only"
                      />
                      <span className="font-bold text-primary shrink-0 min-w-[20px] text-sm sm:text-base">
                        {getOptionLabel(optIdx)})
                      </span>
                      <span className="font-medium text-xs sm:text-base text-foreground leading-snug">{opt}</span>
                    </div>
                    {q.optionImages?.[optIdx] && (
                      <div className="mt-2 ml-7 sm:ml-8">
                        <img src={q.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="max-h-36 rounded-lg border border-foreground/10 object-contain bg-background" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Submit Card */}
        <div className="bg-card border border-border/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-sm mt-6">
          <p className="text-foreground/70 font-medium text-xs sm:text-sm text-center sm:text-left">
            {t('reviewBeforeSubmit')}
          </p>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-sm sm:text-base shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? t('submitting') : t('submitExam')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
