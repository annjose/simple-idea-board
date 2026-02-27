export interface User {
  userId: string;
  displayName: string;
}

export interface Idea {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  reactions: Record<string, string[]>; // emoji -> array of userIds
}

export const EMOJIS = ['👍', '💡', '🔥', '❤️', '😂', '🤔', '👀', '🚀'];
