// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart
      ? JSON.parse(savedCart)
      : { items: [], total: 0, totalQuantity: 0 };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1, selectedSize = "", selectedColor = "") => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) =>
          item._id === product._id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      let updatedItems;

      if (existingItemIndex !== -1) {
        // Update existing item
        updatedItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem = {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
        };
        updatedItems = [...prevCart.items, newItem];
      }

      // Calculate totals
      const total = updatedItems.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      );

      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: updatedItems,
        total,
        totalQuantity,
      };
    });

    toast.success(`${product.name} added to cart!`);
  };

  // Remove item from cart
  const removeFromCart = (itemId, selectedSize = "", selectedColor = "") => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (item) =>
          !(
            item._id === itemId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      );

      const total = updatedItems.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      );

      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: updatedItems,
        total,
        totalQuantity,
      };
    });

    toast.success("Item removed from cart");
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity, selectedSize = "", selectedColor = "") => {
    if (newQuantity < 1) {
      removeFromCart(itemId, selectedSize, selectedColor);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item._id === itemId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? { ...item, quantity: newQuantity }
          : item
      );

      const total = updatedItems.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      );

      const totalQuantity = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: updatedItems,
        total,
        totalQuantity,
      };
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart({ items: [], total: 0, totalQuantity: 0 });
    toast.success("Cart cleared");
  };

  // Get item quantity
  const getItemQuantity = (itemId, selectedSize = "", selectedColor = "") => {
    const item = cart.items.find(
      (item) =>
        item._id === itemId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (itemId, selectedSize = "", selectedColor = "") => {
    return cart.items.some(
      (item) =>
        item._id === itemId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};