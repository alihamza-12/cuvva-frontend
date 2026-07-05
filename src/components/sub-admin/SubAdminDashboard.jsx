import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { SubAdminOverviewGrid } from "./SubAdminOverviewGrid";
import { SubAdminOwnCustomers } from "./SubAdminOwnCustomers";
import { SubAdminOwnVehicles } from "./SubAdminOwnVehicles";
import { SubAdminOwnPolicies } from "./SubAdminOwnPolicies";
import { SubAdminPolicyContracts } from "./SubAdminPolicyContracts";

import { httpClient } from "../../app/api/httpClient";

export default function SubAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("overview");

  // RTK Query will be wired in later.
  // For now we keep the same UX patterns as SuperAdminDashboard.
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  const fetchSubAdminMetricsData = useCallback(async () => {
    setIsSyncing(true);
    setSystemAlert(null);

    try {
      // Lightweight health sync for UI parity with Super Admin.
      // We intentionally do not assume specific Sub Admin endpoints yet.
      await httpClient
        .get("/api/vehicles/all")
        .catch(() => Promise.resolve(null));
    } catch (err) {
      setSystemAlert(
        "Critical connection failure. Sub Admin matrix handshake rejected.",
      );
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubAdminMetricsData();
  }, [fetchSubAdminMetricsData]);

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
    } catch (_) {
      // ignore
    } finally {
      try {
        localStorage.clear();
      } catch (_) {}
      try {
        sessionStorage.clear();
      } catch (_) {}
      navigate("/login", { replace: true });
    }
  };

  const counts = useMemo(() => {
    // Will be powered by RTK Query in the next step.
    return {
      myCustomers: 0,
      myVehicles: 0,
      myPolicies: 0,
      contracts: 0,
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center gap-4 text-xs tracking-wider text-[#8a8fbc]">
        <RefreshCw size={24} className="animate-spin text-[#00f0ff]" />
        <span className="font-mono uppercase animate-pulse">
          Syncing agent workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] text-white flex font-sans antialiased selection:bg-[#00f0ff]/30 selection:text-white">
      {/* Sidebar is rendered by SubAdminLayout */}

      <div className="flex flex-col flex-1 max-h-screen overflow-y-auto">
        <header className="h-16 border-b border-[#1e2238] px-10 flex items-center justify-between sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              Agent Operations Area
            </h1>
            <LayoutDashboard size={14} className="text-[#00f0ff]" />
            {isSyncing && (
              <RefreshCw size={12} className="animate-spin text-[#00f0ff]" />
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchSubAdminMetricsData}
              disabled={isSyncing}
              className="p-2 bg-white/5 hover:bg-white/10 text-[#8a8fbc] hover:text-white border border-[#1e2238] rounded-xl transition-all disabled:opacity-40"
              title="Force agent matrix re-sync"
              type="button"
            >
              <RefreshCw
                size={12}
                className={isSyncing ? "animate-spin" : ""}
              />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-[#00f0ff] rounded-full flex items-center gap-1.5">
              <ShieldCheck size={12} /> Sub Admin Authorization
            </span>
          </div>
        </header>

        {systemAlert && (
          <div className="flex items-center gap-2 px-10 py-3 text-xs font-medium border-b bg-amber-500/10 border-amber-500/20 text-amber-400 animate-fadeIn">
            <AlertTriangle size={14} className="shrink-0 animate-pulse" />
            <span>{systemAlert}</span>
          </div>
        )}

        <main className="flex-1 w-full p-10 mx-auto space-y-8 max-w-7xl">
          {activeTab === "overview" && (
            <SubAdminOverviewGrid
              counts={counts}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {activeTab === "my-customers" && (
            <SubAdminOwnCustomers
              axiosInstance={httpClient}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {activeTab === "my-vehicles" && (
            <SubAdminOwnVehicles
              axiosInstance={httpClient}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {activeTab === "my-policies" && (
            <SubAdminOwnPolicies
              policies={[]}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {activeTab === "contracts" && (
            <SubAdminPolicyContracts
              policies={[]}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {/* Session revoke button is in Sidebar */}
        </main>
      </div>
    </div>
  );
}
