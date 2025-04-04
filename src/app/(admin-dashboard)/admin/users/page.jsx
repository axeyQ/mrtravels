// src/app/(admin-dashboard)/admin/users/page.jsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-toastify";
import UserDetailView from "@/components/admin/UserDetailView";
import UsersTable from "@/components/admin/UsersTable"; // Import our new responsive component

export default function AdminUsers() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const users = useQuery(
    api.users.listUsers,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  const isLoading = !isUserLoaded || users === undefined;
  const [selectedUser, setSelectedUser] = useState(null);
  
  const updateUserRole = useMutation(api.users.updateUserRole);

  // Handle toggling admin status
  const handleToggleAdmin = async (userData) => {
    if (!isUserLoaded || !user) return;
    try {
      const newRole = userData.role === "admin" ? "user" : "admin";
      await updateUserRole({
        adminId: user.id,
        userId: userData.userId,
        newRole,
      });
      toast.success(`User is now ${newRole === "admin" ? "an admin" : "a regular user"}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold md:block hidden">Manage Users</h1>
      </div>
      
      {/* Use our new responsive users table component */}
      <UsersTable
        users={users}
        onViewUser={setSelectedUser}
        onToggleAdmin={handleToggleAdmin}
        isLoading={isLoading}
      />
      
      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailView
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleAdmin={handleToggleAdmin}
        />
      )}
    </div>
  );
}