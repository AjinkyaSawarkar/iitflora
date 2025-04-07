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

// Custom slideshow component for the top of the page
const BlogSlideshow = ({ posts }: { posts: SimplifiedBloggerPost[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsWithImages = posts.filter(post => post.image);
  
  // Auto-advance the slideshow
  useEffect(() => {
    if (postsWithImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === postsWithImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [postsWithImages.length]);
  
  if (postsWithImages.length === 0) return null;
  
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? postsWithImages.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === postsWithImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden rounded-xl shadow-xl">
      {postsWithImages.map((post, index) => (
        <motion.div 
          key={post.id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.1
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="font-display text-3xl md:text-5xl font-bold">{post.title}</h2>
          </div>
        </motion.div>
      ))}
      
      {postsWithImages.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {postsWithImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
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
        {/* Slideshow */}
        {isLoading ? (
          <div className="h-[60vh] md:h-[70vh] bg-gray-200 animate-pulse rounded-xl shadow-xl"></div>
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
            className="shadow-xl mb-8"
          >
            <BlogSlideshow posts={blogPosts} />
          </motion.div>
        )}
        
        {/* Filter Bar */}
        {blogPosts.length > 0 && (
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md mb-8 overflow-x-auto sticky top-20 z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-emerald-600 mr-1 flex-shrink-0" />
              <div className="font-medium whitespace-nowrap">Filter by tag:</div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => handleFilterChange('all')}
                >
                  All Posts
                </Badge>
                
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={activeFilter === tag ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-300 hover:scale-105"
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