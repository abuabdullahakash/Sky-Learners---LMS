"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Link } from '@/i18n/routing';
import gsap from 'gsap';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

function ResetPasswordForm() {
  const t = useTranslations('Auth.resetPassword');
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  // Verify the code when component mounts
  useEffect(() => {
    if (!oobCode) {
      setError(t('invalidLinkMessage'));
      setIsVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setIsValidCode(true);
        setIsVerifying(false);
      })
      .catch(() => {
        setError(t('invalidLinkMessage'));
        setIsVerifying(false);
      });
  }, [oobCode, t]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError(t('errorMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('errorLength'));
      return;
    }

    if (!oobCode) return;

    setIsLoading(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground/70">{t('verifying')}</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-green-500">{t('successTitle')}</h2>
        <p className="text-foreground/70 mb-8 leading-relaxed">
          {t('successMessage')}
        </p>
        
        <Link 
          href="/login" 
          className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors inline-block shadow-lg shadow-primary/25"
        >
          {t('loginButton')}
        </Link>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="text-center py-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-red-500">{t('invalidLinkTitle')}</h2>
        <p className="text-foreground/70 mb-8 leading-relaxed">
          {error}
        </p>
        <Link 
          href="/forgot-password" 
          className="w-full py-3 px-4 bg-foreground/10 text-foreground font-medium rounded-lg hover:bg-foreground/15 transition-colors inline-block"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
          <KeyRound className="w-6 h-6" />
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
      
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t('newPasswordLabel')}</label>
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">{t('confirmPasswordLabel')}</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-foreground/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              <span>{t('changing')}</span>
            </>
          ) : (
            t('submitButton')
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-foreground/5 p-8 rounded-2xl border border-foreground/10 backdrop-blur-md relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Suspense fallback={
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
