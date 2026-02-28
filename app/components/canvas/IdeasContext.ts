import { createContext } from 'react';
import { IdeaWithReactions } from '../../types';

export interface IdeasContextValue {
  ideasById: Record<string, IdeaWithReactions>;
  currentUserId: string;
  toggleReaction: (ideaId: string, emoji: string) => void;
}

export const IdeasContext = createContext<IdeasContextValue>({
  ideasById: {},
  currentUserId: '',
  toggleReaction: () => {},
});
