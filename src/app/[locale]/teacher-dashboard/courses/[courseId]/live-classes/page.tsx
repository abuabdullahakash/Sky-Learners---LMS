"use client";

import { Video } from 'lucide-react';

export default function CourseLiveClassesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Live Classes</h1>
        <p className="text-foreground/70">Manage Zoom or Google Meet links for live problem-solving sessions.</p>
      </div>

      <div className="bg-background rounded-3xl border border-foreground/10 p-12 shadow-sm text-center">
        <Video className="w-16 h-16 mx-auto text-orange-500/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Live Classes feature coming soon</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          You will soon be able to schedule live classes, share meet links, and record attendance directly from this dashboard.
        </p>
      </div>
    </div>
  );
}
