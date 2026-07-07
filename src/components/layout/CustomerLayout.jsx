import React from "react";
import { Outlet } from "react-router-dom";
import CustomerBottomNav from "../customer/CustomerBottomNav";

/**
 * frontend/src/components/layout/CustomerLayout.jsx
 *
 * Shell for all customer-facing pages: renders the current page via
 * <Outlet/> and pins the CustomerBottomNav at the bottom, matching
 * AdminLayout.jsx / SubAdminLayout.jsx's role as the layout wrapper
 * used in AppRouter.jsx for the "customer" role branch.
 */
export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}
