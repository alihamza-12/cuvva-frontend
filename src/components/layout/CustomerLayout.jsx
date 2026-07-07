import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { httpClient } from "../../app/api/httpClient";

export function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = (searchParams.get("tab") || "overview").toLowerCase();
    const allowedTabs = new Set([
      "overview",
      "vehicles",
      "policies",
      "contracts",
    ]);
    setActiveTab(allowedTabs.has(tab) ? tab : "overview");
  }, [location.search]);

  const handleSessionRevocation = async () => {
    try {
      await httpClient.post("/api/auth/logout");
    } catch (err) {
      // ignore logout failure; still clear client state
    } finally {
      try {
        localStorage.clear();
      } catch (e) {}
      try {
        sessionStorage.clear();
      } catch (e) {}
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex font-sans antialiased selection:bg-[#00f0ff]/30 selection:text-white">
      {/* Left sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 bg-[#0d0f1d] border-r border-[#1e2238] flex-col h-screen sticky top-0 shrink-0 select-none z-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(100,74,255,0.22),transparent_55%),radial-gradient(700px_circle_at_70%_30%,rgba(0,240,255,0.14),transparent_45%)]" />

        <div className="relative flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4 space-y-8 scrollbar-thin scrollbar-thumb-[#2a2f4a]/60 scrollbar-track-transparent">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-2xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center font-black text-[11px] text-[#00f0ff] shadow-[0_0_0_1px_rgba(0,240,255,0.35),0_10px_30px_rgba(0,240,255,0.18)]">
              C
            </div>
            <span className="text-sm font-black tracking-[0.2em] text-white uppercase">
              CUSTOMER
            </span>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", label: "Dashboard" },
              { id: "vehicles", label: "Vehicles" },
              { id: "policies", label: "Policies" },
              { id: "contracts", label: "Contracts" },
            ].map((item) => {
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(`/customer?tab=${item.id}`, { replace: true });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold tracking-wider border transition-all duration-200 ${
                    selected
                      ? "bg-[#00f0ff]/10 text-white border-[#00f0ff]/25 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_40px_rgba(0,240,255,0.20)]"
                      : "text-[#6b7280] hover:bg-white/5 hover:text-white hover:border-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="relative shrink-0 border-t border-[#1e2238] bg-[#0d0f1d]/80 backdrop-blur-sm px-6 py-5">
          <button
            type="button"
            onClick={handleSessionRevocation}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-[11px] uppercase tracking-wider font-bold text-white bg-gradient-to-r from-red-500/90 via-red-500 to-red-600/90 hover:from-red-400 hover:via-red-500 hover:to-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_10px_30px_rgba(239,68,68,0.18)] transition-all duration-200 border border-white/10"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl bg-[#0d0f1d] border-t border-[#1e2238]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(800px_circle_at_50%_0%,rgba(0,240,255,0.16),transparent_55%)]" />
        <div className="relative flex items-stretch h-16">
          <div className="flex items-center flex-1 px-1 overflow-x-auto">
            {[
              { id: "overview", label: "Home" },
              { id: "vehicles", label: "Cars" },
              { id: "policies", label: "Pol" },
              { id: "contracts", label: "CT" },
            ].map((item) => {
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(`/customer?tab=${item.id}`, { replace: true });
                  }}
                  className={`flex-1 h-full text-center flex flex-col items-center justify-center gap-0.5 border-r last:border-r-0 ${
                    selected
                      ? "bg-[#00f0ff]/10 text-white border-[#00f0ff]/25"
                      : "text-[#6b7280] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-[0.12em] font-bold whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 pt-24 mx-auto space-y-8 overflow-y-auto max-w-7xl lg:pt-10">
        {/* Render Outlet for now (future tabs can be wired like SubAdminLayout) */}
        <Outlet />
      </div>
    </div>
  );
}
