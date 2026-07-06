"use client";

import { useEffect, useRef } from 'react';
import { X, GraduationCap, Presentation } from 'lucide-react';
import gsap from 'gsap';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'student' | 'teacher') => void;
}

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole }: RoleSelectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out", delay: 0.1 }
      );
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { opacity: 0, scale: 0.95, y: 20, duration: 0.3 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-background border border-foreground/10 p-8 rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Join Sky Learners</h2>
          <p className="text-foreground/60">How would you like to use our platform?</p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => onSelectRole('student')}
            className="w-full p-6 flex items-center gap-6 bg-foreground/5 hover:bg-primary/10 border border-foreground/10 hover:border-primary/50 rounded-2xl transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <GraduationCap size={32} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">I am a Student</h3>
              <p className="text-sm text-foreground/60">I want to learn and access courses</p>
            </div>
          </button>
          
          <button 
            onClick={() => onSelectRole('teacher')}
            className="w-full p-6 flex items-center gap-6 bg-foreground/5 hover:bg-orange-500/10 border border-foreground/10 hover:border-orange-500/50 rounded-2xl transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Presentation size={32} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold mb-1 group-hover:text-orange-500 transition-colors">I am a Teacher</h3>
              <p className="text-sm text-foreground/60">I want to teach and create courses</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
