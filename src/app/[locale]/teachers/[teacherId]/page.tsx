"use client";

import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Building2, User, Link as LinkIcon, CheckCircle2, Globe, Star, Users, Video, GraduationCap, Briefcase, Presentation } from 'lucide-react';
import { Link } from '@/i18n/routing';

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

        // Fetch courses count for this teacher
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-xl text-foreground/50">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto pt-20 px-4 sm:px-6">
        <div className="relative w-full bg-background border border-foreground/10 rounded-[2rem] shadow-sm overflow-hidden flex flex-col mt-8">
          
          {/* Cover Photo */}
          <div className="h-48 md:h-64 relative bg-foreground/10">
            <img src={profileData.coverPhoto || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop'} alt="Cover" className="w-full h-full object-cover" />
          </div>

          {/* Profile Info Section */}
          <div className="px-6 md:px-12 relative pb-12">
            
            {/* Profile Photo */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 mb-4">
              <img 
                src={profileData.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="Profile" 
                className={`w-full h-full object-cover border-4 border-background bg-foreground/5 shadow-lg ${profileData.type === 'institution' ? 'rounded-2xl' : 'rounded-full'}`}
              />
            </div>

            {/* Name & Headline */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold">{profileData.displayName || (profileData.type === 'individual' ? 'Teacher Name' : 'Institution Name')}</h1>
              <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
            </div>
            <p className="text-primary font-medium text-lg mb-6">{profileData.headline || 'Instructor'}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 md:gap-12 mb-10 py-6 border-y border-foreground/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-foreground/5 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-lg leading-none">500+</p>
                  <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mt-1">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-foreground/5 rounded-xl"><Video className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-lg leading-none">{coursesCount}</p>
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
                    {profileData.bio || 'No biography provided yet.'}
                  </p>
                </div>

                {profileData.type === 'individual' && profileData.experiences && profileData.experiences.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</h3>
                    <div className="space-y-4">
                      {profileData.experiences.map((exp: any) => (
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

                {profileData.type === 'institution' && profileData.teachersRoster && profileData.teachersRoster.length > 0 && (
                  <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Presentation className="w-5 h-5 text-primary" /> Our Teachers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profileData.teachersRoster.map((teacher: any) => (
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
                              {teacher.classes && (
                                <div className="flex flex-wrap gap-1.5">
                                  {teacher.classes.split(',').map((cls: string, i: number) => cls.trim() && (
                                    <span key={i} className="text-[11px] px-2.5 py-1 bg-foreground/5 text-foreground rounded-md font-semibold border border-foreground/10 shadow-sm">
                                      {cls.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                
                {profileData.educationLevels && profileData.educationLevels.length > 0 && (
                  <div className="p-6 bg-foreground/5 rounded-3xl border border-foreground/10">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-foreground/50">Education Levels</h3>
                    <ul className="space-y-2">
                      {profileData.educationLevels.map((level: string) => (
                        <li key={level} className="flex items-center gap-2 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> {level}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profileData.type === 'individual' && profileData.individualClasses && profileData.individualClasses.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3 uppercase text-xs tracking-wider text-foreground/50">Specific Classes</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.individualClasses.map((cls: string) => (
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
                      <a href={profileData.website} target="_blank" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                    )}
                    {profileData.facebook && (
                      <a href={profileData.facebook} target="_blank" className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} target="_blank" className="w-10 h-10 rounded-full bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
                    )}
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} target="_blank" className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
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
  );
}
