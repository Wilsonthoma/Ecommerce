// client/src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { AppContext } from './AppContext'; // ✅ Import AppContext directly

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // ✅ Use AppContext directly
  const appContext = useContext(AppContext);
  const { isLoggedIn, userData } = appContext || {};
  
  const [settings, setSettings] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!isLoggedIn && !!userData);
  }, [isLoggedIn, userData]);

  // Fetch global settings
  const fetchGlobalSettings = async () => {
    try {
      const response = await settingsService.getPublicSettings();
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching global settings:', err);
      return null;
    }
  };

  // Fetch user-specific settings
  const fetchUserSettings = async () => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await settingsService.getUserSettings();
      if (response.success) {
        return response.settings;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user settings:', err);
      return null;
    }
  };

  // Load all settings
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [global, user] = await Promise.all([
        fetchGlobalSettings(),
        fetchUserSettings()
      ]);
      
      setSettings(global);
      setUserSettings(user);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user settings
  const updateUserSettings = async (section, data) => {
    try {
      const response = await settingsService.updateUserSettings(section, data);
      if (response.success) {
        setUserSettings(prev => ({
          ...prev,
          [section]: {
            ...prev?.[section],
            ...data
          }
        }));
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      console.error('Error updating user settings:', err);
      return { success: false, error: err.message };
    }
  };

  // Get a setting value (global or user)
  const get = (path, defaultValue) => {
    if (!settings) return defaultValue;
    
    const keys = path.split('.');
    let result = settings;
    
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };

  // Get user setting
  const getUser = (path, defaultValue) => {
    if (!userSettings) return defaultValue;
    
    const keys = path.split('.');
    let result = userSettings;
    
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };

  // Get theme setting (user overrides global)
  const getTheme = () => {
    const userTheme = getUser('display.theme', null);
    if (userTheme && userTheme !== 'system') return userTheme;
    return get('theme', 'dark');
  };

  // Get currency setting (user overrides global)
  const getCurrency = () => {
    const userCurrency = getUser('display.currency', null);
    if (userCurrency) return userCurrency;
    return get('currency', 'KES');
  };

  // Get items per page (user overrides global)
  const getItemsPerPage = () => {
    const userItems = getUser('display.itemsPerPage', null);
    if (userItems) return userItems;
    return get('productsPerPage', 12);
  };

  useEffect(() => {
    loadSettings();
  }, [isAuthenticated]);

  const value = {
    settings,
    userSettings,
    loading,
    error,
    refresh: loadSettings,
    get,
    getUser,
    getTheme,
    getCurrency,
    getItemsPerPage,
    updateUserSettings,
    isAuthenticated
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};