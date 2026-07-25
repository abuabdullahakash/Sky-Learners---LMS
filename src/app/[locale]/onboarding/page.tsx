"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Presentation, CheckCircle2, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OnboardingPage() {
  const t = useTranslations('Onboarding');
  const { user, userData, refreshUserData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get('role') as 'student' | 'teacher' | null;

  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(queryRole);
  const role = selectedRole || (userData?.role as 'student' | 'teacher' | null);
  
  // Form states (Student)
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [eduLevel, setEduLevel] = useState('');
  const [institution, setInstitution] = useState('');
  const [eduClass, setEduClass] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  // Form states (Teacher)
  const [experience, setExperience] = useState('');
  const [subject, setSubject] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userData && userData.onboardingComplete && !isSuccess) {
        router.push(userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
      }
    }
  }, [user, userData, loading, router, isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setIsLoading(true);
    setError('');

    try {
      const dataToSave: any = {
        role,
        phone,
        email: user.email || '',
        name: user.displayName || '',
        onboardingComplete: true,
      };

      if (role === 'student') {
        dataToSave.dob = dob;
        dataToSave.gender = gender;
        dataToSave.eduLevel = eduLevel;
        dataToSave.institution = institution;
        if (eduLevel === 'primary' || eduLevel === 'high_school') {
          if (eduClass) dataToSave.class = eduClass;
        } else if (eduLevel === 'intermediate') {
          if (eduClass) dataToSave.class = eduClass;
          if (department) dataToSave.department = department;
        } else if (eduLevel === 'honours' || eduLevel === 'masters') {
          if (department) dataToSave.department = department;
          if (year) dataToSave.year = year;
        }
      } else {
        dataToSave.experience = experience;
        dataToSave.subject = subject;
      }

      let timeoutId: NodeJS.Timeout;
      const setDocPromise = setDoc(doc(db, "users", user.uid), dataToSave, { merge: true });
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Request timed out. Please check your internet connection or Firebase setup.")), 15000);
      });
      
      await Promise.race([setDocPromise, timeoutPromise]);
      clearTimeout(timeoutId!);
      
      setIsSuccess(true);
      await refreshUserData();
    } catch (err: any) {
      console.error("Error saving onboarding details", err);
      setError(err.message || "An error occurred while saving your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user || (userData && userData.onboardingComplete && !isSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-start justify-center px-2.5 sm:px-4 pt-24 sm:pt-28 pb-12 bg-background">
      <div className="max-w-xl w-full bg-background border border-foreground/15 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
        
        {isSuccess ? (
          <div className="text-center py-6 sm:py-8 animate-in fade-in zoom-in">
            <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-3.5 sm:mb-4 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-primary">{t('congrats')}</h2>
            <p className="text-xs sm:text-sm text-foreground/70 mb-6 sm:mb-8">{t('profileCreated')}</p>
            
            <div className="flex flex-col gap-3 mt-2">
              {role === 'student' ? (
                <>
                  <button 
                    onClick={() => router.push('/courses')}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
                  >
                    {t('browseCourses')}
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 px-4 bg-foreground/10 text-foreground font-bold text-xs sm:text-sm rounded-xl hover:bg-foreground/20 transition-all"
                  >
                    {t('goToDashboard')}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => router.push('/teacher-dashboard')}
                  className="w-full py-3 px-4 bg-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                >
                  {t('goToTeacherDashboard')}
                </button>
              )}
            </div>
          </div>
        ) : !role ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 text-foreground">{t('welcomeTitle')}</h2>
              <p className="text-xs sm:text-sm text-foreground/60">{t('welcomeSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button 
                onClick={() => setSelectedRole('student')}
                className="p-4 sm:p-6 flex flex-col items-center text-center gap-3 bg-foreground/5 hover:bg-primary/10 border border-foreground/10 hover:border-primary/50 rounded-2xl transition-all group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-0.5 sm:mb-1 text-foreground">{t('iAmStudent')}</h3>
                  <p className="text-xs text-foreground/60">{t('wantToLearn')}</p>
                </div>
              </button>
              
              <button 
                onClick={() => setSelectedRole('teacher')}
                className="p-4 sm:p-6 flex flex-col items-center text-center gap-3 bg-foreground/5 hover:bg-orange-500/10 border border-foreground/10 hover:border-orange-500/50 rounded-2xl transition-all group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Presentation className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-0.5 sm:mb-1 text-foreground">{t('iAmTeacher')}</h3>
                  <p className="text-xs text-foreground/60">{t('wantToTeach')}</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 text-foreground">{t('completeTitle')}</h2>
              <p className="text-xs sm:text-sm text-foreground/60">
                {t('completeSubtitle', { role: role === 'teacher' ? t('teacherRole') : t('studentRole') })}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs sm:text-sm text-center font-medium leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('phoneLabel')}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                  required
                />
              </div>

              {role === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('dobLabel')}</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('genderLabel')}</label>
                      <div className="relative">
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3.5 sm:px-4 pr-10 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled className="bg-background text-foreground">{t('selectGender')}</option>
                          <option value="Male" className="bg-background text-foreground">{t('male')}</option>
                          <option value="Female" className="bg-background text-foreground">{t('female')}</option>
                          <option value="Other" className="bg-background text-foreground">{t('other')}</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-foreground/10 pt-4 mt-2">
                    <h3 className="font-bold text-base sm:text-lg mb-3 text-primary">{t('academicDetails')}</h3>
                    
                    <div className="space-y-3.5 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('eduLevelLabel')}</label>
                        <div className="relative">
                          <select 
                            value={eduLevel}
                            onChange={(e) => setEduLevel(e.target.value)}
                            className="w-full px-3.5 sm:px-4 pr-10 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none cursor-pointer"
                            required
                          >
                            <option value="" disabled className="bg-background text-foreground">{t('selectEduLevel')}</option>
                            <option value="primary" className="bg-background text-foreground">{t('primary')}</option>
                            <option value="high_school" className="bg-background text-foreground">{t('highSchool')}</option>
                            <option value="intermediate" className="bg-background text-foreground">{t('intermediate')}</option>
                            <option value="honours" className="bg-background text-foreground">{t('honours')}</option>
                            <option value="masters" className="bg-background text-foreground">{t('masters')}</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {eduLevel && (
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('institutionName')}</label>
                          <input 
                            type="text" 
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder={t('instPlaceholder')}
                            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                            required
                          />
                        </div>
                      )}

                      {(eduLevel === 'primary' || eduLevel === 'high_school') && (
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('classLabel')}</label>
                          <div className="relative">
                            <select 
                              value={eduClass}
                              onChange={(e) => setEduClass(e.target.value)}
                              className="w-full px-3.5 sm:px-4 pr-10 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none cursor-pointer"
                              required
                            >
                              <option value="" disabled className="bg-background text-foreground">{t('selectClass')}</option>
                              {eduLevel === 'primary' 
                                ? Array.from({length: 5}, (_, i) => <option key={i+1} value={i+1} className="bg-background text-foreground">{t('classPrefix')} {i+1}</option>)
                                : Array.from({length: 5}, (_, i) => <option key={i+6} value={i+6} className="bg-background text-foreground">{t('classPrefix')} {i+6}</option>)
                              }
                            </select>
                            <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {eduLevel === 'intermediate' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('classLabel')}</label>
                            <div className="relative">
                              <select value={eduClass} onChange={(e) => setEduClass(e.target.value)} className="w-full px-3.5 sm:px-4 pr-10 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none cursor-pointer" required>
                                <option value="" disabled className="bg-background text-foreground">{t('selectClass')}</option>
                                <option value="11" className="bg-background text-foreground">{t('classPrefix')} 11</option>
                                <option value="12" className="bg-background text-foreground">{t('classPrefix')} 12</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('groupLabel')}</label>
                            <div className="relative">
                              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3.5 sm:px-4 pr-10 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground appearance-none cursor-pointer" required>
                                <option value="" disabled className="bg-background text-foreground">{t('selectGroup')}</option>
                                <option value="science" className="bg-background text-foreground">{t('science')}</option>
                                <option value="arts" className="bg-background text-foreground">{t('arts')}</option>
                                <option value="commerce" className="bg-background text-foreground">{t('commerce')}</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-foreground/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {(eduLevel === 'honours' || eduLevel === 'masters') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('departmentLabel')}</label>
                            <input 
                              type="text" 
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              placeholder={t('deptPlaceholder')}
                              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('yearLabel')}</label>
                            <input 
                              type="text" 
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              placeholder={t('yearPlaceholder')}
                              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                              required
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </>
              )}

              {role === 'teacher' && (
                <>
                  <div className="border-t border-foreground/10 pt-4 mt-2">
                    <h3 className="font-bold text-base sm:text-lg mb-3 text-orange-500">{t('professionalDetails')}</h3>
                    <div className="space-y-3.5 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('subjectLabel')}</label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={t('subjectPlaceholder')}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">{t('experienceLabel')}</label>
                        <input 
                          type="number" 
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder={t('expPlaceholder')}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 mt-4 bg-primary text-primary-foreground font-bold text-sm sm:text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50"
              >
                {isLoading ? t('saving') : t('completeBtn')}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
