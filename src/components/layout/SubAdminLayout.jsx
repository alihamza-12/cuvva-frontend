export function SubAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4">Sub-Admin Header (stub)</header>
      <div className="p-4">{children}</div>
    </div>
  );
}
