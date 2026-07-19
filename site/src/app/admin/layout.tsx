import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-[70vh] bg-paper-deep/30">{children}</div>
    </AdminAuthProvider>
  );
}
