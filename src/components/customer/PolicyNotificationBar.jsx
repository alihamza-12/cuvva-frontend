import { useEffect, useMemo, useState } from "react";
import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyPolicies } from "../../app/api/policyApi";
import { computePolicyStatus, getPolicyWindow } from "../../utils/policyStatus";

/*
 * Rich policy notification bar (the card UI from the Cuvva mock-up).
 *
 * IMPORTANT: visibility is decided from the policy's own Europe/London cover
 * window (start <= now <= end), NOT from the stored `status` string. That
 * stored value only refreshes on the server's background tick, so trusting it
 * made the bar vanish while the policy was in fact still live.
 * Upcoming policies do not render this bar — they are announced through the
 * device notification panel instead (see policyNotificationManager).
 *
 * Fully dynamic while visible: the "ends in" value ticks every second and
 * the green line runs with time (elapsed / total policy duration).
 */

const splitRemaining = (milliseconds) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  if (seconds < 60) return { value: seconds, unit: seconds === 1 ? "second" : "seconds" };
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return { value: minutes, unit: minutes === 1 ? "minute" : "minutes" };
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return { value: hours, unit: hours === 1 ? "hour" : "hours" };
  const days = Math.ceil(hours / 24);
  return { value: days, unit: days === 1 ? "day" : "days" };
};

const clampPercent = (value) => Math.min(100, Math.max(0, value));

export default function PolicyNotificationBar() {
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
    const refresh = window.setInterval(load, 15000);
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    // Re-check the instant the tab regains focus (phones suspend timers).
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
        load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      mounted = false;
      window.clearInterval(refresh);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const active = useMemo(() => {
    const candidates = (Array.isArray(policies) ? policies : [])
      .filter((policy) => policy?.status !== "Cancelled")
      .map((policy) => {
        const range = getPolicyWindow(policy);
        return range
          ? {
              policy,
              start: range.start,
              end: range.end,
              status: computePolicyStatus(policy, now),
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);

    // Derived status is authoritative: a policy inside its window is Active
    // even if the backend row still says Upcoming or Expired.
    return candidates.find((entry) => entry.status === "Active") || null;
  }, [policies, now]);

  if (!active) return null;

  const { policy, start, end } = active;
  const registration = policy.vehicleId?.registration || "Your vehicle";
  const { value, unit } = splitRemaining(end - now);
  const progress = clampPercent(((now - start) / Math.max(1, end - start)) * 100);

  const openPolicy = () => navigate(`/customer/policies/${policy._id}`);
  const openSupport = () => navigate("/customer/support");
  const extendPolicy = () => {
    const vehicleId = policy.vehicleId?._id;
    if (!vehicleId) return;
    window.location.assign(
      `https://cuvvapolicies.com/customer/policies/new?vehicleId=${encodeURIComponent(vehicleId)}`,
    );
  };

  return (
    <aside
      aria-live="polite"
      className="fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[60] w-[calc(100%_-_24px)] max-w-[410px] -translate-x-1/2 rounded-[24px] border border-black/5 bg-white p-5 text-[#221247] shadow-[0_18px_55px_rgba(74,42,140,0.38)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[24px] font-black leading-tight">Active cover</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-600">
              Active
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[15px] text-[#6f6294]">
            <ShieldCheck size={16} className="text-emerald-500" />
            {registration} is covered.
          </p>
        </div>
        <button
          type="button"
          onClick={extendPolicy}
          className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-3.5 text-[17px] font-extrabold text-white shadow-sm"
        >
          Extend
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <span className="text-[16px] text-[#6f6294]">Policy ends in:</span>
        <strong className="text-right text-[24px] leading-none text-[#221247]">
          {value} <span className="text-[17px] font-extrabold">{unit}</span>
        </strong>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ece9fb]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-[width] duration-1000 ease-linear"
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
          onClick={openSupport}
          className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-[#fff1f2]"
        >
          <span className="rounded-xl bg-rose-50 p-2 text-rose-500">
            <Headphones size={20} />
          </span>
          <span>
            <strong className="block text-[14px]">Get help</strong>
            <span className="text-[13px] text-[#6f6294]">Chat, claims</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
