"use client";

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- MOCK DATA GENERATORS (Easy to replace with real API later) ---
const fetchMockEarningsStats = async (month: string) => {
  // Simulating different stats based on month selection
  const baseTotal = 12500;
  const multiplier = month === 'All Time' ? 1 : month === 'July 2026' ? 0.8 : 0.5;
  
  return new Promise(resolve => setTimeout(() => resolve({
    totalEarnings: baseTotal * multiplier,
    thisMonth: 1250 * (multiplier > 0.5 ? 1 : 0),
    pending: 450 * multiplier,
    growth: 12.5 // percentage
  }), 500));
};

const fetchMockTransactions = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 'TRX-101', student: 'Rahim Uddin', course: 'Web Development Basics', amount: 1500, status: 'completed', date: '2026-07-06' },
    { id: 'TRX-102', student: 'Jannatul Ferdous', course: 'Advanced Physics', amount: 2000, status: 'completed', date: '2026-07-05' },
    { id: 'TRX-103', student: 'Hasan Mahmud', course: 'Web Development Basics', amount: 1500, status: 'pending', date: '2026-07-05' },
    { id: 'TRX-104', student: 'Sumaiya Akter', course: 'Basic English Grammar', amount: 1000, status: 'completed', date: '2026-07-02' },
    { id: 'TRX-105', student: 'Karimul Islam', course: 'Advanced Physics', amount: 2000, status: 'refunded', date: '2026-06-30' },
  ]), 500));
};

const fetchMockChartData = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { label: 'Mon', value: 450 },
    { label: 'Tue', value: 800 },
    { label: 'Wed', value: 300 },
    { label: 'Thu', value: 1200 },
    { label: 'Fri', value: 950 },
    { label: 'Sat', value: 1500 },
    { label: 'Sun', value: 600 },
  ]), 500));
};

const fetchMockTopCourses = async () => {
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 'C1', title: 'Web Development Basics', earnings: 5500, sales: 120 },
    { id: 'C2', title: 'Advanced Physics', earnings: 4200, sales: 85 },
    { id: 'C3', title: 'Basic English Grammar', earnings: 2800, sales: 65 },
  ]), 500));
};

export default function EarningsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState('All Time');

  useEffect(() => {
    // Load all mock data on mount and when month changes
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, trxData, chartRes, topCoursesRes] = await Promise.all([
          fetchMockEarningsStats(selectedMonth),
          fetchMockTransactions(),
          fetchMockChartData(),
          fetchMockTopCourses()
        ]);
        
        setStats(statsData);
        setTransactions(trxData as any[]);
        setChartData(chartRes as any[]);
        setTopCourses(topCoursesRes as any[]);
      } catch (error) {
        console.error("Failed to load earnings data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedMonth]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  
  // Calculate max value for chart scaling
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-8 pb-10">
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
            <option value="All Time">All Time</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
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
        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" /> +{stats?.growth}%
              </span>
            </div>
            <p className="text-foreground/60 text-sm font-medium mb-1">Total Earnings</p>
            <h3 className="text-3xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</h3>
          </div>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl w-max mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-foreground/60 text-sm font-medium mb-1">This Month</p>
          <h3 className="text-3xl font-bold">{formatCurrency(stats?.thisMonth || 0)}</h3>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl w-max mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-foreground/60 text-sm font-medium mb-1">Pending Clearance</p>
          <h3 className="text-3xl font-bold">{formatCurrency(stats?.pending || 0)}</h3>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Revenue Analytics</h2>
        </div>
        
        {/* Custom CSS Bar Chart */}
        <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 mt-4 pt-10 border-b border-foreground/10 relative">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 bg-foreground text-background text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {formatCurrency(data.value)}
              </div>
              
              {/* Bar */}
              <div 
                className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                style={{ height: `${(data.value / maxChartValue) * 100}%`, minHeight: '4px' }}
              >
                {/* Highlight line on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-lg"></div>
              </div>
              
              {/* Label */}
              <span className="text-xs text-foreground/50 mt-3 absolute -bottom-8">{data.label}</span>
            </div>
          ))}
        </div>
        <div className="h-8"></div> {/* Spacer for labels */}
      </div>

      {/* Layout Grid for Tables and Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Transactions */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-foreground/5 border border-foreground/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <button className="text-primary text-sm font-medium hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-foreground/5 text-foreground/60 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Student / Course</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-foreground/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground/70 whitespace-nowrap">
                        {trx.date}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{trx.student}</p>
                        <p className="text-xs text-foreground/60">{trx.course}</p>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatCurrency(trx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          trx.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          trx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {trx.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {trx.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                          {trx.status === 'refunded' && <AlertCircle className="w-3.5 h-3.5" />}
                          {trx.status.charAt(0).toUpperCase() + trx.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Top Courses */}
        <div className="space-y-8">
          {/* Top Courses */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6">Top Selling Courses</h2>
            
            <div className="space-y-4">
              {topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate" title={course.title}>{course.title}</h4>
                    <p className="text-xs text-foreground/60">{course.sales} sales</p>
                  </div>
                  <div className="font-bold shrink-0">
                    {formatCurrency(course.earnings)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
