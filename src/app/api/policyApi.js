import { httpClient } from "./httpClient";

export const getPolicyById = async (id) => {
  return httpClient.get(`/api/policies/${id}`);
};

export const getMyPolicies = async () => {
  return httpClient.get(`/api/policies/my`);
};
