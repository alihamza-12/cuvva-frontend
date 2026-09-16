import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import CurrencyInput from "../common/CurrencyInput";
import CustomerSearchSelect from "../common/CustomerSearchSelect";
import MaskedDateInput from "../common/MaskedDateInput";
import MaskedTimeInput from "../common/MaskedTimeInput";
import FieldError from "../common/FieldError";
import { normalizeTime } from "../../utils/normalizeTime";
import { digitsOnly, isValidCardLast4 } from "../../utils/titleCase";
import PolicyVehicleLookup from "../common/PolicyVehicleLookup";

/* Red outline wrapper so date/time/currency inputs show an error state. */
function ErrorRing({ error, children }) {
  return (
    <div className={error ? "rounded-xl ring-1 ring-red-500" : ""}>
      {children}
    </div>
  );
}

export default function CreatePolicy({
  axiosInstance,
  onCreated,
  customers = [],
}) {
  const navigate = useNavigate();

  const [localCustomers, setLocalCustomers] = useState(customers);

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    premiumAmount: "",
    excess: "500",
    cardLast4: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    policyType: "Temporary Car",
    coverageType: "Comprehensive",
    underwriter: "Wakam",
    internalNotes: "",
  });

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [vehicleLookupKey, setVehicleLookupKey] = useState(0);

  const needsFetchCustomers = useMemo(
    () => localCustomers.length === 0,
    [localCustomers],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (needsFetchCustomers) {
          const res = await axiosInstance.get("/api/management/customers");
          if (!mounted) return;
          setLocalCustomers(res.data?.customers || []);
        }
      } catch {
        // Keep whatever customer list was provided via props.
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [needsFetchCustomers, axiosInstance]);

  const customerOptions = useMemo(() => {
    return localCustomers.map((c) => ({
      value: c._id,
      label: c.fullName ? `${c.fullName} (${c.email})` : c.email,
      // Carried through so selecting a customer can pre-fill the payment card
      // field with the marker stored on that customer.
      lastFourDigits: c.lastFourDigits || "",
    }));
  }, [localCustomers]);

  const clearFieldError = (key) => {
    setFieldErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  /*
   * Picking a customer loads the card marker stored on that customer, so the
   * payment field is pre-filled from the database. It stays editable: whatever
   * is in the box when the policy is created is written back to the customer.
   */
  const handleCustomerChange = (customerId) => {
    const selectedCustomer = customerOptions.find(
      (option) => option.value === customerId,
    );

    setForm((previous) => ({
      ...previous,
      customerId,
      cardLast4: selectedCustomer?.lastFourDigits
        ? digitsOnly(selectedCustomer.lastFourDigits)
        : "",
    }));

    clearFieldError("customerId");
    clearFieldError("cardLast4");
  };

  const setFormField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    clearFieldError(key);
  };

  /* Per-field validation so every message sits under its own field. */
  const buildFieldErrors = () => {
    const next = {};

    if (!form.customerId) next.customerId = "Select a customer.";
    if (!form.vehicleId) next.vehicleId = "Select a vehicle for this policy.";
    if (!form.premiumAmount || Number(form.premiumAmount) <= 0) {
      next.premiumAmount = "Enter the premium amount.";
    }
    if (form.excess === "" || Number(form.excess) < 0) {
      next.excess = "Enter the excess amount.";
    }
    if (!form.cardLast4) {
      next.cardLast4 = "Enter the last 4 digits of the payment card.";
    } else if (!isValidCardLast4(form.cardLast4)) {
      next.cardLast4 = "Enter exactly the last 4 digits of the payment card.";
    }
    if (!form.startDate) next.startDate = "Enter the start date.";
    if (!form.endDate) next.endDate = "Enter the end date.";
    if (!form.startTime) next.startTime = "Enter the start time.";
    if (!form.endTime) next.endTime = "Enter the end time.";

    return next;
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const validationErrors = buildFieldErrors();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    const normalizedStartTime = normalizeTime(form.startTime);
    const normalizedEndTime = normalizeTime(form.endTime);

    if (normalizedStartTime === null || normalizedEndTime === null) {
      setFieldErrors({
        startTime: "Enter a valid time (e.g. 09:30).",
        endTime: "Enter a valid time (e.g. 09:30).",
      });
      setFormError("Enter a valid time (e.g. 09:30 or 5 PM)");
      return;
    }

    if (
      form.startDate === form.endDate &&
      normalizedEndTime <= normalizedStartTime
    ) {
      setFieldErrors({ endTime: "End time must be after the start time." });
      setFormError("End time must be after start time");
      return;
    }


    setSubmitting(true);

    const payload = {
      customerId: form.customerId,
      vehicleId: form.vehicleId,

      premiumAmount: form.premiumAmount,
      excess: form.excess,
      cardLast4: digitsOnly(form.cardLast4),
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      policyType: form.policyType,
      coverageType: form.coverageType,
      underwriter: form.underwriter,
      internalNotes: form.internalNotes?.trim() || "",
    };

    try {
      const res = await axiosInstance.post("/api/policies", payload);
      setFormSuccess(res.data?.message || "Policy created successfully.");

      setForm({
        customerId: "",
        vehicleId: "",
        premiumAmount: "",
        excess: "500",
        cardLast4: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        policyType: "Temporary Car",
        coverageType: "Comprehensive",
        underwriter: "Wakam",
        internalNotes: "",
      });
      setFieldErrors({});

      setVehicleLookupKey((current) => current + 1);
      if (onCreated) onCreated();

      /*
       * Straight to the new policy's page. The backend has already written the
       * card marker back onto the customer for the next quote.
       */
      const createdPolicyId = res?.data?.policy?._id;
      const destination = createdPolicyId
        ? `/admin/policies/${createdPolicyId}`
        : "/admin/dashboard?tab=own-policies";

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 900);
    } catch (err) {
      setFormError(err.response?.data?.message || "Error creating policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-8 text-xs animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 md:p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Create Policey
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          Select a customer, then search by registration. Existing vehicles are
          loaded from the database; new vehicles are retrieved automatically.
          The payment card field is pre-filled from the customer record and
          saved back to it.
        </p>

        <form onSubmit={handleCreatePolicy} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Customer
            </label>
            <CustomerSearchSelect
              options={customerOptions}
              value={form.customerId}
              onChange={handleCustomerChange}
              placeholder="Search customer by name or email"
              required
              className={`w-full min-h-[44px] bg-[#0d0f1d] border rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff] ${
                fieldErrors.customerId ? "border-red-500" : "border-[#1e2238]"
              }`}
            />
            <FieldError message={fieldErrors.customerId} />
          </div>

          <div>
            <PolicyVehicleLookup
              key={`${vehicleLookupKey}-${form.customerId}`}
              customerId={form.customerId}
              accent="purple"
              onVehicleResolved={(vehicle) => {
                setForm((current) => ({
                  ...current,
                  vehicleId: vehicle?._id || "",
                }));
                if (vehicle?._id) clearFieldError("vehicleId");
              }}
            />
            <FieldError message={fieldErrors.vehicleId} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
            <div className="space-y-1">
              <ErrorRing error={fieldErrors.premiumAmount}>
                <CurrencyInput
                  label="Premium Amount (£)"
                  value={form.premiumAmount}
                  onChange={(v) => setFormField("premiumAmount", v)}
                  required
                  accentClass="focus:border-[#644aff]"
                />
              </ErrorRing>
              <FieldError message={fieldErrors.premiumAmount} />
            </div>
            <div className="space-y-1">
              <ErrorRing error={fieldErrors.excess}>
                <CurrencyInput
                  label="Excess (£)"
                  value={form.excess}
                  onChange={(v) => setFormField("excess", v)}
                  required
                  accentClass="focus:border-[#644aff]"
                />
              </ErrorRing>
              <FieldError message={fieldErrors.excess} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Last 4 digits of payment card
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={form.cardLast4}
                onChange={(event) =>
                  setFormField("cardLast4", digitsOnly(event.target.value))
                }
                placeholder="0000"
                className={`w-full min-h-[44px] bg-[#0d0f1d] border rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff] ${
                  fieldErrors.cardLast4 ? "border-red-500" : "border-[#1e2238]"
                }`}
              />
              <FieldError message={fieldErrors.cardLast4} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Underwriter
              </label>
              <select
                required
                value={form.underwriter}
                onChange={(e) => setFormField("underwriter", e.target.value)}
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Wakam">Wakam</option>
                <option value="ERS Syndicate">ERS Syndicate</option>
                <option value="Crawford">Crawford</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Policy Type
              </label>
              <select
                required
                value={form.policyType}
                onChange={(e) => setFormField("policyType", e.target.value)}
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Temporary Car">Temporary Car</option>
                <option value="Temporary Van">Temporary Van</option>
                <option value="Learner Driver">Learner Driver</option>
                <option value="Impound">Impound</option>
                <option value="Motorhome">Motorhome</option>
                <option value="Drive Away">Drive Away</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Coverage Type
              </label>
              <select
                required
                value={form.coverageType}
                onChange={(e) => setFormField("coverageType", e.target.value)}
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party Only">Third Party Only</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] border border-[#1e2238] rounded-xl space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
              <div>
                <ErrorRing error={fieldErrors.startDate}>
                  <MaskedDateInput
                    label="Start Date"
                    value={form.startDate}
                    onChange={(v) => setFormField("startDate", v)}
                    required
                    accentClass="focus:border-[#644aff]"
                  />
                </ErrorRing>
                <FieldError message={fieldErrors.startDate} />
              </div>
              <div>
                <ErrorRing error={fieldErrors.startTime}>
                  <MaskedTimeInput
                    label="Start Time (HH:MM)"
                    value={form.startTime}
                    onChange={(v) => setFormField("startTime", v)}
                    required
                    accentClass="focus:border-[#644aff]"
                  />
                </ErrorRing>
                <FieldError message={fieldErrors.startTime} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
              <div>
                <ErrorRing error={fieldErrors.endDate}>
                  <MaskedDateInput
                    label="End Date"
                    value={form.endDate}
                    onChange={(v) => setFormField("endDate", v)}
                    required
                    accentClass="focus:border-[#644aff]"
                  />
                </ErrorRing>
                <FieldError message={fieldErrors.endDate} />
              </div>
              <div>
                <ErrorRing error={fieldErrors.endTime}>
                  <MaskedTimeInput
                    label="End Time (HH:MM)"
                    value={form.endTime}
                    onChange={(v) => setFormField("endTime", v)}
                    required
                    accentClass="focus:border-[#644aff]"
                  />
                </ErrorRing>
                <FieldError message={fieldErrors.endTime} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Internal Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={form.internalNotes}
              onChange={(e) => setFormField("internalNotes", e.target.value)}
              placeholder="Add notes for this policy..."
              className="w-full min-h-[88px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-white outline-none focus:border-[#644aff] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#644aff]/10"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ShieldCheck size={14} />
              {submitting ? "Creating policy..." : "Create Policey"}
            </span>
          </button>
        </form>
      </div>

      <div className="w-full space-y-6">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-bold tracking-wide text-white uppercase">
            Uses backend Policy.js fields
          </h4>
          <p className="text-[11px] text-[#6b7280] mt-2 leading-relaxed">
            customerId, vehicleId, premiumAmount, startDate, endDate, startTime,
            endTime, policyType, coverageType, underwriter, internalNotes.
          </p>
        </div>
      </div>
    </div>
  );
}
