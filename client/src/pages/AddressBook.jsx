// src/pages/AddressBook.jsx - COMPLETE with Yellow-Orange Theme
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
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const addressHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

// Address Form Component
const AddressForm = ({ address, setAddress, errors, isEditing, onSave, onCancel }) => {
  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
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
                    checked={address.type === type}
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
              value={address.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-0.5 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="07XX XXX XXX"
            />
            {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={address.email}
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
              value={address.addressLine}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 ${errors.addressLine ? 'border-red-500' : ''}`}
              placeholder="Street address, P.O. Box"
            />
            {errors.addressLine && <p className="mt-0.5 text-xs text-red-500">{errors.addressLine}</p>}
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">City *</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 ${errors.city ? 'border-red-500' : ''}`}
              placeholder="Nairobi"
            />
            {errors.city && <p className="mt-0.5 text-xs text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">State/County</label>
            <input
              type="text"
              name="state"
              value={address.state}
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
              value={address.postalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              placeholder="00100"
            />
          </div>

          <div>
            <label className="block mb-1 text-[10px] text-gray-400">Country</label>
            <select
              name="country"
              value={address.country}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
            >
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
            </select>
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
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya'
  });
  const [errors, setErrors] = useState({});

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

  // Load addresses
  useEffect(() => {
    const savedAddresses = localStorage.getItem('addresses');
    let addressesData = savedAddresses ? JSON.parse(savedAddresses) : [];
    
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
          isDefault: false
        }
      ];
      localStorage.setItem('addresses', JSON.stringify(addressesData));
    }
    
    setTimeout(() => {
      setAddresses(addressesData);
      setLoading(false);
      setInitialLoad(false);
    }, 500);
  }, []);

  const saveAddresses = (newAddresses) => {
    setAddresses(newAddresses);
    localStorage.setItem('addresses', JSON.stringify(newAddresses));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!addressForm.fullName.trim()) newErrors.fullName = 'Full name required';
    if (!addressForm.phone.trim()) newErrors.phone = 'Phone number required';
    if (!addressForm.addressLine.trim()) newErrors.addressLine = 'Address required';
    if (!addressForm.city.trim()) newErrors.city = 'City required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAddress = () => {
    if (!validateForm()) return;
    
    const newAddress = {
      ...addressForm,
      id: Date.now().toString(),
      isDefault: addresses.length === 0
    };
    
    const updatedAddresses = [...addresses, newAddress];
    saveAddresses(updatedAddresses);
    setShowForm(false);
    setAddressForm({
      type: 'home',
      fullName: '',
      phone: '',
      email: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Kenya'
    });
    toast.success('Address added successfully');
  };

  const handleEditAddress = () => {
    if (!validateForm()) return;
    
    const updatedAddresses = addresses.map(addr => 
      addr.id === editingAddress.id ? { ...addressForm, id: addr.id, isDefault: addr.isDefault } : addr
    );
    saveAddresses(updatedAddresses);
    setEditingAddress(null);
    setShowForm(false);
    setAddressForm({
      type: 'home',
      fullName: '',
      phone: '',
      email: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Kenya'
    });
    toast.success('Address updated successfully');
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const addressToDelete = addresses.find(addr => addr.id === id);
      let updatedAddresses = addresses.filter(addr => addr.id !== id);
      
      if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      saveAddresses(updatedAddresses);
      toast.success('Address deleted successfully');
    }
  };

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(updatedAddresses);
    toast.success('Default address updated');
  };

  const openEditForm = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setAddressForm({
      type: 'home',
      fullName: '',
      phone: '',
      email: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Kenya'
    });
    setErrors({});
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="ADDRESS BOOK" 
          subtitle="Loading your addresses..."
          image={addressHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading addresses..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="ADDRESS BOOK" 
        subtitle="Manage your shipping addresses"
        image={addressHeaderImage}
      />

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
              address={addressForm}
              setAddress={setAddressForm}
              errors={errors}
              isEditing={!!editingAddress}
              onSave={editingAddress ? handleEditAddress : handleAddAddress}
              onCancel={cancelForm}
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
                onEdit={openEditForm}
                onDelete={handleDeleteAddress}
              />
            ))}
          </div>
        ) : (
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