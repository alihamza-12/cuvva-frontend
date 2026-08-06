import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Info,
  MessageCircleQuestion,
  Sparkles,
  Camera,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import carClubsData from "../../data/carClubsData.json";
import { getJoinedCarClubIds } from "../../utils/profileLocalStorage";
import shareCarIllustration from "/car-club-share-illustration.png";

export default function CarClubsPage() {
  const navigate = useNavigate();
  const [joinedIds, setJoinedIds] = useState([]);
  const [showCarError, setShowCarError] = useState(false);

  useEffect(() => {
    setJoinedIds(getJoinedCarClubIds());
  }, []);

  const joinedClubs = useMemo(
    () => carClubsData.clubs.filter((club) => joinedIds.includes(club.id)),
    [joinedIds],
  );

  const localClubs = useMemo(
    () => carClubsData.clubs.filter((club) => !joinedIds.includes(club.id)),
    [joinedIds],
  );

  const hasAnyClub = joinedClubs.length > 0;

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  const openCarError = () => {
    setShowCarError(true);
  };

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[18px] font-bold">Car clubs</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/customer/support")}
            aria-label="Info"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <Info size={17} className="text-white" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer/support")}
            aria-label="Help"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
          >
            <MessageCircleQuestion size={17} className="text-white" />
          </button>
        </div>
      </div>

      {hasAnyClub ? (
        <>
          <h2 className="px-4 pt-5 text-[26px] font-extrabold tracking-tight">
            Car clubs
          </h2>
          <p className="px-4 pb-2 pt-4 text-[13px] text-[#9497a1]">
            Your clubs
          </p>

          <div className="mx-4 overflow-hidden rounded-2xl border border-white/5 bg-[#17181c]">
            {joinedClubs.map((club, index) => (
              <ClubRow
                key={club.id}
                club={club}
                memberCount={club.baseMemberCount + 1}
                onClick={() => navigate(`/customer/car-clubs/${club.id}`)}
                isLast={index === joinedClubs.length - 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer/car-clubs/create")}
            className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-white/5 bg-[#17181c] px-5 py-4"
          >
            <Plus size={18} className="text-[#7c6bff]" />
            <span className="text-[15px] font-semibold text-[#7c6bff]">
              Create car club
            </span>
          </button>
        </>
      ) : (
        <div className="mx-4 mt-5 flex flex-col items-center rounded-3xl border border-white/5 bg-[#17181c] px-5 pb-6 pt-6 text-center">
          <img
            src={shareCarIllustration}
            alt=""
            className="h-auto w-[190px] select-none"
            draggable={false}
          />

          <h2 className="mt-2 text-[22px] font-extrabold text-white">
            Share your car
          </h2>

          <p className="mt-2 text-[14px] leading-relaxed text-[#9497a1]">
            Start a car club for your friends, family, neighbours or
            co-workers. Help people get around.
          </p>

          <button
            type="button"
            onClick={() => navigate("/customer/car-clubs/create")}
            className="mt-5 w-full rounded-full bg-[#7c6bff] py-4 text-[16px] font-bold text-white transition-all hover:bg-[#6c5ae8] active:scale-[0.98]"
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

      <p className="px-4 pb-2 pt-6 text-[13px] text-[#9497a1]">
        Your cars
      </p>

      <div className="mx-4 overflow-hidden rounded-2xl border border-white/5 bg-[#17181c]">
        <button
          type="button"
          onClick={openCarError}
          className="relative block h-[190px] w-full overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=60"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "blur(18px) saturate(1.4)" }}
            draggable={false}
          />

          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-5 py-3">
            <Camera size={16} className="text-black" />
            <span className="text-[14px] font-bold text-black">
              Add car photo
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openCarError}
          className="flex w-full items-center gap-3 px-4 py-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#242429]">
            <ToyotaLogo />
          </span>

          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[15px] font-semibold text-white">
              Toyota Aygo
            </span>
            <span className="mt-0.5 block text-[13px] text-[#9497a1]">
              LR06 NCE
            </span>
          </span>

          <ChevronRight size={18} className="shrink-0 text-[#5c5e68]" />
        </button>

        {!hasAnyClub && (
          <>
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-4">
              <span className="text-[14px] text-[#9497a1]">Next step</span>
              <span className="text-[15px] font-bold text-white">
                Set price per hour/day
              </span>
            </div>
            <div className="px-4 pb-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full w-[18%] rounded-full bg-[#5c5e68]"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {localClubs.length > 0 && (
        <>
          <p className="px-4 pb-2 pt-6 text-[13px] text-[#9497a1]">
            Local clubs
          </p>

          <div className="mx-4 overflow-hidden rounded-2xl border border-white/5 bg-[#17181c]">
            {localClubs.map((club, index) => (
              <ClubRow
                key={club.id}
                club={club}
                memberCount={club.baseMemberCount}
                onClick={() => navigate(`/customer/car-clubs/${club.id}`)}
                isLast={index === localClubs.length - 1}
              />
            ))}
          </div>

          <p className="px-4 pt-4 text-[13px] text-[#9497a1]">
            Clubs are shown based on your residential address at IG11 9XY.
          </p>
        </>
      )}

      {/* "Tips and resources" — ALL 4 rows now link to
          CarClubResourcePage.jsx, passing the tip's own id as the
          :resourceId route param. CarClubResourcePage.jsx already has
          matching content for all 3 real tip ids ("tips-sharing",
          "whats-covered", "choosing-charge") in its resourceContent
          map — no new content needed, just the navigation wiring.
          "All car sharing resources" has no distinct article of its
          own, so it opens the same "tips-sharing" article as a
          reasonable default landing page. */}
      <p className="px-4 pb-2 pt-6 text-[13px] text-[#9497a1]">
        Tips and resources
      </p>

      <div className="mx-4 overflow-hidden rounded-2xl border border-white/5 bg-[#17181c]">
        {carClubsData.tips.map((tip, index) => (
          <button
            key={tip.id}
            type="button"
            onClick={() => navigate(`/customer/car-clubs/resources/${tip.id}`)}
            className={`flex w-full items-center gap-3 px-4 py-4 ${
              index !== carClubsData.tips.length - 1
                ? "border-b border-white/5"
                : ""
            }`}
          >
            <img
              src={tip.image}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl object-cover"
              draggable={false}
            />

            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[15px] font-semibold text-white">
                {tip.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-[#9497a1]">
                {tip.subtitle}
              </span>
            </span>

            <ChevronRight size={18} className="shrink-0 text-[#5c5e68]" />
          </button>
        ))}

        <button
          type="button"
          onClick={() => navigate("/customer/car-clubs/resources/tips-sharing")}
          className="flex w-full items-center justify-between border-t border-white/5 px-4 py-4"
        >
          <span className="text-[15px] font-semibold text-white">
            All car sharing resources
          </span>
          <ChevronRight size={18} className="shrink-0 text-[#5c5e68]" />
        </button>
      </div>

      {showCarError && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Close error message"
            onClick={() => setShowCarError(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div className="relative w-full max-w-[330px] rounded-3xl border border-white/10 bg-[#1b1c21] px-6 py-6 text-center">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowCarError(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5"
            >
              <X size={17} className="text-white" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7c6bff]/15">
              <Camera size={25} className="text-[#7c6bff]" />
            </div>

            <h2 className="mt-4 text-[19px] font-extrabold text-white">
              Something went wrong
            </h2>

            <p className="mt-2 text-[14px] leading-relaxed text-[#9497a1]">
              We couldn&rsquo;t open your car details right now. Please try again
              later.
            </p>

            <button
              type="button"
              onClick={() => setShowCarError(false)}
              className="mt-5 w-full rounded-full bg-[#7c6bff] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-[#6c5ae8] active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClubRow({ club, memberCount, onClick, isLast }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03] ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      {club.avatarType === "photo" ? (
        <img
          src={club.clubPhoto}
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
          style={{ backgroundColor: club.avatarColor }}
        >
          {club.initials}
        </span>
      )}

      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold text-white">
          {club.name}
        </span>

        <span className="mt-0.5 block text-[13px] text-[#9497a1]">
          {club.distance}
        </span>

        {club.isNew ? (
          <span className="mt-1 flex items-center gap-1">
            <Sparkles size={12} className="text-[#7c6bff]" />
            <span className="text-[13px] font-semibold text-[#7c6bff]">
              New
            </span>
          </span>
        ) : (
          <span className="mt-1.5 flex items-center gap-1.5">
            <span className="flex -space-x-1.5">
              {club.memberAvatarsBeforeJoin.slice(0, 3).map((avatar, index) =>
                avatar ? (
                  <img
                    key={index}
                    src={avatar}
                    alt=""
                    className="h-4 w-4 rounded-full border border-black object-cover"
                    draggable={false}
                  />
                ) : (
                  <span
                    key={index}
                    className="h-4 w-4 rounded-full border border-black bg-[#3a3b40]"
                  />
                ),
              )}
            </span>

            <span className="text-[13px] text-[#9497a1]">
              {memberCount} members
            </span>
          </span>
        )}
      </span>

      <ChevronRight size={18} className="shrink-0 text-[#5c5e68]" />
    </button>
  );
}

function ToyotaLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <ellipse
        cx="24"
        cy="24"
        rx="20"
        ry="20"
        fill="none"
        stroke="#7c6bff"
        strokeWidth="2.5"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="7"
        ry="16"
        fill="none"
        stroke="#7c6bff"
        strokeWidth="2.5"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7"
        fill="none"
        stroke="#7c6bff"
        strokeWidth="2.5"
      />
    </svg>
  );
}
