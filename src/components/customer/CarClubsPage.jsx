import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, MessageCircleQuestion, Sparkles, Camera, ChevronRight, Plus } from "lucide-react";
import carClubsData from "../../data/carClubsData.json";
import { getJoinedCarClubIds } from "../../utils/profileLocalStorage";
import shareCarIllustration from "/car-club-share-illustration.png";

/**
 * frontend/src/components/customer/CarClubsPage.jsx
 *
 * "Car clubs" tab — matches carclubs1.jpeg/carclubs2.jpeg/carclubs3.jpeg
 * (all three are ONE scrollable page) plus afterjointhegroup1.jpeg/
 * afterjointhegroup2.GIF (the same page's "already joined a club"
 * variant). Layout, top to bottom:
 *
 *   1. Header — "Car clubs" title, Info + Help circular buttons
 *      top-right (both are placeholder taps for now, out of scope
 *      this pass per instruction).
 *   2. EITHER (mutually exclusive, decided by localStorage):
 *      - "Share your car" hero card (illustration, "Create your Cuvva
 *        car club" button, "How it works" link) — shown ONLY when the
 *        user has joined/created zero clubs. Tapping the button opens
 *        CreateCarClubPage.jsx (currently gated behind a "can't create
 *        yet" info modal per instruction — out of scope building the
 *        real create flow this pass, but the info-only "type of club"
 *        screen itself IS built, matching createcarclub1.jpeg).
 *      OR
 *      - "Your clubs" section — one row per club the user has joined,
 *        plus a "+ Create car club" pill row (opens the same
 *        CreateCarClubPage.jsx). Matches afterjointhegroup1.jpeg
 *        exactly.
 *   3. "Your cars" — the same blurred-hero-photo + "Add car photo"
 *      button + Toyota Aygo row seen in carclubs2.jpeg/carclubs3.jpeg.
 *      Tapping the car row/photo is OUT OF SCOPE this pass (explicitly
 *      deferred) — currently a no-op placeholder.
 *   4. "Local clubs" — every club from carClubsData.json's "clubs"
 *      list EXCEPT ones already joined (matches carclubs1.jpeg /
 *      afterjointhegroup1.jpeg, where "Macks Car Club" moves from
 *      "Local clubs" into "Your clubs" once joined, and Virk/Faisal's/
 *      Ashok's/Vasile's/Mohammed's remain in "Local clubs"). Tapping
 *      any row navigates to CarClubDetailPage.jsx, which shows the
 *      join1.jpeg "Join the club" sheet first if not yet joined.
 *   5. "Clubs are shown based on your residential address at IG11
 *      9XY" — static caption, matches the reference (the postcode
 *      itself is hardcoded/placeholder — no real address lookup
 *      wired here, out of scope).
 *   6. "Tips and resources" — matches carclubs3.jpeg. Tapping any row
 *      is OUT OF SCOPE this pass (explicitly deferred) — placeholder
 *      taps only.
 *
 * MEMBER COUNT INCREMENTS ON JOIN: per instruction, joining a club
 * bumps its displayed member count by 1 locally (e.g. Virk's 84 ->
 * 85) for as long as this browser's localStorage says the user has
 * joined it. This is purely a display illusion — there's no real
 * backend member count anywhere (no car-club schema exists at all),
 * so this is intentionally simple rather than trying to fake a live
 * multi-user count.
 *
 * ALL CAR/AVATAR PHOTOS ARE HARDCODED UNSPLASH/PRAVATAR URLS baked
 * directly into carClubsData.json — per instruction, NOT using
 * Unsplash's randomizing endpoint (which rotates images over time),
 * so the same club always shows the same car photo and the same
 * members always show the same faces, indefinitely.
 */
