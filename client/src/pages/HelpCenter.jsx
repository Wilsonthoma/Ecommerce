// src/pages/HelpCenter.jsx - COMPLETE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHelpCircle, 
  FiSearch, 
  FiMail, 
  FiPhone, 
  FiMessageCircle,
  FiBookOpen,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiUser,
  FiShield,
  FiChevronRight,
  FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const helpHeaderImage = "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Category Card Component
const CategoryCard = ({ icon: Icon, title, description, onClick, delay = 0 }) => (
  <div 
    className="help-card category-card rounded-xl"
    onClick={onClick}
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20">
        <Icon className="w-8 h-8 text-yellow-500" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-center text-gray-400">{description}</p>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ icon: Icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-3 transition-all rounded-lg help-card hover:border-yellow-500/50"
  >
    <div className="p-2 rounded-full bg-yellow-600/10">
      <Icon className="w-4 h-4 text-yellow-500" />
    </div>
    <span className="flex-1 text-xs text-left text-white">{title}</span>
    <FiChevronRight className="w-4 h-4 text-gray-500" />
  </button>
);

const HelpCenter = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Help topics data
  const popularTopics = [
    { id: 1, title: 'How to track my order?', path: '/faq', icon: FiTruck },
    { id: 2, title: 'Return and refund policy', path: '/returns', icon: FiPackage },
    { id: 3, title: 'Payment methods accepted', path: '/payment-methods', icon: FiCreditCard },
    { id: 4, title: 'How to create an account?', path: '/faq', icon: FiUser },
    { id: 5, title: 'Shipping times and costs', path: '/shipping', icon: FiTruck },
    { id: 6, title: 'Account security tips', path: '/faq', icon: FiShield }
  ];

  const categories = [
    {
      icon: FiPackage,
      title: 'Orders',
      description: 'Track, modify, or cancel orders',
      path: '/faq?category=Orders'
    },
    {
      icon: FiTruck,
      title: 'Shipping',
      description: 'Delivery times, costs, and tracking',
      path: '/shipping'
    },
    {
      icon: FiCreditCard,
      title: 'Payments',
      description: 'Payment methods, billing, refunds',
      path: '/payment-methods'
    },
    {
      icon: FiUser,
      title: 'Account',
      description: 'Login, password, profile settings',
      path: '/faq?category=Account'
    },
    {
      icon: FiShield,
      title: 'Returns',
      description: 'Return policy and process',
      path: '/returns'
    },
    {
      icon: FiBookOpen,
      title: 'Policies',
      description: 'Terms, privacy, and guidelines',
      path: '/terms'
    }
  ];

  const quickActions = [
    { icon: FiPhone, title: 'Call Support', action: 'tel:+254700123456' },
    { icon: FiMail, title: 'Email Us', action: 'mailto:support@kwetushop.com' },
    { icon: FiMessageCircle, title: 'Live Chat', action: '/contact' },
    { icon: FiHelpCircle, title: 'FAQs', action: '/faq' }
  ];

  // All help content for search
  const helpContent = [
    ...popularTopics,
    ...categories,
    { id: 'search1', title: 'How to reset password?', path: '/reset-password' },
    { id: 'search2', title: 'Change email address', path: '/settings' },
    { id: 'search3', title: 'Delete account', path: '/contact' },
    { id: 'search4', title: 'Gift cards', path: '/gift-cards' },
    { id: 'search5', title: 'Promo codes', path: '/deals' },
    { id: 'search6', title: 'Bulk orders', path: '/contact' },
    { id: 'search7', title: 'International shipping', path: '/shipping' },
    { id: 'search8', title: 'Damaged items', path: '/returns' }
  ];

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
    }, 500);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results = helpContent.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5);

    setSearchResults(results);
    setShowResults(true);
  };

  const handleResultClick = (path) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(path);
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="HELP CENTER" 
          subtitle="Loading help center..."
          image={helpHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading help center..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="HELP CENTER" 
        subtitle="How can we help you today?"
        image={helpHeaderImage}
      />

      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Help Center</span>
        </nav>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <FiSearch className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              placeholder="Search for help (e.g., track order, return policy)..."
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              className="w-full py-4 pl-12 pr-4 text-sm text-white border border-gray-700 rounded-xl bg-gray-800/50 focus:ring-2 focus:ring-yellow-500/50"
            />
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 overflow-hidden bg-gray-900 border border-gray-700 rounded-xl">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result.path)}
                  className="flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-gray-800"
                >
                  {'icon' in result && result.icon && (
                    <div className="p-2 rounded-full bg-yellow-600/10">
                      <result.icon className="w-3 h-3 text-yellow-500" />
                    </div>
                  )}
                  <span className="flex-1 text-xs text-white">{result.title}</span>
                  <FiArrowRight className="w-3 h-3 text-gray-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.action}
              onClick={(e) => {
                if (action.action.startsWith('/')) {
                  e.preventDefault();
                  navigate(action.action);
                }
              }}
              className="flex flex-col items-center p-4 transition-all rounded-xl help-card hover:border-yellow-500/50"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <action.icon className="w-6 h-6 mb-2 text-yellow-500" />
              <span className="text-xs text-white">{action.title}</span>
            </a>
          ))}
        </div>

        {/* Help Categories */}
        <h2 className="mb-4 text-lg font-semibold text-white">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              description={category.description}
              onClick={() => navigate(category.path)}
              delay={index * 50}
            />
          ))}
        </div>

        {/* Popular Topics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="help-card rounded-xl" data-aos="fade-right">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Popular Topics</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {popularTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-4 cursor-pointer popular-topic hover:bg-yellow-600/5"
                  onClick={() => navigate(topic.path)}
                >
                  <div className="flex items-center gap-3">
                    <topic.icon className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-300">{topic.title}</span>
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="help-card rounded-xl" data-aos="fade-left">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Still Need Help?</h3>
            </div>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20">
                <FiHelpCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <h4 className="mb-2 text-sm font-semibold text-white">Contact Support</h4>
              <p className="mb-4 text-xs text-gray-400">
                Our support team is available 24/7 to assist you
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="p-6 mt-8 text-center help-card rounded-xl">
          <p className="mb-3 text-sm text-gray-400">
            Check out our frequently asked questions for quick answers
          </p>
          <button
            onClick={() => navigate('/faq')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            View FAQs
            <FiArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;