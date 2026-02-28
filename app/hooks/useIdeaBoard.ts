'use client';

import { useState, useEffect, useCallback } from 'react';
import { id } from '@instantdb/react';
import { db } from '../db';

const THEME_KEY = 'idea-board-theme';

export function useIdeaBoard() {
  const { isLoading: authLoading, user: rawUser } = db.useAuth();
  const user = rawUser ?? null;

  // Query ideas and reactions separately (reactions use ideaId attribute, not a link)
  const { data: ideasData } = db.useQuery({ ideas: {} });
  const { data: reactionsData } = db.useQuery({ reactions: {} });

  // Query current user's profile via the profileUser link
  const { data: profileData } = db.useQuery(
    user ? { profiles: { '$user': {} } } : null
  );

  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Find the current user's profile from the query results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myProfile = user ? (profileData?.profiles as any[])?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p['$user']?.id === user.id
  ) as { id: string; displayName: string } | undefined : undefined;

  const addIdea = useCallback((content: string, x?: number, y?: number) => {
    if (!user || !myProfile || !content.trim()) return;
    db.transact(
      db.tx.ideas[id()].update({
        userId: user.id,
        displayName: myProfile.displayName,
        content: content.trim(),
        createdAt: Date.now(),
        x: x ?? 0,
        y: y ?? 0,
      })
    );
  }, [user, myProfile]);

  const updateIdeaPosition = useCallback((ideaId: string, x: number, y: number) => {
    db.transact(db.tx.ideas[ideaId].update({ x, y }));
  }, []);

  const toggleReaction = useCallback((ideaId: string, emoji: string) => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allReactions = (reactionsData?.reactions as any[]) ?? [];
    const existing = allReactions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => r.userId === user.id && r.emoji === emoji && r.ideaId === ideaId
    );
    if (existing) {
      db.transact(db.tx.reactions[existing.id].delete());
    } else {
      db.transact(
        db.tx.reactions[id()].update({ ideaId, userId: user.id, emoji })
      );
    }
  }, [user, reactionsData]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Join ideas with their reactions, sort by createdAt descending (newest first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allReactions = (reactionsData?.reactions as any[]) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedIdeas = [...((ideasData?.ideas as any[]) ?? [])]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((idea: any) => ({
      ...idea,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reactions: allReactions.filter((r: any) => r.ideaId === idea.id),
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  return {
    user,
    authLoading,
    myProfile,
    ideas: sortedIdeas,
    mounted,
    isDark,
    addIdea,
    toggleReaction,
    updateIdeaPosition,
    toggleDark,
  };
}
