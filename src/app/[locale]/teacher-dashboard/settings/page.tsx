"use client";

import { useState } from 'react';
import { ShieldCheck, CreditCard, Bell, Save, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'payment' | 'security' | 'notifications'>('payment');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form States
  const [paymentData, setPaymentData] = useState({
    bkash: '01711223344',
    nagad: '01811223344',
    rocket: ''
  });

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-foreground/60">Manage your payment methods, security, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-3 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm text-left ${
                activeTab === 'payment' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm text-left ${
                activeTab === 'security' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              Security
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm text-left ${
                activeTab === 'notifications' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
          
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
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-b border-foreground/10 pb-4 mb-6">
                  <h2 className="text-xl font-bold">Security & Password</h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    Keep your account secure by using a strong password.
                  </p>
                </div>
                
                <div className="max-w-md space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    />
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
