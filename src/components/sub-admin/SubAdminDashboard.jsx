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

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  const [policies, setPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [myVehiclesError, setMyVehiclesError] = useState("");

  const fetchSubAdminMetricsData = useCallback(async () => {
    setIsSyncing(true);
    setSystemAlert(null);

    try {
      const [vehRes, polRes, customerRes] = await Promise.all([
        httpClient.get("/api/vehicles/all").catch((err) => ({
          error: true,
          message: err?.response?.data?.message || "Failed to load vehicles.",
          data: { vehicles: [] },
        })),
        httpClient.get("/api/policies/my").catch((err) => ({
          error: true,
          message: err?.response?.data?.message || "Failed to load policies.",
          data: { policies: [] },
        })),
        httpClient.get("/api/customers").catch((err) => ({
          error: true,
          message: err?.response?.data?.message || "Failed to load customers.",
          data: { customers: [] },
        })),
      ]);

      const vList = vehRes?.data?.vehicles || [];
      const pList = polRes?.data?.policies || [];
      const customerList = customerRes?.data?.customers || [];

      setVehicles(vList);
      setPolicies(pList);
      setCustomers(customerList);

      const localizedErrors = [];
      if (vehRes?.error) localizedErrors.push(vehRes?.message);
      if (polRes?.error) localizedErrors.push(polRes?.message);
      if (customerRes?.error) localizedErrors.push(customerRes?.message);

      if (localizedErrors.length > 0) {
        setSystemAlert(`Partial Sync Notice: ${localizedErrors.join(" | ")}`);
      }
    } catch (err) {
      console.error("Sub Admin sync failure:", err);
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
    return {
      myCustomers: (customers || []).length,
      myVehicles: (vehicles || []).length,
      myPolicies: (policies || []).length,
      contracts: (policies || []).length,
      totalPolicies: (policies || []).length,
      activePolicies: (policies || []).filter((policy) => policy.status === "Active").length,
      expiredPolicies: (policies || []).filter((policy) => policy.status === "Expired").length,
    };
  }, [customers, vehicles, policies]);

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

      <div className="flex flex-col flex-1">
        <header className="h-16 border-b border-[#1e2238] px-4 md:px-8 hidden md:flex items-center justify-between gap-4 sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              Agent Operations Area
            </h1>
            <h1 className="sm:hidden text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              Agent
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
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-medium border-b md:px-8 bg-amber-500/10 border-amber-500/20 text-amber-400 animate-fadeIn">
            <AlertTriangle size={14} className="shrink-0 animate-pulse" />
            <span>{systemAlert}</span>
          </div>
        )}

        <main className="flex-1 w-full p-4 space-y-8 pb-28 sm:p-6 sm:pb-24 lg:p-10 lg:pb-10">
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
              policies={policies}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

          {activeTab === "contracts" && (
            <SubAdminPolicyContracts
              policies={policies}
              onRefresh={fetchSubAdminMetricsData}
            />
          )}

        </main>
      </div>
    </div>
  );
}
