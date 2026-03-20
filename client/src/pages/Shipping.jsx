// src/pages/Shipping.jsx - Using reusable components
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
  FiChevronRight
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 600);
  }, []);

  const shippingMethods = [
    { name: 'Standard Shipping', delivery: '5-7 business days', cost: 'Free', free: true, icon: <FiPackage className="w-5 h-5 text-yellow-500" /> },
    { name: 'Express Shipping', delivery: '2-3 business days', cost: 'KSh 350', free: false, icon: <FiTruck className="w-5 h-5 text-yellow-500" /> },
    { name: 'Next Day Delivery', delivery: '1 business day', cost: 'KSh 650', free: false, icon: <FiClock className="w-5 h-5 text-yellow-500" /> },
    { name: 'International Shipping', delivery: '7-14 business days', cost: 'KSh 1,200', free: false, icon: <FiGlobe className="w-5 h-5 text-yellow-500" /> }
  ];

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="SHIPPING POLICY" 
          subtitle="Loading shipping policy..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading shipping policy..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="SHIPPING POLICY" 
        subtitle={`Last updated: ${lastUpdated}`}
        image={headerImage}
      />

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
            <p>Orders are typically processed within 1-2 business days after payment confirmation. You will receive a confirmation email once your order has been processed and shipped.</p>
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
            <p>Once your order ships, you will receive a tracking number via email and SMS. You can track your order status in real-time through your account dashboard or by visiting our Track Order page.</p>
          </Section>
        </div>

        {/* Contact Support */}
        <div className="p-6 mt-6 text-center content-card rounded-xl">
          <p className="mb-3 text-sm text-gray-400">Have questions about shipping? Contact our support team</p>
          <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
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