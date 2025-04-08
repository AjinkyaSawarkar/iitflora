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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plant categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        {/* Hero section with featured slider */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <FeatureSlider posts={Array.isArray(blogPosts) ? blogPosts : []} />
          </motion.div>
        </div>
        
        {/* Categories grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-light tracking-tight mb-3">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Plant Categories
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection of campus trees and plants organized by categories.
              Click on any category to view the detailed collection.
            </p>
          </div>
          <CategoriesGrid />
        </motion.div>
      </div>
    </div>
  );
};

export default Categories;