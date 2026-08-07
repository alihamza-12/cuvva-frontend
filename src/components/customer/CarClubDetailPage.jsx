import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MessageCircleQuestion,
  User,
  ChevronRight,
  MessageCircle,
  X,
} from "lucide-react";
import carClubsData from "../../data/carClubsData.json";
import {
  addJoinedCarClub,
  isCarClubJoined,
} from "../../utils/profileLocalStorage";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { generateClubMembers } from "../../utils/generateClubMembers";
import joinedIcon from "/car-club-joined-icon.png";

export default function CarClubDetailPage() {
  const navigate = useNavigate();
  const { clubId } = useParams();

  const club = carClubsData.clubs.find((item) => item.id === clubId);

  const { data: profileData } = useGetMyProfileQuery();

  const myName = profileData?.customer?.fullName || "You";
  const myPhoto = profileData?.customer?.profilePhotoUrl || null;

  /*
   * Important:
   * Read localStorage synchronously before the first render.
   * Do not initialise this as false and update it inside useEffect,
   * otherwise an already-joined club briefly shows the Join sheet.
   */
  const initialJoined = club ? isCarClubJoined(club.id) : false;

  const [alreadyJoined, setAlreadyJoined] = useState(
    () => initialJoined,
  );

  const [sheetStage, setSheetStage] = useState(
    () => (initialJoined ? "closed" : "join"),
  );

  const [showChatBlockedModal, setShowChatBlockedModal] = useState(false);

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-32 text-white bg-black">
        <p className="text-[15px] text-[#9497a1]">
          Club not found.
        </p>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/customer/car-clubs", { replace: true });
    }
  };

  const handleJoinTap = () => {
    addJoinedCarClub(club.id);
    setAlreadyJoined(true);
    setSheetStage("welcome");
  };

  const handleCloseWelcome = () => {
    setSheetStage("closed");
  };

  /*
   * Macks Car Club is currently the locally-created/demo club.
   * Real club creation is not connected to a backend schema yet.
   */
  const isOwnClub = club.id === "macks-car-club";

  const memberCount = alreadyJoined
    ? club.baseMemberCount + 1
    : club.baseMemberCount;

  /*
   * Generate the same complete deterministic member list each time.
   * One generated member slot is reserved for the admin.
   */
  const generatedMembers = useMemo(
    () =>
      generateClubMembers(
        club.id,
        Math.max(club.baseMemberCount - 1, 0),
      ),
    [club.id, club.baseMemberCount],
  );

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 transition-colors border rounded-full bg-white/5 border-white/10 hover:bg-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 transition-colors border rounded-full bg-white/5 border-white/10 hover:bg-white/10"
        >
          <MessageCircleQuestion
            size={18}
            className="text-white"
          />
        </button>
      </div>

      {/* Member count */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <span className="w-6 h-6 rounded-full bg-[#3a3b40] flex items-center justify-center">
          <User size={14} className="text-[#9497a1]" />
        </span>

        <span className="text-[15px] text-[#9497a1]">
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </span>
      </div>

      {/* Cars */}
      <p className="text-[13px] text-[#9497a1] px-4 pt-6 pb-2">
        Cars
      </p>

      <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() =>
            console.log("Car row tapped — not wired up yet.")
          }
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors"
        >
          <img
            src={club.carPhoto}
            alt=""
            className="object-cover w-11 h-11 rounded-xl shrink-0"
            draggable={false}
          />

          <span className="flex-1 min-w-0 text-left">
            <span className="block text-[15px] font-semibold text-white">
              {club.carOwnerName}&rsquo;s {club.carMake}
            </span>

            <span className="block text-[13px] text-[#9497a1] mt-0.5">
              {club.carPlate}
            </span>
          </span>

          <ChevronRight
            size={18}
            className="text-[#5c5e68] shrink-0"
          />
        </button>
      </div>

      {/* Members or Chat */}
      {alreadyJoined && (
        <>
          <p className="text-[13px] text-[#9497a1] px-4 pt-6 pb-2">
            {isOwnClub ? "Members" : "Chat"}
          </p>

          <div className="mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
            {isOwnClub ? (
              <>
                <MemberRow
                  name={club.adminName}
                  avatar={club.adminAvatar}
                  isLast={false}
                />

                <MemberRow
                  name={myName}
                  avatar={myPhoto}
                  subtitle="You"
                  isLast
                />
              </>
            ) : (
              <>
                {/* Logged-in user appears first without chat action */}
                <MemberRow
                  name={myName}
                  avatar={myPhoto}
                  subtitle="You"
                  isLast={false}
                />

                {/* Club admin */}
                <MemberRow
                  name={`${club.adminName} (Admin)`}
                  avatar={club.adminAvatar}
                  subtitle="Start a chat"
                  showChat
                  onClick={() =>
                    setShowChatBlockedModal(true)
                  }
                  isLast={generatedMembers.length === 0}
                />

                {/* Full deterministic member list */}
                {generatedMembers.map((member, index) => (
                  <MemberRow
                    key={`${club.id}-${member.name}-${index}`}
                    name={member.name}
                    avatar={member.avatar}
                    subtitle="Start a chat"
                    showChat
                    onClick={() =>
                      setShowChatBlockedModal(true)
                    }
                    isLast={
                      index === generatedMembers.length - 1
                    }
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* Join sheet */}
      {sheetStage === "join" && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <button
            type="button"
            aria-label="Close"
            onClick={handleBack}
            className="absolute inset-0 bg-black/70"
          />

          <div className="relative z-10 w-full bg-[#1b1c21] rounded-t-3xl px-5 pt-4 pb-8">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Close"
                className="flex items-center justify-center transition-colors rounded-full w-9 h-9 bg-white/5 hover:bg-white/10"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="flex flex-col items-center mt-1 text-center">
              <img
                src={club.carPhoto}
                alt=""
                className="object-cover w-16 h-16 mb-3 border-2 rounded-full border-white/10"
                draggable={false}
              />

              <h2 className="text-[20px] font-extrabold text-white">
                Join {club.name}
              </h2>

              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-2 px-4">
                Hop in to see more about vehicles in this club.
              </p>

              <button
                type="button"
                onClick={handleJoinTap}
                className="w-full mt-6 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
              >
                Join the club
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome sheet */}
      {sheetStage === "welcome" && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <button
            type="button"
            aria-label="Close"
            onClick={handleCloseWelcome}
            className="absolute inset-0 bg-black/70"
          />

          <div
            onClick={handleCloseWelcome}
            className="relative z-10 w-full bg-[#1b1c21] rounded-t-3xl px-5 pt-3 pb-8"
          >
            <div className="flex justify-center pb-3">
              <div className="h-1 rounded-full w-9 bg-white/20" />
            </div>

            <div className="flex flex-col items-center text-center">
              <img
                src={joinedIcon}
                alt=""
                className="w-20 h-20 mb-4"
                draggable={false}
              />

              <h2 className="text-[22px] font-extrabold text-white">
                You&rsquo;re in the club
              </h2>

              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-3 px-2">
                Welcome to {club.name}! You&rsquo;re now a member
                and can view cars in this club.
              </p>

              <p className="text-[14px] text-[#9497a1] leading-relaxed mt-3 px-2">
                If you&rsquo;re new to Cuvva, you&rsquo;ll
                automatically get £10 off your first trip. Your
                discount is valid for 3 months.
              </p>

              <button
                type="button"
                onClick={handleCloseWelcome}
                className="w-full mt-6 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white"
              >
                Let&rsquo;s go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat restriction modal */}
      {showChatBlockedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowChatBlockedModal(false)}
            className="absolute inset-0 bg-black/70"
          />

          <div className="relative w-full max-w-[320px] bg-[#1b1c21] rounded-3xl px-6 pt-6 pb-6 text-center">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowChatBlockedModal(false)}
                aria-label="Close"
                className="flex items-center justify-center w-8 h-8 -mt-1 -mr-1 transition-colors rounded-full bg-white/5 hover:bg-white/10"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="flex justify-center -mt-2">
              <span className="w-14 h-14 rounded-full bg-[#7c6bff]/15 flex items-center justify-center">
                <MessageCircle
                  size={26}
                  className="text-[#7c6bff]"
                />
              </span>
            </div>

            <h2 className="text-[18px] font-extrabold text-white mt-4">
              You can&rsquo;t start a chat yet
            </h2>

            <p className="text-[14px] text-[#9497a1] leading-relaxed mt-2">
              You just joined this club, so chat isn&rsquo;t
              available with this member right now. Try chatting
              again in a few hours.
            </p>

            <button
              type="button"
              onClick={() => setShowChatBlockedModal(false)}
              className="w-full mt-5 py-3.5 bg-[#242429] hover:bg-[#2c2c33] active:scale-[0.98] transition-all rounded-full text-[15px] font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberRow({
  name,
  avatar,
  subtitle,
  showChat = false,
  onClick,
  isLast = false,
}) {
  const initials = name
    .replace(" (Admin)", "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rowClassName = `w-full flex items-center gap-3 px-4 py-4 ${
    !isLast ? "border-b border-white/5" : ""
  }`;

  const rowContent = (
    <>
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="object-cover rounded-full w-9 h-9 shrink-0"
          draggable={false}
        />
      ) : (
        <span className="w-9 h-9 rounded-full bg-[#4a3aa8] flex items-center justify-center shrink-0 text-[12px] font-bold text-white">
          {initials}
        </span>
      )}

      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[15px] text-white truncate">
          {name}
        </span>

        {subtitle && (
          <span className="block text-[13px] text-[#9497a1] mt-0.5">
            {subtitle}
          </span>
        )}
      </span>

      {showChat && (
        <MessageCircle
          size={18}
          className="text-[#5c5e68] shrink-0"
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${rowClassName} hover:bg-white/[0.03] transition-colors`}
      >
        {rowContent}
      </button>
    );
  }

  return <div className={rowClassName}>{rowContent}</div>;
}