import React, { useEffect, useMemo, useState } from "react";
import { SubAdminOwnedCustomers } from "./SubAdminOwnedCustomers";

export function SubAdminOwnCustomers({ axiosInstance, onRefresh }) {

  return (
    <SubAdminOwnedCustomers
      axiosInstance={axiosInstance}
      onRefresh={onRefresh}
    />
  );
}
