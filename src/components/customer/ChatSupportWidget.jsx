import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import cuvvaLogo from "/cuvva-logo-white.png"; 
import chatBotRepliesData from "../../data/chatBotRepliesData.json";
import chatHelpArticlesData from "../../data/chatHelpArticlesData.json";
import termsData from "../../data/termsData.json";
import {
  getChatMessages,
  addChatMessage,
  getRelativeTimeLabel,
} from "../../utils/chatLocalStorage";

const SUPPORT_HOURS_LINE = "We're here 9am - 9pm Mon - Sat and 9am - 6pm on Sundays";
const AI_DISCLAIMER =
  "Our support combines human expertise with AI assistance. Please note that AI responses may not always be 100% accurate or complete. For definitive information, refer to our policy documents or speak directly with one of our human agents. AI-provided guidance is not formal advice, and we do not take responsibility for any information not provided by a human representative. For details on how your personal data is processed, please see our privacy notice.";

const HELP_ARTICLES = [
  { id: "vehicle-photo", title: "Taking a vehicle photo for your Cuvva policy" },
  { id: "contact-support", title: "How to contact customer support or leave feedback" },
  { id: "vehicle-modifications", title: "Vehicle modifications" },
  { id: "terms", title: "Cuvva's terms and conditions" },
];

export default function ChatSupportWidget({ onClose, customerFirstName = "there" }) {
  const navigate = useNavigate(); 
  const [screen, setScreen] = useState("hub");
  const [activeArticleId, setActiveArticleId] = useState(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1); 
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white text-[#151517] overflow-y-auto">
      {screen === "hub" && (
        <HubScreen
          customerFirstName={customerFirstName}
          onClose={handleClose}
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
          onClose={handleClose}
          onOpenConversation={() => setScreen("conversation")}
        />
      )}

      {screen === "conversation" && (
        <ConversationScreen onClose={handleClose} />
      )}

      {screen === "article" && activeArticleId && (
        <ArticleScreen
          articleId={activeArticleId}
          onClose={handleClose}
        />
      )}

      {screen === "terms" && <TermsScreen onClose={handleClose} />}
    </div>
  );
}

function HubScreen({ customerFirstName, onClose, onOpenMessages, onOpenConversation, onOpenArticle }) {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_ARTICLES;
    return HELP_ARTICLES.filter((a) => a.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen">

      <div
        className="px-5 pb-10 pt-5"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #1c0839 45%, #1c0839 75%, #57456a 100%)",
        }}
      >
        <div className="flex items-center justify-between">
        
          <img src={cuvvaLogo} alt="Cuvva" className="h-6 w-auto" draggable={false} />
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

function MessagesListScreen({ onBack, onClose, onOpenConversation }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stored = getChatMessages();
    setMessages(Array.isArray(stored) ? stored : []);
  }, []);

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
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

function ConversationScreen({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const stored = getChatMessages();
    setMessages(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const pushMessage = (sender, text) => {
    const message = { id: `${Date.now()}-${sender}`, sender, text, timestamp: Date.now() };
    const updated = addChatMessage(message);
    setMessages(Array.isArray(updated) ? updated : [message]);
    return message;
  };

  const respondAsBot = (userText) => {

    const matchedQuickReply = chatBotRepliesData?.quickReplies?.find(
      (q) => q.label.toLowerCase() === userText.trim().toLowerCase(),
    );
    const fallbacks = chatBotRepliesData?.fallbackReplies || ["Sorry, I'm having trouble understanding right now."];
    const replyText = matchedQuickReply
      ? matchedQuickReply.reply
      : fallbacks[Math.floor(Math.random() * fallbacks.length)];

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

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <p className="text-center text-[13px] text-[#a5a5aa] mb-4">{SUPPORT_HOURS_LINE}</p>

        <div className="flex items-start gap-3.5 rounded-2xl border border-[#e4e4e7] px-4 py-3.5 mb-4">
          <Info size={16} className="text-[#a5a5aa] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#8a8a8f] leading-relaxed">{AI_DISCLAIMER}</p>
        </div>

        <BotBubble
          avatarLabel="Cuvva Support Bot 🤖 AI Agent"
          text={"Hello 👋  How can we help?\nChoose an option below or type your message:"}
        />

        {messages.map((m) =>
          m.sender === "bot" ? (
            <BotBubble key={m.id} text={m.text} />
          ) : (
            <UserBubble key={m.id} text={m.text} />
          ),
        )}

        {chatBotRepliesData?.quickReplies?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {chatBotRepliesData.quickReplies.map((q) => (
              <button
                key={q.id || q.label}
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

function ArticleScreen({ articleId, onClose }) {
  const article = chatHelpArticlesData?.articles?.[articleId];
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
            <button type="button" aria-label="Not helpful">👎</button>
            <button type="button" aria-label="Partly helpful">😬</button>
            <button type="button" aria-label="Helpful">👍</button>
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

    case "labeledList":
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
            Want to chat to customer support? Just tap the speech bubble in the corner of the
            screen on the app or website. Support hours are <strong>9am to 9pm from Monday to Saturday, and 9am to 6pm on
            Sundays</strong>.
          </p>
        </div>
      );

    case "image":
      return (
        <figure className="pt-2">
          {block.caption && (
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1ecff] px-3 py-1.5 text-[13px] font-semibold text-[#6337d9]">
              👍 {block.caption}
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

function renderWithBoldLead(text) {
  const match = text.match(/^([^\.]+\.)(\s*)(.*)$/s);
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
          Here&rsquo;s everything you need to know about our T&Cs
        </p>
        <p className="mt-4 text-[14px] text-[#a5a5aa]">June 25, 2026</p>

        <div className="mt-6 space-y-5">
          {termsData.sections.map((section, idx) => (
            <section key={idx}>
              {section.heading && (
                <h2 className="text-[19px] font-extrabold text-[#151517] mb-2.5">
                  {section.heading}
                </h2>
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
            <button type="button" aria-label="Not helpful">👎</button>
            <button type="button" aria-label="Partly helpful">😬</button>
            <button type="button" aria-label="Helpful">👍</button>
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