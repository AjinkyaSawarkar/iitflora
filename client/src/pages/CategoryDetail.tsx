import { useEffect, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SimplifiedBloggerPost } from "@shared/schema";
import { plantCategories } from "@/components/CategoriesGrid";
import axios from "axios";

const CategoryDetail = () => {
  // Get category ID from URL
  const [_, params] = useRoute("/category/:id");
  const [, navigate] = useLocation();
  const categoryId = params?.id;
  
  // Find the category
  const category = plantCategories.find(cat => cat.id === categoryId);
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Categories</Button>
        </div>
      </div>
    );
  }

  // Fetch blog posts from Blogger API
  const { data: blogPosts = [], isLoading, error } = useQuery<SimplifiedBloggerPost[]>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await axios.get<SimplifiedBloggerPost[]>("/api/blogger");
      return response.data;
    }
  });

  // Filter posts based on category tag
  const categoryPosts = blogPosts.filter(post => {
    // Check if the post has tags/labels that match our category tag
    return post.labels?.some(label => 
      label.toLowerCase().includes(category.tag.toLowerCase())
    );
  });

  // Loading skeleton for the gallery with masonry layout
  const GallerySkeleton = () => (
    <div 
      className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
    >
      {[...Array(12)].map((_, i) => {
        // Variable heights for skeleton items
        const aspectRatio = i % 3 === 0 ? 'aspect-[3/4]' : 
                          i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]';
        return (
          <div key={i} className={`bg-gray-200 rounded-md ${aspectRatio} mb-6 animate-pulse`}></div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Header */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-light tracking-tight mb-3">{category.title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {category.description}
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => navigate("/")} className="hover:scale-105 transition-transform">
                ← Back to Categories
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div>
            <p className="text-center text-gray-500 mb-8">Loading plants in this category...</p>
            <GallerySkeleton />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
            <h2 className="text-xl font-bold">Error loading plants</h2>
            <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Back to Categories
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-500 text-sm mb-6">
                Showing {categoryPosts.filter(post => post.image).length} plant{categoryPosts.filter(post => post.image).length !== 1 ? 's' : ''} in this category
              </p>
            </motion.div>

            {categoryPosts.filter(post => post.image).length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No plants found in this category yet.</p>
                <Button 
                  onClick={() => navigate("/")} 
                  className="mt-4 transition-all duration-300 hover:scale-105"
                >
                  Back to Categories
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
                >
                  {categoryPosts.filter(post => post.image).map((post, index) => {
                    // Create varying heights for more natural masonry layout
                    const aspectRatio = index % 3 === 0 ? 'aspect-[3/4]' : 
                                      index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]';
                    
                    return (
                      <motion.a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block overflow-hidden rounded-md mb-6 shadow-sm hover:shadow-md transition-all duration-300 relative ${aspectRatio} group bg-white`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;