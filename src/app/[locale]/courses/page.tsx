"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function CoursesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-primary">Available Courses</h1>
          {userData?.role === 'student' ? (
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              Here are the courses curated specifically for your academic profile (Class: {userData?.class || 'N/A'}, Level: {userData?.eduLevel || 'N/A'}).
            </p>
          ) : userData?.role === 'teacher' ? (
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              Here are the courses in your subject area ({userData?.subject || 'N/A'}).
            </p>
          ) : (
            <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
              Explore our wide variety of courses.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for courses */}
          {[1, 2, 3].map((courseId) => (
            <div key={courseId} className="bg-foreground/5 rounded-2xl p-6 border border-foreground/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Sample Course {courseId}</h3>
              <p className="text-foreground/60 mb-4 line-clamp-2">
                This is a placeholder for a course that matches your specific profile requirements.
              </p>
              <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
