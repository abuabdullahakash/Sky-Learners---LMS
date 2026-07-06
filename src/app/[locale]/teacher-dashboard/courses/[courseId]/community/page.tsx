"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Save, MessageSquare } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export default function CourseCommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [facebookGroupUrl, setFacebookGroupUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          setFacebookGroupUrl(docSnap.data().facebookGroupUrl || '');
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
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        facebookGroupUrl
      });
      setMessage('Community settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating community settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold mb-2">Community & Chat</h1>
        <p className="text-foreground/70">Manage how you interact with students outside of video lessons.</p>
      </div>

      <form onSubmit={handleSave} className="bg-background p-6 md:p-8 rounded-3xl border border-foreground/10 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Facebook Support Group</h2>
        <p className="text-sm text-foreground/60 mb-4">
          Add a link to your private Facebook group where enrolled students can ask questions and discuss topics.
        </p>

        {message && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl font-medium">{message}</div>}
        
        <div>
          <label className="block text-sm font-medium mb-1">Facebook Group URL</label>
          <input 
            type="url" 
            value={facebookGroupUrl} 
            onChange={e => setFacebookGroupUrl(e.target.value)}
            placeholder="e.g. https://www.facebook.com/groups/yourgroup"
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500 transition-colors"
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
            <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="bg-background rounded-3xl border border-foreground/10 p-12 shadow-sm text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-orange-500/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">Internal Chat coming soon</h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          We are working on an internal messaging system so students can chat with you directly on this platform.
        </p>
      </div>
    </div>
  );
}
