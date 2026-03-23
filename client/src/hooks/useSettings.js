// client/src/hooks/useSettings.js
import { useSettings } from '../context/SettingsContext';

export const useSettingsHook = () => {
  const context = useSettings();
  
  return {
    // Core
    settings: context.settings,
    userSettings: context.userSettings,
    loading: context.loading,
    error: context.error,
    refresh: context.refresh,
    
    // Getters
    get: context.get,
    getUser: context.getUser,
    getTheme: context.getTheme,
    getCurrency: context.getCurrency,
    getItemsPerPage: context.getItemsPerPage,
    
    // Actions
    updateUserSettings: context.updateUserSettings,
    
    // UI helpers
    primaryColor: context.get('primaryColor', '#F59E0B'),
    secondaryColor: context.get('secondaryColor', '#EA580C'),
    theme: context.getTheme(),
    currency: context.getCurrency(),
    itemsPerPage: context.getItemsPerPage(),
    showAnnouncementBar: context.get('showAnnouncementBar', false),
    announcementText: context.get('announcementText', ''),
    storeName: context.get('storeName', 'KwetuShop'),
    storeLogo: context.get('storeLogo', '/logo.png'),
    storePhone: context.get('storePhone', ''),
    storeEmail: context.get('storeEmail', ''),
    storeAddress: context.get('storeAddress', ''),
    socialLinks: context.get('socialLinks', {}),
    enableWhatsApp: context.get('enableWhatsApp', false),
    whatsappNumber: context.get('whatsappNumber', ''),
    
    // Product display
    showProductRating: context.get('productDisplay.showProductRating', true),
    showProductBadges: context.get('productDisplay.showProductBadges', true),
    showDiscountBadge: context.get('productDisplay.showDiscountBadge', true),
    showStockStatus: context.get('productDisplay.showStockStatus', true),
    enableZoomOnHover: context.get('productDisplay.enableZoomOnHover', true),
    enableGalleryLightbox: context.get('productDisplay.enableGalleryLightbox', true),
    showRelatedProducts: context.get('productDisplay.showRelatedProducts', true),
    recentlyViewedCount: context.get('productDisplay.recentlyViewedCount', 4),
    
    // Checkout
    allowGuestCheckout: context.get('checkoutSettings.allowGuestCheckout', true),
    requirePhone: context.get('checkoutSettings.requirePhone', true),
    requireCompany: context.get('checkoutSettings.requireCompany', false),
    enableNotes: context.get('checkoutSettings.enableNotes', true),
    cartExpiryDays: context.get('checkoutSettings.cartExpiryDays', 30),
    
    // Legal
    termsOfServiceUrl: context.get('legalSettings.termsOfServiceUrl', '/terms'),
    privacyPolicyUrl: context.get('legalSettings.privacyPolicyUrl', '/privacy'),
    refundPolicyUrl: context.get('legalSettings.refundPolicyUrl', '/refund-policy'),
    enableCookieConsent: context.get('legalSettings.enableCookieConsent', true),
    cookieConsentMessage: context.get('legalSettings.cookieConsentMessage', ''),
    
    // Payment display
    showPaymentIcons: context.get('paymentDisplay.showPaymentIcons', true),
    paymentIcons: context.get('paymentDisplay.paymentIcons', []),
    securePaymentMessage: context.get('paymentDisplay.securePaymentMessage', ''),
    
    // Shipping
    shippingMethods: context.get('shippingMethods', []),
    standardShippingPrice: context.get('standardShippingPrice', 0),
    expressShippingPrice: context.get('expressShippingPrice', 0),
    freeShippingThreshold: context.get('freeShippingThreshold', 0),
    freeShippingMessage: context.get('freeShippingMessage', ''),
    
    // Currency & Tax
    taxRate: context.get('taxRate', 0),
    taxName: context.get('taxName', 'VAT'),
    taxInclusive: context.get('taxInclusive', false),
    
    // User settings
    userDisplayName: context.getUser('profile.displayName', ''),
    userBio: context.getUser('profile.bio', ''),
    userPhone: context.getUser('profile.phoneNumber', ''),
    userLanguage: context.getUser('profile.language', 'en'),
    userTimezone: context.getUser('profile.timezone', 'Africa/Nairobi'),
    userDateFormat: context.getUser('profile.dateFormat', 'DD/MM/YYYY'),
    userTimeFormat: context.getUser('profile.timeFormat', '24h'),
    userCompactView: context.getUser('display.compactView', false),
    userCurrency: context.getUser('display.currency', ''),
    userShowPricesWithTax: context.getUser('display.showPricesWithTax', false)
  };
};

export default useSettingsHook;