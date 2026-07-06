"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/routing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ConfirmationResult } from 'firebase/auth';
import { Phone } from 'lucide-react';

export default function PhoneAuth({ isRegister = false }: { isRegister?: boolean }) {
  const [phone, setPhone] = useState('+880');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { setUpRecaptcha } = useAuth();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      const result = await setUpRecaptcha(phone);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!confirmationResult) return;

    try {
      const result = await confirmationResult.confirm(otp);
      
      // If registering or first time login, save to firestore
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: name || result.user.phoneNumber,
          phone: result.user.phoneNumber,
          role: "student",
          createdAt: new Date().toISOString()
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      
      <div id="recaptcha-container" className="mb-4 flex justify-center"></div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg bg-background border border-foreground/20 focus:outline-none focus:border-primary transition-colors"
                required={isRegister}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full px-4 py-2 rounded-lg bg-background border border-foreground/20 focus:outline-none focus:border-primary transition-colors tracking-widest"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Enter OTP sent to {phone}</label>
            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 rounded-lg bg-background border border-foreground/20 focus:outline-none focus:border-primary transition-colors tracking-widest text-center text-xl"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
            Verify & Login
          </button>
          <button 
            type="button" 
            onClick={() => setStep('phone')}
            className="w-full py-2 text-foreground/60 text-sm hover:text-foreground transition-colors"
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
