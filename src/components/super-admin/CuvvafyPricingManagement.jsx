import { useEffect, useState } from "react";
import {
  Save,
  Clock,
  Calendar,
  CalendarClock,
  RefreshCw,
  Plus,
  Trash2,
  PoundSterling,
  Settings2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  { id: "present", label: "Present", desc: "Immediate start / Today / Now", icon: Clock },
  { id: "past", label: "Past", desc: "Backdated start (before now)", icon: CalendarClock },
  { id: "future", label: "Future", desc: "Scheduled future start (after now)", icon: Calendar },
];

const UNITS = ["hours", "days", "weeks"];

export default function CuvvafyPricingManagement({ axiosInstance }) {
  const [config, setConfig] = useState(null);
  const [activeCategory, setActiveCategory] = useState("present");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [durationOptions, setDurationOptions] = useState({
    hours: [1, 3, 5, 12, 24],
    days: [1, 2, 3, 4, 5, 6, 7],
    weeks: [1, 2, 3, 4],
  });

  const [pricingMode, setPricingMode] = useState("both");
  const [categoryModes, setCategoryModes] = useState({
    present: "both",
    past: "both",
    future: "both",
  });

  const [pricing, setPricing] = useState({
    present: { hours: {}, days: {}, weeks: {} },
    past: { hours: {}, days: {}, weeks: {} },
    future: { hours: {}, days: {}, weeks: {} },
  });

  const [formula, setFormula] = useState({
    present: {
      hours: { base: 15.13, perExtra: 4.85 },
      days: { base: 29.95, perExtra: 18.5 },
      weeks: { base: 109.95, perExtra: 79 },
    },
    past: {
      hours: { base: 20.43, perExtra: 6.55 },
      days: { base: 40.43, perExtra: 24.98 },
      weeks: { base: 148.43, perExtra: 106.65 },
    },
    future: {
      hours: { base: 15.13, perExtra: 4.85 },
      days: { base: 29.95, perExtra: 18.5 },
      weeks: { base: 109.95, perExtra: 79 },
    },
  });

  const [graceMinutes, setGraceMinutes] = useState(5);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/cuvvafy-pricing");
      const cfg = res.data?.config;
      if (!cfg) throw new Error("No config returned");
      setConfig(cfg);
      setDurationOptions(cfg.durationOptions || { hours: [1, 3, 5, 12, 24], days: [1, 2, 3, 4, 5, 6, 7], weeks: [1, 2, 3, 4] });
      setPricingMode(cfg.pricingMode || "both");
      setCategoryModes(cfg.categoryModes || { present: "both", past: "both", future: "both" });
      setPricing(cfg.pricing || { present: { hours: {}, days: {}, weeks: {} }, past: { hours: {}, days: {}, weeks: {} }, future: { hours: {}, days: {}, weeks: {} } });
      setFormula(cfg.formula || {
        present: { hours: { base: 15.13, perExtra: 4.85 }, days: { base: 29.95, perExtra: 18.5 }, weeks: { base: 109.95, perExtra: 79 } },
        past: { hours: { base: 20.43, perExtra: 6.55 }, days: { base: 40.43, perExtra: 24.98 }, weeks: { base: 148.43, perExtra: 106.65 } },
        future: { hours: { base: 15.13, perExtra: 4.85 }, days: { base: 29.95, perExtra: 18.5 }, weeks: { base: 109.95, perExtra: 79 } },
      });
      setGraceMinutes(cfg.graceMinutes ?? 5);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        durationOptions,
        pricingMode,
        categoryModes,
        pricing,
        formula,
        graceMinutes,
        currency: "GBP",
      };
      const res = await axiosInstance.put("/api/cuvvafy-pricing", payload);
      setMessage(res.data?.message || "Pricing updated successfully");
      // Refresh
      await fetchConfig();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateDurationOptions = (unit, valuesStr) => {
    // valuesStr like "1,3,5,12,24"
    const parsed = valuesStr
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 1)
      .sort((a, b) => a - b);
    // Remove duplicates
    const unique = [...new Set(parsed)];
    setDurationOptions((prev) => ({ ...prev, [unit]: unique }));
    // Also ensure pricing objects have entries for new values (keep existing)
    // For removed values, we keep pricing but they won't be shown
  };

  const updateFlatPrice = (category, unit, value, priceStr) => {
    const price = parseFloat(priceStr);
    if (isNaN(price) && priceStr !== "") return;
    setPricing((prev) => {
      const newPricing = { ...prev };
      const cat = { ...newPricing[category] };
      const unitMap = { ...(cat[unit] || {}) };
      if (priceStr === "") {
        delete unitMap[value];
      } else {
        unitMap[value] = price;
      }
      cat[unit] = unitMap;
      newPricing[category] = cat;
      return newPricing;
    });
  };

  const updateFormula = (category, unit, field, valueStr) => {
    const val = parseFloat(valueStr);
    if (isNaN(val) && valueStr !== "") return;
    setFormula((prev) => {
      const newFormula = { ...prev };
      const cat = { ...newFormula[category] };
      const unitFormula = { ...(cat[unit] || { base: 0, perExtra: 0 }) };
      unitFormula[field] = valueStr === "" ? 0 : val;
      cat[unit] = unitFormula;
      newFormula[category] = cat;
      return newFormula;
    });
  };

  const addDurationValue = (unit) => {
    const current = durationOptions[unit] || [];
    const max = current.length > 0 ? Math.max(...current) : 0;
    const nextVal = max + 1;
    setDurationOptions((prev) => ({ ...prev, [unit]: [...current, nextVal].sort((a, b) => a - b) }));
  };

  const removeDurationValue = (unit, value) => {
    setDurationOptions((prev) => ({ ...prev, [unit]: prev[unit].filter((v) => v !== value) }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-xs text-[#8a8fbc]">
        <RefreshCw size={20} className="animate-spin text-[#644aff]" />
        Loading Cuvvafy pricing...
      </div>
    );
  }

  const activeCatData = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black tracking-wide text-white uppercase">
            <PoundSterling size={18} className="text-[#644aff]" />
            Cuvvafy Pricing Management
          </h2>
          <p className="mt-1 text-xs text-[#8a8fbc] leading-relaxed">
            Manage all pricing for Cuvvafy (Tempify) — Past / Present / Future, Hours/Days/Weeks. Database is shared, so Tempify fetches prices dynamically.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchConfig}
            className="px-4 py-2 rounded-xl bg-white/5 border border-[#1e2238] text-[#8a8fbc] hover:text-white text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#644aff]/20"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save All Pricing"}
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
          <CheckCircle2 size={14} /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Top Tabs: Past / Present / Future */}
      <div className="flex gap-2 p-1 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl w-fit">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive ? "bg-[#644aff] text-white shadow-lg shadow-[#644aff]/20" : "text-[#6b7280] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} /> {cat.label}
              <span className="hidden md:inline text-[10px] opacity-70">({cat.desc})</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Details */}
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-5 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          {activeCatData && <activeCatData.icon size={20} className="text-[#644aff]" />}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{activeCatData?.label} Pricing</h3>
            <p className="text-[11px] text-[#6b7280]">{activeCatData?.desc} — prices shown to customer when start date is {activeCategory}</p>
          </div>
        </div>

        {/* Category Mode */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">Pricing Mode for {activeCategory}</label>
            <select
              value={categoryModes[activeCategory]}
              onChange={(e) => setCategoryModes((prev) => ({ ...prev, [activeCategory]: e.target.value }))}
              className="mt-1 w-full bg-[#060814] border border-[#1e2238] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
            >
              <option value="flat">Flat - Exact price per duration</option>
              <option value="formula">Formula - Base + per extra</option>
              <option value="both">Both - Try flat first, fallback to formula</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">Grace Minutes (past detection)</label>
            <input
              type="number"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full bg-[#060814] border border-[#1e2238] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
              min={0}
              max={1440}
            />
            <p className="text-[9px] text-[#6b7280] mt-1">If start time is before now - grace, it's considered past. Default 5 mins.</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">Global Pricing Mode</label>
            <select
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value)}
              className="mt-1 w-full bg-[#060814] border border-[#1e2238] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
            >
              <option value="flat">Flat</option>
              <option value="formula">Formula</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Duration Options Editors */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Settings2 size={14} className="text-[#644aff]" /> Duration Options (editable)
          </h4>
          {UNITS.map((unit) => (
            <div key={unit} className="bg-[#060814] border border-[#1e2238] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-[#8a8fbc] uppercase capitalize">{unit}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => addDurationValue(unit)}
                    className="px-2 py-1 rounded-lg bg-[#644aff]/10 border border-[#644aff]/20 text-[#644aff] text-[10px] font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(durationOptions[unit] || []).map((val) => (
                  <div key={val} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1e2238] border border-white/5 text-xs text-white">
                    <span>{val} {unit.slice(0, -1)}{val > 1 ? "s" : ""}</span>
                    <button
                      onClick={() => removeDurationValue(unit, val)}
                      className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 text-[#6b7280] hover:text-red-400"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="text-[9px] text-[#6b7280] uppercase">Edit as comma-separated (e.g. 1,3,5,12,24)</label>
                <input
                  type="text"
                  value={(durationOptions[unit] || []).join(",")}
                  onChange={(e) => updateDurationOptions(unit, e.target.value)}
                  className="mt-1 w-full bg-[#0d0f1d] border border-[#1e2238] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#644aff]"
                  placeholder="1,3,5,12,24"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Flat Pricing */}
        {(categoryModes[activeCategory] === "flat" || categoryModes[activeCategory] === "both") && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <PoundSterling size={14} className="text-[#644aff]" /> Flat Pricing — Exact price per duration (for {activeCategory})
            </h4>
            {UNITS.map((unit) => (
              <div key={`flat-${unit}`} className="bg-[#060814] border border-[#1e2238] rounded-xl p-4">
                <h5 className="text-xs font-bold text-[#8a8fbc] uppercase capitalize mb-3">{unit}</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(durationOptions[unit] || []).map((val) => (
                    <div key={`${unit}-${val}`} className="space-y-1">
                      <label className="text-[10px] text-[#6b7280] uppercase">
                        {val} {unit.slice(0, -1)}{val > 1 ? "s" : ""}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6b7280]">£</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing[activeCategory]?.[unit]?.[val] ?? ""}
                          onChange={(e) => updateFlatPrice(activeCategory, unit, val, e.target.value)}
                          className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formula Pricing */}
        {(categoryModes[activeCategory] === "formula" || categoryModes[activeCategory] === "both") && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Settings2 size={14} className="text-[#644aff]" /> Formula Pricing — Base + Per Extra (for {activeCategory})
            </h4>
            <p className="text-[10px] text-[#6b7280]">Price = Base + (value-1) * PerExtra. Example: Hours 1h = base, 3h = base + 2*perExtra. Flat pricing takes priority if exists and mode is Both.</p>
            {UNITS.map((unit) => (
              <div key={`formula-${unit}`} className="bg-[#060814] border border-[#1e2238] rounded-xl p-4">
                <h5 className="text-xs font-bold text-[#8a8fbc] uppercase capitalize mb-3">{unit}</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#6b7280] uppercase">Base price (for 1 {unit.slice(0, -1)})</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6b7280]">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formula[activeCategory]?.[unit]?.base ?? ""}
                        onChange={(e) => updateFormula(activeCategory, unit, "base", e.target.value)}
                        className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6b7280] uppercase">Per extra {unit.slice(0, -1)}</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#6b7280]">£</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formula[activeCategory]?.[unit]?.perExtra ?? ""}
                        onChange={(e) => updateFormula(activeCategory, unit, "perExtra", e.target.value)}
                        className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none focus:border-[#644aff]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-[#6b7280]">
                  Preview:{" "}
                  {(durationOptions[unit] || []).map((v) => {
                    const base = formula[activeCategory]?.[unit]?.base || 0;
                    const per = formula[activeCategory]?.[unit]?.perExtra || 0;
                    const price = base + Math.max(0, v - 1) * per;
                    return (
                      <span key={v} className="inline-block mr-2">
                        {v}
                        {unit[0]}=£{price.toFixed(2)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#644aff]/20"
        >
          <Save size={16} /> {saving ? "Saving..." : `Save ${activeCategory} Pricing`}
        </button>
      </div>

      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 text-[11px] text-[#6b7280] leading-relaxed">
        <strong className="text-white">How it works:</strong> Tempify (Cuvvafy) reads this config via <code className="px-1 py-0.5 rounded bg-white/5 text-[#8a8fbc]">/api/cuvvafy-pricing/public</code>. When customer selects Duration type (Hours/Days/Weeks), How long (1h,3h...), and Start option (Immediate vs Choose date & time), the server compares Start date & time with now (with {graceMinutes} min grace). If start &lt; now-grace → Past pricing, if start &gt; now+grace → Future pricing, else Present. Then price is fetched: if mode is flat and exact value exists, use flat price; else use formula base + (value-1)*perExtra. Total price shown in review page (£34.53 etc.) comes from this DB.
      </div>
    </div>
  );
}
