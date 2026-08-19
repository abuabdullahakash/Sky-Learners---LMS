"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { useLocale } from 'next-intl';
import { 
  Megaphone, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Pin, 
  Eye, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ExternalLink,
  MessageSquare,
  Flame,
  Globe,
  BellRing
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeacherPost {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherPhoto?: string;
  coachingName?: string;
  title: string;
  content: string;
  type: 'notice' | 'tips' | 'promo' | 'exam_alert';
  imageUrl?: string;
  linkedCourseId?: string;
  linkedCourseTitle?: string;
  isPinned?: boolean;
  targetAudience: 'all' | 'enrolled';
  createdAt: any;
  likesCount?: number;
  commentsCount?: number;
}

export default function TeacherPostsPage() {
  const { user, userData } = useAuth();
  const locale = useLocale();

  const [posts, setPosts] = useState<TeacherPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  // Create Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'notice' | 'tips' | 'promo' | 'exam_alert'>('notice');
  const [imageUrl, setImageUrl] = useState('');
  const [linkedCourseId, setLinkedCourseId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [targetAudience, setTargetAudience] = useState<'all' | 'enrolled'>('all');

  // Fetch teacher's published courses and posts
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.uid) return;
      try {
        // 1. Fetch Teacher's Courses for linking
        const coursesRef = collection(db, 'courses');
        const qCourses = query(coursesRef, where('teacherId', '==', user.uid));
        const coursesSnap = await getDocs(qCourses);
        const courseList: { id: string; title: string }[] = [];
        coursesSnap.forEach(d => {
          courseList.push({ id: d.id, title: d.data().title || 'Untitled Course' });
        });
        setCourses(courseList);

        // 2. Fetch Teacher's Posts
        const postsRef = collection(db, 'teacher_posts');
        const qPosts = query(postsRef, where('teacherId', '==', user.uid));
        const postsSnap = await getDocs(qPosts);
        const postList: TeacherPost[] = [];
        postsSnap.forEach(d => {
          postList.push({ id: d.id, ...d.data() } as TeacherPost);
        });

        // Sort: Pinned first, then newest
        postList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setPosts(postList);
      } catch (err) {
        console.error('Error fetching teacher posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const url = await uploadImageToImgBB(file);
      setImageUrl(url);
      toast.success(locale === 'bn' ? 'ছবি আপলোড সম্পন্ন হয়েছে!' : 'Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(locale === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload image');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error(locale === 'bn' ? 'শিরোনাম ও বিবরণ পূরণ করুন' : 'Title and content are required');
      return;
    }
    if (!user?.uid) return;

    setSubmitting(true);
    try {
      const selectedCourse = courses.find(c => c.id === linkedCourseId);

      const newPostData = {
        teacherId: user.uid,
        teacherName: user.displayName || userData?.name || 'Instructor',
        teacherPhoto: user.photoURL || '',
        coachingName: userData?.coachingName || '',
        title: title.trim(),
        content: content.trim(),
        type: postType,
        imageUrl: imageUrl.trim() || null,
        linkedCourseId: linkedCourseId || null,
        linkedCourseTitle: selectedCourse?.title || null,
        isPinned,
        targetAudience,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      };

      const docRef = await addDoc(collection(db, 'teacher_posts'), newPostData);
      
      const newPostWithId: TeacherPost = {
        id: docRef.id,
        ...newPostData,
        createdAt: new Date(),
      } as any;

      setPosts(prev => [newPostWithId, ...prev]);
      toast.success(locale === 'bn' ? 'পোস্ট সফলভাবে পাবলিশ হয়েছে!' : 'Post published successfully!');

      // Reset Form
      setTitle('');
      setContent('');
      setImageUrl('');
      setLinkedCourseId('');
      setIsPinned(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error(locale === 'bn' ? 'পোস্ট তৈরি করতে সমস্যা হয়েছে' : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(locale === 'bn' ? 'আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'teacher_posts', postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success(locale === 'bn' ? 'পোস্ট মুছে ফেলা হয়েছে' : 'Post deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(locale === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে' : 'Failed to delete');
    }
  };

  const handleTogglePin = async (post: TeacherPost) => {
    try {
      const newPinned = !post.isPinned;
      await updateDoc(doc(db, 'teacher_posts', post.id), { isPinned: newPinned });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPinned: newPinned } : p));
      toast.success(newPinned 
        ? (locale === 'bn' ? 'পোস্ট পিন করা হয়েছে' : 'Post pinned') 
        : (locale === 'bn' ? 'পোস্ট আনপিন করা হয়েছে' : 'Post unpinned')
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const typeBadges = {
    notice: { label: locale === 'bn' ? 'নোটিশ' : 'Notice', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    tips: { label: locale === 'bn' ? 'পড়ার টিপস' : 'Study Tips', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    promo: { label: locale === 'bn' ? 'কোর্স বিজ্ঞাপন' : 'Course Promo', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    exam_alert: { label: locale === 'bn' ? 'পরীক্ষার বার্তা' : 'Exam Alert', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 border border-foreground/10 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
            <Megaphone className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'কমিউনিটি ও নোটিশ হাব' : 'Community & Notices'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {locale === 'bn' ? 'পোস্ট ও নোটিশ ম্যানেজমেন্ট' : 'Posts & Announcements Manager'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            {locale === 'bn' 
              ? 'আপনার স্টুডেন্টদের জন্য গুরুত্বপূর্ণ নোটিশ, পরীক্ষার টিপস বা নতুন কোর্সের বিজ্ঞাপন পোস্ট করুন। এগুলো সরাসরি আপনার ওয়েবসাইট এবং স্টুডেন্টদের হোম পেজে প্রদর্শিত হবে।'
              : 'Post important notices, study tips, or course promotions. These will appear on your public website and enrolled students\' home feeds.'}
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{locale === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post'}</span>
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-background border border-foreground/10 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {locale === 'bn' ? 'এখনো কোনো পোস্ট করা হয়নি!' : 'No Posts Published Yet!'}
          </h3>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            {locale === 'bn' 
              ? 'আপনার স্টুডেন্টদের সাথে যুক্ত থাকতে এবং নতুন নোটিশ শেয়ার করতে প্রথম পোস্টটি তৈরি করুন।'
              : 'Create your first post to engage your students and share notices, tips, or course announcements.'}
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md"
          >
            {locale === 'bn' ? 'প্রথম পোস্ট তৈরি করুন' : 'Create First Post'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground/70 px-1">
            <span>{locale === 'bn' ? `মোট পোস্ট (${posts.length})` : `Total Posts (${posts.length})`}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div 
                key={post.id}
                className={`p-6 rounded-3xl bg-background border transition-all duration-200 shadow-sm hover:shadow-md ${
                  post.isPinned ? 'border-orange-500/50 bg-orange-500/[0.02]' : 'border-foreground/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  <div className="space-y-3 flex-1">
                    {/* Badges & Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                          <Pin className="w-3 h-3 fill-white" />
                          <span>{locale === 'bn' ? 'পিন করা' : 'Pinned'}</span>
                        </span>
                      )}

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeBadges[post.type]?.color}`}>
                        {typeBadges[post.type]?.label}
                      </span>

                      <span className="text-xs text-foreground/50">
                        {post.targetAudience === 'enrolled' 
                          ? (locale === 'bn' ? '🔒 শুধুমাত্র এনরোল্ড শিক্ষার্থী' : '🔒 Enrolled Students Only')
                          : (locale === 'bn' ? '🌐 উন্মুক্ত (সকলের জন্য)' : '🌐 Public for All')}
                      </span>
                    </div>

                    {/* Title & Content */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Linked Course Banner if any */}
                    {post.linkedCourseTitle && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-semibold text-foreground/80">
                        <BookOpen className="w-4 h-4 text-orange-500" />
                        <span>{locale === 'bn' ? 'সংযুক্ত কোর্স:' : 'Linked Course:'}</span>
                        <span className="text-primary font-bold">{post.linkedCourseTitle}</span>
                      </div>
                    )}

                    {/* Image Attachment Preview */}
                    {post.imageUrl && (
                      <div className="relative max-w-md aspect-video rounded-2xl overflow-hidden border border-foreground/10 mt-2">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 self-end sm:self-start">
                    <button 
                      onClick={() => handleTogglePin(post)}
                      title={post.isPinned ? 'Unpin Post' : 'Pin Post'}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        post.isPinned 
                          ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' 
                          : 'bg-foreground/5 text-foreground/60 hover:text-foreground border-foreground/10'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete Post"
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE POST MODAL                                                         */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-background border border-foreground/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {locale === 'bn' ? 'নতুন পোস্ট বা নোটিশ তৈরি করুন' : 'Create New Post / Notice'}
                </h3>
                <p className="text-xs text-foreground/60">
                  {locale === 'bn' ? 'স্টুডেন্টদের সাথে শেয়ার করতে নিচের তথ্যগুলো পূরণ করুন' : 'Fill in the details to publish to your students'}
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-foreground/50 hover:text-foreground rounded-full hover:bg-foreground/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-foreground/70 mb-2">
                  {locale === 'bn' ? 'পোস্টের ধরন (Category)' : 'Post Category'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'notice', label: locale === 'bn' ? '📢 নোটিশ' : '📢 Notice' },
                    { id: 'tips', label: locale === 'bn' ? '💡 পড়ার টিপস' : '💡 Study Tips' },
                    { id: 'promo', label: locale === 'bn' ? '🔥 কোর্স প্রোমো' : '🔥 Course Promo' },
                    { id: 'exam_alert', label: locale === 'bn' ? '📝 এক্সাম বার্তা' : '📝 Exam Alert' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostType(t.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        postType === t.id 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                          : 'bg-foreground/5 text-foreground/70 border-foreground/10 hover:bg-foreground/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-foreground/70 mb-1.5">
                  {locale === 'bn' ? 'শিরোনাম (Title)' : 'Post Title'} *
                </label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={locale === 'bn' ? 'যেমন: আগামীকালের ফিজিক্স ক্লাসের বিশেষ শিডিউল' : 'e.g. Special schedule for tomorrow\'s physics live class'}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/15 text-foreground focus:outline-none focus:border-orange-500 text-sm"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold uppercase text-foreground/70 mb-1.5">
                  {locale === 'bn' ? 'বিবরণ (Content / Description)' : 'Post Content'} *
                </label>
                <textarea 
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={locale === 'bn' ? 'পোস্টের বিস্তারিত লিখুন...' : 'Write the details of your post/notice...'}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/15 text-foreground focus:outline-none focus:border-orange-500 text-sm"
                  required
                />
              </div>

              {/* Linked Course (Optional) */}
              {courses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase text-foreground/70 mb-1.5">
                    {locale === 'bn' ? 'কোর্স লিংক করুন (ঐচ্ছিক - বিজ্ঞাপনের জন্য)' : 'Link Course (Optional - for Promotion)'}
                  </label>
                  <select 
                    value={linkedCourseId}
                    onChange={(e) => setLinkedCourseId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/15 text-foreground focus:outline-none focus:border-orange-500 text-sm"
                  >
                    <option value="">{locale === 'bn' ? '-- কোনো কোর্স নির্বাচন করা হয়নি --' : '-- No linked course --'}</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-foreground/70 mb-1.5">
                  {locale === 'bn' ? 'ছবি বা ব্যানার যুক্ত করুন (ঐচ্ছিক)' : 'Attach Image / Banner (Optional)'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold flex items-center gap-2">
                    {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <ImageIcon className="w-4 h-4 text-orange-500" />}
                    <span>{uploadingImg ? (locale === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (locale === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image')}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {imageUrl && (
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {locale === 'bn' ? 'ছবি সংযুক্ত হয়েছে' : 'Image Attached'}
                    </span>
                  )}
                </div>
              </div>

              {/* Target Audience & Pin Checkbox */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-foreground/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
                  <input 
                    type="checkbox" 
                    checked={isPinned} 
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 accent-orange-500"
                  />
                  <span>{locale === 'bn' ? 'শীর্ষে পিন করে রাখুন (Pin to top)' : 'Pin to top of feed'}</span>
                </label>

                <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                  <span>{locale === 'bn' ? 'কারা দেখবে:' : 'Audience:'}</span>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground text-xs"
                  >
                    <option value="all">{locale === 'bn' ? 'সকল ভিজিটর ও শিক্ষার্থী' : 'All Students & Visitors'}</option>
                    <option value="enrolled">{locale === 'bn' ? 'শুধুমাত্র আমার কোর্সের শিক্ষার্থী' : 'Enrolled Students Only'}</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-foreground/10">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl hover:bg-foreground/5 text-foreground/70 font-bold text-xs"
                >
                  {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  disabled={submitting || uploadingImg}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{locale === 'bn' ? 'পাবলিশ করুন' : 'Publish Post'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
