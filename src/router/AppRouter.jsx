import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/auth/LoginPage";
import { selectCurrentUser } from "../features/authSlice";
import ProtectedRoute from "./ProtectedRoute";
import SuperAdminDashboard from "../pages/super-admin/Dashboard";
import CustomerDetailPage from "../pages/super-admin/details/CustomerDetailPage";
import VehicleDetailPage from "../pages/super-admin/details/VehicleDetailPage";
import SubAdminDetailPage from "../pages/super-admin/details/SubAdminDetailPage";
import { SubAdminHome } from "../pages/sub-admin/SubAdminHome";
import { SubAdminLayout } from "../components/layout/SubAdminLayout";

import PolicyDetailPage from "../pages/super-admin/details/PolicyDetailPage";

// --- HOOKED UP SUB-ADMIN INTERFACE PLACEHOLDERS ---
const TempForgot = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-[#060814]">
    <div className="p-6 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl">
      Password Reset View
    </div>
  </div>
);

const TempSubAdminLayout = () => (
  <div className="flex min-h-screen bg-[#060814]">
    {/* Temporary Sidebar placeholder until we build the real Sub-Admin Agent dashboard */}
    <div className="w-64 p-5 border-r bg-[#0d0f1d] border-[#1e2238] flex flex-col gap-6">
      <div className="text-lg font-extrabold text-[#00f0ff] uppercase tracking-wider">
        ⚡ AGENT HQ
      </div>
      <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
        Navigation
      </div>
      <div className="px-4 py-3 bg-[#644aff]/10 text-white font-semibold rounded-xl text-sm">
        My Workspace
      </div>
    </div>
    <div className="flex-1 p-10">
      <Outlet />
    </div>
  </div>
);

const TempSubDash = () => (
  <div className="text-2xl font-bold text-white">
    Agent Operational Live Pipeline
    <p className="text-sm font-normal text-[#6b7280] mt-2">
      This workspace is restricted to provisioned Sub-Admin authorization
      levels.
    </p>
  </div>
);

// --- HANDLES AUTOMATIC TRAFFIC REDIRECTION BASED ON ROLE ACCOUNTS ---
const RoleRedirect = () => {
  const user = useSelector(selectCurrentUser);

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "Super Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === "Sub Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= OPEN PUBLIC ACCESS CHANNELS ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<TempForgot />} />

        {/* Dynamic Entry Connection Point */}
        <Route path="/" element={<RoleRedirect />} />

        {/* ================= SECURE SUPER ADMIN WORKSPACE ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Super Admin"]}>
              {/* Uses a clean, standard pass-through layout handler */}
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route
            path="vehicles/:registration"
            element={<VehicleDetailPage />}
          />
          <Route path="sub-admins/:id" element={<SubAdminDetailPage />} />
          <Route path="policies/:id" element={<PolicyDetailPage />} />
        </Route>

        {/* ================= SECURE SUB ADMIN AGENT WORKSPACE ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Sub Admin"]}>
              <SubAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SubAdminHome />} />
        </Route>

        {/* Catch-All Fallback Redirect Security Guard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
