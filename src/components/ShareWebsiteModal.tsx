"use client";

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Globe, 
  MessageCircle, 
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocale } from 'next-intl';

interface ShareWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  customSlug?: string;
  academyName?: string;
}

export default function ShareWebsiteModal({
  isOpen,
  onClose,
  teacherId,
  customSlug,
  academyName
}: ShareWebsiteModalProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sky-learners-lms.vercel.app';
  const targetSlug = customSlug?.trim() || teacherId;
  const shareUrl = `${origin}/teachers/${targetSlug}`;
  const displayName = academyName || 'আমাদের একাডেমি';

  const shareText = `🎓 ${displayName}-এর অফিশিয়াল একাডেমি ওয়েবসাইটে আপনাকে স্বাগতম! আমাদের সকল প্রিমিয়াম কোর্স এবং ফ্রি ক্লাস দেখুন এই লিংকে:\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(locale === 'bn' ? 'লিংক সফলভাবে কপি হয়েছে!' : 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error(locale === 'bn' ? 'কপি করতে ব্যর্থ হয়েছে' : 'Failed to copy');
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🎓 ${displayName} একাডেমি`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-background border border-foreground/15 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-foreground/10 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                <span>আপনার ওয়েবসাইট শেয়ার করুন</span>
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 font-medium">
                শিক্ষার্থীদের সরাসরি আপনার পার্সোনালাইজড একাডেমিতে আনুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative z-10">
          
          {/* Target Share Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex items-center justify-between">
              <span>আপনার ডেডিকেটেড একাডেমি লিংক</span>
              <span className="text-orange-500 lowercase text-[11px] font-bold">Auto-Linked URL</span>
            </label>
            
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-foreground/[0.03] border border-foreground/15 focus-within:border-orange-500/50 transition-colors">
              <div className="pl-3 pr-2 text-foreground/40 shrink-0">
                <Globe className="w-4 h-4 text-orange-500" />
              </div>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs sm:text-sm font-mono font-bold text-foreground outline-none select-all truncate"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-Click Quick Social Sharing */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
              এক ক্লিকে সোশ্যাল শেয়ার
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-xs"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-98 shadow-xs"
              >
                <Send className="w-4 h-4 text-[#229ED9]" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

          {/* Explanatory Info Card */}
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
            <div className="flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed font-medium">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">এটি কীভাবে কাজ করে:</span>
                <p className="mt-0.5 text-foreground/70">
                  এই লিংকের মাধ্যমে কোনো শিক্ষার্থী সাইটে প্রবেশ করলে সে সরাসরি আপনার তৈরি করা ওয়েবসাইট (হোম, কোর্স ও অ্যাবাউট পেজ) দেখতে পাবে এবং অ্যাকাউন্ট খুললে স্বয়ংক্রিয়ভাবে আপনার শিক্ষার্থী হিসেবে যুক্ত থাকবে।
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-foreground/[0.02] border-t border-foreground/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold text-xs sm:text-sm transition-all"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
