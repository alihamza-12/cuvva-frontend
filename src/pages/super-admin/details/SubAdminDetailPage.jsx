import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Search,
  ShieldAlert,
  UnlockKeyhole,
  Users,
} from "lucide-react";

import Sidebar from "../../../components/super-admin/Sidebar";
import {
  getSubAdminById,
  getSubAdminPolicyPermissions,
  updateSubAdminPolicyPermissions,
} from "../../../app/api/subAdminApi";

export default function SubAdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subAdmin, setSubAdmin] = useState(null);

  const [permissionCustomers, setPermissionCustomers] = useState([]);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [permissionSaving, setPermissionSaving] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [permissionSuccess, setPermissionSuccess] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;

    const fetchSubAdmin = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getSubAdminById(id);

        if (!mounted) return;
        setSubAdmin(response.data?.user || null);
      } catch (requestError) {
        if (!mounted) return;
        setError(
          requestError.response?.data?.message ||
            "Failed to load sub-admin detail.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchPermissionData = async () => {
      try {
        const response = await getSubAdminPolicyPermissions(id);

        if (!mounted) return;
        setPermissionCustomers(response.data?.customers || []);
        setSelectedCustomerIds(new Set());
      } catch (requestError) {
        if (!mounted) return;
        setPermissionError(
          requestError.response?.data?.message ||
            "Failed to load policy creation permissions.",
        );
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    };

    fetchSubAdmin();
    fetchPermissionData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();

    if (!query) return permissionCustomers;

    return permissionCustomers.filter(
      (customer) =>
        customer.fullName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    );
  }, [customerSearch, permissionCustomers]);

  const restrictedCount = useMemo(
    () =>
      permissionCustomers.filter(
        (customer) => customer.policyCreationRestricted,
      ).length,
    [permissionCustomers],
  );

  const allowedCount = permissionCustomers.length - restrictedCount;
  const allVisibleSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((customer) =>
      selectedCustomerIds.has(customer._id),
    );

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds((current) => {
      const next = new Set(current);

      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);

      return next;
    });
  };

  const toggleSelectVisible = () => {
    setSelectedCustomerIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        filteredCustomers.forEach((customer) => next.delete(customer._id));
      } else {
        filteredCustomers.forEach((customer) => next.add(customer._id));
      }

      return next;
    });
  };

  const applyPermissionChange = async (customerIds, restricted) => {
    if (!customerIds.length || permissionSaving) return;

    const actionLabel = restricted ? "restrict" : "allow";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} policy creation for ${customerIds.length} customer(s)?`,
    );

    if (!confirmed) return;

    setPermissionSaving(true);
    setPermissionError("");
    setPermissionSuccess("");

    try {
      const response = await updateSubAdminPolicyPermissions(
        id,
        customerIds,
        restricted,
      );

      setPermissionCustomers(response.data?.customers || []);
      setSelectedCustomerIds(new Set());
      setPermissionSuccess(
        response.data?.message || "Policy permissions updated successfully.",
      );
    } catch (requestError) {
      setPermissionError(
        requestError.response?.data?.message ||
          "Failed to update policy creation permissions.",
      );
    } finally {
      setPermissionSaving(false);
    }
  };

  const safeDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      return new Date(dateValue).toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <Sidebar
        activeTab="accounts"
        setActiveTab={(tabId) => {
          if (tabId) navigate("/admin/dashboard");
        }}
        user={{
          fullName: subAdmin?.fullName || "Super Admin",
          role: "Super Admin",
        }}
        onLogout={() => {}}
      />

      <div className="flex-1 w-full p-4 space-y-6 pb-28 md:p-10 md:pb-24 lg:pb-10 min-w-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase text-[#8a8fbc]">
            Sub-Admin Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading sub-admin record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && subAdmin && (
          <div className="space-y-6">
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 md:p-6">
              <h2 className="mb-4 text-xs font-bold tracking-wider text-white uppercase">
                Sub-Admin Details
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailField label="User ID" value={subAdmin._id} mono />
                <DetailField label="Role" value={subAdmin.role} />
                <DetailField label="Full Name" value={subAdmin.fullName} />
                <DetailField label="Email" value={subAdmin.email} breakText />
                <DetailField label="Status" value={subAdmin.status || "Active"} />
                <DetailField
                  label="Expiry"
                  value={subAdmin.expiresAt ? safeDate(subAdmin.expiresAt) : "Infinite"}
                />
                <DetailField label="Created At" value={safeDate(subAdmin.createdAt)} />
                <DetailField label="Updated At" value={safeDate(subAdmin.updatedAt)} />
                <DetailField
                  label="Created By"
                  value={
                    subAdmin.createdBy?.fullName
                      ? `${subAdmin.createdBy.fullName} (${subAdmin.createdBy.role})`
                      : "System Bootstrap / Unknown"
                  }
                  spanTwo
                />
              </div>
            </div>

            <section className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl overflow-hidden">
              <div className="p-4 md:p-6 border-b border-[#1e2238]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <LockKeyhole size={18} className="text-[#a999ff]" />
                      <h2 className="text-base font-bold text-white">
                        Policy Creation Permissions
                      </h2>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#8a8fbc]">
                      Control which customers owned by this Sub Admin can be used
                      for new policy creation. Restrictions do not hide customers.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 shrink-0">
                    <PermissionStat label="Customers" value={permissionCustomers.length} />
                    <PermissionStat label="Allowed" value={allowedCount} tone="allowed" />
                    <PermissionStat
                      label="Restricted"
                      value={restrictedCount}
                      tone="restricted"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                {permissionError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">
                    <ShieldAlert size={15} className="shrink-0" />
                    <span>{permissionError}</span>
                  </div>
                )}

                {permissionSuccess && (
                  <div className="flex items-center gap-2 p-3 text-xs text-green-300 border rounded-xl bg-green-500/10 border-green-500/20">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{permissionSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="relative w-full xl:max-w-sm">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                    />
                    <input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Search customer name or email..."
                      className="w-full min-h-[44px] pl-10 pr-3 bg-[#060814] border border-[#1e2238] rounded-xl text-sm text-white outline-none focus:border-[#644aff]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <PermissionButton
                      onClick={toggleSelectVisible}
                      disabled={!filteredCustomers.length || permissionSaving}
                    >
                      {allVisibleSelected ? "Clear visible" : "Select visible"}
                    </PermissionButton>
                    <PermissionButton
                      onClick={() => setSelectedCustomerIds(new Set())}
                      disabled={!selectedCustomerIds.size || permissionSaving}
                    >
                      Clear selection
                    </PermissionButton>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#1e2238] bg-[#060814]/60 p-3">
                  <span className="mr-auto text-xs font-semibold text-[#8a8fbc]">
                    {selectedCustomerIds.size} customer(s) selected
                  </span>
                  <PermissionButton
                    tone="restricted"
                    onClick={() =>
                      applyPermissionChange([...selectedCustomerIds], true)
                    }
                    disabled={!selectedCustomerIds.size || permissionSaving}
                  >
                    Restrict selected
                  </PermissionButton>
                  <PermissionButton
                    tone="allowed"
                    onClick={() =>
                      applyPermissionChange([...selectedCustomerIds], false)
                    }
                    disabled={!selectedCustomerIds.size || permissionSaving}
                  >
                    Allow selected
                  </PermissionButton>
                  <PermissionButton
                    tone="restricted"
                    onClick={() =>
                      applyPermissionChange(
                        permissionCustomers.map((customer) => customer._id),
                        true,
                      )
                    }
                    disabled={!permissionCustomers.length || permissionSaving}
                  >
                    Restrict all
                  </PermissionButton>
                  <PermissionButton
                    tone="allowed"
                    onClick={() =>
                      applyPermissionChange(
                        permissionCustomers.map((customer) => customer._id),
                        false,
                      )
                    }
                    disabled={!permissionCustomers.length || permissionSaving}
                  >
                    Allow all
                  </PermissionButton>
                </div>

                {permissionLoading ? (
                  <div className="py-12 text-center text-sm text-[#8a8fbc] animate-pulse">
                    Loading owned customers and permissions...
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users size={28} className="mx-auto text-[#4b506e]" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      {permissionCustomers.length
                        ? "No customers match your search."
                        : "This Sub Admin has not created any customers yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => {
                      const restricted = customer.policyCreationRestricted;
                      const selected = selectedCustomerIds.has(customer._id);

                      return (
                        <div
                          key={customer._id}
                          className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors md:flex-row md:items-center ${
                            selected
                              ? "border-[#644aff]/60 bg-[#644aff]/10"
                              : "border-[#1e2238] bg-[#060814]/55"
                          }`}
                        >
                          <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleCustomerSelection(customer._id)}
                              className="mt-1 h-4 w-4 accent-[#644aff]"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-white">
                                {customer.fullName}
                              </span>
                              <span className="block break-all text-xs text-[#8a8fbc]">
                                {customer.email}
                              </span>
                            </span>
                          </label>

                          <div className="flex items-center justify-between gap-3 md:justify-end">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                restricted
                                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                                  : "border-green-500/20 bg-green-500/10 text-green-300"
                              }`}
                            >
                              {restricted ? (
                                <LockKeyhole size={12} />
                              ) : (
                                <UnlockKeyhole size={12} />
                              )}
                              {restricted ? "Restricted" : "Allowed"}
                            </span>

                            <button
                              type="button"
                              disabled={permissionSaving}
                              onClick={() =>
                                applyPermissionChange([customer._id], !restricted)
                              }
                              className="min-h-[40px] rounded-lg border border-[#2a3050] bg-white/5 px-3 text-[10px] font-bold uppercase tracking-wide text-[#b4b8d3] transition-colors hover:border-[#644aff] hover:text-white disabled:opacity-40"
                            >
                              {restricted ? "Allow" : "Restrict"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {!loading && !error && !subAdmin && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value, mono = false, breakText = false, spanTwo = false }) {
  return (
    <div className={`space-y-1 ${spanTwo ? "md:col-span-2" : ""}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
        {label}
      </div>
      <div
        className={`text-xs text-white ${mono ? "font-mono break-all" : ""} ${
          breakText ? "break-all" : ""
        }`}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

function PermissionStat({ label, value, tone = "default" }) {
  const toneClass = {
    default: "text-white",
    allowed: "text-green-300",
    restricted: "text-red-300",
  }[tone];

  return (
    <div className="min-w-[74px] rounded-xl border border-[#1e2238] bg-[#060814] px-3 py-2 text-center">
      <div className={`text-lg font-black ${toneClass}`}>{value}</div>
      <div className="text-[9px] font-bold uppercase tracking-wide text-[#6b7280]">
        {label}
      </div>
    </div>
  );
}

function PermissionButton({ children, onClick, disabled, tone = "default" }) {
  const toneClass = {
    default: "border-[#2a3050] bg-white/5 text-[#b4b8d3] hover:text-white",
    allowed:
      "border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-500/15",
    restricted:
      "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[40px] rounded-lg border px-3 text-[10px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${toneClass}`}
    >
      {children}
    </button>
  );
}
