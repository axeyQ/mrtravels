// src/app/(admin-dashboard)/admin/layout.js
// Updated admin layout that preserves the desktop view while optimizing for mobile
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: 'Admin Dashboard - ZipBikes',
  description: 'Manage bikes, bookings, and users',
};

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        
        {/* Content area - correctly positioned for both desktop and mobile */}
        <div className="flex-1 md:ml-64">
          <main className="md:p-6 p-4 pb-20 md:pb-6 pt-16 md:pt-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}