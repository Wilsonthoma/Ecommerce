import React from 'react';
import { ScaleIcon, DocumentTextIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const LegalSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Legal Pages */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Legal Pages
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Terms of Service URL
            </label>
            <input 
              type="text" 
              value={formData?.termsOfServiceUrl || '/terms'} 
              onChange={(e) => onChange('termsOfServiceUrl', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="/terms" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Privacy Policy URL
            </label>
            <input 
              type="text" 
              value={formData?.privacyPolicyUrl || '/privacy'} 
              onChange={(e) => onChange('privacyPolicyUrl', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="/privacy" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Refund Policy URL
            </label>
            <input 
              type="text" 
              value={formData?.refundPolicyUrl || '/refund-policy'} 
              onChange={(e) => onChange('refundPolicyUrl', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              placeholder="/refund-policy" 
            />
          </div>
        </div>
      </div>

      {/* Cookie Consent */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Cookie Consent
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Cookie Consent Banner</p>
              <p className="text-sm text-gray-400">Show cookie consent banner to comply with GDPR</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableCookieConsent !== false} 
                onChange={(e) => onChange('enableCookieConsent', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Cookie Consent Message
            </label>
            <textarea 
              rows={2} 
              value={formData?.cookieConsentMessage || 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.'} 
              onChange={(e) => onChange('cookieConsentMessage', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>
        </div>
      </div>

      {/* GDPR Compliance */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ScaleIcon className="w-5 h-5 mr-2 text-yellow-500" />
          GDPR Compliance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable GDPR Compliance</p>
              <p className="text-sm text-gray-400">Implement GDPR compliance features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableGdpr || false} 
                onChange={(e) => onChange('enableGdpr', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Data Retention (Days)
            </label>
            <input 
              type="number" 
              value={formData?.dataRetentionDays || 365} 
              onChange={(e) => onChange('dataRetentionDays', parseInt(e.target.value))} 
              min="30" 
              max="730" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Allow Data Export</p>
              <p className="text-sm text-gray-400">Allow customers to export their personal data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.allowDataExport !== false} 
                onChange={(e) => onChange('allowDataExport', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Allow Account Deletion</p>
              <p className="text-sm text-gray-400">Allow customers to permanently delete their accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.allowAccountDeletion !== false} 
                onChange={(e) => onChange('allowAccountDeletion', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Age Restriction */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <GlobeAltIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Age Restriction
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Age Restriction</p>
              <p className="text-sm text-gray-400">Restrict access to age-sensitive products</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.ageRestricted || false} 
                onChange={(e) => onChange('ageRestricted', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          {formData?.ageRestricted && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Minimum Age Required
              </label>
              <input 
                type="number" 
                value={formData?.minimumAge || 18} 
                onChange={(e) => onChange('minimumAge', parseInt(e.target.value))} 
                min="13" 
                max="21" 
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalSettings;