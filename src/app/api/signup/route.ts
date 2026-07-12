import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Business rule from PDF: Signup creates an Employee account ONLY.
// No role selection at signup - roles are promoted later by Admin only.
export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      password: hashed,
      role: "EMPLOYEE", // hard-coded, never trust client input for role
    },
  });

  return NextResponse.json({ id: employee.id, email: employee.email });
}
