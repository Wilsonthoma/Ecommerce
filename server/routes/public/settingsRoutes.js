// server/routes/public/settingsRoutes.js
import express from 'express';
import GlobalSettings from '../../models/GlobalSettings.js';
import { getPublicSettings } from '../../controllers/public/settingsController.js';

const router = express.Router();

// GET all public settings for client portal
router.get('/', getPublicSettings);

// GET store information
router.get('/store-info', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        storeName: settings?.storeName,
        storeEmail: settings?.storeEmail,
        storePhone: settings?.storePhone,
        storeAddress: settings?.storeAddress,
        storeLogo: settings?.storeLogo,
        storeDescription: settings?.storeDescription,
        socialLinks: settings?.socialLinks,
        enableWhatsApp: settings?.enableWhatsApp,
        whatsappNumber: settings?.whatsappNumber
      }
    });
  } catch (error) {
    console.error('Error fetching store info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store information'
    });
  }
});

// GET theme settings
router.get('/theme', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        theme: settings?.theme || 'dark',
        primaryColor: settings?.primaryColor || '#F59E0B',
        secondaryColor: settings?.secondaryColor || '#EA580C',
        accentColor: settings?.accentColor || '#10B981',
        showAnnouncementBar: settings?.showAnnouncementBar || false,
        announcementText: settings?.announcementText || '',
        headerLayout: settings?.headerLayout || 'centered',
        enableQuickView: settings?.enableQuickView || true,
        productsPerRow: settings?.productsPerRow || 4,
        productsPerPage: settings?.productsPerPage || 12
      }
    });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch theme settings'
    });
  }
});

// GET checkout settings
router.get('/checkout', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        allowGuestCheckout: settings?.checkoutSettings?.allowGuestCheckout ?? true,
        requirePhone: settings?.checkoutSettings?.requirePhone ?? true,
        requireCompany: settings?.checkoutSettings?.requireCompany ?? false,
        enableNotes: settings?.checkoutSettings?.enableNotes ?? true,
        cartExpiryDays: settings?.checkoutSettings?.cartExpiryDays ?? 30
      }
    });
  } catch (error) {
    console.error('Error fetching checkout settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checkout settings'
    });
  }
});

// GET product display settings
router.get('/product-display', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        showProductRating: settings?.productDisplay?.showProductRating ?? true,
        showProductBadges: settings?.productDisplay?.showProductBadges ?? true,
        showDiscountBadge: settings?.productDisplay?.showDiscountBadge ?? true,
        showStockStatus: settings?.productDisplay?.showStockStatus ?? true,
        enableZoomOnHover: settings?.productDisplay?.enableZoomOnHover ?? true,
        enableGalleryLightbox: settings?.productDisplay?.enableGalleryLightbox ?? true,
        showRelatedProducts: settings?.productDisplay?.showRelatedProducts ?? true,
        recentlyViewedCount: settings?.productDisplay?.recentlyViewedCount ?? 4
      }
    });
  } catch (error) {
    console.error('Error fetching product display settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product display settings'
    });
  }
});

// GET customer settings
router.get('/customer', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        allowRegistration: settings?.customerSettings?.allowRegistration ?? true,
        requireEmailVerification: settings?.customerSettings?.requireEmailVerification ?? true,
        requirePhoneVerification: settings?.customerSettings?.requirePhoneVerification ?? false,
        enableWishlist: settings?.customerSettings?.enableWishlist ?? true,
        enableReviews: settings?.customerSettings?.enableReviews ?? true,
        enableOrderTracking: settings?.customerSettings?.enableOrderTracking ?? true,
        enableReturns: settings?.customerSettings?.enableReturns ?? true,
        returnsWindowDays: settings?.customerSettings?.returnsWindowDays ?? 14,
        enableSavedAddresses: settings?.customerSettings?.enableSavedAddresses ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching customer settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer settings'
    });
  }
});

// GET legal settings
router.get('/legal', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        termsOfServiceUrl: settings?.legalSettings?.termsOfServiceUrl || '/terms',
        privacyPolicyUrl: settings?.legalSettings?.privacyPolicyUrl || '/privacy',
        refundPolicyUrl: settings?.legalSettings?.refundPolicyUrl || '/refund-policy',
        shippingPolicyUrl: settings?.legalSettings?.shippingPolicyUrl || '/shipping-policy',
        enableCookieConsent: settings?.legalSettings?.enableCookieConsent ?? true,
        cookieConsentMessage: settings?.legalSettings?.cookieConsentMessage || 'We use cookies to enhance your experience.',
        enableGdpr: settings?.legalSettings?.enableGdpr ?? true,
        allowDataExport: settings?.legalSettings?.allowDataExport ?? true,
        allowAccountDeletion: settings?.legalSettings?.allowAccountDeletion ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching legal settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legal settings'
    });
  }
});

// GET payment display settings
router.get('/payment-display', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        showPaymentIcons: settings?.paymentDisplay?.showPaymentIcons ?? true,
        paymentIcons: settings?.paymentDisplay?.paymentIcons || ['visa', 'mastercard', 'mpesa', 'airtel'],
        acceptedCards: settings?.paymentDisplay?.acceptedCards || ['visa', 'mastercard', 'amex'],
        securePaymentMessage: settings?.paymentDisplay?.securePaymentMessage || 'Your payment information is secure',
        installmentMessage: settings?.paymentDisplay?.installmentMessage || 'Pay in installments from KSh 500/month'
      }
    });
  } catch (error) {
    console.error('Error fetching payment display settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment display settings'
    });
  }
});

// GET shipping settings
router.get('/shipping', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        shippingMethods: settings?.shippingMethods || ['standard', 'express', 'pickup'],
        standardShippingPrice: settings?.standardShippingPrice || 200,
        expressShippingPrice: settings?.expressShippingPrice || 500,
        freeShippingThreshold: settings?.freeShippingThreshold || 2000,
        freeShippingMessage: settings?.freeShippingMessage || 'Free shipping on orders over KSh 2000!',
        estimatedDeliveryMessage: settings?.estimatedDeliveryMessage || 'Estimated delivery: {min}-{max} days',
        processingTimeDays: settings?.processingTimeDays || 1,
        standardDeliveryDays: settings?.standardDeliveryDays || { min: 3, max: 5 },
        expressDeliveryDays: settings?.expressDeliveryDays || { min: 1, max: 2 },
        enableOrderTracking: settings?.enableOrderTracking ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping settings'
    });
  }
});

// GET currency & tax settings
router.get('/currency-tax', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        currency: settings?.currency || 'KES',
        taxRate: settings?.taxRate || 16,
        taxName: settings?.taxName || 'VAT',
        taxInclusive: settings?.taxInclusive ?? true,
        showPricesWithTax: settings?.showPricesWithTax ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching currency/tax settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currency/tax settings'
    });
  }
});

// GET SEO settings
router.get('/seo', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({
      success: true,
      data: {
        metaTitle: settings?.seoSettings?.metaTitle || 'KwetuShop - Best Electronics Store in Kenya',
        metaDescription: settings?.seoSettings?.metaDescription || 'Shop the latest smartphones, laptops, and electronics.',
        metaKeywords: settings?.seoSettings?.metaKeywords || 'electronics, smartphones, laptops, Kenya',
        googleAnalyticsId: settings?.seoSettings?.googleAnalyticsId || '',
        facebookPixelId: settings?.seoSettings?.facebookPixelId || '',
        enableAnalytics: settings?.seoSettings?.enableAnalytics ?? true,
        enableSocialShare: settings?.seoSettings?.enableSocialShare ?? true
      }
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SEO settings'
    });
  }
});

export default router;