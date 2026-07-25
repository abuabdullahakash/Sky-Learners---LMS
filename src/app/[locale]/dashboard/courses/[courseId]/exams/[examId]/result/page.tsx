"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2, XCircle, Info, HelpCircle, Trophy, Clock, Medal } from 'lucide-react';
import { Exam } from '@/app/[locale]/teacher-dashboard/courses/[courseId]/exams/page';
import Link from 'next/link';
import FlyingBookLoader from '@/components/ui/FlyingBookLoader';

export default function ExamResultPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);
  const [score, setScore] = useState<number>(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number | undefined>(undefined);
  const [isLate, setIsLate] = useState<boolean>(false);
  const [rank, setRank] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const t = useTranslations('Exam');

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

        // Fetch ALL Completed Exams for ranking
        const q = query(
          collection(db, 'completed_exams'),
          where('courseId', '==', courseId),
          where('examId', '==', examId)
        );
        const snap = await getDocs(q);
        
        const myExamDoc = snap.docs.find(d => d.data().studentId === user.uid);

        if (myExamDoc) {
          const data = myExamDoc.data();
          setAnswers(data.answers || {});
          setScore(data.score || 0);
          setTimeTakenSeconds(data.timeTakenSeconds);
          setIsLate(!!data.isLate);

          if (!data.isLate) {
            const validExams = snap.docs
              .map(d => d.data())
              .filter(d => !d.isLate);

            validExams.sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return (a.timeTakenSeconds || 0) - (b.timeTakenSeconds || 0);
            });

            const rankIndex = validExams.findIndex(d => d.studentId === user.uid);
            setRank(rankIndex + 1);
            setTotalParticipants(validExams.length);
          }

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FlyingBookLoader />
      </div>
    );
  }
  if (!exam || !answers) return null;

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

  return (
    <div className="w-full pb-12 sm:pb-24 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative w-full mb-6 sm:mb-8 shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <Trophy className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-8">
          <Link href={`/dashboard/courses/${courseId}/exams`} className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> {t('backToExams')}
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-1.5 sm:mb-2 drop-shadow-sm flex items-center gap-2.5">
            <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400 shrink-0" />
            {t('examResult')}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm font-medium">{exam.title}</p>
        </div>
      </div>

      {/* 2-Column Mobile Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
        
        {/* Score Card */}
        <div className="bg-background border border-foreground/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-orange-500 mb-2" />
          <p className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">{t('finalScore')}</p>
          <div className="text-2xl sm:text-5xl font-black text-orange-500 drop-shadow-sm leading-tight">
            {score} <span className="text-sm sm:text-2xl text-foreground/40 font-bold">/ {exam.totalMarks}</span>
          </div>
          <p className="text-foreground/70 font-bold mt-1.5 bg-foreground/5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs border border-foreground/10">
            {t('percentage')}: {Math.round((score / exam.totalMarks) * 100)}%
          </p>
        </div>

        {/* Time Taken Card */}
        <div className="bg-background border border-foreground/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <Clock className="w-7 h-7 sm:w-10 sm:h-10 text-blue-500 mb-2" />
          <p className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">{t('timeTaken')}</p>
          <div className="text-xl sm:text-4xl font-black text-foreground drop-shadow-sm leading-tight">
            {timeTakenSeconds !== undefined ? formatTimeTaken(timeTakenSeconds) : 'N/A'}
          </div>
        </div>

        {/* Rank Card */}
        <div className="col-span-2 md:col-span-1 bg-background border border-foreground/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <Medal className={`w-7 h-7 sm:w-10 sm:h-10 mb-2 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-purple-500'}`} />
          <p className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1">{t('rank')}</p>
          <div className="text-xl sm:text-4xl font-black text-foreground drop-shadow-sm flex items-baseline justify-center gap-1.5 leading-tight">
            {isLate ? (
              <span className="text-sm sm:text-xl text-red-500 font-bold">{t('unrankedLate')}</span>
            ) : (
              <>
                #{rank} <span className="text-xs sm:text-base text-foreground/40 font-bold">{t('outOf')} {totalParticipants}</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Answer Review Section */}
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-lg sm:text-xl font-bold border-b border-foreground/10 pb-2 text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-500" />
          {t('reviewAnswers')}
        </h2>
        
        {exam.questions?.map((q, idx) => {
          const studentAnswer = answers[q.id];
          const isCorrect = studentAnswer === q.correctOptionIndex;
          const skipped = studentAnswer === undefined;

          return (
            <div key={q.id} className={`bg-background border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm ${isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <div className={`p-4 sm:p-6 ${isCorrect ? 'bg-emerald-500/[0.03]' : 'bg-red-500/[0.03]'}`}>
                <div className="flex justify-between items-start gap-3 mb-4">
                  <h3 className="font-bold text-sm sm:text-lg leading-relaxed flex items-start gap-2.5 text-foreground">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <span><span className="text-foreground/50 mr-1">{idx + 1}.</span> {q.text}</span>
                  </h3>
                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold ${isCorrect ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? `${q.marks} / ${q.marks} ${t('marks')}` : `0 / ${q.marks} ${t('marks')}`}
                    </span>
                    {skipped && <p className="text-[10px] sm:text-xs text-red-500 mt-1 font-semibold text-center">{t('skipped')}</p>}
                  </div>
                </div>

                {q.imageUrl && (
                  <div className="mb-4 sm:mb-6 pl-7 sm:pl-9">
                    <img src={q.imageUrl} alt={`Question ${idx + 1}`} className="max-h-60 sm:max-h-72 w-auto object-contain rounded-xl border border-foreground/10 shadow-sm bg-background" />
                  </div>
                )}

                {q.isMultipleStatement && q.statements && (
                  <div className="mb-4 sm:mb-6 pl-7 sm:pl-10 space-y-1.5 sm:space-y-2">
                    {q.statements.map((stmt, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/80">
                        <span className="font-semibold text-foreground/60 min-w-[20px]">{['i.', 'ii.', 'iii.'][sIdx]}</span>
                        <span className="font-medium">{stmt}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = studentAnswer === optIdx;
                    const isActualCorrect = q.correctOptionIndex === optIdx;
                    
                    let bgClass = "bg-background/60 border-foreground/10 text-foreground/70";
                    let icon = <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-foreground/30 shrink-0" />;

                    if (isActualCorrect) {
                      bgClass = "bg-emerald-500/10 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                      icon = <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                    } else if (isSelected && !isActualCorrect) {
                      bgClass = "bg-background border-2 border-red-500/50 text-red-600 dark:text-red-400 font-semibold";
                      icon = <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />;
                    }

                    return (
                      <div key={optIdx} className={`flex flex-col p-3 sm:p-4 rounded-xl transition-all ${bgClass}`}>
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="shrink-0">{icon}</div>
                          <span className="font-bold text-primary shrink-0 text-xs sm:text-base mr-0.5">{getOptionLabel(optIdx)})</span>
                          <span className="text-xs sm:text-base flex-1">{opt}</span>
                          {isActualCorrect && (
                            <span className="ml-auto text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                              সঠিক উত্তর
                            </span>
                          )}
                          {isSelected && !isActualCorrect && (
                            <span className="ml-auto text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                              আপনার উত্তর (ভুল)
                            </span>
                          )}
                        </div>
                        {q.optionImages?.[optIdx] && (
                          <div className="mt-2 ml-7 sm:ml-8">
                            <img src={q.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="max-h-28 sm:max-h-36 rounded-lg border border-foreground/10 object-contain bg-background" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {q.explanation && (
                <div className="bg-blue-500/5 border-t border-blue-500/10 p-3.5 sm:p-5">
                  <h4 className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm mb-1.5 sm:mb-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" /> {t('explanation')}
                  </h4>
                  <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-6 sm:pl-7">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
