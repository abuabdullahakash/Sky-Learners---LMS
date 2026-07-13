import { Star, MessageSquareQuote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CourseTestimonials({ testimonials }: { testimonials?: any[] }) {
  const t = useTranslations('CourseDetails');
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    shapesRef.current.forEach((shape, index) => {
      if (!shape) return;
      gsap.to(shape, {
        y: "random(-10, 10)",
        x: "random(-10, 10)",
        scale: "random(0.95, 1.05)",
        rotation: "random(-5, 5)",
        duration: "random(4, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.3,
      });
    });
  }, []);

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
        {displayTestimonials.map((review, i) => {
          const colors = [
            'bg-orange-50/30 border-orange-100/50 dark:bg-orange-900/5 dark:border-orange-800/20',
            'bg-blue-50/30 border-blue-100/50 dark:bg-blue-900/5 dark:border-blue-800/20',
            'bg-green-50/30 border-green-100/50 dark:bg-green-900/5 dark:border-green-800/20'
          ];
          const shapeColors = [
            'bg-orange-400/20 dark:bg-orange-500/10',
            'bg-blue-400/20 dark:bg-blue-500/10',
            'bg-green-400/20 dark:bg-green-500/10'
          ];
          const colorClass = colors[i % colors.length];
          const shapeColorClass = shapeColors[i % shapeColors.length];

          return (
            <div key={i} className={`rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border ${colorClass} relative overflow-hidden group`}>
              {/* Animated Background Shape */}
              <div 
                ref={el => { shapesRef.current[i] = el; }}
                className={`absolute -left-6 -bottom-6 w-32 h-32 rounded-full blur-3xl ${shapeColorClass} pointer-events-none`}
              />
              
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquareQuote className="w-16 h-16" />
              </div>
              <div className="flex text-yellow-400 mb-4 relative z-10">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'fill-current' : 'text-foreground/20'}`} />
                ))}
              </div>
              <p className="text-foreground/80 italic mb-6 relative z-10">"{review.text}"</p>
              <div className="relative z-10">
                <p className="font-bold text-foreground">{review.name}</p>
                <p className="text-xs text-foreground/50 uppercase tracking-wider">{review.role}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
