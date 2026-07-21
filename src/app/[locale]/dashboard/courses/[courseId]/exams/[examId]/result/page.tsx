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

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading Result...</div>;
  if (!exam || !answers) return null;

  const formatTimeTaken = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href={`/dashboard/courses/${courseId}/exams`} className="inline-flex items-center gap-2 text-primary hover:underline font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('backToExams')}
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">{t('examResult')}</h1>
        <p className="text-foreground/70">{exam.title}</p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-3xl p-8 md:p-12 mb-12 shadow-lg relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8 text-center">
          
          <div className="flex flex-col items-center">
            <Trophy className="w-10 h-10 text-orange-500 mb-3" />
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-1">{t('finalScore')}</p>
            <div className="text-5xl md:text-6xl font-black text-primary drop-shadow-sm">
              {score} <span className="text-3xl text-primary/50">/ {exam.totalMarks}</span>
            </div>
            <p className="text-foreground/60 font-bold mt-2 bg-background/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-foreground/5">
              {t('percentage')}: {Math.round((score / exam.totalMarks) * 100)}%
            </p>
          </div>

          <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="block md:hidden w-32 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4" />

          <div className="flex flex-col items-center">
            <Clock className="w-10 h-10 text-blue-500 mb-3" />
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-1">{t('timeTaken')}</p>
            <div className="text-4xl md:text-5xl font-black text-foreground drop-shadow-sm">
              {timeTakenSeconds !== undefined ? formatTimeTaken(timeTakenSeconds) : 'N/A'}
            </div>
          </div>

          <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="block md:hidden w-32 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4" />

          <div className="flex flex-col items-center">
            <Medal className={`w-10 h-10 mb-3 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-purple-500'}`} />
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-1">{t('rank')}</p>
            <div className="text-4xl md:text-5xl font-black text-foreground drop-shadow-sm flex items-baseline gap-2">
              {isLate ? (
                <span className="text-xl md:text-2xl text-red-500">{t('unrankedLate')}</span>
              ) : (
                <>
                  #{rank} <span className="text-lg text-foreground/40 font-bold tracking-normal">{t('outOf')} {totalParticipants}</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-foreground/10 pb-2">{t('reviewAnswers')}</h2>
        
        {exam.questions?.map((q, idx) => {
          const studentAnswer = answers[q.id];
          const isCorrect = studentAnswer === q.correctOptionIndex;
          const skipped = studentAnswer === undefined;

          return (
            <div key={q.id} className={`border rounded-2xl overflow-hidden shadow-sm ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className={`p-6 ${isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
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
                      {isCorrect ? `${q.marks} / ${q.marks} ${t('marks')}` : `0 / ${q.marks} ${t('marks')}`}
                    </span>
                    {skipped && <p className="text-xs text-red-500 mt-1 font-medium text-center">{t('skipped')}</p>}
                  </div>
                </div>

                {q.imageUrl && (
                  <div className="mb-6 pl-9">
                    <img src={q.imageUrl} alt={`Question ${idx + 1}`} className="max-h-72 w-auto object-contain rounded-xl border border-foreground/10 shadow-sm bg-background" />
                  </div>
                )}

                {q.isMultipleStatement && q.statements && (
                  <div className="mb-6 pl-10 space-y-2">
                    {q.statements.map((stmt, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 text-foreground/80">
                        <span className="font-semibold text-foreground/60 min-w-[24px]">{['i.', 'ii.', 'iii.'][sIdx]}</span>
                        <span className="font-medium">{stmt}</span>
                      </div>
                    ))}
                  </div>
                )}

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
                      <div key={optIdx} className={`flex flex-col p-4 rounded-xl transition-all ${bgClass}`}>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">{icon}</div>
                          <span className={`font-medium ${isActualCorrect ? 'text-green-700 dark:text-green-400' : isSelected ? 'text-red-700 dark:text-red-400' : 'text-foreground/70'}`}>{opt}</span>
                          {isSelected && <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-50">{t('yourAnswer')}</span>}
                        </div>
                        {q.optionImages?.[optIdx] && (
                          <div className="mt-2 ml-8">
                            <img src={q.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="max-h-36 rounded-lg border border-foreground/10 object-contain bg-background" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {q.explanation && (
                <div className="bg-blue-500/5 border-t border-blue-500/10 p-5">
                  <h4 className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                    <Info className="w-5 h-5" /> {t('explanation')}
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
