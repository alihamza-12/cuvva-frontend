import React from "react";
import { useNavigate } from "react-router-dom";
import BuyAgainCard from "./BuyAgainCard";

/**
 * frontend/src/components/customer/BuyAgainSection.jsx
 *
 * "Buy again" only appears when the customer has a PAST/EXPIRED policy
 * for a vehicle — i.e. this is a re-purchase prompt, not a general
 * vehicle list. If there are no expired policies, this section renders
 * nothing at all (matches the reference screenshot: it shows because
 * the Toyota Aygo's policy already expired).
 *
 * Backend expectation:
 *   GET /api/customers/me/policies/expired-vehicles
 *   -> { vehicles: [{ _id, registration, make, model, ownerLabel, relationship, lastPolicyId }] }
 *
 *   Query logic (suggested, in Backend/routes/policies.js or customers.js):
 *     Policy.find({ customer: req.user.id, status: "Expired" })
 *       .sort({ endDate: -1 })
 *       .populate("vehicle")
 *     -> dedupe by vehicle._id, keep most recent expiry per vehicle
 *
 * Props:
 *  - vehicles: array of { _id, registration, make, model, ownerLabel, relationship }
 *              (already filtered server-side to ONLY expired-policy vehicles)
 *  - loading: boolean
 */
export default function BuyAgainSection({ vehicles = [], loading = false }) {
  const navigate = useNavigate();

  const handleSelect = (vehicle) => {
    navigate(`/customer/policies/new?vehicleId=${vehicle._id}`, {
      state: { prefillVehicle: vehicle },
    });
  };

  if (loading) {
    return (
      <section className="px-4 pt-5">
        <h2 className="text-[13px] font-semibold text-[#b5b6bd] mb-2">
          Buy again
        </h2>
        <div className="h-[72px] rounded-2xl bg-[#17181c] animate-pulse" />
      </section>
    );
  }

  // Core rule: no expired-policy vehicles -> section doesn't render at all.
  if (!vehicles.length) return null;

  return (
    <section className="px-4 pt-5">
      <h2 className="text-[13px] font-semibold text-[#b5b6bd] mb-2">
        Buy again
      </h2>
      <div className="space-y-2">
        {vehicles.map((vehicle) => (
          <BuyAgainCard
            key={vehicle._id}
            vehicle={vehicle}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
}
