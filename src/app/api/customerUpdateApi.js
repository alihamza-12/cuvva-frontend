import { httpClient } from "./httpClient";

export const updateCustomer = async (id, payload) => {
  return httpClient.patch(`/api/customers/${id}`, payload);
};

/**
 * Self-service: Customer updates their own preferredName.
 * Calls PATCH /api/customers/me (see customers.js).
 */
export const updateCustomerPreferredName = async (preferredName) => {
  return httpClient.patch("/api/customers/me", { preferredName });
};
