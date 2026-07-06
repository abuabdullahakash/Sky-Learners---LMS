"use client";

import { CheckSquare } from 'lucide-react';

export default function CourseExamsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Exams & Quizzes</h1>
        <p className="text-foreground/70">Create and manage assessments for your students.</p>
      </div>

      <div className="bg-background rounded-3xl border border-foreground/10 p-12 shadow-sm text-center">
        <CheckSquare className="w-16 h-16 mx-auto text-orange-500/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Exam Engine coming soon</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          We are building a robust MCQ and written exam engine so you can evaluate your students' progress efficiently.
        </p>
      </div>
    </div>
  );
}
