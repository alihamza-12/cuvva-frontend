import { httpClient } from "./httpClient";

export const getCustomerById = async (id) => {
  return httpClient.get(`/api/customers/${id}`);
};

export const getNotificationPreferences = async () =>
  httpClient.get("/api/customers/me/notification-preferences");

export const updateNotificationPreferences = async (preferences) =>
  httpClient.patch("/api/customers/me/notification-preferences", preferences);

/*
 * Every vehicle this customer has previously been insured on.
 * Merges live policies with the retention archive on the server, so older cars
 * stay visible after their policies have been cleaned up.
 */
export const getCustomerVehicles = async (customerId, config = {}) =>
  httpClient.get(`/api/customers/${customerId}/vehicles`, config);
