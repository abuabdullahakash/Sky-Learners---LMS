import { PhoneCall } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function StickyPricingCard({ course }: { course: any }) {
  const t = useTranslations('CourseDetails');
  const router = useRouter();
  const shapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shapeRef.current) {
      gsap.to(shapeRef.current, {
        y: "random(-10, 10)",
        x: "random(-10, 10)",
        scale: "random(0.95, 1.05)",
        rotation: "random(-5, 5)",
        duration: "random(4, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  let isDiscountValid = false;
  if (course?.discountPrice && course?.discountValidUntil) {
    const validUntil = new Date(course.discountValidUntil);
    if (validUntil >= new Date()) {
      isDiscountValid = true;
    }
  }

  return (
    <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit pb-12">
      <div className="bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-900/5 border border-blue-100 dark:border-foreground/10 rounded-xl p-6 shadow-xl relative overflow-hidden group">
        <div 
          ref={shapeRef}
          className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full pointer-events-none opacity-50 dark:opacity-30" 
        />
        <div className="text-center mb-6 relative z-10">
          <p className="text-foreground/50 font-bold uppercase tracking-wider mb-2">{t('pricingCard.courseFee')}</p>
          {isDiscountValid ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-foreground/40 line-through">৳{course.price}</div>
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">৳{course.discountPrice}</div>
            </div>
          ) : (
            <div className="text-5xl font-extrabold text-primary">
              ৳{course.price}
            </div>
          )}
        </div>
        
        <ul className="space-y-4 mb-8 relative z-10">
          <li className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground/60">{t('pricingCard.modules')}</span>
            <span>{course.modules?.length || 0}</span>
          </li>
          {course.department && (
            <li className="flex items-center justify-between text-sm font-semibold">
              <span className="text-foreground/60">{t('pricingCard.department')}</span>
              <span className="text-right">{course.department}</span>
            </li>
          )}
          {course.year && (
            <li className="flex items-center justify-between text-sm font-semibold">
              <span className="text-foreground/60">{t('pricingCard.year')}</span>
              <span className="text-right">{course.year}</span>
            </li>
          )}
          {course.eduClass && (
            <li className="flex items-center justify-between text-sm font-semibold">
              <span className="text-foreground/60">{t('pricingCard.class')}</span>
              <span className="text-right">
                {course.category === 'intermediate' ? 'একাদশ/দ্বাদশ' : `Class ${course.eduClass}`}
              </span>
            </li>
          )}
          {course.classStartDate && (
            <li className="flex items-center justify-between text-sm font-semibold">
              <span className="text-foreground/60">{t('pricingCard.startDate')}</span>
              <span className="text-right">{new Date(course.classStartDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </li>
          )}
          <li className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground/60">{t('pricingCard.validity')}</span>
            <span className="text-right">{course.courseValidity || t('lifetimeAccess')}</span>
          </li>
          <li className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground/60">{t('pricingCard.certificate')}</span>
            <span className="text-right">{t('pricingCard.yes')}</span>
          </li>
        </ul>

        <button 
          onClick={() => router.push(`/courses/${course.id}/checkout`)}
          className="w-full py-4 bg-primary text-primary-foreground text-xl font-bold rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 relative z-10"
        >
          {t('pricingCard.enrollBtn')}
        </button>
        
        <p className="text-center text-xs font-semibold text-foreground/40 mt-4">
          {t('pricingCard.securePayment')}
        </p>
      </div>
      

      {course.contactNumber && (
        <div className="bg-background border border-foreground/10 rounded-3xl p-6 shadow-sm text-center">
          <h2 className="text-xl font-bold mb-4">{t('pricingCard.moreQuestions')}</h2>
          <a href={`tel:${course.contactNumber}`} className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors border border-green-200 dark:border-green-500/20">
            <PhoneCall className="w-5 h-5" />
            {t('pricingCard.callUs')} {course.contactNumber}
          </a>
        </div>
      )}
    </div>
  );
}
