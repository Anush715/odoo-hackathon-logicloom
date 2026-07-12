import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/org -> departments (with head + parent) + employee directory
// Categories are already served by /api/categories, so not duplicated here.
export async function GET() {
  const [departments, employees] = await Promise.all([
    prisma.department.findMany({
      include: { head: true, parent: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({
      include: { department: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ departments, employees });
}

// POST /api/org -> create a department (Admin only)
// body: { name, headId?, parentId? }
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Only Admin can manage departments" }, { status: 403 });
  }

  const { name, headId, parentId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Department name is required" }, { status: 400 });
  }

  const department = await prisma.department.create({
    data: {
      name,
      headId: headId || null,
      parentId: parentId || null,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(department, { status: 201 });
}

// PATCH /api/org -> promote an employee to Department Head / Asset Manager (Admin only)
// This is the ONLY place roles get assigned (per problem statement, no self-elevation).
// body: { action: "promote", employeeId, role }  role: "DEPARTMENT_HEAD" | "ASSET_MANAGER"
// also supports: { action: "toggleDeptStatus", departmentId, status }
export async function PATCH(req: Request) {
  const session = await auth();
  const sessionRole = (session?.user as { role?: string })?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (sessionRole !== "ADMIN") {
    return NextResponse.json({ error: "Only Admin can assign roles" }, { status: 403 });
  }

  const body = await req.json();

  if (body.action === "promote") {
    const { employeeId, role } = body;

    if (!employeeId || !["DEPARTMENT_HEAD", "ASSET_MANAGER", "EMPLOYEE"].includes(role)) {
      return NextResponse.json({ error: "Invalid employeeId or role" }, { status: 400 });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { role },
    });

    return NextResponse.json(updated);
  }

  if (body.action === "toggleDeptStatus") {
    const { departmentId, status } = body;
    if (!departmentId || !["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: "Invalid departmentId or status" }, { status: 400 });
    }
    const updated = await prisma.department.update({
      where: { id: departmentId },
      data: { status },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}