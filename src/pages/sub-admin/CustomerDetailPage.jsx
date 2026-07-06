import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, ShieldAlert, Mail } from "lucide-react";

import { getCustomerById } from "../../app/api/customerApi";
import { updateCustomer } from "../../app/api/customerUpdateApi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLES = ["Super Admin", "Sub Admin", "Customer"];
const STATUSES = ["Active", "Suspended"];

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// Builds the full edit-form state from a fetched customer record.
// Deliberately EXCLUDES: password, refreshTokens, resetToken, resetExpires,
// _id, createdBy, createdAt/updatedAt, firstName/lastName (auto-derived).
const buildFormFromCustomer = (customer) => ({
  fullName: customer?.fullName || "",
  email: customer?.email || "",
  phone: customer?.phone || "",
  dateOfBirth: toDateInputValue(customer?.dateOfBirth),

  addressLine1: customer?.address?.line1 || "",
  addressLine2: customer?.address?.line2 || "",
  city: customer?.address?.city || "",
  county: customer?.address?.county || "",
  postcode: customer?.address?.postcode || "",
  country: customer?.address?.country || "UK",

  lastFourDigits: customer?.lastFourDigits || "",
  role: customer?.role || "Customer",
  status: customer?.status || "Active",
  expiresAt: toDateInputValue(customer?.expiresAt),
});

const buildPayloadFromForm = (form) => {
  const strOrUndef = (v) => (v === "" || v == null ? undefined : v);
  const dateOrNull = (v) => (v ? new Date(v).toISOString() : null);
  const dateOrUndef = (v) => (v ? new Date(v).toISOString() : undefined);

  return {
    fullName: strOrUndef(form.fullName),
    email: strOrUndef(form.email),
    phone: strOrUndef(form.phone),
    dateOfBirth: dateOrUndef(form.dateOfBirth),

    address: {
      line1: strOrUndef(form.addressLine1),
      line2: strOrUndef(form.addressLine2),
      city: strOrUndef(form.city),
      county: strOrUndef(form.county),
      postcode: strOrUndef(form.postcode),
      country: strOrUndef(form.country),
    },

    lastFourDigits: strOrUndef(form.lastFourDigits),
    role: strOrUndef(form.role),
    status: strOrUndef(form.status),
    // expiresAt intentionally allows explicit null (means "no expiry"/infinite)
    expiresAt: form.expiresAt ? dateOrNull(form.expiresAt) : null,
  };
};

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const FieldLabel = ({ children }) => (
  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
    {children}
  </div>
);

