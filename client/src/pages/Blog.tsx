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

// Custom marquee component for horizontal scrolling posts
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
    <div className="relative overflow-hidden rounded-xl shadow-xl">
      {/* Horizontal scrolling container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Double the posts to create a seamless loop effect */}
        {[...postsWithImages, ...postsWithImages].map((post, index) => (
          <motion.a
            key={`${post.id}-${index}`}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex-shrink-0 mx-2 rounded-lg overflow-hidden shadow-lg group transition-all duration-300 hover:shadow-xl"
            style={{ width: '280px', height: '400px' }}
            whileHover={{ y: -5 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${post.image})` }}
            />
            {/* Always visible overlay with post title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end">
              <div className="p-4 text-white">
                <h2 className="font-display text-xl font-bold transition-all duration-300 group-hover:scale-105 line-clamp-2">
                  {post.title}
                </h2>
                {post.labels && post.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {post.labels.slice(0, 2).map(label => (
                      <span key={label} className="text-xs bg-primary/80 px-2 py-1 rounded-full">
                        {label}
                      </span>
                    ))}
                    {post.labels.length > 2 && (
                      <span className="text-xs bg-primary/80 px-2 py-1 rounded-full">
                        +{post.labels.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.a>
        ))}
      </div>
      
      {/* Gradient edges to indicate scrolling */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-neutral-50 to-transparent z-10"></div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-neutral-50 to-transparent z-10"></div>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-md aspect-square animate-pulse"></div>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 py-4">
        {/* Horizontal Marquee */}
        {isLoading ? (
          <div className="h-[400px] bg-gray-200 animate-pulse rounded-xl shadow-xl"></div>
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
            className="relative shadow-xl mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Featured Posts</h2>
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
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredPosts.filter(post => post.image).map((post) => (
                  <motion.a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 relative aspect-square group"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <h3 className="text-white font-semibold p-4 text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
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