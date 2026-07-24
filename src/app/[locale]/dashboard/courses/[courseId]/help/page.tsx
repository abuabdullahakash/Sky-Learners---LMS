// @ts-nocheck
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
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
  UserCheck
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportScreenshots, setReportScreenshots] = useState<File[]>([]);
  const [reportScreenshotUrls, setReportScreenshotUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox State
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const fetchHelpData = async () => {
    if (!user || !courseId) return;
    try {
      // Fetch Course Info
      const courseSnap = await getDoc(doc(db, 'courses', courseId));
      if (courseSnap.exists()) {
        setCourse(courseSnap.data());
      }

      // Fetch Issues submitted by this student for this course
      const q = query(
        collection(db, 'lesson_issues'),
        where('courseId', '==', courseId),
        where('studentId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userIssues = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // Sort by newest first
      userIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIssues(userIssues);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero Banner Header */}
      <div className="relative w-full shadow-lg rounded-2xl overflow-hidden bg-[#111827]">
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

      {/* Submitted Questions & Doubts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            আপনার পাঠানো প্রশ্ন ও সমাধানসমূহ ({issues.length})
          </h2>
        </div>

        {issues.length === 0 ? (
          <div className="bg-foreground/5 rounded-3xl p-12 text-center border border-foreground/10 space-y-4">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">এখনো কোনো প্রশ্ন করেননি!</h3>
              <p className="text-sm text-foreground/60 max-w-md mx-auto">
                পড়াশোনায় কোনো সমস্যা থাকলে বা কিছু না বুঝলে উপরের <strong className="text-orange-500">"নতুন প্রশ্ন / সাহায্য চান"</strong> বাটনে ক্লিক করে স্যারকে জানান।
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => {
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
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-foreground/10">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isSolved 
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20' 
                          : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                      }`}>
                        {isSolved ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {isSolved ? 'উত্তর দেওয়া হয়েছে (Solved)' : 'অপেক্ষা করা হচ্ছে (Open)'}
                      </span>
                      <span className="text-xs text-foreground/40 font-medium">
                        {new Date(issue.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {issue.lessonTitle && issue.lessonTitle !== 'General Help & Doubt' && (
                      <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                        {issue.lessonTitle}
                      </span>
                    )}
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
                              onClick={() => setSelectedPreviewImage(url)}
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
                  {issue.replyText ? (
                    <div className="mt-5 pt-4 border-t border-foreground/10">
                      <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-green-600 dark:text-green-400">
                          <span className="flex items-center gap-1.5 text-sm">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            স্যারের উত্তর (Teacher Solution):
                          </span>
                          {issue.repliedAt && <span>{new Date(issue.repliedAt).toLocaleString()}</span>}
                        </div>
                        <p className="text-sm text-foreground/90 font-medium whitespace-pre-wrap leading-relaxed pl-1">
                          {issue.replyText}
                        </p>
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
      </div>

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

      {/* Image Preview Lightbox */}
      {selectedPreviewImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setSelectedPreviewImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPreviewImage} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
