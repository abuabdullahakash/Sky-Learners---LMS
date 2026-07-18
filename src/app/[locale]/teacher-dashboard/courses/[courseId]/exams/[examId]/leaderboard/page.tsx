"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { ArrowLeft, Trophy, Clock, Users, Medal, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type Submission = {
  id: string;
  studentId: string;
  score: number;
  totalMarks: number;
  timeTakenSeconds: number;
  isLate: boolean;
  completedAt: any;
  studentData?: {
    name: string;
    email: string;
    photoURL?: string;
  };
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;
  const examId = params.examId as string;
  const t = useTranslations('Exam');

  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Fetch Course & Exam Details
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists() || courseDoc.data().teacherId !== user.uid) {
          setIsLoading(false);
          return;
        }
        
        const courseData = courseDoc.data();
        const foundExam = courseData.exams?.find((e: any) => e.id === examId);
        if (!foundExam) {
          setIsLoading(false);
          return;
        }
        setExam(foundExam);

        // 2. Fetch Submissions
        const q = query(
          collection(db, 'completed_exams'),
          where('courseId', '==', courseId),
          where('examId', '==', examId)
        );
        const subSnap = await getDocs(q);
        
        const subs: Submission[] = [];
        const studentIds = new Set<string>();
        
        subSnap.forEach((d) => {
          const data = d.data() as Submission;
          subs.push({ ...data, id: d.id });
          if (data.studentId) studentIds.add(data.studentId);
        });

        // 3. Fetch Student Profiles
        const usersMap: Record<string, any> = {};
        const studentIdsArray = Array.from(studentIds);
        
        const chunkArray = (arr: string[], size: number) => 
          Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
        
        const studentChunks = chunkArray(studentIdsArray, 10);
        for (const chunk of studentChunks) {
          await Promise.all(chunk.map(async (sid) => {
            try {
              const uDoc = await getDoc(doc(db, 'users', sid));
              if (uDoc.exists()) {
                usersMap[sid] = uDoc.data();
              }
            } catch (e) {
              console.error(e);
            }
          }));
        }

        // Attach student data and sort
        const enrichedSubs = subs.map(s => ({
          ...s,
          studentData: usersMap[s.studentId] || { name: 'Unknown Student', email: '' }
        }));

        enrichedSubs.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTakenSeconds - b.timeTakenSeconds;
        });

        setSubmissions(enrichedSubs);
      } catch (err) {
        console.error("Error fetching leaderboard", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, courseId, examId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!exam) {
    return <div className="text-center py-12">Exam not found.</div>;
  }

  return (
    <div className="w-full pb-24 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border-b border-foreground/10 px-8 py-10 mb-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href={`/teacher-dashboard/courses/${courseId}/exams`}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToExams')}
          </Link>
          
          <h1 className="text-4xl font-extrabold mb-4">{exam.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-foreground/70 font-medium">
            <span className="flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm"><Users className="w-5 h-5 text-blue-500" /> {submissions.length} {t('participants')}</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm"><Trophy className="w-5 h-5 text-orange-500" /> {exam.totalMarks} Marks</span>
            <span className="flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm"><Clock className="w-5 h-5 text-purple-500" /> {exam.durationMinutes} Minutes</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {submissions.length === 0 ? (
          <div className="text-center p-16 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <Users className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-bold text-xl">{t('noParticipants')}</p>
          </div>
        ) : (
          <div className="bg-background border border-foreground/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-foreground/5 text-foreground/70 uppercase text-xs tracking-wider">
                    <th className="p-5 font-extrabold w-24 text-center">{t('rank')}</th>
                    <th className="p-5 font-extrabold">{t('student')}</th>
                    <th className="p-5 font-extrabold text-center">{t('score')}</th>
                    <th className="p-5 font-extrabold text-center">{t('time')}</th>
                    <th className="p-5 font-extrabold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {submissions.map((sub, index) => {
                    const rank = index + 1;
                    
                    let rowClass = "hover:bg-foreground/[0.02] transition-colors";
                    let rankBadge = <span className="font-bold text-lg text-foreground/60">{rank}</span>;
                    
                    if (rank === 1) {
                      rowClass = "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border-l-4 border-l-yellow-500 shadow-sm relative";
                      rankBadge = <div className="w-10 h-10 mx-auto bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-500/20"><Trophy className="w-5 h-5" /></div>;
                    } else if (rank === 2) {
                      rowClass = "bg-gradient-to-r from-gray-300/20 via-gray-300/5 to-transparent border-l-4 border-l-gray-400";
                      rankBadge = <div className="w-10 h-10 mx-auto bg-gray-400 text-white rounded-full flex items-center justify-center shadow-md ring-4 ring-gray-400/20"><Medal className="w-5 h-5" /></div>;
                    } else if (rank === 3) {
                      rowClass = "bg-gradient-to-r from-amber-700/10 via-amber-700/5 to-transparent border-l-4 border-l-amber-700";
                      rankBadge = <div className="w-10 h-10 mx-auto bg-amber-700 text-white rounded-full flex items-center justify-center shadow-md ring-4 ring-amber-700/20"><Medal className="w-5 h-5" /></div>;
                    }

                    return (
                      <tr key={sub.id} className={rowClass}>
                        <td className="p-4 text-center align-middle">
                          {rankBadge}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-foreground/10 shrink-0 border-2 border-background shadow-sm">
                              {sub.studentData?.photoURL ? (
                                <Image src={sub.studentData.photoURL} alt={sub.studentData?.name || 'Student'} width={48} height={48} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-foreground/50 text-lg uppercase">
                                  {sub.studentData?.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={`font-bold text-base ${rank === 1 ? 'text-yellow-600 dark:text-yellow-500 text-lg' : ''}`}>
                                {sub.studentData?.name || 'Unknown Student'}
                              </p>
                              <p className="text-xs text-foreground/50 font-medium truncate max-w-[200px]">{sub.studentData?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div className="inline-flex items-center justify-center bg-foreground/5 px-4 py-2 rounded-xl">
                            <span className={`font-black text-xl ${rank === 1 ? 'text-yellow-600 dark:text-yellow-500' : 'text-primary'}`}>
                              {sub.score}
                            </span>
                            <span className="text-sm text-foreground/40 font-bold ml-1">/ {sub.totalMarks}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          <div className="inline-flex items-center gap-1.5 text-foreground/70 font-medium bg-foreground/5 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {formatTime(sub.timeTakenSeconds)}
                          </div>
                        </td>
                        <td className="p-4 text-center align-middle">
                          {sub.isLate ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {t('late')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 bg-green-500/10 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
                              On Time
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
