"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save, MessageSquare, Plus, Trash2, Link as LinkIcon, Bell, Megaphone } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
}

export interface CourseNotice {
  id: string;
  title: string;
  content: string;
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

  // Notice Form State
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
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

    const newNotice: CourseNotice = {
      id: Date.now().toString(),
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      createdAt: new Date().toISOString(),
      teacherName: userData?.fullName || user?.displayName || 'Teacher'
    };

    const updatedNotices = [newNotice, ...notices];

    try {
      await updateDoc(doc(db, 'courses', courseId), {
        notices: updatedNotices
      });
      setNotices(updatedNotices);
      setNoticeTitle('');
      setNoticeContent('');
      setIsAddingNotice(false);
      setMessage('Notice published successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error publishing notice", error);
      setNoticeError('Failed to publish notice. Please try again.');
    } finally {
      setIsSaving(false);
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded p-8 text-white shadow-md" style={{background: 'linear-gradient(135deg, #f97316 0%, #ef4444 60%, #dc2626 100%)'}}>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)'}}></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Community & Announcements
            </h1>
            <p className="text-white/80 max-w-lg text-sm">
              Post important announcements for students enrolled in this course and manage external community group links.
            </p>
          </div>
        </div>
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
      </div>

      {message && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-bold">{message}</div>}

      {/* 📢 Notice Board Section */}
      <div className="bg-background p-6 rounded-2xl border border-foreground/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-500" />
              Course Notice Board (নোটিশ বোর্ড)
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              Publish announcements that appear on the student dashboard activity feed for enrolled students.
            </p>
          </div>
          {!isAddingNotice && (
            <button 
              type="button" 
              onClick={() => setIsAddingNotice(true)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Post New Notice
            </button>
          )}
        </div>

        {isAddingNotice && (
          <form onSubmit={handleAddNotice} className="p-5 bg-foreground/5 rounded-2xl border border-orange-500/30 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
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
                placeholder="Write full notice details for your students..."
                className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl text-sm focus:border-orange-500 focus:outline-none min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => { setIsAddingNotice(false); setNoticeError(''); }}
                className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                {isSaving ? 'Publishing...' : 'Publish Notice'}
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
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-full uppercase tracking-wider">Notice</span>
                    <span className="text-xs text-foreground/40">{new Date(notice.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-base text-foreground">{notice.title}</h4>
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                </div>
                <button 
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔗 Community Links Section */}
      <div className="bg-background p-6 rounded-2xl border border-foreground/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-orange-500" />
              Community Links (কমিউনিটি লিঙ্কসমূহ)
            </h2>
            <p className="text-sm text-foreground/60">
              Add links to your community groups (Facebook, WhatsApp, Telegram, etc.) where students can discuss topics.
            </p>
          </div>
          <button 
            type="button" 
            onClick={addLink}
            className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Link
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
            <div className="space-y-4">
              {communityLinks.map((link) => (
                <div key={link.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-foreground/5 rounded-xl border border-foreground/10 relative group">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-medium text-foreground/60 mb-1 ml-1 uppercase tracking-wider">Platform</label>
                    <select 
                      value={link.platform}
                      onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none text-sm font-medium"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-2/3 flex gap-2">
                    <div className="flex-grow">
                      <label className="block text-xs font-medium text-foreground/60 mb-1 ml-1 uppercase tracking-wider">URL</label>
                      <input 
                        type="url" 
                        value={link.url} 
                        onChange={e => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <button 
                        type="button" 
                        onClick={() => removeLink(link.id)}
                        className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Link"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end pt-6 border-t border-foreground/10">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 text-white transition-all shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-60" style={{background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'}}>
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
