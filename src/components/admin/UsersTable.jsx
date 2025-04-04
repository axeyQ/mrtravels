// src/components/admin/UsersTable.jsx
"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BiUser, BiCheckCircle, BiXCircle, BiShieldQuarter } from 'react-icons/bi';

export default function UsersTable({ 
  users = [], 
  onViewUser,
  onToggleAdmin,
  isLoading = false 
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on component mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b border-gray-200 p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="w-1/4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="w-1/4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 relative rounded-full overflow-hidden bg-gray-100 mr-3">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400">
                        <BiUser className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500">{user.phoneNumber || "No phone"}</p>
                  </div>
                </div>
                <div>
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Profile Status</span>
                  <p className="text-sm font-medium flex items-center">
                    {user.profileComplete ? (
                      <>
                        <BiCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        <BiXCircle className="h-4 w-4 text-red-500 mr-1" />
                        Incomplete
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Joined</span>
                  <p className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex justify-end space-x-3">
              <button
                onClick={() => onViewUser(user)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Details
              </button>
              <button
                onClick={() => onToggleAdmin(user)}
                className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md
                  ${user.role === 'admin'
                    ? 'border-red-600 text-red-600 hover:bg-red-50'
                    : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <BiShieldQuarter className="mr-1.5 h-4 w-4" />
                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 relative rounded-full overflow-hidden">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-400">
                        <BiUser className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.phoneNumber || "Not provided"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.profileComplete ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Incomplete
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.role === "admin" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    User
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onViewUser(user)}
                  className="text-primary hover:text-primary-600 mr-4"
                >
                  View Details
                </button>
                <button
                  onClick={() => onToggleAdmin(user)}
                  className={user.role === 'admin' 
                    ? 'text-red-600 hover:text-red-800' 
                    : 'text-purple-600 hover:text-purple-800'
                  }
                >
                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}