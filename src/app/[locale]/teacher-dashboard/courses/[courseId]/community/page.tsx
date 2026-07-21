"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save, MessageSquare, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
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
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          
          let links: CommunityLink[] = data.communityLinks || [];
          
          // Backwards compatibility: If there's an old facebookGroupUrl but no communityLinks
          if (links.length === 0 && data.facebookGroupUrl) {
            links = [{
              id: Date.now().toString(),
              platform: 'facebook_private',
              url: data.facebookGroupUrl
            }];
          }
          
          setCommunityLinks(links);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // Filter out any empty links
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

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Colorful Hero Section */}
      <div className="relative overflow-hidden rounded bg-gradient-to-r from-primary/90 to-blue-600/90 p-8 text-white shadow-md">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Community & Chat
            </h1>
            <p className="text-white/80 max-w-lg text-sm">
              Manage how you interact with students outside of video lessons. Add links to your community platforms so students can easily join discussions.
            </p>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
      </div>

      <div className="bg-background p-6 rounded border border-foreground/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-xl font-bold mb-1">Community Links</h2>
            <p className="text-sm text-foreground/60">
              Add links to your community groups (Facebook, WhatsApp, Telegram, etc.) where students can discuss topics.
            </p>
          </div>
          <button 
            type="button" 
            onClick={addLink}
            className="px-4 py-2 bg-primary/10 text-primary font-medium rounded hover:bg-primary/20 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>

        {message && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl font-medium">{message}</div>}
        
        <form onSubmit={handleSave} className="space-y-4">
          {communityLinks.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-foreground/10 rounded">
              <LinkIcon className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
              <p className="text-foreground/60 font-medium">No community links added yet.</p>
              <p className="text-sm text-foreground/40 mt-1">Click "Add Link" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communityLinks.map((link, index) => (
                <div key={link.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-foreground/5 rounded border border-foreground/10 relative group">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-medium text-foreground/60 mb-1 ml-1 uppercase tracking-wider">Platform</label>
                    <select 
                      value={link.platform}
                      onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none text-sm"
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
                        className="w-full px-4 py-2.5 bg-background border border-foreground/10 rounded focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <button 
                        type="button" 
                        onClick={() => removeLink(link.id)}
                        className="p-2.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
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
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-background rounded border border-foreground/10 p-12 shadow-sm text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-primary/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Internal Chat coming soon</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          We are working on an internal messaging system so students can chat with you directly on this platform.
        </p>
      </div>
    </div>
  );
}
