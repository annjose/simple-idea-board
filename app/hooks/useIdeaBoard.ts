'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Idea } from '../types';

const USER_KEY = 'idea-board-user';
const IDEAS_KEY = 'idea-board-ideas';
const THEME_KEY = 'idea-board-theme';

export function useIdeaBoard() {
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }

    const savedIdeas = localStorage.getItem(IDEAS_KEY);
    if (savedIdeas) {
      try { setIdeas(JSON.parse(savedIdeas)); } catch {}
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
    }
  }, [ideas, mounted]);

  const saveUser = useCallback((displayName: string) => {
    const newUser: User = {
      userId: crypto.randomUUID(),
      displayName: displayName.trim(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const addIdea = useCallback((text: string) => {
    if (!user || !text.trim()) return;
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      text: text.trim(),
      authorId: user.userId,
      authorName: user.displayName,
      createdAt: Date.now(),
      reactions: {},
    };
    setIdeas(prev => [newIdea, ...prev]);
  }, [user]);

  const toggleReaction = useCallback((ideaId: string, emoji: string) => {
    if (!user) return;
    setIdeas(prev => prev.map(idea => {
      if (idea.id !== ideaId) return idea;
      const current = idea.reactions[emoji] ?? [];
      const hasReacted = current.includes(user.userId);
      const updated = hasReacted
        ? current.filter(id => id !== user.userId)
        : [...current, user.userId];
      return {
        ...idea,
        reactions: {
          ...idea.reactions,
          [emoji]: updated,
        },
      };
    }));
  }, [user]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { user, ideas, mounted, isDark, saveUser, addIdea, toggleReaction, toggleDark };
}
