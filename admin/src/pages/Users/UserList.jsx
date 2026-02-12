import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { userService } from '../../services/users';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { formatDate, getInitials } from '../../utils/formatters';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';

const UserList = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  // Check if we need to refresh from navigation state
  useEffect(() => {
    if (location.state?.shouldRefresh) {
      console.log('🔄 Refreshing users from navigation state');
      fetchUsers();
      // Clear the state
      window.history.replaceState({}, '');
    }
  }, [location]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users...');
      
      const response = await userService.getAll();
      console.log('📦 API Response:', response);
      
      let usersArray = [];
      
      // Handle response format
      if (response && response.success && Array.isArray(response.data)) {
        usersArray = response.data;
        console.log(`✅ Loaded ${usersArray.length} users from response.data`);
      } else if (Array.isArray(response)) {
        usersArray = response;
        console.log(`✅ Loaded ${usersArray.length} users from direct array`);
      } else if (response && response.data && Array.isArray(response.data)) {
        usersArray = response.data;
        console.log(`✅ Loaded ${usersArray.length} users from nested data`);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        usersArray = [];
      }
      
      setUsers(usersArray);
      console.log('📊 Final users array:', usersArray);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    // Ensure users is an array
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        if (!user) return false;
        
        return (
          (user.name && user.name.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.phone && user.phone.toLowerCase().includes(query))
        );
      });
    }

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(user => user && user.role === selectedRole);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(user => user && user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.delete(id);
      toast.success('User deleted successfully');
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
    
    if (!window.confirm(`Are you sure you want to ${newStatus === USER_STATUS.ACTIVE ? 'activate' : 'deactivate'} this user?`)) {
      return;
    }
    
    try {
      await userService.updateStatus(id, newStatus);
      toast.success(`User ${newStatus === USER_STATUS.ACTIVE ? 'activated' : 'deactivated'}`);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Status toggle error:', error);
      toast.error(`Failed to update user status: ${error.response?.data?.error || error.message}`);
    }
  };

  const getRoleBadge = (role) => {
    if (!role) return <span className="badge bg-gray-100 text-gray-800">Unknown</span>;
    
    switch (role) {
      case USER_ROLES.ADMIN:
        return <span className="badge bg-purple-100 text-purple-800">Admin</span>;
      case USER_ROLES.MODERATOR:
        return <span className="badge bg-blue-100 text-blue-800">Moderator</span>;
      case USER_ROLES.USER:
        return <span className="badge bg-gray-100 text-gray-800">User</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge badge-info">Unknown</span>;
    
    switch (status) {
      case USER_STATUS.ACTIVE:
        return <span className="badge badge-success">Active</span>;
      case USER_STATUS.INACTIVE:
        return <span className="badge badge-error">Inactive</span>;
      case USER_STATUS.SUSPENDED:
        return <span className="badge badge-warning">Suspended</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const getInitialsSafe = (name) => {
    if (!name || name === 'undefined' || name === 'null') {
      return '??';
    }
    return getInitials(name) || '??';
  };

  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (name, user) => {
        const displayName = user?.name && user.name !== 'undefined' ? user.name : 'Unknown User';
        const displayEmail = user?.email || 'No email';
        
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {getInitialsSafe(displayName)}
              </span>
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-900">{displayName}</div>
              <div className="text-sm text-gray-500">{displayEmail}</div>
              {user?.phone && (
                <div className="text-xs text-gray-400">{user.phone}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      title: 'Role',
      render: (role) => getRoleBadge(role),
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (date) => date ? formatDate(date) : 'Unknown',
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (date) => date ? formatDate(date) : 'Never',
    },
  ];

  const actions = (user) => {
    if (!user || !user._id) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(user._id, user.status);
          }}
          className={`p-1 rounded-full ${
            user.status === USER_STATUS.ACTIVE 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={user.status === USER_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}
        >
          {user.status === USER_STATUS.ACTIVE ? (
            <XCircleIcon className="h-5 w-5" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
        </button>
        <Link
          to={`/users/edit/${user._id}`}
          className="p-1 rounded-full text-primary-600 hover:bg-primary-50"
          title="Edit"
          onClick={(e) => e.stopPropagation()}
        >
          <PencilIcon className="h-5 w-5" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(user._id);
          }}
          className="p-1 rounded-full text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // Calculate stats safely
  const activeUsers = Array.isArray(users) ? users.filter(u => u?.status === USER_STATUS.ACTIVE).length : 0;
  const adminUsers = Array.isArray(users) ? users.filter(u => u?.role === USER_ROLES.ADMIN).length : 0;
  const moderatorUsers = Array.isArray(users) ? users.filter(u => u?.role === USER_ROLES.MODERATOR).length : 0;

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleManualRefresh}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : (
              '↻'
            )}
            Refresh
          </button>
          <Link
            to="/users/new"
            className="btn-primary flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add User
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Array.isArray(users) ? users.length : 0}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {adminUsers}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {moderatorUsers}
          </div>
          <div className="text-sm text-gray-600">Moderators</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search users by name, email, or phone..."
              onSearch={setSearchQuery}
              disabled={loading}
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field min-w-[120px]"
              disabled={loading}
            >
              <option value="">All Roles</option>
              {Object.values(USER_ROLES).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field min-w-[120px]"
              disabled={loading}
            >
              <option value="">All Status</option>
              {Object.values(USER_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedRole('');
                setSelectedStatus('');
                setSearchQuery('');
              }}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedRole && `Role: ${selectedRole} • `}
                  {selectedStatus && `Status: ${selectedStatus} • `}
                  {searchQuery && `Search: "${searchQuery}"`}
                </div>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={filteredUsers}
              loading={false}
              emptyMessage={
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No users found</p>
                  <p className="text-gray-400 text-sm">
                    {searchQuery || selectedRole || selectedStatus 
                      ? 'Try adjusting your search filters'
                      : 'No users in the system yet. Click "Add User" to create one.'}
                  </p>
                </div>
              }
              pagination
              currentPage={1}
              totalPages={Math.ceil(filteredUsers.length / 10)}
              totalItems={filteredUsers.length}
              itemsPerPage={10}
              onRowClick={(user) => {
                if (user?._id) {
                  window.open(`/users/edit/${user._id}`, '_self');
                }
              }}
              actions={actions}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;