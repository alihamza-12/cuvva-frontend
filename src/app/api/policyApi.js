import { httpClient } from "./httpClient";

export const getPolicyById = async (id) => {
  return httpClient.get(`/api/policies/${id}`);
};

export const getMyPolicies = async () => {
  return httpClient.get("/api/policies/my");
};

export const getMyPolicyById = async (id) => {
  return httpClient.get(`/api/policies/customer/${id}`);
};

export const getPolicyDocument = async (id) => {
  return httpClient.get(`/api/policies/${id}/document`, {
    responseType: "blob",
  });
};

export const getPolicyDocumentData = async (id) => {
  return httpClient.get(`/api/policies/${id}/document-data`);
};

/*
 * Permanently delete a policy (Super Admin only). The customer -> vehicle link
 * is archived server-side before the row is removed.
 */
export const deletePolicy = async (policyId) =>
  httpClient.delete(`/api/policies/${policyId}`);
