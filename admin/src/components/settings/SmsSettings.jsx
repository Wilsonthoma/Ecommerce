import React from 'react';
import { DevicePhoneMobileIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const SmsSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* SMS Configuration */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-yellow-500" />
          SMS Configuration
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              SMS Provider
            </label>
            <select 
              value={formData?.smsProvider || 'africastalking'} 
              onChange={(e) => onChange('smsProvider', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            >
              <option value="africastalking">Africa's Talking</option>
              <option value="twilio">Twilio</option>
              <option value="messagebird">MessageBird</option>
              <option value="vonage">Vonage (Nexmo)</option>
              <option value="infobip">Infobip</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Sender ID
            </label>
            <input 
              type="text" 
              value={formData?.smsSenderId || 'KwetuShop'} 
              onChange={(e) => onChange('smsSenderId', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="KwetuShop"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 11 characters for alphanumeric sender ID</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              API Key
            </label>
            <input 
              type="password" 
              value={formData?.smsApiKey || ''} 
              onChange={(e) => onChange('smsApiKey', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="Enter API key"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              API Secret
            </label>
            <input 
              type="password" 
              value={formData?.smsApiSecret || ''} 
              onChange={(e) => onChange('smsApiSecret', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="Enter API secret"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable SMS Notifications</p>
              <p className="text-sm text-gray-400">Send SMS notifications to customers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.smsNotifications !== false} 
                onChange={(e) => onChange('smsNotifications', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* SMS Templates */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-yellow-500" />
          SMS Templates
        </h3>
        <p className="mb-4 text-sm text-gray-400">Use { } placeholders for dynamic content</p>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Order Confirmation SMS
            </label>
            <input 
              type="text" 
              value={formData?.orderConfirmationSms || 'Order #{orderNumber} confirmed. KSh{amount}. Thank you!'} 
              onChange={(e) => onChange('orderConfirmationSms', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="Order #{orderNumber} confirmed. KSh{amount}. Thank you!"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Shipping Update SMS
            </label>
            <input 
              type="text" 
              value={formData?.shippingUpdateSms || 'Order #{orderNumber} shipped. Track: {tracking}'} 
              onChange={(e) => onChange('shippingUpdateSms', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="Order #{orderNumber} shipped. Track: {tracking}"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Delivery Notification SMS
            </label>
            <input 
              type="text" 
              value={formData?.deliveryNotificationSms || 'Your order has been delivered! Enjoy your purchase.'} 
              onChange={(e) => onChange('deliveryNotificationSms', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Welcome SMS
            </label>
            <input 
              type="text" 
              value={formData?.welcomeSms || 'Welcome to KwetuShop! Enjoy shopping with us.'} 
              onChange={(e) => onChange('welcomeSms', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              OTP Verification SMS
            </label>
            <input 
              type="text" 
              value={formData?.otpSms || 'Your verification code is: {code}'} 
              onChange={(e) => onChange('otpSms', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>
        </div>
      </div>

      {/* Test SMS */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Test SMS
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <div className="flex gap-3">
              <input 
                type="tel" 
                id="testPhoneNumber"
                placeholder="254712345678" 
                className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              />
              <button
                type="button"
                onClick={() => {
                  const phone = document.getElementById('testPhoneNumber').value;
                  if (phone) {
                    console.log('Test SMS to:', phone);
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition"
              >
                Send Test SMS
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Enter phone number with country code (e.g., 254712345678)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsSettings;