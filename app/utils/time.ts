export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getCardColor(id: string): string {
  const colors = [
    'bg-yellow-50 dark:bg-yellow-950/30',
    'bg-blue-50 dark:bg-blue-950/30',
    'bg-green-50 dark:bg-green-950/30',
    'bg-pink-50 dark:bg-pink-950/30',
    'bg-purple-50 dark:bg-purple-950/30',
    'bg-orange-50 dark:bg-orange-950/30',
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
}
