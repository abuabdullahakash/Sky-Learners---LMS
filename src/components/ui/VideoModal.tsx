"use client";

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Basic parser for Youtube links
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        } else if (videoUrl.includes('watch?v=')) {
          videoId = videoUrl.split('watch?v=')[1].split('&')[0];
        } else if (videoUrl.includes('embed/')) {
          videoId = videoUrl.split('embed/')[1].split('?')[0];
        }
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
      } 
      // Basic parser for Facebook links
      else if (videoUrl.includes('facebook.com')) {
        const encodedUrl = encodeURIComponent(videoUrl);
        setEmbedUrl(`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560&autoplay=1`);
      } else {
        setEmbedUrl(videoUrl); // Fallback
      }
      setIsLoading(true);
    } else {
      document.body.style.overflow = 'unset';
      setEmbedUrl('');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        )}

        {/* Video Player */}
        {embedUrl && (
          <iframe
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            className="w-full h-full relative z-0 border-0"
          ></iframe>
        )}
      </div>
    </div>
  );
}
