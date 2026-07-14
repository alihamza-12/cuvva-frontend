import React from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * frontend/src/pages/customer/CarClubsPage.jsx
 *
 * "Car clubs" tab — one of the 4 main customer tabs, rendered inside
 * CustomerLayout.jsx (so CustomerBottomNav shows on this screen).
 *
 * This is currently a skeleton/placeholder page matching the exact
 * header pattern used in CustomerHome.jsx (dark background, bold title,
 * circular "..." button top-right, pb-32 bottom padding so content
 * never sits underneath the floating bottom nav). Add your real
 * car-clubs content/components below the header comment marker.
 */
export default function CarClubsPage() {
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

      {/* --- Add Car Clubs content/components below --- */}
      <div className="px-4 pt-5">
        <p className="text-[14px] text-[#9497a1]">
          Car clubs content goes here.
        </p>
      </div>
    </div>
  );
}
