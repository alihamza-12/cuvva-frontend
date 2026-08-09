

const KEY = "cuvva_chat_bot_conversation";

export function getChatMessages() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatMessages(messages) {
  try {
    localStorage.setItem(KEY, JSON.stringify(messages));
  } catch {

  }
}

export function addChatMessage(message) {
  const messages = getChatMessages();
  const updated = [...messages, message];
  saveChatMessages(updated);
  return updated;
}

export function clearChatMessages() {
  saveChatMessages([]);
}

export function getRelativeTimeLabel(timestamp) {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}
