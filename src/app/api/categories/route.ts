import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.assetCategory.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, warrantyPeriod } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const category = await prisma.assetCategory.create({
    data: { name, warrantyPeriod: warrantyPeriod ? parseInt(warrantyPeriod) : null },
  });
  return NextResponse.json(category, { status: 201 });
}
