export default function StudentExams() {
  return (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      </div>
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Exams & Quizzes</h2>
      <p className="text-gray-600 dark:text-foreground/70 text-lg mb-8">
        There are no active exams or quizzes for this course at the moment.
      </p>
    </div>
  );
}
