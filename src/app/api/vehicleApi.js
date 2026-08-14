import { httpClient } from "./httpClient";

const REGCHECK_URL = "https://www.regcheck.org.uk/api/reg.asmx/Check";
const REGCHECK_USERNAME =
  import.meta.env?.VITE_REGCHECK_USERNAME || "jackcanada123";

const cleanRegistration = (registration) =>
  (registration || "").trim().toUpperCase().replace(/\s+/g, "");

const currentTextValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  return value?.CurrentTextValue?.trim?.() || "";
};

const optionalNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== ""
    ? number
    : undefined;
};

const createLookupError = (message, status) => {
  const error = new Error(message);

  // Keep the same error shape used by the existing customer UI.
  error.response = {
    status,
    data: { message },
  };

  return error;
};

const normalizeRegCheckVehicle = (rawVehicle, registration) => {
  const make =
    currentTextValue(rawVehicle.CarMake) ||
    currentTextValue(rawVehicle.MakeDescription);
  const model =
    currentTextValue(rawVehicle.CarModel) ||
    currentTextValue(rawVehicle.ModelDescription);

  if (!make && !model) {
    throw createLookupError(
      "We couldn't find that vehicle. Please check the plate and try again.",
    );
  }

  const year = optionalNumber(rawVehicle.RegistrationYear);
  const engineCapacityCC = optionalNumber(
    currentTextValue(rawVehicle.EngineSize),
  );

  return {
    // RegCheck does not provide the database _id expected by the current UI,
    // so the cleaned registration is used as a stable frontend-only id.
    _id: registration,
    registration,
    make,
    model,
    ownerLabel: `${make} ${model}`.trim(),
    description: rawVehicle.Description || `${make} ${model}`.trim(),
    year,
    colour: rawVehicle.Colour || "",
    fuelType: currentTextValue(rawVehicle.FuelType),
    engineCapacityCC,
    bodyStyle: currentTextValue(rawVehicle.BodyStyle),
    variant: rawVehicle.Variant || "",
    imageUrl: rawVehicle.ImageUrl || "",
    lookupSource: "regcheck",
  };
};

/**
 * Customer-facing lookup that calls RegCheck directly from the browser.
 * It returns an Axios-compatible response shape so the existing UI flow does
 * not need to change.
 */
export const getExternalVehicleByRegistration = async (registration) => {
  const cleaned = cleanRegistration(registration);

  if (!cleaned) {
    throw createLookupError("Please enter a registration number.", 400);
  }

  const params = new URLSearchParams({
    RegistrationNumber: cleaned,
    username: REGCHECK_USERNAME,
  });

  let response;

  try {
    response = await fetch(`${REGCHECK_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/xml, text/xml, */*",
      },
    });
  } catch {
    throw createLookupError(
      "Vehicle lookup is unavailable right now. Please try again.",
    );
  }

  if (!response.ok) {
    throw createLookupError(
      response.status === 429
        ? "Too many vehicle lookups. Please wait a moment and try again."
        : "We couldn't find that vehicle. Please check the plate and try again.",
      response.status,
    );
  }

  const xmlText = await response.text();
  const xml = new DOMParser().parseFromString(xmlText, "text/xml");

  if (xml.querySelector("parsererror")) {
    throw createLookupError(
      "The vehicle service returned an invalid response. Please try again.",
    );
  }

  const vehicleJsonElement =
    xml.getElementsByTagNameNS("*", "vehicleJson")[0] ||
    xml.querySelector("vehicleJson");
  const vehicleJson = vehicleJsonElement?.textContent?.trim();

  if (!vehicleJson) {
    throw createLookupError(
      "We couldn't find that vehicle. Please check the plate and try again.",
    );
  }

  let rawVehicle;

  try {
    rawVehicle = JSON.parse(vehicleJson);
  } catch {
    throw createLookupError(
      "The vehicle service returned an invalid response. Please try again.",
    );
  }

  const vehicle = normalizeRegCheckVehicle(rawVehicle, cleaned);

  return {
    data: {
      vehicle,
    },
    status: response.status,
  };
};

// Existing backend lookup remains unchanged for admin/sub-admin screens.
export const getVehicleByRegistration = async (registration) => {
  const cleaned = cleanRegistration(registration);
  return httpClient.get(`/api/vehicles/lookup/${cleaned}`);
};

export const createVehicle = async (payload) => {
  return httpClient.post("/api/vehicles", payload);
};
