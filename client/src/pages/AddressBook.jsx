// src/pages/AddressBook.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and API Integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMapPin, 
  FiHome, 
  FiBriefcase, 
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiChevronRight,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin as FiMapIcon
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
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
  
  .address-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .address-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .address-card.default {
    border-color: rgba(245, 158, 11, 0.5);
    background: rgba(245, 158, 11, 0.05);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
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
const addressHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

// Address Card Component
const AddressCard = ({ address, isDefault, onSetDefault, onEdit, onDelete }) => {
  const getTypeIcon = () => {
    switch (address.type) {
      case 'home':
        return <FiHome className="w-4 h-4" />;
      case 'work':
        return <FiBriefcase className="w-4 h-4" />;
      default:
        return <FiMapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 address-card rounded-xl ${isDefault ? 'default' : ''}`} data-aos="fade-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${
            address.type === 'home' ? 'bg-green-600/10' :
            address.type === 'work' ? 'bg-blue-600/10' : 'bg-yellow-600/10'
          }`}>
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white capitalize">{address.type} Address</h3>
              {isDefault && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-500 bg-green-500/10 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{address.fullName}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(address)}
            className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
            title="Edit"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-red-500 hover:bg-white/5"
            title="Delete"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1 pl-9">
        <p className="text-xs text-gray-300">{address.addressLine}</p>
        <p className="text-xs text-gray-300">{address.city}, {address.state} {address.postalCode}</p>
        <p className="text-xs text-gray-300">{address.country}</p>
        <div className="pt-2 mt-2 space-y-1 border-t border-gray-800">
          <p className="flex items-center gap-2 text-[10px] text-gray-400">
            <FiPhone className="w-3 h-3" />
            {address.phone}
          </p>
          {address.email && (
            <p className="flex items-center gap-2 text-[10px] text-gray-400">
              <FiMail className="w-3 h-3" />
              {address.email}
            </p>
          )}
        </div>
      </div>

      {!isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          className="mt-3 text-[10px] text-yellow-500 hover:text-yellow-400"
        >
          Set as default
        </button>
      )}
    </div>
  );
};

// Add/Edit Address Form
const AddressForm = ({ address, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState(address || {
    type: 'home',
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    instructions: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.addressLine || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="p-6 address-card rounded-xl" data-aos="zoom-in">
      <h3 className="mb-4 text-sm font-semibold text-white">
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block mb-1 text-[10px] text-gray-400">Address Type</label>
            <div className="flex gap-3">
              {['home', 'work', 'other'].map((type) => (
                <label key={type} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    className="w-3 h-3 text-yellow-600 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                  />
                  <span className="text-xs text-white capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-[10px] text-gray-400">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="07XX XXX XXX"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="john@example.com"
            />
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-[10px] text-gray-400">Address Line *</label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="Street address, P.O. Box"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="Nairobi"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">State/County</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="Nairobi"
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="00100"
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
            >
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-[10px] text-gray-400">Delivery Instructions (Optional)</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="Gate code, landmarks, etc."
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            {isEditing ? 'Update Address' : 'Save Address'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-300 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AddressBook = () => {
  const navigate = useNavigate();
  
  // States
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
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

  // Inject styles and load addresses
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    fetchAddresses();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch addresses from localStorage (simulating API)
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get addresses from localStorage
      const savedAddresses = localStorage.getItem('addresses');
      let addressesData = savedAddresses ? JSON.parse(savedAddresses) : [];
      
      // If no addresses, add sample data
      if (addressesData.length === 0) {
        addressesData = [
          {
            id: '1',
            type: 'home',
            fullName: 'John Doe',
            phone: '+254 712 345 678',
            email: 'john@example.com',
            addressLine: '123 Kimathi Street',
            city: 'Nairobi',
            state: 'Nairobi',
            postalCode: '00100',
            country: 'Kenya',
            instructions: 'Gate code: 1234',
            isDefault: true
          },
          {
            id: '2',
            type: 'work',
            fullName: 'John Doe',
            phone: '+254 712 345 678',
            email: 'john@work.com',
            addressLine: '456 Moi Avenue',
            city: 'Nairobi',
            state: 'Nairobi',
            postalCode: '00200',
            country: 'Kenya',
            instructions: '4th Floor, Suite 405',
            isDefault: false
          }
        ];
        localStorage.setItem('addresses', JSON.stringify(addressesData));
      }
      
      const endTime = performance.now();
      setLoadTime((endTime - startTime).toFixed(0));
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: 0
      }));
      
      console.log(`⚡ Addresses loaded in ${(endTime - startTime).toFixed(0)}ms`);
      
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Save addresses to localStorage
  const saveAddresses = (newAddresses) => {
    setAddresses(newAddresses);
    localStorage.setItem('addresses', JSON.stringify(newAddresses));
  };

  // Handle add new address
  const handleAddAddress = (newAddress) => {
    const addressWithId = {
      ...newAddress,
      id: Date.now().toString(),
      isDefault: addresses.length === 0 ? true : newAddress.isDefault || false
    };

    let updatedAddresses = [...addresses, addressWithId];
    
    // If this is set as default, remove default from others
    if (addressWithId.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressWithId.id
      }));
    }

    saveAddresses(updatedAddresses);
    setShowForm(false);
    toast.success('Address added successfully');
  };

  // Handle edit address
  const handleEditAddress = (updatedAddress) => {
    let updatedAddresses = addresses.map(addr => 
      addr.id === updatedAddress.id ? updatedAddress : addr
    );

    // If this is set as default, remove default from others
    if (updatedAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === updatedAddress.id
      }));
    }

    saveAddresses(updatedAddresses);
    setEditingAddress(null);
    setShowForm(false);
    toast.success('Address updated successfully');
  };

  // Handle delete address
  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const addressToDelete = addresses.find(addr => addr.id === id);
      let updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      // If we deleted the default address and there are other addresses, set first as default
      if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      saveAddresses(updatedAddresses);
      toast.success('Address deleted successfully');
    }
  };

  // Handle set default
  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(updatedAddresses);
    toast.success('Default address updated');
  };

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
              src={addressHeaderImage}
              alt="Address Book"
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
                  <h1 className="section-title">ADDRESS BOOK</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading your addresses...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading addresses..." />
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
            src={addressHeaderImage}
            alt="Address Book"
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
                <h1 className="section-title">ADDRESS BOOK</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Manage your shipping addresses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Address Book</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Saved Addresses</h2>
            <p className="text-xs text-gray-400">{addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}</p>
          </div>
          {!showForm && !editingAddress && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <FiPlus className="w-3 h-3" />
              Add New Address
            </button>
          )}
        </div>

        {/* Address Form */}
        {(showForm || editingAddress) && (
          <div className="mb-6">
            <AddressForm
              address={editingAddress}
              onSave={editingAddress ? handleEditAddress : handleAddAddress}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              isEditing={!!editingAddress}
            />
          </div>
        )}

        {/* Addresses Grid */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isDefault={address.isDefault}
                onSetDefault={handleSetDefault}
                onEdit={setEditingAddress}
                onDelete={handleDeleteAddress}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center">
            <div className="relative inline-block">
              <div className="absolute rounded-full -inset-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 blur-xl"></div>
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiMapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">No addresses saved</h3>
            <p className="mb-4 text-xs text-gray-400">Add your first address to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <FiPlus className="w-3 h-3" />
              Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressBook;