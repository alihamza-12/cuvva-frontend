import React from "react";

export function SubAdminHome() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sub Admin Operational HQ</h2>
          <p className="text-sm text-[#8a8fbc] mt-1">
            Sidebar navigation is now wired to the /dashboard workspace. Next:
            replace this stub with RTK Query powered widgets.
          </p>
        </div>

        <div className="px-4 py-2 border rounded-2xl border-cyan-500/20 bg-cyan-500/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00f0ff]">
            Live Session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "My Customers", value: "—", hint: "Owned scope" },
          { title: "My Vehicles", value: "—", hint: "Operational assets" },
          { title: "My Policies", value: "—", hint: "Coverage contracts" },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-[#1e2238] bg-[#0d0f1d]/40 p-5"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[#8a8fbc]">
              {c.title}
            </div>
            <div className="mt-3 text-3xl font-extrabold">{c.value}</div>
            <div className="text-xs text-[#6b7280] mt-1">{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
