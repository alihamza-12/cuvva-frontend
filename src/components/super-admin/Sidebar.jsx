import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  Shield,
  LogOut,
  MoreHorizontal,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user = { fullName: "Super Admin", role: "Super Admin" },
  onLogout,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "overview",
      name: "Matrix Overview",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      id: "accounts",
      name: "Account Controls",
      icon: Users,
      href: "/admin/dashboard?tab=accounts",
    },
    {
      id: "sub-admins",
      name: "Sub Admins",
      icon: Users,
      href: "/admin/dashboard?tab=sub-admins",
    },
    {
      id: "own-customers",
      name: "View own customers",
      icon: Users,
      href: "/admin/dashboard?tab=own-customers",
    },
    {
      id: "own-vehicles",
      name: "Own Vehicles",
      icon: Car,
      href: "/admin/dashboard?tab=own-vehicles",
    },
    {
      id: "own-policies",
      name: "Own Policies",
      icon: Shield,
      href: "/admin/dashboard?tab=own-policies",
    },
    {
      id: "vehicles",
      name: "Vehicle Catalog",
      icon: Car,
      href: "/admin/dashboard?tab=vehicles",
    },
    {
      id: "policies",
      name: "Policy Contracts",
      icon: Shield,
      href: "/admin/dashboard?tab=policies",
    },
    {
      id: "create-user",
      name: "Create user",
      icon: Users,
      href: "/admin/dashboard?tab=create-user",
    },
    {
      id: "create-policy",
      name: "Create Policey",
      icon: Shield,
      href: "/admin/dashboard?tab=create-policy",
    },
    {
      id: "create-vehicle",
      name: "Create Vehicle",
      icon: Car,
      href: "/admin/dashboard?tab=create-vehicle",
    },
  ];

  const phonePrimaryIdSet = new Set(["overview", "accounts", "vehicles", "policies"]);

  const phonePrimaryItems = menuItems.filter((item) =>
    phonePrimaryIdSet.has(item.id),
  );

  const phoneMoreItems = menuItems.filter(
    (item) => !phonePrimaryIdSet.has(item.id),
  );

  const phonePrimaryLabels = {
    overview: "Overview",
    accounts: "Accounts",
    vehicles: "Vehicles",
    policies: "Policies",
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const computeUserInitials = (nameString) => {
    if (!nameString) return "HQ";
    const fragments = nameString.trim().split(/\s+/);
    if (fragments.length === 1) {
      return fragments[0].substring(0, 2).toUpperCase();
    }
    return (
      (fragments[0] && fragments[0][0]) +
      (fragments[fragments.length - 1] && fragments[fragments.length - 1][0])
    ).toUpperCase();
  };

  const handleNavigate = (item) => {
    setActiveTab(item.id);
    navigate(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>

      <aside className="hidden lg:flex w-72 bg-[#0d0f1d] border-r border-[#1e2238] flex-col h-screen sticky top-0 shrink-0 select-none z-50 relative overflow-hidden">
        
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(100,74,255,0.22),transparent_55%),radial-gradient(700px_circle_at_70%_30%,rgba(255,59,87,0.14),transparent_45%)]" />

        <div className="relative flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4 space-y-8 scrollbar-thin scrollbar-thumb-[#2a2f4a]/60 scrollbar-track-transparent">
          
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-2xl bg-[#644aff] flex items-center justify-center font-black text-[11px] text-white shadow-[0_0_0_1px_rgba(100,74,255,0.35),0_10px_30px_rgba(100,74,255,0.18)]">
              C
            </div>
            <span className="text-sm font-black tracking-[0.2em] text-white uppercase">
              CUVVA{" "}
              <span className="text-[10px] font-bold text-[#644aff] normal-case tracking-[0.12em]">
                hq
              </span>
            </span>
          </div>

          <div className="p-4 bg-[#13172d]/55 border border-[#1e2238] rounded-2xl flex items-center gap-3 transition-all duration-300 hover:border-white/15 hover:bg-[#13172d]/65">
            <div className="w-10 h-10 bg-[#644aff]/10 border border-[#644aff]/30 text-[#b7a6ff] rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 tracking-wider">
              {computeUserInitials(user?.fullName)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold tracking-wide text-white truncate">
                {user?.fullName || "Administrative Node"}
              </h4>
              <p className="text-[9px] text-purple-300/90 font-bold tracking-widest uppercase mt-0.5 truncate">
                {user?.role || "Root Console"}
              </p>
            </div>
          </div>

          {(() => {
            const sections = [
              { title: "Overview", items: [menuItems[0]] },
              { title: "Management", items: menuItems.slice(1, 6) },
              { title: "Catalog", items: menuItems.slice(6, 8) },
              { title: "Create", items: menuItems.slice(8) },
            ];

            return sections.map((section, sIdx) => (
              <div key={section.title} className={sIdx === 0 ? "" : "pt-4"}>
                <div className="flex items-center gap-2 px-2 mb-2 cursor-pointer">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-[10px] uppercase tracking-widest text-[#8a8fbc] font-bold">
                    {section.title}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => navigate(item.href, { replace: true })}
                        className={`cursor-pointer group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-200 border border-transparent ${
                          isSelected
                            ? "bg-[#644aff] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_40px_rgba(100,74,255,0.25)] border-white/10"
                            : "text-[#6b7280] hover:bg-white/5 hover:text-white hover:border-white/10"
                        }`}
                      >
                        <span
                          className={`h-7 w-1.5 rounded-full ml-0.5 transition-all duration-200 shrink-0 ${
                            isSelected
                              ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                              : "bg-transparent group-hover:bg-white/20"
                          }`}
                          aria-hidden="true"
                        />
                        <Icon
                          size={14}
                          className={
                            isSelected
                              ? "text-white animate-pulse"
                              : "text-[#6b7280] group-hover:text-white/90"
                          }
                        />
                        <span className="truncate">{item.name}</span>
                        <span
                          className={`ml-auto h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                            isSelected
                              ? "bg-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                              : "bg-white/0 group-hover:bg-white/15"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>
            ));
          })()}
        </div>

        <div className="relative shrink-0 border-t border-[#1e2238] bg-[#0d0f1d]/80 backdrop-blur-sm px-6 py-5">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold text-white
                       bg-gradient-to-r from-red-500/90 via-red-500 to-red-600/90
                       hover:from-red-400 hover:via-red-500 hover:to-red-600
                       shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_10px_30px_rgba(239,68,68,0.18)]
                       transition-all duration-200
                       border border-white/10
                       group relative overflow-hidden"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[radial-gradient(1200px_circle_at_20%_50%,rgba(255,255,255,0.22),transparent_40%)]" />
            <LogOut
              size={14}
              className="relative z-10 text-white group-hover:translate-x-0.5 transition-transform drop-shadow"
            />
            <span className="relative z-10 cursor-pointer">
              Terminate Session
            </span>
          </button>
        </div>
      </aside>

      {/* ---- Phone bottom navigation ---- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl bg-[#0d0f1d] border-t border-[#1e2238] pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(800px_circle_at_50%_0%,rgba(100,74,255,0.18),transparent_55%)]" />

        <nav className="relative flex h-16 items-stretch" aria-label="Mobile primary navigation">
          {phonePrimaryItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-t-2xl transition-colors border-t-2 border-transparent ${
                  isSelected
                    ? "bg-[#644aff]/15 text-[#e9e7ff] border-t-[#644aff]"
                    : "text-[#6b7280] hover:bg-white/5 hover:text-white"
                }`}
                aria-label={item.name}
              >
                <Icon size={18} className={isSelected ? "text-white" : ""} />
                <span className="text-[8px] uppercase tracking-[0.08em] font-bold whitespace-nowrap">
                  {phonePrimaryLabels[item.id] || item.name}
                </span>
              </button>
            );
          })}

          <button
            key="more"
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-t-2xl transition-colors border-b-2 border-transparent ${
              phoneMoreItems.some((item) => item.id === activeTab)
                ? "bg-[#644aff]/15 text-[#e9e7ff] border-t-[#644aff]"
                : "text-[#6b7280] hover:bg-white/5 hover:text-white"
            }`}
            aria-haspopup="dialog"
            aria-expanded={isMobileMenuOpen}
            aria-label="More"
          >
            <MoreHorizontal size={18} className={phoneMoreItems.some((item) => item.id === activeTab) ? "text-white" : ""} />
            <span className="text-[8px] uppercase tracking-[0.08em] font-bold whitespace-nowrap">
              More
            </span>
          </button>
        </nav>
      </div>

      {/* ---- Phone More menu (UI-only bottom sheet) ---- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="More menu"
            className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col overflow-hidden rounded-t-3xl border-t border-[#1e2238] bg-[#0d0f1d] shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1e2238] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a8fbc]">
                All Sections
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[#8a8fbc] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="grid gap-1">
                {phoneMoreItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 min-h-[44px] text-left text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-[#644aff]/15 text-white"
                          : "text-[#8a8fbc] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          isSelected ? "text-[#644aff]" : "text-[#6b7280]"
                        }
                      />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="my-2 border-t border-[#1e2238]" />

              <button
                type="button"
                onClick={onLogout}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={18} />
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
