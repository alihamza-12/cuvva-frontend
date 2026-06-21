export function PolicyCard({ title = "Policy" }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
    </div>
  );
}
