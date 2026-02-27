'use client';

import { useState } from 'react';
import { Idea, EMOJIS } from '../types';
import { getRelativeTime, getCardColor } from '../utils/time';

interface IdeaCardProps {
  idea: Idea;
  currentUserId: string;
  onToggleReaction: (ideaId: string, emoji: string) => void;
  tick: number; // used to force re-render for timestamp updates
}

export default function IdeaCard({ idea, currentUserId, onToggleReaction }: IdeaCardProps) {
  const [bouncingEmoji, setBouncingEmoji] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    setBouncingEmoji(emoji);
    onToggleReaction(idea.id, emoji);
    setTimeout(() => setBouncingEmoji(null), 300);
  };

  const cardColor = getCardColor(idea.id);

  const reactionsWithCount = EMOJIS
    .map(emoji => ({
      emoji,
      count: idea.reactions[emoji]?.length ?? 0,
      active: idea.reactions[emoji]?.includes(currentUserId) ?? false,
    }))
    .filter(r => r.count > 0 || true); // show all emojis

  return (
    <div
      className={`
        flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-700/60
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${cardColor}
        animate-fade-in-up
        overflow-hidden
      `}
    >
      {/* Card content */}
      <div className="flex-1 p-4">
        <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed break-words">
          {idea.text}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 pb-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-3">
          <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
            {idea.authorName}
          </span>
          <span>·</span>
          <span>{getRelativeTime(idea.createdAt)}</span>
        </div>

        {/* Emoji reactions */}
        <div className="flex flex-wrap gap-1">
          {reactionsWithCount.map(({ emoji, count, active }) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={active ? `Remove your ${emoji} reaction` : `React with ${emoji}`}
              className={`
                inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-sm
                border transition-all duration-150
                ${active
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
                active:scale-95
                ${bouncingEmoji === emoji ? 'animate-scale-pop' : ''}
              `}
            >
              <span
                className={`leading-none transition-transform duration-150 ${bouncingEmoji === emoji ? 'scale-125' : ''}`}
              >
                {emoji}
              </span>
              {count > 0 && (
                <span className="text-xs font-medium leading-none">{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
