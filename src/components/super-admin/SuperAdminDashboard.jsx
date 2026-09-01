import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { httpClient } from "../../app/api/httpClient";

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

import Sidebar from "./Sidebar";
import OverviewGrid from "./OverviewGrid";
import AccountManagement from "./AccountManagement";
import OwnCustomersManagement from "./OwnCustomersManagement";
import AllSubAdminsManagement from "./AllSubAdminsManagement";
import VehicleCatalog from "./VehicleCatalog";
import OwnVehiclesManagement from "./OwnVehiclesManagement";
import OwnPoliciesManagement from "./OwnPoliciesManagement";
import PolicyContracts from "./PolicyContracts";

import CreateUser from "./CreateUser";
import CreatePolicy from "./CreatePolicy";
import CreateVehicle from "./CreateVehicle";

const api = httpClient;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("overview");

  const [subAdmins, setSubAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  const fetchGlobalMetricsData = useCallback(async () => {
    setIsSyncing(true);
    setSystemAlert(null);

    try {

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

      setSubAdmins(resSub.data?.subAdmins || []);
      setCustomers(resCust.data?.customers || []);
      setVehicles(resVeh.data?.vehicles || []);
      setPolicies(resPol.data?.policies || []);

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

  useEffect(() => {
    fetchGlobalMetricsData();
  }, [fetchGlobalMetricsData]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = (searchParams.get("tab") || "overview").toLowerCase();

    const allowedTabs = new Set([
      "overview",
      "accounts",
      "sub-admins",
      "own-customers",
      "own-vehicles",
      "own-policies",
      "vehicles",
      "policies",

      "create-user",
      "create-policy",
      "create-vehicle",
    ]);
    setActiveTab(allowedTabs.has(tab) ? tab : "overview");
  }, [location.search]);

  const handleSessionRevocation = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.warn(
        "Logout request failed, clearing client route manually.",
        err,
      );
    } finally {

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

      navigate("/login", { replace: true });
    }
  };

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

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleSessionRevocation}
      />

      <div className="flex flex-col flex-1 max-h-screen overflow-y-auto">

        <header className="h-16 border-b border-[#1e2238] px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#8a8fbc] truncate">
              System Operations Area
            </h1>
            <h1 className="sm:hidden text-xs font-bold uppercase tracking-widest text-[#8a8fbc] truncate">
              Ops
            </h1>
            {isSyncing && (
              <RefreshCw size={12} className="animate-spin text-[#644aff] shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            
            <button
              onClick={fetchGlobalMetricsData}
              disabled={isSyncing}
              className="p-2 bg-white/5 hover:bg-white/10 text-[#8a8fbc] hover:text-white border border-[#1e2238] rounded-xl transition-all disabled:opacity-40 shrink-0"
              title="Force Database Matrix Re-sync"
            >
              <RefreshCw
                size={12}
                className={isSyncing ? "animate-spin" : ""}
              />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-[#644aff] rounded-full flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck size={12} /> Root Authorization Granted
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
            <OverviewGrid
              counts={{
                subAdmins: subAdmins.length,
                customers: customers.length, 
                vehicles: vehicles.length,
                activePolicies: policies.filter((policy) => policy.status === "Active").length,
                totalPolicies: policies.length,
                expiredPolicies: policies.filter((policy) => policy.status === "Expired").length,
              }}
            />
          )}

          {activeTab === "accounts" && (
            <AccountManagement
              subAdmins={subAdmins}
              customers={customers}
              onRefresh={fetchGlobalMetricsData}
              axiosInstance={api}
            />
          )}

          {activeTab === "own-customers" && (
            <OwnCustomersManagement
              axiosInstance={api}
              onRefresh={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "sub-admins" && (
            <AllSubAdminsManagement
              axiosInstance={api}
              onRefresh={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "own-vehicles" && (
            <OwnVehiclesManagement
              axiosInstance={api}
              onRefresh={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "own-policies" && (
            <OwnPoliciesManagement
              policies={policies.filter(
                (p) => p?.createdBy?.role === "Super Admin",
              )}
              onRefresh={fetchGlobalMetricsData}
            />
          )}

          {activeTab === "vehicles" && (
            <VehicleCatalog
              vehicles={vehicles}
              onRefresh={fetchGlobalMetricsData}
              axiosInstance={api}
            />
          )}

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
