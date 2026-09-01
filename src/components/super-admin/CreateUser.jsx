import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";

const AddressInput = ({ label, value, onChange, required = false, uppercase = false }) => (
  <label className="space-y-1">
    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
      {label}{required ? " *" : ""}
    </span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className={`w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors ${uppercase ? "uppercase" : ""}`}
    />
  </label>
);

export default function CreateUser({ axiosInstance, onCreated }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Sub Admin",
    durationDays: "",
    dateOfBirth: "",
    gender: "",
    drivingLicenceNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    postcode: "",
    country: "UK",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
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
        payload.drivingLicenceNumber = formData.drivingLicenceNumber.trim();
        payload.address = {
          line1: formData.addressLine1.trim(),
          line2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          county: formData.county.trim(),
          postcode: formData.postcode.trim(),
          country: formData.country.trim(),
        };
      }

      const response = await axiosInstance.post("/api/auth/register", payload);

      setSuccess(response.data?.message || `User created as ${payload.role}.`);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: formData.role,
        durationDays: "",
        dateOfBirth: "",
        gender: "",
        drivingLicenceNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        county: "",
        postcode: "",
        country: "UK",
      });

      if (onCreated) onCreated();
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
          <span className="text-white">/api/auth/register</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              type="text"
              required
              placeholder="Jane Sarah Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
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
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Gender
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff] transition-colors"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                  Driving Licence
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMITH••••J99AB"
                  value={formData.drivingLicenceNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      drivingLicenceNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs uppercase text-white outline-none focus:border-[#644aff] transition-colors"
                />
              </div>

              <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                Customer Address
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <AddressInput label="Address line 1" required value={formData.addressLine1} onChange={(value) => setFormData({ ...formData, addressLine1: value })} />
                <AddressInput label="Address line 2" value={formData.addressLine2} onChange={(value) => setFormData({ ...formData, addressLine2: value })} />
                <AddressInput label="City" required value={formData.city} onChange={(value) => setFormData({ ...formData, city: value })} />
                <AddressInput label="County" value={formData.county} onChange={(value) => setFormData({ ...formData, county: value })} />
                <AddressInput label="Postcode" required value={formData.postcode} onChange={(value) => setFormData({ ...formData, postcode: value.toUpperCase() })} uppercase />
                <AddressInput label="Country" required value={formData.country} onChange={(value) => setFormData({ ...formData, country: value })} />
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
              onChange={(e) =>
                setFormData({ ...formData, durationDays: e.target.value })
              }
              className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
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
          </p>
        </div>
      </div>
    </div>
  );
}
