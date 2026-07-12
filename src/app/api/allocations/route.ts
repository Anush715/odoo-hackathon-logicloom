import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/allocations -> all allocations (with overdue flag) + assets + employees
// (assets/employees included so the Allocations page can populate its dropdowns from one call)
export async function GET() {
  const [allocationsRaw, assets, employees] = await Promise.all([
    prisma.allocation.findMany({
      include: { asset: true, employee: true, department: true, transfers: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.asset.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  const now = new Date();
  const allocations = allocationsRaw.map((a: (typeof allocationsRaw)[number]) => ({
    ...a,
    status: a.isActive ? "Active" : "Returned",
    overdue: !!(a.isActive && a.expectedReturnDate && a.expectedReturnDate < now),
  }));

  return NextResponse.json({ allocations, assets, employees });
}

// POST /api/allocations -> allocate asset to employee/department
// Blocks double-allocation: if asset already has an active allocation, reject with 409
// and return the current holder's name so the UI can offer "Request Transfer".
// body: { assetId, employeeId?, departmentId?, expectedReturnDate? }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId, employeeId, departmentId, expectedReturnDate } = await req.json();

  if (!assetId || (!employeeId && !departmentId)) {
    return NextResponse.json(
      { error: "assetId and (employeeId or departmentId) are required" },
      { status: 400 }
    );
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Conflict rule: block if there's already an active allocation for this asset
  const existingActive = await prisma.allocation.findFirst({
    where: { assetId, isActive: true },
    include: { employee: true, department: true },
  });

  if (existingActive) {
    const holderName = existingActive.employee?.name || existingActive.department?.name || "someone";
    return NextResponse.json(
      {
        error: `Asset is currently held by ${holderName}`,
        currentHolder: holderName,
        allocationId: existingActive.id,
      },
      { status: 409 }
    );
  }

  if (asset.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: `Asset is not available (current status: ${asset.status})` },
      { status: 409 }
    );
  }

  const allocation = await prisma.allocation.create({
    data: {
      assetId,
      employeeId: employeeId || null,
      departmentId: departmentId || null,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      isActive: true,
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "ALLOCATED" },
  });

  return NextResponse.json(allocation, { status: 201 });
}

// PATCH /api/allocations -> transfer workflow + return flow
// body variants:
//  { action: "transfer_request", allocationId, toEmployeeId? }
//  { action: "transfer_approve", transferId }                -> re-allocates, updates history
//  { action: "return", allocationId, conditionNotes? }
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id as string;

  const body = await req.json();

  if (body.action === "transfer_request") {
    const { allocationId, toEmployeeId } = body;
    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });

    const transfer = await prisma.transfer.create({
      data: {
        allocationId,
        requestedById: userId,
        toEmployeeId: toEmployeeId || null,
        status: "REQUESTED",
      },
    });
    return NextResponse.json(transfer, { status: 201 });
  }

  if (body.action === "transfer_approve") {
    // Approved by Asset Manager / Department Head
    const role = (session.user as { role?: string }).role;
    if (role !== "ASSET_MANAGER" && role !== "DEPARTMENT_HEAD" && role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to approve transfers" }, { status: 403 });
    }

    const { transferId } = body;
    const transfer = await prisma.transfer.findUnique({ where: { id: transferId }, include: { allocation: true } });
    if (!transfer) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });

    // Close old allocation, open a new one for the target employee -> history stays intact
    await prisma.allocation.update({
      where: { id: transfer.allocationId },
      data: { isActive: false, returnedAt: new Date() },
    });

    const newAllocation = await prisma.allocation.create({
      data: {
        assetId: transfer.allocation.assetId,
        employeeId: transfer.toEmployeeId,
        isActive: true,
      },
    });

    await prisma.transfer.update({
      where: { id: transferId },
      data: { status: "COMPLETED", resolvedAt: new Date() },
    });

    return NextResponse.json(newAllocation);
  }

  if (body.action === "return") {
    const { allocationId, conditionNotes } = body;
    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });

    await prisma.allocation.update({
      where: { id: allocationId },
      data: { isActive: false, returnedAt: new Date(), conditionNotes: conditionNotes || null },
    });

    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: "AVAILABLE" },
    });

    return NextResponse.json({ message: "Asset returned" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}