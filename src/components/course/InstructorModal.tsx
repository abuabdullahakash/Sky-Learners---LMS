"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Facebook, Youtube, Linkedin, Globe, BookOpen } from 'lucide-react';
import { PerspectiveCarouselItem } from '@/components/ui/perspective-carousel';
import Image from 'next/image';

interface InstructorModalProps {
  instructor: PerspectiveCarouselItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstructorModal({ instructor, isOpen, onClose }: InstructorModalProps) {
  if (!instructor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-background border border-foreground/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl shadow-primary/10 pointer-events-auto relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-background/50 hover:bg-background/80 backdrop-blur-md rounded-full text-foreground/70 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header / Cover Area */}
              <div className="relative h-32 md:h-40 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 shrink-0">
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-foreground/5 shadow-lg relative">
                    <Image
                      src={instructor.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="pt-20 px-8 pb-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold mb-1">{instructor.name}</h2>
                  <p className="text-lg font-bold text-primary mb-1">{instructor.role || 'Instructor'}</p>
                  <p className="text-foreground/70 font-medium text-sm">{instructor.background}</p>
                </div>

                {instructor.responsibility && (
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1 text-foreground/90">Topics Covered in this Course</h4>
                      <p className="text-foreground/80 text-sm leading-relaxed">{instructor.responsibility}</p>
                    </div>
                  </div>
                )}

                {instructor.bio && (
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-3">About the Instructor</h3>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {instructor.bio}
                    </p>
                  </div>
                )}

                {/* Social Links */}
                {(instructor.facebookUrl || instructor.youtubeUrl || instructor.linkedinUrl || instructor.profileUrl) && (
                  <div className="pt-6 border-t border-foreground/10 flex flex-wrap gap-3">
                    {instructor.facebookUrl && (
                      <a href={instructor.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-xl transition-colors font-medium text-sm">
                        <Facebook className="w-4 h-4" /> Facebook
                      </a>
                    )}
                    {instructor.youtubeUrl && (
                      <a href={instructor.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white rounded-xl transition-colors font-medium text-sm">
                        <Youtube className="w-4 h-4" /> YouTube
                      </a>
                    )}
                    {instructor.linkedinUrl && (
                      <a href={instructor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white rounded-xl transition-colors font-medium text-sm">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {instructor.profileUrl && (
                      <a href={instructor.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background rounded-xl transition-colors font-medium text-sm">
                        <Globe className="w-4 h-4" /> View Profile
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
