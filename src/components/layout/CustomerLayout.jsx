import React from "react";
import { Outlet } from "react-router-dom";

import CustomerBottomNav from "../customer/CustomerBottomNav";

export default function CustomerLayout() {
  return (
    <div className="text-white bg-black customer-app-shell">
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}