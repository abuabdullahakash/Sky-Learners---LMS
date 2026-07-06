"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Users, DollarSign, PlayCircle, BookOpen } from 'lucide-react';

export default function CourseOverviewPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          setCourse(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [user, courseId]);

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!course) return null;

  const stats = [
    { label: 'Total Students', value: '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Revenue', value: '৳0', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Modules', value: course.modules?.length || 0, icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Total Lessons', value: course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0, icon: PlayCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Course Overview</h1>
        <p className="text-foreground/70">Here is a quick summary of how this course is performing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-background rounded-3xl border border-foreground/10 p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold mb-2">Detailed Analytics Coming Soon</h2>
        <p className="text-foreground/60">More detailed insights about student progress and engagement will be available here soon.</p>
      </div>
    </div>
  );
}
