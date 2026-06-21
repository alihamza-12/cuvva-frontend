import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import Sidebar from "../../../components/super-admin/Sidebar";

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

export default function SubAdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subAdmin, setSubAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSubAdmin = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/management/subadmins/${id}`);

        if (!mounted) return;
        setSubAdmin(res.data?.user || null);
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load sub-admin detail.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchSubAdmin();

    return () => {
      mounted = false;
    };
  }, [id]);

  const safeDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <Sidebar
        activeTab={"accounts"}
        setActiveTab={(tabId) => {
          // Detail pages don't have tab-specific routes; return to main dashboard
          window.location.href = "/admin/dashboard";
        }}
        user={{
          fullName: subAdmin?.fullName || "Super Admin",
          role: "Super Admin",
        }}
        onLogout={() => {}}
      />

      <div className="flex-1 max-w-4xl p-6 mx-auto space-y-6 md:p-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
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
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                Sub-Admin Detail Fields
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    User ID
                  </div>
                  <div className="font-mono text-xs text-white">
                    {subAdmin?._id}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Role
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {subAdmin?.role}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Full Name
                  </div>
                  <div className="text-xs text-[#8a8fbc]">
                    {subAdmin?.fullName}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Email
                  </div>
                  <div className="text-xs text-[#8a8fbc]">
                    {subAdmin?.email}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Status
                  </div>
                  <div className="text-xs font-bold text-white">
                    {subAdmin?.status || "Active"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Expiry
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {subAdmin?.expiresAt
                      ? safeDate(subAdmin.expiresAt)
                      : "Infinite"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created At
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {safeDate(subAdmin?.createdAt)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Updated At
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {safeDate(subAdmin?.updatedAt)}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created By (Super Admin)
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {subAdmin?.createdBy?.fullName
                      ? `${subAdmin.createdBy.fullName} (${subAdmin.createdBy.role})`
                      : "System Bootstrap / Unknown"}
                  </div>
                  {subAdmin?.createdBy?.email && (
                    <div className="text-xs text-[#6b7280]">
                      {subAdmin.createdBy.email}
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Address (Country)
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {subAdmin?.address?.country || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !subAdmin && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
