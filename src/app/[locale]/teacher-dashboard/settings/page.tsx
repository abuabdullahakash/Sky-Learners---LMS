"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, CreditCard, Bell, Save, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  Sparkles, Eye, EyeOff, Lock, Key, Laptop, Smartphone, Tablet, Globe, LogOut, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface SessionItem {
  id: string;
  deviceName: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile' | 'tablet';
}

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'payment' | 'security' | 'notifications'>('payment');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [paymentData, setPaymentData] = useState({
    bkash: '',
    nagad: '',
    rocket: ''
  });

  // Password Change States
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Active Sessions States
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionStatusModal, setSessionStatusModal] = useState({
    show: false,
    message: ''
  });

  // Notifications State
  const [notificationData, setNotificationData] = useState({
    emailOnEnrollment: true,
    emailOnReview: false,
    pushNotifications: true
  });

  // Fetch Payment Settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.paymentData) {
            setPaymentData({
              bkash: data.paymentData.bkash || '',
              nagad: data.paymentData.nagad || '',
              rocket: data.paymentData.rocket || ''
            });
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  // Detect current device for active sessions
  useEffect(() => {
    const ua = typeof window !== 'undefined' ? navigator.userAgent : '';
    let os = 'Windows PC';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

    if (ua.includes('Win')) os = 'Windows PC';
    else if (ua.includes('Mac')) os = 'MacBook Pro';
    else if (ua.includes('iPhone')) { os = 'iPhone'; deviceType = 'mobile'; }
    else if (ua.includes('iPad')) { os = 'iPad'; deviceType = 'tablet'; }
    else if (ua.includes('Android')) { os = 'Android Phone'; deviceType = 'mobile'; }

    let browser = 'Chrome';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';

    const currentDeviceName = `${os} - ${browser}`;

    setSessions([
      {
        id: 'session-current',
        deviceName: currentDeviceName,
        location: 'Dhaka, Bangladesh',
        ip: '192.168.1.1',
        lastActive: 'Active Now',
        isCurrent: true,
        type: deviceType
      },
      {
        id: 'session-2',
        deviceName: 'Windows PC - Firefox',
        location: 'Chittagong, Bangladesh',
        ip: '103.24.12.4',
        lastActive: '2 days ago',
        isCurrent: false,
        type: 'desktop'
      },
      {
        id: 'session-3',
        deviceName: 'iPhone 14 - Safari',
        location: 'Sylhet, Bangladesh',
        ip: '182.16.44.8',
        lastActive: '5 days ago',
        isCurrent: false,
        type: 'mobile'
      }
    ]);
  }, []);

  // Save General Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        paymentData: paymentData,
        notificationData: notificationData
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Real Password Change Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      setPasswordStatus({
        show: true,
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill in all password fields to update your password.'
      });
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      setPasswordStatus({
        show: true,
        type: 'error',
        title: 'Passwords Do Not Match',
        message: 'Your new password and confirmation password do not match. Please re-check.'
      });
      return;
    }

    if (securityData.newPassword.length < 6) {
      setPasswordStatus({
        show: true,
        type: 'error',
        title: 'Password Too Short',
        message: 'New password must be at least 6 characters long.'
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('User authentication session expired. Please log in again.');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email, securityData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, securityData.newPassword);

      // Reset fields and show success modal
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({
        show: true,
        type: 'success',
        title: 'Password Updated Successfully!',
        message: 'Your account password has been updated securely. You can now use your new password across all devices.'
      });
    } catch (err: any) {
      console.error("Password change error:", err);
      let errorMsg = 'Failed to update password. Please check your current password and try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'The current password you entered is incorrect. Please double-check and try again.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'The new password is too weak. Please choose a stronger password with numbers or symbols.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setPasswordStatus({
        show: true,
        type: 'error',
        title: 'Password Change Failed',
        message: errorMsg
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Terminate Active Session Handler
  const handleLogoutSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSessionStatusModal({
      show: true,
      message: 'The selected device session has been logged out successfully.'
    });
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const tabs = [
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Hero Header Banner (0px border radius / rounded-none) */}
      <div className="relative overflow-hidden rounded-none p-6 md:p-9 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border-b border-white/10 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-8 mb-8">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Account Preferences
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white/80 text-xs font-semibold rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Protected Account
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Settings</span>
          </h1>

          <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed font-medium pt-1">
            Manage your manual payment receiving numbers, change account passwords, monitor active login sessions, and configure notifications.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Horizontal Scrollable Tabs */}
        <div className="relative group flex items-center bg-foreground/5 border border-foreground/10 rounded-2xl p-1.5">
          
          <button 
            type="button"
            onClick={() => scrollTabs('left')}
            className="absolute left-0 z-10 w-8 h-full bg-gradient-to-r from-background via-background/80 to-transparent flex items-center justify-start pl-2 text-foreground/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 md:hidden pointer-events-none"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronLeft className="w-5 h-5 bg-background rounded-full shadow" />
          </button>

          <div 
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto custom-scrollbar scroll-smooth w-full px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-300 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'hover:bg-foreground/10 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={() => scrollTabs('right')}
            className="absolute right-0 z-10 w-12 h-full bg-gradient-to-l from-background via-background/90 to-transparent flex items-center justify-end pr-2 text-foreground/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 md:hidden pointer-events-none"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronRight className="w-5 h-5 bg-background rounded-full shadow" />
          </button>
        </div>

        {/* Settings Content Area (Mobile Compact Padding: p-4 sm:p-6 md:p-8) */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* PAYMENT TAB */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-b border-foreground/10 pb-4 mb-6">
                  <h2 className="text-xl font-bold">Manual Payment Receiving Numbers</h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    These numbers will be displayed to students on the checkout page so they can send you money.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      bKash Number (Personal)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 017XXXXXXXX"
                      value={paymentData.bkash}
                      onChange={(e) => setPaymentData({...paymentData, bkash: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Nagad Number (Personal)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 018XXXXXXXX"
                      value={paymentData.nagad}
                      onChange={(e) => setPaymentData({...paymentData, nagad: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Rocket Number (Personal)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 019XXXXXXXX"
                      value={paymentData.rocket}
                      onChange={(e) => setPaymentData({...paymentData, rocket: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-xl text-sm flex gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Ensure these numbers are active and registered as personal accounts. Students will send money directly to these numbers.</p>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-b border-foreground/10 pb-3.5">
                  <h2 className="text-xl font-extrabold">Security & Password</h2>
                  <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                    Keep your account secure by updating passwords and monitoring login devices.
                  </p>
                </div>
                
                {/* Change Password Section */}
                <div className="bg-background rounded-2xl p-4 sm:p-6 border border-foreground/10 shadow-sm space-y-5">
                  <div className="border-b border-foreground/10 pb-3">
                    <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-foreground">
                      <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                      Change Password
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                      Update your password to keep your account protected across all devices.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-foreground/80 block">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? 'text' : 'password'} 
                          placeholder="Enter current password"
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                          className="w-full bg-foreground/5 border border-foreground/15 rounded-xl pl-4 pr-11 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-orange-500 transition-colors p-1"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold text-foreground/80 block">New Password</label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? 'text' : 'password'} 
                            placeholder="Enter new password"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                            className="w-full bg-foreground/5 border border-foreground/15 rounded-xl pl-4 pr-11 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-orange-500 transition-colors p-1"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold text-foreground/80 block">Confirm Password</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            placeholder="Confirm new password"
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                            className="w-full bg-foreground/5 border border-foreground/15 rounded-xl pl-4 pr-11 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-medium"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-orange-500 transition-colors p-1"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Save/Update Password Button */}
                    <div className="pt-2 flex justify-end">
                      <button 
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                      >
                        {isChangingPassword ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Updating Password...</>
                        ) : (
                          <><Save className="w-4 h-4" /> Update Password</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication (UI Only) */}
                <div className="bg-background rounded-2xl p-4 sm:p-6 border border-foreground/10 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 flex items-center gap-2">
                        Two-Factor Authentication (2FA)
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Recommended</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/60 max-w-xl leading-relaxed">
                        Add an extra layer of security to your account. We will ask for a verification code when you sign in from a new device.
                      </p>
                    </div>
                    <button type="button" className="w-full sm:w-auto shrink-0 px-6 py-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-foreground/10">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Active Login Sessions */}
                <div className="bg-background rounded-2xl p-4 sm:p-6 border border-foreground/10 shadow-sm space-y-4">
                  <div className="border-b border-foreground/10 pb-3">
                    <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-foreground">
                      <Laptop className="w-5 h-5 text-orange-500 shrink-0" />
                      Active Login Sessions
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 mt-1 leading-relaxed">
                      Devices currently logged into your account. Terminate any unfamiliar sessions immediately.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {sessions.map((session) => (
                      <div 
                        key={session.id} 
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                          session.isCurrent 
                            ? 'bg-emerald-500/5 border-emerald-500/30 shadow-xs' 
                            : 'bg-foreground/5 border-foreground/10 hover:border-foreground/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            session.isCurrent ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-foreground/10 text-foreground/60'
                          }`}>
                            {session.type === 'mobile' ? <Smartphone className="w-5 h-5" /> : session.type === 'tablet' ? <Tablet className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                                {session.deviceName}
                              </p>
                              {session.isCurrent && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md shadow-xs uppercase">
                                  Active Now
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-foreground/60 font-medium mt-0.5 truncate">
                              {session.location} • IP: {session.ip} • <span className="text-foreground/80 font-semibold">{session.lastActive}</span>
                            </p>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <button 
                            type="button" 
                            onClick={() => handleLogoutSession(session.id)}
                            className="w-full sm:w-auto px-3.5 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-500/20 shrink-0 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Log Out Device
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-b border-foreground/10 pb-4 mb-6">
                  <h2 className="text-xl font-bold">Notification Preferences</h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    Choose what updates you want to receive.
                  </p>
                </div>
                
                <div className="space-y-4">
                  
                  <label className="flex items-center justify-between p-4 bg-background border border-foreground/10 rounded-2xl cursor-pointer hover:border-foreground/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">New Enrollment Requests</h4>
                      <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Get an email when a student submits a payment TrxID.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-foreground/10 shrink-0">
                      <input 
                        type="checkbox" 
                        className="peer hidden" 
                        checked={notificationData.emailOnEnrollment}
                        onChange={(e) => setNotificationData({...notificationData, emailOnEnrollment: e.target.checked})}
                      />
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${notificationData.emailOnEnrollment ? 'bg-primary translate-x-6' : 'bg-foreground/40'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-background border border-foreground/10 rounded-2xl cursor-pointer hover:border-foreground/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base">Course Reviews</h4>
                      <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Get an email when a student leaves a review on your course.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-foreground/10 shrink-0">
                      <input 
                        type="checkbox" 
                        className="peer hidden" 
                        checked={notificationData.emailOnReview}
                        onChange={(e) => setNotificationData({...notificationData, emailOnReview: e.target.checked})}
                      />
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${notificationData.emailOnReview ? 'bg-primary translate-x-6' : 'bg-foreground/40'}`}></div>
                    </div>
                  </label>

                </div>
              </div>
            )}

            {/* General Save Button (For Payment / Notification Settings) */}
            {activeTab !== 'security' && (
              <div className="pt-6 border-t border-foreground/10 flex items-center justify-between">
                {saveSuccess ? (
                  <div className="text-green-500 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-left-4 text-xs sm:text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Settings saved successfully!
                  </div>
                ) : (
                  <div></div>
                )}
                
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
              </div>
            )}

          </form>
        </div>

      </div>

      {/* Password Change Result Popup Modal */}
      {passwordStatus.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPasswordStatus({...passwordStatus, show: false})} />
          <div className="relative w-full max-w-sm bg-background border border-foreground/15 rounded-2xl shadow-2xl p-6 text-center space-y-4 z-10 animate-in zoom-in-95">
            {passwordStatus.type === 'success' ? (
              <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/30 shadow-md">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-md">
                <AlertCircle className="w-8 h-8 animate-pulse" />
              </div>
            )}

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-foreground">{passwordStatus.title}</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
                {passwordStatus.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPasswordStatus({...passwordStatus, show: false})}
              className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
                passwordStatus.type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              }`}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

      {/* Active Session Logout Confirmation Modal */}
      {sessionStatusModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSessionStatusModal({ show: false, message: '' })} />
          <div className="relative w-full max-w-sm bg-background border border-foreground/15 rounded-2xl shadow-2xl p-6 text-center space-y-4 z-10 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-500/30 shadow-md">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-foreground">Session Logged Out</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
                {sessionStatusModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSessionStatusModal({ show: false, message: '' })}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
