"use client";

import { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Globe, 
  Users, 
  UserCheck, 
  Copy, 
  Check, 
  Compass, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  FileText, 
  Code2, 
  Workflow, 
  Info, 
  HelpCircle,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Bookmark,
  Building2,
  PhoneCall,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArchitectureGuidelineManager() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'header-footer' | 'seo' | 'prompts'>('tiers');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State for AI Prompt Builder
  const [promptTier, setPromptTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [promptComponent, setPromptComponent] = useState<'header' | 'footer' | 'page' | 'mega-menu' | 'style'>('header');
  const [promptTargetTeacher, setPromptTargetTeacher] = useState('Teacher Akash');
  const [promptAction, setPromptAction] = useState('নতুন একটি পেজ যুক্ত করো');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('কপি করা হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateAIPrompt = () => {
    const tierMap = {
      tier1: 'Tier 1: Marketplace Category (গ্লোবাল মার্কেটপ্লেস - সেন্ট্রাল প্ল্যাটফর্ম)',
      tier2: 'Tier 2: Global Teacher Storefront (সকল শিক্ষকের গ্লোবাল বেস একাডেমি)',
      tier3: `Tier 3: Individual Teacher Custom Storefront (নির্দিষ্ট শিক্ষক: ${promptTargetTeacher})`
    };

    const compMap = {
      header: 'Header ও Navigation Links',
      footer: 'Footer ও Contact Information',
      page: 'Custom Page ও Content Routing',
      'mega-menu': 'Course MegaMenu (৬টি কোর্স ক্যাটাগরি)',
      style: 'Styling, Design ও Responsive UI'
    };

    return `🏛️ SkyLearners Architecture Update Request:
--------------------------------------------------
📌 ক্যাটাগরি টিয়ার: ${tierMap[promptTier]}
🎯 টার্গেট এরিয়া: ${compMap[promptComponent]}
📝 রিকোয়ারমেন্ট: ${promptAction}

⚠️ আর্কিটেকচার রুলস:
${promptTier === 'tier1' 
  ? '- এটি মার্কেটপ্লেস মোডের পরিবর্তন। কোনো শিক্ষকের ব্যক্তিগত স্টোরফ্রন্ট বা টিচার হেডারে যেন কোনো প্রভাব না পড়ে।' 
  : promptTier === 'tier2'
  ? '- এটি সকল শিক্ষকের গ্লোবাল বেস টেমপ্লেট। সুপার অ্যাডমিন হাব থেকে এক জায়গায় আপডেট করলে প্ল্যাটফর্মের সকল শিক্ষক যেন স্বয়ংক্রিয়ভাবে এটি পান।'
  : `- এটি একান্তই ${promptTargetTeacher}-এর কাস্টম স্টোরফ্রন্ট। কোনোভাবেই অন্য শিক্ষক বা গ্লোবাল মার্কেটপ্লেসে এর পরিবর্তন প্রয়োগ করা যাবে না।`}
- কোনো বিদ্যমান ফাংশনালিটি নষ্ট করা যাবে না এবং ক্লিন SEO স্লাগ অনুসরণ করতে হবে।`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 p-6 lg:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              Live Platform System Architecture
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Architecture & AI Guidelines
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              SkyLearners-এর ৩-টিয়ার ক্যাটাগরি আর্কিটেকচার, হেডার ও ফুটার স্ট্রাকচার এবং ভবিষ্যতে AI দিয়ে নিখুঁতভাবে কোড আপডেট করার সম্পূর্ণ গাইডলাইন হাব।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCopy(generateAIPrompt(), 'full-ai-prompt')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              {copiedId === 'full-ai-prompt' ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
              কুইক AI প্রম্পট কপি
            </button>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Framework</span>
            <p className="text-sm font-black text-cyan-300 mt-0.5">3-Tier Category</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Teacher Mode Rule</span>
            <p className="text-sm font-black text-purple-300 mt-0.5">Zero MegaMenu (Strict)</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Footer Structure</span>
            <p className="text-sm font-black text-amber-300 mt-0.5">4-Column Grid</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">SEO Standard</span>
            <p className="text-sm font-black text-emerald-300 mt-0.5">Clean Slugs Only</p>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tiers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'tiers'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" /> ৩-টিয়ার ফ্রেমওয়ার্ক (3-Tier Framework)
        </button>
        <button
          onClick={() => setActiveTab('header-footer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'header-footer'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-4 h-4" /> হেডার ও ফুটার ক্যাটাগরি
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'seo'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" /> ক্লিন SEO ও স্লাগ রুলস
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'prompts'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" /> AI প্রম্পট জেনারেটর (Prompt Builder)
        </button>
      </div>

      {/* TAB 1: 3-TIER FRAMEWORK */}
      {activeTab === 'tiers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TIER 1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-black uppercase tracking-wider">
                  Tier 1
                </span>
                <span className="text-xs font-bold text-slate-400">সেন্ট্রাল প্ল্যাটফর্ম</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">Marketplace Category</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                গ্লোবাল মার্কেটপ্লেস যা অর্গানিক ভিজিটর, গুগল ট্রাফিক এবং সাধারণ শিক্ষার্থীদের জন্য উন্মুক্ত।
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-cyan-300 block mb-1">হেডার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• সেন্ট্রাল SkyLearners লোগো</p>
                  <p className="text-slate-300">• ৬-ক্যাটাগরি কোর্স মেগামেনু (MegaMenu)</p>
                  <p className="text-slate-300">• গ্লোবাল সার্চ ও ফিল্টার অপশন</p>
                  <p className="text-slate-300">• হোম, কোর্স, আমাদের সম্পর্কে লিংক</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-cyan-300 block mb-1">ফুটার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• সেন্ট্রাল প্ল্যাটফর্ম ব্র্যান্ডিং ও পলিসি</p>
                  <p className="text-slate-300">• টার্মস, প্রাইভেসি ও রিফান্ড নীতি</p>
                  <p className="text-slate-300">• সেন্ট্রাল হেল্পলাইন ও কাস্টমার কেয়ার</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-amber-400 block mb-1">পরিচালনার স্থান:</span>
                  <p className="text-slate-300">সুপার অ্যাডমিন ড্যাশবোর্ড {'>'} Marketplace Manager</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleCopy(
                  'Tier 1 (Marketplace Mode) এর Header / Footer এ এই পরিবর্তন করো: [আপনার নির্দেশ লিখুন]',
                  'copy-tier1'
                )}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {copiedId === 'copy-tier1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                AI প্রম্পট কপি করুন
              </button>
            </div>
          </div>

          {/* TIER 2 */}
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-3xl p-6 relative flex flex-col justify-between hover:border-purple-500/60 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-black uppercase tracking-wider">
                  Tier 2
                </span>
                <span className="text-xs font-bold text-slate-400">সকল শিক্ষকের জন্য</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">Global Teacher Storefront</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                সকল শিক্ষকের জন্য নির্ধারিত গ্লোবাল বেস একাডেমি টেমপ্লেট। সুপার অ্যাডমিন যা সেট করে, সবাই তা পায়।
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-purple-300 block mb-1">হেডার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• ডায়নামিক টিচার লোগো / নাম ও স্লোগান</p>
                  <p className="text-slate-300">• বেস ন্যাভলিংকস (Home, Courses, About, Contact)</p>
                  <p className="text-slate-300">• অ্যাডমিনের নির্ধারিত গ্লোবাল পেজসমূহ</p>
                  <p className="text-rose-400 font-semibold">• Zero MegaMenu (মেগামেনু বন্ধ)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-purple-300 block mb-1">ফুটার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• টিচারের অটোমেটিক কন্ট্যাক্ট ও ঠিকানা</p>
                  <p className="text-slate-300">• টিচারের হোয়াটসঅ্যাপ ও অফিস সময়</p>
                  <p className="text-slate-300">• একাডেমির দ্রুত লিঙ্ক ও নোটিশ</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-amber-400 block mb-1">পরিচালনার স্থান:</span>
                  <p className="text-slate-300">সুপার অ্যাডমিন ড্যাশবোর্ড {'>'} Global Pages & Rules HUB</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleCopy(
                  'Tier 2 (Global Teacher Storefront) এ সকল শিক্ষকের জন্য এই নতুন গ্লোবাল পেজ/রুল/ডিজাইন আপডেট করো: [আপনার নির্দেশ লিখুন]',
                  'copy-tier2'
                )}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {copiedId === 'copy-tier2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                AI প্রম্পট কপি করুন
              </button>
            </div>
          </div>

          {/* TIER 3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                  Tier 3
                </span>
                <span className="text-xs font-bold text-slate-400">একক শিক্ষক কাস্টম</span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">Individual Teacher Custom</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                কোনো নির্দিষ্ট একক শিক্ষকের (যেমন: Teacher Akash) ব্যক্তিগত ব্র্যান্ডিং ও স্পেশাল কাস্টম একাডেমি।
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-emerald-300 block mb-1">হেডার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• শিক্ষকের কাস্টম ন্যাভলিংক (`customNavLinks`)</p>
                  <p className="text-slate-300">• স্পেশাল পেজ (যেমন: `/notice`, `/batch-2026`)</p>
                  <p className="text-slate-300">• শিক্ষকের নিজস্ব কাস্টম ব্র্যান্ড কালার</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-emerald-300 block mb-1">ফুটার কম্পোনেন্ট:</span>
                  <p className="text-slate-300">• নির্দিষ্ট শিক্ষকের নিজস্ব ফুটার ওভাররাইড</p>
                  <p className="text-slate-300">• স্পেশাল সোশ্যাল লিঙ্ক ও ব্যক্তিগত নীতি</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="font-bold text-amber-400 block mb-1">পরিচালনার স্থান:</span>
                  <p className="text-slate-300">শিক্ষকের Website Builder অথবা অ্যাডমিনের Teacher Control Manager</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleCopy(
                  'Tier 3 (Individual Teacher Storefront) - Teacher [শিক্ষকের নাম বা ID] এর জন্য এই স্পেশাল পেজ/ব্র্যান্ডিং আপডেট করো: [আপনার নির্দেশ লিখুন]',
                  'copy-tier3'
                )}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {copiedId === 'copy-tier3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                AI প্রম্পট কপি করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER & FOOTER CATEGORIES */}
      {activeTab === 'header-footer' && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">হেডারের ৬টি মূল কোর্স ক্যাটাগরি (Course MegaMenu)</h3>
                <p className="text-xs text-slate-400">মার্কেটপ্লেস হেডারের "কোর্সসমূহ" ড্রপডাউন/মেগামেনুতে এই ৬টি ক্যাটাগরি সাজানো রয়েছে:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-cyan-400">১. প্রাথমিক বিদ্যালয় (Primary School)</span>
                <p className="text-xs text-slate-300 mt-1">শ্রেণি ১ থেকে শ্রেণি ৫ পর্যন্ত সকল বিষয়ভিত্তিক প্রাথমিক শিক্ষা কোর্স।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 font-mono">Category ID: primary</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-blue-400">২. মাধ্যমিক (High School / SSC)</span>
                <p className="text-xs text-slate-300 mt-1">শ্রেণি ৬ থেকে শ্রেণি ১০ (এসএসসি) পর্যন্ত বিজ্ঞান, মানবিক ও সাধারণ বিষয়।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 font-mono">Category ID: secondary</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-purple-400">৩. উচ্চ মাধ্যমিক (HSC / College)</span>
                <p className="text-xs text-slate-300 mt-1">একাদশ ও দ্বাদশ শ্রেণি (বিজ্ঞান, মানবিক এবং ব্যবসায় শিক্ষা বিভাগ)।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 font-mono">Category ID: higher_secondary</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-amber-400">৪. বিশ্ববিদ্যালয় ভর্তি (Admission)</span>
                <p className="text-xs text-slate-300 mt-1">ইঞ্জিনিয়ারিং, মেডিকেল, ভার্সিটি ক/খ/গ/ঘ ইউনিট, IBA ও BUP প্রস্তুতি।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 font-mono">Category ID: admission</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-rose-400">৫. অনার্স / মাস্টার্স (Higher Ed)</span>
                <p className="text-xs text-slate-300 mt-1">জাতীয় বিশ্ববিদ্যালয় ও পাবলিক বিশ্ববিদ্যালয়ের বিভিন্ন বর্ষ ও বিষয়ভিত্তিক কোর্স।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 font-mono">Category ID: honours_masters</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-black text-emerald-400">৬. দক্ষতা ও আইটি (Skills & IT)</span>
                <p className="text-xs text-slate-300 mt-1">ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন, ডিজিটাল মার্কেটিং ও ফ্রিল্যান্সিং।</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 font-mono">Category ID: skills</span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">ফুটারের ৪টি কলাম / সেকশন ক্যাটাগরি</h3>
                <p className="text-xs text-slate-400">মার্কেটপ্লেস ও টিচার একাডেমি উভয় ফুটারে ৪টি কলামে তথ্য সাজানো থাকে:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block mb-1">কলাম ১: প্ল্যাটফর্ম ও ব্র্যান্ডিং</span>
                <p className="text-xs text-slate-300">
                  SkyLearners লোগো, ভিশন, সোশ্যাল হ্যান্ডেলসমূহ। (টিচার মোডে: টিচারের নিজস্ব একাডেমি নাম ও পরিচিতি)।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block mb-1">কলাম ২: দ্রুত লিঙ্ক (Quick Links)</span>
                <p className="text-xs text-slate-300">
                  হোম, সকল কোর্স, আমাদের সম্পর্কে, যোগাযোগ। (টিচার মোডে: টিচারের লাইভ ব্যাচ ও কোর্স তালিকা)।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block mb-1">কলাম ৩: লার্নিং প্রোগ্রাম</span>
                <p className="text-xs text-slate-300">
                  প্রাথমিক, মাধ্যমিক, উচ্চ মাধ্যমিক, এডমিশন ও স্কিলস। (টিচার মোডে: শিক্ষকের স্পেশাল ব্যাচ ও এক্সাম)।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block mb-1">কলাম ৪: যোগাযোগ ও সাপোর্ট</span>
                <p className="text-xs text-slate-300">
                  হেল্প সেন্টার, প্রাইভেসি পলিসি, রিফান্ড পলিসি। (টিচার মোডে: টিচারের নিজস্ব ঠিকানা, ফোন, হোয়াটসঅ্যাপ)।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLEAN SEO & SLUGS */}
      {activeTab === 'seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Clean URL & SEO Rules (ক্লিন স্লাগ স্ট্যান্ডার্ড)</h3>
              <p className="text-xs text-slate-400">প্ল্যাটফর্মে যেকোনো নতুন পেজ বা কোর্স তৈরি করার সময় এই নিয়মগুলো বাধ্যতামূলক:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> কোর্সের ক্লিন স্লাগ রুল
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                কোর্সের ইউআরএলে কোনো হিজিবিজি আইডি বা অপ্রয়োজনীয় প্যারামিটার থাকবে না:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
                /courses/[courseSlug]
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                যেমন: <span className="text-slate-200">/courses/easy-physics</span> বা <span className="text-slate-200">/courses/hsc-math-2026</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> শিক্ষক একাডেমির ক্লিন স্লাগ রুল
              </h4>
              <p className="text-xs text-slate-300 mb-3">
                প্রত্যেক শিক্ষকের নিজস্ব স্টোরফ্রন্ট ইউনিক স্লাগে ওপেন হয়:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
                /teachers/[teacherSlug]
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                যেমন: <span className="text-slate-200">/teachers/akash-sir</span> বা <span className="text-slate-200">/teachers/physics-hub</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20">
            <h4 className="text-xs font-bold text-purple-300 mb-1">অটোমেটিক সেশন পারসিস্টেন্স রুল (Session Memory):</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              কোনো শিক্ষার্থী যখন কোনো শিক্ষকের লিংকে ঢোকে (<span className="text-purple-300 font-mono">/teachers/[slug]</span>), সিস্টেম স্বয়ংক্রিয়ভাবে <span className="text-purple-300 font-mono">sessionStorage.setItem('referralTeacherId', uid)</span> এ তা সংরক্ষণ করে। এর ফলে শিক্ষার্থী সাইটের যেকোনো পেজে গেলে সেই শিক্ষকের ব্র্যান্ডিং অপরিবর্তিত থাকে।
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE AI PROMPT BUILDER */}
      {activeTab === 'prompts' && (
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">AI প্রম্পট জেনারেটর (Prompt Helper)</h3>
                <p className="text-xs text-slate-400">
                  ভবিষ্যতে AI দিয়ে কোড আপডেট করার সময় এখান থেকে সরাসরি সঠিক নির্দেশনা তৈরি করে কপি করে নিন:
                </p>
              </div>
            </div>
          </div>

          {/* Builder Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">১. ক্যাটাগরি টিয়ার নির্বাচন করুন:</label>
              <select
                value={promptTier}
                onChange={(e) => setPromptTier(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="tier1">Tier 1: Marketplace (সেন্ট্রাল প্ল্যাটফর্ম)</option>
                <option value="tier2">Tier 2: Global Teacher (সকল শিক্ষকের গ্লোবাল)</option>
                <option value="tier3">Tier 3: Individual Teacher (একক শিক্ষক কাস্টম)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">২. কোন অংশে পরিবর্তন করবেন:</label>
              <select
                value={promptComponent}
                onChange={(e) => setPromptComponent(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="header">Header & Navigation Menu</option>
                <option value="footer">Footer & Contact Links</option>
                <option value="page">Custom Page / Route</option>
                <option value="mega-menu">Course MegaMenu</option>
                <option value="style">Design, Styling & Animation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                {promptTier === 'tier3' ? '৩. শিক্ষকের নাম / আইডি:' : '৩. পরিবর্তন বিবরণ:'}
              </label>
              {promptTier === 'tier3' ? (
                <input
                  type="text"
                  value={promptTargetTeacher}
                  onChange={(e) => setPromptTargetTeacher(e.target.value)}
                  placeholder="যেমন: Teacher Akash / teacher-01"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <input
                  type="text"
                  value={promptAction}
                  onChange={(e) => setPromptAction(e.target.value)}
                  placeholder="যেমন: নতুন নোটিশ পেজ যুক্ত করো"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              )}
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">Generated AI Prompt:</span>
              <button
                onClick={() => handleCopy(generateAIPrompt(), 'generator-prompt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {copiedId === 'generator-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                প্রম্পট কপি করুন
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {generateAIPrompt()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
