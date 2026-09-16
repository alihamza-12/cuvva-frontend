import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../app/api/httpClient";
import UppercaseInput from "../../components/common/UppercaseInput";
import TitleCaseInput from "../../components/common/TitleCaseInput";
import FieldError from "../../components/common/FieldError";
import {
  toTitleCase,
  toUpperCaseValue,
  digitsOnly,
  isValidCardLast4,
  EMAIL_PATTERN,
  requiredMessage,
} from "../../utils/titleCase";

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  drivingLicenceNumber: "",
  // Optional at creation. Stored on the customer so Create Policy can
  // pre-fill the payment card field.
  lastFourDigits: "",

  line1: "",
  line2: "",
  city: "",
  county: "",
  postcode: "",
  // Country is fixed platform-wide and is not user-editable.
  country: "GB",

  useDurationDays: true,
  durationDays: "365",
  expiresAt: "",
};

export default function CreateCustomerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  /*
   * Every required field is checked here so the message can be shown under the
   * field it belongs to. Returns an object of { fieldName: message }.
   */
  const validate = (values) => {
    const nextErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = requiredMessage("Full name");
    }
    if (!values.email.trim()) {
      nextErrors.email = requiredMessage("Email");
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!values.password.trim()) {
      nextErrors.password = requiredMessage("Password");
    } else if (values.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (!values.dateOfBirth) {
      nextErrors.dateOfBirth = requiredMessage("Date of birth");
    }
    if (!values.gender) {
      nextErrors.gender = "Select a gender.";
    }
    if (!values.drivingLicenceNumber.trim()) {
      nextErrors.drivingLicenceNumber = requiredMessage("Driving licence");
    }

    if (!values.line1.trim()) {
      nextErrors.line1 = requiredMessage("Address line 1");
    }
    if (!values.city.trim()) {
      nextErrors.city = requiredMessage("City");
    }
    if (!values.postcode.trim()) {
      nextErrors.postcode = requiredMessage("Postcode");
    }

    // Optional: blank is fine, anything else must be exactly four digits.
    if (values.lastFourDigits.trim() && !isValidCardLast4(values.lastFourDigits)) {
      nextErrors.lastFourDigits =
        "Enter exactly the last 4 digits of the payment card.";
    }

    if (values.useDurationDays) {
      const duration = Number(values.durationDays);
      if (!Number.isFinite(duration) || duration <= 0) {
        nextErrors.durationDays = "Enter a duration of at least 1 day.";
      }
    } else if (!values.expiresAt) {
      nextErrors.expiresAt = requiredMessage("Expiry date");
    }

    return nextErrors;
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const validationErrors = validate(form);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        role: "Customer",
        // Names and address prose are stored title cased, so they are sent
        // already normalised ("jane doe" -> "Jane Doe").
        fullName: toTitleCase(form.fullName),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone?.trim() || undefined,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        drivingLicenceNumber: toUpperCaseValue(
          form.drivingLicenceNumber.trim(),
        ),
        // Optional card marker — omitted entirely when left blank.
        lastFourDigits: form.lastFourDigits.trim()
          ? digitsOnly(form.lastFourDigits)
          : undefined,

        durationDays: form.useDurationDays
          ? Number(form.durationDays)
          : undefined,
        expiresAt: form.useDurationDays
          ? undefined
          : new Date(form.expiresAt).toISOString(),

        line1: toTitleCase(form.line1),
        line2: toTitleCase(form.line2),
        city: toTitleCase(form.city),
        county: toTitleCase(form.county),
        postcode: toUpperCaseValue(form.postcode.trim()),
        country: "GB",
      };

      payload.address = {
        line1: payload.line1,
        line2: payload.line2,
        city: payload.city,
        county: payload.county,
        postcode: payload.postcode,
        country: payload.country,
      };
      delete payload.line1;
      delete payload.line2;
      delete payload.city;
      delete payload.county;
      delete payload.postcode;

      payload.address = Object.fromEntries(
        Object.entries(payload.address).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      );
      if (Object.keys(payload.address).length === 0) delete payload.address;

      const res = await httpClient.post("/api/auth/register", payload);

      const msg = res?.data?.message || "Customer created successfully.";
      setSuccessMsg(msg);

      /*
       * Straight to the new customer's page so the admin can verify what was
       * stored (name casing, address, card marker). Falls back to the customer
       * list if the API did not return an id.
       */
      const createdCustomerId = res?.data?.user?.id;
      const destination = createdCustomerId
        ? `/dashboard/customers/${createdCustomerId}`
        : "/dashboard?tab=my-customers";

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create customer.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-[#1e2238]">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white">
              Create Customer
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Sub Admins can register customers within their own ownership
              scope.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard?tab=my-customers", { replace: true })
            }
            className="px-4 py-2 bg-[#060814] hover:bg-[#1a1d33] border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-lg text-[10px] uppercase transition-all"
          >
            Back to My Customers
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 mt-4 text-xs font-medium text-red-200 border rounded-xl bg-red-500/10 border-red-500/20">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="px-4 py-3 mt-4 text-xs font-medium text-green-200 border rounded-xl bg-green-500/10 border-green-500/20">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full name (required)">
              <TitleCaseInput
                value={form.fullName}
                onChange={handleChange("fullName")}
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                  fieldErrors.fullName ? "border-red-500" : "border-[#1e2238]"
                }`}
                placeholder="e.g. Jane Sarah Doe"
              />
              <FieldError message={fieldErrors.fullName} />
            </Field>

            <Field label="Email (required)">
              <input
                value={form.email}
                onChange={handleChange("email")}
                type="email"
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                  fieldErrors.email ? "border-red-500" : "border-[#1e2238]"
                }`}
                placeholder="e.g. jane@example.com"
              />
              <FieldError message={fieldErrors.email} />
            </Field>

            <Field label="Password (required, min 6)">
              <input
                value={form.password}
                onChange={handleChange("password")}
                type="password"
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                  fieldErrors.password ? "border-red-500" : "border-[#1e2238]"
                }`}
                placeholder="Create customer password"
              />
              <FieldError message={fieldErrors.password} />
            </Field>

            <Field label="Phone (optional)">
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. +44..."
              />
            </Field>

            <Field label="Date of birth (required)">
              <input
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                type="date"
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white outline-none focus:border-[#00f0ff] ${
                  fieldErrors.dateOfBirth ? "border-red-500" : "border-[#1e2238]"
                }`}
              />
              <FieldError message={fieldErrors.dateOfBirth} />
            </Field>

            <Field label="Gender (required)">
              <select
                value={form.gender}
                onChange={handleChange("gender")}
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white outline-none focus:border-[#00f0ff] ${
                  fieldErrors.gender ? "border-red-500" : "border-[#1e2238]"
                }`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <FieldError message={fieldErrors.gender} />
            </Field>

            <Field label="Driving licence (required)">
              <UppercaseInput
                value={form.drivingLicenceNumber}
                onChange={handleChange("drivingLicenceNumber")}
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs uppercase text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                  fieldErrors.drivingLicenceNumber
                    ? "border-red-500"
                    : "border-[#1e2238]"
                }`}
                placeholder="e.g. SMITH••••J99AB"
              />
              <FieldError message={fieldErrors.drivingLicenceNumber} />
            </Field>

            <Field label="Last 4 digits of payment card (optional)">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={form.lastFourDigits}
                onChange={(event) => {
                  const value = digitsOnly(event.target.value);
                  setForm((prev) => ({ ...prev, lastFourDigits: value }));
                  setFieldErrors((prev) => {
                    if (!prev.lastFourDigits) return prev;
                    const next = { ...prev };
                    delete next.lastFourDigits;
                    return next;
                  });
                }}
                placeholder="0000"
                className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                  fieldErrors.lastFourDigits
                    ? "border-red-500"
                    : "border-[#1e2238]"
                }`}
              />
              <FieldError message={fieldErrors.lastFourDigits} />
            </Field>
          </div>

          <div className="mt-8">
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-3">
              Address (required)
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Line 1 (required)">
                <TitleCaseInput
                  value={form.line1}
                  onChange={handleChange("line1")}
                  className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                    fieldErrors.line1 ? "border-red-500" : "border-[#1e2238]"
                  }`}
                  placeholder="Street address"
                />
                <FieldError message={fieldErrors.line1} />
              </Field>

              <Field label="Line 2">
                <TitleCaseInput
                  value={form.line2}
                  onChange={handleChange("line2")}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="Flat / Suite / Apartment"
                />
              </Field>

              <Field label="City (required)">
                <TitleCaseInput
                  value={form.city}
                  onChange={handleChange("city")}
                  className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                    fieldErrors.city ? "border-red-500" : "border-[#1e2238]"
                  }`}
                  placeholder="Town / City"
                />
                <FieldError message={fieldErrors.city} />
              </Field>

              <Field label="County">
                <TitleCaseInput
                  value={form.county}
                  onChange={handleChange("county")}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="County / Region"
                />
              </Field>

              <Field label="Postcode (required)">
                <UppercaseInput
                  value={form.postcode}
                  onChange={handleChange("postcode")}
                  className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                    fieldErrors.postcode ? "border-red-500" : "border-[#1e2238]"
                  }`}
                  placeholder="e.g. AB12 3CD"
                />
                <FieldError message={fieldErrors.postcode} />
              </Field>

              <Field label="Country (required)">
                <input
                  value="GB"
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-[#8a8fbc] cursor-not-allowed outline-none"
                />
              </Field>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-3">
              Expiry (required)
            </div>

            <div className="flex flex-col gap-3 mb-4 md:flex-row">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, useDurationDays: true }))
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.useDurationDays
                    ? "bg-[#00f0ff]/10 text-[#e9fdff] border-[#00f0ff]/25"
                    : "bg-white/5 text-[#6b7280] border-[#1e2238] hover:text-white hover:border-white/10"
                }`}
              >
                Duration (days)
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, useDurationDays: false }))
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  !form.useDurationDays
                    ? "bg-[#00f0ff]/10 text-[#e9fdff] border-[#00f0ff]/25"
                    : "bg-white/5 text-[#6b7280] border-[#1e2238] hover:text-white hover:border-white/10"
                }`}
              >
                Expiry date
              </button>
            </div>

            {form.useDurationDays ? (
              <Field label="Duration days">
                <input
                  value={form.durationDays}
                  onChange={handleChange("durationDays")}
                  type="number"
                  min={1}
                  className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] ${
                    fieldErrors.durationDays
                      ? "border-red-500"
                      : "border-[#1e2238]"
                  }`}
                />
                <FieldError message={fieldErrors.durationDays} />
              </Field>
            ) : (
              <Field label="Expires at">
                <input
                  value={form.expiresAt}
                  onChange={handleChange("expiresAt")}
                  type="datetime-local"
                  className={`w-full min-h-[44px] px-3 py-2 bg-[#060814] border rounded-xl text-xs text-white outline-none focus:border-[#00f0ff] ${
                    fieldErrors.expiresAt ? "border-red-500" : "border-[#1e2238]"
                  }`}
                />
                <FieldError message={fieldErrors.expiresAt} />
              </Field>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-8 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setForm({ ...EMPTY_FORM });
                setFieldErrors({});
                setError("");
                setSuccessMsg("");
              }}
              disabled={submitting}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 bg-white/5 hover:bg-white/10 border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/25 text-[#e9fdff] font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
