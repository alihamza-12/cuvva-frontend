import { httpClient } from "./httpClient";

export const getSubAdminById = async (id) => {
  return httpClient.get(`/api/management/subadmins/${id}`);
};

export const getSubAdminPolicyPermissions = async (id) => {
  return httpClient.get(`/api/management/subadmins/${id}/policy-permissions`);
};

export const updateSubAdminPolicyPermissions = async (
  id,
  customerIds,
  restricted,
) => {
  return httpClient.patch(
    `/api/management/subadmins/${id}/policy-permissions`,
    {
      customerIds,
      restricted,
    },
  );
};
