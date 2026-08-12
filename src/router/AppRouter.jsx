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

import CustomerPolicyDetailPage from "../components/customer/PolicyDetailPage";
import MakeAClaimPage from "../components/customer/MakeAClaimPage";
import PolicyReceiptPage from "../components/customer/PolicyReceiptPage";
import BookMechanicPage from "../components/customer/BookMechanicPage";

import AccountDetailsPage from "../components/customer/AccountDetailsPage";
import BankAccountDetailsPage from "../components/customer/BankAccountDetailsPage";
import DiscountCodePage from "../components/customer/DiscountCodePage";
import YourDiscountsPage from "../components/customer/YourDiscountsPage";
import ReferFriendPage from "../components/customer/ReferFriendPage";

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
import PreviousIncidentsPage from "../components/customer/PreviousIncidentsPage";
import AddIncidentPage from "../components/customer/AddIncidentPage";
import LegalPage from "../components/customer/LegalPage";
import PrivacyPolicyPage from "../components/customer/PrivacyPolicyPage";
import TermsPage from "../components/customer/TermsPage";
import FonPage from "../components/customer/FonPage";
import CarClubDetailPage from "../components/customer/CarClubDetailPage";
import CreateCarClubPage from "../components/customer/CreateCarClubPage";
import CarClubResourcePage from "../components/customer/CarClubResourcePage";
import ChatSupportPage from "../components/customer/ChatSupportWidget";
import Screen, { BackHeader } from "../components/layout/Screen";

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

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<TempForgot />} />
        
        <Route path="/" element={<RoleRedirect />} />
        
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

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Screen><CustomerHome /></Screen>} />
          <Route path="car-clubs" element={<Screen><CarClubsPage /></Screen>} />
          <Route path="car-clubs/create" element={<Screen header={<BackHeader title="New car club" />}><CreateCarClubPage /></Screen>} />
          <Route path="car-clubs/:clubId" element={<Screen header={<BackHeader title="Car club" />}><CarClubDetailPage /></Screen>} />
          <Route path="policies" element={<Screen><PoliciesPage /></Screen>} />
          <Route path="profile" element={<Screen><ProfilePage /></Screen>} />
          <Route path="profile/account" element={<Screen header={<BackHeader title="Account" />}><AccountDetailsPage /></Screen>} />
          <Route
            path="profile/bank-details"
            element={<Screen header={<BackHeader title="Bank details" />}><BankAccountDetailsPage /></Screen>}
          />
          <Route path="profile/discount-code" element={<Screen header={<BackHeader title="Discount code" />}><DiscountCodePage /></Screen>} />
          <Route path="profile/discounts" element={<Screen header={<BackHeader title="Your discounts" />}><YourDiscountsPage /></Screen>} />
          <Route path="profile/refer" element={<Screen header={<BackHeader title="Refer a friend" />}><ReferFriendPage /></Screen>} />
          
          <Route
            path="profile/account/preferred-name"
            element={<Screen header={<BackHeader title="Preferred name" />}><PreferredNamePage /></Screen>}
          />
          <Route path="profile/account/email" element={<Screen header={<BackHeader title="Email address" />}><EmailAddressPage /></Screen>} />
          <Route path="profile/account/email/add" element={<Screen header={<BackHeader title="Add email" />}><AddEmailPage /></Screen>} />
          <Route path="profile/account/mobile" element={<Screen header={<BackHeader title="Mobile number" />}><MobileNumberPage /></Screen>} />
          <Route
            path="profile/account/mobile/add"
            element={<Screen header={<BackHeader title="Add mobile number" />}><AddMobileNumberPage /></Screen>}
          />
          <Route
            path="profile/account/connected"
            element={<Screen header={<BackHeader title="Connected accounts" />}><ConnectedAccountsPage /></Screen>}
          />
          <Route path="profile/account/identity" element={<Screen header={<BackHeader title="Identity" />}><MyIdentityPage /></Screen>} />
          <Route
            path="profile/account/address"
            element={<Screen header={<BackHeader title="Residential address" />}><ResidentialAddressPage /></Screen>}
          />
          <Route
            path="profile/account/marketing"
            element={<Screen header={<BackHeader title="Marketing preferences" />}><MarketingPreferencesPage /></Screen>}
          />
          <Route
            path="profile/account/delete"
            element={<Screen header={<BackHeader title="Delete account" />}><DeleteAccountInfoPage /></Screen>}
          />
          <Route
            path="profile/account/incidents"
            element={<Screen header={<BackHeader title="Previous incidents" />}><PreviousIncidentsPage /></Screen>}
          />
          <Route path="profile/legal" element={<Screen header={<BackHeader title="Legal" />}><LegalPage /></Screen>} />
          <Route path="profile/legal/privacy" element={<Screen header={<BackHeader title="Privacy policy" />}><PrivacyPolicyPage /></Screen>} />
          <Route path="profile/legal/terms" element={<Screen header={<BackHeader title="Terms" />}><TermsPage /></Screen>} />
          <Route path="profile/legal/fon" element={<Screen header={<BackHeader title="Fair usage" />}><FonPage /></Screen>} />
        </Route>
        
        <Route path="/customer/policies/new" element={<Screen header={<BackHeader title="New policy" />}><PolicyQuotePage /></Screen>} />
        <Route
          path="/customer/policies/documents"
          element={<Screen header={<BackHeader title="Policy documents" />}><PolicyDocumentsPage /></Screen>}
        />
        <Route
          path="/customer/policies/documents/ipid"
          element={<Screen header={<BackHeader title="Insurance summary" />}><InsuranceSummaryPage /></Screen>}
        />
        <Route
          path="/customer/policies/documents/wording"
          element={<Screen header={<BackHeader title="Policy wording" />}><PolicyWordingPage /></Screen>}
        />
        <Route
          path="/customer/policies/photos/:step"
          element={<Screen header={<BackHeader title="Photos" />}><VehiclePhotoCapturePage /></Screen>}
        />
        <Route
          path="/customer/policies/photos/:step/camera"
          element={<Screen header={<BackHeader title="Camera" />}><VehicleCameraCapturePage /></Screen>}
        />
        
        <Route
          path="/customer/car-clubs/resources/:resourceId"
          element={<Screen header={<BackHeader title="Resource" />}><CarClubResourcePage /></Screen>}
        />
        
        <Route path="/customer/support" element={<Screen><ChatSupportPage /></Screen>} />
        <Route
          path="/customer/policies/detail"
          element={<Screen header={<BackHeader title="Policy details" />}><CustomerPolicyDetailPage /></Screen>}
        />
        <Route
          path="/customer/policies/receipt"
          element={<Screen header={<BackHeader title="Receipt" />}><PolicyReceiptPage /></Screen>}
        />
        <Route path="/customer/policies/claim" element={<Screen header={<BackHeader title="Make a claim" />}><MakeAClaimPage /></Screen>} />
        <Route
          path="/customer/policies/mechanic"
          element={<Screen header={<BackHeader title="Book a mechanic" />}><BookMechanicPage /></Screen>}
        />
        
        <Route
          path="/customer/profile/account/incidents/add"
          element={<Screen header={<BackHeader title="Add incident" />}><AddIncidentPage /></Screen>}
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Sub Admin"]}>
              <SubAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SubAdminHome />} />
          
          <Route path="policies/:id" element={<PolicyDetailPageSubAdmin />} />
          
          <Route
            path="vehicles/:registration"
            element={<VehicleDetailPageSubAdmin />}
          />
          <Route
            path="customers/:id"
            element={<CustomerDetailPageSubAdmin />}
          />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}