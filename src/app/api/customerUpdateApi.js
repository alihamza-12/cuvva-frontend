import { httpClient } from "./httpClient";

export const updateCustomer = async (id, payload) => {
  return httpClient.patch(`/api/customers/${id}`, payload);
};

export const updateCustomerPreferredName = async (preferredName) => {
  return httpClient.patch("/api/customers/me", { preferredName });
};
