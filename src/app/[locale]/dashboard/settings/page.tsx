"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { User, Shield, Bell, CreditCard, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function SettingsPage() {
  const t = useTranslations('Dashboard.settings');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const { user } = useAuth();

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'security', label: t('tabs.security'), icon: Shield },
    { id: 'preferences', label: t('tabs.preferences'), icon: Bell },
    { id: 'billing', label: t('tabs.billing'), icon: CreditCard },
  ] as const;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-3xl p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold mb-2 relative z-10">{t('title')}</h1>
        <p className="text-foreground/70 relative z-10">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 p-1 bg-foreground/5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-background shadow-md text-primary scale-100'
                  : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5 scale-95 hover:scale-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="bg-background/40 backdrop-blur-md border border-foreground/10 rounded-3xl p-8 shadow-xl">
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('profile.title')}</h2>
              <p className="text-foreground/60">{t('profile.subtitle')}</p>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-foreground/5">
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-foreground/30">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('profile.picture')}</h3>
                <button className="mt-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium transition-colors">
                  {t('profile.uploadBtn')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('profile.personal')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.name')}</label>
                    <input type="text" defaultValue={user?.displayName || ''} className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.phone')}</label>
                    <input type="tel" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground/70 mb-1">{t('profile.dob')}</label>
                      <input type="date" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground/70 mb-1">{t('profile.gender')}</label>
                      <select className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('profile.academic')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.institution')}</label>
                    <input type="text" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('profile.class')}</label>
                    <input type="text" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                {t('profile.saveBtn')}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('security.title')}</h2>
              <p className="text-foreground/60">{t('security.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('security.changePassword')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.email')}</label>
                    <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 bg-foreground/10 border border-foreground/10 rounded-xl text-foreground/50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.newPassword')}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground/70 mb-1">{t('security.confirmPassword')}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                  </div>
                  <button className="w-full py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 mt-2">
                    {t('security.updateBtn')}
                  </button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('security.connected')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2 shadow-sm">
                        <svg className="w-full h-full" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <div>
                        <p className="font-medium">{t('security.google')}</p>
                        <p className="text-sm text-foreground/50">{user?.providerData.some(p => p.providerId === 'google.com') ? user.email : t('security.notConnectedStatus')}</p>
                      </div>
                    </div>
                    {user?.providerData.some(p => p.providerId === 'google.com') ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4" /> {t('security.connectedStatus')}
                      </span>
                    ) : (
                      <button className="text-sm font-medium text-primary hover:underline">Connect</button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center p-2 shadow-sm">
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <div>
                        <p className="font-medium">{t('security.facebook')}</p>
                        <p className="text-sm text-foreground/50">{user?.providerData.some(p => p.providerId === 'facebook.com') ? 'Connected via Facebook' : t('security.notConnectedStatus')}</p>
                      </div>
                    </div>
                    {user?.providerData.some(p => p.providerId === 'facebook.com') ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4" /> {t('security.connectedStatus')}
                      </span>
                    ) : (
                      <button className="text-sm font-medium text-primary hover:underline">Connect</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('preferences.title')}</h2>
              <p className="text-foreground/60">{t('preferences.subtitle')}</p>
            </div>

            <div className="max-w-2xl space-y-6">
              <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('preferences.notifications')}</h3>
              
              {[
                { id: 'notif1', label: t('preferences.notifCourses'), defaultChecked: true },
                { id: 'notif2', label: t('preferences.notifExams'), defaultChecked: true },
                { id: 'notif3', label: t('preferences.notifOffers'), defaultChecked: false }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-foreground/5 hover:border-primary/30 transition-colors">
                  <span className="font-medium text-foreground/80">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                    <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('billing.title')}</h2>
              <p className="text-foreground/60">{t('billing.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('billing.activePlan')}</h3>
                <div className="p-8 bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-2xl border border-foreground/10 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <XCircle className="w-12 h-12 text-foreground/30 mb-4" />
                  <p className="text-foreground/70 mb-4">{t('billing.noPlan')}</p>
                  <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                    {t('billing.upgradeBtn')}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-foreground/10 pb-2">{t('billing.history')}</h3>
                <div className="p-8 bg-foreground/5 rounded-2xl border border-foreground/10 flex flex-col items-center justify-center min-h-[200px]">
                  <p className="text-foreground/50">{t('billing.noHistory')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
