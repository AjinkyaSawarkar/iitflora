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
  
  // Loading skeleton for the gallery
  const GallerySkeleton = () => (
    <div 
      className="grid gap-4 auto-rows-fr"
      style={{ 
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))"
      }}
    >
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-emerald-50 rounded-xl aspect-square animate-pulse border-4 border-white shadow-md"></div>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-emerald-900/5 pb-16">
      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
        {/* Horizontal Marquee */}
        {isLoading ? (
          <div className="h-[400px] bg-emerald-50 animate-pulse rounded-2xl shadow-xl border-4 border-white"></div>
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
            className="border-b border-gray-200 py-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-emerald-600 mr-2" />
                <div className="font-medium text-lg">Filter by tag:</div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => handleFilterChange('all')}
                >
                  All Posts
                </Badge>
                
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={activeFilter === tag ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => handleFilterChange(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Photo Gallery */}
        <div>
          <motion.h2 
            className="text-2xl font-semibold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Photo Gallery
            {activeFilter !== 'all' && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              > - {activeFilter}</motion.span>
            )}
          </motion.h2>
          
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
                className="grid gap-4 auto-rows-fr"
                style={{ 
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))"
                }}
              >
                {filteredPosts.filter(post => post.image).map((post) => (
                  <motion.a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 relative aspect-square group bg-emerald-50 border-4 border-white"
                    whileHover={{ scale: 1.03, y: -5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-sm px-4 py-3">
                      <h3 className="text-gray-800 font-semibold text-base line-clamp-2 w-full tracking-wide leading-tight font-serif italic">
                        {post.title}
                      </h3>
                    </div>
                  </motion.a>
                ))}
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