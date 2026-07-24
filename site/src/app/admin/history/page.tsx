import type { Metadata } from "next";
import { AdminHistoryPage } from "@/components/admin/AdminHistoryPage";

export const metadata: Metadata = {
  title: "History · Admin",
  robots: { index: false, follow: false },
};

export default function AdminHistoryRoute() {
  return <AdminHistoryPage />;
}
