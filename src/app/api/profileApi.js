import { httpClient } from "./httpClient";

export const useGetMyProfileQuery = async (id) => {
  return httpClient.get(`/api/me`);
};