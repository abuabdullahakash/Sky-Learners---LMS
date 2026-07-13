"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from '@/i18n/routing';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// Import Templates
import DefaultTemplate from '@/components/course/templates/DefaultTemplate';
import SchoolTemplate from '@/components/course/templates/SchoolTemplate';
import AdmissionTemplate from '@/components/course/templates/AdmissionTemplate';
import SkillTemplate from '@/components/course/templates/SkillTemplate';

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const t = useTranslations('CourseDetails');
  
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push('/courses');
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (course?.sliderImages?.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % course.sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [course?.sliderImages]);

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
        <h1 className="text-3xl font-bold mb-4">{t('notFound')}</h1>
        <Link href="/courses" className="text-primary font-bold hover:underline">
          {t('goBack')}
        </Link>
      </div>
    );
  }

  // Render template based on category
  switch (course.category) {
    case 'primary':
    case 'high_school':
      return <SchoolTemplate course={course} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />;
    case 'intermediate':
      return <AdmissionTemplate course={course} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />;
    case 'honours':
    case 'skills':
    case 'masters':
      return <SkillTemplate course={course} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />;
    default:
      return <DefaultTemplate course={course} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />;
  }
}
