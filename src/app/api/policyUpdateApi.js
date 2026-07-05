import { httpClient } from "./httpClient";

export const updatePolicyById = async (id, payload) => {
  return httpClient.put(`/api/policies/${id}`, payload);
};
