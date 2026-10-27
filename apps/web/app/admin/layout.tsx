import "./admin.css";
import type { ReactNode } from "react";
import { AdminLayout } from "../../components/admin";
export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
