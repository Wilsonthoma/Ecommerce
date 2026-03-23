import React, { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const SecuritySettings = ({ formData, onChange }) => {
  const [newIp, setNewIp] = useState('');

  const addIp = () => {
    if (newIp && !formData.ipWhitelist?.includes(newIp)) {
      onChange('ipWhitelist', [...(formData.ipWhitelist || []), newIp]);
      setNewIp('');
    }
  };

  const removeIp = (ip) => {
    onChange('ipWhitelist', (formData.ipWhitelist || []).filter(i => i !== ip));
  };

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div className="p-6 border bg-red-500/10 border-red-500/30 rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Two-Factor Authentication</h3>
            <p className="mb-4 text-sm text-gray-400">
              Add an extra layer of security to your admin account
            </p>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">
                {formData.require2FA ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.require2FA || false}
              onChange={(e) => onChange('require2FA', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Session Settings */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Session Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={formData.sessionTimeout || 30}
              onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value) || 30)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              min="5"
              max="240"
            />
            <p className="mt-2 text-sm text-gray-500">
              Users will be automatically logged out after {formData.sessionTimeout} minutes of inactivity.
            </p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={formData.loginAttempts || 5}
              onChange={(e) => onChange('loginAttempts', parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              min="1"
              max="10"
            />
            <p className="mt-2 text-sm text-gray-500">
              Account will be locked after {formData.loginAttempts} failed login attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Password Policy</h3>
        <select
          value={formData.passwordPolicy || 'medium'}
          onChange={(e) => onChange('passwordPolicy', e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
        >
          <option value="low">Basic: Minimum 6 characters</option>
          <option value="medium">Standard: 8+ characters with mixed case and numbers</option>
          <option value="high">Strong: 12+ characters with mixed case, numbers, and symbols</option>
        </select>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className={`p-3 rounded-lg border ${formData.passwordPolicy === 'low' ? 'border-red-500/50 bg-red-500/10' : 'border-gray-600'}`}>
            <div className="mb-1 text-sm font-medium text-white">Basic</div>
            <div className="text-xs text-gray-400">6+ characters</div>
          </div>
          <div className={`p-3 rounded-lg border ${formData.passwordPolicy === 'medium' ? 'border-red-500/50 bg-red-500/10' : 'border-gray-600'}`}>
            <div className="mb-1 text-sm font-medium text-white">Standard</div>
            <div className="text-xs text-gray-400">8+ chars, mixed case, numbers</div>
          </div>
          <div className={`p-3 rounded-lg border ${formData.passwordPolicy === 'high' ? 'border-red-500/50 bg-red-500/10' : 'border-gray-600'}`}>
            <div className="mb-1 text-sm font-medium text-white">Strong</div>
            <div className="text-xs text-gray-400">12+ chars, symbols required</div>
          </div>
        </div>
      </div>

      {/* API Rate Limiting */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h4 className="mb-2 font-semibold text-white">API Rate Limiting</h4>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Maximum API requests per minute per IP address
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={formData.apiRateLimit || 100}
              onChange={(e) => onChange('apiRateLimit', parseInt(e.target.value) || 100)}
              className="w-24 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-center"
              min="10"
              max="1000"
            />
            <span className="text-sm text-gray-400">requests/min</span>
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div>
        <h4 className="mb-2 font-semibold text-white">IP Whitelist</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIp()}
              className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
            <button
              type="button"
              onClick={addIp}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {(formData.ipWhitelist || []).map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="font-mono text-sm text-white">{ip}</span>
                <button
                  type="button"
                  onClick={() => removeIp(ip)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
            {(formData.ipWhitelist || []).length === 0 && (
              <p className="text-sm italic text-gray-500">No IP addresses whitelisted. All IPs are allowed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;