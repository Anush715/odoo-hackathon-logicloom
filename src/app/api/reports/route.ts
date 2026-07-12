import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      lostAssets,
      totalBookings,
      totalAllocations,
      totalDepartments,
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
      prisma.department.count(),
    ]);

    return NextResponse.json({
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      lostAssets,
      totalBookings,
      totalAllocations,
      totalDepartments,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}