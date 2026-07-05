import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import SubAdminSidebar from "../sub-admin/SubAdminSidebar";
import { httpClient } from "../../app/api/httpClient";

export function SubAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = (searchParams.get("tab") || "overview").toLowerCase();

    const allowedTabs = new Set([
      "overview",
      "my-customers",
      "my-vehicles",
      "my-policies",
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
      <SubAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleSessionRevocation}
      />

      <div className="flex flex-col flex-1 max-h-screen overflow-y-auto">
        <header className="h-16 border-b border-[#1e2238] px-10 flex items-center justify-between sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              Sub Admin Operations Area
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-[#00f0ff] rounded-full flex items-center gap-1.5">
              Agent Console Live
            </span>
          </div>
        </header>

        <main className="flex-1 w-full p-10 mx-auto space-y-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
