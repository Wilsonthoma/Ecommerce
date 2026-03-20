// src/pages/About.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Company Information
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHeart, 
  FiShield, 
  FiTruck, 
  FiAward,
  FiChevronRight,
  FiMapPin
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// About images
const aboutImages = {
  team: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
  store: "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=800",
  shipping: "https://images.pexels.com/photos/4391478/pexels-photo-4391478.jpeg?auto=compress&cs=tinysrgb&w=800"
};

// Header image
const aboutHeaderImage = "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Value Card Component
const ValueCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <div className="p-6 text-center about-card rounded-xl" data-aos="fade-up" data-aos-delay={delay}>
    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600/10">
      <Icon className="w-8 h-8 text-yellow-500" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

// Team Member Card
const TeamMember = ({ name, role, image, delay = 0 }) => (
  <div className="p-4 text-center about-card rounded-xl" data-aos="fade-up" data-aos-delay={delay}>
    <div className="w-24 h-24 mx-auto mb-3 overflow-hidden rounded-full">
      <img src={image} alt={name} className="object-cover w-full h-full" />
    </div>
    <h3 className="text-sm font-semibold text-white">{name}</h3>
    <p className="text-xs text-gray-400">{role}</p>
  </div>
);

const About = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    const startTime = performance.now();
    
    setTimeout(() => {
      const endTime = performance.now();
      console.log(`⚡ About page loaded in ${(endTime - startTime).toFixed(0)}ms`);
      setLoading(false);
      setInitialLoad(false);
    }, 600);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="ABOUT US" 
          subtitle="Loading about page..."
          image={aboutHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading about page..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="ABOUT US" 
        subtitle="Your trusted shopping partner in Kenya"
        image={aboutHeaderImage}
      />

      {/* Main Content */}
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">About Us</span>
        </nav>

        {/* Our Story */}
        <div className="grid grid-cols-1 gap-8 mb-12 lg:grid-cols-2">
          <div data-aos="fade-right">
            <h2 className="mb-4 text-2xl font-bold text-white">Our Story</h2>
            <p className="mb-4 leading-relaxed text-gray-400">
              KwetuShop was founded in 2020 with a simple mission: to make quality products accessible 
              to everyone in Kenya. What started as a small online store has grown into one of the country's 
              most trusted e-commerce platforms.
            </p>
            <p className="mb-4 leading-relaxed text-gray-400">
              We believe in providing exceptional value, outstanding customer service, and a seamless 
              shopping experience. Our team works tirelessly to curate the best products at competitive 
              prices, ensuring that our customers always find what they're looking for.
            </p>
            <p className="leading-relaxed text-gray-400">
              Today, we serve thousands of happy customers across all 47 counties in Kenya, and we're 
              just getting started. We're committed to growing with our community and continuing to 
              deliver the quality you deserve.
            </p>
          </div>
          <div className="space-y-4" data-aos="fade-left">
            <img 
              src={aboutImages.store}
              alt="Our Store"
              className="rounded-xl about-card"
            />
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={aboutImages.team}
                alt="Our Team"
                className="rounded-xl about-card"
              />
              <img 
                src={aboutImages.shipping}
                alt="Our Shipping"
                className="rounded-xl about-card"
              />
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center text-white">Our Values</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard 
              icon={FiHeart}
              title="Customer First"
              description="We prioritize our customers' needs and satisfaction above all else."
              delay={100}
            />
            <ValueCard 
              icon={FiShield}
              title="Trust & Security"
              description="Your data and transactions are always safe and secure with us."
              delay={150}
            />
            <ValueCard 
              icon={FiTruck}
              title="Fast Delivery"
              description="We ensure your orders reach you quickly and in perfect condition."
              delay={200}
            />
            <ValueCard 
              icon={FiAward}
              title="Quality Assured"
              description="Every product we sell meets our strict quality standards."
              delay={250}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12 sm:grid-cols-4">
          <div className="p-6 text-center about-card rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">50K+</div>
            <p className="text-xs text-gray-400">Happy Customers</p>
          </div>
          <div className="p-6 text-center about-card rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">10K+</div>
            <p className="text-xs text-gray-400">Products</p>
          </div>
          <div className="p-6 text-center about-card rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">47</div>
            <p className="text-xs text-gray-400">Counties Served</p>
          </div>
          <div className="p-6 text-center about-card rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">24/7</div>
            <p className="text-xs text-gray-400">Support</p>
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center text-white">Meet Our Team</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <TeamMember 
              name="John Doe"
              role="Founder & CEO"
              image="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
              delay={100}
            />
            <TeamMember 
              name="Jane Smith"
              role="Operations Manager"
              image="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
              delay={150}
            />
            <TeamMember 
              name="Mike Johnson"
              role="Customer Support"
              image="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
              delay={200}
            />
            <TeamMember 
              name="Sarah Williams"
              role="Marketing Lead"
              image="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
              delay={250}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 text-center about-card rounded-xl">
          <h2 className="mb-3 text-2xl font-bold text-white">Ready to start shopping?</h2>
          <p className="mb-6 text-gray-400">Join thousands of happy customers today</p>
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Shop Now
            <BsArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;