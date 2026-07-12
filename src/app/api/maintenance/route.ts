import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/maintenance -> all requests + list of assets (for the raise-request dropdown)
export async function GET() {
  const [requests, assets] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      include: { asset: true, requester: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.asset.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ requests, assets });
}

// POST /api/maintenance -> raise a maintenance request (status starts PENDING)
// body: { assetId, issue, priority, photoUrl? }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id as string;

  const { assetId, issue, priority, photoUrl } = await req.json();

  if (!assetId || !issue) {
    return NextResponse.json({ error: "assetId and issue are required" }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId,
      requesterId: userId,
      issue,
      priority: (priority || "MEDIUM").toUpperCase(),
      photoUrl: photoUrl || null,
      status: "PENDING",
    },
  });

  return NextResponse.json(request, { status: 201 });
}

// PATCH /api/maintenance -> workflow: PENDING -> APPROVED/REJECTED (Asset Manager)
//                            -> TECHNICIAN_ASSIGNED -> IN_PROGRESS -> RESOLVED
// Asset status auto-syncs: APPROVED => asset UNDER_MAINTENANCE, RESOLVED => asset AVAILABLE
// body: { requestId, status, technician? }
export async function PATCH(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, status, technician } = await req.json();

  const validStatuses = ["APPROVED", "REJECTED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"];
  if (!requestId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid requestId or status" }, { status: 400 });
  }

  // Approval / rejection is an Asset Manager (or Admin) decision
  if ((status === "APPROVED" || status === "REJECTED") && role !== "ASSET_MANAGER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Only Asset Manager can approve/reject" }, { status: 403 });
  }

  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status,
      technician: technician || request.technician,
      resolvedAt: status === "RESOLVED" ? new Date() : request.resolvedAt,
    },
  });

  // Sync asset status per spec: auto-updates on approval and on resolution
  if (status === "APPROVED") {
    await prisma.asset.update({ where: { id: request.assetId }, data: { status: "UNDER_MAINTENANCE" } });
  }
  if (status === "RESOLVED") {
    await prisma.asset.update({ where: { id: request.assetId }, data: { status: "AVAILABLE" } });
  }

  return NextResponse.json(updated);
}