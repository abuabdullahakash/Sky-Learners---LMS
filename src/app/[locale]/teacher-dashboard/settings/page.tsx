"use client";

import { useState, useRef } from 'react';
import { ShieldCheck, CreditCard, Bell, Save, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'payment' | 'security' | 'notifications'>('payment');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Form States
  const [paymentData, setPaymentData] = useState({
    bkash: '',
    nagad: '',
    rocket: ''
  });
  const [isLoading, setIsLoading] = useState(true);

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

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationData, setNotificationData] = useState({
    emailOnEnrollment: true,
    emailOnReview: false,
    pushNotifications: true
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        paymentData: paymentData
        // Add security and notifications saving logic here later
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-foreground/60">Manage your payment methods, security, and preferences.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Horizontal Scrollable Tabs */}
        <div className="relative group flex items-center bg-foreground/5 border border-foreground/10 rounded-2xl p-1.5">
          
          <button 
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
            onClick={() => scrollTabs('right')}
            className="absolute right-0 z-10 w-12 h-full bg-gradient-to-l from-background via-background/90 to-transparent flex items-center justify-end pr-2 text-foreground/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 md:hidden pointer-events-none"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronRight className="w-5 h-5 bg-background rounded-full shadow" />
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
          
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
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-b border-foreground/10 pb-4">
                  <h2 className="text-xl font-bold">Security & Password</h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    Keep your account secure by using a strong password and enabling extra security features.
                  </p>
                </div>
                
                {/* Change Password Section */}
                <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-foreground/80">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground/80">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication (UI Only) */}
                <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        Two-Factor Authentication (2FA)
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Recommended</span>
                      </h3>
                      <p className="text-sm text-foreground/60 max-w-xl">
                        Add an extra layer of security to your account. We will ask for a verification code when you sign in from a new device.
                      </p>
                    </div>
                    <button type="button" className="shrink-0 px-6 py-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-xl font-bold text-sm transition-colors border border-foreground/10">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Active Sessions (UI Only) */}
                <div className="bg-background rounded-2xl p-6 border border-foreground/10 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Active Login Sessions</h3>
                  <p className="text-sm text-foreground/60 mb-6">
                    Here are all the devices that are currently logged into your account. If you see an unfamiliar device, log out from it immediately.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Current Device */}
                    <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm flex items-center gap-2">
                            MacBook Pro - Chrome 
                            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-medium">Active Now</span>
                          </p>
                          <p className="text-xs text-foreground/60">Dhaka, Bangladesh • IP: 192.168.1.1</p>
                        </div>
                      </div>
                    </div>

                    {/* Other Device */}
                    <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-foreground/10 text-foreground/60 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </div>
                        <div>
                          <p className="font-bold text-sm">Windows PC - Firefox</p>
                          <p className="text-xs text-foreground/60">Chittagong, Bangladesh • Last active: 2 days ago</p>
                        </div>
                      </div>
                      <button type="button" className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors">
                        Log Out Device
                      </button>
                    </div>
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
                      <h4 className="font-semibold">New Enrollment Requests</h4>
                      <p className="text-sm text-foreground/60">Get an email when a student submits a payment TrxID.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-foreground/10">
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
                      <h4 className="font-semibold">Course Reviews</h4>
                      <p className="text-sm text-foreground/60">Get an email when a student leaves a review on your course.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-foreground/10">
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

            {/* Save Button */}
            <div className="pt-6 border-t border-foreground/10 flex items-center justify-between">
              {saveSuccess ? (
                <div className="text-green-500 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-left-4">
                  <CheckCircle2 className="w-5 h-5" /> Settings saved successfully!
                </div>
              ) : (
                <div></div> // Empty div for spacing
              )}
              
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
