// src/utils/constants.js

// Category header images
export const categoryHeaderImages = {
  trust: "https://images.pexels.com/photos/6155297/pexels-photo-6155297.jpeg",
  featured: "https://images.pexels.com/photos/6349119/pexels-photo-6349119.jpeg",
  categories: "https://images.pexels.com/photos/5650531/pexels-photo-5650531.jpeg",
  testimonials: "https://images.pexels.com/photos/3587477/pexels-photo-3587477.jpeg",
  flashSale: "https://images.pexels.com/photos/36357088/pexels-photo-36357088.jpeg",
  trending: "https://images.pexels.com/photos/5382359/pexels-photo-5382359.jpeg",
  justArrived: "https://images.pexels.com/photos/6020432/pexels-photo-6020432.jpeg"
};

// Category images - Only 6 electronic categories
export const categoryImages = {
  smartphones: "https://images.pexels.com/photos/6214386/pexels-photo-6214386.jpeg",
  laptops: "https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg",
  tablets: "https://images.pexels.com/photos/5926443/pexels-photo-5926443.jpeg",
  cameras: "https://images.pexels.com/photos/7007177/pexels-photo-7007177.jpeg",
  headphones: "https://images.pexels.com/photos/5447382/pexels-photo-5447382.jpeg",
  speakers: "https://images.pexels.com/photos/6207752/pexels-photo-6207752.jpeg"
};

// Section gradients
export const sectionGradients = {
  hero: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  trust: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  featured: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  categories: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  testimonials: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  flashSale: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  trending: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  justArrived: "from-yellow-600/20 via-orange-600/20 to-red-600/20"
};

// Typing phrases
export const typingPhrases = [
  'Premium Audio Experience',
  'Wireless Freedom',
  'Crystal Clear Sound',
  'Adaptive Noise Cancellation',
  '40H Battery Life',
  'Studio Quality'
];

// Trust stats
export const trustStats = [
  { number: 300, label: "HAPPY CLIENTS", duration: 5, suffix: "+" },
  { number: 25, label: "COUNTIES SERVED", duration: 4.5, suffix: "+" },
  { number: 365, label: "DAYS WARRANTY", duration: 5, suffix: "" },
];

// Testimonials
export const testimonials = [
  {
    name: "Unbox Therapy",
    text: "OpenArc is the ultimate gym companion, from intense workouts to training sessions.",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 5
  },
  {
    name: "Fisayo Fosudo",
    text: "Vocals and the instrumentals were very outstanding. Here I was impressed.",
    image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 5
  },
  {
    name: "Chouaib Reviews",
    text: "The sound in music is impressive and the bass is very good and rich.",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    rating: 4
  }
];

// REMOVE electronicCategories - categories will be fetched from API
// If you need fallback, keep but with dynamic counts
export const electronicCategories = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    image: categoryImages.smartphones,
    count: 0  // Will be updated from API
  },
  {
    id: 'laptops',
    name: 'Laptops',
    slug: 'laptops',
    image: categoryImages.laptops,
    count: 0
  },
  {
    id: 'tablets',
    name: 'Tablets',
    slug: 'tablets',
    image: categoryImages.tablets,
    count: 0
  },
  {
    id: 'cameras',
    name: 'Cameras',
    slug: 'cameras',
    image: categoryImages.cameras,
    count: 0
  },
  {
    id: 'headphones',
    name: 'Headphones',
    slug: 'headphones',
    image: categoryImages.headphones,
    count: 0
  },
  {
    id: 'speakers',
    name: 'Speakers',
    slug: 'speakers',
    image: categoryImages.speakers,
    count: 0
  }
];