const TextInput = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  colSpan2 = false,
}) => (
  <div className={`space-y-1 ${colSpan2 ? "md:col-span-2" : ""}`}>
    <FieldLabel>{label}</FieldLabel>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none focus:border-[#644aff]"
    />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none focus:border-[#644aff]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ReadRow = ({ label, value, colSpan2 = false }) => (
  <div className={`space-y-1 ${colSpan2 ? "md:col-span-2" : ""}`}>
    <FieldLabel>{label}</FieldLabel>
    <div className="text-xs font-semibold text-white">{value ?? "N/A"}</div>
  </div>
);

const statusPill = (status) => {
  const safe = status || "Active";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
        safe === "Active"
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20"
      }`}
    >
      {safe}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(buildFormFromCustomer(null));

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const setField = (key) => (e) =>
    setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCustomerById(id);
      const fetched = res.data?.customer || null;
      setCustomer(fetched);
      setEditForm(buildFormFromCustomer(fetched));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load customer detail.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchCustomer();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditClick = () => {
    setEditForm(buildFormFromCustomer(customer));
    setUpdateError("");
    setUpdateSuccess("");
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setEditForm(buildFormFromCustomer(customer));
    setUpdateError("");
    setUpdateSuccess("");
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!customer?._id) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const payload = buildPayloadFromForm(editForm);
      await updateCustomer(customer._id, payload);
      setUpdateSuccess("Customer updated successfully.");
      setIsEditMode(false);
      await fetchCustomer();
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || "Failed to update customer.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <div className="flex-1 max-w-4xl p-6 mx-auto space-y-6 md:p-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase text-[#8a8fbc]">
            Customer Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading customer record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && customer && (
          <div className="space-y-5">
            {/* --- Edit controls pinned at the top, same pattern as Vehicle page --- */}
            <div className="flex items-center justify-end gap-2">
              {!isEditMode ? (
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-[#644aff]/10 border border-[#644aff]/30 hover:bg-[#644aff]/20 text-xs uppercase tracking-wider font-bold"
                  onClick={handleEditClick}
                >
                  Edit Customer
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    className="px-3 py-2 rounded-xl bg-[#644aff] hover:bg-[#5537ff] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-bold"
                    onClick={handleSave}
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>

            {(updateError || updateSuccess) && (
              <div className="text-xs">
                {updateError && (
                  <div className="text-red-400">{updateError}</div>
                )}
                {updateSuccess && (
                  <div className="text-green-400">{updateSuccess}</div>
                )}
              </div>
            )}

            {/* Header / profile card */}
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff]">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {customer.fullName}
                    </h2>
                    <div className="text-[11px] text-[#8a8fbc] flex items-center gap-2">
                      <Mail size={12} /> {customer.email}
                    </div>
                  </div>
                </div>
                <div>{statusPill(customer.status)}</div>
              </div>

              {isEditMode ? (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="mt-4 space-y-6"
                >
                  {/* --- Account Basics --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#644aff] uppercase">
                      Account Basics
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        label="Full Name"
                        value={editForm.fullName}
                        onChange={setField("fullName")}
                        required
                      />
                      <TextInput
                        label="Email"
                        type="email"
                        value={editForm.email}
                        onChange={setField("email")}
                        required
                      />
                      <TextInput
                        label="Phone"
                        value={editForm.phone}
                        onChange={setField("phone")}
                      />
                      <TextInput
                        label="Date of Birth"
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={setField("dateOfBirth")}
                      />
                    </div>
                  </div>

                  {/* --- Address --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#644aff] uppercase">
                      Address
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        label="Address Line 1"
                        value={editForm.addressLine1}
                        onChange={setField("addressLine1")}
                        colSpan2
                      />
                      <TextInput
                        label="Address Line 2"
                        value={editForm.addressLine2}
                        onChange={setField("addressLine2")}
                        colSpan2
                      />
                      <TextInput
                        label="City"
                        value={editForm.city}
                        onChange={setField("city")}
                      />
                      <TextInput
                        label="County"
                        value={editForm.county}
                        onChange={setField("county")}
                      />
                      <TextInput
                        label="Postcode"
                        value={editForm.postcode}
                        onChange={setField("postcode")}
                      />
                      <TextInput
                        label="Country"
                        value={editForm.country}
                        onChange={setField("country")}
                      />
                    </div>
                  </div>

                  {/* --- Account Control --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#644aff] uppercase">
                      Account Control
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <SelectInput
                        label="Role"
                        value={editForm.role}
                        onChange={setField("role")}
                        options={ROLES}
                      />
                      <SelectInput
                        label="Status"
                        value={editForm.status}
                        onChange={setField("status")}
                        options={STATUSES}
                      />
                      <TextInput
                        label="Expires At (blank = infinite)"
                        type="date"
                        value={editForm.expiresAt}
                        onChange={setField("expiresAt")}
                      />
                      <TextInput
                        label="Last Four Digits (search marker)"
                        value={editForm.lastFourDigits}
                        onChange={setField("lastFourDigits")}
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  <ReadRow label="Role" value={customer.role} />
                  <ReadRow
                    label="Expiry"
                    value={
                      customer.expiresAt
                        ? new Date(customer.expiresAt)
                            .toISOString()
                            .split("T")[0]
                        : "Infinite"
                    }
                  />
                  <ReadRow label="Phone" value={customer.phone} />
                  <ReadRow
                    label="Date of Birth"
                    value={
                      customer.dateOfBirth
                        ? new Date(customer.dateOfBirth).toLocaleDateString()
                        : null
                    }
                  />
                  <ReadRow
                    label="Address"
                    colSpan2
                    value={
                      [
                        customer.address?.line1,
                        customer.address?.line2,
                        customer.address?.city,
                        customer.address?.county,
                        customer.address?.postcode,
                        customer.address?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || null
                    }
                  />
                  <div className="space-y-1 md:col-span-2">
                    <FieldLabel>Created By (Admin / Sub-Admin)</FieldLabel>
                    <div className="text-xs text-[#6b7280]">
                      {customer?.createdBy?.fullName
                        ? `${customer.createdBy.fullName} (${customer.createdBy.role})`
                        : "System Bootstrap / Unknown"}
                    </div>
                    {customer?.createdBy?.email && (
                      <div className="text-xs text-[#6b7280]">
                        {customer.createdBy.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Read-only system metadata card (never editable) */}
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                System Metadata
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadRow label="User ID" value={customer?._id} />
                <ReadRow label="Role" value={customer?.role} />
                <ReadRow label="Email" value={customer?.email} />
                <ReadRow label="Status" value={customer?.status || "Active"} />
                <ReadRow
                  label="Expires At"
                  colSpan2
                  value={
                    customer?.expiresAt
                      ? new Date(customer.expiresAt).toISOString().split("T")[0]
                      : "Infinite"
                  }
                />
                <div className="space-y-1 md:col-span-2">
                  <FieldLabel>Created By</FieldLabel>
                  <div className="text-xs text-[#6b7280]">
                    {customer?.createdBy?.fullName
                      ? `${customer.createdBy.fullName} (${customer.createdBy.role})`
                      : "System Bootstrap / Unknown"}
                  </div>
                  {customer?.createdBy?.email && (
                    <div className="text-xs text-[#6b7280]">
                      {customer.createdBy.email}
                    </div>
                  )}
                </div>
                <ReadRow
                  label="Created At"
                  value={
                    customer?.createdAt
                      ? new Date(customer.createdAt).toLocaleString()
                      : null
                  }
                />
                <ReadRow
                  label="Updated At"
                  value={
                    customer?.updatedAt
                      ? new Date(customer.updatedAt).toLocaleString()
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !customer && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
