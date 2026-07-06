"use client";

import { useAuth } from '@/context/AuthContext';
import { Users, Video, DollarSign, Star, PlusCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function TeacherDashboard() {
  const { user, userData } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Courses', value: '12', icon: Video, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Total Earnings', value: '$4,560', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Average Rating', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-foreground/5 p-8 rounded-3xl border border-foreground/10 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || userData?.name}! 👋</h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Here&apos;s what&apos;s happening with your courses today. You have <span className="font-semibold text-foreground">3</span> new student enrollments since your last login.
          </p>
        </div>
        
        <Link 
          href="/teacher-dashboard/courses/create" 
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Course
        </Link>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-foreground/5 p-6 rounded-3xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-foreground/60 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-foreground/5 rounded-3xl border border-foreground/10 overflow-hidden">
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Student Enrollments</h2>
          <button className="text-sm text-primary hover:underline font-medium">View All</button>
        </div>
        <div className="divide-y divide-foreground/5">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-6 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-lg font-bold">
                S{i+1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Student Name</h4>
                <p className="text-sm text-foreground/50">Enrolled in &quot;Quantum Mechanics Fundamentals&quot;</p>
              </div>
              <div className="text-sm text-foreground/40 font-medium">
                {i + 1}h ago
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
