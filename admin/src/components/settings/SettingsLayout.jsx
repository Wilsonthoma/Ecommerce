import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { settingsService } from '../../services/settings';
import LoadingSpinner from '../common/LoadingSpinner';
import SettingsHeader from './SettingsHeader';
import SettingsTabs from './SettingsTabs';
import SettingsTabContent from './SettingsTabContent';

const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const initialLoadRef = useRef(true);

  const tabs = [
    { id: 'general', name: 'General', icon: 'BuildingStorefrontIcon' },
    { id: 'payment', name: 'Payment', icon: 'CreditCardIcon' },
    { id: 'shipping', name: 'Shipping', icon: 'TruckIcon' },
    { id: 'notifications', name: 'Notifications', icon: 'BellIcon' },
    { id: 'security', name: 'Security', icon: 'ShieldCheckIcon' },
    { id: 'customer', name: 'Customer Accounts', icon: 'UsersIcon' },
    { id: 'productDisplay', name: 'Product Display', icon: 'PhotoIcon' },
    { id: 'checkout', name: 'Checkout', icon: 'ShoppingCartIcon' },
    { id: 'email', name: 'Email Templates', icon: 'EnvelopeIcon' },
    { id: 'sms', name: 'SMS Notifications', icon: 'DevicePhoneMobileIcon' },
    { id: 'legal', name: 'Legal & Compliance', icon: 'ScaleIcon' },
    { id: 'paymentDisplay', name: 'Payment Display', icon: 'CurrencyDollarIcon' },
    { id: 'seo', name: 'SEO & Marketing', icon: 'MagnifyingGlassIcon' }
  ];

  const fetchSettings = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      
      if (response && response.success) {
        const settingsData = response.data || {};
        setFormData(settingsData);
        
        if (showToast && !initialLoadRef.current) {
          toast.success(response.message || 'Settings loaded');
        }
      } else {
        // Default settings with all categories
        const defaultSettings = {
          storeName: 'KwetuShop',
          storeEmail: 'admin@kwetushop.co.ke',
          storePhone: '+254712345678',
          storeAddress: '123 Kimathi Street, Nairobi, Kenya',
          currency: 'KES',
          timezone: 'Africa/Nairobi',
          storeLogo: '',
          favicon: '',
          storeDescription: 'Your trusted electronics store in Kenya',
          storeKeywords: 'electronics, smartphones, laptops, tablets, Kenya',
          enableWhatsApp: true,
          whatsappNumber: '+254712345678',
          socialLinks: {
            facebook: 'https://facebook.com/kwetushop',
            twitter: 'https://twitter.com/kwetushop',
            instagram: 'https://instagram.com/kwetushop',
            youtube: '',
            linkedin: '',
            whatsapp: 'https://wa.me/254712345678'
          },
          customer: {
            allowRegistration: true,
            requireEmailVerification: true,
            requirePhoneVerification: false,
            enableSocialLogin: false,
            socialLoginProviders: ['google', 'facebook'],
            enableWishlist: true,
            enableReviews: true,
            enableOrderTracking: true,
            enableReturns: true,
            returnsWindowDays: 14,
            enableSavedAddresses: true
          },
          productDisplay: {
            showProductRating: true,
            showProductBadges: true,
            showDiscountBadge: true,
            showStockStatus: true,
            enableZoomOnHover: true,
            enableGalleryLightbox: true,
            showRelatedProducts: true,
            recentlyViewedCount: 4,
            showSKU: false,
            showVendor: true,
            enableProductVideos: false
          },
          checkout: {
            allowGuestCheckout: true,
            requirePhone: true,
            requireCompany: false,
            enableNotes: true,
            cartExpiryDays: 30
          },
          emailTemplates: {
            fromEmail: 'noreply@kwetushop.co.ke',
            fromName: 'KwetuShop',
            replyToEmail: 'support@kwetushop.co.ke',
            welcomeEmailSubject: 'Welcome to KwetuShop!',
            welcomeEmailBody: 'Thank you for joining KwetuShop!',
            orderConfirmationSubject: 'Order #{orderNumber} Confirmed',
            orderConfirmationBody: 'Your order has been received and is being processed.',
            shippingUpdateSubject: 'Your order #{orderNumber} has shipped',
            shippingUpdateBody: 'Your order is on its way!',
            resetPasswordSubject: 'Password Reset Request',
            resetPasswordBody: 'Click the link below to reset your password.',
            emailFooterText: 'Thank you for shopping with KwetuShop',
            emailFooterSocial: true,
            emailUnsubscribeLink: true
          },
          smsTemplates: {
            smsProvider: 'africastalking',
            smsApiKey: '',
            smsApiSecret: '',
            smsSenderId: 'KwetuShop',
            orderConfirmationSms: 'Order #{orderNumber} confirmed. KSh{amount}. Thank you!',
            shippingUpdateSms: 'Order #{orderNumber} shipped. Track: {tracking}',
            deliveryNotificationSms: 'Your order has been delivered!',
            welcomeSms: 'Welcome to KwetuShop!',
            otpSms: 'Your verification code is: {code}',
            smsNotifications: true
          },
          legal: {
            termsOfServiceUrl: '/terms',
            privacyPolicyUrl: '/privacy',
            refundPolicyUrl: '/refund-policy',
            shippingPolicyUrl: '/shipping-policy',
            enableCookieConsent: true,
            cookieConsentMessage: 'We use cookies to enhance your experience.',
            enableGdpr: true,
            dataRetentionDays: 365,
            allowDataExport: true,
            allowAccountDeletion: true,
            ageRestricted: false,
            minimumAge: 18
          },
          paymentDisplay: {
            showPaymentIcons: true,
            paymentIcons: ['visa', 'mastercard', 'mpesa', 'airtel'],
            acceptedCards: ['visa', 'mastercard', 'amex'],
            securePaymentMessage: 'Your payment information is secure',
            installmentMessage: 'Pay in installments from KSh 500/month'
          },
          seo: {
            metaTitle: 'KwetuShop - Best Electronics Store in Kenya',
            metaDescription: 'Shop the latest smartphones, laptops, and electronics at KwetuShop.',
            metaKeywords: 'electronics, smartphones, laptops, tablets, Kenya',
            robotsTxt: 'User-agent: *\nAllow: /',
            sitemapEnabled: true,
            googleAnalyticsId: '',
            facebookPixelId: '',
            enableEnhancedEcommerce: true,
            ogImage: '',
            twitterCard: 'summary_large_image',
            enableSocialShare: true,
            enableAnalytics: true,
            trackPurchases: true
          },
          shippingMethods: ['standard', 'express', 'pickup'],
          standardShippingPrice: 200,
          expressShippingPrice: 500,
          freeShippingThreshold: 2000,
          shippingZones: [
            { name: 'Nairobi', price: 150 },
            { name: 'Mombasa', price: 300 },
            { name: 'Kisumu', price: 250 }
          ],
          paymentMethods: ['mpesa', 'card', 'cash_on_delivery'],
          stripePublicKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: '',
          mpesaShortCode: '174379',
          mpesaPasskey: '',
          mpesaConsumerKey: '',
          mpesaConsumerSecret: '',
          mpesaTestMode: false,
          emailNotifications: true,
          orderConfirmation: true,
          shippingUpdates: true,
          promotionalEmails: false,
          adminNotifications: true,
          require2FA: false,
          sessionTimeout: 30,
          passwordPolicy: 'medium',
          apiRateLimit: 100,
          loginAttempts: 5,
          ipWhitelist: [],
          maintenanceMode: false,
          maintenanceMessage: 'We are currently undergoing maintenance.',
          taxRate: 16,
          taxName: 'VAT',
          taxInclusive: true,
          taxableProducts: true,
          taxShipping: false
        };
        setFormData(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (showToast) toast.error(`Failed to load settings: ${error.message}`);
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  const handleSave = async (updatedData) => {
    setSaving(true);
    try {
      const result = await settingsService.updateSettings(updatedData);
      if (result && result.success) {
        toast.success(result.message || 'Settings updated');
        await fetchSettings(false);
      } else {
        toast.error(result?.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => fetchSettings(true);
  
  const handleReset = async () => {
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

  useEffect(() => {
    fetchSettings(false);
  }, [fetchSettings]);

  if (loading && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsHeader 
        onRefresh={handleRefresh}
        onReset={handleReset}
        saving={saving}
        loading={loading}
      />
      
      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1">
          <SettingsTabContent
            activeTab={activeTab}
            formData={formData}
            onSave={handleSave}
            saving={saving}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;