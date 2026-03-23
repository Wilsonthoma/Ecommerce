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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const validationErrors = validateUser(formData);
    
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

      if (formData.password) {
        userData.password = formData.password;
      }

      if (isEditMode) {
        await userService.update(id, userData);
        toast.success('User updated successfully');
      } else {
        await userService.create(userData);
        toast.success('User created successfully');
      }
      
      navigate('/users', { state: { shouldRefresh: true } });
      
    } catch (error) {
      console.error('❌ Operation failed:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Operation failed';
      toast.error(message);
      
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center mb-2 text-sm text-gray-400 transition-colors hover:text-yellow-500"
            disabled={loading}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Users
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="text-gray-400">
            {isEditMode ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            className="px-6 py-2 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEditMode ? 'Update User' : 'Create User'
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
            <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="user@example.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition ${errors.phone ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="+254712345678"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    disabled={loading}
                  >
                    <option value={USER_ROLES.USER}>User</option>
                    <option value={USER_ROLES.MODERATOR}>Moderator</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                  </select>
                </div>
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required={!isEditMode}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      At least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required={!isEditMode}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {isEditMode && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    New Password (leave blank to keep current)
                  </label>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
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
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        placeholder="Confirm new password"
                        disabled={loading}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Address Information */}
          <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Address Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  placeholder="123 Main St"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="Nairobi"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="Kenya"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="00100"
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
          <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Status & Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Account Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  disabled={loading}
                >
                  <option value={USER_STATUS.ACTIVE}>Active</option>
                  <option value={USER_STATUS.INACTIVE}>Inactive</option>
                  <option value={USER_STATUS.SUSPENDED}>Suspended</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  type="submit"
                  form="user-form"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditMode ? 'Update User' : 'Create User'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors mt-3"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-sm font-medium text-white">{id || 'Will be generated'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-white">
                  {isEditMode ? 'Previously' : 'Upon creation'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-white">
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