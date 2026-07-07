"use client";

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BookOpen, Users, Clock, CheckCircle2, ArrowLeft, Star, PlayCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <BookOpen className="w-20 h-20 text-foreground/20 mb-4" />
        <h1 className="text-3xl font-bold mb-4">কোর্সটি খুঁজে পাওয়া যায়নি</h1>
        <Link href="/courses" className="text-primary font-bold hover:underline">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-foreground/5 pt-28 pb-12 md:pt-36 md:pb-20 border-b border-foreground/10 relative overflow-hidden">
        {course.thumbnailUrl && (
          <div className="absolute inset-0 opacity-10 blur-xl">
            <img src={course.thumbnailUrl} alt="background blur" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link href="/courses" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground font-semibold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold mb-6 border border-primary/20 shadow-sm uppercase tracking-wide">
                {course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : course.category}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 mb-8 leading-relaxed max-w-2xl">
                {course.subtitle || 'এই কোর্সে আপনি গুরুত্বপূর্ণ সব টপিক শিখতে পারবেন এবং পরীক্ষায় ভালো ফলাফল করতে পারবেন।'}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground/50 text-xs uppercase">শিক্ষক</p>
                    <p>{course.coachingName || 'Instructor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-foreground/50 text-xs uppercase">মেয়াদ</p>
                    <p>Life-time Access</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl transform rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden border-4 border-background shadow-2xl bg-foreground/5 aspect-video flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-20 h-20 text-foreground/20" />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-6">কোর্সের বিস্তারিত বিবরণ</h2>
              <div className="bg-foreground/5 p-6 rounded-2xl border border-foreground/10 text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                {course.detailedDescription || `যে সকল শিক্ষার্থীরা ${course.category === 'intermediate' ? 'HSC' : course.category === 'primary' ? 'Primary' : course.category === 'high_school' ? 'SSC' : course.category} তে অধ্যয়নরত আছেন এবং নিজেদের প্রস্তুতিকে আরও এক ধাপ এগিয়ে নিতে চান, তাদের জন্য এই কোর্সটি বিশেষভাবে ডিজাইন করা হয়েছে।`}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6">কোর্সে যা যা থাকছে</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  course.totalVideoLessons > 0 ? `${course.totalVideoLessons} টি রেকর্ডেড ভিডিও ক্লাস` : null,
                  course.totalLiveClasses > 0 ? `${course.totalLiveClasses} টি লাইভ ক্লাস সেশন` : null,
                  course.totalPdfs > 0 ? `${course.totalPdfs} টি ক্লাস নোট ও পিডিএফ` : null,
                  course.totalExams > 0 ? `${course.totalExams} টি অধ্যায়ভিত্তিক পরীক্ষা (MCQ)` : null,
                  course.hasDoubtSolving ? '24/7 ডাউট সলভিং সাপোর্ট' : null,
                ].filter(Boolean).length > 0 ? (
                  [
                    course.totalVideoLessons > 0 ? `${course.totalVideoLessons} টি রেকর্ডেড ভিডিও ক্লাস` : null,
                    course.totalLiveClasses > 0 ? `${course.totalLiveClasses} টি লাইভ ক্লাস সেশন` : null,
                    course.totalPdfs > 0 ? `${course.totalPdfs} টি ক্লাস নোট ও পিডিএফ` : null,
                    course.totalExams > 0 ? `${course.totalExams} টি অধ্যায়ভিত্তিক পরীক্ষা (MCQ)` : null,
                    course.hasDoubtSolving ? '24/7 ডাউট সলভিং সাপোর্ট' : null,
                  ].filter(Boolean).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-background border border-foreground/10 rounded-2xl shadow-sm hover:border-primary/30 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                      <span className="font-semibold text-foreground/90">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 p-4 text-foreground/50 border border-foreground/10 rounded-2xl bg-background text-sm">
                    এই কোর্সের বিস্তারিত ফিচার খুব শীঘ্রই যুক্ত করা হবে।
                  </div>
                )}
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-background border border-foreground/10 rounded-3xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <p className="text-foreground/50 font-bold uppercase tracking-wider mb-2">কোর্স ফি</p>
                <div className="text-5xl font-extrabold text-primary">
                  ৳{course.price}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">মডিউল সংখ্যা</span>
                  <span>{course.modules?.length || 0} টি</span>
                </li>
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">কোর্স অ্যাক্সেস</span>
                  <span>লাইফ-টাইম</span>
                </li>
                <li className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-foreground/60">সার্টিফিকেট</span>
                  <span>হ্যাঁ</span>
                </li>
              </ul>

              <button 
                onClick={() => router.push(`/courses/${course.id}/checkout`)}
                className="w-full py-4 bg-primary text-primary-foreground text-xl font-bold rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                কোর্সে যুক্ত হোন
              </button>
              
              <p className="text-center text-xs font-semibold text-foreground/40 mt-4">
                ১০০% নিরাপদ পেমেন্ট (বিকাশ/নগদ/রকেট)
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
