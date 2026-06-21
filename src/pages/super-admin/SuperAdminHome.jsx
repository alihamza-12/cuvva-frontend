import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  UserPlus,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

// Component Import from the local modular system folder
import OverviewGrid from "../../components/super-admin/OverviewGrid";

export default function SuperAdminHome({ counts, onUpdateNeeded }) {
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { role: "Sub Admin" },
  });

  const handleProvisionAgent = async (formData) => {
    setLoading(true);
    setRegSuccess("");
    setRegError("");
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // 🛡️ CRITICAL: Ensures sub-admin validation rules succeed
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Credential layer infrastructure rejected registration.",
        );
      }

      setRegSuccess(
        `Successfully provisioned Agent node for ${formData.fullName}`,
      );
      reset({ fullName: "", email: "", password: "", role: "Sub Admin" });

      // Fire callback to trigger metric sync inside parent Dashboard.jsx
      if (onUpdateNeeded) onUpdateNeeded();
    } catch (err) {
      setRegError(
        err.message || "Communication failure with core auth cluster registry.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Telemetry Metric Cards */}
      <OverviewGrid counts={counts} />

      {/* Account Spawning Workspace */}
      <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Input Control */}
        <div className="lg:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
              <UserPlus size={14} className="text-[#644aff]" /> Provision
              Sub-Admin Node
            </h3>
            <p className="text-[11px] text-[#6b7280] mt-1">
              Executes a backend pipeline database write to add active sub-tier
              system operators.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleProvisionAgent)}
            className="space-y-4"
          >
            {regSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs font-semibold text-green-400 border rounded-xl bg-green-500/5 border-green-500/10">
                <CheckCircle size={14} className="shrink-0" /> {regSuccess}
              </div>
            )}
            {regError && (
              <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-400 border rounded-xl bg-red-500/5 border-red-500/10">
                <AlertTriangle size={14} className="shrink-0" /> {regError}
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
              className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all disabled:opacity-40 shadow-md shadow-[#644aff]/10 active:scale-[0.99]"
            >
              {loading
                ? "Committing Database Records..."
                : "Authorize & Provision Credentials"}
            </button>
          </form>
        </div>

        {/* Security Policy Advisory Layer */}
        <div className="bg-[#0d0f1d] border border-dashed border-[#1e2238] rounded-2xl p-6 text-xs text-[#8a8fbc] space-y-4">
          <h4 className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-amber-400">
            <ShieldAlert size={12} /> Hierarchical Boundary Warnings
          </h4>
          <p className="leading-relaxed">
            Sub-Admins provisioned through this vector receive system execution
            tokens bounded by access clearance limits.
          </p>
          <ul className="list-disc pl-4 space-y-2 text-[#6b7280]">
            <li>Can issue short-term client policy entries.</li>
            <li>Can view system-wide asset catalogs.</li>
            <li>
              Strictly isolated from mutating super-tier environment signatures.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
