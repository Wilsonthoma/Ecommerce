// src/pages/Blog.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Blog Post Caching
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiUser, 
  FiTag, 
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiCalendar,
  FiEye,
  FiHeart,
  FiShare2,
  FiHome,
  FiMapPin,
  FiArrowRight
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/LoadingSpinner';

// Font styles - Yellow-Orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling */
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  .blog-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .blog-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .blog-card:hover .blog-image {
    transform: scale(1.05);
  }
  
  .blog-image {
    transition: transform 0.5s ease;
  }
  
  .featured-blog {
    position: relative;
    overflow: hidden;
    min-height: 400px;
    cursor: pointer;
  }
  
  .featured-blog::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3));
    z-index: 1;
  }
  
  .featured-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
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

// Gradient for header
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const blogHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Blog images
const blogImages = [
  "https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4210863/pexels-photo-4210863.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/5709675/pexels-photo-5709675.jpeg?auto=compress&cs=tinysrgb&w=800"
];

// Top Bar Component
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
          <span>FIND STORE</span>
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

// Blog Post Card Component
const BlogCard = ({ post, index }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="cursor-pointer blog-card rounded-xl"
      onClick={() => navigate(`/blog/${post.id}`)}
      data-aos="fade-up"
      data-aos-delay={index * 50}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="object-cover w-full h-full blog-image"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] font-medium text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <FiUser className="w-3 h-3" />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <FiEye className="w-3 h-3" />
            {post.views}
          </span>
        </div>
        <h3 className="mb-2 text-sm font-semibold text-white line-clamp-2">{post.title}</h3>
        <p className="mb-3 text-xs text-gray-400 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-yellow-500">Read more</span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Handle like
              }}
              className="p-1 text-gray-400 transition-colors rounded-full hover:text-red-500"
            >
              <FiHeart className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
              className="p-1 text-gray-400 transition-colors rounded-full hover:text-yellow-500"
            >
              <FiShare2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Featured Blog Post Component
const FeaturedBlog = ({ post }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="cursor-pointer featured-blog rounded-xl"
      onClick={() => navigate(`/blog/${post.id}`)}
      data-aos="zoom-in"
    >
      <img 
        src={post.image} 
        alt={post.title}
        className="object-cover w-full h-full"
      />
      <div className="p-6 featured-content">
        <span className="inline-block px-2 py-1 mb-3 text-xs font-medium text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
          Featured
        </span>
        <h2 className="mb-2 text-2xl font-bold text-white">{post.title}</h2>
        <p className="mb-4 text-sm text-gray-300 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <FiUser className="w-3 h-3" />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>
    </div>
  );
};

