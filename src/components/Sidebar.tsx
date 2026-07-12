"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/assets", label: "Asset Registry", icon: "📦" },
  { href: "/dashboard/allocations", label: "Allocations", icon: "🔄" },
  { href: "/dashboard/bookings", label: "Resource Booking", icon: "📅" },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: "🛠️" },
  { href: "/dashboard/audits", label: "Audit Cycles", icon: "✅" },
  { href: "/dashboard/org", label: "Org Setup", icon: "🏢", adminOnly: true },
  { href: "/dashboard/reports", label: "Reports", icon: "📊" },
];

export default function Sidebar({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-[var(--slate)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0 shadow-lg">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[var(--amber)] flex items-center justify-center font-bold text-black">
            AF
          </div>

          <div>
            <h2 className="font-display font-bold text-base">
              AssetFlow
            </h2>
            <p className="text-xs text-[var(--text-dim)]">
              Smart Asset Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN").map(
          (item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                  active
                    ? "bg-[var(--amber)] text-black font-semibold"
                    : "text-[var(--text-dim)] hover:bg-[var(--slate-light)] hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3">
          <div className="font-medium">{userName}</div>
          <div className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
            {role.replace("_", " ")}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-left text-sm text-[var(--text-dim)] transition hover:bg-red-500 hover:text-white"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}