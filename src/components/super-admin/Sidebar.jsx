import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Car, Shield, LogOut } from "lucide-react";

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
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0d0f1d] border-r border-[#1e2238] flex-col p-6 h-screen sticky top-0 shrink-0 select-none z-50">
        <div className="flex-1 min-h-0 space-y-8">
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

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => navigate(item.href, { replace: true })}
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

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold text-white mt-auto
                     bg-gradient-to-r from-red-500/90 via-red-500 to-red-600/90
                     hover:from-red-400 hover:via-red-500 hover:to-red-600
                     shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_10px_30px_rgba(239,68,68,0.18)]
                     transition-all duration-200
                     border border-white/10
                     group relative overflow-hidden shrink-0"
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[radial-gradient(1200px_circle_at_20%_50%,rgba(255,255,255,0.22),transparent_40%)]" />
          <LogOut
            size={14}
            className="relative z-10 text-white group-hover:translate-x-0.5 transition-transform drop-shadow"
          />
          <span className="relative z-10">Terminate Session</span>
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl bg-[#0d0f1d] border-t border-[#1e2238]">
        <div className="flex items-stretch h-16">
          {/* Use horizontal scroll so all items remain visible on small screens */}
          <div className="flex items-center flex-1 px-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all flex-shrink-0 ${
                      isSelected ? "text-[#644aff]" : "text-[#6b7280]"
                    }`}
                    aria-label={item.name}
                  >
                    <Icon size={16} />
                    <span className="text-[7px] uppercase tracking-wider font-bold whitespace-nowrap">
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
              className="flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl text-white
                         bg-gradient-to-r from-red-500/90 via-red-500 to-red-600/90
                         hover:from-red-400 hover:via-red-500 hover:to-red-600
                         shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_8px_20px_rgba(239,68,68,0.18)]
                         transition-all duration-200 border border-white/10"
              title="Exit Portal"
            >
              <LogOut size={16} className="drop-shadow" />
              <span className="text-[7px] uppercase tracking-wider font-bold whitespace-nowrap">
                Exit
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
