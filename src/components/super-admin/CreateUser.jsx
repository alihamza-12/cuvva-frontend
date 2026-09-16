import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import TitleCaseInput from "../common/TitleCaseInput";
import FieldError from "../common/FieldError";
import {
  toTitleCase,
  toUpperCaseValue,
  digitsOnly,
  isValidCardLast4,
  EMAIL_PATTERN,
} from "../../utils/titleCase";

/*
 * Address field.
 *
 * `transform` decides the stored form: "title" for prose lines (first letter
 * capital, rest lower case) and "upper" for the postcode.
 */
const AddressInput = ({
  label,
  value,
  onChange,
  required = false,
  uppercase = false,
  transform = "title",
  readOnly = false,
  error = "",
}) => {
  const InputComponent = transform === "title" ? TitleCaseInput : "input";
  const isUpper = transform === "upper" || uppercase;

  const handleChange = (event) => {
    if (readOnly) return;
    const raw = event.target.value;
    onChange(isUpper ? toUpperCaseValue(raw) : raw);
  };

  return (
    <label className="space-y-1">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
        {label}
        {required ? " *" : ""}
      </span>
      <InputComponent
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        aria-readonly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
          error ? "border-red-500" : "border-[#1e2238]"
        } ${isUpper ? "uppercase" : ""} ${
          readOnly ? "cursor-not-allowed text-[#8a8fbc]" : ""
        }`}
      />
      <FieldError message={error} />
    </label>
  );
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "Sub Admin",
  durationDays: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  drivingLicenceNumber: "",
  // Optional at creation. Only sent for customers.
  lastFourDigits: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postcode: "",
  // Country is fixed platform-wide and is not user-editable.
  country: "GB",
};

export default function CreateUser({ axiosInstance, onCreated }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key) => (value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const handleTextChange = (key) => (event) => setField(key)(event.target.value);

  /*
   * Per-field validation, so an inline message can be shown under the exact
   * input that needs attention rather than only in the banner.
   */
  const buildFieldErrors = () => {
    const next = {};

    if (!formData.fullName.trim()) {
      next.fullName = "Full name is required.";
    }
    if (!formData.email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      next.password = "Password is required.";
    } else if (formData.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    if (
      formData.durationDays &&
      formData.durationDays.trim() !== "" &&
      !(Number(formData.durationDays) > 0)
    ) {
      next.durationDays = "Enter a number of days greater than 0.";
    }

    if (formData.role === "Customer") {
      if (!formData.dateOfBirth) {
        next.dateOfBirth = "Date of birth is required.";
      }
      if (!formData.gender) {
        next.gender = "Select a gender.";
      }
      if (!formData.drivingLicenceNumber.trim()) {
        next.drivingLicenceNumber = "Driving licence is required.";
      }
      if (!formData.addressLine1.trim()) {
        next.addressLine1 = "Address line 1 is required.";
      }
      if (!formData.city.trim()) {
        next.city = "City is required.";
      }
      if (!formData.postcode.trim()) {
        next.postcode = "Postcode is required.";
      }
      // Optional: blank is fine, anything else must be exactly four digits.
      if (
        formData.lastFourDigits.trim() &&
        !isValidCardLast4(formData.lastFourDigits)
      ) {
        next.lastFourDigits =
          "Enter exactly the last 4 digits of the payment card.";
      }
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationErrors = buildFieldErrors();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: toTitleCase(formData.fullName),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.durationDays && formData.durationDays.trim() !== "") {
        payload.durationDays = parseInt(formData.durationDays, 10);
      }

      if (formData.role === "Customer") {
        payload.dateOfBirth = formData.dateOfBirth;
        payload.gender = formData.gender;
        // Mobile number is stored on the customer and appears on the policy
        // certificate, the emailed PDF and the customer's own profile screen.
        if (formData.phone.trim()) payload.phone = formData.phone.trim();
        payload.drivingLicenceNumber = toUpperCaseValue(
          formData.drivingLicenceNumber.trim(),
        );
        // Optional card marker — omitted entirely when left blank.
        if (formData.lastFourDigits.trim()) {
          payload.lastFourDigits = digitsOnly(formData.lastFourDigits);
        }
        payload.address = {
          line1: toTitleCase(formData.addressLine1),
          line2: toTitleCase(formData.addressLine2),
          city: toTitleCase(formData.city),
          county: toTitleCase(formData.county),
          postcode: toUpperCaseValue(formData.postcode.trim()),
          country: "GB",
        };
      }

      const response = await axiosInstance.post("/api/auth/register", payload);

      setSuccess(response.data?.message || `User created as ${payload.role}.`);
      setFormData({ ...EMPTY_FORM, role: formData.role });

      if (onCreated) onCreated();

      /*
       * A newly created customer lands on their own customer page so the admin
       * can verify the record (name casing, address, card marker). Sub Admin
       * accounts stay on this form.
       */
      const createdCustomerId = response?.data?.user?.id;
      if (payload.role === "Customer" && createdCustomerId) {
        setTimeout(() => {
          navigate(`/admin/customers/${createdCustomerId}`, { replace: true });
        }, 900);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-8 text-xs animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 md:p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Create user
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          This form uses the fields accepted by{" "}
          <span className="text-white">/api/auth/register</span>. Names and
          address lines are stored with a capital first letter, postcodes and
          driving licences in capitals.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Full Name
            </label>
            <TitleCaseInput
              type="text"
              placeholder="Jane Sarah Doe"
              value={formData.fullName}
              onChange={handleTextChange("fullName")}
              className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                fieldErrors.fullName ? "border-red-500" : "border-[#1e2238]"
              }`}
            />
            <FieldError message={fieldErrors.fullName} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleTextChange("email")}
              className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                fieldErrors.email ? "border-red-500" : "border-[#1e2238]"
              }`}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleTextChange("password")}
              className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                fieldErrors.password ? "border-red-500" : "border-[#1e2238]"
              }`}
            />
            <FieldError message={fieldErrors.password} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Role
            </label>
            <select
              value={formData.role}
              onChange={handleTextChange("role")}
              className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff] transition-colors"
            >
              <option value="Sub Admin">Sub Admin Node</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          {formData.role === "Customer" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleTextChange("dateOfBirth")}
                  className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                    fieldErrors.dateOfBirth
                      ? "border-red-500"
                      : "border-[#1e2238]"
                  }`}
                />
                <FieldError message={fieldErrors.dateOfBirth} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleTextChange("phone")}
                  placeholder="07xxx xxxxxx"
                  className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={handleTextChange("gender")}
                  className={`w-full min-h-[44px] bg-[#0d0f1d] border rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff] transition-colors ${
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
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Driving Licence *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SMITH••••J99AB"
                  value={formData.drivingLicenceNumber}
                  onChange={(event) =>
                    setField("drivingLicenceNumber")(
                      toUpperCaseValue(event.target.value),
                    )
                  }
                  className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs uppercase text-white outline-none focus:border-[#644aff] transition-colors ${
                    fieldErrors.drivingLicenceNumber
                      ? "border-red-500"
                      : "border-[#1e2238]"
                  }`}
                />
                <FieldError message={fieldErrors.drivingLicenceNumber} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Last 4 digits of payment card (optional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  placeholder="0000"
                  value={formData.lastFourDigits}
                  onChange={(event) =>
                    setField("lastFourDigits")(digitsOnly(event.target.value))
                  }
                  className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                    fieldErrors.lastFourDigits
                      ? "border-red-500"
                      : "border-[#1e2238]"
                  }`}
                />
                <FieldError message={fieldErrors.lastFourDigits} />
              </div>

              <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                Customer Address
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AddressInput
                  label="Address line 1"
                  required
                  value={formData.addressLine1}
                  onChange={setField("addressLine1")}
                  error={fieldErrors.addressLine1}
                />
                <AddressInput
                  label="Address line 2"
                  value={formData.addressLine2}
                  onChange={setField("addressLine2")}
                />
                <AddressInput
                  label="City"
                  required
                  value={formData.city}
                  onChange={setField("city")}
                  error={fieldErrors.city}
                />
                <AddressInput
                  label="County"
                  value={formData.county}
                  onChange={setField("county")}
                />
                <AddressInput
                  label="Postcode"
                  required
                  transform="upper"
                  value={formData.postcode}
                  onChange={setField("postcode")}
                  error={fieldErrors.postcode}
                />
                <AddressInput
                  label="Country"
                  required
                  readOnly
                  value="GB"
                  onChange={() => {}}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Temporal Limitation (Optional Days)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Infinite access if blank"
              value={formData.durationDays}
              onChange={handleTextChange("durationDays")}
              className={`w-full min-h-[44px] bg-white/5 border rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${
                fieldErrors.durationDays ? "border-red-500" : "border-[#1e2238]"
              }`}
            />
            <FieldError message={fieldErrors.durationDays} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#644aff]/10"
          >
            {loading ? "Creating user..." : "Create user"}
          </button>
        </form>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-bold tracking-wide text-white uppercase">
            What gets saved
          </h4>
          <p className="text-[11px] text-[#6b7280] mt-2 leading-relaxed">
            The backend registration endpoint currently persists these fields:
            <span className="block mt-2 text-white/90 text-[11px] font-semibold">
              fullName, email, password, role, durationDays (→ expiresAt),
              createdBy
            </span>
            <span className="block mt-1 text-white/90 text-[11px] font-semibold">
              For customers: dateOfBirth, gender, phone, drivingLicenceNumber,
              address, lastFourDigits (optional)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
