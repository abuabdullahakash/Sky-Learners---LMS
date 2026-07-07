"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2, User, Camera, Link as LinkIcon, Save, CheckCircle2, Globe, Star, Users, Video } from 'lucide-react';

export default function ProfileBuilderPage() {
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    type: 'individual' as 'individual' | 'institution',
    displayName: user?.displayName || 'John Doe',
    headline: 'Senior Web Developer & Instructor',
    bio: 'Hi, I am a passionate instructor with over 10 years of experience in web development. I love teaching and helping students achieve their goals.',
    facebook: '',
    youtube: '',
    linkedin: '',
    website: '',
    coverPhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop', // Default placeholder
    profilePhoto: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' // Default placeholder
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-foreground/60">Customize your public profile. This is what students will see when they click on your name.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
        
        {/* LEFT PANE: EDITOR FORM */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Account Type */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-foreground/10 pb-2">Account Type</h2>
              <div className="flex gap-4">
                <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${profileData.type === 'individual' ? 'border-primary bg-primary/10 text-primary' : 'border-foreground/10 hover:border-foreground/30'}`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={profileData.type === 'individual'} 
                    onChange={() => setProfileData({...profileData, type: 'individual'})}
                  />
                  <User className="w-8 h-8" />
                  <span className="font-bold">Individual</span>
                  <span className="text-xs text-foreground/60 leading-tight">I am teaching as an individual creator.</span>
                </label>
                
                <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${profileData.type === 'institution' ? 'border-primary bg-primary/10 text-primary' : 'border-foreground/10 hover:border-foreground/30'}`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={profileData.type === 'institution'} 
                    onChange={() => setProfileData({...profileData, type: 'institution'})}
                  />
                  <Building2 className="w-8 h-8" />
                  <span className="font-bold">Institution</span>
                  <span className="text-xs text-foreground/60 leading-tight">We are an academy/institute with multiple teachers.</span>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-foreground/10 pb-2">Basic Information</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">{profileData.type === 'individual' ? 'Full Name' : 'Institution Name'}</label>
                <input 
                  type="text" 
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Headline / Tagline</label>
                <input 
                  type="text" 
                  value={profileData.headline}
                  onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Senior Software Engineer at Google"
                  maxLength={60}
                />
                <p className="text-xs text-foreground/50 text-right">{profileData.headline.length}/60</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">About / Biography</label>
                <textarea 
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
                  placeholder="Write something about yourself or your institution..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-foreground/10 pb-2">Social Links</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="url" 
                    placeholder="Website URL"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="url" 
                    placeholder="Facebook Profile/Page URL"
                    value={profileData.facebook}
                    onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                    className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="url" 
                    placeholder="YouTube Channel URL"
                    value={profileData.youtube}
                    onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                    className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input 
                    type="url" 
                    placeholder="LinkedIn Profile/Company URL"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                    className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-between">
              {saveSuccess ? (
                <div className="text-green-500 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-left-4">
                  <CheckCircle2 className="w-5 h-5" /> Profile Updated!
                </div>
              ) : <div></div>}
              
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Profile</>}
              </button>
            </div>
            
          </form>
        </div>

        {/* RIGHT PANE: LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Preview
            </h2>
          </div>
          
          {/* Public Profile Card Simulation */}
          <div className="bg-background border border-foreground/10 rounded-[2rem] overflow-hidden shadow-2xl">
            
            {/* Cover Photo */}
            <div className="h-48 relative group bg-foreground/10">
              <img 
                src={profileData.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium backdrop-blur-md">
                  <Camera className="w-4 h-4" /> Change Cover
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 relative">
              
              {/* Profile Photo */}
              <div className="relative w-32 h-32 -mt-16 mb-4 group inline-block">
                <img 
                  src={profileData.profilePhoto} 
                  alt="Profile" 
                  className={`w-full h-full object-cover border-4 border-background bg-foreground/5 ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}
                />
                <div className={`absolute inset-0 border-4 border-transparent bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Name & Headline */}
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold truncate max-w-[250px]">{profileData.displayName || 'Your Name'}</h1>
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
              </div>
              <p className="text-primary font-medium text-sm mb-6">{profileData.headline || 'Your Headline'}</p>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 mb-8 border-y border-foreground/10 py-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-foreground/40" />
                  <div>
                    <p className="font-bold text-sm leading-none">1.2k</p>
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-foreground/40" />
                  <div>
                    <p className="font-bold text-sm leading-none">5</p>
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-bold text-sm leading-none">4.8</p>
                    <p className="text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Rating</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-foreground/50">About</h3>
                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {profileData.bio || 'Write something about yourself...'}
                </p>
              </div>

              {/* Social Links Output */}
              <div className="flex items-center gap-3">
                {profileData.website && (
                  <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/60 hover:bg-primary hover:text-white transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {profileData.facebook && (
                  <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
                {profileData.youtube && (
                  <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
                {profileData.linkedin && (
                  <a href="#" className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
                {!profileData.website && !profileData.facebook && !profileData.youtube && !profileData.linkedin && (
                  <p className="text-sm text-foreground/40 italic">No social links added yet.</p>
                )}
              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
