"use client";

import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Building2, User, Link as LinkIcon, CheckCircle2, Globe, Star, Users, Video, GraduationCap, Briefcase, Presentation } from 'lucide-react';

export default function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const resolvedParams = use(params);
  const { teacherId } = resolvedParams;

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [coursesCount, setCoursesCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'teacherProfiles', teacherId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }

        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('teacherId', '==', teacherId), where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        setCoursesCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [teacherId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-xl text-foreground/50 bg-background">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-300 pt-16">
      
      {/* Cover Banner */}
      <div className="h-52 md:h-80 relative bg-foreground/10 w-full overflow-hidden">
        <img 
          src={profileData.coverPhoto || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'} 
          alt="Cover" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative w-full bg-background flex flex-col">

          {/* Profile Header Info */}
          <div className="relative pb-8">
            
            {/* Avatar / Logo */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 mb-4 shadow-xl z-10">
              <img 
                src={profileData.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                alt="Profile" 
                className={`w-full h-full object-cover border-4 border-background bg-background shadow-md ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}
              />
            </div>

            {/* Title & Headline */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{profileData.displayName || (profileData.type === 'individual' ? 'Teacher Name' : 'Institution Name')}</h1>
              <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
            </div>
            <p className="text-primary font-semibold text-lg mb-6">{profileData.headline || 'Instructor'}</p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 py-6 border-y border-foreground/10 bg-foreground/5 dark:bg-foreground/[0.02] rounded-2xl px-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="w-5 h-5" /></div>
                <div>
                  <p className="font-extrabold text-lg leading-none text-foreground">500+</p>
                  <p className="text-xs text-foreground/60 uppercase font-bold tracking-wider mt-1">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Video className="w-5 h-5" /></div>
                <div>
                  <p className="font-extrabold text-lg leading-none text-foreground">{coursesCount}</p>
                  <p className="text-xs text-foreground/60 uppercase font-bold tracking-wider mt-1">Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Star className="w-5 h-5" /></div>
                <div>
                  <p className="font-extrabold text-lg leading-none text-foreground">4.8</p>
                  <p className="text-xs text-foreground/60 uppercase font-bold tracking-wider mt-1">Rating</p>
                </div>
              </div>
            </div>

            {/* Detailed Content Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: About & Experience/Teachers */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-foreground"><User className="w-5 h-5 text-primary" /> About</h3>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">
                    {profileData.bio || 'No biography provided yet.'}
                  </p>
                </div>

                {profileData.type === 'individual' && profileData.experiences && profileData.experiences.length > 0 && (
                  <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground"><Briefcase className="w-5 h-5 text-primary" /> Teaching Experience</h3>
                    <div className="space-y-4">
                      {profileData.experiences.map((exp: any) => (
                        <div key={exp.id} className="flex gap-4 p-3 bg-foreground/5 rounded-xl border border-foreground/10">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{exp.role || 'Role'}</h4>
                            <p className="text-foreground/70 text-xs">{exp.institution || 'Institution'}</p>
                            {exp.current && <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full mt-1">Current</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.type === 'institution' && profileData.teachersRoster && profileData.teachersRoster.length > 0 && (
                  <div className="bg-background dark:bg-foreground/5 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-foreground"><Presentation className="w-5 h-5 text-primary" /> Our Teachers Roster</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profileData.teachersRoster.map((teacher: any) => (
                        <div key={teacher.id} className="p-4 bg-foreground/5 rounded-2xl border border-foreground/10 flex gap-3.5 items-start">
                          <img 
                            src={teacher.image || profileData.profilePhoto} 
                            alt={teacher.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0" 
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-base text-foreground">{teacher.name || 'Teacher Name'}</h4>
                            {teacher.university && <p className="text-xs text-primary font-bold">{teacher.university}</p>}
                            <p className="text-xs text-foreground/70 mt-1"><span className="font-bold text-foreground">Subjects:</span> {teacher.subjects || 'N/A'}</p>
                            {teacher.classes && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {teacher.classes.split(',').map((cls: string, i: number) => cls.trim() && (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-background border border-foreground/10 rounded font-semibold text-foreground">
                                    {cls.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Education Levels, Socials */}
              <div className="space-y-6">
                
                {profileData.educationLevels && profileData.educationLevels.length > 0 && (
                  <div className="p-6 bg-background dark:bg-foreground/5 rounded-2xl border border-foreground/10 shadow-sm">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-foreground/50">Education Levels</h3>
                    <ul className="space-y-2.5">
                      {profileData.educationLevels.map((level: string) => (
                        <li key={level} className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> {level}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profileData.type === 'individual' && profileData.individualClasses && profileData.individualClasses.length > 0 && (
                  <div className="p-6 bg-background dark:bg-foreground/5 rounded-2xl border border-foreground/10 shadow-sm">
                    <h3 className="font-bold mb-3 uppercase text-xs tracking-wider text-foreground/50">Specific Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.individualClasses.map((cls: string) => (
                        <span key={cls} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-background dark:bg-foreground/5 rounded-2xl border border-foreground/10 shadow-sm">
                  <h3 className="font-bold mb-3 uppercase text-xs tracking-wider text-foreground/50">Follow & Contact</h3>
                  <div className="flex flex-wrap gap-3">
                    {profileData.website && (
                      <a href={profileData.website} target="_blank" rel="noreferrer" title="Website" className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.facebook && (
                      <a href={profileData.facebook} target="_blank" rel="noreferrer" title="Facebook" className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-105">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} target="_blank" rel="noreferrer" title="YouTube" className="w-10 h-10 rounded-xl bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all transform hover:scale-105">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all transform hover:scale-105">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.239-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {!profileData.website && !profileData.facebook && !profileData.youtube && !profileData.linkedin && (
                      <p className="text-xs text-foreground/40 italic">No social links added.</p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
