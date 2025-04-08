import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SimplifiedBloggerPost } from "@shared/schema";
import CategoriesGrid from "@/components/CategoriesGrid";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoriesGrid />
    </div>
  );
};

export default Categories;