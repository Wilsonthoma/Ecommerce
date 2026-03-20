// src/pages/Privacy.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShield, 
  FiLock, 
  FiEye, 
  FiDatabase,
  FiMail,
  FiGlobe,
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

const Privacy = () => {
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
          title="PRIVACY POLICY" 
          subtitle="Loading privacy policy..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading privacy policy..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="PRIVACY POLICY" 
        subtitle={`Last updated: ${lastUpdated}`}
        image={headerImage}
      />

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Privacy Policy</span>
        </nav>

        {/* Introduction */}
        <div className="p-6 mb-6 content-card rounded-xl" data-aos="fade-up">
          <p className="text-sm leading-relaxed text-gray-400">
            At KwetuShop, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you visit our website or make a purchase. 
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
            please do not access the site.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section icon={FiDatabase} title="Information We Collect" delay={100}>
            <p>We collect personal information that you voluntarily provide to us when you:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Register for an account</li>
              <li>Make a purchase</li>
              <li>Sign up for our newsletter</li>
              <li>Contact customer support</li>
              <li>Participate in promotions or surveys</li>
            </ul>
            <p className="mt-3">The personal information we collect may include:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Name and contact information</li>
              <li>Payment information</li>
              <li>Shipping address</li>
              <li>Order history</li>
              <li>Communication preferences</li>
            </ul>
          </Section>

          <Section icon={FiEye} title="How We Use Your Information" delay={200}>
            <p>We use the information we collect to:</p>
            <ul className="pl-5 mt-2 space-y-1 list-disc">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders</li>
              <li>Send you promotional offers (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section icon={FiLock} title="Information Security" delay={300}>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. 
              All sensitive information you supply is encrypted via Secure Socket Layer (SSL) technology. 
              We do not store full credit card numbers on our servers.
            </p>
          </Section>

          <Section icon={FiGlobe} title="Third-Party Disclosure" delay={400}>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside 
              parties except when necessary to fulfill your order (e.g., shipping carriers, payment processors) 
              or when required by law.
            </p>
          </Section>

          <Section icon={FiMail} title="Contact Us" delay={500}>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-white">Email: privacy@kwetushop.com</p>
              <p className="text-white">Phone: +254 700 123 456</p>
              <p className="text-white">Address: Nairobi, Kenya</p>
            </div>
          </Section>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-[10px] text-gray-500">
          This policy was last updated on {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default Privacy;