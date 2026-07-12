import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/audits -> all audit cycles (with items+asset+auditor) + assets + employees
// (assets/employees included so the Create Audit Cycle form can populate scope/auditor pickers)
export async function GET() {
  const [cycles, assets, employees] = await Promise.all([
    prisma.auditCycle.findMany({
      include: {
        auditors: true,
        items: { include: { asset: true, auditor: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.asset.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  // discrepancy report per cycle = items that are Missing or Damaged
  const shaped = cycles.map((c) => ({
    ...c,
    discrepancies: c.items.filter((i) => i.result === "MISSING" || i.result === "DAMAGED"),
  }));

  return NextResponse.json({ cycles: shaped, assets, employees });
}

// POST /api/audits -> create an audit cycle, assign auditors, and seed one AuditItem
// (status PENDING) per asset in scope.
// body: { name, scopeDept?, scopeLocation?, startDate, endDate, auditorIds: string[], assetIds: string[] }
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Creating/scoping an audit cycle is an Admin / Asset Manager action
  if (role !== "ADMIN" && role !== "ASSET_MANAGER") {
    return NextResponse.json({ error: "Only Admin or Asset Manager can create audit cycles" }, { status: 403 });
  }

  const { name, scopeDept, scopeLocation, startDate, endDate, auditorIds, assetIds } = await req.json();

  if (!name || !startDate || !endDate || !assetIds?.length) {
    return NextResponse.json(
      { error: "name, startDate, endDate, and at least one assetId are required" },
      { status: 400 }
    );
  }

  const cycle = await prisma.auditCycle.create({
    data: {
      name,
      scopeDept: scopeDept || null,
      scopeLocation: scopeLocation || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isClosed: false,
      auditors: {
        connect: (auditorIds || []).map((id: string) => ({ id })),
      },
      items: {
        create: assetIds.map((assetId: string) => ({
          assetId,
          result: "PENDING",
        })),
      },
    },
    include: { auditors: true, items: { include: { asset: true } } },
  });

  return NextResponse.json(cycle, { status: 201 });
}

// PATCH /api/audits -> mark an item's audit result, or close the cycle
// body: { action: "mark_item", itemId, result, notes?, auditorId? }
//       result: "VERIFIED" | "MISSING" | "DAMAGED"
// body: { action: "close_cycle", cycleId }
//       -> locks the cycle and, per spec, sets asset status to LOST for confirmed-missing items
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id as string;

  const body = await req.json();

  if (body.action === "mark_item") {
    const { itemId, result, notes } = body;
    const validResults = ["VERIFIED", "MISSING", "DAMAGED"];
    if (!itemId || !validResults.includes(result)) {
      return NextResponse.json({ error: "Invalid itemId or result" }, { status: 400 });
    }

    const item = await prisma.auditItem.findUnique({ where: { id: itemId }, include: { auditCycle: true } });
    if (!item) return NextResponse.json({ error: "Audit item not found" }, { status: 404 });
    if (item.auditCycle.isClosed) {
      return NextResponse.json({ error: "Cannot edit items in a closed audit cycle" }, { status: 409 });
    }

    const updated = await prisma.auditItem.update({
      where: { id: itemId },
      data: { result, notes: notes || null, auditorId: userId },
    });

    return NextResponse.json(updated);
  }

  if (body.action === "close_cycle") {
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "ASSET_MANAGER") {
      return NextResponse.json({ error: "Only Admin or Asset Manager can close an audit cycle" }, { status: 403 });
    }

    const { cycleId } = body;
    const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId }, include: { items: true } });
    if (!cycle) return NextResponse.json({ error: "Audit cycle not found" }, { status: 404 });
    if (cycle.isClosed) {
      return NextResponse.json({ error: "Audit cycle is already closed" }, { status: 409 });
    }

    // Confirmed-missing items -> flip asset status to LOST
    const missingAssetIds = cycle.items.filter((i) => i.result === "MISSING").map((i) => i.assetId);
    if (missingAssetIds.length) {
      await prisma.asset.updateMany({
        where: { id: { in: missingAssetIds } },
        data: { status: "LOST" },
      });
    }

    const closed = await prisma.auditCycle.update({
      where: { id: cycleId },
      data: { isClosed: true },
      include: { items: { include: { asset: true } } },
    });

    const discrepancies = closed.items.filter((i) => i.result === "MISSING" || i.result === "DAMAGED");

    return NextResponse.json({ cycle: closed, discrepancyReport: discrepancies });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}