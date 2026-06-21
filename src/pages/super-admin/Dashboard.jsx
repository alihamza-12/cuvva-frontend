import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";

// Redux & API Custom Hooks
import { logOut, selectCurrentUser } from "../../features/authSlice";
import { useLogoutUserMutation } from "../../app/api/authApi";

// Core Modular Component Imports from your components folder
import Sidebar from "../../components/super-admin/Sidebar";
import AccountManagement from "../../components/super-admin/AccountManagement";
import VehicleCatalog from "../../components/super-admin/VehicleCatalog";
import PolicyContract from "../../components/super-admin/PolicyContracts"; // Note: adjust to your filename spelling if necessary
import SuperAdminHome from "./SuperAdminHome";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [logoutBackend] = useLogoutUserMutation();

  // Orchestrated UI Tab Control
  const [activeTab, setActiveTab] = useState("overview");

  // Global Counter State shared for instant header/overview updates
  const [counts, setCounts] = useState({ subAdmins: 0, customers: 0, vehicles: 0, policies: 0 });
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);

  // Centralized Telemetry Aggregator 
  const syncPlatformMetrics = async () => {
    setIsSyncingTelemetry(true);
    try {
      const fetchOptions = {
        method: "GET",
        credentials: "include", // 🛡️ CRITICAL: Forces cookie transfer
        headers: { "Content-Type": "application/json" },
      };

      const [subAdminsRes, customersRes, vehiclesRes, policiesRes] = await Promise.all([
        fetch("http://localhost:3000/api/management/subadmins", fetchOptions).then((res) => res.json()),
        fetch("http://localhost:3000/api/management/customers", fetchOptions).then((res) => res.json()),
        fetch("http://localhost:3000/api/vehicles/all", fetchOptions).then((res) => res.json()),
        fetch("http://localhost:3000/api/policies/all", fetchOptions).then((res) => res.json()),
      ]);

      setCounts({
        subAdmins: subAdminsRes?.count ?? subAdminsRes?.subAdmins?.length ?? 0,
        customers: customersRes?.count ?? customersRes?.customers?.length ?? 0,
        vehicles: vehiclesRes?.count ?? vehiclesRes?.vehicles?.length ?? 0,
        policies: policiesRes?.count ?? policiesRes?.policies?.length ?? 0,
      });
    } catch (err) {
      console.error("Platform telemetry cluster sync error:", err);
    } finally {
      setIsSyncingTelemetry(false);
    }
  };

  // Automatically refresh counts whenever tabs change
  useEffect(() => {
    syncPlatformMetrics();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logoutBackend().unwrap();
    } catch (err) {
      console.warn("Session cache already truncated on server.");
    }
    dispatch(logOut());
    navigate("/login", { replace: true });
  };

  const getHeaderContextTitle = () => {
    switch (activeTab) {
      case "overview": return "Core Status Matrix";
      case "accounts": return "Account Security Controls";
      case "vehicles": return "Global Asset Specification Catalog";
      case "policies": return "Insurance Coverage Contracts";
      default: return "Administrative Command Core";
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex font-sans antialiased selection:bg-[#644aff]/30 select-none">
      {/* Sidebar Component from layout directory */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Main Workspace Frame Container */}
      <div className="flex flex-col flex-1 max-h-screen min-w-0 overflow-y-auto">
        {/* Universal Sticky Header Module */}
        <header className="h-16 border-b border-[#1e2238] px-6 md:px-10 flex items-center justify-between sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold tracking-widest text-white uppercase md:text-sm">
              {getHeaderContextTitle()}
            </h1>
            {isSyncingTelemetry && (
              <RefreshCw size={12} className="text-[#644aff] animate-spin shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 bg-[#644aff]/10 border border-[#644aff]/20 px-3 py-1 rounded-full text-[#644aff] text-[10px] font-bold tracking-wide uppercase">
            Super Authorization Layer Verified
          </div>
        </header>

        {/* Dynamic Display Canvas */}
        <main className="flex-1 w-full max-w-6xl p-6 pb-24 mx-auto space-y-8 md:p-10 lg:pb-10">
          {activeTab === "overview" && (
            <SuperAdminHome counts={counts} onUpdateNeeded={syncPlatformMetrics} />
          )}

          {activeTab === "accounts" && (
            <AccountManagement onActionSuccess={syncPlatformMetrics} />
          )}

          {activeTab === "vehicles" && (
            <VehicleCatalog />
          )}

          {activeTab === "policies" && (
            <PolicyContract />
          )}
        </main>
      </div>
    </div>
  );
}