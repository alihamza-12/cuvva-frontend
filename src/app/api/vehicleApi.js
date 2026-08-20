import { httpClient } from "./httpClient";

const REGCHECK_URL = "https://www.regcheck.org.uk/api/reg.asmx/Check";
const REGCHECK_CREDITS_URL =
  "https://www.regcheck.org.uk/ajax/getcredits.aspx";

const REGCHECK_USERNAMES = [
  import.meta.env?.VITE_REGCHECK_USERNAME || "jackcanada123",
  "jackcanada12",
  "jackcanada1",
  "jackcanada01",
].filter(Boolean);

const RECENTLY_VIEWED_KEY = "customer_recently_viewed_vehicles";
const MAX_CACHED_VEHICLES = 50;

const cleanRegistration = (registration) =>
  (registration || "").trim().toUpperCase().replace(/\s+/g, "");

const readCachedVehicles = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]",
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const getCachedVehicle = (registration) =>
  readCachedVehicles().find(
    (vehicle) =>
      cleanRegistration(vehicle?.registration) === registration &&
      (vehicle?.make || vehicle?.model),
  );

const saveVehicleToCache = (vehicle) => {
  try {
    const cachedVehicles = readCachedVehicles();
    const next = [
      vehicle,
      ...cachedVehicles.filter(
        (cachedVehicle) =>
          cleanRegistration(cachedVehicle?.registration) !==
          vehicle.registration,
      ),
    ].slice(0, MAX_CACHED_VEHICLES);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    // A storage failure must not stop a successful vehicle lookup.
  }
};

const currentTextValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  const currentValue = value?.CurrentTextValue;
  return currentValue === null || currentValue === undefined
    ? ""
    : String(currentValue).trim();
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

const getCreditBalance = async (username) => {
  try {
    const params = new URLSearchParams({ username });
    const response = await fetch(
      `${REGCHECK_CREDITS_URL}?${params.toString()}`,
    );

    if (!response.ok) {
      return null;
    }

    const balance = Number((await response.text()).trim());
    return Number.isFinite(balance) ? balance : null;
  } catch {
    // If the balance endpoint is temporarily unavailable, allow the normal
    // vehicle request to decide whether this account can be used.
    return null;
  }
};

const requestRegCheckVehicle = async (registration) => {
  let exhaustedAccountFound = false;

  for (const username of REGCHECK_USERNAMES) {
    const params = new URLSearchParams({
      RegistrationNumber: registration,
      username,
    });

    let response;

    console.info("[RegCheck] API call made", {
      registration,
      username,
    });

    try {
      response = await fetch(`${REGCHECK_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/xml, text/xml, */*",
        },
      });
    } catch (requestError) {
      console.error("[RegCheck] API request could not be completed", {
        registration,
        username,
        error: requestError?.message || "Network error",
      });
      throw createLookupError(
        "Vehicle lookup is unavailable right now. Please try again.",
      );
    }

    if (response.ok) {
      const remainingCredits = await getCreditBalance(username);
      console.info("[RegCheck] API call succeeded", {
        registration,
        username,
        remainingCredits:
          remainingCredits === null ? "Unavailable" : remainingCredits,
      });
      return response;
    }

    console.warn("[RegCheck] API call failed", {
      registration,
      username,
      status: response.status,
    });

    // Authentication, authorization, and throttling failures can be tied to
    // one account, so try the next configured username.
    if ([401, 403, 429].includes(response.status)) {
      continue;
    }

    // RegCheck can return status 500 both for an invalid registration and an
    // exhausted account. Check the balance only after a failed lookup so free
    // provider test plates can still work when the paid balance is zero.
    if (response.status >= 500) {
      const remainingBalance = await getCreditBalance(username);
      console.info("[RegCheck] Account credit balance", {
        username,
        remainingCredits:
          remainingBalance === null ? "Unavailable" : remainingBalance,
      });

      if (remainingBalance !== null && remainingBalance <= 0) {
        exhaustedAccountFound = true;
        continue;
      }
    }

    // The account still has credit, so this is most likely a bad/unknown plate;
    // do not waste requests by sending it through every other account.
    return response;
  }

  throw createLookupError(
    exhaustedAccountFound
      ? "All configured vehicle lookup accounts are out of credits."
      : "Vehicle lookup is unavailable right now. Please try again.",
    503,
  );
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
    transmission: currentTextValue(rawVehicle.Transmission),
    vehicleIdentificationNumber: String(
      rawVehicle.VehicleIdentificationNumber || "",
    )
      .trim()
      .toUpperCase(),
    engineCode: String(rawVehicle.EngineCode || "").trim(),
    engineNumber: String(rawVehicle.EngineNumber || "").trim(),
    immobiliser: currentTextValue(rawVehicle.Immobiliser),
    indicativeValue: optionalNumber(
      currentTextValue(rawVehicle.IndicativeValue),
    ),
    driverSide: currentTextValue(rawVehicle.DriverSide),
    numberOfDoors: optionalNumber(
      currentTextValue(rawVehicle.NumberOfDoors),
    ),
    numberOfSeats: optionalNumber(
      currentTextValue(rawVehicle.NumberOfSeats),
    ),
    vehicleInsuranceGroup: optionalNumber(
      rawVehicle.VehicleInsuranceGroup,
    ),
    vehicleInsuranceGroupOutOf: optionalNumber(
      rawVehicle.VehicleInsuranceGroupOutOf,
    ),
    abiCode: rawVehicle.ABICode || "",
    imageUrl: rawVehicle.ImageUrl || "",
    lookupSource: "regcheck",
    // Keep the complete provider response so future visits can reuse it
    // without making another RegCheck request.
    regCheckData: rawVehicle,
  };
};

/**
 * Customer-facing lookup that calls RegCheck directly from the browser.
 * It returns an Axios-compatible response shape so the existing UI flow does
 * not need to change.
 */
export const getExternalVehicleByRegistration = async (
  registration,
  { bypassCache = false } = {},
) => {
  const cleaned = cleanRegistration(registration);

  if (!cleaned) {
    throw createLookupError("Please enter a registration number.", 400);
  }

  const cachedVehicle = getCachedVehicle(cleaned);

  if (cachedVehicle && !bypassCache) {
    // Move the selected vehicle to the front of Recently viewed.
    saveVehicleToCache(cachedVehicle);

    return {
      data: {
        vehicle: cachedVehicle,
      },
      status: 200,
      fromCache: true,
    };
  }

  if (!REGCHECK_USERNAMES.length) {
    throw createLookupError(
      "Vehicle lookup is not configured. Please contact support.",
      500,
    );
  }

  const response = await requestRegCheckVehicle(cleaned);

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
  saveVehicleToCache(vehicle);

  return {
    data: {
      vehicle,
    },
    status: response.status,
    fromCache: false,
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
