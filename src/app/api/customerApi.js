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

/*
 * The signed-in customer's own profile, including their residential address.
 */
export const getMyProfile = async () => httpClient.get("/api/customers/me");

/*
 * Update the signed-in customer's residential address. Saved onto the same
 * User.address document the admin create forms write, so the policy
 * certificate PDF and the in-app policy document pick it up immediately.
 */
export const updateMyAddress = async (address) =>
  httpClient.patch("/api/customers/me", { address });
