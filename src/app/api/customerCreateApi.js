import { httpClient } from "./httpClient";

export const registerCustomerBySubAdmin = async (payload) => {
  return httpClient.post("/api/auth/register", payload);
};
