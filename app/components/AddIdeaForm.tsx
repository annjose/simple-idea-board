'use client';

import { useState, useRef } from 'react';

interface AddIdeaFormProps {
  onAdd: (text: string) => void;
  authorName: string;
}

export default function AddIdeaForm({ onAdd, authorName }: AddIdeaFormProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative rounded-2xl border-2 transition-all duration-200 bg-white dark:bg-slate-800 shadow-sm
          ${focused
            ? 'border-indigo-400 shadow-indigo-100 dark:shadow-indigo-900/30 shadow-md'
            : 'border-slate-200 dark:border-slate-700'
          }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Share an idea with the group…"
          rows={3}
          maxLength={500}
          className="w-full px-4 pt-4 pb-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none text-base leading-relaxed"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Posting as <span className="font-medium text-slate-600 dark:text-slate-300">{authorName}</span>
            <span className="ml-2 text-slate-300 dark:text-slate-600">· ⌘↵ to submit</span>
          </span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 text-sm font-semibold rounded-lg transition-all duration-150 disabled:cursor-not-allowed active:scale-95"
          >
            Post idea
          </button>
        </div>
      </div>
    </form>
  );
}
