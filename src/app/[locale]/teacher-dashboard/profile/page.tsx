"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Building2, User, Camera, Link as LinkIcon, Save, CheckCircle2, Globe, Star, Users, Video, X, Plus, GraduationCap, Briefcase, BookOpen, Presentation, Eye, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ProfileBuilderPage() {
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
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
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(prev => ({ ...prev, profilePhoto: data.data.url }));
      } else {
        alert("Failed to upload profile photo.");
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Error uploading image.");
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverPhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(prev => ({ ...prev, coverPhoto: data.data.url }));
      } else {
        alert("Failed to upload cover banner.");
      }
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      alert("Error uploading image.");
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  const handleRosterTeacherImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTeacherImageId(id);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateTeacherRoster(id, 'image', data.data.url);
      } else {
        alert("Failed to upload teacher image.");
      }
    } catch (error) {
      console.error("Error uploading teacher image:", error);
      alert("Error uploading image.");
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Profile Builder</h1>
          <p className="text-sm text-foreground/60">Customize your public academic profile & institution branding details.</p>
        </div>
        <button 
          onClick={() => setShowPreviewModal(true)}
          className="px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center gap-2 shrink-0 text-sm shadow-sm"
        >
          <Eye className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* SECTION 1: Profile Type */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground border-b border-foreground/10 pb-3">
            <User className="w-5 h-5 text-primary" /> 1. Account Profile Type
          </h2>
          <div className="relative">
            <select 
              value={profileData.type}
              onChange={(e) => setProfileData({...profileData, type: e.target.value as 'individual' | 'institution'})}
              className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium text-sm"
            >
              <option value="individual">Individual Teacher - Single instructor profile</option>
              <option value="institution">Institution / Academy - Coaching center or school with multiple teachers</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* SECTION 2: Profile & Cover Branding Images */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground border-b border-foreground/10 pb-3">
            <ImageIcon className="w-5 h-5 text-primary" /> 2. Profile Branding & Media
          </h2>

          {/* Cover Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 flex items-center justify-between">
              <span>Cover Banner Photo</span>
              <span className="text-xs text-foreground/50 font-normal">Recommended size: 1200 x 400px</span>
            </label>
            <div className="relative h-44 rounded-xl overflow-hidden bg-foreground/10 border border-foreground/10 group">
              <img 
                src={profileData.coverPhoto} 
                alt="Cover Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
                <label className="px-4 py-2.5 bg-white dark:bg-gray-900 text-foreground font-bold text-sm rounded-xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                  {uploadingCoverPhoto ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-primary" /> Uploading Cover...</>
                  ) : (
                    <><Upload className="w-4 h-4 text-primary" /> Upload Cover Banner</>
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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">
              {profileData.type === 'individual' ? 'Profile Picture' : 'Institution Logo'}
            </label>
            <div className="flex items-center gap-6 p-4 bg-foreground/5 rounded-xl border border-foreground/10">
              <div className={`w-20 h-20 overflow-hidden bg-foreground/10 border-2 border-primary/20 shrink-0 shadow-sm ${profileData.type === 'institution' ? 'rounded-xl' : 'rounded-full'}`}>
                <img 
                  src={profileData.profilePhoto} 
                  alt="Profile Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                  {uploadingProfilePhoto ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera className="w-4 h-4" /> Upload {profileData.type === 'individual' ? 'Photo' : 'Logo'}</>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePhotoUpload}
                    disabled={uploadingProfilePhoto}
                    className="hidden" 
                  />
                </label>
                <p className="text-xs text-foreground/60">PNG or JPG under 5MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Basic Information */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground border-b border-foreground/10 pb-3">
            <BookOpen className="w-5 h-5 text-primary" /> 3. Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                {profileData.type === 'individual' ? 'Full Name' : 'Institution Name'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Headline / Designation</label>
              <input 
                type="text" 
                value={profileData.headline}
                onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder={profileData.type === 'individual' ? "e.g. Senior Physics Lecturer" : "e.g. Premier Coaching Center in Dhaka"}
                maxLength={80}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">About / Biography</label>
            <textarea 
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-y"
              placeholder="Write a clear biography describing educational background, achievements and mission..."
            />
          </div>
        </div>

        {/* SECTION 4: Academic Profile */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground border-b border-foreground/10 pb-3">
            <GraduationCap className="w-5 h-5 text-primary" /> 4. Academic Profile & Classes
          </h2>
          
          {/* Education Levels */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80">
              {profileData.type === 'individual' ? 'Education Levels You Teach' : 'Education Levels Covered'}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {educationLevelOptions.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleEducationLevel(level)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    profileData.educationLevels.includes(level) 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-background border-foreground/20 text-foreground/70 hover:border-foreground/40'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Specific Classes */}
          {profileData.type === 'individual' && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-foreground/80">Specific Subjects / Batches</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClass())}
                  className="flex-1 bg-background border border-foreground/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. HSC Physics 1st Paper, Class 10 Math"
                />
                <button type="button" onClick={addClass} className="px-5 py-2.5 bg-foreground/10 text-foreground hover:bg-foreground/20 font-bold text-sm rounded-xl transition-colors">
                  Add
                </button>
              </div>
              {profileData.individualClasses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.individualClasses.map(cls => (
                    <span key={cls} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-foreground/5 text-xs font-semibold border border-foreground/10">
                      {cls}
                      <button type="button" onClick={() => removeClass(cls)} className="text-foreground/50 hover:text-red-500">
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
                <label className="text-sm font-semibold text-foreground/80">Teaching Experience / Workplaces</label>
                <button type="button" onClick={addExperience} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
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
                        className="w-full bg-transparent border-b border-foreground/20 px-1 py-1 text-sm font-medium focus:outline-none focus:border-primary"
                      />
                      <input 
                        type="text" placeholder="Institution Name" 
                        value={exp.institution} onChange={(e) => updateExperience(exp.id, 'institution', e.target.value)}
                        className="w-full bg-transparent border-b border-foreground/20 px-1 py-1 text-sm focus:outline-none focus:border-primary"
                      />
                      <label className="flex items-center gap-2 text-xs text-foreground/70 cursor-pointer pt-1">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-primary focus:ring-primary" />
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

          {/* Institution Specific Teachers Roster */}
          {profileData.type === 'institution' && (
            <div className="space-y-4 pt-2 border-t border-foreground/10">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-foreground/80 block">Teachers Roster</label>
                  <p className="text-xs text-foreground/60">Add teachers and their subjects/classes.</p>
                </div>
                <button type="button" onClick={addTeacherRoster} className="text-xs text-primary font-bold hover:underline flex items-center gap-1 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add Teacher
                </button>
              </div>
              
              <div className="space-y-3">
                {profileData.teachersRoster.map((teacher) => (
                  <div key={teacher.id} className="flex flex-col md:flex-row gap-3 p-4 bg-background border border-foreground/10 rounded-xl relative">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs text-foreground/50 font-bold uppercase">Teacher Photo</span>
                        <div className="flex items-center gap-3 mt-1">
                          {teacher.image && (
                            <img src={teacher.image} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-foreground/10" />
                          )}
                          <label className={`px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5 ${uploadingTeacherImageId === teacher.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploadingTeacherImageId === teacher.id ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="w-3.5 h-3.5" /> Upload Photo</>
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
                            <button type="button" onClick={() => updateTeacherRoster(teacher.id, 'image', '')} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold uppercase">Teacher Name</span>
                        <input 
                          type="text" placeholder="e.g. Rahim Sir" 
                          value={teacher.name} onChange={(e) => updateTeacherRoster(teacher.id, 'name', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold uppercase">University / Degree</span>
                        <input 
                          type="text" placeholder="e.g. Dhaka University" 
                          value={teacher.university || ''} onChange={(e) => updateTeacherRoster(teacher.id, 'university', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold uppercase">Subjects</span>
                        <input 
                          type="text" placeholder="e.g. Physics, Higher Math" 
                          value={teacher.subjects} onChange={(e) => updateTeacherRoster(teacher.id, 'subjects', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-foreground/50 font-bold uppercase">Classes</span>
                        <input 
                          type="text" placeholder="e.g. HSC, Admission" 
                          value={teacher.classes} onChange={(e) => updateTeacherRoster(teacher.id, 'classes', e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeTeacherRoster(teacher.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 self-start">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Social Links */}
        <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground border-b border-foreground/10 pb-3">
            <LinkIcon className="w-5 h-5 text-primary" /> 5. Social Links & Website
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input 
                type="url" placeholder="Website URL"
                value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" />
              <input 
                type="url" placeholder="Facebook Profile/Page URL"
                value={profileData.facebook} onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF0000]" />
              <input 
                type="url" placeholder="YouTube Channel URL"
                value={profileData.youtube} onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]" />
              <input 
                type="url" placeholder="LinkedIn Profile URL"
                value={profileData.linkedin} onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex items-center justify-between">
          {saveSuccess ? (
            <div className="text-green-600 font-bold flex items-center gap-2 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" /> Profile successfully saved!
            </div>
          ) : <div></div>}
          
          <button 
            type="submit" disabled={isSaving}
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-primary/30 flex items-center gap-2 text-base disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Profile</>}
          </button>
        </div>
      </form>

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
            
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/10">
              <h2 className="font-bold flex items-center gap-2 text-primary">
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
                <p className="text-primary font-semibold text-base mb-4">{profileData.headline || 'Headline'}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-foreground/10">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> About</h3>
                      <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
                    </div>

                    {profileData.type === 'institution' && profileData.teachersRoster.length > 0 && (
                      <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Presentation className="w-4 h-4 text-primary" /> Our Teachers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profileData.teachersRoster.map(t => (
                            <div key={t.id} className="p-4 bg-foreground/5 rounded-xl border border-foreground/10 flex gap-3 items-center">
                              <img src={t.image || profileData.profilePhoto} alt={t.name} className="w-12 h-12 rounded-full object-cover border" />
                              <div>
                                <h4 className="font-bold text-sm">{t.name}</h4>
                                <p className="text-xs text-primary">{t.subjects}</p>
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
