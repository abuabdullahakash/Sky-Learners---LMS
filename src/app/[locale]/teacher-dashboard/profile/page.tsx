"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { User, Camera, Link as LinkIcon, Save, CheckCircle2, Globe, GraduationCap, BookOpen, Presentation, Eye, Upload, Loader2, Image as ImageIcon, Plus, X, Trash2, Sparkles, ChevronDown, ShieldCheck, Building2 } from 'lucide-react';

export default function ProfileBuilderPage() {
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [uploadingTeacherImageId, setUploadingTeacherImageId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    type: 'individual' as 'individual' | 'institution',
    displayName: user?.displayName || 'John Doe',
    headline: 'Senior Physics Lecturer',
    bio: 'I am a passionate instructor with over 10 years of experience in teaching. I help students prepare for board exams and competitive tests.',
    facebook: '',
    youtube: '',
    linkedin: '',
    website: '',
    customLinks: [] as { id: string; label: string; url: string }[],
    coverPhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
    profilePhoto: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    
    // Academic Specific Fields
    educationLevels: [] as string[],
    individualClasses: [] as string[],
    experiences: [
      { id: '1', role: 'Lecturer of Physics', institution: 'Notre Dame College', current: true }
    ],
    
    // Institution Specific Fields
    teachersRoster: [
      { id: '1', name: 'Rahim Sir', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim', university: 'Dhaka University', subjects: 'Physics', classes: 'HSC, Admission' }
    ]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'teacherProfiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData((prev) => ({ ...prev, ...docSnap.data() }));
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setProfileData(prev => ({ ...prev, profilePhoto: url }));
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Failed to upload profile photo. Please try again.");
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverPhoto(true);
    try {
      const url = await uploadImageToImgBB(file);
      setProfileData(prev => ({ ...prev, coverPhoto: url }));
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      alert("Failed to upload cover photo. Please try again.");
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  const handleRosterTeacherImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTeacherImageId(id);
    try {
      const url = await uploadImageToImgBB(file);
      updateTeacherRoster(id, 'image', url);
    } catch (error) {
      console.error("Error uploading teacher image:", error);
      alert("Failed to upload teacher image. Please try again.");
    } finally {
      setUploadingTeacherImageId(null);
    }
  };

  const educationLevelOptions = ['Primary', 'High School (SSC)', 'Intermediate (HSC)', 'Admission', 'Undergraduate (Hons)'];

  const toggleEducationLevel = (level: string) => {
    setProfileData(prev => {
      const exists = prev.educationLevels.includes(level);
      return {
        ...prev,
        educationLevels: exists 
          ? prev.educationLevels.filter(l => l !== level)
          : [...prev.educationLevels, level]
      };
    });
  };

  const [classInput, setClassInput] = useState('');
  const addClass = () => {
    if (classInput.trim() && !profileData.individualClasses.includes(classInput.trim())) {
      setProfileData(prev => ({...prev, individualClasses: [...prev.individualClasses, classInput.trim()]}));
      setClassInput('');
    }
  };
  const removeClass = (cls: string) => {
    setProfileData(prev => ({...prev, individualClasses: prev.individualClasses.filter(c => c !== cls)}));
  };

  const addExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { id: Date.now().toString(), role: '', institution: '', current: false }]
    }));
  };
  const updateExperience = (id: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };
  const removeExperience = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const addTeacherRoster = () => {
    setProfileData(prev => ({
      ...prev,
      teachersRoster: [...prev.teachersRoster, { id: Date.now().toString(), name: '', image: '', university: '', subjects: '', classes: '' }]
    }));
  };
  const updateTeacherRoster = (id: string, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      teachersRoster: prev.teachersRoster.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };
  const removeTeacherRoster = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      teachersRoster: prev.teachersRoster.filter(t => t.id !== id)
    }));
  };

  // Custom Social Links Functions
  const addCustomSocialLink = () => {
    setProfileData(prev => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), { id: Date.now().toString(), label: '', url: '' }]
    }));
  };
  const updateCustomSocialLink = (id: string, field: 'label' | 'url', value: string) => {
    setProfileData(prev => ({
      ...prev,
      customLinks: (prev.customLinks || []).map(link => link.id === id ? { ...link, [field]: value } : link)
    }));
  };
  const removeCustomSocialLink = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter(link => link.id !== id)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'teacherProfiles', user.uid), profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-9 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-white/10 mb-8">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Profile Management
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 text-xs font-semibold rounded-full border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Public Ready
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            My Profile <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Builder</span>
          </h1>

          <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed font-medium pt-1">
            Customize your public academic profile & institution branding details. Stand out to students with a clean, high-converting instructor profile.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span>Live Sync to Public Directory</span>
            </div>
            <span className="hidden sm:inline text-white/20">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>Verified Instructor Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">

        {/* SECTION 1: Account Profile Type Selector */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="border-b border-foreground/10 pb-3.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-orange-500 shrink-0" /> 1. Account Profile Type
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
              Select how your account is structured and presented to students across the portal.
            </p>
          </div>

          {/* Custom Dropdown Trigger Box (Mobile & Desktop Friendly) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full bg-background dark:bg-slate-900/60 border border-foreground/20 hover:border-orange-500/50 rounded-xl p-3.5 sm:p-4 text-left transition-all flex items-center justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  {profileData.type === 'individual' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-extrabold text-sm sm:text-base text-foreground">
                      {profileData.type === 'individual' ? 'Individual Teacher' : 'Institution / Academy'}
                    </p>
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase rounded-full shrink-0 border border-orange-500/20">
                      Active Type
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 font-medium leading-relaxed mt-1 break-words">
                    {profileData.type === 'individual' 
                      ? 'Single instructor profile for independent tutors and teachers' 
                      : 'Coaching center, school, or organization with multiple teachers'}
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-foreground/5 text-foreground/60 group-hover:text-orange-500 shrink-0 transition-colors">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Custom Floating Dropdown Popup Overlay */}
            {isTypeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity" 
                  onClick={() => setIsTypeDropdownOpen(false)}
                />
                
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-background dark:bg-slate-900 border border-foreground/15 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground/50 border-b border-foreground/10 flex items-center justify-between">
                    <span>Select Profile Structure</span>
                    <span className="text-[10px] text-orange-500 font-semibold">Clean Text Wrap</span>
                  </div>

                  {/* Option 1: Individual */}
                  <div
                    onClick={() => {
                      setProfileData({...profileData, type: 'individual'});
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      profileData.type === 'individual'
                        ? 'bg-orange-500/10 border-orange-500/50 shadow-xs'
                        : 'bg-background hover:bg-foreground/5 border-foreground/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      profileData.type === 'individual' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-foreground/10 text-foreground/70'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">Individual Teacher</h4>
                        {profileData.type === 'individual' && (
                          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed font-medium mt-1 break-words">
                        Single instructor profile for independent tutors, school teachers, and private educators.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Institution */}
                  <div
                    onClick={() => {
                      setProfileData({...profileData, type: 'institution'});
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      profileData.type === 'institution'
                        ? 'bg-orange-500/10 border-orange-500/50 shadow-xs'
                        : 'bg-background hover:bg-foreground/5 border-foreground/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      profileData.type === 'institution' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-foreground/10 text-foreground/70'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">Institution / Academy</h4>
                        {profileData.type === 'institution' && (
                          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed font-medium mt-1 break-words">
                        Coaching center, school, or educational institution with multiple teachers roster and team branding.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Choice Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setProfileData({...profileData, type: 'individual'})}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                profileData.type === 'individual'
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 shadow-xs'
                  : 'bg-background hover:bg-foreground/5 border-foreground/10'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${profileData.type === 'individual' ? 'bg-orange-500 text-white' : 'bg-foreground/10 text-foreground/60'}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs sm:text-sm text-foreground">Individual Teacher</p>
                <p className="text-[11px] text-foreground/70 leading-relaxed mt-0.5 break-words">Single instructor profile</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProfileData({...profileData, type: 'institution'})}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                profileData.type === 'institution'
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30 shadow-xs'
                  : 'bg-background hover:bg-foreground/5 border-foreground/10'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${profileData.type === 'institution' ? 'bg-orange-500 text-white' : 'bg-foreground/10 text-foreground/60'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs sm:text-sm text-foreground">Institution / Academy</p>
                <p className="text-[11px] text-foreground/70 leading-relaxed mt-0.5 break-words">Coaching center or school</p>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: Profile & Cover Branding Images */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-foreground/10 pb-3.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <ImageIcon className="w-5 h-5 text-orange-500 shrink-0" /> 2. Profile Branding & Media
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
              Upload high-quality cover banners and your main instructor portrait or institution logo.
            </p>
          </div>

          {/* Cover Photo Upload */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
              <label className="text-sm font-bold text-foreground">Cover Banner Photo</label>
              <span className="text-xs text-foreground/60 font-medium">Recommended size: 1200 × 400px</span>
            </div>
            
            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-foreground/10 border border-foreground/10 group shadow-inner">
              <img 
                src={profileData.coverPhoto} 
                alt="Cover Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
                <label className="px-4 py-2.5 bg-slate-900 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                  {uploadingCoverPhoto ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-orange-500" /> Uploading Cover...</>
                  ) : (
                    <><Upload className="w-4 h-4 text-orange-500" /> Upload Cover Banner</>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverPhotoUpload}
                    disabled={uploadingCoverPhoto}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Profile Photo / Logo Upload */}
          <div className="space-y-2.5 pt-3 border-t border-foreground/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <label className="text-sm font-bold text-foreground block">
                {profileData.type === 'individual' ? 'Profile Picture' : 'Institution Logo'}
              </label>
              <span className="text-xs text-foreground/60 font-medium">Square avatar or badge under 5MB</span>
            </div>

            <div className="flex flex-row items-center gap-3.5 sm:gap-5 p-4 sm:p-5 bg-foreground/5 rounded-2xl border border-foreground/10">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-foreground/10 border-2 border-orange-500/30 shrink-0 shadow-md ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}>
                <img 
                  src={profileData.profilePhoto} 
                  alt="Profile Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <p className="text-xs font-bold text-foreground">{profileData.type === 'individual' ? 'Instructor Photo' : 'Brand Logo'}</p>
                  <p className="text-[11px] text-foreground/60 font-medium mt-0.5">PNG or JPG under 5MB</p>
                </div>
                <label className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all shadow-md shadow-orange-500/20 whitespace-nowrap flex items-center gap-1.5 shrink-0">
                  {uploadingProfilePhoto ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera className="w-3.5 h-3.5" /> Upload {profileData.type === 'individual' ? 'Photo' : 'Logo'}</>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePhotoUpload}
                    disabled={uploadingProfilePhoto}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Basic Information */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-foreground/10 pb-3.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="w-5 h-5 text-orange-500 shrink-0" /> 3. Basic Information
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
              Enter your full display name, professional headline, and academic background details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90 block mb-1">
                {profileData.type === 'individual' ? 'Full Name' : 'Institution Name'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90 block mb-1">Headline / Designation</label>
              <input 
                type="text" 
                value={profileData.headline}
                onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                placeholder={profileData.type === 'individual' ? "e.g. Senior Physics Lecturer" : "e.g. Premier Coaching Center in Dhaka"}
                maxLength={80}
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-sm font-bold text-foreground/90 block mb-1">About / Biography</label>
            <textarea 
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors min-h-[130px] resize-y font-medium leading-relaxed"
              placeholder="Write a clear biography describing educational background, achievements and mission..."
            />
          </div>
        </div>

        {/* SECTION 4: Academic Profile */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-7">
          <div className="border-b border-foreground/10 pb-3.5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <GraduationCap className="w-5 h-5 text-orange-500 shrink-0" /> 4. Academic Profile & Classes
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
              Specify your target education levels, subject expertise, and teaching experience or team roster.
            </p>
          </div>
          
          {/* Education Levels - Orange Badges when Selected */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground">
              {profileData.type === 'individual' ? 'Education Levels You Teach' : 'Education Levels Covered'}
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {educationLevelOptions.map(level => {
                const isSelected = profileData.educationLevels.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleEducationLevel(level)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                      isSelected 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/20' 
                        : 'bg-background border-foreground/20 text-foreground/70 hover:border-orange-500/50'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Specific Classes */}
          {profileData.type === 'individual' && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-foreground">Specific Subjects / Batches</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClass())}
                  className="flex-1 bg-background border border-foreground/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                  placeholder="e.g. HSC Physics 1st Paper, Class 10 Math"
                />
                <button type="button" onClick={addClass} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-orange-500/20">
                  Add
                </button>
              </div>
              {profileData.individualClasses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.individualClasses.map(cls => (
                    <span key={cls} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
                      {cls}
                      <button type="button" onClick={() => removeClass(cls)} className="text-orange-500 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Individual Specific Experiences */}
          {profileData.type === 'individual' && (
            <div className="space-y-3 pt-2 border-t border-foreground/10">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Teaching Experience / Workplaces</label>
                <button type="button" onClick={addExperience} className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Workplace
                </button>
              </div>
              
              <div className="space-y-3">
                {profileData.experiences.map((exp) => (
                  <div key={exp.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-background border border-foreground/10 rounded-xl relative">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" placeholder="Role/Designation (e.g. Lecturer of Physics)" 
                        value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        className="w-full bg-transparent border-b border-foreground/20 px-1 py-1 text-sm font-medium focus:outline-none focus:border-orange-500"
                      />
                      <input 
                        type="text" placeholder="Institution Name" 
                        value={exp.institution} onChange={(e) => updateExperience(exp.id, 'institution', e.target.value)}
                        className="w-full bg-transparent border-b border-foreground/20 px-1 py-1 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <label className="flex items-center gap-2 text-xs text-foreground/70 cursor-pointer pt-1">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-orange-500 focus:ring-orange-500" />
                        Currently teaching here
                      </label>
                    </div>
                    <button type="button" onClick={() => removeExperience(exp.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 self-start">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institution Specific Teachers Roster (Responsive Layout) */}
          {profileData.type === 'institution' && (
            <div className="space-y-4 pt-2 border-t border-foreground/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-foreground block">Teachers Roster</label>
                  <p className="text-xs text-foreground/60">Add teachers and their subjects/classes.</p>
                </div>
                <button type="button" onClick={addTeacherRoster} className="px-3 py-1.5 bg-orange-500 text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1 shrink-0 shadow-sm">
                  <Plus className="w-3.5 h-3.5" /> Add Teacher
                </button>
              </div>
              
              <div className="space-y-4">
                {profileData.teachersRoster.map((teacher) => (
                  <div key={teacher.id} className="p-4 bg-background border border-foreground/10 rounded-2xl relative space-y-4 shadow-sm">
                    {/* Header with Remove button */}
                    <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Teacher Entry</span>
                      <button 
                        type="button" 
                        onClick={() => removeTeacherRoster(teacher.id)} 
                        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 px-2.5 py-1 bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    {/* Teacher Photo */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-foreground/50 font-bold uppercase tracking-wider">Teacher Photo</span>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-foreground/10 border border-foreground/10 shrink-0">
                          {teacher.image ? (
                            <img src={teacher.image} alt="Teacher" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 m-3 text-foreground/40" />
                          )}
                        </div>
                        <label className={`px-3 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl cursor-pointer transition-colors text-xs font-bold flex items-center gap-1.5 ${uploadingTeacherImageId === teacher.id ? 'opacity-50 pointer-events-none' : ''}`}>
                          {uploadingTeacherImageId === teacher.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" /> Uploading...</>
                          ) : (
                            <><Upload className="w-3.5 h-3.5 text-orange-500" /> Upload Photo</>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleRosterTeacherImageUpload(teacher.id, e)}
                            disabled={uploadingTeacherImageId === teacher.id}
                          />
                        </label>
                        {teacher.image && (
                          <button type="button" onClick={() => updateTeacherRoster(teacher.id, 'image', '')} className="text-xs text-red-500 font-bold hover:underline">Remove Photo</button>
                        )}
                      </div>
                    </div>

                    {/* Responsive Grid Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-foreground/60 font-bold uppercase">Teacher Name</span>
                        <input 
                          type="text" placeholder="e.g. Rahim Sir" 
                          value={teacher.name} onChange={(e) => updateTeacherRoster(teacher.id, 'name', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-foreground/60 font-bold uppercase">University / Degree</span>
                        <input 
                          type="text" placeholder="e.g. Dhaka University" 
                          value={teacher.university || ''} onChange={(e) => updateTeacherRoster(teacher.id, 'university', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-foreground/60 font-bold uppercase">Subjects</span>
                        <input 
                          type="text" placeholder="e.g. Physics, Higher Math" 
                          value={teacher.subjects} onChange={(e) => updateTeacherRoster(teacher.id, 'subjects', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-foreground/60 font-bold uppercase">Classes</span>
                        <input 
                          type="text" placeholder="e.g. HSC, Admission" 
                          value={teacher.classes} onChange={(e) => updateTeacherRoster(teacher.id, 'classes', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Social Links & Custom Links */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-foreground/10 pb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
                <LinkIcon className="w-5 h-5 text-orange-500 shrink-0" /> 5. Social Links & Website
              </h2>
              <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1">
                Connect your website, social media handles, and custom external links.
              </p>
            </div>
            <button 
              type="button" 
              onClick={addCustomSocialLink}
              className="px-3.5 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 border border-orange-500/20 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Custom Link
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="url" placeholder="Website URL"
                value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" />
              <input 
                type="url" placeholder="Facebook Profile/Page URL"
                value={profileData.facebook} onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF0000]" />
              <input 
                type="url" placeholder="YouTube Channel URL"
                value={profileData.youtube} onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]" />
              <input 
                type="url" placeholder="LinkedIn Profile URL"
                value={profileData.linkedin} onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
              />
            </div>

            {/* Dynamic Custom Links */}
            {(profileData.customLinks || []).map((link) => (
              <div key={link.id} className="flex items-center gap-2 md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Platform Label (e.g. Telegram / Portfolio)" 
                  value={link.label} 
                  onChange={(e) => updateCustomSocialLink(link.id, 'label', e.target.value)}
                  className="w-1/3 bg-background border border-foreground/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                />
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={link.url} 
                    onChange={(e) => updateCustomSocialLink(link.id, 'url', e.target.value)}
                    className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeCustomSocialLink(link.id)}
                  className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save & Live Preview Action Bar (Both Orange & In Same Row) */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-foreground/10">
          {saveSuccess ? (
            <div className="text-green-500 font-bold flex items-center gap-2 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" /> Profile successfully saved!
            </div>
          ) : <div className="hidden sm:block"></div>}
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Live Preview Button (Orange Style in Same Row) */}
            <button 
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/30 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </button>

            {/* Save Profile Button (Solid Orange) */}
            <button 
              type="submit" disabled={isSaving}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
            
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/10">
              <h2 className="font-bold flex items-center gap-2 text-orange-500">
                <Eye className="w-5 h-5" /> Public Profile Preview
              </h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pb-10">
              <div className="h-44 relative bg-foreground/10">
                <img src={profileData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              </div>

              <div className="px-6 relative">
                <div className="relative w-28 h-28 -mt-14 mb-4">
                  <img 
                    src={profileData.profilePhoto} alt="Profile" 
                    className={`w-full h-full object-cover border-4 border-background bg-foreground/5 shadow-md ${profileData.type === 'institution' ? 'rounded-xl' : 'rounded-full'}`}
                  />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{profileData.displayName || 'Name'}</h1>
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                </div>
                <p className="text-orange-500 font-semibold text-base mb-4">{profileData.headline || 'Headline'}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-foreground/10">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><User className="w-4 h-4 text-orange-500" /> About</h3>
                      <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
                    </div>

                    {profileData.type === 'institution' && profileData.teachersRoster.length > 0 && (
                      <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Presentation className="w-4 h-4 text-orange-500" /> Our Teachers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profileData.teachersRoster.map(t => (
                            <div key={t.id} className="p-4 bg-foreground/5 rounded-xl border border-foreground/10 flex gap-3 items-center">
                              <img src={t.image || profileData.profilePhoto} alt={t.name} className="w-12 h-12 rounded-full object-cover border" />
                              <div>
                                <h4 className="font-bold text-sm">{t.name}</h4>
                                <p className="text-xs text-orange-500 font-medium">{t.subjects}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {profileData.educationLevels.length > 0 && (
                      <div className="p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground/60 mb-2">Education Levels</h4>
                        <ul className="space-y-1">
                          {profileData.educationLevels.map(lvl => (
                            <li key={lvl} className="text-xs font-semibold flex items-center gap-1.5 text-foreground/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {lvl}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
