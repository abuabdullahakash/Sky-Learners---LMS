import { useTranslations } from 'next-intl';
import { Video, CalendarDays, FileText, HelpCircle, FileCheck } from 'lucide-react';

export default function CourseFeatures({ course }: { course: any }) {
  const t = useTranslations('CourseDetails');

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
        {features.map((feature, i) => (
          <div key={i} className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-default">
            <div className="p-4 bg-foreground/5 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
            <p className="text-sm text-foreground/60">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
