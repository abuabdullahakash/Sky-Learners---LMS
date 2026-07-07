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
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Request Submitted Successfully!</h1>
        <p className="text-foreground/70 text-lg mb-8">
          Thank you for your payment. The instructor will verify your transaction shortly. 
          Once approved, you will get full access to <strong>{course?.title}</strong>.
        </p>
        <button 
          onClick={() => router.push('/dashboard')} // Assuming a student dashboard exists
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Secure Checkout</h1>
        <p className="text-foreground/60">Complete your manual payment to enroll.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
        
        {/* Left Column: Payment Instructions & Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Instructions */}
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-green-500" /> Payment Instructions
            </h2>
            
            <div className="space-y-4 text-foreground/80">
              <p>1. Open your bKash, Nagad, or Rocket app.</p>
              <p>2. Use the <strong>Send Money</strong> or <strong>Make Payment</strong> option.</p>
              <p>3. Send exactly <strong className="text-xl text-primary">৳{course?.price || 0}</strong> to one of the following numbers:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <span className="font-bold text-pink-500">bKash (Personal)</span>
                  <span className="text-2xl font-black">017XX-XXXXXX</span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <span className="font-bold text-orange-500">Nagad (Personal)</span>
                  <span className="text-2xl font-black">018XX-XXXXXX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6">Verify Payment</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Payment Method Used <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  {['bkash', 'nagad', 'rocket'].map(method => (
                    <label key={method} className={`flex-1 border rounded-xl p-3 text-center cursor-pointer transition-colors ${formData.paymentMethod === method ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-foreground/20 hover:border-foreground/40'}`}>
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
                <label className="text-sm font-semibold text-foreground/80">Your Mobile Number (Sender Number) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. 017XXXXXXXX" 
                  value={formData.senderNumber}
                  onChange={(e) => setFormData({...formData, senderNumber: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Transaction ID (TrxID) <span className="text-foreground/50 text-xs font-normal">(Optional but recommended)</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. 9J5A6B8CD" 
                  value={formData.trxId}
                  onChange={(e) => setFormData({...formData, trxId: e.target.value})}
                  className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                ) : (
                  <>Submit for Verification <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 border-b border-foreground/10 pb-4">Order Summary</h2>
            
            <div className="mb-6">
              {course?.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-32 object-cover rounded-xl mb-4" />
              )}
              <h3 className="font-semibold text-lg line-clamp-2">{course?.title || 'Loading...'}</h3>
              <p className="text-sm text-foreground/60 mt-1 capitalize">{course?.category}</p>
            </div>

            <div className="space-y-3 border-t border-foreground/10 pt-4 mb-6">
              <div className="flex justify-between text-foreground/80">
                <span>Original Price</span>
                <span>৳{course?.price || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-foreground/10">
                <span>Total to Pay</span>
                <span className="text-primary">৳{course?.price || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 text-yellow-600 rounded-xl text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Your enrollment will be manually verified by the instructor. It usually takes 5-10 minutes.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
