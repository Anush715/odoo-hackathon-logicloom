"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/dashboard/assets", label: "Asset Registry", icon: "▣" },
  { href: "/dashboard/allocations", label: "Allocations", icon: "⇄" },
  { href: "/dashboard/bookings", label: "Resource Booking", icon: "◷" },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: "⚙" },
  { href: "/dashboard/audits", label: "Audit Cycles", icon: "✓" },
  { href: "/dashboard/org", label: "Org Setup", icon: "⛭", adminOnly: true },
  { href: "/dashboard/reports", label: "Reports", icon: "▤" },
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
    <aside className="w-60 shrink-0 bg-[var(--slate)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[var(--amber)] flex items-center justify-center font-mono-tag font-bold text-[var(--graphite)] text-xs">
            AF
          </div>
          <span className="font-display font-bold text-sm">AssetFlow</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN").map(
          (item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-[var(--amber-dim)] text-[var(--amber)] font-medium"
                    : "text-[var(--text-dim)] hover:bg-[var(--slate-light)] hover:text-[var(--text)]"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          }
        )}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm font-medium truncate">{userName}</div>
          <div className="font-mono-tag text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
            {role.replace("_", " ")}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-sm text-sm text-[var(--text-dim)] hover:bg-[var(--slate-light)] hover:text-[var(--danger)] transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
