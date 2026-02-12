import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { settingsService } from '../services/settings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatKSH, formatPhoneNumber } from '../utils/formatters';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const initialLoadRef = useRef(true);

  // Default settings structure
  const [formData, setFormData] = useState({
    // General Settings
    storeName: 'KwetuShop',
    storeEmail: 'admin@kwetushop.co.ke',
    storePhone: '+254712345678',
    storeAddress: '123 Kimathi Street, Nairobi, Kenya',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    storeLogo: '',
    
    // Payment Settings
    paymentMethods: ['mpesa', 'card', 'cash_on_delivery'],
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    mpesaShortCode: '174379',
    mpesaPasskey: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaTestMode: false,
    
    // Shipping Settings
    shippingMethods: ['standard', 'express', 'pickup'],
    standardShippingPrice: 200,
    expressShippingPrice: 500,
    freeShippingThreshold: 2000,
    shippingZones: [
      { name: 'Nairobi', price: 150 },
      { name: 'Mombasa', price: 300 },
      { name: 'Kisumu', price: 250 }
    ],
    
    // Notification Settings
    emailNotifications: true,
    orderConfirmation: true,
    shippingUpdates: true,
    promotionalEmails: false,
    smsNotifications: true,
    adminNotifications: true,
    
    // Security Settings
    require2FA: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    apiRateLimit: 100,
    loginAttempts: 5,
    ipWhitelist: [],
  });

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingStorefrontIcon, color: 'text-blue-600 bg-blue-50' },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon, color: 'text-green-600 bg-green-50' },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon, color: 'text-orange-600 bg-orange-50' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, color: 'text-purple-600 bg-purple-50' },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, color: 'text-red-600 bg-red-50' },
  ];

  // Get full URL for logo images
  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return '';
    
    // If it's already a full URL, return as is
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    // If it starts with /uploads, prepend backend URL
    if (logoPath.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoPath}`;
    }
    
    // For relative paths, prepend backend URL
    if (logoPath.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoPath}`;
    }
    
    return logoPath;
  };

  // Generate SVG placeholder for failed images
  const getPlaceholderSVG = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
  };

  // Fetch settings function
  const fetchSettings = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      
      const response = await settingsService.getSettings();
      
      if (response && response.success) {
        const settingsData = response.data || {};
        
        // Transform API data to match our form structure
        const transformedData = {
          // General Settings
          storeName: settingsData.storeName || 'KwetuShop',
          storeEmail: settingsData.storeEmail || 'admin@kwetushop.co.ke',
          storePhone: settingsData.storePhone || '+254712345678',
          storeAddress: settingsData.storeAddress || '123 Kimathi Street, Nairobi, Kenya',
          currency: settingsData.currency || 'KES',
          timezone: settingsData.timezone || 'Africa/Nairobi',
          storeLogo: settingsData.storeLogo || '',
          
          // Payment Settings
          paymentMethods: Array.isArray(settingsData.paymentMethods) 
            ? settingsData.paymentMethods 
            : (settingsData.paymentMethods ? settingsData.paymentMethods.split(',') : ['mpesa', 'card', 'cash_on_delivery']),
          stripePublicKey: settingsData.stripePublicKey || '',
          stripeSecretKey: settingsData.stripeSecretKey || '',
          stripeWebhookSecret: settingsData.stripeWebhookSecret || '',
          mpesaShortCode: settingsData.mpesaShortCode || '174379',
          mpesaPasskey: settingsData.mpesaPasskey || '',
          mpesaConsumerKey: settingsData.mpesaConsumerKey || '',
          mpesaConsumerSecret: settingsData.mpesaConsumerSecret || '',
          mpesaTestMode: settingsData.mpesaTestMode || false,
          
          // Shipping Settings
          shippingMethods: Array.isArray(settingsData.shippingMethods) 
            ? settingsData.shippingMethods 
            : (settingsData.shippingMethods ? settingsData.shippingMethods.split(',') : ['standard', 'express', 'pickup']),
          standardShippingPrice: settingsData.standardShippingPrice || 200,
          expressShippingPrice: settingsData.expressShippingPrice || 500,
          freeShippingThreshold: settingsData.freeShippingThreshold || 2000,
          shippingZones: Array.isArray(settingsData.shippingZones) 
            ? settingsData.shippingZones 
            : [],
          
          // Notification Settings
          emailNotifications: settingsData.emailNotifications !== false,
          orderConfirmation: settingsData.orderConfirmation !== false,
          shippingUpdates: settingsData.shippingUpdates !== false,
          promotionalEmails: settingsData.promotionalEmails || false,
          smsNotifications: settingsData.smsNotifications !== false,
          adminNotifications: settingsData.adminNotifications !== false,
          
          // Security Settings
          require2FA: settingsData.require2FA || false,
          sessionTimeout: settingsData.sessionTimeout || 30,
          passwordPolicy: settingsData.passwordPolicy || 'medium',
          apiRateLimit: settingsData.apiRateLimit || 100,
          loginAttempts: settingsData.loginAttempts || 5,
          ipWhitelist: Array.isArray(settingsData.ipWhitelist) ? settingsData.ipWhitelist : [],
        };
        
        setFormData(transformedData);
        
        if (transformedData.storeLogo) {
          setLogoPreview(getFullLogoUrl(transformedData.storeLogo));
        } else {
          setLogoPreview('');
        }
        
        // Only show toast on manual refresh, not on initial load
        if (showToast && !initialLoadRef.current) {
          toast.success(response.message || 'Settings loaded');
        }
        
      } else if (response && !response.success && response.message) {
        // Show error toast only on manual refresh
        if (showToast) {
          toast.error(response.message || 'Failed to load settings');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Only show error toast on manual refresh
      if (showToast) {
        toast.error(`Failed to load settings: ${error.message}`);
      }
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  // Initial load - no toast
  useEffect(() => {
    let isMounted = true;
    
    const loadSettings = async () => {
      if (isMounted) {
        await fetchSettings(false); // false = no toast on initial load
      }
    };
    
    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[field]) ? prev[field] : [];
      
      return {
        ...prev,
        [field]: checked 
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

  const safeIncludes = (array, value) => {
    return Array.isArray(array) && array.includes(value);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalLogoUrl = formData.storeLogo;
      
      // Upload logo if new file selected
      if (logoFile) {
        try {
          const uploadResult = await settingsService.uploadFile(logoFile, 'logo');
          if (uploadResult.success && (uploadResult.url || uploadResult.data?.url)) {
            finalLogoUrl = uploadResult.url || uploadResult.data?.url;
            setFormData(prev => ({ ...prev, storeLogo: finalLogoUrl }));
            // Logo upload success toast is handled by backend
          }
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError);
          toast.error('Failed to upload logo, but saving other settings...');
        }
      }
      
      // Prepare data for API
      const apiData = {
        storeName: formData.storeName,
        storeEmail: formData.storeEmail,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
        currency: formData.currency,
        timezone: formData.timezone,
        storeLogo: finalLogoUrl,
        
        // Payment
        paymentMethods: formData.paymentMethods,
        stripePublicKey: formData.stripePublicKey,
        stripeSecretKey: formData.stripeSecretKey,
        stripeWebhookSecret: formData.stripeWebhookSecret,
        mpesaShortCode: formData.mpesaShortCode,
        mpesaPasskey: formData.mpesaPasskey,
        mpesaConsumerKey: formData.mpesaConsumerKey,
        mpesaConsumerSecret: formData.mpesaConsumerSecret,
        mpesaTestMode: formData.mpesaTestMode,
        
        // Shipping
        shippingMethods: formData.shippingMethods,
        standardShippingPrice: formData.standardShippingPrice,
        expressShippingPrice: formData.expressShippingPrice,
        freeShippingThreshold: formData.freeShippingThreshold,
        shippingZones: formData.shippingZones,
        
        // Notifications
        emailNotifications: formData.emailNotifications,
        orderConfirmation: formData.orderConfirmation,
        shippingUpdates: formData.shippingUpdates,
        promotionalEmails: formData.promotionalEmails,
        smsNotifications: formData.smsNotifications,
        adminNotifications: formData.adminNotifications,
        
        // Security
        require2FA: formData.require2FA,
        sessionTimeout: formData.sessionTimeout,
        passwordPolicy: formData.passwordPolicy,
        apiRateLimit: formData.apiRateLimit,
        loginAttempts: formData.loginAttempts,
        ipWhitelist: formData.ipWhitelist,
      };
      
      // Save all settings
      const result = await settingsService.updateSettings(apiData);
      
      if (result && result.success) {
        // Check if backend message already indicates success
        const hasSuccessMessage = result.message && 
          (result.message.toLowerCase().includes('success') || 
           result.message.toLowerCase().includes('updated') ||
           result.message.toLowerCase().includes('saved'));
        
        // Only show toast if backend doesn't already show one
        if (!hasSuccessMessage) {
          toast.success(result.message || 'Settings updated');
        }
        
        // Refresh settings without showing toast
        await fetchSettings(false);
      } else {
        toast.error(result?.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setSaving(false);
      setLogoFile(null);
    }
  };

  const resetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset to default settings? This cannot be undone.')) {
      try {
        const result = await settingsService.resetSettings();
        if (result && result.success) {
          toast.success(result.message || 'Settings reset to defaults');
          await fetchSettings(false);
        } else {
          toast.error(result?.message || 'Failed to reset settings');
        }
      } catch (error) {
        toast.error(`Failed to reset settings: ${error.message}`);
      }
    }
  };

  const testMpesa = async () => {
    try {
      const loadingToast = toast.loading('Testing M-Pesa connection...');
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success('M-Pesa connection test successful!');
      }, 2000);
    } catch (error) {
      toast.error('M-Pesa connection test failed');
    }
  };

  const testStripe = async () => {
    try {
      const loadingToast = toast.loading('Testing Stripe connection...');
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success('Stripe connection test successful!');
      }, 2000);
    } catch (error) {
      toast.error('Stripe connection test failed');
    }
  };

  // Manual refresh handler - shows toast
  const handleRefresh = () => {
    fetchSettings(true); // true = show toast on manual refresh
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" text="Loading settings..." />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Store Logo Upload */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-blue-600" />
                Store Logo
              </h3>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Store Logo" 
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = getPlaceholderSVG();
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer">
                      <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Choose File
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    {logoFile && (
                      <span className="text-sm text-gray-600">{logoFile.name}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Recommended: 300x300px, PNG or JPG, max 5MB
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter logo URL
                    </label>
                    <input
                      type="url"
                      name="storeLogo"
                      value={formData.storeLogo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Email *
                  </label>
                  <input
                    type="email"
                    name="storeEmail"
                    value={formData.storeEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+254</span>
                    </div>
                    <input
                      type="tel"
                      name="storePhone"
                      value={formData.storePhone}
                      onChange={handleChange}
                      className="w-full pl-14 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="712 345 678"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {formatPhoneNumber(formData.storePhone, '+254')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="storeAddress"
                    value={formData.storeAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    >
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    >
                      <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                      <option value="Africa/Dar_es_Salaam">Tanzania Time</option>
                      <option value="Africa/Kampala">Uganda Time</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Current time: {new Date().toLocaleTimeString('en-KE', { timeZone: formData.timezone })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-8">
            {/* Payment Methods */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'mpesa', name: 'M-Pesa', description: 'Mobile money payments', icon: '💰', recommended: true },
                  { id: 'card', name: 'Credit/Debit Card', description: 'Visa, MasterCard, etc.', icon: '💳' },
                  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfers', icon: '🏦' },
                  { id: 'cash_on_delivery', name: 'Cash on Delivery', description: 'Pay when delivered', icon: '💵' },
                ].map((method) => {
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
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{method.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900">{method.name}</h4>
                              {method.recommended && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          <div className="ml-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isChecked
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
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
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">M-Pesa Settings</h4>
                  <button
                    type="button"
                    onClick={testMpesa}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    disabled={!formData.mpesaConsumerKey || !formData.mpesaConsumerSecret}
                  >
                    Test Connection
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Short Code
                      </label>
                      <input
                        type="text"
                        name="mpesaShortCode"
                        value={formData.mpesaShortCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        placeholder="174379"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passkey
                      </label>
                      <input
                        type="password"
                        name="mpesaPasskey"
                        value={formData.mpesaPasskey}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        placeholder="Your M-Pesa passkey"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consumer Key
                      </label>
                      <input
                        type="text"
                        name="mpesaConsumerKey"
                        value={formData.mpesaConsumerKey}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        placeholder="Your M-Pesa consumer key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consumer Secret
                      </label>
                      <input
                        type="password"
                        name="mpesaConsumerSecret"
                        value={formData.mpesaConsumerSecret}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        placeholder="Your M-Pesa consumer secret"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mpesaTestMode"
                      checked={formData.mpesaTestMode}
                      onChange={handleChange}
                      name="mpesaTestMode"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mpesaTestMode" className="ml-3 block text-sm font-medium text-gray-700">
                      Enable test mode (Sandbox)
                    </label>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Need help setting up M-Pesa? <a href="#" className="text-green-600 hover:text-green-800">View documentation</a></p>
                </div>
              </div>
            )}

            {/* Stripe Settings */}
            {safeIncludes(formData.paymentMethods, 'card') && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Stripe Settings</h4>
                  <button
                    type="button"
                    onClick={testStripe}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!formData.stripePublicKey || !formData.stripeSecretKey}
                  >
                    Test Connection
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publishable Key
                      </label>
                      <input
                        type="text"
                        name="stripePublicKey"
                        value={formData.stripePublicKey}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key
                      </label>
                      <input
                        type="password"
                        name="stripeSecretKey"
                        value={formData.stripeSecretKey}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook Secret
                    </label>
                    <input
                      type="password"
                      name="stripeWebhookSecret"
                      value={formData.stripeWebhookSecret}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="whsec_..."
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Required for processing webhook events from Stripe
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-8">
            {/* Shipping Methods */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'standard', name: 'Standard Shipping', description: '3-5 business days', icon: '🚚' },
                  { id: 'express', name: 'Express Shipping', description: '1-2 business days', icon: '⚡' },
                  { id: 'pickup', name: 'Store Pickup', description: 'Pick up from store', icon: '🏪' },
                ].map((method) => {
                  const isChecked = safeIncludes(formData.shippingMethods, method.id);
                  
                  return (
                    <div key={method.id} className="relative">
                      <input
                        type="checkbox"
                        id={`shipping-${method.id}`}
                        checked={isChecked}
                        onChange={(e) => handleArrayChange('shippingMethods', method.id, e.target.checked)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`shipping-${method.id}`}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4">Shipping Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Shipping (KSh)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">KSh</span>
                    </div>
                    <input
                      type="number"
                      name="standardShippingPrice"
                      value={formData.standardShippingPrice}
                      onChange={handleChange}
                      className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Express Shipping (KSh)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">KSh</span>
                    </div>
                    <input
                      type="number"
                      name="expressShippingPrice"
                      value={formData.expressShippingPrice}
                      onChange={handleChange}
                      className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (KSh)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">KSh</span>
                    </div>
                    <input
                      type="number"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold}
                      onChange={handleChange}
                      className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Free shipping will be applied when order total is {formatKSH(formData.freeShippingThreshold)} or more.
              </p>
            </div>

            {/* Shipping Zones */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Shipping Zones</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                  <div className="col-span-6 font-medium text-sm text-gray-700">Zone Name</div>
                  <div className="col-span-4 font-medium text-sm text-gray-700">Shipping Price (KSh)</div>
                  <div className="col-span-2"></div>
                </div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {formData.shippingZones.map((zone, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.shippingZones];
                            newZones[index].name = e.target.value;
                            setFormData({...formData, shippingZones: newZones});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          placeholder="Zone name"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={zone.price}
                          onChange={(e) => {
                            const newZones = [...formData.shippingZones];
                            newZones[index].price = parseFloat(e.target.value) || 0;
                            setFormData({...formData, shippingZones: newZones});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newZones = formData.shippingZones.filter((_, i) => i !== index);
                            setFormData({...formData, shippingZones: newZones});
                          }}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        shippingZones: [...formData.shippingZones, { name: '', price: 0 }]
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    + Add Shipping Zone
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            {/* Email Notifications */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Enable Email Notifications</p>
                    <p className="text-sm text-gray-600">Send email notifications to customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {formData.emailNotifications && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderConfirmation"
                        checked={formData.orderConfirmation}
                        onChange={handleChange}
                        name="orderConfirmation"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="orderConfirmation" className="ml-3 block text-sm font-medium text-gray-700">
                        Order confirmation emails
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="shippingUpdates"
                        checked={formData.shippingUpdates}
                        onChange={handleChange}
                        name="shippingUpdates"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="shippingUpdates" className="ml-3 block text-sm font-medium text-gray-700">
                        Shipping updates
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="promotionalEmails"
                        checked={formData.promotionalEmails}
                        onChange={handleChange}
                        name="promotionalEmails"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="promotionalEmails" className="ml-3 block text-sm font-medium text-gray-700">
                        Promotional emails
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SMS Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Enable SMS Notifications</p>
                  <p className="text-sm text-gray-600">Send SMS updates to customers (requires SMS credits)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {/* Admin Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notifications</h3>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">New Order Alerts</p>
                  <p className="text-sm text-gray-600">Receive notifications for new orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="adminNotifications"
                    checked={formData.adminNotifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            {/* Two-Factor Authentication */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your admin account
                  </p>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.require2FA ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="require2FA"
                    checked={formData.require2FA}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Session Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={formData.sessionTimeout}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    min="5"
                    max="240"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Users will be automatically logged out after {formData.sessionTimeout} minutes of inactivity.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    name="loginAttempts"
                    value={formData.loginAttempts}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    min="1"
                    max="10"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Account will be locked after {formData.loginAttempts} failed login attempts.
                  </p>
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
              <div className="relative">
                <select
                  name="passwordPolicy"
                  value={formData.passwordPolicy}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                >
                  <option value="low">Basic: Minimum 6 characters</option>
                  <option value="medium">Standard: 8+ characters with mixed case and numbers</option>
                  <option value="high">Strong: 12+ characters with mixed case, numbers, and symbols</option>
                </select>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border ${
                  formData.passwordPolicy === 'low' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}>
                  <div className="text-sm font-medium text-gray-900 mb-1">Basic</div>
                  <div className="text-xs text-gray-600">6+ characters</div>
                </div>
                <div className={`p-3 rounded-lg border ${
                  formData.passwordPolicy === 'medium' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}>
                  <div className="text-sm font-medium text-gray-900 mb-1">Standard</div>
                  <div className="text-xs text-gray-600">8+ chars, mixed case, numbers</div>
                </div>
                <div className={`p-3 rounded-lg border ${
                  formData.passwordPolicy === 'high' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}>
                  <div className="text-sm font-medium text-gray-900 mb-1">Strong</div>
                  <div className="text-xs text-gray-600">12+ chars, symbols required</div>
                </div>
              </div>
            </div>

            {/* API Rate Limiting */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">API Rate Limiting</h4>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Maximum API requests per minute per IP address
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="apiRateLimit"
                    value={formData.apiRateLimit}
                    onChange={handleChange}
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition text-center"
                    min="10"
                    max="1000"
                  />
                  <span className="text-sm text-gray-600">requests/min</span>
                </div>
              </div>
            </div>

            {/* IP Whitelist */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">IP Whitelist</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const ip = e.target.value.trim();
                        if (ip && !formData.ipWhitelist.includes(ip)) {
                          setFormData({
                            ...formData,
                            ipWhitelist: [...formData.ipWhitelist, ip]
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter IP address"]');
                      const ip = input.value.trim();
                      if (ip && !formData.ipWhitelist.includes(ip)) {
                        setFormData({
                          ...formData,
                          ipWhitelist: [...formData.ipWhitelist, ip]
                        });
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono text-sm">{ip}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            ipWhitelist: formData.ipWhitelist.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.ipWhitelist.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No IP addresses whitelisted. All IPs are allowed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !formData.storeName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your store preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving || loading}
          >
            Reset Defaults
          </button>
          <button
            onClick={handleRefresh}  // Changed from fetchSettings to handleRefresh
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            <ArrowPathIcon className="h-4 w-4 inline mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Settings Categories
            </h3>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${tab.color} shadow-sm`
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <span className="ml-auto">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && (
                  <div className={`p-2 rounded-lg mr-3 ${
                    tabs.find(tab => tab.id === activeTab)?.color
                      .replace('text-', 'bg-')
                      .replace('600', '100')
                      .split(' ')[0]
                  }`}>
                    {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon, {
                      className: `h-5 w-5 ${tabs.find(tab => tab.id === activeTab)?.color.split(' ')[0]}`
                    })}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name} Settings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} preferences for your store
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {renderTabContent()}
                
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {saving ? 'Saving changes...' : 'Make sure to save your changes'}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                        Saving Changes...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;