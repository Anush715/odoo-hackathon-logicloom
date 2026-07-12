import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getKpis() {
  const [available, allocated, maintenanceToday, activeBookings, pendingTransfers, overdue] =
    await Promise.all([
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "ALLOCATED" } }),
      prisma.maintenanceRequest.count({
        where: { status: { in: ["APPROVED", "IN_PROGRESS"] } },
      }),
      prisma.booking.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.transfer.count({ where: { status: "REQUESTED" } }),
      prisma.allocation.findMany({
        where: {
          isActive: true,
          expectedReturnDate: { lt: new Date() },
        },
        include: { asset: true, employee: true, department: true },
        take: 5,
      }),
    ]);

  return { available, allocated, maintenanceToday, activeBookings, pendingTransfers, overdue };
}

const KPI_CONFIG = [
  { key: "available", label: "Assets Available", stripe: "tag-stripe-available" },
  { key: "allocated", label: "Assets Allocated", stripe: "tag-stripe-allocated" },
  { key: "maintenanceToday", label: "In Maintenance", stripe: "tag-stripe-maintenance" },
  { key: "activeBookings", label: "Active Bookings", stripe: "tag-stripe-reserved" },
  { key: "pendingTransfers", label: "Pending Transfers", stripe: "tag-stripe-allocated" },
] as const;

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--text-dim)] text-sm mt-1">
          Real-time snapshot of your organization&apos;s assets and resources.
        </p>
      </div>

      {/* KPI Cards - asset-tag styled */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {KPI_CONFIG.map((c) => (
          <div
            key={c.key}
            className={`bg-[var(--slate)] ${c.stripe} rounded-sm p-4`}
          >
            <div className="font-mono-tag text-3xl font-bold">
              {kpis[c.key as keyof typeof kpis] as number}
            </div>
            <div className="text-xs text-[var(--text-dim)] mt-1 uppercase tracking-wide">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/dashboard/assets/new"
          className="bg-[var(--amber)] text-[var(--graphite)] text-sm font-medium px-4 py-2 rounded-sm hover:brightness-110 transition"
        >
          + Register Asset
        </Link>
        <Link
          href="/dashboard/bookings/new"
          className="bg-[var(--slate-light)] text-sm font-medium px-4 py-2 rounded-sm hover:brightness-110 transition"
        >
          + Book Resource
        </Link>
        <Link
          href="/dashboard/maintenance/new"
          className="bg-[var(--slate-light)] text-sm font-medium px-4 py-2 rounded-sm hover:brightness-110 transition"
        >
          + Raise Maintenance Request
        </Link>
      </div>

      {/* Overdue returns - highlighted separately per spec */}
      <div className="bg-[var(--slate)] rounded-sm border border-[var(--danger)]/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm">
            Overdue Returns
          </h2>
          <span className="font-mono-tag text-xs text-[var(--danger)]">
            {kpis.overdue.length} flagged
          </span>
        </div>
        {kpis.overdue.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-dim)]">
            Nothing overdue. Clean sheet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {kpis.overdue.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-mono-tag text-xs">{a.asset.assetTag}</td>
                  <td className="px-4 py-3">{a.asset.name}</td>
                  <td className="px-4 py-3 text-[var(--text-dim)]">
                    {a.employee?.name || a.department?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--danger)] text-xs">
                    Due {a.expectedReturnDate?.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
