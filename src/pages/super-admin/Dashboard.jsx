import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ShieldAlert,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Users,
  Car,
  FileText,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";

// Redux & API Integrations
import { logOut, selectCurrentUser } from "../../features/authSlice";
import { useLogoutUserMutation } from "../../app/api/authApi";

// Modular UI Layout Components
import Sidebar from "../../components/super-admin/Sidebar";
import OverviewGrid from "../../components/super-admin/OverviewGrid";

const fetchOptions = {
  method: "GET",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

// ==========================================
// 1. ACCOUNT SECURITY CONTROLS SUB-VIEW
// ==========================================
const AccountManagementView = ({ onActionSuccess }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const [subAdminsRes, customersRes] = await Promise.all([
        fetch(
          "http://localhost:3000/api/management/subadmins",
          fetchOptions,
        ).then((res) => res.json()),
        fetch(
          "http://localhost:3000/api/management/customers",
          fetchOptions,
        ).then((res) => res.json()),
      ]);
      setSubAdmins(subAdminsRes.subAdmins || []);
      setCustomers(customersRes.customers || []);
    } catch (err) {
      setError("Failed to stream administrative security directories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleAccountStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      const response = await fetch(
        `http://localhost:3000/api/management/status/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed state change.");

      // Refresh local states and update parent dashboard numbers
      fetchAccounts();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="text-xs text-[#6b7280] animate-pulse">
        Synchronizing access directories...
      </div>
    );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub Admin Matrix */}
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
        <h3 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-white uppercase">
          <ShieldAlert size={14} className="text-[#644aff]" /> Sub-Admin System
          Operators
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2238] text-[#8a8fbc] font-bold">
                <th className="pb-3">Operator</th>
                <th className="pb-3">Email Anchor</th>
                <th className="pb-3">System Clearance Status</th>
                <th className="pb-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2238]/50 text-slate-300">
              {subAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-white/[0.01]">
                  <td className="py-3 font-semibold text-white">
                    {admin.fullName}
                  </td>
                  <td className="py-3 text-[#8a8fbc]">{admin.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        admin.status === "Active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {admin.status || "Active"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() =>
                        toggleAccountStatus(admin._id, admin.status || "Active")
                      }
                      className="transition-colors text-slate-400 hover:text-white"
                    >
                      {(admin.status || "Active") === "Active" ? (
                        <ToggleRight
                          size={20}
                          className="inline text-green-400"
                        />
                      ) : (
                        <ToggleLeft size={20} className="inline text-red-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers Matrix */}
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
        <h3 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-white uppercase">
          <Users size={14} className="text-[#644aff]" /> Registered Platform
          Customers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2238] text-[#8a8fbc] font-bold">
                <th className="pb-3">Client Asset</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Provisioning Agent</th>
                <th className="pb-3">State</th>
                <th className="pb-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2238]/50 text-slate-300">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-white/[0.01]">
                  <td className="py-3 font-semibold text-white">
                    {customer.fullName}
                  </td>
                  <td className="py-3 text-[#8a8fbc]">{customer.email}</td>
                  <td className="py-3 text-xs">
                    {customer.createdBy?.fullName || "Global Engine"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === "Active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {customer.status || "Active"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() =>
                        toggleAccountStatus(
                          customer._id,
                          customer.status || "Active",
                        )
                      }
                      className="transition-colors text-slate-400 hover:text-white"
                    >
                      {(customer.status || "Active") === "Active" ? (
                        <ToggleRight
                          size={20}
                          className="inline text-green-400"
                        />
                      ) : (
                        <ToggleLeft size={20} className="inline text-red-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. VEHICLE SPECIFICATION CATALOG SUB-VIEW
// ==========================================
const VehicleCatalogView = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/vehicles/all", fetchOptions)
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-xs text-[#6b7280] animate-pulse">
        Streaming hardware ledger specs...
      </div>
    );

  return (
    <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 animate-fadeIn">
      <h3 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-white uppercase">
        <Car size={14} className="text-[#644aff]" /> Global Asset System Catalog
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2238] text-[#8a8fbc] font-bold">
              <th className="pb-3">Index Plate</th>
              <th className="pb-3">Build Specification</th>
              <th className="pb-3">Chassis Colour</th>
              <th className="pb-3">Year</th>
              <th className="pb-3">Fuel Grid</th>
              <th className="pb-3 text-right">System Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2238]/50 text-slate-300">
            {vehicles.map((v) => (
              <tr key={v._id} className="hover:bg-white/[0.01]">
                <td className="py-3 font-mono font-bold text-[#644aff] bg-[#644aff]/5 px-2 py-1 rounded inline-block mt-2">
                  {v.registration}
                </td>
                <td className="py-3 font-semibold text-white">
                  {v.make} {v.model}
                </td>
                <td className="py-3 text-slate-400">{v.colour}</td>
                <td className="py-3 text-slate-400">{v.year}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-[#1e2238] text-[#8a8fbc] rounded text-[10px] uppercase font-semibold">
                    {v.fuelType}
                  </span>
                </td>
                <td className="py-3 text-right text-[#8a8fbc]">
                  {v.createdBy?.fullName || "Hidden Metadata"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 3. INSURANCE CONTRACTS REGISTRY SUB-VIEW
// ==========================================
const PolicyContractsView = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/policies/all", fetchOptions)
      .then((res) => res.json())
      .then((data) => setPolicies(data.policies || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-xs text-[#6b7280] animate-pulse">
        Pulling live coverage risk pipelines...
      </div>
    );

  return (
    <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 animate-fadeIn">
      <h3 className="flex items-center gap-2 mb-4 text-xs font-bold tracking-wider text-white uppercase">
        <FileText size={14} className="text-[#644aff]" /> Live Platform
        Underwriting Feed
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2238] text-[#8a8fbc] font-bold">
              <th className="pb-3">Contract Core Hash</th>
              <th className="pb-3">Insured Driver</th>
              <th className="pb-3">Asset Plate</th>
              <th className="pb-3">Premium Weight</th>
              <th className="pb-3">Timeline Matrix (UTC)</th>
              <th className="pb-3 text-right">Status State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2238]/50 text-slate-300">
            {policies.map((p) => (
              <tr key={p._id} className="hover:bg-white/[0.01]">
                <td className="py-3 font-mono text-slate-400 text-[11px] max-w-[120px] truncate">
                  {p._id}
                </td>
                <td className="py-3 font-semibold text-white">
                  {p.customerId?.fullName || "Unlinked Client"}
                </td>
                <td className="py-3 font-mono text-[#8a8fbc]">
                  {p.vehicleId?.registration || "Unknown Asset"}
                </td>
                <td className="py-3 font-bold text-emerald-400">
                  £{p.premiumAmount?.toFixed(2)}
                </td>
                <td className="py-3 text-[11px] text-slate-400">
                  {new Date(p.startDate).toISOString().split("T")[0]} (
                  {p.startTime}) ➔{" "}
                  {new Date(p.endDate).toISOString().split("T")[0]} ({p.endTime}
                  )
                </td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wide">
                    {p.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT EXPORT CORE
// ==========================================
export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState("overview");
  const [logoutBackend] = useLogoutUserMutation();

  const [counts, setCounts] = useState({
    subAdmins: 0,
    customers: 0,
    vehicles: 0,
    policies: 0,
  });
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);

  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { role: "Sub Admin" },
  });

  const syncPlatformMetrics = async () => {
    setIsSyncingTelemetry(true);
    try {
      const [subAdminsRes, customersRes, vehiclesRes, policiesRes] =
        await Promise.all([
          fetch(
            "http://localhost:3000/api/management/subadmins",
            fetchOptions,
          ).then((res) => res.json()),
          fetch(
            "http://localhost:3000/api/management/customers",
            fetchOptions,
          ).then((res) => res.json()),
          fetch("http://localhost:3000/api/vehicles/all", fetchOptions).then(
            (res) => res.json(),
          ),
          fetch("http://localhost:3000/api/policies/all", fetchOptions).then(
            (res) => res.json(),
          ),
        ]);

      setCounts({
        subAdmins: subAdminsRes?.count ?? subAdminsRes?.subAdmins?.length ?? 0,
        customers: customersRes?.count ?? customersRes?.customers?.length ?? 0,
        vehicles: vehiclesRes?.count ?? vehiclesRes?.vehicles?.length ?? 0,
        policies: policiesRes?.count ?? policiesRes?.policies?.length ?? 0,
      });
    } catch (err) {
      console.error("Platform telemetry aggregation error:", err);
    } finally {
      setIsSyncingTelemetry(false);
    }
  };

  useEffect(() => {
    syncPlatformMetrics();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logoutBackend().unwrap();
    } catch (err) {
      console.warn("Express backend session cache already truncated.");
    }
    dispatch(logOut());
    navigate("/login", { replace: true });
  };

  const handleProvisionAgent = async (formData) => {
    setLoading(true);
    setRegSuccess("");
    setRegError("");
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || "Credential layer error.");

      setRegSuccess(
        `Successfully provisioned Agent node for ${formData.fullName}`,
      );
      reset({ fullName: "", email: "", password: "", role: "Sub Admin" });
      syncPlatformMetrics();
    } catch (err) {
      setRegError(
        err.message || "Communication failure with cluster registry.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getHeaderContextTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Core Status Matrix";
      case "accounts":
        return "Account Security Controls";
      case "vehicles":
        return "Global Asset Specification Catalog";
      case "policies":
        return "Insurance Coverage Contracts";
      default:
        return "Administrative Command Core";
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex font-sans antialiased selection:bg-[#644aff]/30 select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 max-h-screen min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-[#1e2238] px-6 md:px-10 flex items-center justify-between sticky top-0 bg-[#060814]/90 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold tracking-widest text-white uppercase md:text-sm">
              {getHeaderContextTitle()}
            </h1>
            {isSyncingTelemetry && (
              <RefreshCw
                size={12}
                className="text-[#644aff] animate-spin shrink-0 hidden sm:block"
              />
            )}
          </div>
          <div className="flex items-center gap-2 bg-[#644aff]/10 border border-[#644aff]/20 px-3 py-1 rounded-full text-[#644aff] text-[10px] font-bold tracking-wide uppercase">
            Super Authorization Layer Verified
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl p-6 pb-24 mx-auto space-y-8 md:p-10 lg:pb-10">
          {/* ================= CONDITION 1: OVERVIEW SWITCHBOARD ================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              <OverviewGrid counts={counts} />
              <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
                      <UserPlus size={14} className="text-[#644aff]" />{" "}
                      Provision Sub-Admin Node
                    </h3>
                    <p className="text-[11px] text-[#6b7280] mt-1">
                      Executes a pipeline registration to append sub-tier
                      operational administrators.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleProvisionAgent)}
                    className="space-y-4"
                  >
                    {regSuccess && (
                      <div className="flex items-center gap-2 p-3 text-xs font-semibold text-green-400 border rounded-xl bg-green-500/5 border-green-500/10">
                        <CheckCircle size={14} /> {regSuccess}
                      </div>
                    )}
                    {regError && (
                      <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-400 border rounded-xl bg-red-500/5 border-red-500/10">
                        <AlertTriangle size={14} /> {regError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-[#8a8fbc] tracking-wider">
                          Agent Full Name
                        </label>
                        <input
                          type="text"
                          required
                          {...register("fullName")}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full bg-white/5 border border-[#1e2238] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-[#8a8fbc] tracking-wider">
                          Corporate Access Email
                        </label>
                        <input
                          type="email"
                          required
                          {...register("email")}
                          placeholder="name@cuvvaclone.com"
                          className="w-full bg-white/5 border border-[#1e2238] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-[#8a8fbc] tracking-wider">
                        Initial Account Password
                      </label>
                      <input
                        type="password"
                        required
                        {...register("password")}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-[#1e2238] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 active:scale-[0.99]"
                    >
                      {loading
                        ? "Committing Database Records..."
                        : "Authorize & Provision Credentials"}
                    </button>
                  </form>
                </div>

                <div className="bg-[#0d0f1d] border border-dashed border-[#1e2238] rounded-2xl p-6 text-xs text-[#8a8fbc] space-y-4">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-amber-400">
                    <ShieldAlert size={12} /> Hierarchical Boundary Warnings
                  </h4>
                  <p className="leading-relaxed">
                    Sub-Admins provisioned through this entry vector receive
                    structural database execution clearance roles.
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-[#6b7280]">
                    <li>Can process short-term policy contracts.</li>
                    <li>Can query public and custom vehicle specs.</li>
                    <li>
                      Strictly forbidden from editing super-tier system keys.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ================= CONDITION 2: ACCOUNT CONTROLS LINK ================= */}
          {activeTab === "accounts" && (
            <AccountManagementView onActionSuccess={syncPlatformMetrics} />
          )}

          {/* ================= CONDITION 3: VEHICLE CATALOG SELECTION ================= */}
          {activeTab === "vehicles" && <VehicleCatalogView />}

          {/* ================= CONDITION 4: INSURANCE CONTRACT REGISTER ================= */}
          {activeTab === "policies" && <PolicyContractsView />}
        </main>
      </div>
    </div>
  );
}
