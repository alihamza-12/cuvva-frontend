import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Car, User, ShieldAlert } from "lucide-react";

import Sidebar from "../../../components/super-admin/Sidebar";
import { getPolicyById } from "../../../app/api/policyApi";

export default function PolicyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchPolicy = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPolicyById(id);
        if (!mounted) return;
        setPolicy(res.data?.policy || null);
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load policy detail.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchPolicy();

    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  const statusPill = (status) => {
    const safe = status || "Upcoming";
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
          safe === "Active"
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : safe === "Upcoming"
              ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}
      >
        {safe}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <div className="hidden lg:block">
        <Sidebar
          activeTab={"accounts"}
          setActiveTab={() => {}}
          user={{
            fullName: policy?.createdBy?.fullName || "Super Admin",
            role: "Super Admin",
          }}
          onLogout={() => {}}
        />
      </div>

      <div className="flex-1 max-w-4xl p-6 mx-auto space-y-6 md:p-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase text-[#8a8fbc]">
            Policy Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading policy record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && policy && (
          <div className="space-y-5">
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff]">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#8a8fbc] font-mono uppercase tracking-wider">
                        {policy.policyNumber ? policy.policyNumber : policy._id}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {policy.policyType || "Short Term"} •{" "}
                        {policy.coverageType || "Comprehensive"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>{statusPill(policy.status)}</div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Assigned Driver (Customer)
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#6b7280]" />
                    <div className="text-xs font-semibold text-white">
                      {policy.customerId?.fullName || "N/A"}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    {policy.customerId?.email || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Covered Vehicle Asset
                  </div>
                  {policy.vehicleId ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-[#6b7280]" />
                        <div className="text-xs font-semibold text-white">
                          {policy.vehicleId.make} {policy.vehicleId.model}
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] text-[#6b7280]">
                        Registration: {policy.vehicleId.registration}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs italic text-red-400">
                      Missing vehicle reference
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Coverage Window
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                    <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg">
                      {formatDate(policy.startDate)} • {policy.startTime}
                    </span>
                    <span className="text-[#644aff] font-bold">→</span>
                    <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg">
                      {formatDate(policy.endDate)} • {policy.endTime}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Premium Amount
                  </div>
                  <div className="text-xs font-semibold text-white">
                    £{policy.premiumAmount}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Underwriter
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {policy.underwriter || "N/A"}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Internal Notes
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {policy.internalNotes ? policy.internalNotes : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                Metadata
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Policy DB ID
                  </div>
                  <div className="font-mono text-xs text-white">
                    {policy._id}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Issued By (CreatedBy)
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {policy.createdBy?.fullName
                      ? `${policy.createdBy.fullName} (${policy.createdBy.role})`
                      : "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created At
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {formatDate(policy.createdAt)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Updated At
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {formatDate(policy.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !policy && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
