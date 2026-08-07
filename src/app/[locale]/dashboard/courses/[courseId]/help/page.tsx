// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  HelpCircle, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  BookOpen,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageToImgBB } from '@/lib/imgbb';

export default function StudentHelpDeskPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, profile } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab Filter State (Default: 'open')
  const [filter, setFilter] = useState<'open' | 'solved'>('open');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportScreenshots, setReportScreenshots] = useState<File[]>([]);
  const [reportScreenshotUrls, setReportScreenshotUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox State
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `sky-learners-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('ছবি ডাউনলোড সম্পন্ন হয়েছে!');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    if (!lightboxState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxState(null);
      } else if (e.key === 'ArrowLeft' && lightboxState.images.length > 1) {
        setLightboxState(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
      } else if (e.key === 'ArrowRight' && lightboxState.images.length > 1) {
        setLightboxState(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState]);

  const fetchHelpData = async () => {
    if (!user || !courseId) return;
    try {
      // Fetch Course Info
      const courseSnap = await getDoc(doc(db, 'courses', courseId));
      if (courseSnap.exists()) {
        setCourse(courseSnap.data());
      }

      // Fetch Issues submitted by this student for this course
      const issuesMap = new Map<string, any>();
      const uidSnap = await getDocs(query(
        collection(db, 'lesson_issues'),
        where('courseId', '==', courseId),
        where('studentId', '==', user.uid)
      ));
      uidSnap.forEach(d => issuesMap.set(d.id, d));

      if (user.email) {
        const emailSnap = await getDocs(query(
          collection(db, 'lesson_issues'),
          where('courseId', '==', courseId),
          where('studentEmail', '==', user.email.toLowerCase().trim())
        ));
        emailSnap.forEach(d => issuesMap.set(d.id, d));
      }

      const validIssues = [];
      const now = new Date().getTime();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      for (let issueDoc of Array.from(issuesMap.values())) {
        const data = issueDoc.data();
        if (data.status === 'solved') {
          const age = now - new Date(data.createdAt).getTime();
          if (age > ONE_DAY) {
            try {
              await deleteDoc(issueDoc.ref);
              continue; // Skip adding to validIssues
            } catch (e) {
              console.error("Failed to auto-delete old issue", e);
            }
          }
        }
        validIssues.push({
          id: issueDoc.id,
          ...data
        });
      }

      // Sort by newest first
      validIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIssues(validIssues);
    } catch (error) {
      console.error("Error fetching student help desk data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpData();
  }, [user, courseId]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportNote.trim() || !user) return;

    setIsSubmitting(true);
    try {
      let imgUrls: string[] = [];
      if (reportScreenshots.length > 0) {
        imgUrls = await Promise.all(reportScreenshots.map(file => uploadImageToImgBB(file)));
      }

      const newIssueDoc = {
        courseId,
        lessonId: 'general',
        lessonTitle: 'General Help & Doubt',
        moduleTitle: course?.title || 'সাধারণ প্রশ্ন',
        subject: course?.category || 'সাধারণ প্রশ্ন',
        studentId: user.uid,
        studentName: profile?.fullName || user.displayName || 'Student',
        studentPhotoUrl: profile?.photoUrl || user.photoURL || '',
        subjectTitle: reportSubject.trim(),
        note: reportNote.trim(),
        screenshotUrl: imgUrls[0] || '',
        screenshotUrls: imgUrls,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'lesson_issues'), newIssueDoc);

      toast.success("আপনার প্রশ্নটি সফলভাবে স্যারের কাছে পাঠানো হয়েছে! 🎉");
      setIssues(prev => [{ id: docRef.id, ...newIssueDoc }, ...prev]);
      
      // Reset Modal Form
      setIsModalOpen(false);
      setReportSubject('');
      setReportNote('');
      setReportScreenshots([]);
      setReportScreenshotUrls([]);
    } catch (err) {
      console.error("Error submitting question:", err);
      toast.error("প্রশ্ন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const isSolved = issue.status === 'solved' || Boolean(issue.replyText);
    if (filter === 'open') return !isSolved;
    if (filter === 'solved') return isSolved;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero Banner Header (border-radius 0px) */}
      <div className="relative w-full shadow-lg rounded-none overflow-hidden bg-[#111827]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)' }} />
        </div>
        
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold rounded-full uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" /> প্রশ্ন ও সাহায্য কেন্দ্র
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">স্যারকে প্রশ্ন করুন ও উত্তর দেখুন</h1>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              পড়াশোনা, টপিক বা কোর্স সংক্রান্ত যেকোনো সমস্যা বা প্রশ্ন সরাসরি স্যারকে পাঠাতে পারেন। স্যার উত্তর দিলে এখানে সরাসরি দেখতে পাবেন।
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            নতুন প্রশ্ন / সাহায্য চান
          </button>
        </div>
      </div>

      {/* Tab Filtering Options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          আপনার পাঠানো প্রশ্ন ও সমাধানসমূহ ({filteredIssues.length})
        </h2>

        <div className="flex bg-foreground/5 p-1 rounded-xl w-full sm:w-auto border border-foreground/10 shrink-0">
          {[
            { id: 'open', label: `অপেক্ষমাণ (${issues.filter(i => i.status !== 'solved' && !i.replyText).length})` },
            { id: 'solved', label: `উত্তর পাওয়া গেছে (${issues.filter(i => i.status === 'solved' || i.replyText).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center justify-center ${
                filter === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
          <div className="bg-foreground/5 rounded-3xl p-12 text-center border border-foreground/10 space-y-4">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">কোনো প্রশ্ন পাওয়া যায়নি!</h3>
              <p className="text-sm text-foreground/60 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'পড়াশোনায় কোনো সমস্যা থাকলে বা কিছু না বুঝলে উপরের "নতুন প্রশ্ন / সাহায্য চান" বাটনে ক্লিক করে স্যারকে জানান।'
                  : 'এই ক্যাটাগরিতে কোনো প্রশ্ন নেই।'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map(issue => {
              const screenshots: string[] = issue.screenshotUrls?.length > 0 
                ? issue.screenshotUrls 
                : issue.screenshotUrl ? [issue.screenshotUrl] : [];

              const isSolved = issue.status === 'solved' || Boolean(issue.replyText);

              return (
                <div 
                  key={issue.id}
                  className={`bg-background border rounded-2xl p-5 transition-all shadow-sm ${
                    isSolved ? 'border-green-500/30' : 'border-foreground/10 hover:border-orange-500/30'
                  }`}
                >
                  {/* Status Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-foreground/10">
                    <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isSolved 
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20' 
                          : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                      }`}>
                        {isSolved ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {isSolved ? 'উত্তর দেওয়া হয়েছে (Solved)' : 'অপেক্ষা করা হচ্ছে (OPEN)'}
                      </span>

                      {issue.lessonTitle && issue.lessonTitle !== 'General Help & Doubt' && (
                        <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                          {issue.lessonTitle}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] sm:text-xs text-foreground/50 font-medium shrink-0">
                      {new Date(issue.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-foreground text-base sm:text-lg">{issue.subjectTitle || issue.subject}</h3>
                    
                    <div className="bg-foreground/[0.02] border border-foreground/10 rounded-xl p-4 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {issue.note}
                    </div>

                    {/* Screenshot Attachments */}
                    {screenshots.length > 0 && (
                      <div className="pt-1">
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block mb-2">সংযুক্ত ছবিসমূহ:</span>
                        <div className="flex flex-wrap gap-2.5">
                          {screenshots.map((url, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setLightboxState({ images: screenshots, index: idx })}
                              className="w-20 h-20 rounded-xl border border-foreground/10 overflow-hidden bg-background cursor-pointer group hover:border-orange-500 transition-colors relative"
                            >
                              <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teacher Reply Section */}
                  {issue.replyText || issue.replyImageUrl ? (
                    <div className="mt-5 pt-4 border-t border-foreground/10">
                      <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-green-600 dark:text-green-400">
                          <span className="flex items-center gap-1.5 text-sm">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            স্যারের উত্তর (Teacher Solution):
                          </span>
                          {issue.repliedAt && <span>{new Date(issue.repliedAt).toLocaleString()}</span>}
                        </div>
                        {issue.replyText && (
                          <p className="text-sm text-foreground/90 font-medium whitespace-pre-wrap leading-relaxed pl-1">
                            {issue.replyText}
                          </p>
                        )}
                        {issue.replyImageUrl && (
                          <div className="pt-1">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-1.5">
                              স্যারের পাঠানো সমাধানের ছবি (Solution Sheet):
                            </span>
                            <div 
                              onClick={() => setLightboxState({ images: [issue.replyImageUrl], index: 0 })}
                              className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-xl border border-green-500/30 overflow-hidden bg-background group cursor-pointer shadow-md hover:border-green-500 transition-all"
                            >
                              <img src={issue.replyImageUrl} alt="Teacher Solution Sheet" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                <ImageIcon className="w-4 h-4" /> ক্লিক করে বড় করে দেখুন
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-foreground/5 text-xs text-foreground/50 flex items-center gap-1.5 italic">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      স্যার আপনার প্রশ্নটি দেখছেন, শীঘ্রই উত্তর দেওয়া হবে।
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* --- Ask Question / Help Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-foreground/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-foreground/50" />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-orange-500" />
              স্যারকে প্রশ্ন করুন
            </h2>
            <p className="text-xs sm:text-sm text-foreground/60 mb-6">
              পড়াশোনা বা টপিক সংক্রান্ত যেকোনো প্রশ্ন বিস্তারিত লিখে পাঠান।
            </p>

            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-foreground/80 mb-1 block">
                  প্রশ্নের বিষয় / শিরোনাম *
                </label>
                <input 
                  type="text" 
                  required
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="যেমন: ৩য় অধ্যায়ের অনুশীলনী ৫ এর সমস্যা"
                  className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-foreground/80 mb-1 block">
                  বিস্তারিত বিবরণ *
                </label>
                <textarea 
                  required 
                  rows={4}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="স্যার, আমি এই টপিকের নির্দিষ্ট সমাধানটি বুঝতে পারছি না..."
                  className="w-full bg-foreground/5 px-4 py-3 rounded-xl border border-foreground/10 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-foreground/80 mb-2 block">
                  ছবি বা স্ক্রিনশট (সর্বোচ্চ ৪টি)
                </label>
                
                {reportScreenshotUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mb-3">
                    {reportScreenshotUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-foreground/20" />
                        <button 
                          type="button"
                          onClick={() => {
                            setReportScreenshots(prev => prev.filter((_, i) => i !== idx));
                            setReportScreenshotUrls(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {reportScreenshotUrls.length < 4 && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-foreground/10 text-xs sm:text-sm font-bold transition-colors">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    ছবি যুক্ত করুন ({reportScreenshotUrls.length}/4)
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          const combined = [...reportScreenshots, ...newFiles].slice(0, 4);
                          setReportScreenshots(combined);
                          setReportScreenshotUrls(combined.map(f => URL.createObjectURL(f)));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !reportSubject.trim() || !reportNote.trim()}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-4 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> জমা দেওয়া হচ্ছে...
                  </>
                ) : (
                  'প্রশ্ন জমা দিন (Submit)'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Carousel with Navigation */}
      {lightboxState && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 select-none animate-in fade-in duration-200" 
          onClick={() => setLightboxState(null)}
        >
          {/* Top Bar with Download, Counter, and Close */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:right-6 sm:left-6 flex items-center justify-between z-50 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(lightboxState.images[lightboxState.index]);
                }}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer backdrop-blur-md"
                title="Download Image"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </button>

              {lightboxState.images.length > 1 && (
                <div className="px-3 py-2 bg-white/15 border border-white/20 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                  {lightboxState.index + 1} / {lightboxState.images.length}
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setLightboxState(null)}
              className="p-2.5 sm:p-3 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-full transition-colors shadow-lg cursor-pointer pointer-events-auto backdrop-blur-md"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Previous Arrow Button */}
          {lightboxState.images.length > 1 && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxState(prev => prev ? {
                  ...prev,
                  index: (prev.index - 1 + prev.images.length) % prev.images.length
                } : null);
              }}
              className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white bg-white/20 hover:bg-white/35 border border-white/25 rounded-full transition-all z-50 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
              title="Previous Image (←)"
            >
              <ChevronLeft className="w-4 h-4 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Next Arrow Button */}
          {lightboxState.images.length > 1 && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxState(prev => prev ? {
                  ...prev,
                  index: (prev.index + 1) % prev.images.length
                } : null);
              }}
              className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-4 text-white bg-white/20 hover:bg-white/35 border border-white/25 rounded-full transition-all z-50 shadow-xl active:scale-95 cursor-pointer backdrop-blur-md"
              title="Next Image (→)"
            >
              <ChevronRight className="w-4 h-4 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Main Image View */}
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center pt-8 sm:pt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxState.images[lightboxState.index]} 
              alt={`Preview ${lightboxState.index + 1}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl transition-all duration-300" 
            />
          </div>
        </div>
      )}

    </div>
  );
}
