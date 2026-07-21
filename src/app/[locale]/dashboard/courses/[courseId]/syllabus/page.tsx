import { BookOpen } from 'lucide-react';

export default function SyllabusPage() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <BookOpen className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Student Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">Course Syllabus</h1>
            <p className="text-gray-300 text-sm font-medium">Explore the detailed curriculum and learning path.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-background border border-foreground/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-2 text-foreground">Syllabus Coming Soon</h2>
        <p className="text-foreground/60 max-w-md">
          The syllabus content for this course will be updated soon. Please check back later.
        </p>
      </div>
    </div>
  );
}
