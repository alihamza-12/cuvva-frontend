import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * frontend/src/components/customer/PlateSearchBar.jsx
 *
 * "ENTER NUMBER PLATE" search input on the Get Insured landing page.
 * On submit, navigates into the DVLA lookup / policy purchase flow —
 * reuses the same lookup pattern as your existing DvlaLookup.jsx
 * (frontend/src/components/vehicle/DvlaLookup.jsx) if you want to plug
 * that logic in here instead of a bare navigate.
 */
export default function PlateSearchBar() {
  const [plate, setPlate] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = plate.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleaned) return;
    navigate(`/customer/policies/new?plate=${cleaned}`);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4">
      <div className="flex items-center gap-3 bg-[#17181c] rounded-full px-4 py-3.5 border border-white/5 focus-within:border-[#7c6bff]/40 transition-colors">
        <Search size={18} className="text-[#8b8d98] shrink-0" />
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="ENTER NUMBER PLATE"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-[#6b6d78] text-[15px] font-bold tracking-wider uppercase placeholder:tracking-wider"
        />
      </div>
    </form>
  );
}
