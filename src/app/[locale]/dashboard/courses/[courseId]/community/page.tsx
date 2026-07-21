"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Facebook, MessageCircle, Send, Link as LinkIcon, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface CommunityLink {
  id: string;
  platform: string;
  url: string;
}

const PLATFORM_INFO: Record<string, { label: string; icon: React.FC<any>; color: string }> = {
  facebook_public: { label: 'Public Facebook Group', icon: Facebook, color: 'text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  facebook_private: { label: 'Private Facebook Group', icon: Facebook, color: 'text-blue-700 bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/20 dark:text-blue-500 dark:border-blue-600/30' },
  whatsapp: { label: 'WhatsApp Group', icon: MessageCircle, color: 'text-green-600 bg-green-500/10 hover:bg-green-500/20 border-green-500/20 dark:text-green-400 dark:border-green-500/30' },
  telegram: { label: 'Telegram Group', icon: Send, color: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20 dark:text-sky-400 dark:border-sky-500/30' },
  discord: { label: 'Discord Server', icon: MessageSquare, color: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30' },
  other: { label: 'Community Link', icon: LinkIcon, color: 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20 dark:border-primary/30' },
};

export default function StudentCommunity() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!courseId) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          let fetchedLinks: CommunityLink[] = data.communityLinks || [];
          
          // Fallback for old data structure
          if (fetchedLinks.length === 0 && data.facebookGroupUrl) {
            fetchedLinks = [{
              id: 'legacy',
              platform: 'facebook_private',
              url: data.facebookGroupUrl
            }];
          }
          
          setLinks(fetchedLinks);
        }
      } catch (error) {
        console.error("Error fetching community links", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-20 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">Community & Discussions</h2>
        <p className="text-gray-600 dark:text-foreground/70 text-lg mb-8">
          The community forum for this course is not yet active. Check back later to interact with your peers and instructors!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Join the Community</h2>
        <p className="text-gray-600 dark:text-foreground/70 text-lg">
          Connect with your instructor and peers through the following community platforms.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => {
          const info = PLATFORM_INFO[link.platform] || PLATFORM_INFO['other'];
          const Icon = info.icon;
          
          return (
            <Link 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 group ${info.color}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-background rounded-xl shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{info.label}</h3>
                  <p className="text-sm opacity-80 mt-1">Click to join</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
