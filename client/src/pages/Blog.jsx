// src/pages/Blog.jsx - COMPLETE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiUser, 
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiCalendar,
  FiEye,
  FiHeart,
  FiShare2,
  FiMapPin
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

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
                toast.info('Like feature coming soon');
              }}
              className="p-1 text-gray-400 transition-colors rounded-full hover:text-red-500"
            >
              <FiHeart className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!');
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

  // Categories
  const categories = ['all', 'Technology', 'Shopping Tips', 'Product Reviews', 'News', 'Guides'];

  // Blog post data
  const blogPosts = [
    {
      id: 1,
      title: 'Top 10 Smartphones to Watch in 2024',
      excerpt: 'Discover the most anticipated smartphones coming this year, featuring innovative technology and groundbreaking features.',
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
      author: 'Emily Davis',
      date: 'Jan 3, 2024',
      readTime: '5 min read',
      views: '967',
      category: 'News',
      image: blogImages[5],
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

  // Load blog data
  useEffect(() => {
    setTimeout(() => {
      setPosts(blogPosts);
      setFeaturedPost(blogPosts.find(p => p.featured));
      setLoading(false);
      setInitialLoad(false);
    }, 500);
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

    return filtered.filter(p => !p.featured);
  };

  const filteredPosts = getFilteredPosts();
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="BLOG" 
          subtitle="Loading articles..."
          image={blogHeaderImage}
        />
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <div className="mb-6 bg-gray-800 h-96 rounded-xl animate-pulse"></div>
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="BLOG" 
        subtitle="Latest news, tips, and updates"
        image={blogHeaderImage}
      />

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
              className="w-full py-2 pl-10 pr-4 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
              className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
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
              onClick={() => toast.success('Subscribed successfully!')}
              className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
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