import { Star, MessageSquareQuote } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CourseTestimonials({ testimonials }: { testimonials?: any[] }) {
  const t = useTranslations('CourseDetails');

  // Fallback data
  const defaultTestimonials = [
    { name: "Rafiqul Islam", role: "HSC Candidate", text: "This course completely changed my preparation strategy. The materials are top-notch!", rating: 5 },
    { name: "Sadia Rahman", role: "University Student", text: "Amazing instructor and very clear explanations. I finally understood the complex topics.", rating: 5 },
    { name: "Mahmud Hasan", role: "Freelancer", text: "Best decision I made for my career. The practical projects helped me build my portfolio.", rating: 4 },
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="animate-in slide-in-from-bottom-4 duration-700 delay-500 mt-12">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <MessageSquareQuote className="w-8 h-8 text-primary" /> 
        {t('testimonials')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTestimonials.map((review, i) => (
          <div key={i} className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex text-yellow-400 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-current' : 'text-foreground/20'}`} />
              ))}
            </div>
            <p className="text-foreground/80 italic mb-6">"{review.text}"</p>
            <div>
              <p className="font-bold text-foreground">{review.name}</p>
              <p className="text-xs text-foreground/50 uppercase tracking-wider">{review.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
