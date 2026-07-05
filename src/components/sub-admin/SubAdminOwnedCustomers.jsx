import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, RefreshCw, Search, X } from "lucide-react";

export function SubAdminOwnedCustomers({ axiosInstance, onRefresh }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [customers, setCustomers] = useState([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/management/customers");
      const list = res?.data?.customers || [];
      setCustomers(list);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Client-side filter: only customers associated with current sub-admin scope
  // Backend should ultimately enforce ownership; this is a UI-level helper.
  const filteredCustomers = useMemo(() => {
    let list = customers;

    list = list.filter((c) => {
      // Common pattern in this repo is createdBy.role. We keep it safe.
      return (
        c?.createdBy?.role === "Super Admin" ||
        c?.createdBy?.role === "Sub Admin"
      );
    });

    if (!normalizedQuery) return list;

    return list.filter(
      (c) =>
        (c?.email || "").toLowerCase().includes(normalizedQuery) ||
        (c?.fullName || "").toLowerCase().includes(normalizedQuery),
    );
  }, [customers, normalizedQuery]);

  // Status toggle (reused pattern from super-admin component)
  const toggleStatus = async (e, userId, currentStatus) => {
    e.stopPropagation();
    setActionLoadingId(userId);

    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";

    try {
      await axiosInstance.patch(`/api/management/status/${userId}`, {
        status: nextStatus,
      });
      if (onRefresh) onRefresh();
      await fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // NOTE: edit modal is intentionally omitted for now; keep sub-admin UI minimal.

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1e2238]">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold tracking-wide text-white">
              <span className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#00f0ff]">
                <Search size={18} />
              </span>
              My Customers
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Owned scope view for Sub Admin.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-[#6b7280] pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-10 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff] transition-all"
            />
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#6b7280] hover:text-[#00f0ff] transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#6b7280] text-sm">
            Loading...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-[#6b7280]">
            <p className="text-sm font-medium">
              No customers found for "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#8a8fbc] border-b border-[#1e2238] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-4 pl-2">Identity Details</th>
                  <th className="pb-4">Access Status</th>
                  <th className="pb-4 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2238]">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/admin/customers/${c._id}`)}
                    className="cursor-pointer group hover:bg-[#1a1d33] transition-colors"
                  >
                    <td className="py-4 pl-2">
                      <div className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                        {c.fullName}
                      </div>
                      <div className="text-[11px] text-[#6b7280] font-medium mt-0.5">
                        {c.email}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          c.status === "Active"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoadingId === c._id}
                          onClick={(e) => toggleStatus(e, c._id, c.status)}
                          className="px-4 py-2 bg-[#060814] hover:bg-[#1a1d33] hover:text-white border border-[#1e2238] hover:border-[#00f0ff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                        >
                          {actionLoadingId === c._id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            "Manage Status"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
