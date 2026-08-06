/**
 * frontend/src/utils/chatLocalStorage.js
 *
 * localStorage read/write helpers for the shared Chat Support widget
 * (ChatSupportWidget.jsx + its sub-screens). Per instruction, there is
 * NO real backend/AI for this feature — the "Cuvva Support Bot"
 * conversation is entirely local: every message (yours and the bot's)
 * is saved here, timestamped, and re-read on every visit so the
 * conversation looks persistent, exactly like a real chat history
 * would.
 *
 * TIMESTAMP + "Nw ago" / "Nd ago" ROW LABEL (per instruction: "handle
 * it with a function that check the dates of the last chat and
 * current date then tell us that weeks ago"): every stored message
 * carries a real `timestamp` (Date.now()), and getRelativeTimeLabel()
 * below compares that against the current time on every render — so
 * the Messages list row (chat2.jpeg's "Product 2w ago" style label)
 * always reflects how long it's ACTUALLY been since the last message
 * in that thread, computed fresh, not a hardcoded string.
 *
 * "Product" and "Steve" fixed sample threads from chat2.jpeg are
 * explicitly SKIPPED per instruction — only the real bot conversation
 * is implemented. If the user never talks to the bot, the Messages
 * list has nothing to show yet (handled in ChatMessagesListPage.jsx).
 */

const KEY = "cuvva_chat_bot_conversation";

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {"user"|"bot"} sender
 * @property {string} text
 * @property {number} timestamp - Date.now() when the message was sent.
 */

/** @returns {ChatMessage[]} */
export function getChatMessages() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** @param {ChatMessage[]} messages */
export function saveChatMessages(messages) {
  try {
    localStorage.setItem(KEY, JSON.stringify(messages));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — the
    // conversation just won't persist across reloads this session,
    // no need to surface an error for a non-critical local cache.
  }
}

/** Appends one message and persists immediately. Returns the new full list. */
export function addChatMessage(message) {
  const messages = getChatMessages();
  const updated = [...messages, message];
  saveChatMessages(updated);
  return updated;
}

export function clearChatMessages() {
  saveChatMessages([]);
}

/**
 * Turns a timestamp into a short relative label matching the
 * reference screenshot's style ("2w ago", "8w ago"). Deliberately
 * coarse (minutes/hours/days/weeks/months) rather than exact, same
 * as most real chat apps' list previews.
 */
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
