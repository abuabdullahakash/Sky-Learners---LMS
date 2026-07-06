"use client";

import { FileText } from 'lucide-react';

export default function CourseResourcesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Notes & Resources</h1>
        <p className="text-foreground/70">Upload PDFs, Lecture Sheets, and other study materials.</p>
      </div>

      <div className="bg-background rounded-3xl border border-foreground/10 p-12 shadow-sm text-center">
        <FileText className="w-16 h-16 mx-auto text-orange-500/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Resources feature coming soon</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          You will soon be able to attach downloadable files and drive links for your students to access alongside your video lessons.
        </p>
      </div>
    </div>
  );
}
