import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/bookings -> all bookings + bookable resources (assets with isBookable = true)
export async function GET() {
  const [bookings, resources] = await Promise.all([
    prisma.booking.findMany({
      include: { asset: true, employee: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.asset.findMany({ where: { isBookable: true }, orderBy: { name: "asc" } }),
  ]);

  // present as "resource" in payload since booking is asset-based (per schema)
  const shaped = bookings.map((b: (typeof bookings)[number]) => ({ ...b, resource: b.asset }));

  return NextResponse.json({ bookings: shaped, resources });
}

// POST /api/bookings -> book a shared resource for a time slot
// Overlap validation: reject if [startTime, endTime) overlaps any existing
// non-cancelled booking for the same asset.
// Example from spec: 9:00-10:00 booked -> 9:30-10:30 rejected, 10:00-11:00 OK.
// body: { assetId (or resourceId), startTime, endTime }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id as string;

  const body = await req.json();
  const assetId = body.assetId || body.resourceId;
  const { startTime, endTime } = body;

  if (!assetId || !startTime || !endTime) {
    return NextResponse.json({ error: "assetId, startTime, endTime are required" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return NextResponse.json({ error: "startTime must be before endTime" }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || !asset.isBookable) {
    return NextResponse.json({ error: "Asset is not a bookable resource" }, { status: 400 });
  }

  // overlap: existing.start < newEnd AND existing.end > newStart
  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId,
      status: { in: ["UPCOMING", "ONGOING"] },
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });

  if (overlapping) {
    return NextResponse.json(
      {
        error: `Slot overlaps an existing booking (${overlapping.startTime.toLocaleString()} - ${overlapping.endTime.toLocaleString()})`,
      },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      assetId,
      employeeId: userId,
      startTime: start,
      endTime: end,
      status: "UPCOMING",
    },
  });

  return NextResponse.json(booking, { status: 201 });
}

// PATCH /api/bookings -> cancel or reschedule
// body: { action: "cancel", bookingId }
// body: { action: "reschedule", bookingId, startTime, endTime }  (re-validates overlap)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === "cancel") {
    const { bookingId } = body;
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(booking);
  }

  if (body.action === "reschedule") {
    const { bookingId, startTime, endTime } = body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    const current = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!current) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const overlapping = await prisma.booking.findFirst({
      where: {
        assetId: current.assetId,
        id: { not: bookingId },
        status: { in: ["UPCOMING", "ONGOING"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlapping) {
      return NextResponse.json({ error: "New slot overlaps an existing booking" }, { status: 409 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { startTime: start, endTime: end },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}