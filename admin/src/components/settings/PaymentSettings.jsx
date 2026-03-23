import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const PaymentSettings = ({ formData, onChange }) => {
  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', description: 'Mobile money payments', icon: '💰', recommended: true },
    { id: 'card', name: 'Credit/Debit Card', description: 'Visa, MasterCard, etc.', icon: '💳' },
    { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfers', icon: '🏦' },
    { id: 'cash_on_delivery', name: 'Cash on Delivery', description: 'Pay when delivered', icon: '💵' },
  ];

  const safeIncludes = (array, value) => {
    return Array.isArray(array) && array.includes(value);
  };

  const handleArrayChange = (field, value, checked) => {
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    onChange(field, newArray);
  };

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Payment Methods</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {paymentMethods.map((method) => {
            const isChecked = safeIncludes(formData.paymentMethods, method.id);
            
            return (
              <div key={method.id} className="relative">
                <input
                  type="checkbox"
                  id={`payment-${method.id}`}
                  checked={isChecked}
                  onChange={(e) => handleArrayChange('paymentMethods', method.id, e.target.checked)}
                  className="hidden"
                />
                <label
                  htmlFor={`payment-${method.id}`}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-white">{method.name}</h4>
                        {method.recommended && (
                          <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{method.description}</p>
                    </div>
                    <div className="ml-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isChecked
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-500'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* M-Pesa Settings */}
      {safeIncludes(formData.paymentMethods, 'mpesa') && (
        <div className="p-6 border bg-green-500/10 border-green-500/30 rounded-xl">
          <h4 className="mb-4 font-semibold text-green-400">M-Pesa Settings</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Business Short Code</label>
                <input
                  type="text"
                  value={formData.mpesaShortCode || ''}
                  onChange={(e) => onChange('mpesaShortCode', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="174379"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Passkey</label>
                <input
                  type="password"
                  value={formData.mpesaPasskey || ''}
                  onChange={(e) => onChange('mpesaPasskey', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Your M-Pesa passkey"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Consumer Key</label>
                <input
                  type="text"
                  value={formData.mpesaConsumerKey || ''}
                  onChange={(e) => onChange('mpesaConsumerKey', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Your M-Pesa consumer key"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Consumer Secret</label>
                <input
                  type="password"
                  value={formData.mpesaConsumerSecret || ''}
                  onChange={(e) => onChange('mpesaConsumerSecret', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Your M-Pesa consumer secret"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mpesaTestMode"
                checked={formData.mpesaTestMode || false}
                onChange={(e) => onChange('mpesaTestMode', e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <label htmlFor="mpesaTestMode" className="block ml-3 text-sm font-medium text-gray-300">
                Enable test mode (Sandbox)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Settings */}
      {safeIncludes(formData.paymentMethods, 'card') && (
        <div className="p-6 border bg-blue-500/10 border-blue-500/30 rounded-xl">
          <h4 className="mb-4 font-semibold text-blue-400">Stripe Settings</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Publishable Key</label>
                <input
                  type="text"
                  value={formData.stripePublicKey || ''}
                  onChange={(e) => onChange('stripePublicKey', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Secret Key</label>
                <input
                  type="password"
                  value={formData.stripeSecretKey || ''}
                  onChange={(e) => onChange('stripeSecretKey', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="sk_live_..."
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Webhook Secret</label>
              <input
                type="password"
                value={formData.stripeWebhookSecret || ''}
                onChange={(e) => onChange('stripeWebhookSecret', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="whsec_..."
              />
              <p className="mt-2 text-xs text-gray-500">Required for processing webhook events from Stripe</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;