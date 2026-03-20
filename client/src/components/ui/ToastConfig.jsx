// src/components/ui/ToastConfig.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "dark",
  toastStyle: {
    backgroundColor: '#1F2937',
    color: '#fff',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
  },
  progressStyle: {
    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
  },
};

const ToastConfig = () => {
  return <ToastContainer {...toastConfig} />;
};

export default ToastConfig;