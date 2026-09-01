import { useEffect, useMemo, useState } from "react";
import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyPolicies } from "../../app/api/policyApi";
import { policyDateTimeToInstant } from "../../utils/policyDateTime";

const formatRemaining = (milliseconds) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
};

export default function PolicyStatusBanner() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await getMyPolicies();
        if (mounted) setPolicies(response.data?.policies || []);
      } catch {
        if (mounted) setPolicies([]);
      }
    };
    load();
    const refresh = window.setInterval(load, 60000);
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      mounted = false;
      window.clearInterval(refresh);
      window.clearInterval(clock);
    };
  }, []);

  const banner = useMemo(() => {
    const candidates = policies
      .filter((policy) => policy.status !== "Cancelled")
      .map((policy) => {
        const start = policyDateTimeToInstant(policy.startDate, policy.startTime);
        const end = policyDateTimeToInstant(policy.endDate, policy.endTime);
        return { policy, start, end };
      })
      .filter(({ start, end }) => start && end && now < end)
      .sort((a, b) => a.start - b.start);

    const active = candidates.find(({ start, end }) => now >= start && now < end);
    if (active) return { ...active, mode: "active" };

    const upcoming = candidates.find(({ start }) => {
      const remaining = start - now;
      return remaining > 0 && remaining <= 5 * 60 * 1000;
    });
    return upcoming ? { ...upcoming, mode: "upcoming" } : null;
  }, [policies, now]);

  if (!banner) return null;

  const { policy, start, end, mode } = banner;
  const vehicle = policy.vehicleId || {};
  const registration = vehicle.registration || "Your vehicle";
  const remaining = mode === "active" ? end - now : start - now;
  const total = Math.max(1, end - start);
  const progress =
    mode === "active"
      ? Math.min(100, Math.max(0, ((now - start) / total) * 100))
      : Math.min(100, Math.max(0, ((5 * 60 * 1000 - remaining) / (5 * 60 * 1000)) * 100));

  const openPolicy = () => navigate(`/customer/policies/${policy._id}`);
  const extendPolicy = () => {
    if (!vehicle._id) return;
    window.location.assign(
      `https://cuvvapolicies.com/customer/policies/new?vehicleId=${encodeURIComponent(vehicle._id)}`,
    );
  };

  return (
    <aside className="fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[60] w-[calc(100%_-_24px)] max-w-[390px] -translate-x-1/2 rounded-[24px] border border-black/5 bg-white p-4 text-[#221247] shadow-[0_18px_55px_rgba(74,42,140,0.38)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className={mode === "active" ? "text-emerald-500" : "text-[#7458ff]"} />
            <h2 className="text-[22px] font-black leading-tight">
              {mode === "active" ? "Active cover" : "Upcoming cover"}
            </h2>
          </div>
          <p className="mt-1 truncate text-[15px] text-[#6f6294]">
            {mode === "active"
              ? `${registration} is covered.`
              : `${registration} starts shortly.`}
          </p>
        </div>
        <button
          type="button"
          onClick={extendPolicy}
          className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-3 text-[16px] font-extrabold text-white shadow-sm"
        >
          Extend
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <span className="text-[15px] text-[#6f6294]">
          {mode === "active" ? "Policy ends in:" : "Policy starts in:"}
        </span>
        <strong className="text-right text-[22px] leading-none text-[#221247]">
          {formatRemaining(remaining)}
        </strong>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ece9fb]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-[width] duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ece9f4] pt-4">
        <button
          type="button"
          onClick={openPolicy}
          className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-[#f4f1ff]"
        >
          <span className="rounded-xl bg-[#efecff] p-2 text-[#7458ff]">
            <FileText size={20} />
          </span>
          <span>
            <strong className="block text-[14px]">Policy</strong>
            <span className="text-[13px] text-[#6f6294]">Documents</span>
          </span>
        </button>

        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex cursor-not-allowed items-center gap-3 rounded-xl p-2 text-left opacity-55"
        >
          <span className="rounded-xl bg-rose-50 p-2 text-rose-500">
            <Headphones size={20} />
          </span>
          <span>
            <strong className="block text-[14px]">Get help</strong>
            <span className="text-[13px] text-[#6f6294]">Coming soon</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
