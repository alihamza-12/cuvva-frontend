import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  Shield,
  LogOut,
  FileText,
  PlusCircle,
} from "lucide-react";

export default function SubAdminSidebar({
  activeTab,
  setActiveTab,
  user = { fullName: "Sub Admin", role: "Sub Admin" },
  onLogout,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "overview",
      name: "Operational Overview",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "my-customers",
      name: "My Customers",
      icon: Users,
      href: "/dashboard?tab=my-customers",
    },
    {
      id: "my-vehicles",
      name: "My Vehicles",
      icon: Car,
      href: "/dashboard?tab=my-vehicles",
    },
    {
      id: "my-policies",
      name: "My Policies",
      icon: Shield,
      href: "/dashboard?tab=my-policies",
    },
    {
      id: "contracts",
      name: "Policy Contracts",
      icon: FileText,
      href: "/dashboard?tab=contracts",
    },
    {
      id: "create-customer",
      name: "Create Customer",
      icon: Users,
      href: "/dashboard?tab=create-customer",
    },
    {
      id: "create-vehicle",
      name: "Create Vehicle",
      icon: Car,
      href: "/dashboard?tab=create-vehicle",
    },
    {
      id: "create-policy",
      name: "Create Policy",
      icon: Shield,
      href: "/dashboard?tab=create-policy",
    },
  ];

  // Group by *purpose* rather than array position, so reordering menuItems
  // above never silently breaks the sections again. Each section lists the
  // ids it owns; anything not claimed falls into a fallback "Other" bucket
  // automatically (belt-and-braces against future additions being missed).
  const SECTION_DEFS = [
    { title: "Overview", ids: ["overview"] },
    {
      title: "My Records",
      ids: ["my-customers", "my-vehicles", "my-policies", "contracts"],
    },
    {
      title: "Create New",
      ids: ["create-customer", "create-vehicle", "create-policy"],
    },
  ];

  const claimedIds = new Set(SECTION_DEFS.flatMap((s) => s.ids));
  const unclaimed = menuItems.filter((item) => !claimedIds.has(item.id));

  const sections = [
    ...SECTION_DEFS.map((def) => ({
      title: def.title,
      items: def.ids
        .map((id) => menuItems.find((item) => item.id === id))
        .filter(Boolean),
    })),
    ...(unclaimed.length ? [{ title: "Other", items: unclaimed }] : []),
  ].filter((section) => section.items.length > 0);

  const computeUserInitials = (nameString) => {
    if (!nameString) return "AG";
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
    navigate(item.href, { replace: true });
  };

  // "Create New" items get a distinct accent (amber) so they read visually
  // as actions rather than views, even though they share the same button shape.
  const isCreateItem = (id) => id.startsWith("create-");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#0d0f1d] border-r border-[#1e2238] flex-col h-screen sticky top-0 shrink-0 select-none z-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(100,74,255,0.22),transparent_55%),radial-gradient(700px_circle_at_70%_30%,rgba(0,240,255,0.14),transparent_45%)]" />

        <div className="relative flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4 space-y-8 scrollbar-thin scrollbar-thumb-[#2a2f4a]/60 scrollbar-track-transparent">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-2xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center font-black text-[11px] text-[#00f0ff] shadow-[0_0_0_1px_rgba(0,240,255,0.35),0_10px_30px_rgba(0,240,255,0.18)]">
              A
            </div>
            <span className="text-sm font-black tracking-[0.2em] text-white uppercase">
              AGENT{" "}
              <span className="text-[10px] font-bold text-[#00f0ff] normal-case tracking-[0.12em]">
                HQ
              </span>
            </span>
          </div>

          {/* User card */}
          <div className="p-4 bg-[#13172d]/55 border border-[#1e2238] rounded-2xl flex items-center gap-3 transition-all duration-300 hover:border-white/15 hover:bg-[#13172d]/65">
            <div className="w-10 h-10 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#9ff7ff] rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 tracking-wider">
              {computeUserInitials(user?.fullName)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold tracking-wide text-white truncate">
                {user?.fullName || "Sub-Admin Node"}
              </h4>
              <p className="text-[9px] text-cyan-300/90 font-bold tracking-widest uppercase mt-0.5 truncate">
                {user?.role || "Agent Console"}
              </p>
            </div>
          </div>

          {/* Nav sections, grouped by purpose */}
          {sections.map((section, sIdx) => (
            <div key={section.title} className={sIdx === 0 ? "" : "pt-4"}>
              <div className="flex items-center gap-2 px-2 mb-2">
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
                  const isCreate = isCreateItem(item.id);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleNavigate(item)}
                      className={`cursor-pointer group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-200 border border-transparent ${
                        isSelected
                          ? isCreate
                            ? "bg-amber-400/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_40px_rgba(251,191,36,0.20)] border-amber-400/25"
                            : "bg-[#00f0ff]/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_40px_rgba(0,240,255,0.20)] border-[#00f0ff]/25"
                          : "text-[#6b7280] hover:bg-white/5 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <span
                        className={`h-7 w-1.5 rounded-full ml-0.5 transition-all duration-200 shrink-0 ${
                          isSelected
                            ? isCreate
                              ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                              : "bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                            : "bg-transparent group-hover:bg-white/20"
                        }`}
                        aria-hidden="true"
                      />
                      {isCreate ? (
                        <PlusCircle
                          size={14}
                          className={
                            isSelected
                              ? "text-amber-400"
                              : "text-[#6b7280] group-hover:text-white/90"
                          }
                        />
                      ) : (
                        <Icon
                          size={14}
                          className={
                            isSelected
                              ? "text-[#00f0ff] animate-pulse"
                              : "text-[#6b7280] group-hover:text-white/90"
                          }
                        />
                      )}
                      <span className="truncate">{item.name}</span>
                      <span
                        className={`ml-auto h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                          isSelected
                            ? isCreate
                              ? "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.35)]"
                              : "bg-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.35)]"
                            : "bg-white/0 group-hover:bg-white/15"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Logout */}
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

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl bg-[#0d0f1d] border-t border-[#1e2238]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_circle_at_50%_0%,rgba(0,240,255,0.16),transparent_55%)]" />

        <div className="relative flex items-stretch h-16">
          <div className="flex items-center flex-1 px-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                const isCreate = isCreateItem(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-2xl transition-all flex-shrink-0 border border-transparent ${
                      isSelected
                        ? isCreate
                          ? "bg-amber-400/15 text-amber-100 border-amber-400/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_30px_rgba(251,191,36,0.18)]"
                          : "bg-[#00f0ff]/15 text-[#e9fdff] border-[#00f0ff]/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_30px_rgba(0,240,255,0.18)]"
                        : "text-[#6b7280] hover:bg-white/5 hover:text-white hover:border-white/10"
                    }`}
                    aria-label={item.name}
                  >
                    {isCreate ? (
                      <PlusCircle
                        size={16}
                        className={isSelected ? "text-amber-400" : ""}
                      />
                    ) : (
                      <Icon
                        size={16}
                        className={
                          isSelected ? "text-[#00f0ff] animate-pulse" : ""
                        }
                      />
                    )}
                    <span className="text-[7px] uppercase tracking-[0.12em] font-bold whitespace-nowrap">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-20 flex items-center justify-center border-l border-[#1e2238] bg-[#0d0f1d]">
            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-2xl text-white
                         bg-gradient-to-r from-red-500/90 via-red-500 to-red-600/90
                         hover:from-red-400 hover:via-red-500 hover:to-red-600
                         shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_8px_20px_rgba(239,68,68,0.18)]
                         transition-all duration-200 border border-white/10"
              title="Exit Portal"
            >
              <LogOut size={16} className="drop-shadow" />
              <span className="text-[7px] uppercase tracking-[0.12em] font-bold whitespace-nowrap">
                Exit
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
