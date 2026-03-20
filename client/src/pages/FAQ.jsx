// src/pages/FAQ.jsx - COMPLETE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiHelpCircle,
  FiMail,
  FiChevronRight
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const faqHeaderImage = "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600";

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="mb-3 faq-card rounded-xl">
      <div className="faq-question" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">{question}</h3>
          {isOpen ? (
            <FiChevronUp className="w-4 h-4 text-yellow-500" />
          ) : (
            <FiChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Category Filter Component
const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect('all')}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
          selected === 'all'
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            selected === category
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

const FAQ = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});
  const [filteredFAQs, setFilteredFAQs] = useState([]);

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the "My Orders" section. Alternatively, use our Track Order page with your order number and email address.'
    },
    {
      id: 2,
      category: 'Orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placing them. After that, they enter processing and cannot be changed. Contact our support team immediately if you need assistance.'
    },
    {
      id: 3,
      category: 'Shipping',
      question: 'How much does shipping cost?',
      answer: 'Shipping costs vary based on your location and the shipping method chosen. Standard shipping within Nairobi is KSh 150, while other counties range from KSh 200-500. Free shipping is available on orders over KSh 5,000.'
    },
    {
      id: 4,
      category: 'Shipping',
      question: 'How long does delivery take?',
      answer: 'Delivery times depend on your location: Nairobi (1-2 days), other major cities (2-4 days), and remote areas (5-7 days). Express shipping options are available at checkout.'
    },
    {
      id: 5,
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging, with all tags attached. Return shipping is free for defective items.'
    },
    {
      id: 6,
      category: 'Returns',
      question: 'How do I return an item?',
      answer: 'Log in to your account, go to "My Orders", select the item you wish to return, and follow the return instructions. You\'ll receive a return label via email.'
    },
    {
      id: 7,
      category: 'Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Visa/Mastercard credit/debit cards, PayPal, and Cash on Delivery (available in select areas). All payments are secure and encrypted.'
    },
    {
      id: 8,
      category: 'Payments',
      question: 'Is it safe to use my card on your site?',
      answer: 'Yes, absolutely. We use industry-standard SSL encryption to protect your information. We do not store full credit card numbers on our servers.'
    },
    {
      id: 9,
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'Click on "Account" in the top navigation, then select "Sign Up". Fill in your details and verify your email address to complete registration.'
    },
    {
      id: 10,
      category: 'Account',
      question: 'I forgot my password. What should I do?',
      answer: 'Click on "Account", then "Forgot Password". Enter your email address and we\'ll send you a link to reset your password.'
    },
    {
      id: 11,
      category: 'Products',
      question: 'Are your products authentic?',
      answer: 'Yes, all products sold on KwetuShop are 100% authentic and sourced directly from authorized distributors and manufacturers.'
    },
    {
      id: 12,
      category: 'Products',
      question: 'Do you offer product warranties?',
      answer: 'Most electronics come with manufacturer warranties. Warranty periods vary by product and are clearly stated on the product page.'
    }
  ];

  // Get unique categories
  const categories = [...new Set(faqData.map(item => item.category))];

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

  // Filter FAQs based on search and category
  useEffect(() => {
    let filtered = faqData;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFAQs(filtered);
    setOpenItems({});
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="FREQUENTLY ASKED QUESTIONS" 
          subtitle="Loading FAQ..."
          image={faqHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading FAQ..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="FREQUENTLY ASKED QUESTIONS" 
        subtitle="Find answers to common questions"
        image={faqHeaderImage}
      />

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">FAQ</span>
        </nav>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
          />
        </div>

        {/* Category Filters */}
        <CategoryFilter 
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Results Count */}
        <p className="mb-4 text-xs text-gray-400">
          Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
        </p>

        {/* FAQ List */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-2">
            {filteredFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openItems[faq.id] || false}
                onToggle={() => toggleItem(faq.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center faq-card rounded-xl">
            <FiHelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="mb-1 text-base font-semibold text-white">No questions found</h3>
            <p className="mb-4 text-sm text-gray-400">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Still Have Questions */}
        <div className="p-6 mt-8 text-center faq-card rounded-xl">
          <h3 className="mb-2 text-lg font-semibold text-white">Still have questions?</h3>
          <p className="mb-4 text-sm text-gray-400">Can't find the answer you're looking for?</p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            <FiMail className="w-3 h-3" />
            Contact Support
            <BsArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;