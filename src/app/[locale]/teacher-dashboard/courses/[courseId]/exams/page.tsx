"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { Plus, Trash2, Link as LinkIcon, Save, CheckSquare, Clock, Trophy, ChevronDown, ChevronUp, Users, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

export type Question = {
  id: string;
  text: string;
  imageUrl?: string;
  isMultipleStatement?: boolean;
  statements?: string[];
  options: string[];
  optionImages?: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
};

export type Exam = {
  id: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
  link?: string;
  questions?: Question[];
  isBuiltIn?: boolean;
  endTime?: string | null;
  allowLateSubmission?: boolean;
  strictTimeLimit?: boolean;
  isPublished?: boolean;
};

export default function CourseExamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  // New Exam Form State
  const [isAdding, setIsAdding] = useState(false);
  const [examType, setExamType] = useState<'builtin' | 'link'>('builtin');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState<number | ''>('');
  const [newLink, setNewLink] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newTotalMarks, setNewTotalMarks] = useState<number | ''>(''); 
  const [newEndTime, setNewEndTime] = useState<string>('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [strictTimeLimit, setStrictTimeLimit] = useState(true);
  const [isPublishedState, setIsPublishedState] = useState(true);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Expanded state for questions & Image uploads
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [uploadingImageQuestionId, setUploadingImageQuestionId] = useState<string | null>(null);
  const [uploadingOptionKey, setUploadingOptionKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().teacherId === user.uid) {
          const data = docSnap.data();
          setCourse(data);
          setExams(data.exams || []);
        } else {
          router.push('/teacher-dashboard/courses');
        }
      } catch (err) {
        console.error("Error fetching course", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchParticipants = async () => {
      if (!courseId) return;
      try {
        const q = query(collection(db, 'completed_exams'), where('courseId', '==', courseId));
        const querySnapshot = await getDocs(q);
        const counts: Record<string, number> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.examId) {
            counts[data.examId] = (counts[data.examId] || 0) + 1;
          }
        });
        setParticipantCounts(counts);
      } catch (err) {
        console.error("Error fetching exam participants", err);
      }
    };

    fetchCourse();
    fetchParticipants();
  }, [user, courseId, router]);

  const getPastedImageFile = (e: React.ClipboardEvent): File | null => {
    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) return file;
      }
    }
    if (e.clipboardData?.items && e.clipboardData.items.length > 0) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) return file;
        }
      }
    }
    return null;
  };

  const handleQuestionImageUpload = async (qId: string, file: File) => {
    try {
      setUploadingImageQuestionId(qId);
      const safeFile = file.name ? file : new File([file], `question_${Date.now()}.png`, { type: file.type || 'image/png' });
      const url = await uploadImageToImgBB(safeFile);
      handleUpdateQuestion(qId, 'imageUrl', url);
    } catch (err) {
      console.error('Error uploading question image:', err);
      alert('Failed to upload question image. Please try again.');
    } finally {
      setUploadingImageQuestionId(null);
    }
  };

  const handleOptionImageUpload = async (qId: string, optIdx: number, file: File) => {
    try {
      setUploadingOptionKey(`${qId}-${optIdx}`);
      const safeFile = file.name ? file : new File([file], `option_${optIdx}_${Date.now()}.png`, { type: file.type || 'image/png' });
      const url = await uploadImageToImgBB(safeFile);
      setQuestions(prev => prev.map(q => {
        if (q.id === qId) {
          const newOptionImages = [...(q.optionImages || ['', '', '', ''])];
          newOptionImages[optIdx] = url;
          return { ...q, optionImages: newOptionImages };
        }
        return q;
      }));
    } catch (err) {
      console.error('Error uploading option image:', err);
      alert('Failed to upload option image. Please try again.');
    } finally {
      setUploadingOptionKey(null);
    }
  };

  const handleAddQuestion = () => {
    const newId = Date.now().toString();
    setQuestions([...questions, {
      id: newId,
      text: '',
      imageUrl: '',
      isMultipleStatement: false,
      statements: ['', '', ''],
      options: ['', '', '', ''],
      optionImages: ['', '', '', ''],
      correctOptionIndex: 0,
      marks: 1,
      explanation: ''
    }]);
    setExpandedQuestion(newId);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleStartAdding = () => {
    resetForm();
    setIsAdding(true);
  };

  const resetForm = () => {
    setEditingExamId(null);
    setExamType('builtin');
    setNewTitle('');
    setNewDuration('');
    setNewLink('');
    setQuestions([]);
    setNewTotalMarks('');
    setNewEndTime('');
    setAllowLateSubmission(false);
    setStrictTimeLimit(true);
    setIsPublishedState(true);
    setError('');
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please provide an exam title.');
      return;
    }
    if (!newDuration || Number(newDuration) <= 0) {
      setError('Please provide a valid duration in minutes.');
      return;
    }

    let cleanedQuestions: Question[] = [];

    if (examType === 'builtin') {
      if (questions.length === 0) {
        setError('Please add at least one question.');
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim() && !q.imageUrl) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1} is missing question text or image.`);
          return;
        }

        if (q.isMultipleStatement) {
          const validStatements = (q.statements || []).filter(s => s.trim() !== '');
          if (validStatements.length < 2) {
            setExpandedQuestion(q.id);
            setError(`Question ${i + 1}: Multiple statement questions must have at least 2 valid statements.`);
            return;
          }
        }

        const filledOptions = q.options.filter((opt, oIdx) => opt.trim() !== '' || (q.optionImages && q.optionImages[oIdx]));
        if (filledOptions.length < 2) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1} must have at least 2 options filled.`);
          return;
        }

        if (!q.options[q.correctOptionIndex]?.trim() && (!q.optionImages || !q.optionImages[q.correctOptionIndex])) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1}: The correct answer option cannot be empty.`);
          return;
        }

        cleanedQuestions.push({
          id: q.id,
          text: q.text.trim(),
          imageUrl: q.imageUrl || '',
          isMultipleStatement: q.isMultipleStatement || false,
          statements: q.isMultipleStatement ? q.statements : [],
          options: q.options.map(opt => opt.trim()),
          optionImages: q.optionImages || [],
          correctOptionIndex: q.correctOptionIndex,
          marks: Number(q.marks) || 1,
          explanation: q.explanation?.trim() || ''
        });
      }
    } else {
      if (!newLink.trim()) {
        setError('Please provide a valid external exam link.');
        return;
      }
      if (!newTotalMarks || Number(newTotalMarks) <= 0) {
        setError('Please provide valid total marks for the exam.');
        return;
      }
    }

    setIsSaving(true);
    setError('');

    try {
      const finalTotalMarks = examType === 'builtin' 
        ? cleanedQuestions.reduce((sum, q) => sum + Number(q.marks), 0)
        : Number(newTotalMarks);

      const examData: Exam = {
        id: editingExamId || Date.now().toString(),
        title: newTitle.trim(),
        totalMarks: finalTotalMarks,
        durationMinutes: Number(newDuration),
        isBuiltIn: examType === 'builtin',
        endTime: newEndTime ? newEndTime : null,
        allowLateSubmission,
        strictTimeLimit,
        isPublished: isPublishedState,
        ...(examType === 'builtin' ? { questions: cleanedQuestions } : { link: newLink.trim() })
      };

      let updatedExams: Exam[];
      if (editingExamId) {
        updatedExams = exams.map(e => e.id === editingExamId ? examData : e);
      } else {
        updatedExams = [...exams, examData];
      }

      const docRef = doc(db, 'courses', courseId);
      await updateDoc(docRef, {
        exams: updatedExams
      });

      setExams(updatedExams);
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error("Error saving exam", err);
      setError('Failed to save exam. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setNewTitle(exam.title);
    setNewDuration(exam.durationMinutes);
    setExamType(exam.isBuiltIn || exam.questions ? 'builtin' : 'link');
    setNewLink(exam.link || '');
    setNewTotalMarks(exam.totalMarks || '');
    setQuestions(exam.questions || []);
    setNewEndTime(exam.endTime || '');
    setAllowLateSubmission(!!exam.allowLateSubmission);
    setStrictTimeLimit(exam.strictTimeLimit !== undefined ? exam.strictTimeLimit : true);
    setIsPublishedState(exam.isPublished !== undefined ? exam.isPublished : true);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      const updatedExams = exams.filter(e => e.id !== id);
      const docRef = doc(db, 'courses', courseId);
      await updateDoc(docRef, { exams: updatedExams });
      setExams(updatedExams);
    } catch (err) {
      console.error("Error deleting exam", err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64 text-foreground/50 font-bold">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative rounded-none overflow-hidden bg-gradient-to-r from-orange-500/20 via-rose-500/10 to-purple-600/20 border-y border-foreground/10 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-xs rounded-full uppercase tracking-wider mb-3 inline-block">
              TEACHER DASHBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Exams & Quizzes
            </h1>
            <p className="text-foreground/70 max-w-xl text-sm leading-relaxed">
              Create built-in quizzes or add external links for your students.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-bold text-foreground/70">
              <span className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-foreground/10 shadow-sm">
                <CheckSquare className="w-4 h-4 text-orange-500" />
                Total Exams: <strong className="text-foreground">{exams.length} {course?.totalExams ? `/ ${course.totalExams}` : ''}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-foreground/10 shadow-sm">
                <Trophy className="w-4 h-4 text-green-500" />
                Built-in Quizzes: <strong className="text-foreground">{exams.filter(e => e.isBuiltIn || e.questions).length}</strong>
              </span>
            </div>
          </div>
          {!isAdding && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleStartAdding} 
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> Add Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExam} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-2 pb-4 border-b border-foreground/10">
            <h2 className="text-xl font-bold">{editingExamId ? 'Edit Exam' : 'Add New Exam'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="text-sm text-foreground/50 hover:text-foreground font-bold">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          <div className="flex bg-foreground/5 p-1 rounded-xl w-fit">
            <button type="button" onClick={() => setExamType('builtin')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'builtin' ? 'bg-background shadow-sm text-primary' : 'text-foreground/60 hover:text-foreground'}`}>Built-in Quiz</button>
            <button type="button" onClick={() => setExamType('link')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'link' ? 'bg-background shadow-sm text-primary' : 'text-foreground/60 hover:text-foreground'}`}>External Link</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Exam Title <span className="text-red-500">*</span></label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1 Final Exam" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (Minutes) <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={newDuration} onChange={e => setNewDuration(Number(e.target.value) || '')} placeholder="e.g. 45" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time (Deadline) <span className="text-foreground/50 text-xs font-normal">(Optional)</span></label>
              <input type="datetime-local" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-foreground/5 p-3 rounded-xl hover:bg-foreground/10 transition-colors w-fit">
                <input 
                  type="checkbox" 
                  checked={allowLateSubmission} 
                  onChange={e => setAllowLateSubmission(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Allow students to take the exam after the deadline</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-foreground/5 p-3 rounded-xl hover:bg-foreground/10 transition-colors w-fit">
                <input 
                  type="checkbox" 
                  checked={strictTimeLimit} 
                  onChange={e => setStrictTimeLimit(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Strict Time Limit: Prevent option selection when time is up</span>
              </label>
            </div>
            {examType === 'link' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">External Quiz Link (Google Form, Kahoot, etc.) <span className="text-red-500">*</span></label>
                  <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://forms.google.com/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Marks <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={newTotalMarks} onChange={e => setNewTotalMarks(Number(e.target.value) || '')} placeholder="e.g. 50" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
                </div>
              </>
            )}
          </div>

          {examType === 'builtin' && (
            <div className="pt-4 border-t border-foreground/10 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Questions</h3>
                  <p className="text-sm text-foreground/50">Total Marks: {questions.reduce((sum, q) => sum + Number(q.marks), 0)}</p>
                </div>
                <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-foreground/40 text-sm">No questions added yet.</div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      className="border border-foreground/10 rounded-xl overflow-hidden bg-background"
                    >
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-foreground/5 transition-colors"
                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <span className="font-medium truncate max-w-[200px] sm:max-w-md flex items-center gap-2">
                            {q.text || 'New Question'}
                            {q.imageUrl && <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded font-bold">📷 Image</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground/50">{q.marks} Marks</span>
                          {expandedQuestion === q.id ? <ChevronUp className="w-5 h-5 text-foreground/40" /> : <ChevronDown className="w-5 h-5 text-foreground/40" />}
                        </div>
                      </div>

                      {expandedQuestion === q.id && (
                        <div className="p-4 border-t border-foreground/10 bg-foreground/[0.02] space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                              <label className="block text-sm font-medium">Question Text</label>
                              <div className="flex items-center gap-2">
                                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-lg border border-orange-500/20 transition-colors" title="ছবি ফাইলে ব্রাউজ করুন অথবা সরাসরি Ctrl+V প্রেস করে পেস্ট করুন">
                                  {uploadingImageQuestionId === q.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  )}
                                  <span>{q.imageUrl ? 'ছবি পরিবর্তন (বা Ctrl+V)' : '📷 প্রশ্নের ছবি / Ctrl+V পেস্ট'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleQuestionImageUpload(q.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                                {q.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuestion(q.id, 'imageUrl', '')}
                                    className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg"
                                  >
                                    <Trash2 className="w-3 h-3" /> রিমুভ
                                  </button>
                                )}
                                <label className="flex items-center gap-2 cursor-pointer bg-primary/5 px-3 py-1 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={q.isMultipleStatement || false}
                                    onChange={(e) => handleUpdateQuestion(q.id, 'isMultipleStatement', e.target.checked)}
                                    className="w-3.5 h-3.5 text-primary rounded border-gray-300 focus:ring-primary"
                                  />
                                  <span className="text-xs font-bold text-primary">Multiple Statement MCQ</span>
                                </label>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              value={q.text} 
                              onChange={e => handleUpdateQuestion(q.id, 'text', e.target.value)} 
                              onPaste={(e) => {
                                const file = getPastedImageFile(e);
                                if (file) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleQuestionImageUpload(q.id, file);
                                }
                              }}
                              placeholder="Type your question here... (বা স্ক্রিনশট নিয়া সরাসরি Ctrl+V প্রেস করে পেস্ট করুন)" 
                              className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-primary focus:outline-none" 
                            />
                            {q.imageUrl && (
                              <div className="mt-3 relative w-fit group">
                                <img src={q.imageUrl} alt="Question" className="max-h-48 rounded-xl border border-foreground/10 object-contain bg-background shadow-sm" />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name={`correct-${q.id}`} 
                                    checked={q.correctOptionIndex === optIdx} 
                                    onChange={() => handleUpdateQuestion(q.id, 'correctOptionIndex', optIdx)}
                                    className="w-4 h-4 text-primary cursor-pointer shrink-0"
                                  />
                                  <input 
                                    type="text" 
                                    value={opt} 
                                    onChange={e => handleUpdateOption(q.id, optIdx, e.target.value)} 
                                    onPaste={(e) => {
                                      const file = getPastedImageFile(e);
                                      if (file) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOptionImageUpload(q.id, optIdx, file);
                                      }
                                    }}
                                    placeholder={`Option ${optIdx + 1} (বা Ctrl+V পেস্ট করুন)`} 
                                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none transition-colors ${q.correctOptionIndex === optIdx ? 'border-green-500' : 'border-foreground/10 focus:border-primary'}`} 
                                  />
                                  <label className="cursor-pointer shrink-0 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg border border-foreground/10 text-foreground/60 transition-colors" title="Add Option Image (বা সরাসরি Ctrl+V পেস্ট করুন)">
                                    {uploadingOptionKey === `${q.id}-${optIdx}` ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4" />
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleOptionImageUpload(q.id, optIdx, e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                {q.optionImages?.[optIdx] && (
                                  <div className="ml-6 flex items-center gap-2">
                                    <img src={q.optionImages[optIdx]} alt={`Option ${optIdx + 1}`} className="max-h-24 rounded-lg border border-foreground/10 object-contain bg-background" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptImgs = [...(q.optionImages || [])];
                                        newOptImgs[optIdx] = '';
                                        handleUpdateQuestion(q.id, 'optionImages', newOptImgs);
                                      }}
                                      className="text-red-500 text-xs hover:underline font-bold"
                                    >
                                      রিমুভ
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="pt-2">
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Answer Explanation</label>
                            <textarea value={q.explanation || ''} onChange={e => handleUpdateQuestion(q.id, 'explanation', e.target.value)} className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-primary focus:outline-none min-h-[80px]" />
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">Marks:</label>
                              <input type="number" min="1" value={q.marks} onChange={e => handleUpdateQuestion(q.id, 'marks', Number(e.target.value) || 0)} className="w-20 px-2 py-1 bg-background border border-foreground/10 rounded-lg focus:outline-none" />
                            </div>
                            <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-foreground/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublishedState} onChange={e => setIsPublishedState(e.target.checked)} className="w-5 h-5 text-green-500 rounded focus:ring-green-500" />
              <span className="font-bold text-sm">Publish immediately</span>
            </label>
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg">
              {isSaving ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </form>
      )}

      <div className="w-[96%] mx-auto space-y-4">
        {exams.length === 0 && !isAdding ? (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-[4px] bg-background/50">
            <CheckSquare className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No exams added yet.</p>
          </div>
        ) : (
          exams.map((exam, index) => (
            <div key={exam.id} className="bg-background border border-foreground/10 p-5 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex-1 flex gap-4">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{exam.title}</h3>
                    {exam.isPublished === false && <span className="px-2.5 py-0.5 bg-gray-500/10 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">Draft</span>}
                    {exam.isBuiltIn || exam.questions ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full uppercase tracking-wider">Built-in Quiz</span>
                        <Link href={`/teacher-dashboard/courses/${courseId}/exams/${exam.id}/leaderboard`} className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-bold rounded-full uppercase tracking-wider transition-colors cursor-pointer">
                          <Users className="w-3.5 h-3.5" />
                          <span>{participantCounts[exam.id] || 0} Participants</span>
                        </Link>
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-full uppercase tracking-wider">External Link</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-foreground/70 font-medium">
                    <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-orange-500" /> {exam.totalMarks} Marks</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-500" /> {exam.durationMinutes} Minutes</span>
                    {exam.endTime && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-500" /> Deadline: {new Date(exam.endTime).toLocaleString()}</span>}
                    {(!exam.isBuiltIn && !exam.questions) && <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-orange-500" /> <a href={exam.link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 underline underline-offset-2">External Link</a></span>}
                    {(exam.isBuiltIn || exam.questions) && <span className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-orange-500" /> {exam.questions?.length || 0} Questions</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEditExam(exam)} className="px-4 py-2 text-sm font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-colors">Edit</button>
                <button onClick={() => handleDelete(exam.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
