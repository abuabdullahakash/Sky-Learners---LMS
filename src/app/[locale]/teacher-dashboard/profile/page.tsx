"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Building2, User, Camera, Link as LinkIcon, Save, CheckCircle2, Globe, Star, Users, Video, X, Plus, GraduationCap, Briefcase, BookOpen, Presentation, Eye, Upload, Loader2 } from 'lucide-react';

export default function ProfileBuilderPage() {
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageId(id);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateTeacher(id, 'image', data.data.url);
      } else {
        console.error("ImgBB upload failed", data);
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    } finally {
      setUploadingImageId(null);
    }
  };

  const [profileData, setProfileData] = useState({
    type: 'individual' as 'individual' | 'institution',
    displayName: user?.displayName || 'John Doe',
    headline: 'Senior Physics Lecturer',
    bio: 'I am a passionate instructor with over 10 years of experience in teaching Physics. I help students prepare for board exams and engineering admissions.',
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

  // Helper for array inputs (tags)
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

  // Helper for Experiences
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

  // Helper for Teachers Roster (Institution)
  const addTeacher = () => {
    setProfileData(prev => ({
      ...prev,
      teachersRoster: [...prev.teachersRoster, { id: Date.now().toString(), name: '', image: '', university: '', subjects: '', classes: '' }]
    }));
  };
  const updateTeacher = (id: string, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      teachersRoster: prev.teachersRoster.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };
  const removeTeacher = (id: string) => {
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
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-foreground/60">Customize your public academic profile. Ensure all details are accurate to build trust with students.</p>
        </div>
        <button 
          onClick={() => setShowPreviewModal(true)}
          className="px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2 shrink-0"
        >
          <Eye className="w-5 h-5" /> Live Preview
        </button>
      </div>

      {/* FULL WIDTH EDITOR FORM */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Account Type */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-foreground/10 pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Type
            </h2>
            <div className="relative">
              <select 
                value={profileData.type}
                onChange={(e) => setProfileData({...profileData, type: e.target.value as 'individual' | 'institution'})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
              >
                <option value="individual">Individual Teacher - I am a single teacher providing classes/courses.</option>
                <option value="institution">Institution / Academy - We are a coaching center or school with multiple teachers.</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-foreground/10 pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Basic Information
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                {profileData.type === 'individual' ? 'Full Name' : 'Institution Name'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                Headline / Designation
              </label>
              <input 
                type="text" 
                value={profileData.headline}
                onChange={(e) => setProfileData({...profileData, headline: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder={profileData.type === 'individual' ? "e.g. Lecturer of Physics, Notre Dame College" : "e.g. The Best Admission Coaching in Dhaka"}
                maxLength={80}
              />
              <p className="text-xs text-foreground/50 text-right">{profileData.headline.length}/80</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">About / Biography</label>
              <textarea 
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors min-h-[150px] resize-y"
                placeholder={profileData.type === 'individual' ? "Write about your educational background, teaching experience, and achievements..." : "Write about your institution's history, mission, and success stories..."}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-foreground/10 pb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Academic Profile
            </h2>
            
            {/* Education Levels (Common) */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80">
                {profileData.type === 'individual' ? 'Education Levels You Teach' : 'Education Levels Covered'}
              </label>
              <div className="flex flex-wrap gap-3">
                {educationLevelOptions.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleEducationLevel(level)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
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

            {/* Individual Specific: Specific Classes */}
            {profileData.type === 'individual' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground/80">Specific Classes / Subjects</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addClass())}
                    className="flex-1 bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. HSC Physics, Class 10 General Math (Press Enter to add)"
                  />
                  <button type="button" onClick={addClass} className="px-6 py-3 bg-foreground/10 text-foreground hover:bg-foreground/20 font-bold rounded-xl transition-colors">
                    Add
                  </button>
                </div>
                {profileData.individualClasses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.individualClasses.map(cls => (
                      <span key={cls} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 text-sm border border-foreground/10">
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

            {/* Individual Specific: Experience */}
            {profileData.type === 'individual' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground/80">Teaching Experience / Workplaces</label>
                  <button type="button" onClick={addExperience} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Workplace
                  </button>
                </div>
                
                <div className="space-y-3">
                  {profileData.experiences.map((exp, index) => (
                    <div key={exp.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-background border border-foreground/10 rounded-2xl relative group">
                      <div className="flex-1 space-y-3">
                        <input 
                          type="text" placeholder="Role/Designation (e.g. Lecturer of Physics)" 
                          value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                          className="w-full bg-transparent border-b border-foreground/20 px-1 py-2 focus:outline-none focus:border-primary text-sm font-medium"
                        />
                        <input 
                          type="text" placeholder="Institution / School Name" 
                          value={exp.institution} onChange={(e) => updateExperience(exp.id, 'institution', e.target.value)}
                          className="w-full bg-transparent border-b border-foreground/20 px-1 py-2 focus:outline-none focus:border-primary text-sm"
                        />
                        <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
                          <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-primary focus:ring-primary" />
                          I currently work here
                        </label>
                      </div>
                      <button type="button" onClick={() => removeExperience(exp.id)} className="sm:absolute sm:right-4 sm:top-4 text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 flex items-center justify-center">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {profileData.experiences.length === 0 && (
                    <p className="text-sm text-foreground/50 italic p-4 bg-background border border-foreground/10 rounded-2xl border-dashed text-center">No experience added yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Institution Specific: Teachers Roster */}
            {profileData.type === 'institution' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-foreground/80 block">Teachers Roster</label>
                    <p className="text-xs text-foreground/60">Add teachers and the subjects/classes they cover.</p>
                  </div>
                  <button type="button" onClick={addTeacher} className="text-sm text-primary font-bold hover:underline flex items-center gap-1 shrink-0">
                    <Plus className="w-4 h-4" /> Add Teacher
                  </button>
                </div>
                
                <div className="space-y-3">
                  {profileData.teachersRoster.map((teacher) => (
                    <div key={teacher.id} className="flex flex-col md:flex-row gap-3 p-4 bg-background border border-foreground/10 rounded-2xl relative">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-xs text-foreground/50 font-bold uppercase">Profile Image (Optional)</span>
                          <div className="flex items-center gap-4 mt-1">
                            {teacher.image && (
                              <img src={teacher.image} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-foreground/10" />
                            )}
                            <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-xl cursor-pointer transition-colors text-sm font-semibold ${uploadingImageId === teacher.id ? 'opacity-50 pointer-events-none' : ''}`}>
                              {uploadingImageId === teacher.id ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload className="w-4 h-4" /> Upload Now</>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(teacher.id, e)}
                                disabled={uploadingImageId === teacher.id}
                              />
                            </label>
                            {teacher.image && (
                               <button type="button" onClick={() => updateTeacher(teacher.id, 'image', '')} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-foreground/50 font-bold uppercase">Teacher Name</span>
                          <input 
                            type="text" placeholder="e.g. Rahim Sir" 
                            value={teacher.name} onChange={(e) => updateTeacher(teacher.id, 'name', e.target.value)}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-foreground/50 font-bold uppercase">University / Institution</span>
                          <input 
                            type="text" placeholder="e.g. Dhaka University" 
                            value={teacher.university || ''} onChange={(e) => updateTeacher(teacher.id, 'university', e.target.value)}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-foreground/50 font-bold uppercase">Subjects</span>
                          <input 
                            type="text" placeholder="e.g. Physics, Math" 
                            value={teacher.subjects} onChange={(e) => updateTeacher(teacher.id, 'subjects', e.target.value)}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-foreground/50 font-bold uppercase">Classes</span>
                          <input 
                            type="text" placeholder="e.g. Class 9, HSC" 
                            value={teacher.classes} onChange={(e) => updateTeacher(teacher.id, 'classes', e.target.value)}
                            className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTeacher(teacher.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 flex items-center justify-center self-start mt-5 md:mt-0">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {profileData.teachersRoster.length === 0 && (
                    <p className="text-sm text-foreground/50 italic p-4 bg-background border border-foreground/10 rounded-2xl border-dashed text-center">No teachers added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-foreground/10 pb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" /> Social Links & Website
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input 
                  type="url" placeholder="Website URL"
                  value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" />
                <input 
                  type="url" placeholder="Facebook Page/Profile"
                  value={profileData.facebook} onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF0000]" />
                <input 
                  type="url" placeholder="YouTube Channel URL"
                  value={profileData.youtube} onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2]" />
                <input 
                  type="url" placeholder="LinkedIn Profile/Company URL"
                  value={profileData.linkedin} onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-foreground/10 flex items-center justify-between">
            {saveSuccess ? (
              <div className="text-green-500 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-left-4">
                <CheckCircle2 className="w-5 h-5" /> Profile Updated!
              </div>
            ) : <div></div>}
            
            <button 
              type="submit" disabled={isSaving}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            >
              {isSaving ? 'Saving...' : <><Save className="w-6 h-6" /> Save Profile</>}
            </button>
          </div>
          
        </form>
      </div>

      {/* FULL SCREEN LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in zoom-in-95 duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setShowPreviewModal(false)}></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl max-h-full bg-background border border-foreground/10 rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-foreground/10">
              <h2 className="font-bold flex items-center gap-2 text-primary">
                <Eye className="w-5 h-5" /> Public Profile Preview
              </h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Design */}
            <div className="pb-12">
              {/* Cover Photo */}
              <div className="h-48 md:h-64 relative bg-foreground/10">
                <img src={profileData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              </div>

              {/* Profile Info Section */}
              <div className="px-6 md:px-12 relative">
                
                {/* Profile Photo */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 mb-4">
                  <img 
                    src={profileData.profilePhoto} alt="Profile" 
                    className={`w-full h-full object-cover border-4 border-background bg-foreground/5 shadow-lg ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}
                  />
                </div>

                {/* Name & Headline */}
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold">{profileData.displayName || (profileData.type === 'individual' ? 'Your Name' : 'Institution Name')}</h1>
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                </div>
                <p className="text-primary font-medium text-lg mb-6">{profileData.headline || 'Your Designation/Headline'}</p>

                {/* Quick Stats (Mocked) */}
                <div className="flex flex-wrap items-center gap-6 md:gap-12 mb-10 py-6 border-y border-foreground/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-foreground/5 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                    <div>
                      <p className="font-bold text-lg leading-none">1.2k+</p>
                      <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mt-1">Students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-foreground/5 rounded-xl"><Video className="w-6 h-6 text-primary" /></div>
                    <div>
                      <p className="font-bold text-lg leading-none">5</p>
                      <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mt-1">Courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-foreground/5 rounded-xl"><Star className="w-6 h-6 text-yellow-500" /></div>
                    <div>
                      <p className="font-bold text-lg leading-none">4.8</p>
                      <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mt-1">Rating</p>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  
                  {/* Left Col: Bio & Academic Info */}
                  <div className="md:col-span-2 space-y-10">
                    <div>
                      <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> About</h3>
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {profileData.bio || 'Detailed biography will appear here...'}
                      </p>
                    </div>

                    {profileData.type === 'individual' && profileData.experiences.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</h3>
                        <div className="space-y-4">
                          {profileData.experiences.map(exp => (
                            <div key={exp.id} className="flex gap-4">
                              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-foreground/50" />
                              </div>
                              <div>
                                <h4 className="font-bold">{exp.role || 'Role'}</h4>
                                <p className="text-foreground/70 text-sm">{exp.institution || 'Institution'}</p>
                                {exp.current && <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full mt-1">Current</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData.type === 'institution' && profileData.teachersRoster.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Presentation className="w-5 h-5 text-primary" /> Our Teachers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profileData.teachersRoster.map(teacher => (
                            <div key={teacher.id} className="group relative p-5 bg-background dark:bg-foreground/[0.02] rounded-3xl border border-foreground/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                              <div className="flex gap-4 items-start relative z-10 pt-2">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0 bg-primary/10 border-4 border-background shadow-md">
                                  {teacher.image ? (
                                    <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary">
                                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 pt-1">
                                  <h4 className="font-bold text-xl mb-0.5 leading-tight">{teacher.name || 'Teacher Name'}</h4>
                                  {teacher.university && <p className="text-xs text-primary font-bold mb-3 tracking-wide uppercase">{teacher.university}</p>}
                                  <p className="text-sm text-foreground/80 mb-3 leading-relaxed"><span className="font-semibold text-foreground">Subjects:</span> {teacher.subjects || 'N/A'}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {teacher.classes.split(',').map((cls, i) => cls.trim() && (
                                      <span key={i} className="text-[11px] px-2.5 py-1 bg-foreground/5 text-foreground rounded-md font-semibold border border-foreground/10 shadow-sm">
                                        {cls.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Col: Education Levels, Classes, Socials */}
                  <div className="space-y-8">
                    
                    {profileData.educationLevels.length > 0 && (
                      <div className="p-6 bg-foreground/5 rounded-3xl border border-foreground/10">
                        <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-foreground/50">Education Levels</h3>
                        <ul className="space-y-2">
                          {profileData.educationLevels.map(level => (
                            <li key={level} className="flex items-center gap-2 text-sm font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> {level}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {profileData.type === 'individual' && profileData.individualClasses.length > 0 && (
                      <div>
                        <h3 className="font-bold mb-3 uppercase text-xs tracking-wider text-foreground/50">Specific Classes</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.individualClasses.map(cls => (
                            <span key={cls} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg border border-primary/20">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold mb-3 uppercase text-xs tracking-wider text-foreground/50">Follow on Socials</h3>
                      <div className="flex flex-wrap gap-3">
                        {profileData.website && (
                          <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                        )}
                        {profileData.facebook && (
                          <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
                        )}
                        {profileData.youtube && (
                          <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
                        )}
                        {profileData.linkedin && (
                          <a href="#" className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
                        )}
                        {!profileData.website && !profileData.facebook && !profileData.youtube && !profileData.linkedin && (
                          <p className="text-sm text-foreground/40 italic">No social links added.</p>
                        )}
                      </div>
                    </div>
                    
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
