import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import GeneralSettings from './GeneralSettings';
import PaymentSettings from './PaymentSettings';
import ShippingSettings from './ShippingSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import CustomerSettings from './CustomerSettings';
import ProductDisplaySettings from './ProductDisplaySettings';
import CheckoutSettings from './CheckoutSettings';
import EmailSettings from './EmailSettings';
import SmsSettings from './SmsSettings';
import LegalSettings from './LegalSettings';
import PaymentDisplaySettings from './PaymentDisplaySettings';
import SeoSettings from './SeoSettings';
import LoadingSpinner from '../common/LoadingSpinner';

const SettingsTabContent = ({ activeTab, formData, onSave, saving, loading }) => {
  const [localFormData, setLocalFormData] = useState(formData);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    setLocalFormData(formData);
    if (formData?.storeLogo) {
      const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) {
          return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${path}`;
        }
        return path;
      };
      setLogoPreview(getFullUrl(formData.storeLogo));
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setLocalFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (category, field, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleLogoChange = (file) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalLogoUrl = localFormData.storeLogo;
    
    if (logoFile) {
      try {
        const { settingsService } = await import('../../services/settings');
        const uploadResult = await settingsService.uploadFile(logoFile, 'logo');
        if (uploadResult.success && uploadResult.url) {
          finalLogoUrl = uploadResult.url;
          setLocalFormData(prev => ({ ...prev, storeLogo: finalLogoUrl }));
        }
      } catch (uploadError) {
        console.error('Error uploading logo:', uploadError);
      }
    }
    
    await onSave({ ...localFormData, storeLogo: finalLogoUrl });
  };

  if (loading && !localFormData) {
    return (
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" text="Loading settings..." />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings
            formData={localFormData}
            onChange={handleChange}
            onLogoChange={handleLogoChange}
            logoPreview={logoPreview}
          />
        );
      case 'payment':
        return <PaymentSettings formData={localFormData} onChange={handleChange} />;
      case 'shipping':
        return <ShippingSettings formData={localFormData} onChange={handleChange} />;
      case 'notifications':
        return <NotificationSettings formData={localFormData} onChange={handleChange} />;
      case 'security':
        return <SecuritySettings formData={localFormData} onChange={handleChange} />;
      case 'customer':
        return <CustomerSettings formData={localFormData?.customer || {}} onChange={(field, value) => handleNestedChange('customer', field, value)} />;
      case 'productDisplay':
        return <ProductDisplaySettings formData={localFormData?.productDisplay || {}} onChange={(field, value) => handleNestedChange('productDisplay', field, value)} />;
      case 'checkout':
        return <CheckoutSettings formData={localFormData?.checkout || {}} onChange={(field, value) => handleNestedChange('checkout', field, value)} />;
      case 'email':
        return <EmailSettings formData={localFormData?.emailTemplates || {}} onChange={(field, value) => handleNestedChange('emailTemplates', field, value)} />;
      case 'sms':
        return <SmsSettings formData={localFormData?.smsTemplates || {}} onChange={(field, value) => handleNestedChange('smsTemplates', field, value)} />;
      case 'legal':
        return <LegalSettings formData={localFormData?.legal || {}} onChange={(field, value) => handleNestedChange('legal', field, value)} />;
      case 'paymentDisplay':
        return <PaymentDisplaySettings formData={localFormData?.paymentDisplay || {}} onChange={(field, value) => handleNestedChange('paymentDisplay', field, value)} />;
      case 'seo':
        return <SeoSettings formData={localFormData?.seo || {}} onChange={(field, value) => handleNestedChange('seo', field, value)} />;
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    const titles = {
      general: 'General',
      payment: 'Payment',
      shipping: 'Shipping',
      notifications: 'Notifications',
      security: 'Security',
      customer: 'Customer Accounts',
      productDisplay: 'Product Display',
      checkout: 'Checkout',
      email: 'Email Templates',
      sms: 'SMS Notifications',
      legal: 'Legal & Compliance',
      paymentDisplay: 'Payment Display',
      seo: 'SEO & Marketing'
    };
    return titles[activeTab] || 'Settings';
  };

  const getTabColor = () => {
    const colors = {
      general: 'from-yellow-500 to-orange-500',
      payment: 'from-green-500 to-emerald-500',
      shipping: 'from-orange-500 to-red-500',
      notifications: 'from-purple-500 to-pink-500',
      security: 'from-red-500 to-rose-500',
      customer: 'from-blue-500 to-indigo-500',
      productDisplay: 'from-cyan-500 to-teal-500',
      checkout: 'from-emerald-500 to-green-500',
      email: 'from-indigo-500 to-purple-500',
      sms: 'from-pink-500 to-rose-500',
      legal: 'from-gray-500 to-slate-500',
      paymentDisplay: 'from-amber-500 to-yellow-500',
      seo: 'from-teal-500 to-cyan-500'
    };
    return colors[activeTab] || 'from-yellow-500 to-orange-500';
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 bg-gradient-to-r ${getTabColor()} bg-opacity-10`}>
              <div className={`h-5 w-5 text-${activeTab === 'general' ? 'yellow' : activeTab === 'payment' ? 'green' : activeTab === 'shipping' ? 'orange' : activeTab === 'notifications' ? 'purple' : activeTab === 'security' ? 'red' : activeTab === 'customer' ? 'blue' : activeTab === 'productDisplay' ? 'cyan' : activeTab === 'checkout' ? 'emerald' : activeTab === 'email' ? 'indigo' : activeTab === 'sms' ? 'pink' : activeTab === 'legal' ? 'gray' : activeTab === 'paymentDisplay' ? 'amber' : 'teal'}-500`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {getTabTitle()} Settings
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Configure {getTabTitle().toLowerCase()} preferences for your store
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderContent()}
          
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-700">
            <div className="text-sm text-gray-500">
              {saving ? 'Saving changes...' : 'Make sure to save your changes'}
            </div>
            <button
              type="submit"
              className={`px-6 py-2.5 bg-gradient-to-r ${getTabColor()} text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={saving || loading}
            >
              {saving ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SettingsTabContent;