export default function CustomerHome() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white">Customer Dashboard</h2>
        <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
          Welcome back. This is the initial customer role workspace. Future
          iterations can show your vehicles, policies, and active contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
            Vehicles
          </div>
          <div className="mt-3 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-xs text-[#6b7280]">
            View your registered vehicles.
          </div>
        </div>

        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
            Policies
          </div>
          <div className="mt-3 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-xs text-[#6b7280]">
            Manage your active policies.
          </div>
        </div>

        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
            Contracts
          </div>
          <div className="mt-3 text-3xl font-black text-white">—</div>
          <div className="mt-2 text-xs text-[#6b7280]">
            Track policy contract status.
          </div>
        </div>
      </div>

      <div className="bg-[#0d0f1d] border border-dashed border-[#1e2238] rounded-2xl p-6 text-xs text-[#8a8fbc]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">
          CUVVA look & feel
        </div>
        <p className="mt-3 leading-relaxed">
          This screen uses the same dark cyber UI style used across Admin and
          Sub-Admin dashboards (glow borders, glassy header spacing, and
          Tailwind-based layout).
        </p>
      </div>
    </div>
  );
}
