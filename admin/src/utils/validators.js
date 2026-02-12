// src/utils/validators.js

// --- Basic Utility Validators ---

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// --- Application-Specific Validators ---

/**
 * Validates product data fields.
 * NOTE: Images/Files should be checked separately in the form component 
 * as their validation involves client-side state (filesToUpload).
 */
export const validateProduct = (product) => {
  const errors = {};
  
  // 1. Name Check
  if (!product.name?.trim()) {
    errors.name = 'Product name is required';
  } else if (product.name.length < 3) {
    errors.name = 'Product name must be at least 3 characters';
  }
  
  // 2. Price Check
  if (!product.price || product.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  // 3. Category Check (FIXED: Added this required check)
  if (!product.category?.trim()) {
      errors.category = 'Category is required';
  }
  
  // 4. Stock Check
  // Note: Using 'stock' property in the form state, even if the backend uses 'quantity'.
  if (product.stock === undefined || product.stock === null || product.stock < 0) {
    errors.stock = 'Stock must be a non-negative number';
  }

  // 5. Description Check (FIXED: Added presence check)
  if (!product.description?.trim()) {
      errors.description = 'Product description is required';
  } else if (product.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }
  
  // 6. Dimensions (Optional sanity check)
  if (product.dimensions) {
      const { length, width, height } = product.dimensions;
      if ((length && length < 0) || (width && width < 0) || (height && height < 0)) {
          errors.dimensions = 'Dimensions must be non-negative values.';
      }
  }
  
  return errors;
};


export const validateOrder = (order) => {
  const errors = {};
  
  if (!order.customerName?.trim()) {
    errors.customerName = 'Customer name is required';
  }
  
  if (!isValidEmail(order.customerEmail)) {
    errors.customerEmail = 'Valid email is required';
  }
  
  if (!order.shippingAddress?.trim()) {
    errors.shippingAddress = 'Shipping address is required';
  }
  
  return errors;
};

export const validateUser = (user) => {
  const errors = {};
  
  if (!user.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!isValidEmail(user.email)) {
    errors.email = 'Valid email is required';
  }
  
  // Only validate password complexity if it's being set/updated
  if (user.password && user.password.trim() && !isValidPassword(user.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }
  
  if (user.phone && user.phone.trim() && !isValidPhone(user.phone)) {
    errors.phone = 'Valid phone number is required';
  }
  
  return errors;
};