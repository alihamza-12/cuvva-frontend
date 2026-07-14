import { useMemo, useState } from "react";
import { MoreHorizontal, Heart, Search, ChevronRight } from "lucide-react";

/**
 * frontend/src/components/customer/CarClubsPage.jsx
 * Customer tab: Car clubs
 * Theme-faithful mobile UI (dark background, rounded cards, muted text)
 */
export default function CarClubsPage() {
  const [query, setQuery] = useState("");

  const clubs = useMemo(
    () =>
      [
        {
          id: "club-1",
          name: "Cuvva Community",
          tagline: "Local rides, shared events",
          members: "12k members",
        },
        {
          id: "club-2",
          name: "Daily Drivers",
          tagline: "Road tips & discounted extras",
          members: "8.3k members",
        },
        {
          id: "club-3",
          name: "New Drivers",
          tagline: "First policy help & guidance",
          members: "6.1k members",
        },
      ].filter((c) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q)
        );
      }),
    [query],
  );

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header — same pattern as CustomerHome.jsx */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">Car clubs</h1>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* Search row */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[#17181c] border border-white/5 px-4 py-3">
          <Search size={18} className="text-[#9a9aa3]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs"
            className="flex-1 bg-transparent outline-none text-[14px] text-white placeholder:text-[#6b6f7f]"
            aria-label="Search car clubs"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {clubs.map((club) => (
          <button
            key={club.id}
            type="button"
            className="w-full text-left rounded-2xl bg-[#17181c] border border-white/5 hover:bg-[#1d1e23] transition-colors px-4 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white truncate">
                  {club.name}
                </p>
                <p className="text-[13px] text-[#9497a1] mt-1 truncate">
                  {club.tagline}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
                    {club.members}
                  </span>
                  <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
                    Exclusive perks
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <Heart size={18} className="text-[#9a9aa3]" />
                <ChevronRight size={18} className="text-[#5c5e68]" />
              </div>
            </div>
          </button>
        ))}

        {!clubs.length && (
          <div className="pt-6">
            <p className="text-[14px] text-[#9497a1]">
              No clubs match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
