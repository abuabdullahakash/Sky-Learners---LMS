const fs = require('fs');
const path = require('path');
const base = 'src/app/[locale]/teacher-dashboard/courses/[courseId]';

function makeHero(title, subtitle) {
  return `
      {/* Hero Section */}
      <div className="relative w-full mb-4 shadow-lg">
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 bg-[#111827]"/>
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
          <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
          <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        </div>
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">Teacher Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-sm">${title}</h1>
          <p className="text-gray-300 text-sm font-medium">${subtitle}</p>
        </div>
      </div>`;
}

const pages = [
  {
    file: 'page.tsx',
    oldHeader: `      <div>
        <h1 className="text-2xl font-bold mb-2">Course Overview</h1>
        <p className="text-foreground/70">Here is a quick summary of how this course is performing.</p>
      </div>`,
    title: 'Course Overview',
    subtitle: 'Here is a quick summary of how this course is performing.',
    extraFix: (c) => c.replace('<div className="space-y-8 animate-in fade-in duration-500">', '<div className="space-y-6 animate-in fade-in duration-500">')
  },
  {
    file: 'enrollments/page.tsx',
    oldHeader: `      <div>
        <h2 className="text-2xl font-bold">Course Enrollments</h2>
        <p className="text-foreground/60 text-sm">Manage student payment verifications for this course.</p>
      </div>`,
    title: 'Course Enrollments',
    subtitle: 'Manage student payment verifications for this course.',
  },
  {
    file: 'students/page.tsx',
    oldHeader: `      <div>
        <h2 className="text-2xl font-bold">Enrolled Students</h2>
        <p className="text-foreground/60 text-sm">View details and contact information of approved students.</p>
      </div>`,
    title: 'Enrolled Students',
    subtitle: 'View details and contact information of approved students.',
  },
  {
    file: 'issues/page.tsx',
    oldHeader: `      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Issues & Reports</h1>
          <p className="text-foreground/60 mt-1">Manage and resolve issues reported by students. Solved issues auto-delete after 24 hours.</p>
        </div>
      </div>`,
    title: 'Student Issues & Reports',
    subtitle: 'Manage and resolve issues reported by students. Solved issues auto-delete after 24 hours.',
  },
  {
    file: 'curriculum/page.tsx',
    oldHeader: `      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Curriculum Builder</h1>
          <p className="text-foreground/70">Organize your course into modules and add video lessons.</p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="flex gap-3">
            <button onClick={() => setIsSubjectModalOpen(true)} className="flex-1 justify-center px-4 py-2 bg-background border border-foreground/10 text-foreground rounded-xl font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
              <Settings className="w-4 h-4" /> Subjects
            </button>
            <button onClick={handleAddModule} className="flex-1 justify-center px-4 py-2 bg-background border border-foreground/10 text-foreground rounded-xl font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          </div>
          <button onClick={() => openLessonModal()} className="w-full justify-center px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
            <VideoIcon className="w-4 h-4" /> Add Lesson
          </button>
        </div>
      </div>`,
    title: 'Curriculum Builder',
    subtitle: 'Organize your course into modules and add video lessons.',
    extraSuffix: `
      <div className="flex gap-3 flex-wrap mb-6">
        <button onClick={() => setIsSubjectModalOpen(true)} className="px-4 py-2 bg-background border border-foreground/10 text-foreground rounded font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap text-sm">
          <Settings className="w-4 h-4" /> Subjects
        </button>
        <button onClick={handleAddModule} className="px-4 py-2 bg-background border border-foreground/10 text-foreground rounded font-bold hover:bg-foreground/5 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap text-sm">
          <Plus className="w-4 h-4" /> Add Module
        </button>
        <button onClick={() => openLessonModal()} className="px-5 py-2 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 text-sm">
          <VideoIcon className="w-4 h-4" /> Add Lesson
        </button>
      </div>`
  },
  {
    file: 'instructors/page.tsx',
    oldHeader: `      <div>
        <h1 className="text-2xl font-bold mb-2">Instructors</h1>`,
    title: 'Instructors',
    subtitle: 'Manage the instructors and collaborators for this course.',
    partialMatch: true,
  },
  {
    file: 'resources/page.tsx',
    oldHeader: `      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Notes & Resources</h1>
          <p className="text-foreground/70">Share PDFs, slides, and class materials via Google Drive links.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Add Resource
          </button>
        )}
      </div>`,
    title: 'Notes & Resources',
    subtitle: 'Share PDFs, slides, and class materials via Google Drive links.',
    extraSuffix: `
      {!isAdding && (
        <div className="flex justify-end mb-2">
          <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap text-sm">
            <Plus className="w-5 h-5" /> Add Resource
          </button>
        </div>
      )}`
  },
];

pages.forEach(({ file, oldHeader, title, subtitle, extraFix, extraSuffix, partialMatch }) => {
  const filePath = path.join(base, file);
  let c = fs.readFileSync(filePath, 'utf8');
  
  const hero = makeHero(title, subtitle);
  const replacement = hero + (extraSuffix || '');
  
  if (c.includes(oldHeader)) {
    c = c.replace(oldHeader, replacement);
    console.log('✓ Replaced header in: ' + file);
  } else {
    console.log('✗ Header not found in: ' + file + ' — check manually');
  }
  
  if (extraFix) c = extraFix(c);
  
  fs.writeFileSync(filePath, c);
});

console.log('\nDone!');
