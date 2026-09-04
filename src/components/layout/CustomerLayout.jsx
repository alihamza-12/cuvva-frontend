import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomerBottomNav from "../customer/CustomerBottomNav";
import NotificationPermissionModal from "../customer/NotificationPermissionModal";
import { selectCurrentUser } from "../../features/authSlice";
import {
  loginOneSignalCustomer,
  logoutOneSignalCustomer,
} from "../../services/oneSignal";
import {
  startPolicyNotifications,
  stopPolicyNotifications,
} from "../../services/policyNotificationManager";

export default function CustomerLayout() {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user?.role !== "Customer" || !user?.id) return undefined;

    loginOneSignalCustomer(user.id)
      .catch((error) => {
        console.warn("Push notification initialization unavailable:", error?.message);
      });

    // Policy alerts are delivered to the DEVICE NOTIFICATION PANEL only.
    // The in-app rich card was removed deliberately.
    startPolicyNotifications();

    return () => {
      stopPolicyNotifications();
      logoutOneSignalCustomer();
    };
  }, [user?.id, user?.role]);

  return (
    <div>
      <NotificationPermissionModal customerId={user?.id} />
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}
