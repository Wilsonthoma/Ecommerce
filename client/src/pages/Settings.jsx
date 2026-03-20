// src/pages/Settings.jsx - Complete Real Implementation
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiGlobe, 
  FiCreditCard,
  FiMapPin,
  FiSave,
  FiLogOut,
  FiEye,
  FiEyeOff,
  FiChevronRight,
  FiShoppingBag,
  FiHeart,
  FiStar,
  FiMessageSquare,
  FiShield,
  FiMoon,
  FiSun,
  FiMonitor,
  FiMail,
  FiPhone,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import { AppContext } from '../context/AppContext';
import { clientSettingsService } from '../services/client/settings';

// Header image
const settingsHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

const Settings = () => {
  const navigate = useNavigate();
  const { userData, refreshUserData, logout } = useContext(AppContext);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    language: 'en',
    timezone: 'Africa/Nairobi'
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email: {
      orderUpdates: true,
      promotions: false,
      newsletter: false,
      accountAlerts: true
    },
    sms: {
      orderUpdates: false,
      deliveryAlerts: true
    },
    push: {
      enabled: false,
      orderUpdates: true
    }
  });
  
  // Display settings
  const [display, setDisplay] = useState({
    theme: 'dark',
    compactView: false,
    itemsPerPage: 24,
    currency: 'KES',
    showPricesWithTax: false
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showOrderHistory: true,
    allowDataCollection: true
  });
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Load profile data from userData
        if (userData) {
          setProfile({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            language: userData.language || 'en',
            timezone: userData.timezone || 'Africa/Nairobi'
          });
        }
        
        // Load settings from API
        const response = await clientSettingsService.getAllSettings();
        
        if (response.success && response.settings) {
          const settings = response.settings;
          
          if (settings.profile) {
            setProfile(prev => ({ ...prev, ...settings.profile }));
          }
          
          if (settings.notifications) {
            setNotifications(prev => ({ ...prev, ...settings.notifications }));
          }
          
          if (settings.display) {
            setDisplay(prev => ({ ...prev, ...settings.display }));
          }
          
          if (settings.privacy) {
            setPrivacy(prev => ({ ...prev, ...settings.privacy }));
          }
        }
        
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [userData]);

  // Save profile settings
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await clientSettingsService.updateProfileSettings({
        displayName: profile.name,
        bio: profile.bio,
        phoneNumber: profile.phone,
        language: profile.language,
        timezone: profile.timezone
      });
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        await refreshUserData();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const response = await clientSettingsService.updateNotificationSettings(notifications);
      
      if (response.success) {
        toast.success('Notification preferences saved!');
      } else {
        toast.error(response.message || 'Failed to save notification settings');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Save display settings
  const handleSaveDisplay = async () => {
    setSaving(true);
    try {
      const response = await clientSettingsService.updateDisplaySettings(display);
      
      if (response.success) {
        toast.success('Display preferences saved!');
        // Apply theme change
        applyTheme(display.theme);
      } else {
        toast.error(response.message || 'Failed to save display settings');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save display settings');
    } finally {
      setSaving(false);
    }
  };

  // Save privacy settings
  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      const response = await clientSettingsService.updatePrivacySettings(privacy);
      
      if (response.success) {
        toast.success('Privacy settings saved!');
      } else {
        toast.error(response.message || 'Failed to save privacy settings');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      const response = await clientSettingsService.changePassword({
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    
    setDeleting(true);
    try {
      const response = await clientSettingsService.deleteAccount(deletePassword);
      
      if (response.success) {
        toast.success('Account deleted successfully');
        await logout();
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to delete account');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  // Apply theme
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'display', label: 'Display', icon: FiGlobe },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
    { id: 'security', label: 'Security', icon: FiLock }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="SETTINGS" 
          subtitle="Loading your settings..."
          image={settingsHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="SETTINGS" 
        subtitle="Manage your account preferences"
        image={settingsHeaderImage}
      />

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Settings</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <div className="p-4 border border-gray-800 settings-card rounded-xl bg-gray-900/50">
              <h3 className="mb-3 text-sm font-semibold text-white">Settings</h3>
              <div className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-500 border border-yellow-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center justify-center w-full gap-2 p-3 text-xs font-medium text-red-500 transition-colors border border-red-500/20 rounded-xl hover:bg-red-500/10"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Main Settings Area */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                    <FiUser className="text-yellow-500" />
                    Profile Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                        className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Email Address</label>
                      <input 
                        type="email" 
                        value={profile.email} 
                        disabled
                        className="w-full px-3 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg cursor-not-allowed bg-gray-800/50" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                        className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50" 
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Bio</label>
                      <textarea 
                        value={profile.bio} 
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                        rows="3"
                        className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                        placeholder="Tell us a little about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-xs text-gray-400">Language</label>
                        <select 
                          value={profile.language} 
                          onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                          className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                        >
                          <option value="en">English</option>
                          <option value="sw">Swahili</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-gray-400">Timezone</label>
                        <select 
                          value={profile.timezone} 
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                          className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                        >
                          <option value="Africa/Nairobi">Nairobi (EAT)</option>
                          <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={saving} 
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                    >
                      {saving ? <><div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>Saving...</> : <><FiSave className="w-3 h-3" />Save Changes</>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                    <FiBell className="text-yellow-500" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Order Updates</span>
                      <input type="checkbox" checked={notifications.email.orderUpdates} onChange={(e) => setNotifications({ ...notifications, email: { ...notifications.email, orderUpdates: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Promotions & Offers</span>
                      <input type="checkbox" checked={notifications.email.promotions} onChange={(e) => setNotifications({ ...notifications, email: { ...notifications.email, promotions: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Newsletter</span>
                      <input type="checkbox" checked={notifications.email.newsletter} onChange={(e) => setNotifications({ ...notifications, email: { ...notifications.email, newsletter: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Account Alerts</span>
                      <input type="checkbox" checked={notifications.email.accountAlerts} onChange={(e) => setNotifications({ ...notifications, email: { ...notifications.email, accountAlerts: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                  </div>
                </div>

                <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up" data-aos-delay="100">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                    <FiPhone className="text-yellow-500" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Order Updates</span>
                      <input type="checkbox" checked={notifications.sms.orderUpdates} onChange={(e) => setNotifications({ ...notifications, sms: { ...notifications.sms, orderUpdates: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                      <span className="text-sm text-white">Delivery Alerts</span>
                      <input type="checkbox" checked={notifications.sms.deliveryAlerts} onChange={(e) => setNotifications({ ...notifications, sms: { ...notifications.sms, deliveryAlerts: e.target.checked } })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                    </label>
                  </div>
                  <button onClick={handleSaveNotifications} disabled={saving} className="flex items-center gap-2 px-4 py-2 mt-4 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                  <FiGlobe className="text-yellow-500" />
                  Display Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setDisplay({ ...display, theme: 'dark' })} className={`flex items-center justify-center gap-2 p-2 text-sm rounded-lg border transition-all ${display.theme === 'dark' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        <FiMoon className="w-4 h-4" /> Dark
                      </button>
                      <button onClick={() => setDisplay({ ...display, theme: 'light' })} className={`flex items-center justify-center gap-2 p-2 text-sm rounded-lg border transition-all ${display.theme === 'light' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        <FiSun className="w-4 h-4" /> Light
                      </button>
                      <button onClick={() => setDisplay({ ...display, theme: 'system' })} className={`flex items-center justify-center gap-2 p-2 text-sm rounded-lg border transition-all ${display.theme === 'system' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        <FiMonitor className="w-4 h-4" /> System
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                    <span className="text-sm text-white">Compact View</span>
                    <input type="checkbox" checked={display.compactView} onChange={(e) => setDisplay({ ...display, compactView: e.target.checked })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                  </label>
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Items Per Page</label>
                    <select value={display.itemsPerPage} onChange={(e) => setDisplay({ ...display, itemsPerPage: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50">
                      <option value={12}>12 items</option>
                      <option value={24}>24 items</option>
                      <option value={48}>48 items</option>
                      <option value={96}>96 items</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Currency</label>
                    <select value={display.currency} onChange={(e) => setDisplay({ ...display, currency: e.target.value })} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50">
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <button onClick={handleSaveDisplay} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                  <FiShield className="text-yellow-500" />
                  Privacy Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs text-gray-400">Profile Visibility</label>
                    <select value={privacy.profileVisibility} onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50">
                      <option value="public">Public - Everyone can see</option>
                      <option value="contacts">Contacts - Only logged in users</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                    <span className="text-sm text-white">Show Email on Profile</span>
                    <input type="checkbox" checked={privacy.showEmail} onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                    <span className="text-sm text-white">Show Phone on Profile</span>
                    <input type="checkbox" checked={privacy.showPhone} onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                    <span className="text-sm text-white">Show Order History</span>
                    <input type="checkbox" checked={privacy.showOrderHistory} onChange={(e) => setPrivacy({ ...privacy, showOrderHistory: e.target.checked })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50">
                    <span className="text-sm text-white">Allow Data Collection</span>
                    <input type="checkbox" checked={privacy.allowDataCollection} onChange={(e) => setPrivacy({ ...privacy, allowDataCollection: e.target.checked })} className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded" />
                  </label>
                  <button onClick={handleSavePrivacy} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-6 border border-gray-800 settings-card rounded-xl bg-gray-900/50" data-aos="fade-up">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                    <FiLock className="text-yellow-500" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Current Password</label>
                      <div className="relative">
                        <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50" />
                        <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white">
                          {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">New Password</label>
                      <div className="relative">
                        <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50" />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white">
                          {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Confirm New Password</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50" />
                        <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white">
                          {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleChangePassword} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50">
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>

                <div className="p-6 border settings-card rounded-xl bg-gray-900/50 border-red-500/20" data-aos="fade-up" data-aos-delay="100">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-red-500">
                    <FiAlertCircle className="text-red-500" />
                    Danger Zone
                  </h3>
                  <p className="mb-4 text-sm text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 text-xs font-medium text-red-500 transition-all border rounded-lg border-red-500/50 hover:bg-red-500/10">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 border border-gray-800 rounded-2xl bg-gray-900/95">
            <h3 className="mb-2 text-lg font-bold text-red-500">Delete Account</h3>
            <p className="mb-4 text-sm text-gray-400">This action cannot be undone. This will permanently delete your account and remove all your data.</p>
            <div className="mb-4">
              <label className="block mb-1 text-xs text-gray-400">Enter your password to confirm</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-red-500/50" placeholder="Your password" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 px-4 py-2 text-xs font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className="flex-1 px-4 py-2 text-xs font-medium text-gray-400 transition-all border border-gray-700 rounded-lg hover:text-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;