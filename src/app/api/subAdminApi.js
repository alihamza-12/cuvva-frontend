import { httpClient } from "./httpClient";

export const getSubAdminById = async (id) => {
  return httpClient.get(`/api/management/subadmins/${id}`);
};
