import React from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * frontend/src/pages/customer/PoliciesPage.jsx
 *
 * "Policies" tab — one of the 4 main customer tabs, rendered inside
 * CustomerLayout.jsx (so CustomerBottomNav shows on this screen).
 *
 * Skeleton/placeholder page matching CustomerHome.jsx's header pattern.
 * This is the natural place to eventually list the customer's own
 * policies, reusing your existing "GET /api/policies/my" endpoint
 * (already used by CustomerHome.jsx's Buy Again section) — no new
 * backend route needed to build this out.
 */
export default function PoliciesPage() {
  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header — same pattern as CustomerHome.jsx */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">Policies</h1>
        <button
          type="button"
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center hover:bg-[#1d1e23] transition-colors"
        >
          <MoreHorizontal size={18} className="text-white" />
        </button>
      </div>

      {/* --- Add Policies list/components below --- */}
      <div className="px-4 pt-5">
        <p className="text-[14px] text-[#9497a1]">
          Your policies will appear here.
        </p>
      </div>
    </div>
  );
}
