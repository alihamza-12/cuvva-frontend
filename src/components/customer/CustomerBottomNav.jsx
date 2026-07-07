import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Users, ShieldCheck, User } from "lucide-react";

/**
 * frontend/src/components/customer/CustomerBottomNav.jsx
 *
 * Fixed bottom tab bar for the customer mobile experience — rendered by
 * CustomerLayout.jsx around <Outlet />. All 4 tabs always show icon +
 * label; the active tab is highlighted purple, matching the reference
 * screenshot's floating pill nav.
 */
const TABS = [
  { id: "get-insured", label: "Get insured", icon: Search, path: "/customer" },
  { id: "car-clubs", label: "Car clubs", icon: Users, path: "/customer/car-clubs" },
  { id: "policies", label: "Policies", icon: ShieldCheck, path: "/customer/policies" },
  { id: "profile", label: "Profile", icon: User, path: "/customer/profile" },
];

export default function CustomerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/customer"
      ? location.pathname === "/customer"
      : location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 bg-[#1c1d22] border border-white/5 rounded-[28px] px-2 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-[20px] px-3.5 py-1.5 transition-all duration-200 ${
                active ? "bg-white/5" : ""
              }`}
            >
              <Icon
                size={19}
                className={active ? "text-[#7c6bff]" : "text-[#8b8d98]"}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={`text-[10.5px] font-semibold whitespace-nowrap ${
                  active ? "text-[#7c6bff]" : "text-[#8b8d98]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
