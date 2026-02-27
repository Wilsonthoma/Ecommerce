// src/pages/Checkout.jsx - COMPACT with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiHome,
  FiChevronRight,
  FiChevronLeft,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiTruck,
  FiShield,
  FiClock,
  FiPackage,
  FiCheckCircle,
  FiX,
  FiEdit2,
  FiPlus,
} from 'react-icons/fi';
import { BsArrowRight, BsCash, BsLightningCharge } from 'react-icons/bs';
import { IoFlashOutline } from 'react-icons/io5';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - UPDATED with yellow-orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .page-title {
    font-weight: 800;
    font-size: clamp(1.2rem, 3.5vw, 1.8rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .section-title {
    font-weight: 700;
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    letter-spacing: -0.02em;
    color: white;
  }
  
  /* COMPACT INPUT FIELDS */
  .input-field {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.4rem;
    padding: 0.4rem 0.6rem;
    color: white;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }
  
  .input-field:focus {
    border-color: #F59E0B;
    outline: none;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }
  
  .input-field::placeholder {
    color: #6B7280;
    font-size: 0.75rem;
  }
  
  /* COMPACT PAYMENT METHOD CARDS */
  .payment-method-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.6rem;
    padding: 0.6rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .payment-method-card:hover {
    border-color: #F59E0B;
    transform: translateY(-1px);
    box-shadow: 0 5px 15px -5px rgba(245, 158, 11, 0.3);
  }
  
  .payment-method-card.selected {
    border-color: #F59E0B;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
  }
  
  /* COMPACT ORDER SUMMARY CARD */
  .order-summary-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.6rem;
    padding: 0.8rem;
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
  }

  /* YELLOW-ORANGE GRADIENT BUTTONS */
  .btn-gradient {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .btn-gradient:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
  }

  .btn-gradient:active {
    transform: translateY(0);
  }

  .btn-gradient::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .btn-gradient:hover::after {
    left: 100%;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid rgba(75, 85, 99, 0.5);
    transition: all 0.3s ease;
  }

  .btn-outline:hover {
    border-color: #F59E0B;
    background: rgba(245, 158, 11, 0.1);
  }

  /* COMPACT LABELS */
  label {
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
    display: block;
  }

  /* COMPACT TEXT SIZES */
  .text-2xl {
    font-size: 1.2rem;
  }
  
  .text-lg {
    font-size: 0.95rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-xs {
    font-size: 0.65rem;
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

// Gradient for header - UPDATED to yellow-orange
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const checkoutHeaderImage = "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// ========== KENYAN LOCATIONS WITH SHIPPING FEES ==========
const KENYAN_LOCATIONS = {
  // Nairobi County
  'Nairobi': {
    towns: [
      { name: 'CBD', fee: 150 },
      { name: 'Westlands', fee: 120 },
      { name: 'Kilimani', fee: 130 },
      { name: 'Karen', fee: 180 },
      { name: 'Langata', fee: 160 },
      { name: 'South B', fee: 130 },
      { name: 'South C', fee: 130 },
      { name: 'Buruburu', fee: 140 },
      { name: 'Donholm', fee: 140 },
      { name: 'Umoja', fee: 140 },
      { name: 'Kayole', fee: 150 },
      { name: 'Kasarani', fee: 150 },
      { name: 'Roysambu', fee: 150 },
      { name: 'Githurai', fee: 160 },
      { name: 'Kahawa', fee: 160 },
      { name: 'Ruiru', fee: 170 },
      { name: 'Juja', fee: 180 },
      { name: 'Thika Road', fee: 170 },
      { name: 'Mombasa Road', fee: 160 },
      { name: 'Ngong Road', fee: 140 },
      { name: 'Waiyaki Way', fee: 140 },
      { name: 'Lavington', fee: 130 },
      { name: 'Kileleshwa', fee: 130 },
      { name: 'Hurlingham', fee: 140 },
      { name: 'Upper Hill', fee: 140 },
      { name: 'Parklands', fee: 130 },
      { name: 'Spring Valley', fee: 150 },
      { name: 'Riverside', fee: 140 },
      { name: 'Jericho', fee: 130 },
      { name: 'Makadara', fee: 130 },
      { name: 'Viwandani', fee: 150 },
      { name: 'Industrial Area', fee: 160 }
    ]
  },
  
  // Mombasa County
  'Mombasa': {
    towns: [
      { name: 'Mombasa Island', fee: 200 },
      { name: 'Nyali', fee: 180 },
      { name: 'Bamburi', fee: 190 },
      { name: 'Shanzu', fee: 200 },
      { name: 'Kisauni', fee: 190 },
      { name: 'Likoni', fee: 210 },
      { name: 'Changamwe', fee: 200 },
      { name: 'Port Reitz', fee: 210 },
      { name: 'Miritini', fee: 200 },
      { name: 'Mikindani', fee: 200 },
      { name: 'Tudor', fee: 190 },
      { name: 'Mtwapa', fee: 220 },
      { name: 'Kilifi', fee: 250 },
      { name: 'Diani', fee: 280 },
      { name: 'Ukunda', fee: 270 },
      { name: 'Bombolulu', fee: 190 },
      { name: 'Magongo', fee: 200 },
      { name: 'Mariakani', fee: 230 }
    ]
  },
  
  // Kisumu County
  'Kisumu': {
    towns: [
      { name: 'Kisumu Central', fee: 180 },
      { name: 'Milimani', fee: 170 },
      { name: 'Kondele', fee: 160 },
      { name: 'Manyatta', fee: 150 },
      { name: 'Obunga', fee: 150 },
      { name: 'Nyalenda', fee: 150 },
      { name: 'Kibos', fee: 170 },
      { name: 'Mamboleo', fee: 160 },
      { name: 'Kisumu West', fee: 180 },
      { name: 'Ahero', fee: 200 },
      { name: 'Maseno', fee: 220 },
      { name: 'Kombewa', fee: 230 }
    ]
  },
  
  // Kiambu County
  'Kiambu': {
    towns: [
      { name: 'Kiambu Town', fee: 180 },
      { name: 'Thika', fee: 200 },
      { name: 'Limuru', fee: 190 },
      { name: 'Ruiru', fee: 170 },
      { name: 'Juja', fee: 180 },
      { name: 'Githunguri', fee: 190 },
      { name: 'Kikuyu', fee: 160 },
      { name: 'Wangige', fee: 150 },
      { name: 'Kabete', fee: 150 },
      { name: 'Ndumberi', fee: 170 },
      { name: 'Tigoni', fee: 200 }
    ]
  },
  
  // Nakuru County
  'Nakuru': {
    towns: [
      { name: 'Nakuru Town', fee: 150 },
      { name: 'Njoro', fee: 140 },
      { name: 'Naivasha', fee: 180 },
      { name: 'Gilgil', fee: 170 },
      { name: 'Molo', fee: 160 },
      { name: 'Subukia', fee: 170 },
      { name: 'Bahati', fee: 150 },
      { name: 'Rongai', fee: 160 },
      { name: 'Salgaa', fee: 160 },
      { name: 'Mai Mahiu', fee: 190 }
    ]
  },
  
  // Uasin Gishu County
  'Uasin Gishu': {
    towns: [
      { name: 'Eldoret Town', fee: 220 },
      { name: 'Langas', fee: 200 },
      { name: 'Kapseret', fee: 210 },
      { name: 'Huruma', fee: 200 },
      { name: 'Kimumu', fee: 210 },
      { name: 'Racecourse', fee: 200 },
      { name: 'Moiben', fee: 230 },
      { name: 'Soy', fee: 240 },
      { name: 'Turbo', fee: 250 }
    ]
  },
  
  // Kakamega County
  'Kakamega': {
    towns: [
      { name: 'Kakamega Town', fee: 200 },
      { name: 'Mumias', fee: 210 },
      { name: 'Butere', fee: 220 },
      { name: 'Khayega', fee: 210 },
      { name: 'Malava', fee: 220 },
      { name: 'Lugari', fee: 230 },
      { name: 'Matungu', fee: 210 },
      { name: 'Navakholo', fee: 220 }
    ]
  },
  
  // Meru County
  'Meru': {
    towns: [
      { name: 'Meru Town', fee: 230 },
      { name: 'Maua', fee: 240 },
      { name: 'Timau', fee: 250 },
      { name: 'Nkubu', fee: 220 },
      { name: 'Chuka', fee: 230 },
      { name: 'Mutindwa', fee: 220 },
      { name: 'Mikinduri', fee: 230 }
    ]
  },
  
  // Kilifi County
  'Kilifi': {
    towns: [
      { name: 'Kilifi Town', fee: 250 },
      { name: 'Malindi', fee: 270 },
      { name: 'Watamu', fee: 280 },
      { name: 'Mariakani', fee: 230 },
      { name: 'Kaloleni', fee: 240 },
      { name: 'Rabai', fee: 240 },
      { name: 'Ganze', fee: 260 }
    ]
  },
  
  // Machakos County
  'Machakos': {
    towns: [
      { name: 'Machakos Town', fee: 190 },
      { name: 'Athi River', fee: 170 },
      { name: 'Mavoko', fee: 170 },
      { name: 'Kangundo', fee: 200 },
      { name: 'Tala', fee: 200 },
      { name: 'Matuu', fee: 210 },
      { name: 'Masii', fee: 210 },
      { name: 'Mbiuni', fee: 200 }
    ]
  },
  
  // Kajiado County
  'Kajiado': {
    towns: [
      { name: 'Kajiado Town', fee: 200 },
      { name: 'Ngong', fee: 150 },
      { name: 'Ongata Rongai', fee: 140 },
      { name: 'Kitengela', fee: 160 },
      { name: 'Isinya', fee: 190 },
      { name: 'Loitokitok', fee: 280 },
      { name: 'Namanga', fee: 300 }
    ]
  },
  
  // Kericho County
  'Kericho': {
    towns: [
      { name: 'Kericho Town', fee: 210 },
      { name: 'Litein', fee: 220 },
      { name: 'Londiani', fee: 210 },
      { name: 'Kipkelion', fee: 220 },
      { name: 'Sotik', fee: 230 },
      { name: 'Bomet', fee: 230 }
    ]
  },
  
  // Nyeri County
  'Nyeri': {
    towns: [
      { name: 'Nyeri Town', fee: 210 },
      { name: 'Karatina', fee: 200 },
      { name: 'Othaya', fee: 220 },
      { name: 'Mukurweini', fee: 210 },
      { name: 'Tetu', fee: 220 },
      { name: 'Mathira', fee: 210 }
    ]
  },
  
  // Muranga County
  'Muranga': {
    towns: [
      { name: 'Muranga Town', fee: 190 },
      { name: 'Kangema', fee: 200 },
      { name: 'Kigumo', fee: 200 },
      { name: 'Makuyu', fee: 190 },
      { name: 'Maragua', fee: 190 },
      { name: 'Kenol', fee: 180 }
    ]
  },
  
  // Kirinyaga County
  'Kirinyaga': {
    towns: [
      { name: 'Kerugoya', fee: 210 },
      { name: 'Kutus', fee: 200 },
      { name: 'Sagana', fee: 190 },
      { name: 'Mwea', fee: 210 },
      { name: 'Wanguru', fee: 210 }
    ]
  },
  
  // Embu County
  'Embu': {
    towns: [
      { name: 'Embu Town', fee: 220 },
      { name: 'Runyenjes', fee: 220 },
      { name: 'Siakago', fee: 230 },
      { name: 'Manyatta', fee: 220 }
    ]
  },
  
  // Kitui County
  'Kitui': {
    towns: [
      { name: 'Kitui Town', fee: 230 },
      { name: 'Mwingi', fee: 240 },
      { name: 'Mutomo', fee: 250 },
      { name: 'Kyuso', fee: 250 },
      { name: 'Kanyangi', fee: 240 },
      { name: 'Zombe', fee: 250 },
      { name: 'Endau', fee: 250 }
    ]
  },
  
  // Makueni County
  'Makueni': {
    towns: [
      { name: 'Wote', fee: 220 },
      { name: 'Makindu', fee: 230 },
      { name: 'Kibwezi', fee: 240 },
      { name: 'Mtito Andei', fee: 260 }
    ]
  },
  
  // Nyandarua County
  'Nyandarua': {
    towns: [
      { name: 'Ol Kalou', fee: 210 },
      { name: 'Njabini', fee: 210 },
      { name: 'Engineer', fee: 210 },
      { name: 'Kinamba', fee: 220 },
      { name: 'Mairo Inya', fee: 220 }
    ]
  },
  
  // Laikipia County
  'Laikipia': {
    towns: [
      { name: 'Nanyuki', fee: 230 },
      { name: 'Rumuruti', fee: 240 },
      { name: 'Doldol', fee: 260 },
      { name: 'Nyahururu', fee: 220 }
    ]
  },
  
  // Narok County
  'Narok': {
    towns: [
      { name: 'Narok Town', fee: 240 },
      { name: 'Kilgoris', fee: 250 },
      { name: 'Mai Mahiu', fee: 200 },
      { name: 'Suswa', fee: 220 }
    ]
  },
  
  // Trans Nzoia County
  'Trans Nzoia': {
    towns: [
      { name: 'Kitale', fee: 240 },
      { name: 'Kiminini', fee: 230 },
      { name: 'Saboti', fee: 240 },
      { name: 'Endebess', fee: 250 }
    ]
  },
  
  // Bungoma County
  'Bungoma': {
    towns: [
      { name: 'Bungoma Town', fee: 230 },
      { name: 'Kimilili', fee: 240 },
      { name: 'Webuye', fee: 230 },
      { name: 'Chwele', fee: 240 },
      { name: 'Malakisi', fee: 250 }
    ]
  },
  
  // Busia County
  'Busia': {
    towns: [
      { name: 'Busia Town', fee: 240 },
      { name: 'Malaba', fee: 250 },
      { name: 'Nambale', fee: 240 },
      { name: 'Port Victoria', fee: 250 }
    ]
  },
  
  // Vihiga County
  'Vihiga': {
    towns: [
      { name: 'Mbale', fee: 220 },
      { name: 'Luanda', fee: 220 },
      { name: 'Chavakali', fee: 230 }
    ]
  },
  
  // Kisii County
  'Kisii': {
    towns: [
      { name: 'Kisii Town', fee: 220 },
      { name: 'Ogembo', fee: 230 },
      { name: 'Keroka', fee: 230 },
      { name: 'Tabaka', fee: 240 }
    ]
  },
  
  // Nyamira County
  'Nyamira': {
    towns: [
      { name: 'Nyamira Town', fee: 220 },
      { name: 'Keroka', fee: 230 },
      { name: 'Nyansiongo', fee: 230 }
    ]
  },
  
  // Migori County
  'Migori': {
    towns: [
      { name: 'Migori Town', fee: 240 },
      { name: 'Kehancha', fee: 250 },
      { name: 'Rongo', fee: 240 },
      { name: 'Awendo', fee: 240 }
    ]
  },
  
  // Homa Bay County
  'Homa Bay': {
    towns: [
      { name: 'Homa Bay Town', fee: 240 },
      { name: 'Mbita', fee: 260 },
      { name: 'Oyugis', fee: 250 },
      { name: 'Kendu Bay', fee: 250 }
    ]
  },
  
  // Siaya County
  'Siaya': {
    towns: [
      { name: 'Siaya Town', fee: 220 },
      { name: 'Bondo', fee: 230 },
      { name: 'Ugunja', fee: 220 },
      { name: 'Ukwala', fee: 230 },
      { name: 'Yala', fee: 220 }
    ]
  },
  
  // Garissa County
  'Garissa': {
    towns: [
      { name: 'Garissa Town', fee: 350 },
      { name: 'Dadaab', fee: 380 },
      { name: 'Masalani', fee: 360 }
    ]
  },
  
  // Wajir County
  'Wajir': {
    towns: [
      { name: 'Wajir Town', fee: 380 },
      { name: 'Habaswein', fee: 400 },
      { name: 'Buna', fee: 420 }
    ]
  },
  
  // Mandera County
  'Mandera': {
    towns: [
      { name: 'Mandera Town', fee: 400 },
      { name: 'El Wak', fee: 420 },
      { name: 'Rhamu', fee: 410 }
    ]
  },
  
  // Marsabit County
  'Marsabit': {
    towns: [
      { name: 'Marsabit Town', fee: 380 },
      { name: 'Moyale', fee: 420 },
      { name: 'Loiyangalani', fee: 440 },
      { name: 'North Horr', fee: 450 }
    ]
  },
  
  // Isiolo County
  'Isiolo': {
    towns: [
      { name: 'Isiolo Town', fee: 280 },
      { name: 'Merti', fee: 300 },
      { name: 'Garbatulla', fee: 300 },
      { name: 'Kinna', fee: 290 }
    ]
  },
  
  // Samburu County
  'Samburu': {
    towns: [
      { name: 'Maralal', fee: 300 },
      { name: 'Baragoi', fee: 350 },
      { name: 'Archers Post', fee: 320 },
      { name: 'South Horr', fee: 360 }
    ]
  },
  
  // Turkana County
  'Turkana': {
    towns: [
      { name: 'Lodwar', fee: 380 },
      { name: 'Lokitaung', fee: 420 },
      { name: 'Kakuma', fee: 400 },
      { name: 'Lokichar', fee: 410 }
    ]
  },
  
  // West Pokot County
  'West Pokot': {
    towns: [
      { name: 'Kapenguria', fee: 280 },
      { name: 'Makutano', fee: 270 },
      { name: 'Ortum', fee: 280 },
      { name: 'Kacheliba', fee: 320 }
    ]
  },
  
  // Baringo County
  'Baringo': {
    towns: [
      { name: 'Kabarnet', fee: 250 },
      { name: 'Eldama Ravine', fee: 240 },
      { name: 'Mogotio', fee: 240 },
      { name: 'Marigat', fee: 260 }
    ]
  },
  
  // Elgeyo Marakwet County
  'Elgeyo Marakwet': {
    towns: [
      { name: 'Iten', fee: 250 },
      { name: 'Kapsowar', fee: 260 },
      { name: 'Tambach', fee: 250 },
      { name: 'Chebiemit', fee: 260 }
    ]
  },
  
  // Nandi County
  'Nandi': {
    towns: [
      { name: 'Kapsabet', fee: 220 },
      { name: 'Nandi Hills', fee: 230 },
      { name: 'Mosoriot', fee: 220 },
      { name: 'Tinderet', fee: 240 }
    ]
  },
  
  // Lamu County
  'Lamu': {
    towns: [
      { name: 'Lamu Town', fee: 350 },
      { name: 'Mpeketoni', fee: 340 },
      { name: 'Witu', fee: 330 },
      { name: 'Faza', fee: 380 }
    ]
  },
  
  // Tana River County
  'Tana River': {
    towns: [
      { name: 'Hola', fee: 300 },
      { name: 'Garsen', fee: 310 },
      { name: 'Madogo', fee: 300 }
    ]
  },
  
  // Taita Taveta County
  'Taita Taveta': {
    towns: [
      { name: 'Voi', fee: 260 },
      { name: 'Wundanyi', fee: 270 },
      { name: 'Taveta', fee: 300 },
      { name: 'Mwatate', fee: 270 }
    ]
  },
  
  // Kwale County
  'Kwale': {
    towns: [
      { name: 'Kwale Town', fee: 250 },
      { name: 'Msambweni', fee: 270 },
      { name: 'Lungalunga', fee: 280 },
      { name: 'Kinango', fee: 260 }
    ]
  },
  
  // Tharaka Nithi County
  'Tharaka Nithi': {
    towns: [
      { name: 'Chuka', fee: 230 },
      { name: 'Marimanti', fee: 240 },
      { name: 'Kathwana', fee: 230 },
      { name: 'Tunyai', fee: 240 }
    ]
  }
};

// Get list of counties for dropdown
const KENYAN_COUNTIES = Object.keys(KENYAN_LOCATIONS).sort();

// Format currency
const formatKES = (amount) => {
  if (!amount && amount !== 0) return "KSh 0";
  return `KSh ${Math.round(amount).toLocaleString()}`;
};

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  return `${API_URL}/uploads/products/${imagePath}`;
};

// Top Bar Component - UPDATED colors
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
          FIND STORE
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

// Address Form Component with Location Selection - COMPACT
const AddressForm = ({ address, setAddress, errors, setShippingFee }) => {
  const [availableTowns, setAvailableTowns] = useState([]);

  // Handle county change
  const handleCountyChange = (county) => {
    setAddress({ ...address, county, town: '' });
    setShippingFee(0);
    
    if (county) {
      setAvailableTowns(KENYAN_LOCATIONS[county]?.towns || []);
    } else {
      setAvailableTowns([]);
    }
  };

  // Handle town change
  const handleTownChange = (townName) => {
    setAddress({ ...address, town: townName });
    
    // Find the shipping fee for the selected town
    const selectedTown = availableTowns.find(t => t.name === townName);
    if (selectedTown) {
      setShippingFee(selectedTown.fee);
    }
  };

  return (
    <div className="space-y-2">
      {/* Full Name */}
      <div>
        <label className="block text-gray-400">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FiUser className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
            placeholder="John Doe"
            className={`input-field w-full pl-7 ${errors.fullName ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.fullName && <p className="mt-0.5 text-xs text-red-500">{errors.fullName}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-gray-400">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FiPhone className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            placeholder="07XX XXX XXX"
            className={`input-field w-full pl-7 ${errors.phone ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-gray-400">
          Email Address <span className="text-gray-600">(optional)</span>
        </label>
        <div className="relative">
          <FiMail className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
          <input
            type="email"
            value={address.email}
            onChange={(e) => setAddress({ ...address, email: e.target.value })}
            placeholder="john@example.com"
            className="input-field w-full pl-7"
          />
        </div>
      </div>

      {/* Address Line */}
      <div>
        <label className="block text-gray-400">
          Address Line <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FiHome className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
          <input
            type="text"
            value={address.addressLine}
            onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
            placeholder="Street address, building, estate"
            className={`input-field w-full pl-7 ${errors.addressLine ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.addressLine && <p className="mt-0.5 text-xs text-red-500">{errors.addressLine}</p>}
      </div>

      {/* City/Town */}
      <div>
        <label className="block text-gray-400">
          City/Town <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          placeholder="Nairobi"
          className={`input-field w-full ${errors.city ? 'border-red-500' : ''}`}
        />
        {errors.city && <p className="mt-0.5 text-xs text-red-500">{errors.city}</p>}
      </div>

      {/* County Dropdown */}
      <div>
        <label className="block text-gray-400">
          County <span className="text-red-500">*</span>
        </label>
        <select
          value={address.county}
          onChange={(e) => handleCountyChange(e.target.value)}
          className={`input-field w-full ${errors.county ? 'border-red-500' : ''}`}
        >
          <option value="" className="bg-gray-900">Select County</option>
          {KENYAN_COUNTIES.map(county => (
            <option key={county} value={county} className="bg-gray-900">
              {county}
            </option>
          ))}
        </select>
        {errors.county && <p className="mt-0.5 text-xs text-red-500">{errors.county}</p>}
      </div>

      {/* Town/Area Dropdown */}
      {address.county && (
        <div>
          <label className="block text-gray-400">
            Town/Area <span className="text-red-500">*</span>
          </label>
          <select
            value={address.town || ''}
            onChange={(e) => handleTownChange(e.target.value)}
            className={`input-field w-full ${errors.town ? 'border-red-500' : ''}`}
          >
            <option value="" className="bg-gray-900">Select Town/Area</option>
            {availableTowns.map(town => (
              <option key={town.name} value={town.name} className="bg-gray-900">
                {town.name} - {formatKES(town.fee)}
              </option>
            ))}
          </select>
          {errors.town && <p className="mt-0.5 text-xs text-red-500">{errors.town}</p>}
        </div>
      )}

      {/* Postal Code (Optional) */}
      <div>
        <label className="block text-gray-400">
          Postal Code <span className="text-gray-600">(optional)</span>
        </label>
        <input
          type="text"
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          placeholder="00100"
          className="input-field w-full"
        />
      </div>
    </div>
  );
};

// Payment Method Component - UPDATED colors
const PaymentMethodCard = ({ method, selected, onSelect, icon: Icon, title, description }) => {
  return (
    <div
      onClick={() => onSelect(method)}
      className={`payment-method-card ${selected ? 'selected' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${selected ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}>
          <Icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        {selected && (
          <FiCheckCircle className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
};

// Order Summary Item - COMPACT
const OrderItem = ({ item }) => {
  const price = item.discountPrice || item.price || 0;
  const image = item.images?.[0]?.url || item.image || FALLBACK_IMAGE;
  
  return (
    <div className="flex gap-1.5 py-1.5 border-b border-gray-800 last:border-0">
      <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden rounded-lg bg-gray-800">
        <img
          src={getFullImageUrl(image)}
          alt={item.name}
          className="object-cover w-full h-full"
          onError={(e) => e.target.src = FALLBACK_IMAGE}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium text-white truncate">{item.name}</h4>
        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
        <p className="text-xs font-semibold text-yellow-500">{formatKES(price * item.quantity)}</p>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartSummary, clearCart } = useCart();

  // Check if this is a direct checkout (from Buy Now)
  const isDirectCheckout = location.state?.directCheckout || false;
  const directItems = location.state?.items || [];
  const directTotal = location.state?.totalAmount || 0;

  // Use either cart items or direct items
  const checkoutItems = isDirectCheckout ? directItems : cart.items;
  const checkoutTotal = isDirectCheckout ? directTotal : getCartSummary().subtotal;

  // State
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    county: '',
    town: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  // Payment methods
  const paymentMethods = [
    { 
      id: 'mpesa', 
      title: 'M-Pesa', 
      description: 'Pay via M-Pesa',
      icon: FiSmartphone 
    },
    { 
      id: 'card', 
      title: 'Card', 
      description: 'Visa, Mastercard',
      icon: FiCreditCard 
    },
    { 
      id: 'cash', 
      title: 'Cash on Delivery', 
      description: 'Pay on delivery',
      icon: BsCash 
    }
  ];

  // Load saved addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  }, []);

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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Updated redirect check
  useEffect(() => {
    if (!isDirectCheckout && cart.items.length === 0) {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [cart.items, navigate, isDirectCheckout]);

  // Validate address form
  const validateAddress = () => {
    const newErrors = {};
    
    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!address.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(address.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Kenyan phone number';
    }
    if (!address.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.county) newErrors.county = 'County is required';
    if (!address.town) newErrors.town = 'Town/Area is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      if (validateAddress()) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (step === 2) {
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save address to localStorage
  const saveAddress = () => {
    const updated = [...savedAddresses, { ...address, id: Date.now() }];
    setSavedAddresses(updated);
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
    toast.success('Address saved');
  };

  // Load saved address
  const loadAddress = (saved) => {
    setAddress(saved);
    if (saved.county && saved.town) {
      const countyData = KENYAN_LOCATIONS[saved.county];
      const townData = countyData?.towns.find(t => t.name === saved.town);
      if (townData) {
        setShippingFee(townData.fee);
      }
    }
    setShowSavedAddresses(false);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      toast.error('No items to order');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = checkoutItems.map(item => ({
        productId: item.id || item.productId,
        name: item.name,
        price: item.discountPrice || item.price || 0,
        quantity: item.quantity,
        image: item.images?.[0]?.url || item.image
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + shippingFee;
      
      const shippingAddress = `${address.addressLine}, ${address.town}, ${address.city}, ${address.county}${address.postalCode ? ', ' + address.postalCode : ''}`;

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          email: address.email || undefined,
          address: shippingAddress,
          city: address.city,
          county: address.county,
          town: address.town,
          postalCode: address.postalCode || undefined
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingCost: shippingFee,
        totalAmount: total,
        status: 'pending',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processing',
        notes: `Order placed via ${paymentMethod}`,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Creating order:', orderData);

      const response = await clientOrderService.createOrder(orderData);

      console.log('📥 Order response:', response);

      if (response && response.success) {
        toast.success('Order placed successfully!');
        
        if (window.confirm('Would you like to save this address for future orders?')) {
          saveAddress();
        }

        if (!isDirectCheckout) {
          clearCart();
        }

        sessionStorage.removeItem('directCheckout');

        if (response.order && response.order._id) {
          navigate(`/order-confirmation/${response.order._id}`);
        } else {
          navigate('/orders');
        }
      } else {
        toast.error(response?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid order data');
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const summary = getCartSummary();
  const subtotal = isDirectCheckout ? checkoutTotal : summary.subtotal;
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-black">
      <TopBar />

      {/* Header Image - COMPACT */}
      <div 
        className="relative w-full h-32 overflow-hidden sm:h-36 md:h-40"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={checkoutHeaderImage}
            alt="Checkout"
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
              <h1 className="text-lg font-bold text-white sm:text-xl md:text-2xl">CHECKOUT</h1>
              <p className="text-xs text-gray-300">
                {isDirectCheckout ? 'Complete your purchase' : 'Complete your order'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - COMPACT */}
      <div className="container px-3 py-3 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-2 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-2 h-2 text-gray-600" />
          <button onClick={() => navigate('/shop')} className="text-gray-400 hover:text-yellow-500">Shop</button>
          <FiChevronRight className="w-2 h-2 text-gray-600" />
          {!isDirectCheckout && (
            <>
              <button onClick={() => navigate('/cart')} className="text-gray-400 hover:text-yellow-500">Cart</button>
              <FiChevronRight className="w-2 h-2 text-gray-600" />
            </>
          )}
          <span className="font-medium text-white truncate">Checkout</span>
        </nav>

        {/* Progress Steps - COMPACT */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 1 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">1</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 1 ? 'text-yellow-500' : 'text-gray-500'}`}>Address</span>
          </div>
          <div className={`w-8 h-0.5 mx-1.5 ${step >= 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 2 ? 'text-yellow-500' : 'text-gray-500'}`}>Payment</span>
          </div>
          <div className={`w-8 h-0.5 mx-1.5 ${step >= 3 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 3 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">3</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>Review</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Left Column - Forms */}
          <div className="lg:w-2/3 space-y-3">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div 
                className="order-summary-card"
                data-aos="fade-right"
                data-aos-duration="800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                      className="text-xs text-yellow-500 hover:text-yellow-400"
                    >
                      {showSavedAddresses ? 'Hide' : 'Use saved'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses - COMPACT */}
                {showSavedAddresses && savedAddresses.length > 0 && (
                  <div className="mb-2 space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                    {savedAddresses.map((saved) => (
                      <div
                        key={saved.id}
                        onClick={() => loadAddress(saved)}
                        className="flex items-center justify-between p-1.5 text-xs transition-colors border border-gray-800 rounded-lg cursor-pointer bg-gray-800/30 hover:border-yellow-500/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{saved.fullName}</p>
                          <p className="text-gray-400">{saved.addressLine}, {saved.town}</p>
                        </div>
                        <FiEdit2 className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                <AddressForm 
                  address={address} 
                  setAddress={setAddress} 
                  errors={errors} 
                  setShippingFee={setShippingFee}
                />

                {/* Shipping Fee Preview - COMPACT */}
                {shippingFee > 0 && (
                  <div className="flex items-center justify-between p-1.5 mt-2 text-xs border border-yellow-500/20 rounded-lg bg-yellow-600/10">
                    <span className="text-gray-400">Shipping Fee:</span>
                    <span className="font-semibold text-yellow-500">{formatKES(shippingFee)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div 
                className="order-summary-card"
                data-aos="fade-right"
                data-aos-duration="800"
              >
                <h2 className="mb-2 text-sm font-semibold text-white">Payment Method</h2>
                <div className="space-y-1.5">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method.id}
                      selected={paymentMethod === method.id}
                      onSelect={setPaymentMethod}
                      icon={method.icon}
                      title={method.title}
                      description={method.description}
                    />
                  ))}
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="p-1.5 mt-2 text-xs border rounded-lg border-yellow-500/20 bg-yellow-600/10">
                    <p className="text-yellow-500">
                      You'll receive an M-Pesa prompt
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div 
                className="order-summary-card"
                data-aos="fade-right"
                data-aos-duration="800"
              >
                <h2 className="mb-2 text-sm font-semibold text-white">Review Order</h2>
                
                {/* Shipping Address Review - COMPACT */}
                <div className="p-1.5 mb-1.5 text-xs border border-gray-800 rounded-lg">
                  <h3 className="mb-0.5 font-medium text-yellow-500">Shipping Address</h3>
                  <p className="text-white">{address.fullName}</p>
                  <p className="text-gray-400">{address.addressLine}, {address.town}</p>
                  <p className="text-gray-400">{address.city}, {address.county}</p>
                  <p className="text-gray-400">Phone: {address.phone}</p>
                </div>

                {/* Payment Method Review - COMPACT */}
                <div className="p-1.5 mb-1.5 text-xs border border-gray-800 rounded-lg">
                  <h3 className="mb-0.5 font-medium text-yellow-500">Payment Method</h3>
                  <p className="text-white capitalize">
                    {paymentMethods.find(m => m.id === paymentMethod)?.title || paymentMethod}
                  </p>
                </div>

                {/* Items Review - COMPACT */}
                <div>
                  <h3 className="mb-1 text-xs font-medium text-yellow-500">Items</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {checkoutItems.map((item) => (
                      <OrderItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary - COMPACT */}
          <div 
            className="lg:w-1/3"
            data-aos="fade-left"
            data-aos-duration="800"
          >
            <div className="sticky order-summary-card top-4">
              <h2 className="flex items-center gap-1 mb-2 text-sm font-semibold text-white">
                <FiPackage className="w-4 h-4 text-yellow-500" />
                Order Summary
              </h2>

              {/* Items Preview - COMPACT */}
              <div className="mb-2 space-y-1 max-h-32 overflow-y-auto text-xs custom-scrollbar">
                {checkoutItems.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-400 truncate max-w-[100px]">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </span>
                      <span className="text-white">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals - COMPACT */}
              <div className="pt-1.5 space-y-1 text-xs border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-yellow-500">{formatKES(shippingFee)}</span>
                </div>
                <div className="pt-1 mt-1 text-sm font-bold border-t border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500 glow-text">{formatKES(total)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons - COMPACT */}
              <div className="flex gap-1.5 mt-3">
                {step > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors border border-gray-700 rounded-full btn-outline"
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-white rounded-full btn-gradient"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-white rounded-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Processing</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        Place Order
                        <BsArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Security Note - COMPACT */}
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-yellow-500">
                <FiShield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles - UPDATED colors */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Checkout;