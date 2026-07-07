import React from "react";
import { Outlet } from "react-router-dom";
import CustomerBottomNav from "../customer/CustomerBottomNav";


export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}
