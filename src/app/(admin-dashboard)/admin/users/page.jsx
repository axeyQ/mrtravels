"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { BiUserCheck, BiUserX } from "react-icons/bi";

export default function AdminUsers() {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Fetch all users
  const users = useQuery(
    api.users.listUsers,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  
  const isLoading = !isUserLoaded || users === undefined;
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  
  const updateUserRole = useMutation(api.users.updateUserRole);
  
  // Handle updating user role
  const handleUpdateRole = async () => {
    if (!isUserLoaded || !user || !selectedUser || !newRole) return;
    
    // Don't allow changing own role
    if (selectedUser.userId === user.id) {
      toast.error("You cannot change your own role");
      setSelectedUser(null);
      setNewRole("");
      return;
    }
    
    try {
      await updateUserRole({
        adminId: user.id,
        userId: selectedUser.userId,
        newRole,
      });
      toast.success(`User role updated to ${newRole} successfully`);
      setSelectedUser(null);
      setNewRole("");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-8 w-1/4 rounded mb-6"></div>
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              <div className="bg-gray-200 h-6 rounded col-span-1"></div>
            </div>
          </div>
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b last:border-0 border-gray-200 py-4 grid grid-cols-5 gap-4">
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
                <div className="bg-gray-200 h-6 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Sort users by role (admins first) and then by created date
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return b.createdAt - a.createdAt;
  });
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      
      <div className="bg-white rounded-lg shadow">
        {sortedUsers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.map((userData) => (
                  <tr key={userData._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userData.firstName} {userData.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userData.userId === user?.id ? "(You)" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userData.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        userData.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                      }`}>
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {userData.userId !== user?.id && (
                        <div className="flex space-x-2">
                          {userData.role === "user" ? (
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setNewRole("admin");
                              }}
                              className="text-purple-600 hover:text-purple-800"
                              title="Make admin"
                            >
                              <BiUserCheck className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setNewRole("user");
                              }}
                              className="text-orange-600 hover:text-orange-800"
                              title="Remove admin"
                            >
                              <BiUserX className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Role Update Confirmation Modal */}
      {selectedUser && newRole && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Role Change
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to {newRole === "admin" ? "promote" : "demote"} <span className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</span> to {newRole}?
            </p>
            {newRole === "admin" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Admin users have full access to manage bikes, bookings, and other users.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className={`px-4 py-2 text-white rounded-md ${
                  newRole === "admin" ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}