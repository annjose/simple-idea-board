'use client';

import dynamic from 'next/dynamic';
import { useIdeaBoard } from './hooks/useIdeaBoard';
import AuthModal from './components/AuthModal';
import ThemeToggle from './components/ThemeToggle';
import { IdeaWithReactions } from './types';

// tldraw accesses browser APIs — load client-side only
const CanvasBoard = dynamic(() => import('./components/canvas/CanvasBoard'), { ssr: false });

export default function Page() {
  const {
    user,
    authLoading,
    myProfile,
    ideas,
    mounted,
    isDark,
    addIdea,
    toggleReaction,
    updateIdeaPosition,
    toggleDark,
  } = useIdeaBoard();

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-300 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const showAuthModal = !user || !myProfile;

  return (
    <div className="fixed inset-0 bg-[#f7f3ee] dark:bg-slate-950">
      {showAuthModal && <AuthModal user={user} />}

      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-none px-4 h-14 flex items-center justify-between">
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
            {user && myProfile && (
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                👋 <span className="font-medium text-slate-700 dark:text-slate-300">{myProfile.displayName}</span>
              </span>
            )}
            <ThemeToggle isDark={isDark} onToggle={toggleDark} />
          </div>
        </div>
      </header>

      {/* Canvas — only shown when authenticated */}
      {!showAuthModal && (
        <CanvasBoard
          currentUserId={user!.id}
          displayName={myProfile!.displayName}
          ideas={ideas as IdeaWithReactions[]}
          addIdea={addIdea}
          toggleReaction={toggleReaction}
          updateIdeaPosition={updateIdeaPosition}
        />
      )}
    </div>
  );
}
