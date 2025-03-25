// app/(admin-dashboard)/admin/layout.jsx
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: 'Admin Dashboard - Bike Booking App',
  description: 'Manage bikes, bookings, and users',
};

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}