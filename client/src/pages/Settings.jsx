// client/src/pages/Settings.jsx - FIXED (removed unused imports)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiMonitor, 
  FiBell, 
  FiLock, 
  FiChevronRight,
  FiSave,
  FiGlobe,
  FiClock,
  FiSmartphone,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi';
import { MdOutlineDarkMode, MdOutlineLightMode, MdOutlineComputer } from 'react-icons/md';
import { HiOutlineCurrencyDollar, HiOutlineViewGrid } from 'react-icons/hi';
import { BsPersonBadge, BsTelephone } from 'react-icons/bs';
// Removed unused imports: RiSecurePaymentLine, RiCookieLine
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Header image
const settingsHeaderImage = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600";

const Settings = () => {
  const navigate = useNavigate();
  const { userSettings, updateUserSettings, loading, refresh, get } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

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

  const [profile, setProfile] = useState({
    displayName: userSettings?.profile?.displayName || '',
    bio: userSettings?.profile?.bio || '',
    phoneNumber: userSettings?.profile?.phoneNumber || '',
    language: userSettings?.profile?.language || 'en',
    timezone: userSettings?.profile?.timezone || 'Africa/Nairobi'
  });

  const [display, setDisplay] = useState({
    theme: userSettings?.display?.theme || 'dark',
    compactView: userSettings?.display?.compactView || false,
    itemsPerPage: userSettings?.display?.itemsPerPage || 24,
    currency: userSettings?.display?.currency || 'KES',
    showPricesWithTax: userSettings?.display?.showPricesWithTax || false
  });

  const [notifications, setNotifications] = useState({
    email: {
      orderUpdates: userSettings?.notifications?.email?.orderUpdates ?? true,
      promotions: userSettings?.notifications?.email?.promotions ?? false,
      newsletter: userSettings?.notifications?.email?.newsletter ?? false
    },
    sms: {
      orderUpdates: userSettings?.notifications?.sms?.orderUpdates ?? false,
      deliveryAlerts: userSettings?.notifications?.sms?.deliveryAlerts ?? true
    },
    frequency: userSettings?.notifications?.frequency || 'instant'
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: userSettings?.privacy?.profileVisibility || 'public',
    showEmail: userSettings?.privacy?.showEmail || false,
    showPhone: userSettings?.privacy?.showPhone || false,
    showOrderHistory: userSettings?.privacy?.showOrderHistory ?? true,
    allowDataCollection: userSettings?.privacy?.allowDataCollection ?? true
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    const result = await updateUserSettings('profile', profile);
    if (result.success) {
      toast.success('Profile settings saved');
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const handleSaveDisplay = async () => {
    setSaving(true);
    const result = await updateUserSettings('display', display);
    if (result.success) {
      toast.success('Display preferences saved');
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    const result = await updateUserSettings('notifications', notifications);
    if (result.success) {
      toast.success('Notification preferences saved');
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    const result = await updateUserSettings('privacy', privacy);
    if (result.success) {
      toast.success('Privacy settings saved');
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'display', name: 'Display', icon: FiMonitor },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'privacy', name: 'Privacy', icon: FiLock }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="ACCOUNT SETTINGS" 
          subtitle="Loading your preferences..."
          image={settingsHeaderImage}
        />
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <div className="bg-gray-800 h-96 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="ACCOUNT SETTINGS" 
        subtitle="Manage your preferences"
        image={settingsHeaderImage}
      />

      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Settings</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="lg:w-72" data-aos="fade-right">
            <div className="sticky p-4 bg-gray-800 border border-gray-700 rounded-xl top-20">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Settings</h3>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-500'}`} />
                      {tab.name}
                      {isActive && (
                        <span className="ml-auto">
                          <FiChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1" data-aos="fade-left">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FiUser className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                    <p className="text-sm text-gray-400">Update your personal details</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <FiUser className="inline w-4 h-4 mr-2" />
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="How you want to be seen"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <BsPersonBadge className="inline w-4 h-4 mr-2" />
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <BsTelephone className="inline w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="+254..."
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <FiGlobe className="inline w-4 h-4 mr-2" />
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({...profile, language: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <FiClock className="inline w-4 h-4 mr-2" />
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="Africa/Nairobi">Nairobi (EAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Display Tab */}
            {activeTab === 'display' && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FiMonitor className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Display Preferences</h2>
                    <p className="text-sm text-gray-400">Customize how you see the site</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-300">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setDisplay({...display, theme: 'light'})}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                          display.theme === 'light'
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        <MdOutlineLightMode className="w-4 h-4" />
                        <span className="text-sm">Light</span>
                      </button>
                      <button
                        onClick={() => setDisplay({...display, theme: 'dark'})}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                          display.theme === 'dark'
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        <MdOutlineDarkMode className="w-4 h-4" />
                        <span className="text-sm">Dark</span>
                      </button>
                      <button
                        onClick={() => setDisplay({...display, theme: 'system'})}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                          display.theme === 'system'
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        <MdOutlineComputer className="w-4 h-4" />
                        <span className="text-sm">System</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                    <div>
                      <span className="text-white">Compact View</span>
                      <p className="text-xs text-gray-500">Show more items per page</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={display.compactView}
                        onChange={(e) => setDisplay({...display, compactView: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <HiOutlineViewGrid className="inline w-4 h-4 mr-2" />
                      Items Per Page
                    </label>
                    <select
                      value={display.itemsPerPage}
                      onChange={(e) => setDisplay({...display, itemsPerPage: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value={12}>12 items</option>
                      <option value={24}>24 items</option>
                      <option value={48}>48 items</option>
                      <option value={96}>96 items</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <HiOutlineCurrencyDollar className="inline w-4 h-4 mr-2" />
                      Currency
                    </label>
                    <select
                      value={display.currency}
                      onChange={(e) => setDisplay({...display, currency: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                    <div>
                      <span className="text-white">Show prices with tax included</span>
                      <p className="text-xs text-gray-500">Display final price including tax</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={display.showPricesWithTax}
                        onChange={(e) => setDisplay({...display, showPricesWithTax: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveDisplay}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Display Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FiBell className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                    <p className="text-sm text-gray-400">Choose how you want to be notified</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center gap-2 mb-3 font-medium text-white text-md">
                      <FiMail className="w-4 h-4 text-yellow-500" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Order Updates</span>
                        <input
                          type="checkbox"
                          checked={notifications.email.orderUpdates}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            email: {...notifications.email, orderUpdates: e.target.checked}
                          })}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Promotions & Deals</span>
                        <input
                          type="checkbox"
                          checked={notifications.email.promotions}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            email: {...notifications.email, promotions: e.target.checked}
                          })}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Newsletter</span>
                        <input
                          type="checkbox"
                          checked={notifications.email.newsletter}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            email: {...notifications.email, newsletter: e.target.checked}
                          })}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center gap-2 mb-3 font-medium text-white text-md">
                      <FiMessageSquare className="w-4 h-4 text-yellow-500" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Order Updates via SMS</span>
                        <input
                          type="checkbox"
                          checked={notifications.sms.orderUpdates}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            sms: {...notifications.sms, orderUpdates: e.target.checked}
                          })}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Delivery Alerts</span>
                        <input
                          type="checkbox"
                          checked={notifications.sms.deliveryAlerts}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            sms: {...notifications.sms, deliveryAlerts: e.target.checked}
                          })}
                          className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <FiClock className="inline w-4 h-4 mr-2" />
                      Notification Frequency
                    </label>
                    <select
                      value={notifications.frequency}
                      onChange={(e) => setNotifications({...notifications, frequency: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FiLock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Privacy Settings</h2>
                    <p className="text-sm text-gray-400">Control your privacy preferences</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      <FiUser className="inline w-4 h-4 mr-2" />
                      Profile Visibility
                    </label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                      className="w-full px-4 py-2.5 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="public">Public - Everyone can see your profile</option>
                      <option value="contacts">Contacts Only - Only people you follow</option>
                      <option value="private">Private - Only you can see your profile</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Show email on profile</span>
                      <input
                        type="checkbox"
                        checked={privacy.showEmail}
                        onChange={(e) => setPrivacy({...privacy, showEmail: e.target.checked})}
                        className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Show phone number on profile</span>
                      <input
                        type="checkbox"
                        checked={privacy.showPhone}
                        onChange={(e) => setPrivacy({...privacy, showPhone: e.target.checked})}
                        className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Show order history on profile</span>
                      <input
                        type="checkbox"
                        checked={privacy.showOrderHistory}
                        onChange={(e) => setPrivacy({...privacy, showOrderHistory: e.target.checked})}
                        className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Allow data collection for personalized experience</span>
                      <input
                        type="checkbox"
                        checked={privacy.allowDataCollection}
                        onChange={(e) => setPrivacy({...privacy, allowDataCollection: e.target.checked})}
                        className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save All Button (Optional) */}
        <div className="flex justify-center mt-8" data-aos="fade-up">
          <button
            onClick={() => {
              handleSaveProfile();
              handleSaveDisplay();
              handleSaveNotifications();
              handleSavePrivacy();
            }}
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 hover:shadow-yellow-500/25"
          >
            <FiSave className="w-5 h-5" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;