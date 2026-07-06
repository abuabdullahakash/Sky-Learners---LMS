"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Presentation, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userData && userData.onboardingComplete) {
        router.push(userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
      }
    }
  }, [user, userData, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setIsLoading(true);

    try {
      const dataToSave: any = {
        role,
        phone,
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

      await setDoc(doc(db, "users", user.uid), dataToSave, { merge: true });
      await refreshUserData();
      setIsSuccess(true);
      
    } catch (error) {
      console.error("Error saving onboarding details", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user || (userData && userData.onboardingComplete)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 bg-background">
      <div className="max-w-xl w-full bg-foreground/5 p-8 rounded-3xl border border-foreground/10 shadow-2xl">
        
        {isSuccess ? (
          <div className="text-center py-8 animate-in fade-in zoom-in">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2 text-primary">অভিনন্দন! (Congratulations!)</h2>
            <p className="text-foreground/70 mb-8">আপনার প্রোফাইল সফলভাবে তৈরি হয়েছে।</p>
            
            <div className="flex flex-col gap-4 mt-4">
              <button 
                onClick={() => window.location.href = '/courses'}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
              >
                View Your Available Courses
              </button>
              <button 
                onClick={() => window.location.href = role === 'teacher' ? '/teacher-dashboard' : '/dashboard'}
                className="w-full py-3 px-4 bg-foreground/10 text-foreground font-bold rounded-xl hover:bg-foreground/20 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : !role ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to Sky Learners!</h2>
              <p className="text-foreground/60">Please tell us how you plan to use the platform.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedRole('student')}
                className="p-6 flex flex-col items-center text-center gap-4 bg-foreground/5 hover:bg-primary/10 border border-foreground/10 hover:border-primary/50 rounded-2xl transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">I am a Student</h3>
                  <p className="text-sm text-foreground/60">I want to learn</p>
                </div>
              </button>
              
              <button 
                onClick={() => setSelectedRole('teacher')}
                className="p-6 flex flex-col items-center text-center gap-4 bg-foreground/5 hover:bg-orange-500/10 border border-foreground/10 hover:border-orange-500/50 rounded-2xl transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Presentation size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">I am a Teacher</h3>
                  <p className="text-sm text-foreground/60">I want to teach</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
              <p className="text-foreground/60">Just a few more details to set up your {role} account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground/70">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              {role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground/70">Date of Birth</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground/70">Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled className="bg-background text-foreground">Select Gender</option>
                        <option value="Male" className="bg-background text-foreground">Male</option>
                        <option value="Female" className="bg-background text-foreground">Female</option>
                        <option value="Other" className="bg-background text-foreground">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-foreground/10 pt-4 mt-4">
                    <h3 className="font-semibold text-lg mb-4 text-primary">Academic Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/70">Education Level</label>
                        <select 
                          value={eduLevel}
                          onChange={(e) => setEduLevel(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors appearance-none"
                          required
                        >
                          <option value="" disabled className="bg-background text-foreground">Select Education Level</option>
                          <option value="primary" className="bg-background text-foreground">Primary School</option>
                          <option value="high_school" className="bg-background text-foreground">High School</option>
                          <option value="intermediate" className="bg-background text-foreground">Intermediate / HSC</option>
                          <option value="honours" className="bg-background text-foreground">Honours / Undergrad</option>
                          <option value="masters" className="bg-background text-foreground">Masters / Postgrad</option>
                        </select>
                      </div>

                      {eduLevel && (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-foreground/70">Institution Name</label>
                          <input 
                            type="text" 
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="e.g. Dhaka College"
                            className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
                            required
                          />
                        </div>
                      )}

                      {(eduLevel === 'primary' || eduLevel === 'high_school') && (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-foreground/70">Class</label>
                          <select 
                            value={eduClass}
                            onChange={(e) => setEduClass(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors appearance-none"
                            required
                          >
                            <option value="" disabled className="bg-background text-foreground">Select Class</option>
                            {eduLevel === 'primary' 
                              ? Array.from({length: 5}, (_, i) => <option key={i+1} value={i+1} className="bg-background text-foreground">Class {i+1}</option>)
                              : Array.from({length: 5}, (_, i) => <option key={i+6} value={i+6} className="bg-background text-foreground">Class {i+6}</option>)
                            }
                          </select>
                        </div>
                      )}

                      {eduLevel === 'intermediate' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Class</label>
                            <select value={eduClass} onChange={(e) => setEduClass(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors appearance-none" required>
                              <option value="" disabled className="bg-background text-foreground">Select Class</option>
                              <option value="11" className="bg-background text-foreground">Class 11</option>
                              <option value="12" className="bg-background text-foreground">Class 12</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Group</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors appearance-none" required>
                              <option value="" disabled className="bg-background text-foreground">Select Group</option>
                              <option value="science" className="bg-background text-foreground">Science</option>
                              <option value="arts" className="bg-background text-foreground">Arts (Humanities)</option>
                              <option value="commerce" className="bg-background text-foreground">Commerce</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {(eduLevel === 'honours' || eduLevel === 'masters') && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Department</label>
                            <input 
                              type="text" 
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                              placeholder="e.g. Physics"
                              className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Year / Semester</label>
                            <input 
                              type="text" 
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              placeholder="e.g. 1st Year"
                              className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
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
                  <div className="border-t border-foreground/10 pt-4 mt-4">
                    <h3 className="font-semibold text-lg mb-4 text-orange-500">Professional Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/70">Subject Expertise</label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Higher Mathematics, Physics"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-foreground/70">Years of Experience</label>
                        <input 
                          type="number" 
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary transition-colors"
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
                className="w-full py-4 mt-6 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
