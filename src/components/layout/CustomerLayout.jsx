import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomerBottomNav from "../customer/CustomerBottomNav";
import PolicyNotificationBar from "../customer/PolicyNotificationBar";
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

    // Panel alerts (system notification tray) run alongside the rich
    // in-app PolicyNotificationBar.
    startPolicyNotifications();

    return () => {
      stopPolicyNotifications();
      logoutOneSignalCustomer();
    };
  }, [user?.id, user?.role]);

  return (
    <div>
      <NotificationPermissionModal customerId={user?.id} />
      <PolicyNotificationBar />
      <Outlet />
      <CustomerBottomNav />
    </div>
  );
}
