"use client";

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle, SlidersHorizontal, Calendar, X, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function EarningsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState('All Time');
  const [monthOptions, setMonthOptions] = useState<{label: string, value: string}[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

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
          growth: 0
        });
        
        // Filter transactions for display
        let filteredTx = allEnrollments;
        if (selectedMonth !== 'All Time') {
          filteredTx = allEnrollments.filter(e => {
            const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
            const mStr = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            return mStr === selectedMonth;
          });
        }

        const formattedTransactions = filteredTx.map(e => {
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
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Header Banner (0px border radius / rounded-none) */}
      <div className="relative rounded-none p-6 md:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border-b border-white/10 -mx-4 -mt-4 mb-6 z-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
              Financial Overview
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              Earnings Report
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
              Track your revenue and pending clearances from student enrollments.
            </p>
          </div>
          
          {/* Time Filter Icon Button & Dropdown Popover */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterModal(!showFilterModal)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${
                selectedMonth !== 'All Time'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>{selectedMonth}</span>
              <SlidersHorizontal className="w-4 h-4 ml-1 opacity-70" />
            </button>

            {/* Dropdown Popover directly under button */}
            {showFilterModal && (
              <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-32px)] p-3 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Select Range</span>
                  <button onClick={() => setShowFilterModal(false)} className="text-white/60 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {monthOptions.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setSelectedMonth(opt.value);
                        setShowFilterModal(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedMonth === opt.value 
                          ? 'bg-orange-500 text-white font-bold' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards - 2 Columns on Mobile (grid-cols-2), Content Centered */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-2xl">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Total Lifetime Earnings */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
          <div className="p-2.5 sm:p-3 bg-green-500/20 text-green-500 rounded-xl mb-2 sm:mb-3">
            <DollarSign className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium mb-0.5">Total Lifetime Earnings</p>
          <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">{formatCurrency(stats?.lifetimeTotal || 0)}</h3>
        </div>

        {/* Dynamic Period Earnings */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
           <div className="p-2.5 sm:p-3 bg-orange-500/20 text-orange-500 rounded-xl mb-2 sm:mb-3">
             <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7" />
           </div>
           <p className="text-foreground/60 text-xs sm:text-sm font-medium mb-0.5 truncate w-full">
             {selectedMonth === 'All Time' ? 'Earnings This Month' : `Earnings (${selectedMonth})`}
           </p>
           <h3 className="text-xl sm:text-3xl font-extrabold text-orange-500">{formatCurrency(stats?.selectedPeriodTotal || 0)}</h3>
        </div>

        {/* Pending Clearance */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-500/30 transition-colors col-span-2 lg:col-span-1">
           <div className="p-2.5 sm:p-3 bg-yellow-500/20 text-yellow-500 rounded-xl mb-2 sm:mb-3">
             <Clock className="w-5 h-5 sm:w-7 sm:h-7" />
           </div>
           <p className="text-foreground/60 text-xs sm:text-sm font-medium mb-0.5">Pending Clearance</p>
           <h3 className="text-xl sm:text-3xl font-extrabold text-foreground">{formatCurrency(stats?.pending || 0)}</h3>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-lg font-bold">Revenue Analytics {selectedMonth !== 'All Time' ? `(${selectedMonth})` : ''}</h2>
        </div>
        
        {/* Custom CSS Bar Chart */}
        <div className="h-56 sm:h-64 flex items-end gap-2 sm:gap-4 md:gap-8 pt-8 border-b border-foreground/10 relative">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 relative group h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg border border-white/10">
                {formatCurrency(data.value)}
              </div>
              
              {/* Bar */}
              <div className="w-full flex justify-center h-full items-end">
                <div 
                  className="w-full max-w-[36px] bg-orange-500/30 group-hover:bg-orange-500 rounded-t-lg transition-all duration-500 ease-out"
                  style={{ height: `${maxChartValue > 0 ? (data.value / maxChartValue) * 100 : 0}%` }}
                ></div>
              </div>
              
              {/* Label */}
              <span className="text-[11px] text-foreground/60 font-bold uppercase tracking-wider">{data.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Section */}
        <div className="lg:col-span-2 bg-foreground/5 border border-foreground/10 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-foreground/10">
            <h2 className="text-base sm:text-lg font-bold">Recent Transactions</h2>
            <span className="text-xs text-orange-500 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full">{transactions.length} Total</span>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-foreground/60 text-xs font-bold uppercase tracking-wider border-b border-foreground/10">
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Student / Course</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10 text-sm">
                {transactions.length > 0 ? transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-3.5 text-xs text-foreground/70 font-medium">{trx.date}</td>
                    <td className="py-3.5">
                      <p className="font-bold text-sm text-foreground">{trx.student}</p>
                      <p className="text-xs text-foreground/60">{trx.course.length > 25 ? trx.course.substring(0, 25) + '...' : trx.course}</p>
                    </td>
                    <td className="py-3.5 font-black text-sm text-orange-500">{formatCurrency(trx.amount)}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
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
                    <td colSpan={4} className="py-8 text-center text-foreground/50 text-xs">No recent transactions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List View (Shows All Rows & Columns Cleanly) */}
          <div className="block sm:hidden divide-y divide-foreground/10">
            {transactions.length > 0 ? transactions.map((trx) => (
              <div key={trx.id} className="py-3 flex flex-col gap-1.5 hover:bg-background/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-xs text-foreground">{trx.student}</p>
                    <p className="text-[11px] text-foreground/60">{trx.course}</p>
                  </div>
                  <span className="font-black text-sm text-orange-500 shrink-0">{formatCurrency(trx.amount)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-foreground/5 text-foreground/60">
                  <span className="font-medium">{trx.date}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full font-bold text-[10px] ${
                    trx.status === 'completed' || trx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    trx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    <span className="capitalize">{trx.status === 'approved' ? 'completed' : trx.status}</span>
                  </span>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-foreground/50 text-xs">No recent transactions.</div>
            )}
          </div>
        </div>

        {/* Top Selling Courses Widget */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-foreground/10">
            <Award className="w-5 h-5 text-orange-500" />
            <h2 className="text-base sm:text-lg font-bold">Top Selling Courses</h2>
          </div>
          
          <div className="space-y-3">
            {topCourses.length > 0 ? topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-foreground/5 hover:border-orange-500/20 transition-colors">
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs truncate text-foreground" title={course.title}>{course.title}</p>
                  <span className="inline-block text-[10px] font-semibold text-orange-500 bg-orange-500/10 px-2 py-0.2 rounded-full mt-0.5">
                    {course.sales} {course.sales === 1 ? 'sale' : 'sales'}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm text-orange-500 shrink-0">
                  {formatCurrency(course.earnings)}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-foreground/50 text-xs">No sales data available.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
