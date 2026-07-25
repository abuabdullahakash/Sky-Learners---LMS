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
      setTimeout(() => setIsVerifying(false), 0);
      return;
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch {
        setError(t('invalidLinkMessage'));
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyCode();
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
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs sm:text-sm text-foreground/70 font-medium">{t('verifying')}</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/15 border border-green-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/10">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-green-500">{t('successTitle')}</h2>
        <p className="text-xs sm:text-sm text-foreground/80 mb-8 leading-relaxed px-2">
          {t('successMessage')}
        </p>
        
        <Link 
          href="/login" 
          className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/25 inline-block text-center"
        >
          {t('loginButton')}
        </Link>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="text-center py-6 animate-in fade-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/15 border border-red-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/10">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-red-500">{t('invalidLinkTitle')}</h2>
        <p className="text-xs sm:text-sm text-foreground/80 mb-8 leading-relaxed px-2">
          {error || t('invalidLinkMessage')}
        </p>
        <Link 
          href="/forgot-password" 
          className="w-full py-3.5 px-4 bg-foreground/10 text-foreground font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:bg-foreground/20 transition-all inline-block text-center"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-md">
          <KeyRound className="w-7 h-7 sm:w-8 sm:h-8" />
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
      
      <form onSubmit={handleReset} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-foreground/80">{t('newPasswordLabel')}</label>
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 pr-10 rounded-xl sm:rounded-2xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm text-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors p-1"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-foreground/80">{t('confirmPasswordLabel')}</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 pr-10 rounded-xl sm:rounded-2xl bg-background border border-foreground/15 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm text-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
    <div className="min-h-screen w-full flex items-center justify-center px-3 sm:px-6 pt-24 sm:pt-28 pb-12 bg-background">
      <div className="max-w-md w-full bg-background/95 border border-foreground/15 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <Suspense fallback={
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
