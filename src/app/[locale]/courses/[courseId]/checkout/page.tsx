"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { user, userData } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    paymentMethod: 'bkash',
    senderNumber: '',
    trxId: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Course not found!");
        }
      } catch (err) {
        console.error("Error fetching course", err);
        setError("Failed to load course details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to enroll.");
      return;
    }
    if (!formData.senderNumber) {
      setError("Sender mobile number is required.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'enrollments'), {
        courseId: courseId,
        courseTitle: course?.title || 'Unknown Course',
        teacherId: course?.teacherId || '',
        studentId: user.uid,
        studentName: user.displayName || userData?.name || 'Student',
        studentEmail: user.email,
        senderNumber: formData.senderNumber,
        trxId: formData.trxId,
        paymentMethod: formData.paymentMethod,
        amount: course?.price || 0,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting enrollment", err);
      setError("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-background border border-foreground/10 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold mb-3 relative z-10 text-primary">অভিনন্দন!</h2>
          <p className="text-foreground/80 mb-8 relative z-10 leading-relaxed">
            আপনার রিকোয়েস্টটি সফলভাবে সাবমিট হয়েছে। শিক্ষক পেমেন্ট চেক করে অ্যাপ্রুভ করা পর্যন্ত অনুগ্রহ করে অপেক্ষা করুন।
          </p>
          
          <div className="space-y-3 relative z-10">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              ড্যাশবোর্ডে যান
            </button>
            <button 
              onClick={() => router.push('/courses')}
              className="w-full py-3.5 bg-foreground/5 text-foreground font-semibold rounded-xl hover:bg-foreground/10 transition-colors"
            >
              আরও কোর্স দেখুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 pb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">পেমেন্ট এবং চেকআউট</h1>
        <p className="text-foreground/60">কোর্সে যুক্ত হতে নিচের নির্দেশাবলী অনুসরণ করে পেমেন্ট সম্পন্ন করুন।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
        
        {/* Left Column: Payment Instructions & Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Instructions */}
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-green-500" /> পেমেন্ট নির্দেশাবলী
            </h2>
            
            <div className="space-y-4 text-foreground/80 font-medium">
              <p>১. আপনার বিকাশ, নগদ বা রকেট অ্যাপ ওপেন করুন।</p>
              <p>২. <strong className="text-foreground">Send Money</strong> অপশনটি সিলেক্ট করুন।</p>
              <p>৩. নিচের যেকোনো একটি নাম্বারে ঠিক <strong className="text-xl text-primary bg-primary/10 px-2 py-0.5 rounded">৳{course?.price || 0}</strong> সেন্ড মানি করুন:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-pink-500/10 border border-pink-500/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
                  <span className="font-bold text-pink-500 uppercase tracking-wider text-xs">bKash (Personal)</span>
                  <span className="text-2xl font-black text-foreground">017XX-XXXXXX</span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm">
                  <span className="font-bold text-orange-500 uppercase tracking-wider text-xs">Nagad (Personal)</span>
                  <span className="text-2xl font-black text-foreground">018XX-XXXXXX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6">পেমেন্ট ভেরিফিকেশন ফর্ম</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80">পেমেন্ট মেথড <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  {['bkash', 'nagad', 'rocket'].map(method => (
                    <label key={method} className={`flex-1 border rounded-xl p-3 text-center cursor-pointer transition-colors ${formData.paymentMethod === method ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-foreground/20 hover:border-foreground/40 font-semibold text-foreground/70'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method} 
                        className="hidden"
                        checked={formData.paymentMethod === method}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      />
                      <span className="capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80">যে নাম্বার থেকে টাকা পাঠিয়েছেন <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. 017XXXXXXXX" 
                  value={formData.senderNumber}
                  onChange={(e) => setFormData({...formData, senderNumber: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-semibold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80">Transaction ID (TrxID) <span className="text-foreground/50 text-xs font-normal">(ঐচ্ছিক কিন্তু দিলে ভালো)</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. 9J5A6B8CD" 
                  value={formData.trxId}
                  onChange={(e) => setFormData({...formData, trxId: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold tracking-wider"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> সাবমিট হচ্ছে...</>
                ) : (
                  <>পেমেন্ট সাবমিট করুন <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 border-b border-foreground/10 pb-4">অর্ডার সামারি</h2>
            
            <div className="mb-6">
              {course?.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-36 object-cover rounded-xl mb-4 border border-foreground/10 shadow-sm" />
              ) : (
                <div className="w-full h-36 bg-background rounded-xl mb-4 flex items-center justify-center border border-foreground/10">Loading...</div>
              )}
              <h3 className="font-bold text-lg line-clamp-2 leading-tight">{course?.title || 'Loading...'}</h3>
              <p className="text-sm font-semibold text-primary mt-1 uppercase tracking-wide">{course?.category === 'intermediate' ? 'HSC' : course?.category}</p>
            </div>

            <div className="space-y-3 border-t border-foreground/10 pt-4 mb-6">
              <div className="flex justify-between text-foreground/80 font-medium">
                <span>কোর্স ফি</span>
                <span>৳{course?.price || 0}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xl pt-2 border-t border-foreground/10">
                <span>সর্বমোট</span>
                <span className="text-primary">৳{course?.price || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-xl text-sm font-semibold flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>আপনার পেমেন্টটি শিক্ষকের দ্বারা ম্যানুয়ালি ভেরিফাই করা হবে। এটি সাধারণত ৫-১০ মিনিট সময় নেয়।</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
