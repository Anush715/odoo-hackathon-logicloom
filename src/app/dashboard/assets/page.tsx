import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_STRIPE: Record<string, string> = {
  AVAILABLE: "tag-stripe-available",
  ALLOCATED: "tag-stripe-allocated",
  RESERVED: "tag-stripe-reserved",
  UNDER_MAINTENANCE: "tag-stripe-maintenance",
  LOST: "tag-stripe-lost",
  RETIRED: "tag-stripe-retired",
  DISPOSED: "tag-stripe-disposed",
};

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const assets = await prisma.asset.findMany({
    where: {
      AND: [
        params.status ? { status: params.status as never } : {},
        params.q
          ? {
              OR: [
                { name: { contains: params.q } },
                { assetTag: { contains: params.q } },
              ],
            }
          : {},
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Asset Registry</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">
            {assets.length} assets tracked
          </p>
        </div>
        <Link
          href="/dashboard/assets/new"
          className="bg-[var(--amber)] text-[var(--graphite)] text-sm font-medium px-4 py-2 rounded-sm hover:brightness-110 transition"
        >
          + Register Asset
        </Link>
      </div>

      {/* Search / filter */}
      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by tag, name, serial…"
          className="flex-1 bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--amber)]"
        />
        <select
          name="status"
          defaultValue={params.status || ""}
          className="bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_STRIPE).map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <button className="bg-[var(--slate-light)] text-sm px-4 py-2 rounded-sm">
          Filter
        </button>
      </form>

      {/* Asset grid - tag-card signature style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={`/dashboard/assets/${asset.id}`}
            className={`block bg-[var(--slate)] ${STATUS_STRIPE[asset.status]} rounded-sm p-4 hover:bg-[var(--slate-light)] transition-colors`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono-tag text-xs text-[var(--amber)]">
                {asset.assetTag}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
                {asset.status.replace("_", " ")}
              </span>
            </div>
            <div className="font-medium text-sm mb-1">{asset.name}</div>
            <div className="text-xs text-[var(--text-dim)]">
              {asset.category.name} · {asset.location || "No location set"}
            </div>
          </Link>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-dim)] text-sm">
            No assets yet. Register your first one.
          </div>
        )}
      </div>
    </div>
  );
}
