import { httpClient } from "./httpClient";

export const updateVehicle = async (id, payload) => {
  return httpClient.patch(`/api/vehicles/${id}`, payload);
};

export const removeVehicleForCurrentAdmin = async (id) => {
  return httpClient.delete(`/api/vehicles/${id}`);
};
