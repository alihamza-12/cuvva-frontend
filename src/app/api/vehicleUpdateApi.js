import { httpClient } from "./httpClient";

export const updateVehicle = async (id, payload) => {
  return httpClient.patch(`/api/vehicles/${id}`, payload);
};
