// src/components/index.js - Central export file

// ==================== UI Components ====================
export { default as Badge } from './ui/Badge';
export { default as Button } from './ui/Button';
export { default as Counter } from './ui/Counter';
export { default as HorizontalScroll } from './ui/HorizontalScroll';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as LoadingFallback } from './ui/LoadingFallback';
export { default as OrderTimeline } from './ui/OrderTimeline';
export { default as Price } from './ui/Price';
export { default as ProductCard } from './ui/ProductCard';
export { default as ProductInfoCard } from './ui/ProductInfoCard';
export { default as QuantitySelector } from './ui/QuantitySelector';
export { default as RatingStars } from './ui/RatingStars';
export { default as SectionHeader } from './ui/SectionHeader';
export { default as StatusBadge } from './ui/StatusBadge';
export { default as TopBar } from './ui/TopBar';
export { default as ToastConfig } from './ui/ToastConfig';

// ==================== Layout Components ====================
export { default as CategorySection } from './layout/CategorySection';
export { default as FlashSaleSection } from './layout/FlashSaleSection';
export { default as HeroSection } from './layout/HeroSection';
export { default as PageHeader } from './layout/PageHeader';
export { default as ProductGrid } from './layout/ProductGrid';
export { default as ProductImageGallery } from './layout/ProductImageGallery';
export { default as ProductReviews } from './layout/ProductReviews';
export { default as ProductSection } from './layout/ProductSection';
export { default as RelatedProducts } from './layout/RelatedProducts';
export { default as TestimonialsSection } from './layout/TestimonialsSection';
export { default as TrustStats } from './layout/TrustStats';

// ==================== Auth Components ====================
export { default as AuthLayout } from './auth/AuthLayout';
export { default as AuthHeader } from './auth/AuthHeader';
export { default as AuthForm } from './auth/AuthForm';
export { default as SocialLoginButtons } from './auth/SocialLoginButtons';
export { default as PasswordInput } from './auth/PasswordInput';
export { default as OtpInput } from './auth/OtpInput';

// ==================== Shop Components ====================
export { default as ShopHeader } from './shop/ShopHeader';
export { default as ShopFilters } from './shop/ShopFilters';
export { default as SearchAutocomplete } from './shop/SearchAutocomplete';
export { default as ProductControls } from './shop/ProductControls';
export { default as ShopProductGrid } from './shop/ProductGrid';
export { default as ProductListView } from './shop/ProductListView';
export { default as ShopPagination } from './shop/ShopPagination';

// ==================== Order Components ====================
export { default as OrderCard } from './orders/OrderCard';
export { default as OrderFilters } from './orders/OrderFilters';
export { default as OrderItemsList } from './orders/OrderItemsList';
export { default as OrderStats } from './orders/OrderStats';
export { default as OrderSummary } from './orders/OrderSummary';
export { default as PaymentInfo } from './orders/PaymentInfo';
export { default as ShippingInfo } from './orders/ShippingInfo';
export { default as ConfirmationActions } from './orders/ConfirmationActions';

// ==================== Dashboard Components ====================
export { default as StatsCard } from './dashboard/StatsCard';
export { default as ProfileOverview } from './dashboard/ProfileOverview';
export { default as RecentOrders } from './dashboard/RecentOrders';
export { default as QuickActions } from './dashboard/QuickActions';
export { default as ActivitySummary } from './dashboard/ActivitySummary';

// ==================== Navbar Components ====================
export { default as Navbar } from './Navbar';
export { default as NavbarTopBar } from './navbar/TopBar';
export { default as DesktopSearch } from './navbar/DesktopSearch';
export { default as UserMenu } from './navbar/UserMenu';
export { default as MobileMenu } from './navbar/MobileMenu';
export { default as VerificationBanner } from './navbar/VerificationBanner';
export { default as VerificationModal } from './navbar/VerificationModal';

// ==================== Other Components ====================
export { default as Footer } from './Footer';
export { default as Layout } from './Layout';
export { 
  default as Logo,
  NavbarLogo,
  FooterLogo,
  HeroLogo,
  MobileLogo,
  DashboardLogo,
  LoginLogo,
  CheckoutLogo,
  AuthLogo
} from './Logo';
export { default as PagePlaceholder } from './PagePlaceholder';
export { default as ProtectedRoute } from './ProtectedRoute';

// ==================== Re-export commonly used utilities ====================
export { formatKES } from './ui/Price';
export { formatDate, formatDateTime, getRelativeTime } from '../utils/dateUtils';