'use client';

import { useEffect, useState } from 'react';
import { useIdeaBoard } from './hooks/useIdeaBoard';
import NameModal from './components/NameModal';
import AddIdeaForm from './components/AddIdeaForm';
import IdeaCard from './components/IdeaCard';
import ThemeToggle from './components/ThemeToggle';

export default function Page() {
  const { user, ideas, mounted, isDark, saveUser, addIdea, toggleReaction, toggleDark } = useIdeaBoard();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-300 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] dark:bg-slate-950 transition-colors duration-300">
      {!user && <NameModal onSave={saveUser} />}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              Idea Board
            </span>
            {ideas.length > 0 && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-medium px-2 py-0.5 rounded-full">
                {ideas.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                👋 <span className="font-medium text-slate-700 dark:text-slate-300">{user.displayName}</span>
              </span>
            )}
            <ThemeToggle isDark={isDark} onToggle={toggleDark} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {user && (
          <AddIdeaForm onAdd={addIdea} authorName={user.displayName} />
        )}

        {ideas.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-6xl">🌱</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              No ideas yet!
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              Be the first to share one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                currentUserId={user?.userId ?? ''}
                onToggleReaction={toggleReaction}
                tick={tick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
