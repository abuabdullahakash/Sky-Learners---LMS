"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import gsap from 'gsap';
import { Eye, EyeOff, X, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface AuthModalProps {
  initialMode: 'login' | 'register';
}

export default function AuthModal({ initialMode }: AuthModalProps) {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const formBodyRef = useRef<HTMLDivElement>(null);

  // Entrance animation for the card
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, scale: 0.94, y: 15 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );
    }
  }, []);

  // In-page tab switching
  const switchTab = (newMode: 'login' | 'register') => {
    if (mode === newMode) return;
    setError('');
    
    if (formBodyRef.current) {
      gsap.to(formBodyRef.current, {
        opacity: 0,
        y: -6,
        duration: 0.12,
        ease: "power2.in",
        onComplete: () => {
          setMode(newMode);
          const targetUrl = `/${locale}/${newMode}`;
          window.history.replaceState(null, '', targetUrl);

          gsap.fromTo(formBodyRef.current, 
            { opacity: 0, y: 6 }, 
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
          );
        }
      });
    } else {
      setMode(newMode);
    }
  };

  // Close handler with smooth scale & fade out
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 15,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => router.push('/')
      });
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'login') {
      try {
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistenceType);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await signOut(auth);
          setError(
            locale === 'bn' 
              ? 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট রেজিস্টার করা নেই। অনুগ্রহ করে রেজিস্টার করুন।' 
              : 'No account exists with this email. Please register first.'
          );
          setIsLoading(false);
          return;
        }

        const userData = userDoc.data();
        if (!userData.onboardingComplete) {
          router.push('/onboarding');
        } else {
          router.push(userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
        }
      } catch (err: any) {
        setError(t('invalidCredentials'));
        setIsLoading(false);
      }
    } else {
      // Register Mode
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          role: null,
          onboardingComplete: false,
          createdAt: new Date().toISOString()
        });

        // Instant direct redirect to onboarding page!
        router.push('/onboarding');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError(t('emailAlreadyInUse'));
        } else {
          setError(err.message || 'Failed to register');
        }
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider) => {
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (mode === 'login') {
        if (!userDoc.exists()) {
          // User tried to login with an unregistered social account -> Block auto-creation & sign out!
          await signOut(auth);
          setError(
            locale === 'bn' 
              ? 'এই গুগল/সোশ্যাল অ্যাকাউন্ট দিয়ে কোনো অ্যাকাউন্ট খোলা নেই। অনুগ্রহ করে রেজিস্টার করুন।' 
              : 'No account found with this social account. Please register first.'
          );
          setIsLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        if (!userData.onboardingComplete) {
          router.push('/onboarding');
        } else {
          router.push(userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
        }
      } else {
        // Register Mode
        let redirectUrl = '/onboarding';
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: userCredential.user.displayName,
            email: userCredential.user.email,
            role: null,
            onboardingComplete: false,
            createdAt: new Date().toISOString()
          });
        } else {
          const userData = userDoc.data();
          if (userData.onboardingComplete) {
            redirectUrl = userData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard';
          }
        }
        // Instant direct redirect to onboarding page!
        router.push(redirectUrl);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to login with social provider');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2.5 sm:px-6 pt-20 sm:pt-28 pb-8">
      <div 
        ref={cardRef} 
        className="max-w-md w-full bg-background/95 border border-foreground/15 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl opacity-0 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div>
          {/* Header with In-Page Tab Switcher & Close Button */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between gap-2 border-b border-foreground/10 pb-3">
                {/* In-Page Auth Mode Tabs */}
                <div className="flex items-center gap-1.5 bg-foreground/5 p-1 rounded-2xl border border-foreground/10">
                  <button 
                    type="button"
                    onClick={() => switchTab('login')} 
                    className={`px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      mode === 'login' 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-extrabold' 
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {t('loginTab')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => switchTab('register')} 
                    className={`px-3.5 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      mode === 'register' 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-extrabold' 
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {t('registerTab')}
                  </button>
                </div>

                {/* Close Button */}
                <button 
                  type="button"
                  onClick={handleClose} 
                  className="p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10 transition-colors shrink-0"
                  title={locale === 'bn' ? 'বন্ধ করুন' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Form Body */}
            <div ref={formBodyRef}>
              <div className="mb-5">
                <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                  {mode === 'login' ? t('loginTitle') : t('registerTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                  {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm mb-4 text-center font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20 leading-relaxed">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">
                      {t('nameLabel')}
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-foreground"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">
                    {t('emailLabel')}
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1 text-foreground/80">
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      autoComplete={mode === 'login' ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 rounded-xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-foreground/30 text-orange-500 focus:ring-orange-500 bg-background"
                      />
                      <span className="text-foreground/80 text-xs sm:text-sm">{t('rememberMe')}</span>
                    </label>
                    
                    <button 
                      type="button"
                      onClick={() => router.push('/forgot-password')} 
                      className="text-orange-500 hover:text-orange-600 font-bold transition-colors text-xs sm:text-sm"
                    >
                      {t('forgotPasswordLink')}
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm sm:text-base rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    mode === 'login' ? t('loginSubmit') : t('registerSubmit')
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center">
                <div className="flex-1 border-t border-foreground/10"></div>
                <span className="px-3 text-foreground/50 text-[11px] font-semibold uppercase">{t('orText')}</span>
                <div className="flex-1 border-t border-foreground/10"></div>
              </div>

              <div className="space-y-2.5">
                <button 
                  type="button" 
                  onClick={() => handleSocialLogin(new GoogleAuthProvider())} 
                  disabled={isLoading}
                  className="w-full py-3 bg-white hover:bg-gray-50 text-slate-800 font-extrabold rounded-xl border border-slate-300 transition-all hover:scale-[1.01] hover:shadow-lg shadow-md text-xs sm:text-sm flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="tracking-wide text-slate-800">{t('continueGoogle')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
