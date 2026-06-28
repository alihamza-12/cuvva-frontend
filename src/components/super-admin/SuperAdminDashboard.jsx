import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  LogOut,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

// Child Component Interfaces
import Sidebar from "./Sidebar";
import OverviewGrid from "./OverviewGrid";
import AccountManagement from "./AccountManagement";
import VehicleCatalog from "./VehicleCatalog";
import PolicyContracts from "./PolicyContracts";
import CreateUser from "./CreateUser";
import CreatePolicy from "./CreatePolicy";
import CreateVehicle from "./CreateVehicle";

// Extensible API Instance with cookie protection policies
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Routing States
  const [activeTab, setActiveTab] = useState("overview");

  // Data State Arrays
  const [subAdmins, setSubAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [policies, setPolicies] = useState([]);

  // UI Presentation States
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  // Resilient Synchronizer Pattern to protect against single-route crashes
  const fetchGlobalMetricsData = useCallback(async () => {
    setIsSyncing(true);
    setSystemAlert(null);

    try {
      // Execute endpoints in parallel safely by mapping individual catches
      const [resSub, resCust, resVeh, resPol] = await Promise.all([
        api.get("/api/management/subadmins").catch((err) => ({
          error: true,
          data: { subAdmins: [] },
          message: "Sub-Admins data grid offline.",
        })),
        api.get("/api/management/customers").catch((err) => ({
          error: true,
          data: { customers: [] },
          message: "Customer registries detached.",
        })),
        api.get("/api/vehicles/all").catch((err) => ({
          error: true,
          data: { vehicles: [] },
          message: "Vehicle asset catalog unreachable.",
        })),
        api.get("/api/policies/all").catch((err) => ({
          error: true,
          data: { policies: [] },
          message: "Insurance contract engine unavailable.",
        })),
      ]);

      // Handle structural telemetry state allocations safely
      setSubAdmins(resSub.data?.subAdmins || []);
      setCustomers(resCust.data?.customers || []);
      setVehicles(resVeh.data?.vehicles || []);
      setPolicies(resPol.data?.policies || []);

      // Evaluate if any background modules are experiencing localized failures
      const localizedErrors = [resSub, resCust, resVeh, resPol]
        .filter((res) => res.error)
        .map((res) => res.message);

      if (localizedErrors.length > 0) {
        setSystemAlert(`Partial Sync Notice: ${localizedErrors.join(" | ")}`);
      }
    } catch (err) {
      console.error(
        "Critical core operation fault syncing backend instances:",
        err,
      );
      setSystemAlert(
        "Critical connection failure. Master database cluster handshake rejected.",
      );
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Hook Registration
  useEffect(() => {
    fetchGlobalMetricsData();
  }, [fetchGlobalMetricsData]);

  // Keep the dashboard tab in sync with URL query (?tab=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = (searchParams.get("tab") || "overview").toLowerCase();

    const allowedTabs = new Set([
      "overview",
      "accounts",
      "vehicles",
      "policies",
      "create-user",
      "create-policy",
      "create-vehicle",
    ]);
    setActiveTab(allowedTabs.has(tab) ? tab : "overview");
  }, [location.search]);

  // Session Invalidation Protocol
  const handleSessionRevocation = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.warn(
        "Logout request failed, clearing client route manually.",
        err,
      );
    } finally {
      // Clear ALL client-side session state (as requested)
      try {
        localStorage.clear();
      } catch (e) {
        console.warn("localStorage.clear() failed", e);
      }

      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn("sessionStorage.clear() failed", e);
      }

      // Force immediate fallback redirect
      navigate("/login", { replace: true });
    }
  };

  // Initial Bootup State Component
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center gap-4 text-xs tracking-wider text-[#8a8fbc]">
        <RefreshCw size={24} className="animate-spin text-[#644aff]" />
        <span className="font-mono uppercase animate-pulse">
          Syncing platform catalogs...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] text-white flex font-sans antialiased selection:bg-[#644aff]/30 selection:text-white">
      {/* GLOBAL SYSTEM NAVIGATION DRAWER */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleSessionRevocation}
      />

      {/* MASTER APPLICATION CONTENT BLOCK */}
      <div className="flex flex-col flex-1 max-h-screen overflow-y-auto">
        {/* HEADER BAR PROVISIONS */}
        <header className="h-16 border-b border-[#1e2238] px-10 flex items-center justify-between sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              System Operations Area
            </h1>
            {isSyncing && (
              <RefreshCw size={12} className="animate-spin text-[#644aff]" />
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Manual Sync Trigger */}
            <button
              onClick={fetchGlobalMetricsData}
              disabled={isSyncing}
              className="p-2 bg-white/5 hover:bg-white/10 text-[#8a8fbc] hover:text-white border border-[#1e2238] rounded-xl transition-all disabled:opacity-40"
              title="Force Database Matrix Re-sync"
            >
              <RefreshCw
                size={12}
                className={isSyncing ? "animate-spin" : ""}
              />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-[#644aff] rounded-full flex items-center gap-1.5">
              <ShieldCheck size={12} /> Root Authorization Granted
            </span>
          </div>
        </header>

        {/* SYSTEM STATUS BANNER NOTIFICATION CONSOLE */}
        {systemAlert && (
          <div className="flex items-center gap-2 px-10 py-3 text-xs font-medium border-b bg-amber-500/10 border-amber-500/20 text-amber-400 animate-fadeIn">
            <AlertTriangle size={14} className="shrink-0 animate-pulse" />
            <span>{systemAlert}</span>
          </div>
        )}

        {/* RENDER VIEW CONTROLLER MAIN CANVAS */}
        <main className="flex-1 w-full p-10 mx-auto space-y-8 max-w-7xl">
          {/* TAB FRAME 1: VIEW METRICS AND INSIGHTS DASHBOARD */}
          {activeTab === "overview" && (
            <OverviewGrid
              counts={{
                subAdmins: subAdmins.length,
                customers: customers.length, // Resolved Omission Bug: Now fully integrated
                vehicles: vehicles.length,
                policies: policies.length,
              }}
            />
          )}

          {/* TAB FRAME 2: IDENTITY REGISTER ENGINE */}
          {activeTab === "accounts" && (
            <AccountManagement
              subAdmins={subAdmins}
              customers={customers}
              onRefresh={fetchGlobalMetricsData}
              axiosInstance={api}
            />
          )}

          {/* TAB FRAME 3: VEHICLE CATALOG CATALOG MANAGEMENT */}
          {activeTab === "vehicles" && (
            <VehicleCatalog
              vehicles={vehicles}
              onRefresh={fetchGlobalMetricsData}
              axiosInstance={api}
            />
          )}

          {/* TAB FRAME 4: COVERAGE INSURANCE ENGINE METADATA */}
          {activeTab === "policies" && (
            <PolicyContracts
              policies={policies}
              onRefresh={fetchGlobalMetricsData}
              axiosInstance={api}
            />
          )}

          {activeTab === "create-user" && (
            <CreateUser
              axiosInstance={api}
              onCreated={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "create-policy" && (
            <CreatePolicy
              axiosInstance={api}
              onCreated={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "create-vehicle" && (
            <CreateVehicle
              axiosInstance={api}
              onCreated={fetchGlobalMetricsData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
