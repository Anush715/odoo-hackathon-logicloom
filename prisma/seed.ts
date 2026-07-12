import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Departments
  const engineering = await prisma.department.create({
    data: { name: "Engineering", status: "ACTIVE" },
  });
  const operations = await prisma.department.create({
    data: { name: "Operations", status: "ACTIVE" },
  });

  // Categories
  const electronics = await prisma.assetCategory.create({
    data: { name: "Electronics", warrantyPeriod: 24 },
  });
  const furniture = await prisma.assetCategory.create({
    data: { name: "Furniture" },
  });
  const vehicles = await prisma.assetCategory.create({
    data: { name: "Vehicles" },
  });

  // Users - one of each role for demo purposes
  const admin = await prisma.employee.create({
    data: {
      name: "Admin User",
      email: "admin@assetflow.com",
      password,
      role: "ADMIN",
      departmentId: engineering.id,
    },
  });

  const assetManager = await prisma.employee.create({
    data: {
      name: "Asset Manager",
      email: "manager@assetflow.com",
      password,
      role: "ASSET_MANAGER",
      departmentId: operations.id,
    },
  });

  const deptHead = await prisma.employee.create({
    data: {
      name: "Priya Sharma",
      email: "priya@assetflow.com",
      password,
      role: "DEPARTMENT_HEAD",
      departmentId: engineering.id,
    },
  });

  const employee = await prisma.employee.create({
    data: {
      name: "Raj Verma",
      email: "raj@assetflow.com",
      password,
      role: "EMPLOYEE",
      departmentId: engineering.id,
    },
  });

  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: deptHead.id },
  });

  // Sample assets across lifecycle states
  const laptop = await prisma.asset.create({
    data: {
      assetTag: "AF-0001",
      name: "Dell Latitude 5420",
      categoryId: electronics.id,
      serialNumber: "DL5420-88213",
      condition: "Good",
      location: "3rd Floor, IT Store",
      status: "ALLOCATED",
      acquisitionCost: 62000,
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: laptop.id,
      employeeId: employee.id,
      expectedReturnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // overdue
      isActive: true,
    },
  });

  await prisma.asset.create({
    data: {
      assetTag: "AF-0002",
      name: "Conference Room B2",
      categoryId: furniture.id,
      condition: "Good",
      location: "2nd Floor",
      status: "AVAILABLE",
      isBookable: true,
    },
  });

  await prisma.asset.create({
    data: {
      assetTag: "AF-0003",
      name: "Toyota Innova (Fleet)",
      categoryId: vehicles.id,
      condition: "Fair",
      location: "Basement Parking",
      status: "UNDER_MAINTENANCE",
    },
  });

  await prisma.asset.create({
    data: {
      assetTag: "AF-0004",
      name: "Ergonomic Chair",
      categoryId: furniture.id,
      condition: "Good",
      location: "4th Floor",
      status: "AVAILABLE",
    },
  });

  console.log("Seed complete.");
  console.log("Login as: admin@assetflow.com / manager@assetflow.com / priya@assetflow.com / raj@assetflow.com");
  console.log("Password for all: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
