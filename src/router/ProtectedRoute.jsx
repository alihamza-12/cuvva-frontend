import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/authSlice";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector(selectCurrentUser);

  // If not logged in, boot to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role doesn't match the specific route allowance
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
