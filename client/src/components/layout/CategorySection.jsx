// src/components/layout/CategorySection.jsx - Updated with 6 electronics categories
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import HorizontalScroll from "../ui/HorizontalScroll";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import { CardSkeleton } from "../ui/LoadingSpinner";
import { clientProductService } from "../../services/client/products";
import { categoryImages } from "../../utils/constants";

// Define the 6 electronics categories
const ELECTRONICS_CATEGORIES = [
  { name: 'Smartphones', slug: 'smartphones', image: categoryImages.smartphones },
  { name: 'Laptops', slug: 'laptops', image: categoryImages.laptops },
  { name: 'Tablets', slug: 'tablets', image: categoryImages.tablets },
  { name: 'Cameras', slug: 'cameras', image: categoryImages.cameras },
  { name: 'Headphones', slug: 'headphones', image: categoryImages.headphones },
  { name: 'Speakers', slug: 'speakers', image: categoryImages.speakers }
];

const CategorySection = ({ 
  categories = [], 
  loading = false, 
  headerImage,
  showHeader = true,
  showViewAll = true,
  className = ""
}) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [realCategories, setRealCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch real categories from API or use fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await clientProductService.getCategories();
        
        if (response?.success && response.categories && response.categories.length > 0) {
          // Use categories from API
          const processedCategories = response.categories.map(cat => ({
            id: cat._id || cat.id,
            slug: cat.slug,
            name: cat.name,
            image: cat.image || categoryImages[cat.name?.toLowerCase()] || categoryImages.smartphones,
            count: cat.productCount || 0,
            link: `/shop?category=${cat.slug}`
          }));
          setRealCategories(processedCategories);
        } else {
          // Fallback to predefined 6 categories with dynamic counts
          const fallbackCategories = await Promise.all(
            ELECTRONICS_CATEGORIES.map(async (cat) => {
              let count = 0;
              try {
                // Try to get count from API
                const productCount = await clientProductService.getProductsCountByCategory(cat.name);
                count = productCount || 0;
              } catch (err) {
                console.log(`Could not fetch count for ${cat.name}`);
              }
              return {
                id: cat.slug,
                slug: cat.slug,
                name: cat.name,
                image: cat.image,
                count: count,
                link: `/shop?category=${cat.slug}`
              };
            })
          );
          setRealCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use static fallback categories
        const fallbackCategories = ELECTRONICS_CATEGORIES.map(cat => ({
          id: cat.slug,
          slug: cat.slug,
          name: cat.name,
          image: cat.image,
          count: 0,
          link: `/shop?category=${cat.slug}`
        }));
        setRealCategories(fallbackCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const isLoading = loading || categoriesLoading;
  const displayCategories = realCategories.length > 0 ? realCategories : categories;

  if (isLoading) {
    return <CardSkeleton count={6} />;
  }

  if (!displayCategories || displayCategories.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 bg-black border-t border-gray-800 ${className}`}>
      <div className="px-6 mx-auto max-w-7xl">
        {showHeader && (
          <SectionHeader 
            title="SHOP BY CATEGORY"
            image={headerImage}
            alt="Shop by category"
          />
        )}
        
        <HorizontalScroll showArrows={displayCategories.length > 3}>
          {displayCategories.slice(0, 6).map((category, index) => (
            <div 
              key={category.id || index} 
              className="flex-shrink-0 w-48 cursor-pointer sm:w-56 md:w-64 lg:w-72 group"
              onClick={() => navigate(category.link)}
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={200 + (index * 100)}
              data-aos-once="false"
            >
              <div className="relative mb-3 overflow-hidden bg-gray-900 rounded-lg aspect-square">
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-30 blur-xl"></div>
                
                <img 
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.pexels.com/photos/5447382/pexels-photo-5447382.jpeg";
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-base font-semibold text-white sm:text-lg">{category.name}</h3>
                  <p className="text-xs text-gray-300 sm:text-sm">
                    {category.count > 0 ? `${category.count} Products` : 'Shop Now'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </HorizontalScroll>
        
        {showViewAll && (
          <div 
            className="mt-8 text-center"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="600"
            data-aos-once="false"
          >
            <Button 
              onClick={() => navigate('/shop')}
              variant="secondary"
              size="md"
              icon={FiArrowRight}
              iconPosition="right"
            >
              VIEW ALL CATEGORIES
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;