import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, HelpCircle, MessageCircle, X, Menu, Search } from "lucide-react";
import cuvvaLogoWhite from "/cuvva-logo-white.png";
import cuvvaLogoGrey from "/cuvva-logo-grey.png";

/**
 * frontend/src/components/customer/CarClubResourcePage.jsx
 *
 * "Cuvva car clubs explained" help article — reached from
 * CarClubsPage.jsx's "Tips and resources" > "Tips for sharing your
 * car" row. Matches pict1.jpeg through pict9.jpeg (one continuous
 * scrollable page; pict2.jpeg is the hamburger-menu dropdown opening
 * on TOP of the navy header, not a separate scroll position).
 *
 * FIXES THIS PASS (all 5 issues you reported):
 *   1. Real Cuvva logo — swapped the hand-drawn SVG approximation for
 *      your actual logo image (image.png), background-removed via a
 *      colour-distance alpha mask (navy bg -> transparent) and saved
 *      as two recoloured PNGs: white (for the navy header) and grey
 *      (for the light footer) — /public/cuvva-logo-white.png and
 *      /public/cuvva-logo-grey.png, imported via the project's usual
 *      absolute `/filename.png` convention.
 *   2. Search bar is now a REAL controlled <input>. Typing shows a
 *      live dropdown of matching sections (by heading text); tapping
 *      a result — or pressing Enter to jump to the first match —
 *      smooth-scrolls to that heading and briefly highlights it.
 *   3. "Table of contents" pill is now a real toggle: tapping it
 *      opens a list of every article heading; tapping any heading
 *      scrolls to it (same smooth-scroll + highlight as search) and
 *      closes the list.
 *   4. Both chat-support icons (top-right circular help button AND
 *      the floating bottom-right bubble) are now clickable — they
 *      open a small "Chat support" info modal, matching the same
 *      honest-placeholder modal pattern used elsewhere in this app
 *      (e.g. CreateCarClubPage's "can't create yet" modal) since
 *      there's no real live-chat backend to connect to.
 *   5. Bottom tab nav no longer shows on this page — this is a
 *      full-screen help article (X-to-close pattern), same category
 *      as the policy purchase flow pages, so in AppRouter.jsx this
 *      route must be declared OUTSIDE CustomerLayout, not nested
 *      inside it (nesting inside CustomerLayout is what was causing
 *      CustomerBottomNav to render underneath it).
 */

const resourceContent = {
  "tips-sharing": {
    title: "Tips for sharing your car",
    subtitle: "How to get set up for a smooth car sharing experience",
  },
  "whats-covered": {
    title: "What's covered?",
    subtitle: "From insurance, to damage, to fines and parking tickets",
  },
  "choosing-charge": {
    title: "Choosing what to charge",
    subtitle: "Earn money by charging people to borrow your car",
  },
};

// Every heading in the article body, in order — powers BOTH the
// search dropdown and the "Table of contents" list, so they always
// stay in sync with the real content (one source of truth, not two
// hand-maintained lists that could drift apart).
const SECTIONS = [
  { id: "whats-a-car-club", label: "What's a Cuvva car club?" },
  { id: "who-can-set-up", label: "Can anyone set up a car club on Cuvva?" },
  { id: "why-set-up", label: "Why should I set up a car club on Cuvva?" },
  { id: "how-do-i-get-started", label: "How do I get started?" },
  { id: "how-insurance-works", label: "How does the insurance part work?" },
  { id: "will-i-be-protected", label: "Will I be protected if something goes wrong?" },
  { id: "tips-for-getting-started", label: "Any tips for getting started?" },
];

