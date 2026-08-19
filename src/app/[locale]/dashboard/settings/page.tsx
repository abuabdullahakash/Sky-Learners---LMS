"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { User, Shield, Bell, CreditCard, Camera, CheckCircle2, XCircle, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Receipt, Printer, FileText, Clock, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadImageToImgBB } from '@/lib/imgbb';

export default function SettingsPage() {
  const t = useTranslations('Dashboard.settings');
  const locale = useLocale();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, userData, refreshUserData } = useAuth();

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user || activeTab !== 'billing') return;
      setIsLoadingHistory(true);
      try {
        const recordsMap = new Map<string, any>();
        const uidSnap = await getDocs(query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        ));
        uidSnap.forEach((docSnap) => {
          recordsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
        });

        if (user.email) {
          const userEmail = user.email.toLowerCase().trim();
          const [bySEmail, byCEmail] = await Promise.all([
            getDocs(query(collection(db, 'enrollments'), where('studentEmail', '==', userEmail))),
            getDocs(query(collection(db, 'enrollments'), where('contactEmail', '==', userEmail)))
          ]);
          bySEmail.forEach((docSnap) => {
            recordsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });
          byCEmail.forEach((docSnap) => {
            recordsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          });
        }

        const records = Array.from(recordsMap.values());
        // Sort by createdAt desc
        records.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setPaymentHistory(records);
      } catch (err) {
        console.error("Error fetching payment history", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchPaymentHistory();
  }, [user, activeTab]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form states
  const [name, setName] = useState(user?.displayName || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [dob, setDob] = useState(userData?.dob || '');
  const [gender, setGender] = useState(userData?.gender || '');
  const [institution, setInstitution] = useState(userData?.institution || '');
  const [eduLevel, setEduLevel] = useState(userData?.eduLevel || '');
  const [studentClass, setStudentClass] = useState(userData?.class || '');
  const [department, setDepartment] = useState(userData?.department || '');
  const [year, setYear] = useState(userData?.year || '');

  // Sync states when userData or user is loaded
  useEffect(() => {
    if (user?.displayName && !name) setName(user.displayName);
    if (user?.photoURL && !photoUrl) setPhotoUrl(user.photoURL);
    if (userData) {
      if (userData.phone) setPhone(userData.phone);
      if (userData.dob) setDob(userData.dob);
      if (userData.gender) setGender(userData.gender);
      if (userData.institution) setInstitution(userData.institution);
      if (userData.eduLevel) setEduLevel(userData.eduLevel);
      if (userData.class) setStudentClass(userData.class);
      if (userData.department) setDepartment(userData.department);
      if (userData.year) setYear(userData.year);
    }
  }, [user, userData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      setPhotoUrl(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoUrl || user.photoURL,
        });
      }

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        phone,
        dob,
        gender,
        institution,
        eduLevel,
        class: studentClass,
        department,
        year,
        photoUrl: photoUrl || user.photoURL || '',
        photoURL: photoUrl || user.photoURL || '',
        profilePhoto: photoUrl || user.photoURL || '',
      });
      // Try to refresh user data in context if possible
      if (refreshUserData) {
        await refreshUserData();
      }
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'security', label: t('tabs.security'), icon: Shield },
    { id: 'preferences', label: t('tabs.preferences'), icon: Bell },
    { id: 'billing', label: t('tabs.billing'), icon: CreditCard },
  ] as const;

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header with rounded-none */}
      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-none p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5 sm:mb-2 relative z-10">{t('title')}</h1>
        <p className="text-foreground/70 text-xs sm:text-sm relative z-10">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs Navigation with Mobile Scroll Arrows */}
      <div className="relative w-full flex items-center">
        <button 
          type="button"
          onClick={() => scrollTabs('left')}
          className="p-2 bg-foreground/10 hover:bg-foreground/20 active:scale-95 rounded-xl text-foreground shrink-0 mr-1.5 sm:hidden transition-all shadow-sm"
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div 
          ref={tabsRef}
          className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 p-1 bg-foreground/5 rounded-2xl"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 shrink-0 text-xs sm:text-sm ${
                  isActive
                    ? 'bg-background shadow-md text-orange-500 font-bold scale-100'
                    : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5 scale-95 hover:scale-100'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button 
          type="button"
          onClick={() => scrollTabs('right')}
          className="p-2 bg-foreground/10 hover:bg-foreground/20 active:scale-95 rounded-xl text-foreground shrink-0 ml-1.5 sm:hidden transition-all shadow-sm"
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('profile.title')}</h2>
              <p className="text-foreground/60 text-xs sm:text-sm">{t('profile.subtitle')}</p>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 bg-foreground/5 p-4 sm:p-6 rounded-2xl border border-foreground/10">
              <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-500/40 bg-foreground/5 flex-shrink-0 shadow-md">
                {isUploadingImage ? (
                  <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
                  </div>
                ) : photoUrl || user?.photoURL ? (
                  <Image src={photoUrl || user?.photoURL || ''} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-foreground/30">
                    {name?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                </label>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">{t('profile.picture')}</h3>
                <label className="mt-2 inline-block px-4 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-orange-500/30">
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.uploadBtn')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('profile.personal')}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-sm text-foreground/70">{t('profile.name')}</label>
                      <span className="text-xs text-foreground/50">{t('profile.nameHint')}</span>
                    </div>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.phone')}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('profile.phonePlaceholder')} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground/70 mb-1">{t('profile.dob')}</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground/70 mb-1">{t('profile.gender')}</label>
                      <div className="relative">
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 pr-10 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm cursor-pointer">
                          <option value="" disabled className="bg-background text-foreground">{t('profile.selectGender')}</option>
                          <option value="Male" className="bg-background text-foreground">{t('profile.male')}</option>
                          <option value="Female" className="bg-background text-foreground">{t('profile.female')}</option>
                          <option value="Other" className="bg-background text-foreground">{t('profile.other')}</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('profile.academic')}</h3>
                <div className="space-y-3">
                  {/* Field 1: Institution Name (Dynamic Label) */}
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">
                      {eduLevel === 'primary' || eduLevel === 'high_school' ? t('profile.schoolName') : 
                       eduLevel === 'intermediate' ? t('profile.collegeName') : 
                       eduLevel === 'honours' || eduLevel === 'masters' ? t('profile.uniName') : 
                       t('profile.institutionName')}
                    </label>
                    <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder={t('profile.instPlaceholder')} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                  </div>

                  {/* Field 2: Education Level */}
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.eduLevel')}</label>
                    <div className="relative">
                      <select 
                        value={eduLevel}
                        onChange={(e) => {
                          setEduLevel(e.target.value);
                          setStudentClass(''); // Reset dependent fields when level changes
                          setDepartment('');
                          setYear('');
                        }}
                        className="w-full px-4 pr-10 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm cursor-pointer"
                      >
                        <option value="" disabled className="bg-background text-foreground">{t('profile.selectLevel')}</option>
                        <option value="primary" className="bg-background text-foreground">{t('profile.levels.primary')}</option>
                        <option value="high_school" className="bg-background text-foreground">{t('profile.levels.high_school')}</option>
                        <option value="intermediate" className="bg-background text-foreground">{t('profile.levels.intermediate')}</option>
                        <option value="honours" className="bg-background text-foreground">{t('profile.levels.honours')}</option>
                        <option value="masters" className="bg-background text-foreground">{t('profile.levels.masters')}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Dynamic Fields based on Education Level */}
                  {(eduLevel === 'primary' || eduLevel === 'high_school') && (
                    <div>
                      <label className="block text-sm text-foreground/70 mb-1">{t('profile.class')}</label>
                      <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm">
                        <option value="" disabled className="bg-background text-foreground">{t('profile.selectClass')}</option>
                        {eduLevel === 'primary' 
                          ? Array.from({length: 5}, (_, i) => <option key={i+1} value={String(i+1)} className="bg-background text-foreground">{t('profile.classPrefix')} {i+1}</option>)
                          : Array.from({length: 5}, (_, i) => <option key={i+6} value={String(i+6)} className="bg-background text-foreground">{t('profile.classPrefix')} {i+6}</option>)
                        }
                      </select>
                    </div>
                  )}

                  {eduLevel === 'intermediate' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-foreground/70 mb-1">{t('profile.class')}</label>
                        <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm">
                          <option value="" disabled className="bg-background text-foreground">{t('profile.selectClass')}</option>
                          <option value="11" className="bg-background text-foreground">{t('profile.classPrefix')} 11</option>
                          <option value="12" className="bg-background text-foreground">{t('profile.classPrefix')} 12</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-foreground/70 mb-1">{t('profile.group')}</label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none text-sm">
                          <option value="" disabled className="bg-background text-foreground">{t('profile.selectGroup')}</option>
                          <option value="science" className="bg-background text-foreground">{t('profile.science')}</option>
                          <option value="arts" className="bg-background text-foreground">{t('profile.arts')}</option>
                          <option value="commerce" className="bg-background text-foreground">{t('profile.commerce')}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(eduLevel === 'honours' || eduLevel === 'masters') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-foreground/70 mb-1">{t('profile.department')}</label>
                        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder={t('profile.deptPlaceholder')} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-foreground/70 mb-1">{t('profile.year')}</label>
                        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder={t('profile.yearPlaceholder')} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('profile.saveBtn')}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('security.title')}</h2>
              <p className="text-foreground/60 text-xs sm:text-sm">{t('security.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('security.changePassword')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.email')}</label>
                    <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 bg-foreground/10 border border-foreground/10 rounded-xl text-foreground/50 cursor-not-allowed text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.newPassword')}</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-12 text-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.confirmPassword')}</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-12 text-sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 mt-2 text-sm">
                    {t('security.updateBtn')}
                  </button>
                </div>
              </div>

              {/* Connected Accounts - Mobile Overflow Fix */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('security.connected')}</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center p-2 shadow-sm shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">{t('security.google')}</p>
                        <p className="text-xs text-foreground/50 truncate max-w-[200px] sm:max-w-none">{user?.providerData.some(p => p.providerId === 'google.com') ? user.email : t('security.notConnectedStatus')}</p>
                      </div>
                    </div>
                    {user?.providerData.some(p => p.providerId === 'google.com') ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('security.connectedStatus')}
                      </span>
                    ) : (
                      <button className="text-xs sm:text-sm font-bold text-orange-500 hover:underline shrink-0 self-start sm:self-auto">Connect</button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1877F2] rounded-full flex items-center justify-center p-2 shadow-sm shrink-0">
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">{t('security.facebook')}</p>
                        <p className="text-xs text-foreground/50 truncate max-w-[200px] sm:max-w-none">{user?.providerData.some(p => p.providerId === 'facebook.com') ? 'Connected via Facebook' : t('security.notConnectedStatus')}</p>
                      </div>
                    </div>
                    {user?.providerData.some(p => p.providerId === 'facebook.com') ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('security.connectedStatus')}
                      </span>
                    ) : (
                      <button className="text-xs sm:text-sm font-bold text-orange-500 hover:underline shrink-0 self-start sm:self-auto">Connect</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{t('preferences.title')}</h2>
              <p className="text-foreground/60 text-xs sm:text-sm">{t('preferences.subtitle')}</p>
            </div>

            <div className="max-w-2xl space-y-4 sm:space-y-6">
              <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('preferences.notifications')}</h3>
              
              {[
                { id: 'notif1', label: t('preferences.notifCourses'), defaultChecked: true },
                { id: 'notif2', label: t('preferences.notifExams'), defaultChecked: true },
                { id: 'notif3', label: t('preferences.notifOffers'), defaultChecked: false }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 sm:p-4 bg-foreground/5 rounded-xl border border-foreground/5 hover:border-orange-500/30 transition-colors">
                  <span className="font-medium text-xs sm:text-sm text-foreground/80">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                    <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing & Payment History Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground flex items-center gap-2.5">
                <Receipt className="w-6 h-6 text-orange-500 shrink-0" />
                <span>বিলিং ও পেমেন্ট হিস্ট্রি (Payment Statement)</span>
              </h2>
              <p className="text-foreground/60 text-xs sm:text-sm">
                আপনার সাবমিট করা সমস্ত কোর্স পেমেন্ট লেনদেন ও মানি রিসিট স্টেটমেন্ট নিচে দেখুন।
              </p>
            </div>

            {/* Financial Summary Banner - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 bg-foreground/5 p-3.5 sm:p-6 rounded-2xl border border-foreground/10">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider">মোট পরিশোধিত</span>
                <span className="text-lg sm:text-3xl font-black text-orange-500 font-mono mt-0.5">
                  ৳{paymentHistory.filter(p => p.status === 'approved').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider">মোট পেমেন্ট</span>
                <span className="text-lg sm:text-3xl font-black text-foreground font-mono mt-0.5">
                  {paymentHistory.length} টি
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col justify-center border-t sm:border-t-0 border-foreground/10 pt-2.5 sm:pt-0">
                <span className="text-[10px] sm:text-xs font-bold text-foreground/60 uppercase tracking-wider">অ্যাকাউন্ট স্ট্যাটাস</span>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-green-500 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> এক্টিভ স্টুডেন্ট
                </span>
              </div>
            </div>

            {/* Statement Ledger Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <h3 className="font-bold text-sm sm:text-lg text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                  <span>পেমেন্ট লেজার (Statement Ledger)</span>
                </h3>
                {paymentHistory.length > 0 && (
                  <span className="text-[10px] sm:text-xs text-foreground/50 font-mono">
                    {paymentHistory.length} Record(s) Found
                  </span>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="p-8 sm:p-12 text-center border-2 border-dashed border-foreground/10 rounded-2xl bg-background/50">
                  <Receipt className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
                  <p className="text-foreground/70 font-bold text-base mb-1">আগের কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি</p>
                  <p className="text-foreground/50 text-xs sm:text-sm max-w-md mx-auto mb-4">
                    আপনি যখনই কোনো কোর্সে ভর্তি হতে পেমেন্ট সাবমিট করবেন, তার মানি রিসিট ও স্টেটমেন্ট এখানে রাখা থাকবে।
                  </p>
                  <Link 
                    href="/courses" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-orange-600 transition-colors shadow-md"
                  >
                    কোর্সসমূহ দেখুন
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile Card List View (Clean & Compact) */}
                  <div className="block md:hidden space-y-3">
                    {paymentHistory.map((item) => {
                      const methodLower = (item.paymentMethod || '').toLowerCase();
                      const isBkash = methodLower.includes('bkash');
                      const isNagad = methodLower.includes('nagad');
                      const isRocket = methodLower.includes('rocket');
                      const isApproved = item.status === 'approved';
                      const isPending = item.status === 'pending';
                      const formattedDate = item.createdAt?.toDate 
                        ? item.createdAt.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'N/A';

                      return (
                        <div key={item.id} className="p-3.5 bg-background border border-foreground/10 rounded-xl space-y-2 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.courseTitle || 'Course Enrollment'}</h4>
                              <span className="text-[10px] text-foreground/50 font-mono">TrxID: {item.trxId || 'N/A'}</span>
                            </div>
                            <span className="font-black text-sm font-mono text-orange-500 shrink-0">
                              ৳{Number(item.amount || 0).toLocaleString('en-US')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-foreground/70 border-t border-b border-foreground/5 py-2 gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                                isBkash ? 'bg-pink-500/10 text-pink-600 border border-pink-500/30' :
                                isNagad ? 'bg-orange-500/10 text-orange-600 border border-orange-500/30' :
                                isRocket ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30' :
                                'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                              }`}>
                                {item.paymentMethod || 'Manual'}
                              </span>
                              <span className="font-mono text-[11px]">{item.senderNumber || item.offlinePhone || 'N/A'}</span>
                            </div>
                            <span className="text-[10px] text-foreground/50 font-mono">{formattedDate}</span>
                          </div>

                          <div className="flex items-center justify-between pt-0.5">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Paid
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/10 text-red-600 border border-red-500/30">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedReceipt(item)}
                              className="px-3 py-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1 border border-orange-500/30"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>রিসিট দেখুন</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Statement Ledger Table */}
                  <div className="hidden md:block border border-foreground/10 rounded-2xl overflow-hidden shadow-sm bg-background">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="bg-foreground/5 border-b border-foreground/10 text-foreground/70 font-bold uppercase tracking-wider">
                            <th className="py-3.5 px-4">কোর্স ও ট্রানজেকশন</th>
                            <th className="py-3.5 px-4">পেমেন্ট মেথড ও নম্বর</th>
                            <th className="py-3.5 px-4">তারিখ</th>
                            <th className="py-3.5 px-4">পরিমাণ</th>
                            <th className="py-3.5 px-4">স্ট্যাটাস</th>
                            <th className="py-3.5 px-4 text-right">রিসিট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/10">
                          {paymentHistory.map((item) => {
                            const methodLower = (item.paymentMethod || '').toLowerCase();
                            const isBkash = methodLower.includes('bkash');
                            const isNagad = methodLower.includes('nagad');
                            const isRocket = methodLower.includes('rocket');

                            const isApproved = item.status === 'approved';
                            const isPending = item.status === 'pending';

                            const formattedDate = item.createdAt?.toDate 
                              ? item.createdAt.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                              : item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                              : 'N/A';

                            return (
                              <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                                <td className="py-3.5 px-4 min-w-[180px]">
                                  <div className="font-bold text-foreground line-clamp-1">{item.courseTitle || 'Course Enrollment'}</div>
                                  <div className="text-[10px] text-foreground/50 font-mono mt-0.5">TrxID: {item.trxId || 'N/A'}</div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                      isBkash ? 'bg-pink-500/10 text-pink-600 border border-pink-500/30' :
                                      isNagad ? 'bg-orange-500/10 text-orange-600 border border-orange-500/30' :
                                      isRocket ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30' :
                                      'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                                    }`}>
                                      {item.paymentMethod || 'Manual'}
                                    </span>
                                    <span className="font-mono text-foreground/80">{item.senderNumber || item.offlinePhone || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-foreground/70 text-xs font-mono">
                                  {formattedDate}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap font-black font-mono text-sm text-foreground">
                                  ৳{Number(item.amount || 0).toLocaleString('en-US')}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                      <CheckCircle2 className="w-3 h-3" /> অনুমোদিত (Paid)
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                      <Clock className="w-3 h-3" /> অপেক্ষমাণ (Pending)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-500/10 text-red-600 border border-red-500/30">
                                      <XCircle className="w-3 h-3" /> বাতিল (Rejected)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => setSelectedReceipt(item)}
                                    className="px-3 py-1.5 bg-foreground/10 hover:bg-orange-500 hover:text-white text-foreground rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ml-auto border border-foreground/10"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>রিসিট</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Digital Money Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          {/* Dedicated Print Style so ONLY this receipt box is printed/downloaded on 1 clean page */}
          <style jsx global>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 0mm !important;
              }
              html, body {
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible !important;
              }
              #printable-receipt {
                position: fixed !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 90% !important;
                max-width: 450px !important;
                margin: 0 auto !important;
                padding: 20px 24px !important;
                box-shadow: none !important;
                border: 2px solid #e5e7eb !important;
                border-radius: 20px !important;
                background: #ffffff !important;
                color: #0f172a !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .print-hide {
                display: none !important;
              }
            }
          `}</style>

          <div id="printable-receipt" className="relative bg-white dark:bg-slate-900 border border-foreground/15 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl overflow-hidden my-auto">
            
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-orange-500" />
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground">অফিসিয়াল পেমেন্ট স্লিপ / রিসিট</h3>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/50 mt-0.5">SkyLearners Official Payment Receipt</p>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-full transition-colors print-hide"
                title="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Stamp Status */}
            <div className="flex items-center justify-between bg-orange-500/5 p-3.5 sm:p-4 rounded-2xl border border-orange-500/20 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">রিসিট নম্বর</span>
                <p className="text-xs sm:text-sm font-mono font-bold text-foreground">#REC-2026-{selectedReceipt.id.slice(0, 6).toUpperCase()}</p>
              </div>
              <div>
                {selectedReceipt.status === 'approved' ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 font-black text-xs uppercase tracking-widest rounded-lg border border-emerald-500/40">
                    ✓ PAID
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-600 font-black text-xs uppercase tracking-widest rounded-lg border border-amber-500/40">
                    ⏳ PENDING
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Details Table */}
            <div className="space-y-3 text-xs sm:text-sm text-foreground/80 mb-6">
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">কোর্সের নাম:</span>
                <span className="font-bold text-foreground text-right max-w-[200px] sm:max-w-[220px]">{selectedReceipt.courseTitle}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">শিক্ষার্থীর নাম:</span>
                <span className="font-semibold text-foreground">{selectedReceipt.studentName || user?.displayName}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">ইমেইল:</span>
                <span className="font-mono text-foreground truncate max-w-[180px] sm:max-w-none">{selectedReceipt.studentEmail || user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">পেমেন্ট মাধ্যম:</span>
                <span className="font-bold uppercase text-orange-500">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">প্রেরকের নম্বর:</span>
                <span className="font-mono text-foreground">{selectedReceipt.senderNumber || selectedReceipt.offlinePhone}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/5 pb-2">
                <span className="text-foreground/50">ট্রানজেকশন আইডি (TrxID):</span>
                <span className="font-mono font-bold text-foreground">{selectedReceipt.trxId || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2 text-base sm:text-lg font-black text-foreground">
                <span>সর্বমোট পরিশোধ:</span>
                <span className="text-orange-500 font-mono">৳{Number(selectedReceipt.amount || 0).toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* One-Click PDF Download / Print Action */}
            <div className="flex items-center gap-3 print-hide">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>রিসিট ডাউনলোড (PDF)</span>
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="py-3 px-4 sm:px-5 bg-foreground/10 text-foreground font-bold rounded-xl hover:bg-foreground/20 transition-colors text-xs sm:text-sm"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center">
            
            {/* Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              {locale === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}
            </h3>

            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed mb-8">
              {locale === 'bn' 
                ? 'আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে। আপনার শিক্ষাগত তথ্যের ভিত্তিতে আমরা কিছু বিশেষ কোর্স সাজিয়েছি।' 
                : 'Your profile has been successfully updated. We have tailored some courses based on your academic profile.'}
            </p>
            
            <div className="flex flex-col gap-3.5">
              <Link 
                href="/dashboard/recommended" 
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>{locale === 'bn' ? 'উপযোগী কোর্সসমূহ দেখুন' : 'View Available Courses'}</span>
              </Link>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-semibold transition-colors text-sm"
              >
                {locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
