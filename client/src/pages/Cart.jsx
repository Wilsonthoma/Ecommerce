// src/pages/Cart.jsx - COMPLETE with black theme, indigo/blue/cyan gradient, and 3D effects
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Shield,
  ChevronRight,
  ShoppingCart,
  Package,
  X,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock,
  RefreshCw
} from 'lucide-react';
import { BsArrowRight } from 'react-icons/bs';
import { FiMapPin } from 'react-icons/fi';  // ← FIXED: Added missing import
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles matching homepage
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title {
    font-weight: 800;
    font-size: clamp(2rem, 5vw, 2.8rem);
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(59, 130, 246, 0.8);
  }
`;

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
  
  .glow-border {
    animation: glow 2s ease-in-out infinite;
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// Cart header image
const cartHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header bottom transition - indigo/blue/cyan
const headerGradient = "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";

// Complete Kenyan locations data with individual shipping prices for each town
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

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-3 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPin className="w-4 h-4" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    loading,
    getCartSummary
  } = useCart();

  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Delivery state
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [pickupDate, setPickupDate] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Refresh AOS when cart changes
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, [cart.items]);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Get available towns for selected county
  const getTownsForCounty = () => {
    if (!selectedCounty) return [];
    return KENYAN_LOCATIONS[selectedCounty]?.towns || [];
  };

  // Handle county change
  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    setSelectedTown('');
    setDeliveryFee(0);
  };

  // Handle town change
  const handleTownChange = (townName) => {
    setSelectedTown(townName);
    const towns = getTownsForCounty();
    const selectedTownData = towns.find(t => t.name === townName);
    setDeliveryFee(selectedTownData?.fee || 0);
  };

  // Calculate delivery dates
  useEffect(() => {
    if (selectedTown) {
      const today = new Date();
      const pickup = new Date(today);
      pickup.setDate(today.getDate() + 2);
      const ready = new Date(today);
      ready.setDate(today.getDate() + 4);

      setPickupDate(pickup.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
      setReadyDate(ready.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
    }
  }, [selectedTown]);

  // Real-time countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setHours(now.getHours() + 2);
      deadline.setMinutes(now.getMinutes() + 54);

      const diff = deadline - now;
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hrs}h ${mins}m`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Format KES
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

  // Handle quantity change
  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    const maxStock = item.stockQuantity || 10;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      await updateQuantity(item.id || item.productId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    await removeFromCart(item.id || item.productId);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  // Handle image click
  const handleImageClick = (item, index) => {
    setSelectedProduct(item);
    setLightboxImages(item.images || []);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    if (direction === 'prev') {
      setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
    } else {
      setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    }
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setSelectedProduct(null);
  };

  // Handle order placement
  const handlePlaceOrder = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!selectedCounty || !selectedTown) {
      toast.error('Please select delivery location');
      return;
    }

    // Save delivery info
    localStorage.setItem('deliveryInfo', JSON.stringify({
      county: selectedCounty,
      town: selectedTown,
      fee: deliveryFee,
      pickupDate,
      readyDate
    }));

    navigate('/checkout');
  };

  // Get stock badge
  const getStockBadge = (item) => {
    if (item.stockStatus === 'sold' || (item.stockQuantity || 0) <= 0) {
      return { bg: 'bg-gradient-to-r from-red-600 to-pink-600', label: 'Sold Out', icon: <AlertCircle className="w-3 h-3" /> };
    } else if ((item.stockQuantity || 0) <= 5) {
      return { bg: 'bg-gradient-to-r from-yellow-600 to-orange-600', label: 'Low Stock', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { bg: 'bg-gradient-to-r from-green-600 to-emerald-600', label: 'In Stock', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const summary = getCartSummary();
  const subtotal = summary.subtotal;
  const grandTotal = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="w-48 h-8 mb-8 bg-gray-800 rounded"></div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="h-40 bg-gray-800 rounded"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="bg-gray-800 rounded h-60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-12 mx-auto">
          <div 
            className="max-w-md mx-auto text-center"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                <ShoppingCart className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-gray-400">Add some products to your cart to continue shopping</p>
            <Link 
              to="/shop" 
              className="relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden font-medium text-white transition-all rounded-full group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
              <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                Continue Shopping
                <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />

      {/* Cart Header Image - with indigo/blue/cyan gradient at bottom */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
      >
        <div className="absolute inset-0">
          <img 
            src={cartHeaderImage}
            alt="Shopping Cart"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          {/* Dark overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          {/* Bottom gradient - indigo/blue/cyan that transitions to black */}
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          {/* Final black gradient at the very bottom to blend with background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        {/* Header Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
            >
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                SHOPPING CART
              </h1>
              <p className="mt-1 text-sm text-gray-300 sm:text-base">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <nav 
          className="flex items-center gap-2 mb-6 text-sm"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <Link to="/" className="text-gray-400 transition-colors hover:text-white">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-white">Shop</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-white">Shopping Cart</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div 
            className="lg:col-span-2"
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-delay="400"
          >
            <div className="overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold text-white">Cart Items ({cart.items.length})</h2>
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 transition-colors rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Cart
                </button>
              </div>
              
              <div className="divide-y divide-gray-800">
                {cart.items.map((item, index) => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  const stockBadge = getStockBadge(item);
                  const images = item.images || [];
                  
                  // Initialize image index if not set
                  if (selectedImageIndex[item.id] === undefined) {
                    setTimeout(() => {
                      setSelectedImageIndex(prev => ({ ...prev, [item.id]: 0 }));
                    }, 0);
                  }
                  
                  const currentImageIndex = selectedImageIndex[item.id] || 0;
                  const currentImage = images[currentImageIndex] || { url: FALLBACK_IMAGE };
                  
                  return (
                    <div 
                      key={item.id} 
                      className="p-4 transition-colors hover:bg-white/5 group card-3d"
                      data-aos="flip-up"
                      data-aos-duration="1000"
                      data-aos-delay={500 + (index * 100)}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                      <div className="relative card-3d-content">
                        <div className="flex gap-4">
                          {/* Image with gallery */}
                          <div className="relative flex-shrink-0">
                            <div className="relative w-24 h-24 group/image">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded opacity-0 group-hover/image:opacity-30 blur transition-opacity"></div>
                              <img 
                                src={getFullImageUrl(currentImage.url)} 
                                alt={item.name}
                                className="relative object-contain w-full h-full rounded cursor-pointer"
                                onClick={() => handleImageClick(item, currentImageIndex)}
                              />
                            </div>
                            
                            {/* Thumbnails */}
                            {images.length > 1 && (
                              <div className="flex gap-1 mt-2">
                                {images.slice(0, 3).map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                                    className={`w-6 h-6 rounded overflow-hidden border transition-all ${
                                      currentImageIndex === idx 
                                        ? 'border-indigo-500 ring-1 ring-indigo-500/50' 
                                        : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                  >
                                    <img 
                                      src={getFullImageUrl(img.url)} 
                                      alt={`${item.name} ${idx + 1}`}
                                      className="object-cover w-full h-full"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                                <p className="text-xs text-gray-400">{formatKES(price)} each</p>
                                
                                {/* Stock Badge */}
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 mt-2 text-xs font-medium text-white rounded-full ${stockBadge.bg}`}>
                                  {stockBadge.icon}
                                  {stockBadge.label}
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex items-center overflow-hidden bg-gray-800 border border-gray-700 rounded-lg">
                                    <button 
                                      onClick={() => handleQuantityChange(item, -1)}
                                      className="px-2 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-xs font-medium text-center text-white">
                                      {item.quantity}
                                    </span>
                                    <button 
                                      onClick={() => handleQuantityChange(item, 1)}
                                      className="px-2 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                                      disabled={item.quantity >= (item.stockQuantity || 10)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-sm font-medium text-indigo-400">= {formatKES(itemTotal)}</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveItem(item)}
                                className="p-1 text-gray-500 transition-colors rounded hover:text-red-500 hover:bg-red-500/10"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4">
              <Link to="/shop" className="inline-flex items-center text-xs text-indigo-500 transition-colors hover:text-indigo-400">
                <ChevronLeft className="w-3 h-3 mr-1" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div 
            className="lg:col-span-1"
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-delay="500"
          >
            <div className="sticky p-5 bg-gray-900 border border-gray-800 rounded-xl top-4">
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                <Package className="w-5 h-5 text-indigo-500" />
                Order Summary
              </h2>
              
              {/* Items List */}
              <div className="mb-4 space-y-2 overflow-y-auto text-sm max-h-60 custom-scrollbar">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-400 truncate max-w-[150px]">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-white">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Delivery Selection */}
              <div className="relative p-4 mb-4 overflow-hidden bg-gray-800 border rounded-lg border-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-600/10"></div>
                
                <div className="relative">
                  <h3 className="flex items-center gap-1 mb-3 font-medium text-indigo-500">
                    <Truck className="w-4 h-4" />
                    Delivery Location
                  </h3>
                  
                  {/* County Selection */}
                  <div className="mb-3">
                    <label className="block mb-1 text-xs text-gray-400">County</label>
                    <select
                      value={selectedCounty}
                      onChange={(e) => handleCountyChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    >
                      <option value="" className="bg-gray-900">Select County</option>
                      {Object.keys(KENYAN_LOCATIONS).sort().map(county => (
                        <option key={county} value={county} className="bg-gray-900">
                          {county}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Town Selection */}
                  <div className="mb-3">
                    <label className="block mb-1 text-xs text-gray-400">Town/Station</label>
                    <select
                      value={selectedTown}
                      onChange={(e) => handleTownChange(e.target.value)}
                      disabled={!selectedCounty}
                      className="w-full px-3 py-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-gray-900">Select Town</option>
                      {getTownsForCounty().map(town => (
                        <option key={town.name} value={town.name} className="bg-gray-900">
                          {town.name} - {formatKES(town.fee)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Delivery Info */}
                  {selectedTown && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Delivery Fee:</span>
                        <span className="font-medium text-indigo-500">{formatKES(deliveryFee)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Pickup: {pickupDate} - Ready: {readyDate}
                      </div>
                      {timeLeft !== 'Expired' && (
                        <div className="flex items-center gap-1 p-2 text-xs text-yellow-500 rounded bg-yellow-500/10">
                          <Clock className="w-3 h-3" />
                          Order within {timeLeft} for this delivery window
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Returns Info */}
                  <div className="flex items-center gap-1 mt-3 text-xs text-green-500">
                    <RefreshCw className="w-3 h-3" />
                    <span>Free returns within 7 days</span>
                  </div>
                </div>
              </div>
              
              {/* Totals */}
              <div className="pt-4 space-y-3 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-indigo-500">{formatKES(deliveryFee)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-800">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-indigo-500 glow-text">{formatKES(grandTotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={cart.items.length === 0 || !selectedTown}
                className="relative w-full py-3 mt-5 overflow-hidden text-sm font-medium text-white transition-all rounded-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              
              {/* Security Note */}
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-indigo-500">
                <Shield className="w-3 h-3" />
                <span>Secure checkout · 100% protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="relative w-4/5 max-w-4xl">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute p-2 transition-all rounded-full shadow-lg -right-2 -top-12 bg-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] group sm:-right-12 sm:-top-12"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
              <X className="relative w-5 h-5 text-gray-400 transition-colors group-hover:text-white" />
            </button>

            {/* Navigation */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-0 z-10 p-2 transition-all -translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gray-900 border border-gray-700 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 transition-colors group-hover:text-indigo-500" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-0 z-10 p-2 transition-all translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gray-900 border border-gray-700 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 transition-colors group-hover:text-indigo-500" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl">
              <img 
                src={getFullImageUrl(lightboxImages[lightboxIndex]?.url)} 
                alt={selectedProduct?.name || 'Product'} 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Image counter */}
              <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full bottom-4 right-4 bg-gradient-to-r from-indigo-600 to-blue-600">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Cart;