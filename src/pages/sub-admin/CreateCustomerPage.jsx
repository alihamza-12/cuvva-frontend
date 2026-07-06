import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../app/api/httpClient";
import { registerCustomerBySubAdmin } from "../../app/api/customerCreateApi";

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

export default function CreateCustomerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    // address (flat)
    line1: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
    country: "UK",
    // expiry options
    useDurationDays: true,
    durationDays: "365",
    expiresAt: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isValid = useMemo(() => {
    if (!form.fullName.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.password.trim() || form.password.trim().length < 6) return false;
    if (form.useDurationDays) {
      const n = Number(form.durationDays);
      if (!Number.isFinite(n) || n <= 0) return false;
    } else {
      if (!form.expiresAt) return false;
    }
    return true;
  }, [form]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isValid) {
      setError("Please complete required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        role: "Customer",
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone?.trim() || undefined,
        // backend accepts either durationDays or expiresAt
        durationDays: form.useDurationDays
          ? Number(form.durationDays)
          : undefined,
        expiresAt: form.useDurationDays
          ? undefined
          : new Date(form.expiresAt).toISOString(),
        // address fields match User schema structure
        line1: form.line1?.trim() || undefined,
        line2: form.line2?.trim() || undefined,
        city: form.city?.trim() || undefined,
        county: form.county?.trim() || undefined,
        postcode: form.postcode?.trim() || undefined,
        country: form.country || "UK",
      };

      // IMPORTANT: Backend User model expects nested `address` object.
      // But auth/register route reads flat `fullName, email, password, role, expiresAt/durationDays` only.
      // So we must send address in the correct flat keys OR backend should be updated.
      // To stay compatible with current backend, we send address fields only under the expected `address` key.
      // If backend already ignores unknown fields, this is still safe.
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

      // Clean address
      payload.address = Object.fromEntries(
        Object.entries(payload.address).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      );
      if (Object.keys(payload.address).length === 0) delete payload.address;

      const res = await httpClient.post("/api/auth/register", payload);

      const msg = res?.data?.message || "Customer created successfully.";
      setSuccessMsg(msg);

      setTimeout(() => {
        navigate("/dashboard?tab=my-customers", { replace: true });
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
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
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

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full name (required)">
              <input
                value={form.fullName}
                onChange={handleChange("fullName")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. Jane Sarah Doe"
              />
            </Field>

            <Field label="Email (required)">
              <input
                value={form.email}
                onChange={handleChange("email")}
                type="email"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. jane@example.com"
              />
            </Field>

            <Field label="Password (required, min 6)">
              <input
                value={form.password}
                onChange={handleChange("password")}
                type="password"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="Create customer password"
              />
            </Field>

            <Field label="Phone (optional)">
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. +44..."
              />
            </Field>
          </div>

          <div className="mt-8">
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-3">
              Address (optional)
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Line 1">
                <input
                  value={form.line1}
                  onChange={handleChange("line1")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="Street address"
                />
              </Field>

              <Field label="Line 2">
                <input
                  value={form.line2}
                  onChange={handleChange("line2")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="Flat / Suite / Apartment"
                />
              </Field>

              <Field label="City">
                <input
                  value={form.city}
                  onChange={handleChange("city")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="Town / City"
                />
              </Field>

              <Field label="County">
                <input
                  value={form.county}
                  onChange={handleChange("county")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="County / Region"
                />
              </Field>

              <Field label="Postcode">
                <input
                  value={form.postcode}
                  onChange={handleChange("postcode")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="e.g. AB12 3CD"
                />
              </Field>

              <Field label="Country">
                <input
                  value={form.country}
                  onChange={handleChange("country")}
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                  placeholder="UK"
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
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                />
              </Field>
            ) : (
              <Field label="Expires at">
                <input
                  value={form.expiresAt}
                  onChange={handleChange("expiresAt")}
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                />
              </Field>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() =>
                setForm({
                  fullName: "",
                  email: "",
                  password: "",
                  phone: "",
                  line1: "",
                  line2: "",
                  city: "",
                  county: "",
                  postcode: "",
                  country: "UK",
                  useDurationDays: true,
                  durationDays: "365",
                  expiresAt: "",
                })
              }
              disabled={submitting}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="px-5 py-2 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/25 text-[#e9fdff] font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
