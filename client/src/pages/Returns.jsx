// src/pages/Returns.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiTruck,
  FiChevronRight,
  FiMail,
  FiPhone
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

  const returnSteps = [
    { title: 'Request Return', description: 'Log in to your account and initiate a return request for eligible items.' },
    { title: 'Print Label', description: 'Print the provided return shipping label and packing slip.' },
    { title: 'Pack Items', description: 'Securely pack the items in their original packaging with all tags.' },
    { title: 'Ship Back', description: 'Drop off the package at any authorized shipping location.' },
    { title: 'Get Refund', description: 'Once received and inspected, we\'ll process your refund within 5-7 business days.' }
  ];

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="RETURNS POLICY" 
          subtitle="Loading returns policy..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading returns policy..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="RETURNS POLICY" 
        subtitle={`Last updated: ${lastUpdated}`}
        image={headerImage}
      />

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
            <p>You have <span className="font-bold text-yellow-500">30 days</span> from the date of delivery to initiate a return. Items must be unused, in their original packaging, with all tags attached.</p>
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
            <p>Return shipping costs are free for defective items or our error. For change-of-mind returns, return shipping costs will be deducted from your refund. We recommend using trackable shipping.</p>
          </Section>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <FAQItem question="Can I exchange an item instead of returning it?" answer="Yes, you can request an exchange for a different size, color, or similar value item. Process the return and place a new order for the desired item." delay={100} />
            <FAQItem question="How long does the refund take to appear?" answer="Refunds typically appear within 5-7 business days after processing, depending on your bank or payment method." delay={150} />
            <FAQItem question="What if I receive a damaged or defective item?" answer="We're sorry about that! Contact us immediately with photos of the damage, and we'll arrange a free return and replacement." delay={200} />
            <FAQItem question="Do I need the original packaging?" answer="Yes, items must be returned in their original packaging with all tags and accessories to be eligible for a full refund." delay={250} />
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 mt-8 text-center content-card rounded-xl">
          <h3 className="mb-3 text-lg font-semibold text-white">Need Help With a Return?</h3>
          <p className="mb-4 text-sm text-gray-400">Our customer support team is here to assist you</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/contact')} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              <FiMail className="w-3 h-3" />
              Contact Support
            </button>
            <a href="tel:+254700123456" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/5">
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