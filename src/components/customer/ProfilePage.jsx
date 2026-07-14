import { useMemo } from "react";
import {
  MoreHorizontal,
  LogOut,
  ShieldCheck,
  Car,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/ProfilePage.jsx
 * Customer tab: Profile
 * Theme-faithful mobile UI (dark background, rounded cards/rows)
 */
export default function ProfilePage() {
  const { data, isLoading } = useGetMyProfileQuery();

  const name = data?.customer?.fullName || (isLoading ? "Loading..." : "");

  const stats = useMemo(
    () => [
      { id: "s1", icon: ShieldCheck, label: "Your policies", value: "—" },
      { id: "s2", icon: Car, label: "Vehicles", value: "—" },
      { id: "s3", icon: Settings, label: "Settings", value: "" },
    ],
    [],
  );

  const rows = useMemo(
    () => [
      { id: "r1", label: "Account details" },
      { id: "r2", label: "Saved vehicles" },
      { id: "r3", label: "Notification settings" },
    ],
    [],
  );

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

      {/* Profile summary card */}
      <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] border border-white/5 p-4">
        <p className="text-[14px] text-[#9497a1]">Signed in as</p>
        <p className="text-[18px] font-extrabold mt-1">{name}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
            Customer
          </span>
          <span className="text-[12px] px-2 py-1 rounded-full bg-white/5 text-[#c8c9d1]">
            Premium access
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="rounded-2xl bg-[#17181c] border border-white/5 px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-[#9a9aa3]" />
                <p className="text-[12px] text-[#9497a1] truncate">{s.label}</p>
              </div>
              <p className="text-[16px] font-extrabold mt-2">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Menu rows */}
      <div className="px-4 pt-4 space-y-3">
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            className="w-full rounded-2xl bg-[#17181c] border border-white/5 hover:bg-[#1d1e23] transition-colors px-4 py-4 flex items-center justify-between"
          >
            <p className="text-[15px] font-bold text-white">{r.label}</p>
            <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
          </button>
        ))}
      </div>

      {/* Logout button */}
      <div className="px-4 pt-4">
        <button
          type="button"
          className="w-full rounded-2xl bg-[#17181c] border border-white/5 hover:bg-[#1d1e23] transition-colors px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-[#9a9aa3]" />
            <p className="text-[15px] font-bold text-white">Log out</p>
          </div>
          <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
        </button>
      </div>
    </div>
  );
}
