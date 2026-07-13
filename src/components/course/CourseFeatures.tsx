import { useTranslations } from 'next-intl';
import { Video, CalendarDays, FileText, HelpCircle, FileCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CourseFeatures({ course }: { course: any }) {
  const t = useTranslations('CourseDetails');
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    shapesRef.current.forEach((shape, index) => {
      if (!shape) return;
      gsap.to(shape, {
        y: "random(-15, 15)",
        x: "random(-15, 15)",
        scale: "random(0.9, 1.1)",
        rotation: "random(-10, 10)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2,
      });
    });
  }, []);

  // If no features are provided, we don't render the section to avoid empty UI
  if (!course.totalLiveClasses && !course.totalVideoLessons && !course.totalExams && !course.totalPdfs && !course.hasDoubtSolving) {
    return null;
  }

  const features = [];
  
  if (course.totalLiveClasses) {
    features.push({
      icon: <CalendarDays className="w-8 h-8 text-blue-500" />,
      title: `${course.totalLiveClasses} লাইভ ক্লাস`,
      description: "ইন্টারেক্টিভ লাইভ সেশন"
    });
  }
  
  if (course.totalVideoLessons) {
    features.push({
      icon: <Video className="w-8 h-8 text-orange-500" />,
      title: `${course.totalVideoLessons} রেকর্ডেড ভিডিও`,
      description: "যেকোনো সময় দেখার সুযোগ"
    });
  }
  
  if (course.totalExams) {
    features.push({
      icon: <FileCheck className="w-8 h-8 text-green-500" />,
      title: `${course.totalExams} পরীক্ষা ও কুইজ`,
      description: "প্রস্তুতি যাচাই করার সুযোগ"
    });
  }
  
  if (course.totalPdfs) {
    features.push({
      icon: <FileText className="w-8 h-8 text-purple-500" />,
      title: `${course.totalPdfs} লেকচার শিট/নোট`,
      description: "PDF এবং স্টাডি ম্যাটেরিয়াল"
    });
  }
  
  if (course.hasDoubtSolving) {
    features.push({
      icon: <HelpCircle className="w-8 h-8 text-red-500" />,
      title: "ডাউট সলভিং",
      description: "২৪/৭ প্রশ্ন সমাধানের সুবিধা"
    });
  }

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 mt-8 mb-12">
      <h2 className="text-3xl font-bold mb-6">কোর্সে যা যা থাকছে</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((feature, i) => {
          const colors = [
            'bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
            'bg-orange-50/50 hover:bg-orange-100/50 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 border-orange-200/50 dark:border-orange-800/30 text-orange-700 dark:text-orange-400',
            'bg-green-50/50 hover:bg-green-100/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 border-green-200/50 dark:border-green-800/30 text-green-700 dark:text-green-400',
            'bg-purple-50/50 hover:bg-purple-100/50 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30 text-purple-700 dark:text-purple-400',
            'bg-red-50/50 hover:bg-red-100/50 dark:bg-red-900/10 dark:hover:bg-red-900/20 border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-400',
          ];
          const shapeColors = [
            'bg-blue-400/20 dark:bg-blue-500/20',
            'bg-orange-400/20 dark:bg-orange-500/20',
            'bg-green-400/20 dark:bg-green-500/20',
            'bg-purple-400/20 dark:bg-purple-500/20',
            'bg-red-400/20 dark:bg-red-500/20',
          ];
          const colorClass = colors[i % colors.length];
          const shapeColorClass = shapeColors[i % shapeColors.length];

          return (
            <div key={i} className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-default relative overflow-hidden ${colorClass}`}>
              {/* Animated Background Shape */}
              <div 
                ref={el => { shapesRef.current[i] = el; }}
                className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl ${shapeColorClass} pointer-events-none`}
              />
              
              <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-1 text-foreground">{feature.title}</h3>
              <p className="text-sm opacity-80">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
