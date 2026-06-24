import { httpClient } from "./httpClient";

const cleanRegistration = (registration) =>
  (registration || "").trim().toUpperCase().replace(/\s+/g, "");

export const getVehicleByRegistration = async (registration) => {
  const cleaned = cleanRegistration(registration);
  return httpClient.get(`/api/vehicles/lookup/${cleaned}`);
};

export const createVehicle = async (payload) => {
  return httpClient.post("/api/vehicles", payload);
};
