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
import PolicyDetailPage from "../pages/super-admin/details/PolicyDetailPage";

import { SubAdminHome } from "../pages/sub-admin/SubAdminHome";
import VehicleDetailPageSubAdmin from "../pages/sub-admin/VehicleDetailPage";
import CustomerDetailPageSubAdmin from "../pages/sub-admin/CustomerDetailPage";
import PolicyDetailPageSubAdmin from "../pages/sub-admin/PolicyDetailPage";

import { SubAdminLayout } from "../components/layout/SubAdminLayout";
import CustomerHome from "../pages/customer/CustomerHome";
import CustomerLayout from "../components/layout/CustomerLayout";
import PolicyQuotePage from "../pages/customer/PolicyQuotePage";
import PolicyDocumentsPage from "../pages/customer/PolicyDocumentsPage";
import InsuranceSummaryPage from "../components/customer/InsuranceSummaryPage";
import PolicyWordingPage from "../components/customer/PolicyWordingPage";
import VehiclePhotoCapturePage from "../components/customer/VehiclePhotoCapturePage";
import VehicleCameraCapturePage from "../components/customer/VehicleCameraCapturePage";
import CarClubsPage from "../components/customer/CarClubsPage";
import PoliciesPage from "../components/customer/PoliciesPage";
import ProfilePage from "../components/customer/ProfilePage";

// NOTE: aliased to avoid clashing with the Super Admin's PolicyDetailPage
// imported above — these are two DIFFERENT components.
import CustomerPolicyDetailPage from "../components/customer/PolicyDetailPage";
import MakeAClaimPage from "../components/customer/MakeAClaimPage";
import PolicyReceiptPage from "../components/customer/PolicyReceiptPage";
import BookMechanicPage from "../components/customer/BookMechanicPage";

// Profile sub-pages (Account details, Bank details, Discount code,
// Your discounts, Refer a friend) — added for the Profile rebuild.
import AccountDetailsPage from "../components/customer/AccountDetailsPage";
import BankAccountDetailsPage from "../components/customer/BankAccountDetailsPage";
import DiscountCodePage from "../components/customer/DiscountCodePage";
import YourDiscountsPage from "../components/customer/YourDiscountsPage";
import ReferFriendPage from "../components/customer/ReferFriendPage";

// Account details sub-pages (Preferred name, Email, Mobile, Connected
// accounts, My identity, Residential address, Marketing preferences,
// Delete account info screen).
import PreferredNamePage from "../components/customer/PreferredNamePage";
import EmailAddressPage from "../components/customer/EmailAddressPage";
import AddEmailPage from "../components/customer/AddEmailPage";
import MobileNumberPage from "../components/customer/MobileNumberPage";
import AddMobileNumberPage from "../components/customer/AddMobileNumberPage";
import ConnectedAccountsPage from "../components/customer/ConnectedAccountsPage";
import MyIdentityPage from "../components/customer/MyIdentityPage";
import ResidentialAddressPage from "../components/customer/ResidentialAddressPage";
import MarketingPreferencesPage from "../components/customer/MarketingPreferencesPage";
import DeleteAccountInfoPage from "../components/customer/DeleteAccountInfoPage";

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
  if (user.role === "Customer") {
    return <Navigate to="/customer" replace />;
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

        {/* ================= SECURE CUSTOMER WORKSPACE ================= */}
        {/*
          car-clubs / policies / profile live INSIDE this block as
          children (relative paths), alongside `index`. This makes
          them:
            1. Actually reachable at /customer/car-clubs, /customer/policies,
               /customer/profile.
            2. Rendered inside CustomerLayout's <Outlet/>, so
               CustomerBottomNav shows on them.
            3. Protected by the same role check as the rest of /customer.

          Profile sub-pages (Account details + all its child screens,
          Bank details, Discount code, Your discounts, Refer a friend)
          are ALSO nested here now (relative paths), so the bottom nav
          stays visible on them too — they were previously declared as
          standalone absolute routes outside CustomerLayout (grouped
          with the full-screen purchase flow), which hid the bottom
          nav on every one of them.
        */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerHome />} />
          <Route path="car-clubs" element={<CarClubsPage />} />
          <Route path="policies" element={<PoliciesPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="profile/account" element={<AccountDetailsPage />} />
          <Route
            path="profile/bank-details"
            element={<BankAccountDetailsPage />}
          />
          <Route path="profile/discount-code" element={<DiscountCodePage />} />
          <Route path="profile/discounts" element={<YourDiscountsPage />} />
          <Route path="profile/refer" element={<ReferFriendPage />} />

          {/* Account details sub-pages */}
          <Route
            path="profile/account/preferred-name"
            element={<PreferredNamePage />}
          />
          <Route path="profile/account/email" element={<EmailAddressPage />} />
          <Route path="profile/account/email/add" element={<AddEmailPage />} />
          <Route path="profile/account/mobile" element={<MobileNumberPage />} />
          <Route
            path="profile/account/mobile/add"
            element={<AddMobileNumberPage />}
          />
          <Route
            path="profile/account/connected"
            element={<ConnectedAccountsPage />}
          />
          <Route path="profile/account/identity" element={<MyIdentityPage />} />
          <Route
            path="profile/account/address"
            element={<ResidentialAddressPage />}
          />
          <Route
            path="profile/account/marketing"
            element={<MarketingPreferencesPage />}
          />
          <Route
            path="profile/account/delete"
            element={<DeleteAccountInfoPage />}
          />
        </Route>

        {/*
          Full-screen purchase flow — deliberately OUTSIDE CustomerLayout
          so the bottom nav stays hidden on these (X-to-close pattern).
          Still protected individually if you want that; wrap each in
          <ProtectedRoute allowedRoles={["Customer"]}> if needed.
        */}
        <Route path="/customer/policies/new" element={<PolicyQuotePage />} />
        <Route
          path="/customer/policies/documents"
          element={<PolicyDocumentsPage />}
        />
        <Route
          path="/customer/policies/documents/ipid"
          element={<InsuranceSummaryPage />}
        />
        <Route
          path="/customer/policies/documents/wording"
          element={<PolicyWordingPage />}
        />
        <Route
          path="/customer/policies/photos/:step"
          element={<VehiclePhotoCapturePage />}
        />
        <Route
          path="/customer/policies/photos/:step/camera"
          element={<VehicleCameraCapturePage />}
        />
        <Route
          path="/customer/policies/detail"
          element={<CustomerPolicyDetailPage />}
        />
        <Route
          path="/customer/policies/receipt"
          element={<PolicyReceiptPage />}
        />
        <Route path="/customer/policies/claim" element={<MakeAClaimPage />} />
        <Route
          path="/customer/policies/mechanic"
          element={<BookMechanicPage />}
        />

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

          {/* Feeds already use /dashboard/policies/:id */}
          <Route path="policies/:id" element={<PolicyDetailPageSubAdmin />} />

          {/* Dedicated Sub Admin detail pages for vehicle + customer */}
          <Route
            path="vehicles/:registration"
            element={<VehicleDetailPageSubAdmin />}
          />
          <Route
            path="customers/:id"
            element={<CustomerDetailPageSubAdmin />}
          />
        </Route>

        {/*
          Catch-All Fallback stays at the VERY END. React Router matches
          sibling routes in declaration order — having `*` earlier would
          swallow EVERY navigation (including bottom nav clicks) before
          any later route could ever match.
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