const Blog = () => {
  const navigate = useNavigate();
  
  // States
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Categories
  const categories = ['all', 'Technology', 'Shopping Tips', 'Product Reviews', 'News', 'Guides'];

  // Blog post data
  const blogPosts = [
    {
      id: 1,
      title: 'Top 10 Smartphones to Watch in 2024',
      excerpt: 'Discover the most anticipated smartphones coming this year, featuring innovative technology and groundbreaking features.',
      content: 'Full content here...',
      author: 'John Doe',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      views: '1.2K',
      category: 'Technology',
      image: blogImages[0],
      featured: true
    },
    {
      id: 2,
      title: 'Complete Guide to Online Shopping Safety',
      excerpt: 'Learn essential tips and tricks to keep your personal information secure while shopping online.',
      content: 'Full content here...',
      author: 'Jane Smith',
      date: 'Jan 12, 2024',
      readTime: '4 min read',
      views: '856',
      category: 'Shopping Tips',
      image: blogImages[1],
      featured: false
    },
    {
      id: 3,
      title: 'Review: Latest Wireless Earbuds Compared',
      excerpt: 'We tested the top wireless earbuds to help you find the perfect pair for your needs and budget.',
      content: 'Full content here...',
      author: 'Mike Johnson',
      date: 'Jan 10, 2024',
      readTime: '6 min read',
      views: '2.1K',
      category: 'Product Reviews',
      image: blogImages[2],
      featured: false
    },
    {
      id: 4,
      title: 'Holiday Shopping Guide 2024',
      excerpt: 'Get ahead of the holiday season with our comprehensive shopping guide and gift ideas.',
      content: 'Full content here...',
      author: 'Sarah Williams',
      date: 'Jan 8, 2024',
      readTime: '7 min read',
      views: '3.4K',
      category: 'Guides',
      image: blogImages[3],
      featured: false
    },
    {
      id: 5,
      title: 'How to Choose the Perfect Laptop',
      excerpt: 'A step-by-step guide to finding the ideal laptop for work, gaming, or creative pursuits.',
      content: 'Full content here...',
      author: 'David Brown',
      date: 'Jan 5, 2024',
      readTime: '8 min read',
      views: '1.8K',
      category: 'Guides',
      image: blogImages[4],
      featured: false
    },
    {
      id: 6,
      title: 'The Future of E-commerce in Kenya',
      excerpt: 'Exploring the rapid growth of online shopping and what it means for consumers and businesses.',
      content: 'Full content here...',
      author: 'Emily Davis',
      date: 'Jan 3, 2024',
      readTime: '5 min read',
      views: '967',
      category: 'News',
      image: blogImages[5],
      featured: false
    },
    {
      id: 7,
      title: 'Smart Home Devices Under KSh 15,000',
      excerpt: 'Affordable smart home gadgets that can make your life easier without breaking the bank.',
      content: 'Full content here...',
      author: 'John Doe',
      date: 'Dec 28, 2023',
      readTime: '4 min read',
      views: '1.5K',
      category: 'Technology',
      image: blogImages[0],
      featured: false
    },
    {
      id: 8,
      title: 'Understanding Product Warranties',
      excerpt: 'What you need to know about manufacturer warranties and extended protection plans.',
      content: 'Full content here...',
      author: 'Jane Smith',
      date: 'Dec 22, 2023',
      readTime: '5 min read',
      views: '623',
      category: 'Shopping Tips',
      image: blogImages[1],
      featured: false
    },
    {
      id: 9,
      title: 'Best Budget Smartphones Under KSh 20,000',
      excerpt: 'Top picks for affordable smartphones that offer great value for money.',
      content: 'Full content here...',
      author: 'Mike Johnson',
      date: 'Dec 18, 2023',
      readTime: '6 min read',
      views: '2.8K',
      category: 'Product Reviews',
      image: blogImages[2],
      featured: false
    },
    {
      id: 10,
      title: 'How to Spot Online Shopping Scams',
      excerpt: 'Protect yourself from fraud with these essential tips for safe online shopping.',
      content: 'Full content here...',
      author: 'Sarah Williams',
      date: 'Dec 15, 2023',
      readTime: '7 min read',
      views: '4.2K',
      category: 'Shopping Tips',
      image: blogImages[3],
      featured: false
    }
  ];

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

  // Inject styles and load data
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    const startTime = performance.now();
    
    // Simulate API call with cache
    setTimeout(() => {
      // Check if we have cached posts
      const cachedPosts = sessionStorage.getItem('blog_posts');
      const cachedFeatured = sessionStorage.getItem('blog_featured');
      
      if (cachedPosts && cachedFeatured) {
        setPosts(JSON.parse(cachedPosts));
        setFeaturedPost(JSON.parse(cachedFeatured));
        
        const endTime = performance.now();
        setLoadTime((endTime - startTime).toFixed(0));
        
        setCacheStats(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: prev.cacheHits + 1
        }));
        
        console.log(`⚡ Blog loaded from cache in ${(endTime - startTime).toFixed(0)}ms`);
      } else {
        // First load - cache the data
        setPosts(blogPosts);
        setFeaturedPost(blogPosts.find(p => p.featured));
        
        // Store in session storage for future visits
        sessionStorage.setItem('blog_posts', JSON.stringify(blogPosts));
        sessionStorage.setItem('blog_featured', JSON.stringify(blogPosts.find(p => p.featured)));
        
        const endTime = performance.now();
        setLoadTime((endTime - startTime).toFixed(0));
        
        setCacheStats(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: 0
        }));
        
        console.log(`⚡ Blog loaded from API in ${(endTime - startTime).toFixed(0)}ms`);
      }
      
      setLoading(false);
      setInitialLoad(false);
    }, 800);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Filter posts
  const getFilteredPosts = () => {
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.excerpt.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    return filtered.filter(p => !p.featured); // Exclude featured from regular posts
  };

  const filteredPosts = getFilteredPosts();
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={blogHeaderImage}
              alt="Blog"
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
                <div className="section-title-wrapper">
                  <h1 className="section-title">BLOG</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading articles...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <div className="mb-6 bg-gray-800 h-96 rounded-xl animate-pulse"></div>
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      <TopBar />

      {/* Header Image */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={blogHeaderImage}
            alt="Blog"
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
              <div className="section-title-wrapper">
                <h1 className="section-title">BLOG</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Latest news, tips, and updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Blog</span>
        </nav>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 pl-10 pr-4 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Featured Article</h2>
            <FeaturedBlog post={featuredPost} />
          </div>
        )}

        {/* Results Count */}
        <p className="mb-4 text-xs text-gray-400">
          Showing {currentPosts.length} of {filteredPosts.length} articles
        </p>

        {/* Blog Posts Grid */}
        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="py-12 text-center blog-card rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full">
              <FiSearch className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">No articles found</h3>
            <p className="mb-4 text-sm text-gray-400">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="p-8 mt-10 text-center blog-card rounded-xl">
          <h3 className="mb-2 text-lg font-bold text-white">Subscribe to Our Newsletter</h3>
          <p className="mb-4 text-sm text-gray-400">Get the latest articles and deals delivered to your inbox</p>
          <div className="flex max-w-md gap-2 mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
            />
            <button 
              onClick={() => {
                toast.success('Subscribed successfully!');
              }}
              className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;