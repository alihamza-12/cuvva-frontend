export function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <aside className="hidden w-64 border-r bg-gray-50 p-4 md:block">
        Sidebar (stub)
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
