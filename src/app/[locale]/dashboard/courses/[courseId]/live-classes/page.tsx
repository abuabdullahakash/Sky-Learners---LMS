export default function StudentLiveClasses() {
  return (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
      </div>
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Live Classes</h2>
      <p className="text-gray-600 dark:text-foreground/70 text-lg mb-8">
        There are currently no scheduled live classes for this course. Your instructor will notify you when a class is scheduled.
      </p>
    </div>
  );
}
