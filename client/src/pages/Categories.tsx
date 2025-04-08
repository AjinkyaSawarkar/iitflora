import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SimplifiedBloggerPost } from "@shared/schema";
import CategoriesGrid from "@/components/CategoriesGrid";
import FeatureSlider from "@/components/FeatureSlider";

const Categories = () => {
  // Fetch blog posts from Blogger API to ensure we have the data loaded
  const { data: blogPosts = [], isLoading, error } = useQuery<SimplifiedBloggerPost[]>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await axios.get<SimplifiedBloggerPost[]>("/api/blogger");
      return response.data;
    }
  });

  // Full page loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-gray-700 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plant categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f2f1] flex items-center justify-center p-4">
        <div className="bg-white text-gray-800 p-6 shadow-sm max-w-md mx-auto text-center">
          <h2 className="text-xl font-medium mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero section with title */}
        <div className="text-center py-8 mb-8 border-b border-gray-200">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-light mb-2">
              X3 Demo Website
            </h1>
            <p className="text-sm text-gray-500">
              Welcome to the X3 photo gallery demo website.
            </p>
          </motion.div>
        </div>
        
        {/* Categories grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CategoriesGrid />
        </motion.div>
        
        {/* Featured slider below categories (optional) */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <FeatureSlider posts={Array.isArray(blogPosts) ? blogPosts : []} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Categories;