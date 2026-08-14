import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  CarFront,
  Check,
  Fuel,
  HelpCircle,
  MoreHorizontal,
  UserRound,
  X,
} from "lucide-react";

import { BarrierIcon } from "../../components/customer/ResultMessagePage";

const formatEngineSize = (engineCapacityCC) => {
  const cc = Number(engineCapacityCC);

  if (!Number.isFinite(cc) || cc <= 0) {
    return "Not available";
  }

  const litres = cc / 1000;
  return `${litres.toFixed(1)}L`;
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return value;
};

export default function VehicleLookupResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showQuoteError, setShowQuoteError] = useState(false);

  const vehicle = location.state?.vehicle || location.state?.prefillVehicle;

  if (!vehicle) {
    return <Navigate to="/customer" replace />;
  }

  if (showQuoteError) {
    return (
      <QuoteUnavailableView
        onHelp={() => navigate("/customer/support")}
        onOk={() => navigate("/customer")}
      />
    );
  }

  const vehicleTitle =
    vehicle.description || `${vehicle.make || ""} ${vehicle.model || ""}`.trim();
  const seatLabel = vehicle.numberOfSeats
    ? `${vehicle.numberOfSeats} ${Number(vehicle.numberOfSeats) === 1 ? "seat" : "seats"}`
    : "Seats unknown";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#1a1b20] text-white">
      <header className="shrink-0 border-b border-white/[0.07]">
        <div className="flex items-center justify-between px-[22px] pb-5 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
          <button
            type="button"
            onClick={() => navigate("/customer")}
            aria-label="Close vehicle details"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-[#202126] active:bg-[#292a30]"
          >
            <X size={29} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="More options"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-[#202126] active:bg-[#292a30]"
          >
            <MoreHorizontal size={25} />
          </button>
        </div>

        <div className="px-[22px] pb-6">
          <h1 className="max-w-[90%] text-[29px] font-extrabold leading-[1.15] tracking-[-0.02em]">
            {vehicleTitle}
          </h1>
          <p className="mt-2 text-[18px] tracking-[0.02em] text-[#aaaab2]">
            {vehicle.registration}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <StatusBadge label="Vehicle found" />
            {vehicle.transmission && (
              <StatusBadge label={vehicle.transmission} />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 pb-32 overflow-y-auto">
        <section className="grid grid-cols-3 border-b border-white/[0.07] px-3 py-8">
          <VehicleFact
            icon={<Fuel size={27} fill="currentColor" />}
            value={displayValue(vehicle.fuelType)}
          />
          <VehicleFact
            icon={<UserRound size={28} fill="currentColor" />}
            value={seatLabel}
          />
          <VehicleFact
            icon={<CarFront size={29} />}
            value={displayValue(vehicle.bodyStyle)}
          />
        </section>

        <section className="px-[22px] py-8">
          <h2 className="text-[23px] font-extrabold">Specs</h2>

          <dl className="mt-6 space-y-[22px]">
            <SpecRow
              label="Variant"
              value={displayValue(vehicle.variant || vehicle.model)}
            />
            <SpecRow label="Year" value={displayValue(vehicle.year)} />
            <SpecRow label="Colour" value={displayValue(vehicle.colour)} />
            <SpecRow
              label="Engine"
              value={formatEngineSize(vehicle.engineCapacityCC)}
            />
            <SpecRow
              label="Transmission"
              value={displayValue(vehicle.transmission)}
            />
            <SpecRow
              label="Doors"
              value={displayValue(vehicle.numberOfDoors)}
            />
            {vehicle.vehicleInsuranceGroup && (
              <SpecRow
                label="Insurance group"
                value={`${vehicle.vehicleInsuranceGroup}/${vehicle.vehicleInsuranceGroupOutOf || 50}`}
              />
            )}
          </dl>
        </section>
      </main>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1b20] via-[#1a1b20] to-transparent px-[22px] pb-[max(24px,calc(env(safe-area-inset-bottom,0px)+14px))] pt-10">
        <button
          type="button"
          onClick={() => setShowQuoteError(true)}
          className="w-full rounded-full bg-[#7961f6] px-6 py-[17px] text-[18px] font-bold text-white shadow-lg shadow-black/20 transition-colors active:bg-[#6951df]"
        >
          Get a quote
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#123c32] px-3 py-1.5 text-[14px] font-semibold text-[#36c997]">
      <Check size={15} strokeWidth={2.8} />
      {label}
    </span>
  );
}

function VehicleFact({ icon, value }) {
  return (
    <div className="flex flex-col items-center min-w-0 text-center">
      <span className="flex items-center justify-center text-white h-9">{icon}</span>
      <span className="mt-3 max-w-full truncate px-1 text-[17px] text-[#f0f0f3]">
        {value}
      </span>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 text-[17px]">
      <dt className="shrink-0 text-[#aaaab2]">{label}</dt>
      <dd className="max-w-[65%] text-right text-[#f0f0f3]">{value}</dd>
    </div>
  );
}

function QuoteUnavailableView({ onHelp, onOk }) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#1a1b20] text-white">
      <div className="flex shrink-0 justify-end px-[22px] pb-3 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
        <button
          type="button"
          onClick={onHelp}
          aria-label="Get help"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.09] bg-[#202126]"
        >
          <HelpCircle size={24} strokeWidth={1.8} />
        </button>
      </div>

      <main className="flex flex-col items-center justify-center flex-1 min-h-0 px-6 overflow-y-auto text-center pb-28">
        <div className="mb-8 scale-[1.12]">
          <BarrierIcon />
        </div>

        <h1 className="text-[29px] font-extrabold leading-tight tracking-[-0.02em]">
          Sorry, we can&apos;t insure you
        </h1>

        <div className="mt-5 max-w-[520px] space-y-6 text-[17px] leading-[1.45] text-[#b5b5bd]">
          <p>
            Something went wrong while preparing your quote. Please try again
            later or chat to us if you have any questions. 💬
          </p>
          <p>There may also be other reasons we can&apos;t insure you.</p>
          <p>
            We work with our underwriters to offer insurance to as many people
            as possible, but their rules may change from time to time.
          </p>
          <p>
            Although we can&apos;t insure you today, we may be able to cover you in
            the future. In some cases, you may be able to get a quote on a
            different vehicle.
          </p>
        </div>

        <button
          type="button"
          onClick={onHelp}
          className="mt-7 text-[16px] font-bold text-[#9a82ff]"
        >
          Learn more about who we can cover
        </button>
      </main>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1b20] via-[#1a1b20] to-transparent px-[22px] pb-[max(24px,calc(env(safe-area-inset-bottom,0px)+14px))] pt-10">
        <button
          type="button"
          onClick={onOk}
          className="w-full rounded-full bg-[#7961f6] px-6 py-[17px] text-[18px] font-bold text-white active:bg-[#6951df]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
