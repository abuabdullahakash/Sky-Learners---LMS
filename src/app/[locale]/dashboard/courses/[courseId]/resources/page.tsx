export default function StudentResources() {
  return (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Study Materials</h2>
      <p className="text-gray-600 dark:text-foreground/70 text-lg mb-8">
        No resources or study materials have been uploaded for this course yet.
      </p>
    </div>
  );
}
