import { httpClient } from "./httpClient";

export const getCustomerById = async (id) => {
  return httpClient.get(`/api/customers/${id}`);
};
