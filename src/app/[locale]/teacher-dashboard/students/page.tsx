"use client";

import { useState } from 'react';
import { Search, Filter, Mail, Eye, Users, UserCheck, UserPlus } from 'lucide-react';
import Image from 'next/image';

// Mock data for students
const MOCK_STUDENTS = [
  {
    id: 1,
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    avatar: 'https://i.pravatar.cc/150?img=11',
    course: 'Web Development Basics',
    enrollDate: '12 May, 2026',
    progress: 75,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jannatul Ferdous',
    email: 'jannatul@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    course: 'Advanced Physics',
    enrollDate: '01 Jun, 2026',
    progress: 40,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Hasan Mahmud',
    email: 'hasan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    course: 'Web Development Basics',
    enrollDate: '15 Jun, 2026',
    progress: 100,
    status: 'Completed'
  },
  {
    id: 4,
    name: 'Sumaiya Akter',
    email: 'sumaiya@example.com',
    avatar: 'https://i.pravatar.cc/150?img=9',
    course: 'Basic English Grammar',
    enrollDate: '05 Jul, 2026',
    progress: 10,
    status: 'Active'
  },
  {
    id: 5,
    name: 'Karimul Islam',
    email: 'karimul@example.com',
    avatar: 'https://i.pravatar.cc/150?img=13',
    course: 'Advanced Physics',
    enrollDate: '02 Jul, 2026',
    progress: 25,
    status: 'Active'
  }
];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  // Filter logic
  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'All' || student.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Students</h1>
        <p className="text-foreground/60">Manage and track your enrolled students' progress.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Total Students</p>
            <h3 className="text-2xl font-bold">1,245</h3>
          </div>
        </div>
        
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Active Students</p>
            <h3 className="text-2xl font-bold">890</h3>
          </div>
        </div>

        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">New This Month</p>
            <h3 className="text-2xl font-bold">124</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-foreground/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-background/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-foreground/20 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <select 
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full sm:w-48 bg-background border border-foreground/20 rounded-xl py-2.5 pl-9 pr-4 appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="All">All Courses</option>
                <option value="Web Development Basics">Web Dev Basics</option>
                <option value="Advanced Physics">Advanced Physics</option>
                <option value="Basic English Grammar">Basic English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-foreground/60 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course Enrolled</th>
                <th className="px-6 py-4 font-medium">Enroll Date</th>
                <th className="px-6 py-4 font-medium text-center">Progress</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover border border-foreground/10"
                        />
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs text-foreground/60">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-foreground/10 rounded-full text-sm font-medium">
                        {student.course}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/70">
                      {student.enrollDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{student.progress}%</span>
                        <div className="w-24 h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.progress === 100 ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors tooltip-trigger" title="Message Student">
                          <Mail className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors tooltip-trigger" title="View Profile">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-foreground/10 flex items-center justify-between text-sm text-foreground/60 bg-background/50">
          <p>Showing {filteredStudents.length} of {MOCK_STUDENTS.length} students</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded bg-primary text-white">1</button>
            <button className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20">2</button>
            <button className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
