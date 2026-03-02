// src/pages/Shipping.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTruck, 
  FiPackage, 
  FiClock, 
  FiGlobe,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
  FiChevronRight,
  FiHome,
  FiMapPin as FiMapIcon
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/LoadingSpinner';

// Font styles - Yellow-Orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling */
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  .content-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .content-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  /* COMPACT TEXT SIZES */
  .text-xs {
    font-size: 0.65rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-base {
    font-size: 0.9rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
  
  .text-xl {
    font-size: 1.1rem;
  }
`;

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

// Gradient for header
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-1.5 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapIcon className="w-3 h-3" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Shipping Method Card
const ShippingMethodCard = ({ method, isActive }) => (
  <div className={`p-4 content-card rounded-xl ${isActive ? 'border-yellow-500/50 bg-yellow-600/5' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-yellow-600/10">
          {method.icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">{method.name}</h3>
          <p className="text-[10px] text-gray-400">{method.delivery}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-yellow-500">{method.cost}</p>
        {method.free && (
          <span className="text-[8px] text-green-500">Free Shipping</span>
        )}
      </div>
    </div>
  </div>
);

// Section Component
const Section = ({ icon: Icon, title, children, delay = 0 }) => (
  <div className="p-6 content-card rounded-xl" data-aos="fade-up" data-aos-delay={delay}>
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-yellow-600/10">
        <Icon className="w-5 h-5 text-yellow-500" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <div className="space-y-3 text-sm leading-relaxed text-gray-400">
      {children}
    </div>
  </div>
);

const Shipping = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('January 15, 2024');
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Inject styles and load data
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    // Simulate loading
    const loadData = async () => {
      const startTime = performance.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const endTime = performance.now();
      setLoadTime((endTime - startTime).toFixed(0));
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: 0
      }));
      
      console.log(`⚡ Shipping page loaded in ${(endTime - startTime).toFixed(0)}ms`);
      
      setLoading(false);
      setInitialLoad(false);
    };
    
    loadData();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const shippingMethods = [
    {
      name: 'Standard Shipping',
      delivery: '5-7 business days',
      cost: 'Free',
      free: true,
      icon: <FiPackage className="w-5 h-5 text-yellow-500" />
    },
    {
      name: 'Express Shipping',
      delivery: '2-3 business days',
      cost: 'KSh 350',
      free: false,
      icon: <FiTruck className="w-5 h-5 text-yellow-500" />
    },
    {
      name: 'Next Day Delivery',
      delivery: '1 business day',
      cost: 'KSh 650',
      free: false,
      icon: <FiClock className="w-5 h-5 text-yellow-500" />
    },
    {
      name: 'International Shipping',
      delivery: '7-14 business days',
      cost: 'KSh 1,200',
      free: false,
      icon: <FiGlobe className="w-5 h-5 text-yellow-500" />
    }
  ];

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={headerImage}
              alt="Shipping Policy"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 mx-auto max-w-7xl">
              <div 
                className="max-w-2xl"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                <div className="section-title-wrapper">
                  <h1 className="section-title">SHIPPING POLICY</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading shipping policy...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading shipping policy..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      <TopBar />

      {/* Header Image */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={headerImage}
            alt="Shipping Policy"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              <div className="section-title-wrapper">
                <h1 className="section-title">SHIPPING POLICY</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Shipping Policy</span>
        </nav>

        {/* Introduction */}
        <div className="p-6 mb-6 content-card rounded-xl" data-aos="fade-up">
          <p className="text-sm leading-relaxed text-gray-400">
            We strive to deliver your orders as quickly and efficiently as possible. 
            This shipping policy explains our shipping methods, costs, and delivery timeframes.
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Available Shipping Methods</h2>
          <div className="space-y-3">
            {shippingMethods.map((method, index) => (
              <ShippingMethodCard 
                key={index} 
                method={method} 
                isActive={method.free}
                data-aos="fade-up"
                data-aos-delay={100 + index * 50}
              />
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-4">
          <Section icon={FiMapPin} title="Delivery Areas" delay={300}>
            <p>We currently ship to:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>All counties in Kenya</li>
              <li>Major cities in East Africa (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret)</li>
              <li>Select international destinations</li>
            </ul>
          </Section>

          <Section icon={FiClock} title="Processing Time" delay={400}>
            <p>
              Orders are typically processed within 1-2 business days after payment confirmation. 
              You will receive a confirmation email once your order has been processed and shipped.
            </p>
          </Section>

          <Section icon={FiDollarSign} title="Shipping Costs" delay={500}>
            <p>Shipping costs are calculated based on:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Delivery location</li>
              <li>Selected shipping method</li>
              <li>Order weight and dimensions</li>
              <li>Order value (free shipping on orders over KSh 5,000 within Nairobi)</li>
            </ul>
          </Section>

          <Section icon={FiCheckCircle} title="Tracking Your Order" delay={600}>
            <p>
              Once your order ships, you will receive a tracking number via email and SMS. 
              You can track your order status in real-time through your account dashboard 
              or by visiting our Track Order page.
            </p>
          </Section>
        </div>

        {/* Contact Support */}
        <div className="p-6 mt-6 text-center content-card rounded-xl">
          <p className="mb-3 text-sm text-gray-400">
            Have questions about shipping? Contact our support team
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Contact Support
            <BsArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-[10px] text-gray-500">
          This policy was last updated on {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default Shipping;