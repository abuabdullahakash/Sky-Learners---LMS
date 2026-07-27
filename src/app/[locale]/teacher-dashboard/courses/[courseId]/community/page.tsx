"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save, MessageSquare, Plus, Trash2, Link as LinkIcon, Bell, Megaphone, ImagePlus, Loader2, Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { uploadImageToImgBB } from '@/lib/imgbb';

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
}

export interface CourseNotice {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  teacherName?: string;
}

const PLATFORMS = [
  { id: 'facebook_public', label: 'Public Facebook Group' },
  { id: 'facebook_private', label: 'Private Facebook Group' },
  { id: 'whatsapp', label: 'WhatsApp Group' },
  { id: 'telegram', label: 'Telegram Group' },
  { id: 'discord', label: 'Discord Server' },
  { id: 'youtube', label: 'YouTube Channel' },
  { id: 'other', label: 'Other Link' },
];

export default function CourseCommunityPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [notices, setNotices] = useState<CourseNotice[]>([]);
  const [message, setMessage] = useState('');
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Notice Form State
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeImage, setNoticeImage] = useState<File | null>(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [noticeError, setNoticeError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          
          let links: CommunityLink[] = data.communityLinks || [];
          if (links.length === 0 && data.facebookGroupUrl) {
            links = [{
              id: Date.now().toString(),
              platform: 'facebook_private',
              url: data.facebookGroupUrl
            }];
          }
          
          setCommunityLinks(links);
          setNotices(data.notices || []);
        } else {
          router.push('/teacher-dashboard/courses');
        }
      } catch (error) {
        console.error("Error fetching course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [user, courseId, router]);

  const handleNoticeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNoticeImage(file);
      setNoticeImagePreview(URL.createObjectURL(file));
    }
  };

  const getPastedImageFile = (e: React.ClipboardEvent): File | null => {
    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) return file;
      }
    }
    if (e.clipboardData?.items && e.clipboardData.items.length > 0) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) return file;
        }
      }
    }
    return null;
  };

  const handleNoticePaste = (e: React.ClipboardEvent) => {
    const file = getPastedImageFile(e);
    if (file) {
      setNoticeImage(file);
      setNoticeImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    const validLinks = communityLinks.filter(link => link.url.trim() !== '');
    
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        communityLinks: validLinks
      });
      setMessage('Community links updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setCommunityLinks(validLinks);
    } catch (error) {
      console.error("Error updating community settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      setNoticeError('Title and notice content are required.');
      return;
    }

    setIsSaving(true);
    setNoticeError('');

    try {
      let imageUrl = '';
      if (noticeImage) {
        setIsUploadingImage(true);
        imageUrl = await uploadImageToImgBB(noticeImage);
      }

      const newNotice: CourseNotice = {
        id: Date.now().toString(),
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        ...(imageUrl ? { imageUrl } : {}),
        createdAt: new Date().toISOString(),
        teacherName: userData?.fullName || user?.displayName || 'Teacher'
      };

      const updatedNotices = [newNotice, ...notices];

      await updateDoc(doc(db, 'courses', courseId), {
        notices: updatedNotices
      });
      setNotices(updatedNotices);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticeImage(null);
      setNoticeImagePreview('');
      setIsAddingNotice(false);
      setMessage('Notice published successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error publishing notice", error);
      setNoticeError('Failed to publish notice. Please try again.');
    } finally {
      setIsSaving(false);
      setIsUploadingImage(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    const updatedNotices = notices.filter(n => n.id !== noticeId);
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        notices: updatedNotices
      });
      setNotices(updatedNotices);
    } catch (error) {
      console.error("Error deleting notice", error);
    }
  };

  const addLink = () => {
    setCommunityLinks([
      ...communityLinks,
      { id: Date.now().toString(), platform: 'facebook_public', url: '' }
    ]);
  };

  const removeLink = (id: string) => {
    setCommunityLinks(communityLinks.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: keyof CommunityLink, value: string) => {
    setCommunityLinks(communityLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-foreground/60 font-bold">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-none p-6 sm:p-8 text-white shadow-md" style={{background: 'linear-gradient(135deg, #f97316 0%, #ef4444 60%, #dc2626 100%)'}}>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)'}}></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
              Community & Announcements
            </h1>
            <p className="text-white/80 max-w-lg text-xs sm:text-sm">
              Post important announcements for students enrolled in this course and manage external community group links.
            </p>
          </div>
        </div>
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
      </div>

      {message && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-bold">{message}</div>}

      {/* Main Responsive Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 📢 Notice Board Section (Left Column on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-background p-4 sm:p-6 rounded-2xl border border-foreground/10 space-y-4 sm:space-y-6 shadow-sm">
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500 shrink-0" />
                <span>Course Notice Board (নোটিশ বোর্ড)</span>
              </h2>
              <p className="text-xs sm:text-sm text-foreground/60 mt-0.5 hidden sm:block">
                Publish announcements that appear on the student dashboard activity feed for enrolled students.
              </p>
            </div>
            {!isAddingNotice && (
              <button 
                type="button" 
                onClick={() => setIsAddingNotice(true)}
                className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm shrink-0 z-10"
                title="Post New Notice"
              >
                <Plus className="w-5 h-5" /> 
                <span className="hidden sm:inline">Post New Notice</span>
              </button>
            )}
          </div>

          {isAddingNotice && (
            <form onSubmit={handleAddNotice} className="p-4 sm:p-5 bg-foreground/5 rounded-2xl border border-orange-500/30 space-y-4">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" /> Write Announcement / Notice
              </h3>
              
              {noticeError && <div className="p-3 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg">{noticeError}</div>}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 ml-1">Notice Title</label>
                <input 
                  type="text"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Next Class Postponed / Assignment Deadline Extended"
                  className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl text-sm focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 ml-1">Notice Details</label>
                <textarea 
                  value={noticeContent}
                  onChange={e => setNoticeContent(e.target.value)}
                  onPaste={handleNoticePaste}
                  placeholder="Write full notice details for your students... (বা স্ক্রিনশট নিয়া সরাসরি Ctrl+V পেস্ট করুন)"
                  className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl text-sm focus:border-orange-500 focus:outline-none min-h-[100px]"
                  required
                />
              </div>

              {/* Notice Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 ml-1">Notice Image (Optional)</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl border border-orange-500/20 transition-colors">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>{noticeImagePreview ? 'ছবি পরিবর্তন করুন (Ctrl+V)' : '📷 নোটিশের ছবি আপলোড / Ctrl+V পেস্ট'}</span>
                    <input type="file" accept="image/*" onChange={handleNoticeImageChange} className="hidden" />
                  </label>
                  {noticeImagePreview && (
                    <button 
                      type="button" 
                      onClick={() => { setNoticeImage(null); setNoticeImagePreview(''); }}
                      className="text-xs text-red-500 hover:underline font-bold"
                    >
                      ছবি রিমুভ করুন
                    </button>
                  )}
                </div>
                {noticeImagePreview && (
                  <div className="mt-3 relative w-fit">
                    <img src={noticeImagePreview} alt="Notice Preview" className="max-h-48 rounded-xl border border-foreground/10 object-contain bg-background shadow-sm" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsAddingNotice(false); setNoticeError(''); setNoticeImage(null); setNoticeImagePreview(''); }}
                  className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving || isUploadingImage}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isSaving ? 'Publishing...' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Notices List */}
          {notices.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-foreground/10 rounded-xl">
              <Megaphone className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
              <p className="text-foreground/60 font-medium">No notices published yet.</p>
              <p className="text-sm text-foreground/40 mt-1">Post a notice so students can see important announcements in their dashboard.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 bg-background rounded-xl border border-foreground/10 flex items-start justify-between gap-4 hover:border-orange-500/30 transition-all shadow-sm">
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full uppercase tracking-wider">Notice</span>
                      <span className="text-xs text-foreground/40">{new Date(notice.createdAt).toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold text-base text-foreground truncate">{notice.title}</h4>
                    <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                    {notice.imageUrl && (
                      <div 
                        className="mt-3 relative group inline-block max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-foreground/15 bg-black/5 cursor-pointer shadow-sm"
                        onClick={() => setActiveLightboxImage(notice.imageUrl!)}
                      >
                        <img 
                          src={notice.imageUrl} 
                          alt={notice.title} 
                          className="max-h-48 w-auto object-cover rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-90" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                          <ZoomIn className="w-4 h-4 text-orange-400" />
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔗 Community Links Section (Right Column on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-background p-4 sm:p-6 rounded-2xl border border-foreground/10 space-y-4 sm:space-y-6 shadow-sm">
          <div className="flex flex-row items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-0.5 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-orange-500 shrink-0" />
                <span>Community Links (কমিউনিটি লিঙ্কসমূহ)</span>
              </h2>
              <p className="text-xs sm:text-sm text-foreground/60 hidden sm:block">
                Add links to your community groups (Facebook, WhatsApp, Telegram, etc.).
              </p>
            </div>
            <button 
              type="button" 
              onClick={addLink}
              className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap shrink-0 z-10"
              title="Add Link"
            >
              <Plus className="w-4 h-4" /> 
              <span>Add Link</span>
            </button>
          </div>

          <form onSubmit={handleSaveLinks} className="space-y-4">
            {communityLinks.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-foreground/10 rounded-xl">
                <LinkIcon className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                <p className="text-foreground/60 font-medium">No community links added yet.</p>
                <p className="text-sm text-foreground/40 mt-1">Click "Add Link" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {communityLinks.map((link) => (
                  <div key={link.id} className="p-3.5 bg-foreground/5 rounded-xl border border-foreground/10 space-y-2.5 relative group">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-foreground/60 uppercase tracking-wider">Platform</label>
                      <button 
                        type="button" 
                        onClick={() => removeLink(link.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <select 
                      value={link.platform}
                      onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-xl focus:border-primary transition-colors text-xs font-medium"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>

                    <div>
                      <label className="block text-[11px] font-bold text-foreground/60 mb-1 uppercase tracking-wider">URL</label>
                      <input 
                        type="url" 
                        value={link.url} 
                        onChange={e => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-xl focus:border-primary transition-colors text-xs"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-foreground/10">
              <button type="submit" disabled={isSaving} className="px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 text-white transition-all shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-60 text-xs sm:text-sm" style={{background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'}}>
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Links'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button 
            type="button" 
            onClick={() => setActiveLightboxImage(null)} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-30"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activeLightboxImage} 
              alt="Notice Full Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
