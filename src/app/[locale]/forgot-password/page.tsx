"use client";

import { useState, useRef, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Link } from '@/i18n/routing';
import gsap from 'gsap';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPassword');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, y: 20, scale: 0.98 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" }
    );
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      auth.languageCode = locale;
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError(t('userNotFound'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalidEmail'));
      } else {
        setError(err.message || t('sendError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-3 sm:px-6 pt-24 sm:pt-28 pb-12 bg-background">
      <div 
        ref={formRef} 
        className="max-w-md w-full bg-background/95 border border-foreground/15 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          {isSuccess ? (
            <div className="text-center py-4 sm:py-6 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center mb-5 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/15 border border-green-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/10">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-green-500">{t('successTitle')}</h2>
              <p className="text-xs sm:text-sm text-foreground/80 mb-6 sm:mb-8 leading-relaxed px-2">
                {t('successMessage')} <br/>
                <span className="font-extrabold text-foreground underline decoration-orange-500/50 mt-1 inline-block break-all">{email}</span>
              </p>
              
              <Link 
                href="/login" 
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/25 inline-block text-center"
              >
                {t('returnLogin')}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-md">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-foreground">{t('title')}</h2>
                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed px-1 sm:px-3">
                  {t('subtitle')}
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs sm:text-sm p-3.5 rounded-xl mb-6 text-center font-medium leading-relaxed">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-foreground/80">{t('emailLabel')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm text-foreground"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('sending')}</span>
                    </>
                  ) : (
                    t('submitButton')
                  )}
                </button>
              </form>

              <div className="mt-6 sm:mt-8 text-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-2 text-xs sm:text-sm text-foreground/70 hover:text-orange-500 transition-colors font-bold group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {t('backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
