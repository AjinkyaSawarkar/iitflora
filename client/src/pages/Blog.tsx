import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Rss, Tag as TagIcon } from 'lucide-react';
import { BloggerPost, BloggerResponse, SimplifiedBloggerPost } from '@shared/schema';

// Fixed blog ID as requested
const FIXED_BLOG_ID = "4965945072048572230";
const MAX_RESULTS = 30; // Fetch more posts for the gallery

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
    <div className="relative h-[50vh] overflow-hidden rounded-xl shadow-xl">
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
            <h2 className="font-display text-3xl md:text-4xl font-bold">{post.title}</h2>
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
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
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
  const [_, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [allTags, setAllTags] = useState<string[]>([]);
  
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
  
  // Extract all unique tags
  useEffect(() => {
    if (blogPosts.length > 0) {
      const tags = blogPosts
        .flatMap(post => post.labels || [])
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();
      
      setAllTags(tags);
    }
  }, [blogPosts]);
  
  // Filter posts based on selected tag
  const filteredPosts = activeFilter === 'all' 
    ? blogPosts
    : blogPosts.filter(post => post.labels?.includes(activeFilter));
  
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white py-10">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            className="mb-6 rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Trees
          </Button>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold flex items-center">
              <Rss className="mr-4 h-10 w-10" />
              Campus Tree Blog
            </h1>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Slideshow */}
        {isLoading ? (
          <div className="h-[50vh] bg-gray-200 animate-pulse rounded-xl -mt-16 shadow-xl"></div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-xl -mt-16 shadow-xl">
            <h2 className="text-xl font-bold">Error loading blog posts</h2>
            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="-mt-16 shadow-xl mb-8"
          >
            <BlogSlideshow posts={blogPosts} />
          </motion.div>
        )}
        
        {/* Filter Bar */}
        {blogPosts.length > 0 && (
          <motion.div 
            className="bg-white p-4 rounded-lg shadow-md mb-8 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-emerald-600 mr-1" />
              <div className="font-medium">Filter by tag:</div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter('all')}
                >
                  All Posts
                </Badge>
                
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={activeFilter === tag ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Photo Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6">
            Photo Gallery
            {activeFilter !== 'all' && ` - ${activeFilter}`}
          </h2>
          
          {isLoading ? (
            <GallerySkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPosts.filter(post => post.image).map((post) => (
                <motion.a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 relative aspect-square"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <h3 className="text-white font-semibold p-4 text-lg">{post.title}</h3>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
          
          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No posts found with the selected tag.</p>
              <Button onClick={() => setActiveFilter('all')} className="mt-4">
                Show All Posts
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Blog;