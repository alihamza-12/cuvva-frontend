import React from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user = { fullName: "Super Admin", role: "Super Admin" }, // Enforces a fallback structure if missing
  onLogout,
}) {
  // Menu configuration matrix with corrected domain semantic icon variables
  const menuItems = [
    { id: "overview", name: "Matrix Overview", icon: LayoutDashboard },
    { id: "accounts", name: "Account Controls", icon: Users },
    { id: "vehicles", name: "Vehicle Catalog", icon: Car },
    { id: "policies", name: "Policy Contracts", icon: Shield }, // Fixed: Swapped ShieldAlert for Shield
  ];

  // Automated operational helper to parse names dynamically into raw tracking initials
  const computeUserInitials = (nameString) => {
    if (!nameString) return "HQ";
    const fragments = nameString.trim().split(/\s+/);
    if (fragments.length === 1)
      return fragments[0].substring(0, 2).toUpperCase();
    return (fragments[0][0] + fragments[fragments.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* RESPONSIVE VIEWPORT CONTROL: Desktop Sidebar Container */}
      <aside className="hidden lg:flex w-64 bg-[#0d0f1d] border-r border-[#1e2238] flex-col justify-between p-6 h-screen sticky top-0 shrink-0 select-none z-50">
        <div className="space-y-8">
          {/* BRAND IDENTITY LOGO TILES */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-6 h-6 rounded-full bg-[#644aff] flex items-center justify-center font-black text-[10px] text-white">
              C
            </div>
            <span className="text-sm font-black tracking-widest text-white uppercase">
              CUVVA{" "}
              <span className="text-[10px] font-bold text-[#644aff] normal-case tracking-normal">
                hq
              </span>
            </span>
          </div>

          {/* DYNAMIC SECURITY PROFILE CARD CONTAINER */}
          <div className="p-3.5 bg-[#13172d]/60 border border-[#1e2238] rounded-xl flex items-center gap-3 transition-all duration-300 hover:border-white/10">
            <div className="w-9 h-9 bg-[#644aff]/10 border border-[#644aff]/30 text-[#644aff] rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform tracking-wider">
              {computeUserInitials(user?.fullName)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold tracking-wide text-white truncate">
                {user?.fullName || "Administrative Node"}
              </h4>
              <p className="text-[9px] text-purple-400 font-bold tracking-widest uppercase mt-0.5 truncate">
                {user?.role || "Root Console"}
              </p>
            </div>
          </div>

          {/* CONTROL SWITCHBOARD BUTTON SCHEDULER LINKS */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-[#644aff] text-white shadow-lg shadow-[#644aff]/15 border-l-2 border-white"
                      : "text-[#6b7280] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      isSelected ? "text-white animate-pulse" : "text-[#6b7280]"
                    }
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* SYSTEM SHUTDOWN DE-PROVISIONING FOOTER BUTTON */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold text-[#ef4444] hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-200 group mt-auto"
        >
          <LogOut
            size={14}
            className="text-[#ef4444] group-hover:translate-x-0.5 transition-transform"
          />
          <span>Terminate Session</span>
        </button>
      </aside>

      {/* MOBILE RESPONSIVE NAVIGATION HEADER TOOLBAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0f1d] border-t border-[#1e2238] flex items-center justify-around px-2 z-50 shadow-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isSelected ? "text-[#644aff]" : "text-[#6b7280]"
              }`}
            >
              <Icon size={16} />
              <span className="text-[8px] uppercase tracking-wider font-bold">
                {item.name.split(" ")[1] || item.name}
              </span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-red-400"
          title="Exit Portal"
        >
          <LogOut size={16} />
          <span className="text-[8px] uppercase tracking-wider font-bold">
            Exit
          </span>
        </button>
      </div>
    </>
  );
}
