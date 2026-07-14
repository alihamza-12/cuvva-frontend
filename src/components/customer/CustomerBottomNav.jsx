import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Users, Shield, Zap, CircleUser } from "lucide-react";

/**
 * frontend/src/components/customer/CustomerBottomNav.jsx
 *
 * Pixel-matched to the reference screenshot:
 * - Floating dark pill bottom nav
 * - ICON ON TOP, LABEL UNDERNEATH (flex-col)
 * - 4 tabs exactly: Get insured / Car clubs / Policies / Profile
 * - Active tab: light pill bg #2a2a31 + purple #7c5bff icon & text
 * - Inactive: muted icon #9a9aa3, white label
 */

// Custom Policies icon to match the screenshot: shield with lightning bolt
const PoliciesIcon = ({ size = 22, active = false, className = "" }) => (
  <div
    className={`relative flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <Shield
      size={size}
      className={active ? "text-[#7c5bff]" : "text-[#9a9aa3]"}
      strokeWidth={2}
      fill={active ? "rgba(124,91,255,0.08)" : "none"}
    />
    <Zap
      size={Math.round(size * 0.48)}
      className={`absolute ${active ? "text-[#7c5bff]" : "text-[#9a9aa3]"}`}
      strokeWidth={2.5}
      fill={active ? "#7c5bff" : "none"}
      style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    />
  </div>
);

const TABS = [
  {
    id: "get-insured",
    label: "Get insured",
    path: "/customer",
    // lucide Search matches the screenshot magnifying glass
    Icon: Search,
  },
  {
    id: "car-clubs",
    label: "Car clubs",
    path: "/customer/car-clubs",
    Icon: Users,
  },
  {
    id: "policies",
    label: "Policies",
    path: "/customer/policies",
    // Use custom composite to get shield + lightning, exactly like screenshot
    Icon: PoliciesIcon,
    isCustom: true,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/customer/profile",
    // CircleUser gives you the user-in-circle from the screenshot
    Icon: CircleUser,
  },
];

export default function CustomerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/customer"
      ? location.pathname === "/customer"
      : location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-3 pointer-events-none safe-bottom">
      <nav
        className="
          pointer-events-auto
          flex flex-row items-center justify-between
          bg-[#18181c]
          border border-white/[0.06]
          rounded-full
          px-2 py-2
          shadow-[0_12px_40px_rgba(0,0,0,0.6)]
          w-full
          max-w-[420px]
          min-w-0
        "
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        role="tablist"
        aria-label="Customer navigation"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.path);
          const IconComp = tab.Icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigate(tab.path)}
              className={`
                flex flex-col items-center justify-center
                gap-1
                rounded-[24px]
                transition-all duration-200 ease-out
                shrink-0
                min-w-[68px]
                flex-1
                ${
                  active
                    ? "bg-[#2a2a31] px-4 py-2"
                    : "px-2 py-2 hover:bg-white/[0.035]"
                }
              `}
            >
              {/* ICON ON TOP */}
              <div className="flex items-center justify-center h-[22px]">
                {tab.isCustom ? (
                  <IconComp size={22} active={active} />
                ) : (
                  <IconComp
                    size={20}
                    strokeWidth={2.2}
                    className={active ? "text-[#7c5bff]" : "text-[#9a9aa3]"}
                    // fill the profile circle subtly when active, matches screenshot
                    fill={
                      active && tab.id === "profile"
                        ? "rgba(124,91,255,0.12)"
                        : "none"
                    }
                  />
                )}
              </div>

              {/* LABEL UNDER ICON - SMALL LIKE SCREENSHOT */}
              <span
                className={`
                  text-[11px] leading-none tracking-normal whitespace-nowrap
                  transition-colors duration-200
                  ${
                    active
                      ? "text-[#9370ff] font-semibold"
                      : "text-[#e8e8ec] font-medium"
                  }
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Safe area / hide scrollbar helper */}
      <style>{`
        .safe-bottom {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }
        @media (max-width: 380px) {
          nav button {
            min-width: 60px !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          nav button span {
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

/*
  // --- ALTERNATIVE ICON SWAPS if you want 100% lucide defaults ---
  // Policies: replace PoliciesIcon with:
  //   import { ShieldCheck } from "lucide-react"
  //   Icon: ShieldCheck
  //
  // Profile: for a plain user outline (no circle):
  //   import { User } from "lucide-react"
  //   Icon: User
  //
  // All labels stay exactly:
  //   "Get insured"
  //   "Car clubs"
  //   "Policies"
  //   "Profile"
*/
