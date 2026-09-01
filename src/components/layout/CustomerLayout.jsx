import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomerBottomNav from "../customer/CustomerBottomNav";
import PolicyStatusBanner from "../customer/PolicyStatusBanner";
import { selectCurrentUser } from "../../features/authSlice";
import {
  loginOneSignalCustomer,
  logoutOneSignalCustomer,
} from "../../services/oneSignal";

export default function CustomerLayout() {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user?.role !== "Customer" || !user?.id) return undefined;

    loginOneSignalCustomer(user.id)
      .catch((error) => {
        console.warn("Push notification initialization unavailable:", error?.message);
      });

    return () => {
      logoutOneSignalCustomer();
    };
  }, [user?.id, user?.role]);

  return (
    <div>
      <PolicyStatusBanner />
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}
