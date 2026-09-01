import { httpClient } from "./httpClient";

export const getCustomerById = async (id) => {
  return httpClient.get(`/api/customers/${id}`);
};

export const getNotificationPreferences = async () =>
  httpClient.get("/api/customers/me/notification-preferences");

export const updateNotificationPreferences = async (preferences) =>
  httpClient.patch("/api/customers/me/notification-preferences", preferences);
