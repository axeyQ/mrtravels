"use client";
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Image from 'next/image';
import { BiUser, BiCheckCircle, BiXCircle, BiShieldQuarter, BiTag, BiFilter } from 'react-icons/bi';
import { X } from 'lucide-react';

export default function UsersTable({ 
  users = [], 
  onViewUser,
  onToggleAdmin,
  isLoading = false,
  adminId = null // Add this prop to pass the current admin's user ID
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [showTagFilters, setShowTagFilters] = useState(false);

  // Get all unique tags for filtering
  const allTags = useQuery(
    api.users.getAllTags,
    adminId ? { adminId } : "skip"
  ) || [];

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

  // Filter users by tag
  const filteredUsers = useMemo(() => {
    if (!tagFilter) return users;
    
    return users.filter(user => {
      if (!user.tags) return false;
      return user.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());
    });
  }, [users, tagFilter]);

  // Tag filtering component
  const TagFiltering = () => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowTagFilters(!showTagFilters)}
          className="flex items-center text-sm font-medium text-gray-700"
        >
          <BiFilter className="h-5 w-5 mr-1" />
          Filter by Tags
          {tagFilter && (
            <span className="ml-2 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center">
              {tagFilter}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTagFilter('');
                }}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </button>
      </div>
      
      {showTagFilters && allTags.length > 0 && (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            <button
              onClick={() => setTagFilter('')}
              className={`px-2 py-1 text-xs rounded-full ${
                !tagFilter 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={`px-2 py-1 text-xs rounded-full ${
                  tag === tagFilter 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Function to render tags
  const renderTags = (userTags) => {
    if (!userTags || userTags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {userTags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
          >
            {tag}
          </span>
        ))}
        {userTags.length > 3 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            +{userTags.length - 3}
          </span>
        )}
      </div>
    );
  };

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

  // Render tag filter UI if we have tags
  const showTagFilter = allTags && allTags.length > 0;

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
      <div>
        {/* Tag filtering UI */}
        {showTagFilter && <TagFiltering />}
        
        {/* User count */}
        {tagFilter && (
          <p className="text-sm text-gray-500 mb-3">
            Showing {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} 
            {tagFilter && ` with tag "${tagFilter}"`}
          </p>
        )}
        
        <div className="space-y-4">
          {filteredUsers.map((user) => (
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
                
                {/* Tags section */}
                {user.tags && user.tags.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <BiTag className="mr-1" /> Tags:
                    </div>
                    {renderTags(user.tags)}
                  </div>
                )}
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
      </div>
    );
  }

  // Desktop table view
  return (
    <div>
      {/* Tag filtering UI */}
      {showTagFilter && <TagFiltering />}
      
      {/* User count */}
      {tagFilter && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} 
          {tagFilter && ` with tag "${tagFilter}"`}
        </p>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
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
                <td className="px-6 py-4">
                  {renderTags(user.tags)}
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
    </div>
  );
}