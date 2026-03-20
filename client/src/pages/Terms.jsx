// src/pages/Terms.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiShield,
  FiLock,
  FiUsers,
  FiCreditCard,
  FiTruck,
  FiChevronRight
} from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

const Terms = () => {
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

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="TERMS & CONDITIONS" 
          subtitle="Loading terms and conditions..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading terms and conditions..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="TERMS & CONDITIONS" 
        subtitle={`Last updated: ${lastUpdated}`}
        image={headerImage}
      />

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Terms & Conditions</span>
        </nav>

        {/* Introduction */}
        <div className="p-6 mb-6 content-card rounded-xl" data-aos="fade-up">
          <p className="text-sm leading-relaxed text-gray-400">
            Please read these Terms and Conditions carefully before using the KwetuShop website 
            and services. By accessing or using our platform, you agree to be bound by these terms. 
            If you do not agree with any part of these terms, you may not use our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section icon={FiUsers} title="Account Registration" delay={100}>
            <p>When you create an account with us, you agree to provide accurate and complete information. You are responsible for:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Maintaining the confidentiality of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information is current</li>
            </ul>
          </Section>

          <Section icon={FiCreditCard} title="Orders and Payments" delay={200}>
            <p>By placing an order through our platform, you agree to:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Provide current, complete, and accurate purchase information</li>
              <li>Pay all charges at the prices then in effect</li>
              <li>All taxes and shipping costs associated with your order</li>
              <li>We reserve the right to refuse or cancel any order</li>
            </ul>
          </Section>

          <Section icon={FiTruck} title="Shipping and Delivery" delay={300}>
            <p>We strive to deliver products in a timely manner. Estimated delivery times are provided as guidelines and are not guaranteed. Risk of loss passes to you upon delivery. Please review our Shipping Policy for more details.</p>
          </Section>

          <Section icon={FiAlertCircle} title="Returns and Refunds" delay={400}>
            <p>Our Return Policy allows you to return eligible items within 30 days of delivery. Items must be in original condition with all tags and packaging. Refunds are processed to the original payment method within 5-7 business days of receiving the return.</p>
          </Section>

          <Section icon={FiShield} title="Intellectual Property" delay={500}>
            <p>All content on this site, including text, graphics, logos, images, and software, is the property of KwetuShop or its content suppliers and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our express permission.</p>
          </Section>

          <Section icon={FiLock} title="Limitation of Liability" delay={600}>
            <p>To the fullest extent permitted by law, KwetuShop shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your use or inability to use our services.</p>
          </Section>
        </div>

        {/* Contact Information */}
        <div className="p-6 mt-6 content-card rounded-xl">
          <h3 className="mb-3 text-lg font-semibold text-white">Questions About These Terms?</h3>
          <p className="mb-4 text-sm text-gray-400">If you have any questions about our Terms and Conditions, please contact us:</p>
          <div className="space-y-2">
            <p className="text-sm text-white">Email: legal@kwetushop.com</p>
            <p className="text-sm text-white">Phone: +254 700 123 456</p>
            <p className="text-sm text-white">Address: Nairobi, Kenya</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-[10px] text-gray-500">
          These terms were last updated on {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default Terms;