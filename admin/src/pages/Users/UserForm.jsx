import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/users';
import { validateUser } from '../../utils/validators';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      console.log(`🔄 Fetching user with ID: ${id}`);
      const response = await userService.getById(id);
      console.log('📦 User response:', response);
      
      const user = response.data || response;
      
      // Handle nested address structure from backend
      const address = user.address || {};
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || USER_ROLES.USER,
        status: user.status || USER_STATUS.ACTIVE,
        password: '',
        confirmPassword: '',
        address: address.street || address || '',
        city: address.city || '',
        country: address.country || '',
        postalCode: address.postalCode || ''
      });
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      toast.error('Failed to fetch user');
      navigate('/users');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const validationErrors = validateUser(formData);
    
    // Additional validation for new users
    if (!isEditMode && !formData.password) {
      validationErrors.password = 'Password is required';
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for backend format
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        address: {
          street: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode
        }
      };

      // Only include password if provided (for new users or password change)
      if (formData.password) {
        userData.password = formData.password;
      }

      let result;
      if (isEditMode) {
        result = await userService.update(id, userData);
        toast.success('User updated successfully');
      } else {
        result = await userService.create(userData);
        toast.success('User created successfully');
      }
      
      console.log('✅ Operation successful:', result);
      
      // Navigate back to users list with refresh flag
      navigate('/users', { 
        state: { shouldRefresh: true } 
      });
      
    } catch (error) {
      console.error('❌ Operation failed:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Operation failed';
      toast.error(message);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            disabled={loading}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Users
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEditMode ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="user@example.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="+1234567890"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input-field"
                    disabled={loading}
                  >
                    <option value={USER_ROLES.USER}>User</option>
                    <option value={USER_ROLES.MODERATOR}>Moderator</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                  </select>
                </div>
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required={!isEditMode}
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      At least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required={!isEditMode}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (leave blank to keep current)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Confirm new password"
                        disabled={loading}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Address Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123 Main St"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="New York"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="United States"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="10001"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  disabled={loading}
                >
                  <option value={USER_STATUS.ACTIVE}>Active</option>
                  <option value={USER_STATUS.INACTIVE}>Inactive</option>
                  <option value={USER_STATUS.SUSPENDED}>Suspended</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  form="user-form"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update User' : 'Create User'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="w-full btn-secondary mt-3"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-sm font-medium text-gray-900">{id || 'Will be generated'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {isEditMode ? 'Previously' : 'Upon creation'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {isEditMode ? 'Previously' : 'Upon creation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;