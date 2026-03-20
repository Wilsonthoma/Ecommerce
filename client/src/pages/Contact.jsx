// src/pages/Contact.jsx - COMPLETE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiSend,
  FiClock,
  FiUser,
  FiChevronRight,
  FiMapPin as FiMapIcon
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const contactHeaderImage = "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Contact Info Card Component
const ContactInfoCard = ({ icon: Icon, title, content, subContent, delay = 0 }) => (
  <div className="p-6 contact-card rounded-xl" data-aos="fade-up" data-aos-delay={delay}>
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-full bg-yellow-600/10">
        <Icon className="w-5 h-5 text-yellow-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-400">{content}</p>
        {subContent && <p className="text-xs text-gray-400">{subContent}</p>}
      </div>
    </div>
  </div>
);

const Contact = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 500);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 1500);
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="CONTACT US" 
          subtitle="Loading contact page..."
          image={contactHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading contact page..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="CONTACT US" 
        subtitle="We're here to help"
        image={contactHeaderImage}
      />

      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Contact Us</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-4">
            <ContactInfoCard 
              icon={FiMapPin}
              title="Visit Us"
              content="Nairobi, Kenya"
              subContent="Westlands, Nairobi"
              delay={100}
            />
            <ContactInfoCard 
              icon={FiPhone}
              title="Call Us"
              content="+254 700 123 456"
              subContent="Mon-Fri, 8am-6pm"
              delay={150}
            />
            <ContactInfoCard 
              icon={FiMail}
              title="Email Us"
              content="support@kwetushop.com"
              subContent="info@kwetushop.com"
              delay={200}
            />
            <ContactInfoCard 
              icon={FiClock}
              title="Working Hours"
              content="Monday - Friday: 8am - 6pm"
              subContent="Saturday: 9am - 4pm"
              delay={250}
            />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-6 contact-card rounded-xl" data-aos="fade-left">
              <h2 className="mb-4 text-lg font-semibold text-white">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    placeholder="Write your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 overflow-hidden rounded-xl h-80 contact-card" data-aos="fade-up">
          <iframe
            title="Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.817726984603!2d36.82194631475394!3d-1.283475999062508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d4e5f1c8b1%3A0x3c8b3b9c9c9c9c9c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            className="transition-opacity opacity-80 hover:opacity-100"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;