import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
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

  useEffect(() => {
    if (location.state?.shouldRefresh) {
      console.log('🔄 Refreshing users from navigation state');
      fetchUsers();
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
      
      if (response && response.success && Array.isArray(response.data)) {
        usersArray = response.data;
      } else if (Array.isArray(response)) {
        usersArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        usersArray = response.data;
      } else {
        usersArray = [];
      }
      
      setUsers(usersArray);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    let filtered = [...users];

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

    if (selectedRole) {
      filtered = filtered.filter(user => user && user.role === selectedRole);
    }

    if (selectedStatus) {
      filtered = filtered.filter(user => user && user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.delete(id);
      toast.success('User deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
    
    if (!window.confirm(`Are you sure you want to ${newStatus === USER_STATUS.ACTIVE ? 'activate' : 'deactivate'} this user?`)) return;
    
    try {
      await userService.updateStatus(id, newStatus);
      toast.success(`User ${newStatus === USER_STATUS.ACTIVE ? 'activated' : 'deactivated'}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Status toggle error:', error);
      toast.error(`Failed to update user status: ${error.response?.data?.error || error.message}`);
    }
  };

  const getRoleBadge = (role) => {
    if (!role) return <span className="text-gray-400 badge bg-gray-500/20">Unknown</span>;
    
    switch (role) {
      case USER_ROLES.ADMIN:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">Admin</span>;
      case USER_ROLES.MODERATOR:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">Moderator</span>;
      case USER_ROLES.USER:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">User</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">{role}</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="text-gray-400 badge bg-gray-500/20">Unknown</span>;
    
    switch (status) {
      case USER_STATUS.ACTIVE:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Active</span>;
      case USER_STATUS.INACTIVE:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Inactive</span>;
      case USER_STATUS.SUSPENDED:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Suspended</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const getInitialsSafe = (name) => {
    if (!name || name === 'undefined' || name === 'null') return '??';
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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              <span className="font-medium text-white">
                {getInitialsSafe(displayName)}
              </span>
            </div>
            <div className="ml-4">
              <div className="font-medium text-white">{displayName}</div>
              <div className="text-sm text-gray-400">{displayEmail}</div>
              {user?.phone && (
                <div className="text-xs text-gray-500">{user.phone}</div>
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
          className={`p-1 rounded-full transition-colors ${
            user.status === USER_STATUS.ACTIVE 
              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
              : 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
          }`}
          title={user.status === USER_STATUS.ACTIVE ? 'Deactivate' : 'Activate'}
        >
          {user.status === USER_STATUS.ACTIVE ? (
            <XCircleIcon className="w-5 h-5" />
          ) : (
            <CheckCircleIcon className="w-5 h-5" />
          )}
        </button>
        <Link
          to={`/users/edit/${user._id}`}
          className="p-1 text-yellow-500 transition-colors rounded-full hover:text-yellow-400 hover:bg-yellow-900/20"
          title="Edit"
          onClick={(e) => e.stopPropagation()}
        >
          <PencilIcon className="w-5 h-5" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(user._id);
          }}
          className="p-1 text-red-400 transition-colors rounded-full hover:text-red-300 hover:bg-red-900/20"
          title="Delete"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const activeUsers = Array.isArray(users) ? users.filter(u => u?.status === USER_STATUS.ACTIVE).length : 0;
  const adminUsers = Array.isArray(users) ? users.filter(u => u?.role === USER_ROLES.ADMIN).length : 0;
  const moderatorUsers = Array.isArray(users) ? users.filter(u => u?.role === USER_ROLES.MODERATOR).length : 0;

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage user accounts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/users/new"
            className="inline-flex items-center px-4 py-2 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add User
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 text-center bg-gray-800 border border-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-white">
            {Array.isArray(users) ? users.length : 0}
          </div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
        <div className="p-4 text-center bg-gray-800 border border-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-green-400">
            {activeUsers}
          </div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="p-4 text-center bg-gray-800 border border-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-purple-400">
            {adminUsers}
          </div>
          <div className="text-sm text-gray-400">Admins</div>
        </div>
        <div className="p-4 text-center bg-gray-800 border border-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">
            {moderatorUsers}
          </div>
          <div className="text-sm text-gray-400">Moderators</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
              className="px-4 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
              className="px-4 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
              className="px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 mb-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">
                    Showing {filteredUsers.length} of {users.length} users
                  </span>
                </div>
                <div className="text-sm text-gray-500">
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
                <div className="py-12 text-center">
                  <p className="mb-2 text-lg text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500">
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