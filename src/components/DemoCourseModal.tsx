"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  GraduationCap, 
  CheckCircle2, 
  Flame 
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

export interface DemoCourseData {
  id?: string;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  category?: string;
  eduClass?: string | number;
  price?: number;
  instructorName?: string;
  coachingName?: string;
  isDemo?: boolean;
}

interface DemoCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: DemoCourseData | null;
}

export default function DemoCourseModal({ isOpen, onClose, course }: DemoCourseModalProps) {
  const locale = useLocale();
  const isBn = locale === "bn";

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* 1. Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* 2. Modal Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg rounded-3xl bg-card border-2 border-orange-500/30 text-card-foreground shadow-2xl shadow-orange-500/20 overflow-hidden z-10 p-6 sm:p-8"
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Tag / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black mb-4">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>{isBn ? "প্ল্যাটফর্ম ডেমো প্রিভিউ কোর্স" : "Platform Demo Preview Course"}</span>
          </div>

          {/* Modal Title */}
          <h3 className="text-xl sm:text-2xl font-black text-foreground leading-snug">
            {isBn ? "এটি একটি নমুনা (Demo) কোর্স!" : "This is a Demo Preview Course!"}
          </h3>

          {/* Course Mini Preview Box */}
          {course && (
            <div className="mt-4 p-3.5 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.04] border border-foreground/10 flex items-center gap-3.5">
              {course.thumbnailUrl ? (
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-foreground/10 shrink-0 border border-foreground/10">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-500 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                  {course.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-foreground/60 font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase text-[10px]">
                    {course.category || (isBn ? "নমুনা কোর্স" : "Demo Course")}
                  </span>
                  <span>•</span>
                  <span>{course.price && course.price > 0 ? `৳ ${course.price}` : (isBn ? "ফ্রি" : "Free")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Text */}
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
            <p className="p-3 rounded-xl bg-orange-500/[0.06] border border-orange-500/15">
              🚧 <strong className="text-foreground font-bold">
                {isBn ? "সাইট তৈরির কাজ চলমান:" : "Platform under development:"}
              </strong>{" "}
              {isBn 
                ? "শিক্ষকরা তাঁদের নিজস্ব কোর্স তৈরি করলে ওয়েবসাইটে ঠিক কীভাবে সুন্দরভাবে প্রদর্শিত হবে—তা বোঝানোর জন্য এই নমুনা কোর্সটি প্রদর্শিত হচ্ছে।"
                : "This sample course is displayed to demonstrate how instructor-created courses will appear beautifully to students on our platform."}
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {isBn 
                    ? "খুব শীঘ্রই শীর্ষ মেন্টর ও শিক্ষকদের আসল লাইভ ব্যাচগুলো এনরোলমেন্টের জন্য উন্মুক্ত করা হবে।"
                    : "Live enrollment batches by verified instructors will be available very soon."}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>
                  {isBn 
                    ? "আপনি যদি একজন শিক্ষক বা কোচিং পরিচালক হন, তবে এখনই নিজের কোর্স যুক্ত করতে পারেন!"
                    : "If you are a teacher or coaching owner, you can publish your real courses today!"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t border-foreground/10 flex flex-col sm:flex-row items-center gap-3">
            {/* 1. Teacher CTA (Create Course) */}
            <Link
              href="/teacher-dashboard/courses/create"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? "শিক্ষক হিসেবে কোর্স তৈরি করুন" : "Create Course as Teacher"}</span>
            </Link>

            {/* 2. Close / Explore CTA */}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>{isBn ? "ঠিক আছে, বুঝতে পেরেছি" : "Got it, Close"}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
