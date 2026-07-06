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
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Set language to current locale so the email is sent in the correct language
      auth.languageCode = locale;
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div ref={formRef} className="max-w-md w-full bg-foreground/5 p-8 rounded-2xl border border-foreground/10 backdrop-blur-md relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-green-500">{t('successTitle')}</h2>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                {t('successMessage')} <br/>
                <span className="font-semibold text-foreground">{email}</span>
              </p>
              
              <Link 
                href="/login" 
                className="w-full py-3 px-4 bg-foreground/10 text-foreground font-medium rounded-lg hover:bg-foreground/15 transition-colors inline-block"
              >
                {t('returnLogin')}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
                <p className="text-foreground/60 text-sm">
                  {t('subtitle')}
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t('emailLabel')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>{t('sending')}</span>
                    </>
                  ) : (
                    t('submitButton')
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" />
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
