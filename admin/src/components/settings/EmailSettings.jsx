import React from 'react';
import { EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const EmailSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Email Configuration */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <EnvelopeIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Email Configuration
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              From Email
            </label>
            <input 
              type="email" 
              value={formData?.fromEmail || 'noreply@kwetushop.co.ke'} 
              onChange={(e) => onChange('fromEmail', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              From Name
            </label>
            <input 
              type="text" 
              value={formData?.fromName || 'KwetuShop'} 
              onChange={(e) => onChange('fromName', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Reply To Email
          </label>
          <input 
            type="email" 
            value={formData?.replyToEmail || 'support@kwetushop.co.ke'} 
            onChange={(e) => onChange('replyToEmail', e.target.value)} 
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
          />
        </div>
      </div>

      {/* Email Templates */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Email Templates
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Welcome Email Subject
            </label>
            <input 
              type="text" 
              value={formData?.welcomeEmailSubject || 'Welcome to KwetuShop!'} 
              onChange={(e) => onChange('welcomeEmailSubject', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Welcome Email Body
            </label>
            <textarea 
              rows={4} 
              value={formData?.welcomeEmailBody || 'Thank you for joining KwetuShop! We\'re excited to have you on board.'} 
              onChange={(e) => onChange('welcomeEmailBody', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Order Confirmation Subject
            </label>
            <input 
              type="text" 
              value={formData?.orderConfirmationSubject || 'Order #{orderNumber} Confirmed'} 
              onChange={(e) => onChange('orderConfirmationSubject', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Order Confirmation Body
            </label>
            <textarea 
              rows={4} 
              value={formData?.orderConfirmationBody || 'Your order has been received and is being processed.'} 
              onChange={(e) => onChange('orderConfirmationBody', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Shipping Update Subject
            </label>
            <input 
              type="text" 
              value={formData?.shippingUpdateSubject || 'Your order #{orderNumber} has shipped'} 
              onChange={(e) => onChange('shippingUpdateSubject', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Shipping Update Body
            </label>
            <textarea 
              rows={4} 
              value={formData?.shippingUpdateBody || 'Your order is on its way! Track your package here.'} 
              onChange={(e) => onChange('shippingUpdateBody', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Password Reset Subject
            </label>
            <input 
              type="text" 
              value={formData?.resetPasswordSubject || 'Password Reset Request'} 
              onChange={(e) => onChange('resetPasswordSubject', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Password Reset Body
            </label>
            <textarea 
              rows={4} 
              value={formData?.resetPasswordBody || 'Click the link below to reset your password.'} 
              onChange={(e) => onChange('resetPasswordBody', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Email Footer Text
            </label>
            <input 
              type="text" 
              value={formData?.emailFooterText || 'Thank you for shopping with KwetuShop'} 
              onChange={(e) => onChange('emailFooterText', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium text-white">Show Social Links in Footer</p>
              <p className="text-sm text-gray-400">Display social media icons in email footer</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.emailFooterSocial !== false} 
                onChange={(e) => onChange('emailFooterSocial', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Include Unsubscribe Link</p>
              <p className="text-sm text-gray-400">Add unsubscribe link to promotional emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.emailUnsubscribeLink !== false} 
                onChange={(e) => onChange('emailUnsubscribeLink', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;