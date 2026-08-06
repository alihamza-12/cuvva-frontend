import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageCircle,
  HelpCircle,
  SquarePen,
  CheckCircle2,
  Paperclip,
  Image as ImageIcon,
  Mic,
  ArrowUp,
  Info,
} from "lucide-react";
import chatBotAvatar from "/chat-bot-avatar.png";
import chatBotRepliesData from "../../data/chatBotRepliesData.json";
import chatHelpArticlesData from "../../data/chatHelpArticlesData.json";
import termsData from "../../data/termsData.json";
import {
  getChatMessages,
  addChatMessage,
  getRelativeTimeLabel,
} from "../../utils/chatLocalStorage";

/**
 * frontend/src/components/customer/ChatSupportWidget.jsx
 *
 * ONE shared, reusable "Chat Support" overlay — built once here, then
 * dropped into any page that needs a chat-support entry point (per
 * instruction: "chat support is in the all components almost so i
 * decide that we build the chat support component in one place and
 * then we use it in the multiple of components where we basically
 * need"). Usage from a consuming page:
 *
 *   const [showChat, setShowChat] = useState(false);
 *   <button onClick={() => setShowChat(true)}>...</button>
 *   {showChat && <ChatSupportWidget onClose={() => setShowChat(false)} />}
 *
 * Exactly which pages/icons should open this is DEFERRED per
 * instruction ("for now you just implement it like what i said then
 * later i will tell you where and which component need that page or
 * icon") — this file is the reusable building block, not yet wired
 * into every page.
 *
 * FIVE internal screens, all matching your reference screenshots
 * pixel-for-pixel, switched via local `screen` state (no routing —
 * this is a self-contained overlay, same pattern as the modals
 * already used elsewhere in this app):
 *
 *   "hub"          — chat1.jpeg: purple gradient header with 3 avatar
 *                    bubbles + close X, "Hey {name} 👋 How can we
 *                    help?", Messages/Help rows, "Search for help"
 *                    (REAL live search across all help article
 *                    titles), "Send us a message" row, operational
 *                    status banner, "Subscribe to updates" button.
 *   "messages"     — chat2.jpeg: back arrow + "Messages" + edit icon
 *                    (per instruction, the edit/new-message icon is
 *                    shown for visual fidelity but does nothing —
 *                    "the edit/new message icon are not show i donot
 *                    want to implement write new message here" is
 *                    read as "don't wire it up", not "hide it",
 *                    since chat2.jpeg clearly shows the icon) + a
 *                    list of conversation threads. Per instruction,
 *                    the hardcoded "Product"/"Steve" sample threads
 *                    from your screenshot are SKIPPED — only the
 *                    real bot conversation (if any messages have
 *                    ever been sent) appears here, with its relative
 *                    time label computed fresh from the real
 *                    timestamp of its last message.
 *   "conversation" — chat3.jpeg / chat45.jpeg: the actual "Cuvva
 *                    Support Bot" chat thread. Loads any previously
 *                    saved messages from localStorage first (so
 *                    returning to an old conversation shows your
 *                    real history), bot messages on the left, user
 *                    messages on the right, quick-reply pills (only
 *                    shown before you've sent your first message,
 *                    matching the screenshot), and a text-only input
 *                    (per instruction: attach/GIF/mic icons are shown
 *                    for visual fidelity but are disabled — text
 *                    only can actually be sent).
 *   "article"      — chat4-13.jpeg: generic help-article renderer
 *                    (title/subtitle/date/body/"Did this answer your
 *                    question?" footer), driven by
 *                    chatHelpArticlesData.json — one component reused
 *                    for all 3 articles ("Taking a vehicle photo",
 *                    "How to contact customer support", "Vehicle
 *                    modifications"), matching your instruction that
 *                    each of chat4-7 / chat8-10 / chat11-13 is one
 *                    continuous scrollable article, not separate
 *                    pages.
 *   "terms"        — chat14-44.jpeg: the FULL real Cuvva terms and
 *                    conditions (29 clauses), reusing the EXACT same
 *                    termsData.json already built for
 *                    TermsPage.jsx — not re-transcribed, since it's
 *                    the identical document. Same content-block
 *                    renderer pattern (major heading / body / list),
 *                    just inside this overlay instead of a full page.
 *
 * BOT REPLIES ARE NOT REAL AI (explicit instruction: "i just only
 * need the UI no need for the proper api integration and the api
 * key"). chatBotRepliesData.json holds one hand-written canned reply
 * per quick-reply button, and a small pool of generic
 * "fallbackReplies" for anything freely typed that doesn't match a
 * quick-reply — one is picked at random, per instruction ("if the
 * user ask any other question then just show a random answer only").
 *
 * PERSISTENCE (explicit instruction): every message (yours + the
 * bot's) is saved to localStorage via chatLocalStorage.js, WITH a
 * real timestamp — so re-opening the conversation later shows the
 * real history, and the "Messages" list's relative-time label ("Nw
 * ago") is computed fresh from that real timestamp on every render,
 * not hardcoded.
 */

