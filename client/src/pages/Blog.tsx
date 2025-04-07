import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Search, Rss } from 'lucide-react';
import BloggerFeed from '@/components/BloggerFeed';

// This component provides a UI for configuring the Blogger feed
const Blog = () => {
  const [_, navigate] = useLocation();
  const [blogId, setBlogId] = useState<string>('');
  const [displayFeed, setDisplayFeed] = useState<boolean>(false);
  
  // Function to extract blog ID from Blogger URL
  const extractBlogId = (url: string): string | null => {
    // Look for patterns like blogspot.com URLs
    const blogspotPattern = /(?:https?:\/\/)?([^.]+)\.blogspot\.com/;
    const blogspotMatch = url.match(blogspotPattern);
    
    // Look for patterns like blogger.com/blog/posts/ID
    const bloggerPattern = /blogger\.com\/blog\/posts\/(\d+)/;
    const bloggerMatch = url.match(bloggerPattern);
    
    if (blogspotMatch && blogspotMatch[1]) {
      return blogspotMatch[1];
    }
    
    if (bloggerMatch && bloggerMatch[1]) {
      return bloggerMatch[1];
    }
    
    // If no patterns match, return the input as-is if it looks like an ID
    // (purely numeric or alphanumeric without special chars)
    if (/^[a-zA-Z0-9]+$/.test(url)) {
      return url;
    }
    
    return null;
  };
  
  // Handle submission of blog ID
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const extractedId = extractBlogId(blogId);
    if (extractedId) {
      setBlogId(extractedId);
      setDisplayFeed(true);
    } else {
      // Could display an error message here
      alert('Please enter a valid Blogger URL or blog ID');
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white py-16">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            className="mb-8 rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
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
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 flex items-center">
              <Rss className="mr-4 h-10 w-10" />
              Campus Tree Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
              Stay updated with the latest news, events, and information about our campus greenery and botanical garden.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Blog Feed Configuration */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12 -mt-12 relative z-10">
          <h2 className="text-2xl font-semibold mb-4">Connect to Blogger</h2>
          <p className="text-gray-600 mb-6">
            Enter your Blogger URL or Blog ID to display posts from your Blogger.com blog.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Enter Blogger URL or Blog ID"
                value={blogId}
                onChange={(e) => setBlogId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Load Blog Posts
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground">
            Example formats: "example.blogspot.com", "1234567890" or full URL
          </p>
        </div>
        
        {/* Display Blog Feed */}
        {displayFeed && blogId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Latest Blog Posts</h2>
            <BloggerFeed blogId={blogId} maxResults={9} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;