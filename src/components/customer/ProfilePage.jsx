import React from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * frontend/src/pages/customer/ProfilePage.jsx
 *
 * "Profile" tab — one of the 4 main customer tabs, rendered inside
 * CustomerLayout.jsx (so CustomerBottomNav shows on this screen).
 *
 * Skeleton/placeholder page matching CustomerHome.jsx's header pattern.
 * Natural place for account details, saved vehicles, settings, logout,
 * etc. once you're ready to build it out.
 */
export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header — same pattern as CustomerHome.jsx */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">Profile</h1>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* --- Add Profile content/components below --- */}
      <div className="px-4 pt-5">
        <p className="text-[14px] text-[#9497a1]">Profile details go here.</p>
      </div>
    </div>
  );
}
