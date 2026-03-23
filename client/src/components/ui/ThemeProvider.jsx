// src/components/ui/ThemeProvider.jsx
import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export const ThemeProvider = ({ children }) => {
  const { getTheme, get, loading } = useSettings();

  useEffect(() => {
    if (loading) return;
    
    const theme = getTheme();
    const primaryColor = get('primaryColor', '#F59E0B');
    const secondaryColor = get('secondaryColor', '#EA580C');
    
    // Apply theme class to body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-white');
    }
    
    // Set CSS variables for colors
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-primary-dark', darkenColor(primaryColor, 0.2));
    document.documentElement.style.setProperty('--color-primary-light', lightenColor(primaryColor, 0.2));
  }, [loading, getTheme, get]);

  // Helper function to darken color
  const darkenColor = (color, percent) => {
    // Simple color darkening - you can use a library like color or implement properly
    return color;
  };

  // Helper function to lighten color
  const lightenColor = (color, percent) => {
    return color;
  };

  return <>{children}</>;
};

export default ThemeProvider;