import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="p-6 border bg-purple-500/10 border-purple-500/30 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 border border-gray-600 rounded-lg">
            <div>
              <p className="font-medium text-white">Enable Email Notifications</p>
              <p className="text-sm text-gray-400">Send email notifications to customers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications || false}
                onChange={(e) => onChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {formData.emailNotifications && (
            <div className="ml-6 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="orderConfirmation"
                  checked={formData.orderConfirmation || false}
                  onChange={(e) => onChange('orderConfirmation', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="orderConfirmation" className="block ml-3 text-sm font-medium text-gray-300">
                  Order confirmation emails
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shippingUpdates"
                  checked={formData.shippingUpdates || false}
                  onChange={(e) => onChange('shippingUpdates', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="shippingUpdates" className="block ml-3 text-sm font-medium text-gray-300">
                  Shipping updates
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="promotionalEmails"
                  checked={formData.promotionalEmails || false}
                  onChange={(e) => onChange('promotionalEmails', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="promotionalEmails" className="block ml-3 text-sm font-medium text-gray-300">
                  Promotional emails
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMS Notifications */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">SMS Notifications</h3>
        <div className="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-lg">
          <div>
            <p className="font-medium text-white">Enable SMS Notifications</p>
            <p className="text-sm text-gray-400">Send SMS updates to customers (requires SMS credits)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smsNotifications || false}
              onChange={(e) => onChange('smsNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      {/* Admin Notifications */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Admin Notifications</h3>
        <div className="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-lg">
          <div>
            <p className="font-medium text-white">New Order Alerts</p>
            <p className="text-sm text-gray-400">Receive notifications for new orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.adminNotifications || false}
              onChange={(e) => onChange('adminNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;