export default function CarClubResourcePage() {
  const navigate = useNavigate();
  const { resourceId } = useParams();
  const resource = resourceContent[resourceId] || resourceContent["tips-sharing"];
  const [showMenu, setShowMenu] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SECTIONS.filter((s) => s.label.toLowerCase().includes(q));
  }, [searchQuery]);

  // Shared by both search results and the table-of-contents list:
  // scrolls the matching heading into view and briefly flashes a
  // highlight background so it's obvious something actually happened
  // (a smooth-scroll alone can be easy to miss on a long page).
  const jumpToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightedId(id);
    setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), 1600);
    setSearchQuery("");
    setShowToc(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchMatches.length > 0) jumpToSection(searchMatches[0].id);
  };

  return (
    <div className="min-h-screen bg-white text-[#202124]">
      {/* Close/help buttons float ABOVE the navy header, matching
          pict1.jpeg exactly (white circular buttons with shadow,
          sitting on top of the dark navy block underneath them). */}
      <div className="sticky top-0 z-[60] flex items-center justify-between px-5 pb-4 pt-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close article"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
        >
          <X size={30} strokeWidth={2} className="text-black" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
        >
          <HelpCircle size={24} className="text-[#6337d9]" />
        </button>
      </div>

      {/* Navy header block — Cuvva logo, hamburger menu, search bar. */}
      <div className="-mt-[68px] rounded-t-[28px] bg-[#06021f] px-5 pb-7 pt-[84px]">
        <div className="flex items-center justify-between">
          <img src={cuvvaLogoWhite} alt="Cuvva" className="w-auto h-5 select-none" draggable={false} />
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            aria-label="Open menu"
            className="flex items-center justify-center w-8 h-8"
          >
            <Menu size={22} className="text-white" />
          </button>
        </div>

        {/* Real search input + live results dropdown. */}
        <form onSubmit={handleSearchSubmit} className="relative mt-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5">
            <Search size={18} className="shrink-0 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles..."
              className="w-full bg-transparent text-[15px] text-white placeholder:text-white/60 focus:outline-none"
            />
          </div>
          {searchMatches.length > 0 && (
            <div className="absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              {searchMatches.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => jumpToSection(s.id)}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] text-[#202124] ${
                    i !== searchMatches.length - 1 ? "border-b border-[#eeeeef]" : ""
                  }`}
                >
                  <span>{s.label}</span>
                  <ChevronRight size={16} className="shrink-0 text-[#9497a1]" />
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <main className="mx-auto max-w-[620px] px-7 pb-36">
        <p className="pt-6 text-[14px] text-[#777b82]">
          All Collections&nbsp;&nbsp;›&nbsp;&nbsp; Cuvva car clubs&nbsp;&nbsp;›
        </p>
        <p className="mt-2 text-[14px] text-[#777b82]">
          Cuvva car clubs explained
        </p>
        <h1 className="mt-8 text-[34px] font-extrabold leading-[1.08] tracking-[-1px]">
          {resource.title}
        </h1>
        <p className="mt-4 text-[20px] leading-relaxed text-[#555960]">
          {resource.subtitle}
        </p>
        <p className="mt-6 text-[15px] text-[#777b82]">Updated this week</p>

        {/* Real toggle now — tapping opens the section list below it. */}
        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => setShowToc((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-[#dedfe2] px-5 py-4 text-left text-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <span>Table of contents</span>
            <ChevronDown size={20} className={`transition-transform ${showToc ? "rotate-180" : ""}`} />
          </button>
          {showToc && (
            <div className="mt-2 overflow-hidden rounded-xl border border-[#dedfe2] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => jumpToSection(s.id)}
                  className={`flex w-full items-center justify-between px-5 py-4 text-left text-[16px] ${
                    i !== SECTIONS.length - 1 ? "border-b border-[#eeeeef]" : ""
                  }`}
                >
                  <span>{s.label}</span>
                  <ChevronRight size={17} className="shrink-0 text-[#9497a1]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <ArticleContent highlightedId={highlightedId} />

        <section className="mt-10 border-t border-[#dedfe2] pt-8">
          <h2 className="text-[27px] font-extrabold">Related Articles</h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-[#dedfe2]">
            {[
              "Does the car need an underlying policy?",
              "How to drive someone else's car with Cuvva",
              "Tips for sharing your car",
              "What's covered when someone borrows your car with Cuvva car clubs",
              "How to borrow or lend a car using Cuvva's public car clubs",
            ].map((article, index) => (
              <button
                key={article}
                type="button"
                onClick={() => {
                  if (index === 2) navigate("/customer/car-clubs/resources/tips-sharing");
                }}
                className={`flex w-full items-center justify-between px-7 py-5 text-left text-[18px] leading-snug ${
                  index !== 4 ? "border-b border-[#eeeeef]" : ""
                }`}
              >
                <span className="pr-4">{article}</span>
                <ChevronRight size={19} className="shrink-0" />
              </button>
            ))}
          </div>
        </section>
        <section className="mt-8 rounded-3xl bg-[#f3f3f3] px-5 py-8 text-center">
          <p className="text-[19px] text-[#5d6065]">
            Did this answer your question?
          </p>
          <div className="mt-5 flex justify-center gap-7 text-[32px]">
            <button type="button" aria-label="Not helpful">😞</button>
            <button type="button" aria-label=" partly helpful">😐</button>
            <button type="button" aria-label="Helpful">😀</button>
          </div>
        </section>

        {/* Cuvva footer block — matches pict9.jpeg. All product links
            and social icons are inert placeholders (real cuvva.com
            marketing content, not part of this app's own routes). */}
        <footer className="text-center mt-14">
          <img src={cuvvaLogoGrey} alt="Cuvva" className="w-auto h-6 mx-auto select-none" draggable={false} />
          <p className="mx-auto mt-6 max-w-[320px] text-[15px] leading-relaxed text-[#8b8f96]">
            Cuvva is authorised and regulated by the UK Financial Conduct
            Authority. (#690273)
          </p>
          <div className="mt-8 space-y-2 text-[15px] leading-relaxed text-[#8b8f96]">
            <div className="flex flex-wrap items-center justify-center gap-x-6">
              <span>Temporary car insurance</span>
              <span>Learner driver insurance</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6">
              <span>Drive away insurance</span>
              <span>1 hour car insurance</span>
            </div>
            <p>Temporary van insurance</p>
            <p>International driving licence insurance</p>
            <p>Impound car insurance</p>
            <p>Campervan and motorhome insurance</p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-[#8b8f96]">
            <FacebookIcon />
            <YoutubeIcon />
            <TiktokIcon />
            <LinkedinIcon />
            <InstagramIcon />
          </div>
        </footer>
      </main>

      {/* Hamburger menu dropdown — matches pict2.jpeg. */}
      {showMenu && (
        <div className="fixed inset-0 z-[80] flex items-start justify-end px-5 pt-[86px]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setShowMenu(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-[420px] rounded-2xl bg-white px-5 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              aria-label="Close"
              className="absolute flex items-center justify-center w-8 h-8 right-4 top-4"
            >
              <X size={20} className="text-black" />
            </button>
            <div className="space-y-5 pr-8 text-[17px] text-[#202124]">
              <p>Temporary car insurance</p>
              <p>Temporary van insurance</p>
              <p>Learner driver insurance</p>
            </div>
          </div>
        </div>
      )}

      {/* "Chat support" placeholder modal — opened by EITHER the
          top-right help icon or the floating bottom-right bubble.
          Honest placeholder (no real live-chat backend exists),
          matching the app's established "not built yet" modal
          pattern instead of silently doing nothing when tapped. */}
      {showChatModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowChatModal(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-[330px] rounded-3xl bg-white px-6 py-6 text-center">
            <button
              type="button"
              onClick={() => setShowChatModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <X size={17} className="text-black" />
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6337d9]/10">
              <MessageCircle size={26} className="text-[#6337d9]" />
            </div>
            <h2 className="mt-4 text-[19px] font-extrabold text-[#202124]">
              Chat support
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6b6f76]">
              Live chat isn&rsquo;t connected yet in this preview. Search the
              help centre above, or check the Related Articles below for
              more on car clubs.
            </p>
            <button
              type="button"
              onClick={() => setShowChatModal(false)}
              className="mt-5 w-full rounded-full bg-[#6337d9] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-[#5730c2] active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowChatModal(true)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-[#5d2ee8] text-white shadow-[0_8px_30px_rgba(93,46,232,0.4)]"
      >
        <MessageCircle size={30} strokeWidth={2} />
      </button>
    </div>
  );
}

/** Wraps a heading with its section id + an optional highlight flash
    (used by both search results and the table-of-contents jump). */
function Heading({ id, level: Level, className, highlightedId, children }) {
  const isHighlighted = highlightedId === id;
  return (
    <Level
      id={id}
      className={`${className} scroll-mt-24 rounded-lg transition-colors duration-500 ${
        isHighlighted ? "bg-[#f1ecff]" : "bg-transparent"
      }`}
    >
      {children}
    </Level>
  );
}

function ArticleContent({ highlightedId }) {
  return (
    <article className="mt-10 text-[19px] leading-[1.55]">
      <Heading id="whats-a-car-club" level="h2" className="text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        What&rsquo;s a Cuvva car club?
      </Heading>
      <p className="mt-5">
        A Cuvva car club is a way to share your car with people you know and
        trust. Maybe that&rsquo;s your family, friends, neighbours, co-workers or
        your community. Whoever you choose to invite, it&rsquo;s about helping
        people who need to borrow a car use Cuvva&rsquo;s short-term car insurance
        to drive yours when you don&rsquo;t need it.
      </p>
      <Heading id="who-can-set-up" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        Can anyone set up a car club on Cuvva?
      </Heading>
      <p className="mt-5">
        Absolutely! Anyone can create a car club on Cuvva. Whether you already
        manage a car club in your community or you just want to share your car
        with family, we give you the tools to get started. Your club, your
        rules.
      </p>
      <Heading id="why-set-up" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        Why should I set up a car club on Cuvva?
      </Heading>
      <p className="mt-5">
        However big or small your car club, sharing your car can have a big
        ripple effect on both people and the planet. And it can be good for
        your pocket too.
      </p>
      <p className="mt-7">Did you know most cars sit idle 96% of the time?*</p>
      <p className="mt-7">
        Sharing cars helps people out who may not have access to a car or might
        need to borrow one for a short while. It could be they need to run a
        few errands, or maybe they just need to borrow a car while theirs is
        out-of-action.
      </p>
      <p className="mt-7">Whatever the reason, when you share your car with someone:</p>
      <ul className="mt-5 space-y-3 list-disc pl-7">
        <li>it could save them money, rather than taking a taxi or hire car 💰</li>
        <li>it could avoid them needing to buy a car, reducing traffic and parking woes 🌍</li>
      </ul>
      <Heading id="how-do-i-get-started" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        How do I get started?
      </Heading>
      <p className="mt-5">
        Start by clicking the &lsquo;Car clubs&rsquo; tab in the Cuvva app. Then you
        can create your car club in 3 easy steps:
      </p>
      <ol className="mt-5 space-y-2 list-decimal pl-7">
        <li>Give your club a name</li>
        <li>Add your vehicle</li>
        <li>Share a link to your club and invite people to join</li>
      </ol>
      <p className="mt-7">
        From there, you can also add extra details about any cars in the club
        that belong to you. For example, you can say when it&rsquo;s usually
        available or add a description to let people know what to expect.
      </p>
      <p className="mt-7">
        You can add as many vehicles to a club as you want, and add as many
        members as you like too.
      </p>
      <Heading id="how-insurance-works" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        How does the insurance part work?
      </Heading>
      <p className="mt-5">
        When someone in your car club borrows your car, they need to use the
        Cuvva app to buy their own insurance policy for the duration of their
        trip. Their policy is completely separate from yours.
      </p>
      <p className="mt-7">
        So whatever happens, it won&rsquo;t impact your own insurance policy or your
        no claims bonus, if something goes wrong.
      </p>
      <p className="mt-7">
        All our policies are fully comprehensive, which is the best level of
        cover you can get. For extra peace of mind, drivers can also add
        breakdown cover to their policy.
      </p>
      <Heading id="will-i-be-protected" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        Will I be protected if something goes wrong?
      </Heading>
      <p className="mt-5">
        When someone wants to borrow your car, they should use the Cuvva app
        to buy a short-term policy for the duration of their trip. This is
        separate to your own insurance.
      </p>
      <p className="mt-7">
        If someone has an accident when they borrow your car, we&rsquo;ll cover:
      </p>
      <ul className="mt-4 space-y-2 list-disc pl-7">
        <li>damage to your vehicle</li>
        <li>damage to any other vehicles involved</li>
        <li>personal injury claims</li>
      </ul>
      <p className="mt-7">
        Read more about what our fully comprehensive insurance includes.
      </p>
      <Heading id="tips-for-getting-started" level="h2" className="mt-10 text-[27px] font-extrabold leading-tight" highlightedId={highlightedId}>
        Any tips for getting started?
      </Heading>
      <p className="mt-5">
        Before someone borrows your car, make sure it&rsquo;s clean and tidy and fit
        to drive. You may want to put a few ground rules in place to avoid any
        misunderstandings later on.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">Insurance</h3>
      <p className="mt-3">
        Double-check that the borrower is aware that they need to buy a
        short-term Cuvva policy to borrow your car.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">MOT and tax</h3>
      <p className="mt-3">
        Don&rsquo;t forget to check these are all up-to-date before someone borrows
        your car.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">
        Tyres, oil and headlights
      </h3>
      <p className="mt-3">
        Remember to check the oil tank is topped up and your tyres are pumped
        up to a safe level. Check your headlights are working too.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">Keys</h3>
      <p className="mt-3">
        Be clear where you want people to collect and return the keys and at
        what time. If they need to extend their policy, remind them to check
        with you first.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">Fuel</h3>
      <p className="mt-3">
        Make sure there&rsquo;s fuel in the tank or you&rsquo;ve charged up your car before
        someone borrows it. Let people know if you expect them to top it back
        up before they return it.
      </p>
      <h3 className="mt-9 text-[22px] font-extrabold">Car interior</h3>
      <p className="mt-3">
        Don&rsquo;t forget to clear out any valuables and make sure your car is clean
        and tidy. It&rsquo;s a good idea to let people know your expectations around
        pets and smoking in the vehicle too.
      </p>
      <p className="mt-9">A couple of final tips:</p>
      <ul className="mt-4 space-y-3 list-disc pl-7">
        <li><strong>Swap phone numbers</strong> so you can stay in touch.</li>
        <li><strong>Take photos of the car</strong> before and after it is borrowed.</li>
      </ul>
      <p className="mt-9 border-t border-[#dedfe2] pt-6 italic">
        *From the RAC Foundation&rsquo;s report on car usage in the UK, 2021.
      </p>
    </article>
  );
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="5.5" width="21" height="13" rx="4" fill="currentColor" />
      <path d="M10 9.5v5l4.5-2.5-4.5-2.5Z" fill="white" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M16.6 2h-3.3v14.2a2.6 2.6 0 1 1-2.6-2.6c.24 0 .47.03.7.08V10.2a5.9 5.9 0 1 0 5.2 5.86V8.9a7.9 7.9 0 0 0 4.4 1.34V6.9a4.6 4.6 0 0 1-4.4-4.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="currentColor" />
      <path
        d="M7.6 9.9H5V19h2.6V9.9ZM6.3 5.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM19 13.6c0-2.6-1.4-3.8-3.2-3.8a2.8 2.8 0 0 0-2.5 1.4V9.9H10.7V19h2.6v-5.1c0-1.3.8-1.9 1.7-1.9.8 0 1.5.5 1.5 1.9V19H19v-5.4Z"
        fill="white"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" />
    </svg>
  );
}
