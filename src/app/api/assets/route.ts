import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  const assets = await prisma.asset.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q
          ? {
              OR: [
                { name: { contains: q } },
                { assetTag: { contains: q } },
                { serialNumber: { contains: q } },
                { location: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    categoryId,
    serialNumber,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    isBookable,
  } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  // Auto-generate Asset Tag e.g. AF-0001
  const count = await prisma.asset.count();
  const assetTag = `AF-${String(count + 1).padStart(4, "0")}`;

  const asset = await prisma.asset.create({
    data: {
      assetTag,
      name,
      categoryId,
      serialNumber: serialNumber || null,
      acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
      acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
      condition: condition || "Good",
      location: location || null,
      isBookable: !!isBookable,
      status: "AVAILABLE",
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