export default function CarClubsPage() {
  const navigate = useNavigate();
  const [joinedIds, setJoinedIds] = useState([]);

  // Re-read localStorage every time this page mounts (e.g. navigating
  // back here after joining a club elsewhere) so the "Your clubs" /
  // "Share your car" split always reflects the latest state.
  useEffect(() => {
    setJoinedIds(getJoinedCarClubIds());
  }, []);

  const joinedClubs = useMemo(
    () => carClubsData.clubs.filter((c) => joinedIds.includes(c.id)),
    [joinedIds],
  );
  const localClubs = useMemo(
    () => carClubsData.clubs.filter((c) => !joinedIds.includes(c.id)),
    [joinedIds],
  );
  const hasAnyClub = joinedClubs.length > 0;

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[18px] font-bold">Car clubs</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleNotWiredUp("Info")}
            aria-label="Info"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <Info size={17} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => handleNotWiredUp("Help")}
            aria-label="Help"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <MessageCircleQuestion size={17} className="text-white" />
          </button>
        </div>
      </div>

      {hasAnyClub ? (
        <>
          {/* "Your clubs" — matches afterjointhegroup1.jpeg */}
          <h2 className="text-[26px] font-extrabold tracking-tight px-4 pt-5">Car clubs</h2>
          <p className="text-[13px] text-[#9497a1] px-4 pt-4 pb-2">Your clubs</p>
          <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
            {joinedClubs.map((club, i) => (
              <ClubRow
                key={club.id}
                club={club}
                memberCount={club.baseMemberCount + 1}
                onClick={() => navigate(`/customer/car-clubs/${club.id}`)}
                isLast={i === joinedClubs.length - 1}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/customer/car-clubs/create")}
            className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-2 py-4 px-5 rounded-full bg-[#17181c] border border-white/5"
          >
            <Plus size={18} className="text-[#7c6bff]" />
            <span className="text-[15px] font-semibold text-[#7c6bff]">Create car club</span>
          </button>
        </>
      ) : (
        /* "Share your car" hero card — matches carclubs2.jpeg */
        <div className="mx-4 mt-5 rounded-3xl bg-[#17181c] border border-white/5 px-5 pt-6 pb-6 flex flex-col items-center text-center">
          <img
            src={shareCarIllustration}
            alt=""
            className="w-[190px] h-auto select-none pointer-events-none"
            draggable={false}
          />
          <h2 className="text-[22px] font-extrabold text-white mt-2">Share your car</h2>
          <p className="text-[14px] text-[#9497a1] leading-relaxed mt-2">
            Start a car club for your friends, family, neighbours or co-workers. Help people get around.
          </p>
          <button
            type="button"
            onClick={() => navigate("/customer/car-clubs/create")}
            className="w-full mt-5 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
          >
            Create your Cuvva car club
          </button>
          <button
            type="button"
            onClick={() => handleNotWiredUp("How it works")}
            className="mt-3 text-[14px] font-semibold text-[#7c6bff]"
          >
            How it works
          </button>
        </div>
      )}

      {/* "Your cars" — matches carclubs2.jpeg/carclubs3.jpeg. Tapping
          the photo/row is explicitly out of scope this pass. */}
      <p className="text-[13px] text-[#9497a1] px-4 pt-6 pb-2">Your cars</p>
      <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => handleNotWiredUp("Add car photo")}
          className="relative w-full h-[190px] block overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=60"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(18px) saturate(1.4)" }}
            draggable={false}
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-3 rounded-full bg-white/95 whitespace-nowrap">
            <Camera size={16} className="text-black" />
            <span className="text-[14px] font-bold text-black">Add car photo</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleNotWiredUp("Toyota Aygo")}
          className="w-full flex items-center gap-3 px-4 py-4"
        >
          <span className="w-10 h-10 rounded-xl bg-[#242429] flex items-center justify-center shrink-0">
            <ToyotaLogo />
          </span>
          <span className="flex-1 min-w-0 text-left">
            <span className="block text-[15px] font-semibold text-white">Toyota Aygo</span>
            <span className="block text-[13px] text-[#9497a1] mt-0.5">LR06 NCE</span>
          </span>
          <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
        </button>
        {!hasAnyClub && (
          <>
            <div className="border-t border-white/5 px-4 py-4 flex items-center justify-between">
              <span className="text-[14px] text-[#9497a1]">Next step</span>
              <span className="text-[15px] font-bold text-white">Set price per hour/day</span>
            </div>
            <div className="px-4 pb-4">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-[#5c5e68]" style={{ width: "18%" }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* "Local clubs" — matches carclubs1.jpeg / afterjointhegroup1.jpeg */}
      {localClubs.length > 0 && (
        <>
          <p className="text-[13px] text-[#9497a1] px-4 pt-6 pb-2">Local clubs</p>
          <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
            {localClubs.map((club, i) => (
              <ClubRow
                key={club.id}
                club={club}
                memberCount={club.baseMemberCount}
                onClick={() => navigate(`/customer/car-clubs/${club.id}`)}
                isLast={i === localClubs.length - 1}
              />
            ))}
          </div>
          <p className="text-[13px] text-[#9497a1] px-4 pt-4">
            Clubs are shown based on your residential address at IG11 9XY.
          </p>
        </>
      )}

      {/* "Tips and resources" — matches carclubs3.jpeg. Tapping any
          row is explicitly out of scope this pass. */}
      <p className="text-[13px] text-[#9497a1] px-4 pt-6 pb-2">Tips and resources</p>
      <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        {carClubsData.tips.map((tip, i) => (
          <button
            key={tip.id}
            type="button"
            onClick={() => handleNotWiredUp(tip.title)}
            className={`w-full flex items-center gap-3 px-4 py-4 ${
              i !== carClubsData.tips.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <img
              src={tip.image}
              alt=""
              className="w-12 h-12 rounded-xl object-cover shrink-0"
              draggable={false}
            />
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-[15px] font-semibold text-white">{tip.title}</span>
              <span className="block text-[13px] text-[#9497a1] mt-0.5 leading-snug">
                {tip.subtitle}
              </span>
            </span>
            <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleNotWiredUp("All car sharing resources")}
          className="w-full flex items-center justify-between px-4 py-4 border-t border-white/5"
        >
          <span className="text-[15px] font-semibold text-white">All car sharing resources</span>
          <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
        </button>
      </div>
    </div>
  );
}

/** Single tappable club row — matches every "Local clubs"/"Your clubs" row. */
function ClubRow({ club, memberCount, onClick, isLast }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      {club.avatarType === "photo" ? (
        <img
          src={club.clubPhoto}
          alt=""
          className="w-11 h-11 rounded-xl object-cover shrink-0"
          draggable={false}
        />
      ) : (
        <span
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-[15px] font-extrabold text-white"
          style={{ backgroundColor: club.avatarColor }}
        >
          {club.initials}
        </span>
      )}
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[15px] font-semibold text-white">{club.name}</span>
        <span className="block text-[13px] text-[#9497a1] mt-0.5">{club.distance}</span>
        {club.isNew ? (
          <span className="flex items-center gap-1 mt-1">
            <Sparkles size={12} className="text-[#7c6bff]" />
            <span className="text-[13px] font-semibold text-[#7c6bff]">New</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 mt-1.5">
            <span className="flex -space-x-1.5">
              {club.memberAvatarsBeforeJoin.slice(0, 3).map((avatar, idx) =>
                avatar ? (
                  <img
                    key={idx}
                    src={avatar}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover border border-black"
                    draggable={false}
                  />
                ) : (
                  <span
                    key={idx}
                    className="w-4 h-4 rounded-full bg-[#3a3b40] border border-black"
                  />
                ),
              )}
            </span>
            <span className="text-[13px] text-[#9497a1]">{memberCount} members</span>
          </span>
        )}
      </span>
      <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
    </button>
  );
}

/** Simple Toyota rings logo, matches the reference's small purple icon. */
function ToyotaLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="24" rx="20" ry="20" fill="none" stroke="#7c6bff" strokeWidth="2.5" />
      <ellipse cx="24" cy="24" rx="7" ry="16" fill="none" stroke="#7c6bff" strokeWidth="2.5" />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke="#7c6bff" strokeWidth="2.5" />
    </svg>
  );
}
