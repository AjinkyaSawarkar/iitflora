import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { BloggerPost, BloggerResponse, SimplifiedBloggerPost } from '@shared/schema';

// Fixed blog ID as requested
const FIXED_BLOG_ID = "4965945072048572230";
const MAX_RESULTS = 50; // Fetch more posts for the gallery

// Helper to extract the first image URL from HTML content
const extractFirstImageUrl = (html: string): string | undefined => {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = html.match(imgRegex);
  return match ? match[1] : undefined;
};

// Process Blogger posts into simplified format
const processBloggerPosts = (posts: BloggerPost[]): SimplifiedBloggerPost[] => {
  return posts.map(post => {
    const firstImageUrl = post.images && post.images.length > 0 
      ? post.images[0].url 
      : extractFirstImageUrl(post.content);
    
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      url: post.url,
      author: post.author.displayName,
      authorImage: post.author.image?.url,
      image: firstImageUrl || '/placeholder-image.jpg', // Fallback image
      labels: post.labels || [],
    };
  });
};

// Custom marquee component for horizontal scrolling posts with modern design
const BlogMarquee = ({ posts }: { posts: SimplifiedBloggerPost[] }) => {
  const postsWithImages = posts.filter(post => post.image);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll the marquee
  useEffect(() => {
    if (postsWithImages.length <= 3) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let animationId: number;
    let scrollAmount = 1;
    const speed = 0.5; // Adjust speed as needed
    
    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollAmount * speed;
        
        // Reset scroll position when reaching the end
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth - 100)) {
          // Jump back to start with a small offset to avoid jumpy appearance
          scrollContainer.scrollLeft = 10;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    // Start the animation
    animationId = requestAnimationFrame(scroll);
    
    // Add pause on hover functionality
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };
    
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cancelAnimationFrame(animationId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [postsWithImages.length]);
  
  if (postsWithImages.length === 0) return null;
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
          Featured Posts
        </h2>
        
        <div className="flex items-center space-x-2 text-sm text-emerald-600">
          <div className="text-emerald-600 opacity-70">Hover to pause</div>
          <div className="flex space-x-1">
            {[1, 2, 3].map(dot => (
              <span key={dot} className="block w-1 h-1 rounded-full bg-emerald-600"></span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Horizontal scrolling container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-5 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Double the posts to create a seamless loop effect */}
        {[...postsWithImages, ...postsWithImages].map((post, index) => (
          <motion.a
            key={`${post.id}-${index}`}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex-shrink-0 rounded-xl overflow-hidden group"
            style={{ width: '300px', height: '380px' }}
            initial={{ opacity: 0.9, scale: 0.98 }}
            whileHover={{ 
              y: -8,
              scale: 1,
              opacity: 1,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${post.image})` }}
            />
            
            {/* Modern glass effect overlay with post title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end">
              <div className="p-5">
                {/* Tag marker at top */}
                {post.labels && post.labels.length > 0 && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                    {post.labels[0]}
                  </div>
                )}
                
                {/* Title with modern style */}
                <div className="backdrop-blur-sm bg-white/10 rounded-lg p-4 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h2 className="font-display text-white text-xl font-bold line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  
                  {/* Tags with modern style, only visible on hover */}
                  {post.labels && post.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                      {post.labels.map(label => (
                        <span key={label} className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* View button, visible on hover */}
                  <div className="mt-3 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                    <div className="text-emerald-300 text-sm flex items-center">
                      View post
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
      
      {/* Modern gradient edges for scrolling indicators */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-emerald-50 to-transparent z-10"></div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-emerald-50 to-transparent z-10"></div>
      
      {/* Subtle scroll indicator arrows */}
      <div 
        className="hidden md:flex absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-600/50 hover:text-emerald-600 bg-white/70 backdrop-blur-sm rounded-full p-1 cursor-pointer z-20 transition-all duration-300 hover:bg-white/90"
        onClick={() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft -= 350; // Scroll by approximately one card width
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div 
        className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600/50 hover:text-emerald-600 bg-white/70 backdrop-blur-sm rounded-full p-1 cursor-pointer z-20 transition-all duration-300 hover:bg-white/90"
        onClick={() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft += 350; // Scroll by approximately one card width
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

// Main Blog component
const Blog = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [allTags, setAllTags] = useState<string[]>([]);
  const tagsExtracted = useRef(false);
  
  // Fetch blog posts with React Query
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery<BloggerResponse>({
    queryKey: [`/blogger/${FIXED_BLOG_ID}`],
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_BLOGGER_API_KEY;
      
      if (!apiKey) {
        throw new Error('Blogger API key is missing.');
      }
      
      const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${FIXED_BLOG_ID}/posts?key=${apiKey}&maxResults=${MAX_RESULTS}`;
      const response = await axios.get(apiUrl);
      return response.data;
    },
  });
  
  // Process the blog posts
  const blogPosts = data?.items ? processBloggerPosts(data.items) : [];
  
  // Extract all unique tags only once when posts are loaded
  useEffect(() => {
    if (blogPosts.length > 0 && !tagsExtracted.current) {
      const tags = blogPosts
        .flatMap(post => post.labels || [])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();
      
      setAllTags(tags);
      tagsExtracted.current = true;
    }
  }, [blogPosts]);
  
  // Filter posts based on selected tag
  const filteredPosts = activeFilter === 'all' 
    ? blogPosts
    : blogPosts.filter(post => post.labels?.includes(activeFilter));
  
  // Memoize the filter change handler
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);
  
  // Loading skeleton for the gallery with masonry layout
  const GallerySkeleton = () => (
    <div 
      className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
    >
      {[...Array(16)].map((_, i) => {
        // Variable heights for skeleton items
        const aspectRatio = i % 3 === 0 ? 'aspect-[3/4]' : 
                           i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]';
        return (
          <div key={i} className={`bg-gray-200 rounded-md ${aspectRatio} mb-4 animate-pulse`}></div>
        );
      })}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
        {/* Horizontal Marquee */}
        {isLoading ? (
          <div className="h-[400px] bg-gray-200 animate-pulse rounded-2xl shadow-xl"></div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold">Error loading blog posts</h2>
            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mb-8"
          >
            <BlogMarquee posts={blogPosts} />
          </motion.div>
        )}
        
        {/* Filter Bar */}
        {blogPosts.length > 0 && (
          <motion.div 
            className="py-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleFilterChange(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === tag 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Photo Gallery */}
        <div>
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-light tracking-tight mb-2">
              {activeFilter === 'all' ? 'Nature Gallery' : activeFilter}
            </h2>
            {activeFilter !== 'all' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-gray-500 text-sm"
              >
                Filtered collection • {filteredPosts.filter(post => post.image).length} photos
              </motion.div>
            )}
          </motion.div>
          
          {isLoading ? (
            <GallerySkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
              >
                {filteredPosts.filter(post => post.image).map((post, index) => {
                  // Create varying heights for more natural masonry layout
                  const aspectRatio = index % 3 === 0 ? 'aspect-[3/4]' : 
                                     index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]';
                  
                  return (
                    <motion.a
                      key={post.id}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block overflow-hidden rounded-md mb-4 shadow-sm hover:shadow-md transition-all duration-300 relative ${aspectRatio} group bg-white`}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="w-full p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                          <h3 className="text-white font-normal text-sm w-full line-clamp-2 font-sans">
                            {post.title}
                          </h3>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
          
          {!isLoading && filteredPosts.length === 0 && (
            <motion.div 
              className="text-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-500 text-lg">No posts found with the selected tag.</p>
              <Button 
                onClick={() => handleFilterChange('all')} 
                className="mt-4 transition-all duration-300 hover:scale-105"
              >
                Show All Posts
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;