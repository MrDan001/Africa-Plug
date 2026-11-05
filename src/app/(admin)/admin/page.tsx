// FILE PATH: src/app/(admin)/admin/page.tsx
// Sign-in is handled by AdminAuthGate in the admin layout, so this page only renders the dashboard.
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminHomePage() {
  return <AdminDashboard />;
}
