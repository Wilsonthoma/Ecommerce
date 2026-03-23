// server/controllers/public/settingsController.js
import GlobalSettings from '../../models/GlobalSettings.js';

/**
 * @desc    Get all public settings for client portal
 * @route   GET /api/public/settings
 * @access  Public
 */
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    
    if (!settings) {
      return res.status(200).json({
        success: true,
        data: getDefaultPublicSettings()
      });
    }
    
    // Return only public settings (no sensitive data)
    const publicSettings = {
      // Store Info
      storeName: settings.storeName,
      storeEmail: settings.storeEmail,
      storePhone: settings.storePhone,
      storeAddress: settings.storeAddress,
      storeLogo: settings.storeLogo,
      storeDescription: settings.storeDescription,
      socialLinks: settings.socialLinks,
      enableWhatsApp: settings.enableWhatsApp,
      whatsappNumber: settings.whatsappNumber,
      
      // Theme & Display
      theme: settings.theme || 'dark',
      primaryColor: settings.primaryColor || '#F59E0B',
      secondaryColor: settings.secondaryColor || '#EA580C',
      showAnnouncementBar: settings.showAnnouncementBar,
      announcementText: settings.announcementText,
      enableQuickView: settings.enableQuickView,
      productsPerRow: settings.productsPerRow,
      productsPerPage: settings.productsPerPage,
      
      // Customer Features
      customerSettings: {
        allowRegistration: settings.customerSettings?.allowRegistration,
        requireEmailVerification: settings.customerSettings?.requireEmailVerification,
        enableWishlist: settings.customerSettings?.enableWishlist,
        enableReviews: settings.customerSettings?.enableReviews,
        enableOrderTracking: settings.customerSettings?.enableOrderTracking,
        enableReturns: settings.customerSettings?.enableReturns,
        returnsWindowDays: settings.customerSettings?.returnsWindowDays
      },
      
      // Product Display
      productDisplay: {
        showProductRating: settings.productDisplay?.showProductRating,
        showProductBadges: settings.productDisplay?.showProductBadges,
        showDiscountBadge: settings.productDisplay?.showDiscountBadge,
        showStockStatus: settings.productDisplay?.showStockStatus,
        enableZoomOnHover: settings.productDisplay?.enableZoomOnHover,
        enableGalleryLightbox: settings.productDisplay?.enableGalleryLightbox,
        showRelatedProducts: settings.productDisplay?.showRelatedProducts,
        recentlyViewedCount: settings.productDisplay?.recentlyViewedCount
      },
      
      // Checkout
      checkoutSettings: {
        allowGuestCheckout: settings.checkoutSettings?.allowGuestCheckout,
        requirePhone: settings.checkoutSettings?.requirePhone,
        requireCompany: settings.checkoutSettings?.requireCompany,
        enableNotes: settings.checkoutSettings?.enableNotes,
        cartExpiryDays: settings.checkoutSettings?.cartExpiryDays
      },
      
      // Legal
      legalSettings: {
        termsOfServiceUrl: settings.legalSettings?.termsOfServiceUrl,
        privacyPolicyUrl: settings.legalSettings?.privacyPolicyUrl,
        refundPolicyUrl: settings.legalSettings?.refundPolicyUrl,
        shippingPolicyUrl: settings.legalSettings?.shippingPolicyUrl,
        enableCookieConsent: settings.legalSettings?.enableCookieConsent,
        cookieConsentMessage: settings.legalSettings?.cookieConsentMessage
      },
      
      // Payment Display
      paymentDisplay: {
        showPaymentIcons: settings.paymentDisplay?.showPaymentIcons,
        paymentIcons: settings.paymentDisplay?.paymentIcons,
        securePaymentMessage: settings.paymentDisplay?.securePaymentMessage,
        installmentMessage: settings.paymentDisplay?.installmentMessage
      },
      
      // Currency & Tax
      currency: settings.currency,
      taxRate: settings.taxRate,
      taxName: settings.taxName,
      taxInclusive: settings.taxInclusive,
      
      // Shipping
      shippingMethods: settings.shippingMethods,
      standardShippingPrice: settings.standardShippingPrice,
      expressShippingPrice: settings.expressShippingPrice,
      freeShippingThreshold: settings.freeShippingThreshold,
      freeShippingMessage: settings.freeShippingMessage,
      estimatedDeliveryMessage: settings.estimatedDeliveryMessage,
      enableOrderTracking: settings.enableOrderTracking,
      
      // Payment Methods (only show enabled, not keys)
      paymentMethods: settings.paymentMethods,
      
      // Maintenance
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage
    };
    
    res.status(200).json({
      success: true,
      data: publicSettings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
};

function getDefaultPublicSettings() {
  return {
    storeName: 'KwetuShop',
    storeEmail: 'info@kwetushop.co.ke',
    storePhone: '+254712345678',
    storeAddress: '123 Kimathi Street, Nairobi, Kenya',
    theme: 'dark',
    primaryColor: '#F59E0B',
    secondaryColor: '#EA580C',
    showAnnouncementBar: true,
    announcementText: 'Free shipping on orders over KSh 2000!',
    enableQuickView: true,
    productsPerRow: 4,
    productsPerPage: 12,
    customerSettings: {
      allowRegistration: true,
      enableWishlist: true,
      enableReviews: true,
      enableOrderTracking: true
    },
    productDisplay: {
      showProductRating: true,
      showProductBadges: true,
      showDiscountBadge: true,
      showStockStatus: true,
      enableZoomOnHover: true,
      enableGalleryLightbox: true,
      showRelatedProducts: true,
      recentlyViewedCount: 4
    },
    checkoutSettings: {
      allowGuestCheckout: true,
      requirePhone: true,
      enableNotes: true,
      cartExpiryDays: 30
    },
    currency: 'KES',
    taxRate: 16,
    taxName: 'VAT',
    shippingMethods: ['standard', 'express', 'pickup'],
    standardShippingPrice: 200,
    expressShippingPrice: 500,
    freeShippingThreshold: 2000,
    paymentMethods: ['mpesa', 'card', 'cash_on_delivery']
  };
}