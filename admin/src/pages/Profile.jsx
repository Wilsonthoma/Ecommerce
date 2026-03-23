import React from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Profile</h1>
        <p className="text-gray-400">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="p-6 text-center bg-gray-800 border border-gray-700 rounded-xl">
            <div className="relative inline-block">
              <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                <span className="text-5xl font-bold text-white">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">{user?.name || 'Admin User'}</h2>
            <p className="mt-1 text-sm text-yellow-500 capitalize">{user?.role?.replace('_', ' ') || 'Administrator'}</p>
            <div className="pt-4 mt-4 border-t border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50">
                <UserIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-white">{user?.name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50">
                <EnvelopeIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-medium text-white">{user?.email || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50">
                <PhoneIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-white">{user?.phone || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50">
                <MapPinIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-white">{user?.address || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 text-center">
        <p className="text-gray-500">Profile features coming soon...</p>
      </div>
    </div>
  );
};

export default Profile;