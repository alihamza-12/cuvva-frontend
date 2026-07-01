import { httpClient } from "./httpClient";

export const getPolicyById = async (id) => {
  return httpClient.get(`/api/policies/${id}`);
};
