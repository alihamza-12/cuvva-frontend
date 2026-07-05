import React, { useEffect, useMemo, useState } from "react";
import { SubAdminOwnedCustomers } from "./SubAdminOwnedCustomers";

export function SubAdminOwnCustomers({ axiosInstance, onRefresh }) {
  // This wrapper exists so sub-admin dashboard can have dedicated folder components.
  return (
    <SubAdminOwnedCustomers
      axiosInstance={axiosInstance}
      onRefresh={onRefresh}
    />
  );
}
