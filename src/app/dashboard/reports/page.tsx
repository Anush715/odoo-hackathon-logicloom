import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const [
    totalAssets,
    availableAssets,
    allocatedAssets,
    maintenanceAssets,
    lostAssets,
    totalBookings,
    totalAllocations,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({
      where: { status: "AVAILABLE" },
    }),
    prisma.asset.count({
      where: { status: "ALLOCATED" },
    }),
    prisma.asset.count({
      where: { status: "UNDER_MAINTENANCE" },
    }),
    prisma.asset.count({
      where: { status: "LOST" },
    }),
    prisma.booking.count(),
    prisma.allocation.count(),
  ]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Total Assets</h2>
          <p className="text-3xl font-bold">{totalAssets}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Available Assets</h2>
          <p className="text-3xl font-bold">{availableAssets}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Allocated Assets</h2>
          <p className="text-3xl font-bold">{allocatedAssets}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Maintenance</h2>
          <p className="text-3xl font-bold">{maintenanceAssets}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Lost Assets</h2>
          <p className="text-3xl font-bold">{lostAssets}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Bookings</h2>
          <p className="text-3xl font-bold">{totalBookings}</p>
        </div>

        <div className="border rounded-lg p-5">
          <h2 className="text-gray-500">Allocations</h2>
          <p className="text-3xl font-bold">{totalAllocations}</p>
        </div>

      </div>
    </main>
  );
}