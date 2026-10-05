'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Clock, CheckCircle2, AlertCircle, 
  Upload, Plus, ExternalLink, Calendar, X, Send,
  BookOpen, Sparkles
} from 'lucide-react';
import { supabase } from '@/app/supabase';

const DEFAULT_ASSIGNMENTS = [
  {
    id: '1',
    subject: 'Physics',
    title: "Newton's Second Law Lab Presentation",
    description: 'Prepare a 5-slide Google Slides presentation explaining force, mass, and acceleration with real-world examples.',
    due_date: '2026-10-08T23:59:00Z',
    points: 100,
    teacher: 'M. Sobirova',
    attachment_url: 'https://slides.google.com',
    status: 'pending',
  },
  {
    id: '2',
    subject: 'Mathematics & Algebra',
    title: 'Quadratic Equations Worksheet #4',
    description: 'Solve problems 1 through 15 on page 142. Show all work for quadratic formula calculations.',
    due_date: '2026-10-06T18:00:00Z',
    points: 50,
    teacher: 'A. Karimov',
    attachment_url: null,
    status: 'pending',
  },
  {
    id: '3',
    subject: 'Information Technology',
    title: 'Python Scripting Practice: Loops & Functions',
    description: 'Submit your main.py file containing functions that compute factorial and prime number checks.',
    due_date: '2026-10-12T23:59:00Z',
    points: 100,
    teacher: 'S. Rahimov',
    attachment_url: 'https://github.com',
    status: 'pending',
  },
  {
    id: '4',
    subject: 'English Language',
    title: 'IELTS Academic Writing Task 2 Essay',
    description: 'Write a 250-word essay discussing the impact of artificial intelligence on modern education.',
    due_date: '2026-10-01T23:59:00Z',
    points: 100,
    teacher: 'D. Aliyeva',
    attachment_url: null,
    status: 'completed',
    submitted_at: '2026-09-30T14:20:00Z',
    submission_link: 'https://docs.google.com/document/d/example',
    grade: '92/100',
  },
];

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [assignments, setAssignments] = useState(DEFAULT_ASSIGNMENTS);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student');
  const [userId, setUserId] = useState(null);

  // Turn in modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role) setUserRole(profile.role);

          // Attempt to fetch from Supabase 'assignments'
          const { data: dbAssignments } = await supabase
            .from('assignments')
            .select('*')
            .order('due_date', { ascending: true });

          if (dbAssignments && dbAssignments.length > 0) {
            setAssignments(dbAssignments);
          }
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const subjects = ['All', ...new Set(assignments.map((a) => a.subject))];

  const filteredAssignments = assignments.filter((item) => {
    const matchesTab = activeTab === 'pending' ? item.status !== 'completed' : item.status === 'completed';
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    return matchesTab && matchesSubject;
  });

  const handleTurnInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionUrl) return;

    setSubmitting(true);
    try {
      if (userId) {
        await supabase.from('submissions').insert([
          {
            assignment_id: selectedAssignment.id,
            student_id: userId,
            file_url: submissionUrl,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
        ]);
      }

      // Update local state instantly
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === selectedAssignment.id
            ? {
                ...item,
                status: 'completed',
                submitted_at: new Date().toISOString(),
                submission_link: submissionUrl,
              }
            : item
        )
      );

      setSelectedAssignment(null);
      setSubmissionUrl('');
    } catch (err) {
      console.error('Error submitting work:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No Deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeadlineBadge = (dateString) => {
    const due = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { text: 'Overdue', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }
    if (diffHours <= 48) {
      return { text: 'Due Soon', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { text: 'Upcoming', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-xs font-mono theme-text-secondary">
        Loading classroom tasks...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Classroom Assignment Hub
          </div>
          <h1 className="text-3xl font-serif font-bold">Classwork & Homework</h1>
          <p className="text-xs theme-text-secondary mt-1">
            Track upcoming deadlines, submit presentations, and view graded coursework.
          </p>
        </div>

        {userRole === 'teacher' && (
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> Create New Assignment
          </Link>
        )}
      </div>

      {/* Tabs & Subject Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Pending vs Completed Tabs */}
        <div className="flex items-center gap-2 p-1.5 theme-bg-card border theme-border rounded-2xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Assigned / To-Do
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-black/20 font-mono">
              {assignments.filter((a) => a.status !== 'completed').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'theme-text-secondary hover:theme-text-primary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-black/20 font-mono">
              {assignments.filter((a) => a.status === 'completed').length}
            </span>
          </button>
        </div>

        {/* Subject Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs theme-text-secondary font-mono">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs theme-bg-card border theme-border font-medium focus:outline-none focus:border-emerald-500"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center theme-bg-card border theme-border rounded-3xl space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
          <h3 className="font-serif font-bold text-base">No tasks found</h3>
          <p className="text-xs theme-text-secondary max-w-sm mx-auto">
            {activeTab === 'pending'
              ? "You're all caught up! No pending homework or presentations for this selection."
              : 'No completed assignments recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const badge = getDeadlineBadge(assignment.due_date);
            return (
              <div
                key={assignment.id}
                className="p-6 theme-bg-card border theme-border rounded-3xl space-y-4 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {assignment.subject}
                    </span>
                    {activeTab === 'pending' && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.text}
                      </span>
                    )}
                    <span className="text-[10px] theme-text-secondary font-mono">
                      {assignment.points} Points
                    </span>
                  </div>

                  <h2 className="text-lg font-serif font-bold">{assignment.title}</h2>
                  <p className="text-xs theme-text-secondary leading-relaxed">
                    {assignment.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs theme-text-secondary pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      Due: {formatDueDate(assignment.due_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      Teacher: {assignment.teacher}
                    </span>
                  </div>

                  {assignment.attachment_url && (
                    <a
                      href={assignment.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline pt-1 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Teacher Resource / Attachment
                    </a>
                  )}
                </div>

                {/* Right Action side */}
                <div className="shrink-0 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 theme-border gap-3">
                  {activeTab === 'pending' ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Turn In Work
                    </button>
                  ) : (
                    <div className="space-y-1.5 text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                      </span>
                      {assignment.grade && (
                        <p className="text-xs font-mono font-bold text-emerald-400">
                          Grade: {assignment.grade}
                        </p>
                      )}
                      {assignment.submission_link && (
                        <a
                          href={assignment.submission_link}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[11px] theme-text-secondary hover:underline"
                        >
                          View Submission →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TURN IN MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 theme-bg-card border theme-border rounded-3xl max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="absolute right-5 top-5 p-1 rounded-xl hover:bg-emerald-500/10 theme-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                {selectedAssignment.subject}
              </span>
              <h3 className="text-xl font-serif font-bold mt-1">Submit Assignment</h3>
              <p className="text-xs theme-text-secondary mt-1">
                {selectedAssignment.title}
              </p>
            </div>

            <form onSubmit={handleTurnInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono theme-text-secondary mb-1.5">
                  Link to Presentation or Google Doc / File URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/presentation/d/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-xs theme-bg-page border theme-border focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] theme-text-secondary mt-1">
                  Ensure link permissions are set to &quot;Anyone with link can view&quot;.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold theme-text-secondary hover:theme-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Mark as Done & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}