/**
 * Utility functions for handling image loading and errors
 */

// Local placeholder image (create a simple base64 encoded placeholder)
export const getPlaceholderImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik01MCA2MEM1MCA2Ni42Mjg0IDU1LjM3MTYgNzIgNjIgNzJDNjguNjI4NCA3MiA3NCA2Ni42Mjg0IDc0IDYwQzc0IDUzLjM3MTYgNjguNjI4NCA0OCA2MiA0OEM1NS4zNzE2IDQ4IDUwIDUzLjM3MTYgNTAgNjBaIiBmaWxsPSIjRENEQ0RDIi8+CjxwYXRoIGQ9Ik00Mi41IDEwMEwxMS4yNSAxMDBDMTEuMjUgMTAwIDE4LjUzOTEgNzkuMDMzNyAzMC41MzkxIDc5LjAzMzdDMzYuNDI0OCA3OS4wMzM3IDQxLjg3IDgzLjgxODQgNDIuNSAxMDBaIiBmaWxsPSIjRENEQ0RDIi8+CjxwYXRoIGQ9Ik0xMDcuNSAxMDBMMTM4Ljc1IDEwMEMxMzguNzUgMTAwIDEzMS40NjEgNzkuMDMzNyAxMTkuNDYxIDc5LjAzMzdDMTEzLjU3NSA3OS4wMzM3IDEwOC4xMyA4My44MTg0IDEwNy41IDEwMFoiIGZpbGw9IiNEQ0RDREMiLz4KPHBhdGggZD0iTTc1IDEyMEMzNS45MTUyIDEyMCA1IDEzMy45MTUyIDUgMTYwSDE0NUMxNDUgMTMzLjkxNTIgMTE0LjA4NSAxMjAgNzUgMTIwWiIgZmlsbD0iI0RDREJEQiIvPgo8L3N2Zz4K';
};

// Handle image loading errors
export const handleImageError = (event, placeholder = null) => {
  event.target.src = placeholder || getPlaceholderImage();
  event.target.onerror = null; // Prevent infinite loop
  event.target.style.objectFit = 'contain';
  event.target.style.backgroundColor = '#f9fafb';
};

// Get safe image URL
export const getSafeImageUrl = (url, options = {}) => {
  if (!url || url.trim() === '') {
    return getPlaceholderImage();
  }

  // Ensure URL is properly formatted
  if (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('/')) {
    return url;
  }

  // Handle relative paths
  if (url.startsWith('./') || url.startsWith('../')) {
    return url;
  }

  // If it's just a filename, assume it's in uploads
  if (!url.includes('/') && !url.startsWith('http')) {
    return `/uploads/${url}`;
  }

  return url;
};

// Preload images
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          resolve(); // Resolve anyway to prevent blocking
        };
        img.src = getSafeImageUrl(url);
      });
    })
  );
};

// Generate image alt text
export const generateImageAlt = (productName, index = 0) => {
  if (index === 0) {
    return `${productName} - Main product image`;
  }
  return `${productName} - Product image ${index + 1}`;
};