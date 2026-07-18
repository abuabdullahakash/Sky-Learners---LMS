"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Link as LinkIcon, Save, CheckSquare, Clock, Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

export type Question = {
  id: string;
  text: string;
  isMultipleStatement?: boolean;
  statements?: string[];
  options: string[];
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
  const [newTotalMarks, setNewTotalMarks] = useState<number | ''>(''); // Only used for link type
  const [newEndTime, setNewEndTime] = useState<string>('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [strictTimeLimit, setStrictTimeLimit] = useState(true);
  const [isPublishedState, setIsPublishedState] = useState(true);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Expanded state for questions
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

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
        console.error("Error fetching participants", err);
      }
    };

    fetchCourse();
    fetchParticipants();
  }, [user, courseId, router]);

  const handleAddQuestion = () => {
    const newId = Date.now().toString();
    setQuestions([...questions, {
      id: newId,
      text: '',
      options: ['', '', '', ''],
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

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDuration) {
      setError('Title and duration are required.');
      return;
    }

    if (examType === 'link' && !newLink) {
      setError('Exam link is required.');
      return;
    }

    let cleanedQuestions: Question[] = [];
    if (examType === 'builtin') {
      if (questions.length === 0) {
        setError('Please add at least one question.');
        return;
      }
      // Validate and clean questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1} is missing the question text.`);
          return;
        }
        
        const filledOptions: string[] = [];
        let newCorrectIndex = -1;
        
        for (let j = 0; j < q.options.length; j++) {
          if (q.options[j].trim() !== '') {
            filledOptions.push(q.options[j]);
            if (q.correctOptionIndex === j) {
              newCorrectIndex = filledOptions.length - 1;
            }
          }
        }

        if (filledOptions.length < 2) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1} must have at least 2 options filled.`);
          return;
        }

        if (newCorrectIndex === -1) {
          setExpandedQuestion(q.id);
          setError(`Question ${i + 1}: The correct answer cannot be an empty option.`);
          return;
        }

        cleanedQuestions.push({
          ...q,
          options: filledOptions,
          correctOptionIndex: newCorrectIndex
        });
      }
    }

    setIsSaving(true);
    setError('');

    let finalTotalMarks = 0;
    if (examType === 'builtin') {
      finalTotalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);
    } else {
      finalTotalMarks = Number(newTotalMarks);
    }

    const newExam: Exam = {
      id: editingExamId || Date.now().toString(),
      title: newTitle,
      totalMarks: finalTotalMarks,
      durationMinutes: Number(newDuration),
      isBuiltIn: examType === 'builtin',
      endTime: newEndTime || null,
      allowLateSubmission,
      strictTimeLimit,
      isPublished: isPublishedState,
      ...(examType === 'builtin' ? { questions: cleanedQuestions } : { link: newLink })
    };

    const updatedExams = editingExamId 
      ? exams.map(e => e.id === editingExamId ? newExam : e)
      : [...exams, newExam];
    
    try {
      await updateDoc(doc(db, 'courses', courseId), { exams: updatedExams });
      setExams(updatedExams);
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Failed to add exam.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDuration('');
    setNewLink('');
    setNewTotalMarks('');
    setQuestions([]);
    setExamType('builtin');
    setNewEndTime('');
    setAllowLateSubmission(false);
    setStrictTimeLimit(true);
    setIsPublishedState(true);
    setEditingExamId(null);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamType(exam.isBuiltIn || exam.questions ? 'builtin' : 'link');
    setNewTitle(exam.title);
    setNewDuration(exam.durationMinutes);
    setNewLink(exam.link || '');
    setNewTotalMarks(exam.totalMarks);
    setQuestions(exam.questions || []);
    setNewEndTime(exam.endTime || '');
    setAllowLateSubmission(exam.allowLateSubmission || false);
    setStrictTimeLimit(exam.strictTimeLimit ?? true);
    setIsPublishedState(exam.isPublished !== false);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    const updatedExams = exams.filter(e => e.id !== id);
    try {
      await updateDoc(doc(db, 'courses', courseId), { exams: updatedExams });
      setExams(updatedExams);
    } catch (err) {
      console.error(err);
      alert('Failed to delete exam.');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Exams & Quizzes</h1>
          <p className="text-foreground/70">Create built-in quizzes or add external links for your students.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {course?.totalExams > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-xl border border-foreground/10 text-sm font-bold shadow-sm">
              <span className="text-foreground/60">Total Exams:</span>
              <span className="text-primary">{exams.length} / {course.totalExams}</span>
            </div>
          )}
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-5 h-5" /> Add Exam
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddExam} className="bg-background border border-foreground/10 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-2 pb-4 border-b border-foreground/10">
            <h2 className="text-xl font-bold">{editingExamId ? 'Edit Exam' : 'Add New Exam'}</h2>
            <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{error}</div>}

          {/* Exam Type Selector */}
          <div className="flex bg-foreground/5 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setExamType('builtin')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'builtin' ? 'bg-background shadow-sm text-primary' : 'text-foreground/60 hover:text-foreground'}`}
            >
              Built-in Quiz
            </button>
            <button
              type="button"
              onClick={() => setExamType('link')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${examType === 'link' ? 'bg-background shadow-sm text-primary' : 'text-foreground/60 hover:text-foreground'}`}
            >
              External Link
            </button>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Total Marks <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={newTotalMarks} onChange={e => setNewTotalMarks(Number(e.target.value) || '')} placeholder="e.g. 50" className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Exam Link (Google Form, etc.) <span className="text-red-500">*</span></label>
                  <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://forms.gle/..." className="w-full px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl focus:border-orange-500" required />
                </div>
              </>
            )}
          </div>

          {examType === 'builtin' && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-foreground/10">
                <div>
                  <h3 className="font-bold text-lg">Questions</h3>
                  <p className="text-sm text-foreground/50">Total Marks: {questions.reduce((sum, q) => sum + Number(q.marks), 0)}</p>
                </div>
                <button type="button" onClick={handleAddQuestion} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-foreground/40 text-sm">No questions added yet. Click "Add Question" to start building your quiz.</div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border border-foreground/10 rounded-xl overflow-hidden bg-background">
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-foreground/5 transition-colors"
                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <span className="font-medium truncate max-w-[200px] sm:max-w-md">{q.text || 'New Question'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground/50">{q.marks} Marks</span>
                          {expandedQuestion === q.id ? <ChevronUp className="w-5 h-5 text-foreground/40" /> : <ChevronDown className="w-5 h-5 text-foreground/40" />}
                        </div>
                      </div>

                      {expandedQuestion === q.id && (
                        <div className="p-4 border-t border-foreground/10 bg-foreground/[0.02] space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-sm font-medium">Question Text</label>
                              <label className="flex items-center gap-2 cursor-pointer bg-primary/5 px-3 py-1 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={q.isMultipleStatement || false}
                                  onChange={(e) => handleUpdateQuestion(q.id, 'isMultipleStatement', e.target.checked)}
                                  className="w-3.5 h-3.5 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="text-xs font-bold text-primary">Multiple Statement MCQ (Board style)</span>
                              </label>
                            </div>
                            <input type="text" value={q.text} onChange={e => handleUpdateQuestion(q.id, 'text', e.target.value)} placeholder="Type your question here..." className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-primary focus:outline-none" />
                          </div>

                          {q.isMultipleStatement && (
                            <div className="mt-4 space-y-3 p-4 bg-background border border-foreground/10 rounded-xl">
                              <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Statements</p>
                              {[0, 1, 2].map(idx => (
                                <div key={idx} className="flex items-center gap-3">
                                  <span className="w-8 text-right font-bold text-foreground/40">{['i.', 'ii.', 'iii.'][idx]}</span>
                                  <input
                                    type="text"
                                    value={(q.statements || ['', '', ''])[idx] || ''}
                                    onChange={(e) => {
                                      const newStatements = [...(q.statements || ['', '', ''])];
                                      newStatements[idx] = e.target.value;
                                      handleUpdateQuestion(q.id, 'statements', newStatements);
                                    }}
                                    placeholder={`Statement ${['i', 'ii', 'iii'][idx]}`}
                                    className="w-full px-3 py-2 bg-background border border-foreground/10 rounded-lg focus:border-primary focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctOptionIndex === optIdx} 
                                  onChange={() => handleUpdateQuestion(q.id, 'correctOptionIndex', optIdx)}
                                  className="w-4 h-4 text-primary cursor-pointer"
                                />
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={e => handleUpdateOption(q.id, optIdx, e.target.value)} 
                                  placeholder={`Option ${optIdx + 1}`} 
                                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none transition-colors ${q.correctOptionIndex === optIdx ? 'border-green-500' : 'border-foreground/10 focus:border-primary'}`} 
                                />
                              </div>
                            ))}
                          </div>

                          <div className="pt-2">
                            <label className="block text-sm font-medium mb-1 text-foreground/70">Answer Explanation <span className="font-normal text-xs">(Optional - Shows after exam)</span></label>
                            <textarea 
                              value={q.explanation || ''} 
                              onChange={e => handleUpdateQuestion(q.id, 'explanation', e.target.value)} 
                              placeholder="Explain why the answer is correct..." 
                              className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg focus:border-primary focus:outline-none min-h-[80px]"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">Marks for this question:</label>
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
              <span className="font-bold text-sm">Publish this exam immediately</span>
            </label>
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg hover:shadow-primary/30">
              <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : editingExamId ? 'Save Changes' : 'Save Exam'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {exams.length === 0 && !isAdding ? (
          <div className="text-center p-12 border-2 border-dashed border-foreground/10 rounded-3xl bg-background/50">
            <CheckSquare className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="text-foreground/50 font-medium text-lg">No exams added yet.</p>
          </div>
        ) : (
          exams.map((exam, index) => (
            <div key={exam.id} className="bg-background border border-foreground/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="flex-1 flex gap-4">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{exam.title}</h3>
                    {exam.isPublished === false && (
                      <span className="px-2.5 py-0.5 bg-gray-500/10 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">Draft</span>
                    )}
                    {exam.isBuiltIn || exam.questions ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full uppercase tracking-wider">Built-in Quiz</span>
                        <Link href={`/teacher-dashboard/courses/${courseId}/exams/${exam.id}/leaderboard`} className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-bold rounded-full uppercase tracking-wider transition-colors cursor-pointer group animate-in fade-in duration-500">
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
                  {exam.endTime && (
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-500" /> Deadline: {new Date(exam.endTime).toLocaleString()}</span>
                  )}
                  {(!exam.isBuiltIn && !exam.questions) && (
                    <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-orange-500" /> <a href={exam.link} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 underline underline-offset-2">External Link</a></span>
                  )}
                  {(exam.isBuiltIn || exam.questions) && (
                    <span className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-orange-500" /> {exam.questions?.length || 0} Questions</span>
                  )}
                </div>
                  </div>
                </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEditExam(exam)} className="px-4 py-2 text-sm font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(exam.id)} className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
