import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role || "EMPLOYEE";
  const userName = session.user.name || session.user.email || "User";

  return (
    <div className="flex min-h-screen bg-[var(--graphite)]">
      <Sidebar userName={userName} role={role} />
      <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
