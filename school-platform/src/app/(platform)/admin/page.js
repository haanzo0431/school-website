'use client';

import { useState } from 'react';
import { UserPlus, CheckCircle2, AlertCircle, ShieldAlert, Key, User, BookOpen } from 'lucide-react';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    gradeClass: '10-A',
    age: '',
    studentId: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create student.');

      setMessage({
        type: 'success',
        text: `Account created! Login ID: ${data.user.email}`,
      });

      // Reset form
      setFormData({
        firstName: '',
        surname: '',
        gradeClass: '10-A',
        age: '',
        studentId: '',
        password: '',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto theme-text-primary">
      {/* Header */}
      <div className="mb-8 border-b theme-border pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold uppercase mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> Admin Console
        </div>
        <h1 className="text-3xl font-serif font-bold">Student Account Provisioner</h1>
        <p className="theme-text-secondary text-sm mt-1">
          Generate official student logins and lock them directly into the school system.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleCreateStudent} className="theme-bg-card border theme-border p-6 md:p-8 rounded-3xl space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input
                type="text"
                name="firstName"
                required
                placeholder="Jasur"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              Surname
            </label>
            <input
              type="text"
              name="surname"
              required
              placeholder="Rahimov"
              value={formData.surname}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              Class / Grade
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input
                type="text"
                name="gradeClass"
                required
                placeholder="10-A"
                value={formData.gradeClass}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              placeholder="16"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-xs theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              Student ID Number
            </label>
            <input
              type="text"
              name="studentId"
              required
              placeholder="10001"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-mono theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] theme-text-secondary mt-1">
              Login email will be: <span className="text-emerald-400 font-mono">s-{formData.studentId || '10001'}@xonqa.school</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase theme-text-secondary mb-2">
              Initial Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 theme-text-secondary" />
              <input
                type="text"
                name="password"
                required
                placeholder="student123"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono theme-bg-input border theme-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creating Student Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}