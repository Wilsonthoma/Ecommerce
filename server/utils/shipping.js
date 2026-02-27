// server/utils/shipping.js

/**
 * Complete Kenyan locations with town-specific shipping fees
 * This matches your frontend data structure
 */
export const KENYAN_LOCATIONS = {
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

/**
 * Get list of all counties
 * @returns {Array} - List of county names
 */
export const getCounties = () => {
  return Object.keys(KENYAN_LOCATIONS).sort();
};

/**
 * Get towns for a specific county
 * @param {string} county - County name
 * @returns {Array} - List of towns with their fees
 */
export const getTownsByCounty = (county) => {
  return KENYAN_LOCATIONS[county]?.towns || [];
};

/**
 * Calculate shipping fee based on county and town
 * @param {string} county - County name
 * @param {string} town - Town name
 * @returns {number} - Shipping fee
 */
export const calculateShippingFee = (county, town) => {
  if (!county || !town) return 300; // Default fee
  
  const countyData = KENYAN_LOCATIONS[county];
  if (!countyData) return 300;
  
  const townData = countyData.towns.find(t => t.name === town);
  return townData?.fee || 300;
};

/**
 * Validate if a county and town combination exists
 * @param {string} county - County name
 * @param {string} town - Town name
 * @returns {boolean} - True if valid
 */
export const isValidLocation = (county, town) => {
  if (!county || !town) return false;
  
  const countyData = KENYAN_LOCATIONS[county];
  if (!countyData) return false;
  
  return countyData.towns.some(t => t.name === town);
};

/**
 * Get estimated delivery days based on location
 * @param {string} county - County name
 * @param {string} shippingMethod - 'standard' or 'express'
 * @returns {Object} - Min and max delivery days
 */
export const getEstimatedDeliveryDays = (county, shippingMethod = 'standard') => {
  const remoteCounties = ['Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Turkana', 'Lamu'];
  const isRemote = remoteCounties.includes(county);
  
  let baseDays = shippingMethod === 'express' ? 2 : 5;
  
  if (isRemote) {
    baseDays += 3;
  }
  
  return {
    minDays: baseDays,
    maxDays: baseDays + (shippingMethod === 'express' ? 1 : 2)
  };
};

/**
 * Calculate estimated delivery date
 * @param {string} county - County name
 * @param {string} shippingMethod - 'standard' or 'express'
 * @returns {Date} - Estimated delivery date
 */
export const calculateEstimatedDelivery = (county, shippingMethod = 'standard') => {
  const { minDays } = getEstimatedDeliveryDays(county, shippingMethod);
  
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + minDays);
  
  // Don't deliver on Sundays
  if (deliveryDate.getDay() === 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  
  return deliveryDate;
};

export default {
  KENYAN_LOCATIONS,
  getCounties,
  getTownsByCounty,
  calculateShippingFee,
  isValidLocation,
  getEstimatedDeliveryDays,
  calculateEstimatedDelivery
};