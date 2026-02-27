'use client';

import { useState, useRef, useEffect } from 'react';

interface NameModalProps {
  onSave: (name: string) => void;
}

export default function NameModal({ onSave }: NameModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💡</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Welcome to Idea Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            What should we call you?
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your display name"
            maxLength={40}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-400 transition-colors text-base"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-semibold rounded-xl transition-all duration-150 disabled:cursor-not-allowed active:scale-95"
          >
            Let&apos;s go →
          </button>
        </form>
      </div>
    </div>
  );
}
