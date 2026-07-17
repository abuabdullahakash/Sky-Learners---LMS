"use client";

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function EarningsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState('All Time');
  const [monthOptions, setMonthOptions] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    // Generate last 6 months options dynamically
    const generateMonthOptions = () => {
      const options = [{ label: 'All Time', value: 'All Time' }];
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        options.push({ label, value: label });
      }
      return options;
    };
    setMonthOptions(generateMonthOptions());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('teacherId', '==', user.uid)
        );
        const snapshot = await getDocs(enrollmentsQuery);
        
        const allEnrollments: any[] = [];
        snapshot.forEach(doc => {
          allEnrollments.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by createdAt descending
        allEnrollments.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
          return (dateB || 0) - (dateA || 0);
        });

        let lifetimeTotal = 0;
        let selectedPeriodTotal = 0;
        let pending = 0;
        
        const courseSales: Record<string, { title: string, earnings: number, sales: number }> = {};
        const dailyEarnings: Record<string, number> = {};

        allEnrollments.forEach(enrollment => {
          const amount = Number(enrollment.amount) || 0;
          const status = enrollment.status || 'pending';
          const createdAtDate = enrollment.createdAt ? 
             (enrollment.createdAt.toDate ? enrollment.createdAt.toDate() : new Date(enrollment.createdAt)) 
             : new Date();
             
          const monthYearStr = createdAtDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          const dayStr = createdAtDate.toLocaleDateString('en-US', { weekday: 'short' });
          
          if (status === 'pending') {
            pending += amount;
          } else if (status === 'approved' || status === 'completed') {
            lifetimeTotal += amount;
            
            if (selectedMonth === 'All Time' || selectedMonth === monthYearStr) {
               selectedPeriodTotal += amount;
               
               dailyEarnings[dayStr] = (dailyEarnings[dayStr] || 0) + amount;
               
               const cid = enrollment.courseId;
               if (cid) {
                 if (!courseSales[cid]) {
                    courseSales[cid] = { title: enrollment.courseTitle || 'Unknown Course', earnings: 0, sales: 0 };
                 }
                 courseSales[cid].earnings += amount;
                 courseSales[cid].sales += 1;
               }
            }
          }
        });
        
        const computedTopCourses = Object.entries(courseSales)
           .map(([id, data]) => ({ id, ...data }))
           .sort((a, b) => b.earnings - a.earnings)
           .slice(0, 3);
           
        const computedChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
           label: day,
           value: dailyEarnings[day] || 0
        }));

        setStats({
          lifetimeTotal,
          selectedPeriodTotal,
          pending,
          growth: 0 // Optional: implement actual growth logic compared to previous month
        });
        
        // Filter transactions for display (latest 5)
        let filteredTx = allEnrollments;
        if (selectedMonth !== 'All Time') {
          filteredTx = allEnrollments.filter(e => {
            const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
            const mStr = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            return mStr === selectedMonth;
          });
        }

        const formattedTransactions = filteredTx.slice(0, 5).map(e => {
          const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
          return {
            id: e.id,
            student: e.studentName || 'Unknown',
            course: e.courseTitle || 'Unknown Course',
            amount: Number(e.amount) || 0,
            status: e.status || 'pending',
            date: date.toLocaleDateString('en-CA') // YYYY-MM-DD
          };
        });

        setTransactions(formattedTransactions);
        setChartData(computedChartData);
        setTopCourses(computedTopCourses);
        
      } catch (error) {
        console.error("Failed to load earnings data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedMonth, user]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Earnings Report</h1>
          <p className="text-foreground/60">Track your revenue and pending clearances from student enrollments.</p>
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-48 bg-foreground/5 border border-foreground/10 rounded-xl py-2.5 pl-9 pr-4 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            {monthOptions.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-3xl">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Total Lifetime Earnings (Always Static) */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-foreground/60 text-sm font-medium mb-1">Total Lifetime Earnings</p>
            <h3 className="text-3xl font-bold">{formatCurrency(stats?.lifetimeTotal || 0)}</h3>
          </div>
        </div>

        {/* Dynamic Period Earnings */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                 <TrendingUp className="w-6 h-6" />
               </div>
             </div>
             <p className="text-foreground/60 text-sm font-medium mb-1">
               {selectedMonth === 'All Time' ? 'Earnings This Month' : `Earnings in ${selectedMonth}`}
             </p>
             <h3 className="text-3xl font-bold text-blue-500">{formatCurrency(stats?.selectedPeriodTotal || 0)}</h3>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-colors"></div>
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl">
                   <Clock className="w-6 h-6" />
                 </div>
              </div>
              <p className="text-foreground/60 text-sm font-medium mb-1">Pending Clearance</p>
              <h3 className="text-3xl font-bold">{formatCurrency(stats?.pending || 0)}</h3>
           </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Revenue Analytics {selectedMonth !== 'All Time' ? `(${selectedMonth})` : ''}</h2>
        </div>
        
        {/* Custom CSS Bar Chart */}
        <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 mt-4 pt-10 border-b border-foreground/10 relative">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-3 relative group h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                {formatCurrency(data.value)}
              </div>
              
              {/* Bar */}
              <div className="w-full flex justify-center h-full items-end">
                <div 
                  className="w-full max-w-[40px] bg-foreground/20 group-hover:bg-primary rounded-t-sm transition-all duration-500 ease-out"
                  style={{ height: `${maxChartValue > 0 ? (data.value / maxChartValue) * 100 : 0}%` }}
                ></div>
              </div>
              
              {/* Label */}
              <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider">{data.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            {/* <button className="text-sm font-medium text-primary hover:underline">View All</button> */}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-foreground/50 text-xs uppercase tracking-wider border-b border-foreground/10">
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Student / Course</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {transactions.length > 0 ? transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-4 text-sm text-foreground/70">{trx.date}</td>
                    <td className="py-4">
                      <p className="font-semibold text-sm">{trx.student}</p>
                      <p className="text-xs text-foreground/50">{trx.course.length > 25 ? trx.course.substring(0, 25) + '...' : trx.course}</p>
                    </td>
                    <td className="py-4 font-bold text-sm">{formatCurrency(trx.amount)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          trx.status === 'completed' || trx.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          trx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {trx.status === 'completed' || trx.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span className="capitalize">{trx.status === 'approved' ? 'completed' : trx.status}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-foreground/50 text-sm">No recent transactions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Courses */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">Top Selling Courses</h2>
          
          <div className="space-y-4">
            {topCourses.length > 0 ? topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-background/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" title={course.title}>{course.title}</p>
                  <p className="text-xs text-foreground/50">{course.sales} sales</p>
                </div>
                <div className="font-bold text-sm shrink-0">
                  {formatCurrency(course.earnings)}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-foreground/50 text-sm">No sales data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