const SUPPORT_HOURS_LINE = "We're here 9am - 9pm Mon - Sat and 9am - 6pm on Sundays";
const AI_DISCLAIMER =
  "Our support combines human expertise with AI assistance. Please note that AI responses may not always be 100% accurate or complete. For definitive information, refer to our policy documents or speak directly with one of our human agents. AI-provided guidance is not formal advice, and we do not take responsibility for any information not provided by a human representative. For details on how your personal data is processed, please see our privacy notice.";

// Flat, searchable list of every help article — powers the hub's
// live "Search for help" box. Keeping this list here (rather than
// re-deriving it from chatHelpArticlesData every render) makes the
// search order match the screenshot's fixed order exactly.
const HELP_ARTICLES = [
  { id: "vehicle-photo", title: "Taking a vehicle photo for your Cuvva policy" },
  { id: "contact-support", title: "How to contact customer support or leave feedback" },
  { id: "vehicle-modifications", title: "Vehicle modifications" },
  { id: "terms", title: "Cuvva's terms and conditions" },
];

export default function ChatSupportWidget({ onClose, customerFirstName = "there" }) {
  const [screen, setScreen] = useState("hub");
  const [activeArticleId, setActiveArticleId] = useState(null);

  return (
    <div className="fixed inset-0 z-[100] bg-white text-[#151517] overflow-y-auto">
      {screen === "hub" && (
        <HubScreen
          customerFirstName={customerFirstName}
          onClose={onClose}
          onOpenMessages={() => setScreen("messages")}
          onOpenConversation={() => setScreen("conversation")}
          onOpenArticle={(id) => {
            setActiveArticleId(id);
            setScreen(id === "terms" ? "terms" : "article");
          }}
        />
      )}

      {screen === "messages" && (
        <MessagesListScreen
          onBack={() => setScreen("hub")}
          onClose={onClose}
          onOpenConversation={() => setScreen("conversation")}
        />
      )}

      {screen === "conversation" && (
        <ConversationScreen onClose={() => setScreen("hub")} />
      )}

      {screen === "article" && activeArticleId && (
        <ArticleScreen
          articleId={activeArticleId}
          onClose={() => setScreen("hub")}
        />
      )}

      {screen === "terms" && <TermsScreen onClose={() => setScreen("hub")} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HUB — chat1.jpeg                                                    */
/* ------------------------------------------------------------------ */

function HubScreen({ customerFirstName, onClose, onOpenMessages, onOpenConversation, onOpenArticle }) {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter((a) => a.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen">
      {/* Purple gradient header */}
      <div
        className="px-5 pb-10 pt-5"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #1c0839 45%, #1c0839 75%, #57456a 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <CuvvaWordmark className="h-6 w-auto text-white" />
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] border-2 border-[#1c0839] flex items-center justify-center overflow-hidden -mr-2 z-30">
              <img src={chatBotAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
            </span>
            <span className="w-9 h-9 rounded-full bg-[#f4c9c9] border-2 border-[#1c0839] overflow-hidden -mr-2 z-20" />
            <span className="w-9 h-9 rounded-full bg-[#3a2e2e] border-2 border-[#1c0839] overflow-hidden z-10" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center ml-2"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        <h1 className="mt-8 text-[26px] font-extrabold text-white leading-tight">
          Hey {customerFirstName} 👋
          <br />
          How can we help?
        </h1>
      </div>

      <div className="px-4 -mt-4 pb-10">
        {/* Messages / Help card */}
        <div className="rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={onOpenMessages}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-[#f0f0f0]"
          >
            <span className="text-[16px] font-bold text-[#151517]">Messages</span>
            <MessageCircle size={20} className="text-[#6337d9]" fill="#6337d9" />
          </button>
          <button
            type="button"
            onClick={() => onOpenArticle(HELP_ARTICLES[0].id)}
            className="w-full flex items-center justify-between px-4 py-4"
          >
            <span className="text-[16px] font-bold text-[#151517]">Help</span>
            <span className="w-6 h-6 rounded-full bg-[#6337d9] flex items-center justify-center">
              <HelpCircle size={15} className="text-white" fill="#6337d9" />
            </span>
          </button>
        </div>

        {/* Search for help */}
        <div className="mt-4 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#f0f0f0]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for help"
              className="flex-1 bg-transparent text-[16px] font-bold text-[#151517] placeholder:text-[#151517] placeholder:font-bold focus:outline-none"
            />
            <Search size={19} className="text-[#151517] shrink-0" />
          </div>

          {searchResults.length === 0 ? (
            <p className="px-4 py-4 text-[14px] text-[#8a8a8f]">
              No help articles matched &ldquo;{query}&rdquo;.
            </p>
          ) : (
            searchResults.map((article, i) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onOpenArticle(article.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-4 text-left ${
                  i !== searchResults.length - 1 ? "border-b border-[#f0f0f0]" : ""
                }`}
              >
                <span className="text-[15px] text-[#151517] leading-snug">{article.title}</span>
                <ChevronRight size={18} className="text-[#6337d9] shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Send us a message */}
        <button
          type="button"
          onClick={onOpenConversation}
          className="mt-4 w-full flex items-center justify-between rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] px-4 py-4"
        >
          <span className="text-left">
            <span className="block text-[16px] font-bold text-[#151517]">Send us a message</span>
            <span className="block text-[14px] text-[#a5a5aa] mt-0.5">We&rsquo;ll be back online in 2 hours</span>
          </span>
          <ArrowUp size={20} className="text-[#6337d9] rotate-90 shrink-0" />
        </button>

        {/* Operational status banner */}
        <div className="mt-6 rounded-t-2xl bg-[#f4f2ff] px-4 py-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#d5f5ec] flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-[#1fa97e]" fill="#1fa97e" />
          </span>
          <span>
            <span className="block text-[15px] font-bold text-[#6337d9]">Cuvva</span>
            <span className="block text-[14px] text-[#6b6b70]">We&rsquo;re fully operational.</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => console.log("Subscribe to updates tapped — not wired up yet.")}
          className="w-full rounded-b-2xl bg-[#6337d9] py-4 text-[16px] font-bold text-white"
        >
          Subscribe to updates
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MESSAGES LIST — chat2.jpeg                                          */
/* ------------------------------------------------------------------ */

function MessagesListScreen({ onBack, onClose, onOpenConversation }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages(getChatMessages());
  }, []);

  // Only the REAL bot thread — the "Product"/"Steve" sample rows from
  // the reference screenshot are intentionally not built, per
  // instruction. If nothing has ever been sent, there's simply
  // nothing to show yet (an empty state), same as a real messages
  // inbox would look before your first conversation.
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-[#151517]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#151517]">Messages</h1>
        <div className="flex items-center gap-1">
          {/* Matches chat2.jpeg's edit/new-message icon for visual
              fidelity — per instruction, NOT wired up (no "write new
              message" flow is being built). */}
          <button
            type="button"
            onClick={() => console.log("New message tapped — not wired up yet.")}
            aria-label="New message"
            className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
          >
            <SquarePen size={16} className="text-[#151517]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
          >
            <X size={16} className="text-[#151517]" />
          </button>
        </div>
      </div>

      {!lastMessage ? (
        <p className="px-5 pt-10 text-center text-[14px] text-[#a5a5aa]">
          No conversations yet. Tap &ldquo;Send us a message&rdquo; to start chatting with the Cuvva Support Bot.
        </p>
      ) : (
        <button
          type="button"
          onClick={onOpenConversation}
          className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#f0f0f0]"
        >
          <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] shrink-0 overflow-hidden">
            <img src={chatBotAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[#151517]">Cuvva Support Bot</span>
              <span className="text-[13px] text-[#a5a5aa]">{getRelativeTimeLabel(lastMessage.timestamp)}</span>
            </span>
            <span className="block text-[14px] text-[#a5a5aa] truncate mt-0.5">
              {lastMessage.text}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONVERSATION — chat3.jpeg / chat45.jpeg                             */
/* ------------------------------------------------------------------ */

function ConversationScreen({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(getChatMessages());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const hasSentAnyMessage = messages.some((m) => m.sender === "user");

  const pushMessage = (sender, text) => {
    const message = { id: `${Date.now()}-${sender}`, sender, text, timestamp: Date.now() };
    const updated = addChatMessage(message);
    setMessages(updated);
    return message;
  };

  const respondAsBot = (userText) => {
    const matchedQuickReply = chatBotRepliesData.quickReplies.find(
      (q) => q.label.toLowerCase() === userText.trim().toLowerCase(),
    );
    const replyText = matchedQuickReply
      ? matchedQuickReply.reply
      : chatBotRepliesData.fallbackReplies[
          Math.floor(Math.random() * chatBotRepliesData.fallbackReplies.length)
        ];
    // Small delay so the bot's reply doesn't appear in the exact same
    // instant as your own message — makes it read like a real chat
    // rather than an obviously scripted instant-echo.
    setTimeout(() => pushMessage("bot", replyText), 500);
  };

  const handleQuickReply = (quickReply) => {
    pushMessage("user", quickReply.label);
    respondAsBot(quickReply.label);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    pushMessage("user", text);
    respondAsBot(text);
    setInputValue("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] overflow-hidden shrink-0">
            <img src={chatBotAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
          </span>
          <span>
            <span className="block text-[17px] font-bold text-[#151517]">Cuvva Support Bot</span>
            <span className="block text-[13px] text-[#a5a5aa]">The team can also help</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center shrink-0"
        >
          <X size={17} className="text-[#151517]" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <p className="text-center text-[13px] text-[#a5a5aa] mb-4">{SUPPORT_HOURS_LINE}</p>

        <div className="flex items-start gap-2 rounded-2xl border border-[#e4e4e7] px-4 py-3.5 mb-4">
          <Info size={16} className="text-[#a5a5aa] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#8a8a8f] leading-relaxed">{AI_DISCLAIMER}</p>
        </div>

        {/* Bot's opening message — always shown first, matching the
            screenshot exactly, regardless of real history below it. */}
        <BotBubble
          avatarLabel="Cuvva Support Bot • AI Agent"
          text={"Hello 👋  How can we help?\nChoose an option below or type your message:"}
        />

        {/* Real saved conversation history (if any) renders here,
            in order, oldest first — bot on the left, user on the
            right, exactly matching chat3.jpeg's / chat45.jpeg's
            layout. */}
        {messages.map((m) =>
          m.sender === "bot" ? (
            <BotBubble key={m.id} text={m.text} />
          ) : (
            <UserBubble key={m.id} text={m.text} />
          ),
        )}

        {/* Quick-reply pills — only shown before the user has sent
            their first message, matching the reference screenshot
            (which shows them on a fresh conversation with no history
            yet). Once you've sent anything, they disappear so they
            don't clutter an ongoing conversation. */}
        {!hasSentAnyMessage && (
          <div className="flex flex-wrap gap-2 mt-2">
            {chatBotRepliesData.quickReplies.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleQuickReply(q)}
                className="rounded-full border border-[#6337d9] px-4 py-2.5 text-[14px] font-semibold text-[#6337d9] text-left"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Text-only input — attach/GIF/mic icons shown for visual
          fidelity but disabled (per instruction: "on the chat input
          field i want that i can only send text messages only no
          picture voice and anything else"). */}
      <div className="border-t border-[#f0f0f0] px-3 pt-3 pb-4">
        <div className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-4 py-2.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent text-[15px] text-[#151517] placeholder:text-[#a5a5aa] focus:outline-none"
          />
          <button type="button" disabled aria-label="Attach file (disabled)" className="opacity-40 cursor-not-allowed">
            <Paperclip size={18} className="text-[#151517]" />
          </button>
          <button type="button" disabled aria-label="Send a GIF (disabled)" className="opacity-40 cursor-not-allowed text-[11px] font-bold border border-[#151517] rounded px-1">
            GIF
          </button>
          <button type="button" disabled aria-label="Record voice message (disabled)" className="opacity-40 cursor-not-allowed">
            <Mic size={18} className="text-[#151517]" />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              inputValue.trim() ? "bg-[#6337d9]" : "bg-[#d4d4d8]"
            }`}
          >
            <ArrowUp size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BotBubble({ avatarLabel, text }) {
  return (
    <div className="mb-4">
      {avatarLabel && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] overflow-hidden shrink-0">
            <img src={chatBotAvatar} alt="" className="w-full h-full object-cover" draggable={false} />
          </span>
          <span className="text-[13px] font-semibold text-[#151517]">{avatarLabel}</span>
        </div>
      )}
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f5f5f3] px-4 py-3">
        <p className="text-[15px] text-[#151517] leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="mb-4 flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#6337d9] px-4 py-3">
        <p className="text-[15px] text-white leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ARTICLE — chat4-13.jpeg (shared renderer for all 3 non-terms help   */
/* articles: vehicle-photo, contact-support, vehicle-modifications)    */
/* ------------------------------------------------------------------ */

function ArticleScreen({ articleId, onClose }) {
  const article = chatHelpArticlesData.articles[articleId];
  if (!article) return null;

  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-10 flex justify-end px-4 pt-4 pb-2 bg-white/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-11 h-11 rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)] flex items-center justify-center"
        >
          <X size={26} className="text-[#151517]" />
        </button>
      </div>

      <div className="px-6">
        <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] text-[#151517]">
          {article.title}
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[#5c5c61]">{article.subtitle}</p>
        <p className="mt-4 text-[14px] text-[#a5a5aa]">{article.date}</p>

        <div className="mt-6 space-y-5">
          {article.sections.map((section, sIdx) => (
            <section key={sIdx}>
              {section.heading && (
                <h2 className="text-[19px] font-extrabold text-[#151517] mb-2.5">
                  {section.heading}
                </h2>
              )}
              <div className="space-y-3">
                {section.content.map((block, bIdx) => (
                  <ArticleBlock key={bIdx} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl bg-[#f3f3f3] px-5 py-8 text-center">
          <p className="text-[16px] text-[#5d6065]">Did this answer your question?</p>
          <div className="mt-4 flex justify-center gap-6 text-[28px]">
            <button type="button" aria-label="Not helpful">😞</button>
            <button type="button" aria-label="Partly helpful">😐</button>
            <button type="button" aria-label="Helpful">😀</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ArticleBlock({ block }) {
  switch (block.type) {
    case "p":
      return <p className="text-[16px] text-[#151517] leading-relaxed">{renderWithEmailLinks(block.text)}</p>;

    case "list":
      return (
        <ul className="list-disc pl-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[16px] text-[#151517] leading-relaxed">
              {renderWithBoldLead(item)}
            </li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal pl-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[16px] text-[#151517] leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );

    case "labelledList":
      return (
        <p className="text-[16px] text-[#151517] leading-relaxed">
          {block.items.map((item, i) => (
            <span key={i}>
              <strong>{item.label}</strong> - {item.text}
              {i !== block.items.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );

    case "calloutBox":
      return (
        <div className="rounded-2xl bg-[#f3f3f3] px-4 py-4">
          <p className="text-[15px] text-[#151517] leading-relaxed">
            Want to chat to customer support? Just tap the speech bubble in the corner of the screen on the
            app or website. Support hours are <strong>9am to 9pm from Monday to Saturday, and 9am to 6pm on
            Sundays</strong>.
          </p>
        </div>
      );

    case "image":
      return (
        <figure className="pt-2">
          {block.caption && (
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1ecff] px-3 py-1.5 text-[13px] font-semibold text-[#6337d9]">
              🚙 {block.caption}
            </span>
          )}
          <img src={block.src} alt={block.caption || ""} className="w-full rounded-xl" draggable={false} />
        </figure>
      );

    case "divider":
      return <div className="border-t border-[#e4e4e7] pt-1" />;

    default:
      return null;
  }
}

/**
 * Bold-leading-phrase renderer for list items like "Take it from the
 * front of the car. This gives us..." where the first sentence (up to
 * the period) is bold in the reference screenshot, and the rest is
 * plain body text.
 */
function renderWithBoldLead(text) {
  const match = text.match(/^([^.]+\.)(\s*)(.*)$/s);
  if (!match) return text;
  const [, boldPart, space, rest] = match;
  return (
    <>
      <strong>{boldPart}</strong>
      {space}
      {rest}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* TERMS — chat14-44.jpeg (reuses the SAME termsData.json already      */
/* built for TermsPage.jsx — identical document, just a different      */
/* renderer wrapper matching this overlay's header style).             */
/* ------------------------------------------------------------------ */

function TermsScreen({ onClose }) {
  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-10 flex justify-end px-4 pt-4 pb-2 bg-white/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-11 h-11 rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)] flex items-center justify-center"
        >
          <X size={26} className="text-[#151517]" />
        </button>
      </div>

      <div className="px-6">
        <h1 className="mt-4 text-[30px] font-extrabold leading-[1.1] text-[#151517]">
          Cuvva&rsquo;s terms and conditions
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[#5c5c61]">
          Here&rsquo;s everything you need to know about our Ts&amp;Cs
        </p>
        <p className="mt-4 text-[14px] text-[#a5a5aa]">June 25, 2026</p>

        <div className="mt-6 space-y-5">
          {termsData.sections.map((section, idx) => (
            <section key={idx}>
              {section.heading && (
                <h2 className="text-[19px] font-extrabold text-[#151517] mb-2.5">{section.heading}</h2>
              )}
              <div className="space-y-3">
                {section.content.map((block, bIdx) => (
                  <TermsBlock key={bIdx} block={block} />
                ))}
              </div>
            </section>
          ))}

          {termsData.version && (
            <p className="text-[13px] text-[#a5a5aa] pt-4 border-t border-black/5">{termsData.version}</p>
          )}
        </div>

        <section className="mt-10 rounded-3xl bg-[#f3f3f3] px-5 py-8 text-center">
          <p className="text-[16px] text-[#5d6065]">Did this answer your question?</p>
          <div className="mt-4 flex justify-center gap-6 text-[28px]">
            <button type="button" aria-label="Not helpful">😞</button>
            <button type="button" aria-label="Partly helpful">😐</button>
            <button type="button" aria-label="Helpful">😀</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function TermsBlock({ block }) {
  switch (block.type) {
    case "p":
      return <p className="text-[16px] text-[#151517] leading-relaxed">{renderWithEmailLinks(block.text)}</p>;
    case "list":
      return (
        <ul className="list-disc pl-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[16px] text-[#151517] leading-relaxed">
              {renderWithEmailLinks(item)}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/**
 * Splits paragraph/list-item text on email addresses and renders them
 * in a muted grey-blue, same convention already established in
 * TermsPage.jsx / FonPage.jsx / PrivacyPolicyPage.jsx.
 */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function renderWithEmailLinks(text) {
  const parts = text.split(new RegExp(`(${EMAIL_PATTERN.source})`, "g"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    EMAIL_PATTERN.test(part) ? (
      <span key={i} className="text-[#8a8a8f]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/** Cuvva wordmark for the hub's dark header — white on the purple/navy gradient. */
function CuvvaWordmark({ className }) {
  return (
    <svg viewBox="0 0 140 32" fill="none" className={className}>
      <circle cx="15" cy="16" r="13" fill="currentColor" />
      <rect x="3" y="14.5" width="24" height="4.5" fill="#1c0839" />
      <text x="34" y="24" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="24" fill="currentColor" letterSpacing="-0.5">
        Cuvva
      </text>
    </svg>
  );
}
