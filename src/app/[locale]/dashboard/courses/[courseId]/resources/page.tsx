"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { FileText, ExternalLink, BookOpen, FileImage, Presentation, Link as LinkIcon, Search, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FlyingBookLoader from '@/components/ui/FlyingBookLoader';

type Resource = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
};

const TYPE_INFO: Record<string, { icon: React.FC<any>; color: string; bg: string; badge: string }> = {
  'PDF':        { icon: FileText,     color: 'text-red-500 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-500/15',     badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  'Slide':      { icon: BookOpen,     color: 'text-blue-500 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-500/15',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  'Image':      { icon: FileImage,    color: 'text-green-500 dark:text-green-400',bg: 'bg-green-50 dark:bg-green-500/15', badge: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  'Other Link': { icon: LinkIcon,     color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/15', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
};

const getTypeInfo = (type: string) => TYPE_INFO[type] || TYPE_INFO['Other Link'];

export default function StudentResources() {
  const tHero = useTranslations('Dashboard.studentHero');
  const params = useParams();
  const courseId = params.courseId as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchResources = async () => {
      if (!courseId) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResources(docSnap.data().resources || []);
        }
      } catch (error) {
        console.error("Error fetching resources", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [courseId]);

  // Available unique types
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    resources.forEach(r => { if (r.type) types.add(r.type); });
    return Array.from(types);
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (selectedType !== 'All' && res.type !== selectedType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return res.title.toLowerCase().includes(q) || (res.type && res.type.toLowerCase().includes(q));
      }
      return true;
    });
  }, [resources, searchQuery, selectedType]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FlyingBookLoader />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* Hero Section */}
      <div className="relative w-full mb-6 shadow-lg rounded-none overflow-hidden">
        <div className="absolute inset-0 bg-[#111827]"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 30%, #111827 60%, #0f172a 100%)'}} />
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 15% 60%, rgba(249,115,22,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.2) 0%, transparent 40%)'}} />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-[0.04]" style={{background: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 14px)'}} />
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-[0.06]" style={{background: 'radial-gradient(circle, #f97316 0%, transparent 70%)'}} />
        
        {/* Animated Icon Background */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
          <BookOpen className="w-32 h-32 text-orange-500 animate-pulse" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-extrabold rounded uppercase tracking-widest">{tHero('badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-1.5 sm:mb-2 drop-shadow-sm flex items-center gap-3">
              <FileText className="w-7 h-7 sm:w-10 sm:h-10 text-orange-400" />
              {tHero('resourcesTitle')}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm font-medium">{tHero('resourcesSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Single Row Search & Filter Bar */}
      {resources.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background border border-foreground/10 p-2.5 sm:p-3 rounded-xl shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-foreground/5 border border-transparent pl-9 pr-3 py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-orange-500/50 transition-colors text-foreground"
            />
          </div>

          {/* Type Filter Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button 
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedType === 'All' ? 'bg-orange-500 text-white shadow-sm' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'}`}
            >
              All ({resources.length})
            </button>
            {availableTypes.map(type => {
              const count = resources.filter(r => r.type === type).length;
              return (
                <button 
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedType === type ? 'bg-orange-500 text-white shadow-sm' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'}`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-foreground/10 rounded-xl bg-foreground/[0.02] p-6">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold mb-2 text-foreground">
            {resources.length === 0 ? "No Materials Yet" : "No matching resources found"}
          </h2>
          <p className="text-foreground/60 text-xs sm:text-sm max-w-sm">
            {resources.length === 0 
              ? "Your instructor hasn't uploaded any study materials for this course yet." 
              : "Try adjusting your search or selected filter."}
          </p>
          {resources.length > 0 && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
              className="mt-4 px-4 py-2 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-lg hover:bg-orange-500/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredResources.map((res) => {
            const info = getTypeInfo(res.type);
            const Icon = info.icon;
            return (
              <a
                key={res.id}
                href={res.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 p-4 rounded-xl border border-foreground/10 bg-background hover:border-orange-500/40 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Icon + Badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${info.bg}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${info.color}`} />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded ${info.badge}`}>
                    {res.type}
                  </span>
                </div>

                {/* Title */}
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
                    {res.title}
                  </h3>
                </div>

                {/* Open Link */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-orange-500 mt-auto">
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Open Resource</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Stats bar if resources exist */}
      {resources.length > 0 && (
        <p className="text-xs text-foreground/50 text-center pt-2">
          {filteredResources.length} of {resources.length} resource{resources.length !== 1 ? 's' : ''} shown
        </p>
      )}
    </div>
  );
}
