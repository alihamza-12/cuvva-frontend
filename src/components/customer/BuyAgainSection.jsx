import React from "react";
import { useNavigate } from "react-router-dom";
import BuyAgainCard from "./BuyAgainCard";

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
