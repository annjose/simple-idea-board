export const EMOJIS = ['👍', '💡', '🔥', '❤️', '😂', '🤔', '👀', '🚀'];

export interface IdeaWithReactions {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: number;
  reactions: Array<{
    id: string;
    ideaId: string;
    userId: string;
    emoji: string;
  }>;
}
