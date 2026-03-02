// src/pages/Returns.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiChevronRight,
  FiHome,
  FiMapPin,
  FiMail,
  FiPhone
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
          <FiMapPin className="w-3 h-3" />
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

// FAQ Item Component
const FAQItem = ({ question, answer, delay = 0 }) => (
  <div className="p-4 content-card rounded-xl" data-aos="fade-up" data-aos-delay={delay}>
    <h3 className="mb-2 text-sm font-medium text-white">{question}</h3>
    <p className="text-xs leading-relaxed text-gray-400">{answer}</p>
  </div>
);

const Returns = () => {
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
      
      console.log(`⚡ Returns page loaded in ${(endTime - startTime).toFixed(0)}ms`);
      
      setLoading(false);
      setInitialLoad(false);
    };
    
    loadData();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const returnSteps = [
    {
      title: 'Request Return',
      description: 'Log in to your account and initiate a return request for eligible items.'
    },
    {
      title: 'Print Label',
      description: 'Print the provided return shipping label and packing slip.'
    },
    {
      title: 'Pack Items',
      description: 'Securely pack the items in their original packaging with all tags.'
    },
    {
      title: 'Ship Back',
      description: 'Drop off the package at any authorized shipping location.'
    },
    {
      title: 'Get Refund',
      description: 'Once received and inspected, we\'ll process your refund within 5-7 business days.'
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
              alt="Returns Policy"
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
                  <h1 className="section-title">RETURNS POLICY</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading returns policy...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading returns policy..." />
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
            alt="Returns Policy"
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
                <h1 className="section-title">RETURNS POLICY</h1>
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
          <span className="font-medium text-white">Returns Policy</span>
        </nav>

        {/* Introduction */}
        <div className="p-6 mb-6 content-card rounded-xl" data-aos="fade-up">
          <p className="text-sm leading-relaxed text-gray-400">
            We want you to be completely satisfied with your purchase. If you're not happy with your order, 
            we're here to help. This Returns Policy explains how you can return items and get a refund.
          </p>
        </div>

        {/* Return Steps */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">How to Return an Item</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {returnSteps.map((step, index) => (
              <div key={index} className="p-4 text-center content-card rounded-xl" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-sm font-bold text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                  {index + 1}
                </div>
                <h3 className="mb-1 text-xs font-medium text-white">{step.title}</h3>
                <p className="text-[10px] text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          <Section icon={FiClock} title="Return Period" delay={100}>
            <p>
              You have <span className="font-bold text-yellow-500">30 days</span> from the date of delivery 
              to initiate a return. Items must be unused, in their original packaging, with all tags attached.
            </p>
          </Section>

          <Section icon={FiCheckCircle} title="Eligible Items" delay={200}>
            <p>Most items purchased on KwetuShop are eligible for return, including:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Electronics (unopened)</li>
              <li>Clothing and accessories</li>
              <li>Home and living items</li>
              <li>Beauty products (unused)</li>
            </ul>
          </Section>

          <Section icon={FiXCircle} title="Non-Returnable Items" delay={300}>
            <p>The following items cannot be returned:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Opened electronics</li>
              <li>Personal care items</li>
              <li>Gift cards</li>
              <li>Perishable goods</li>
              <li>Customized or personalized items</li>
            </ul>
          </Section>

          <Section icon={FiDollarSign} title="Refund Process" delay={400}>
            <p>Once we receive your return:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Inspection takes 2-3 business days</li>
              <li>Refund processed to original payment method</li>
              <li>Processing time: 5-7 business days</li>
              <li>You'll receive email confirmation</li>
            </ul>
          </Section>

          <Section icon={FiTruck} title="Return Shipping" delay={500}>
            <p>
              Return shipping costs are free for defective items or our error. For change-of-mind returns, 
              return shipping costs will be deducted from your refund. We recommend using trackable shipping.
            </p>
          </Section>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <FAQItem 
              question="Can I exchange an item instead of returning it?"
              answer="Yes, you can request an exchange for a different size, color, or similar value item. Process the return and place a new order for the desired item."
              delay={100}
            />
            <FAQItem 
              question="How long does the refund take to appear?"
              answer="Refunds typically appear within 5-7 business days after processing, depending on your bank or payment method."
              delay={150}
            />
            <FAQItem 
              question="What if I receive a damaged or defective item?"
              answer="We're sorry about that! Contact us immediately with photos of the damage, and we'll arrange a free return and replacement."
              delay={200}
            />
            <FAQItem 
              question="Do I need the original packaging?"
              answer="Yes, items must be returned in their original packaging with all tags and accessories to be eligible for a full refund."
              delay={250}
            />
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 mt-8 text-center content-card rounded-xl">
          <h3 className="mb-3 text-lg font-semibold text-white">Need Help With a Return?</h3>
          <p className="mb-4 text-sm text-gray-400">
            Our customer support team is here to assist you
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <FiMail className="w-3 h-3" />
              Contact Support
            </button>
            <a
              href="tel:+254700123456"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/5"
            >
              <FiPhone className="w-3 h-3" />
              Call Us
            </a>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-[10px] text-gray-500">
          This policy was last updated on {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default Returns;