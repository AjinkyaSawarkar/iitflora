import { useEffect, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SimplifiedBloggerPost } from "@shared/schema";
import { plantCategories } from "@/components/CategoriesGrid";
import axios from "axios";
import styles from "@/styles/PostAnimation.module.css";

const CategoryDetail = () => {
  // Get category ID from URL
  const [_, params] = useRoute("/category/:id");
  const [, navigate] = useLocation();
  const categoryId = params?.id;

  // Find the category
  const category = plantCategories.find((cat) => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Category Not Found
          </h1>
          <Button onClick={() => navigate("/")}>Back to Categories</Button>
        </div>
      </div>
    );
  }

  // Fetch blog posts from Blogger API
  const {
    data: blogPosts = [],
    isLoading,
    error,
  } = useQuery<SimplifiedBloggerPost[]>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await axios.get<SimplifiedBloggerPost[]>("/api/blogger");
      return response.data;
    },
  });

  // Log all available labels for debugging
  useEffect(() => {
    if (Array.isArray(blogPosts) && blogPosts.length > 0) {
      const allLabels = new Set<string>();

      blogPosts.forEach((post) => {
        if (post.labels && post.labels.length > 0) {
          post.labels.forEach((label) => allLabels.add(label));
        }
      });

      console.log("All available labels:", Array.from(allLabels));
      console.log("Looking for category tag:", category.tag);
    }
  }, [blogPosts, category]);

  // Filter posts based on category tag with a more robust matching strategy
  const categoryPosts = Array.isArray(blogPosts)
    ? blogPosts.filter((post) => {
        // If post has no labels or image, filter it out
        if (!post.labels || !post.image) return false;

        // Log the current post labels for debugging
        console.log(`Checking post "${post.title}" with labels:`, post.labels);

        // Try to find a matching label with more flexible matching
        return post.labels.some((label) => {
          // Clean and normalize both strings for comparison
          const labelWords = label.toLowerCase().trim().split(/\s+/);
          const categoryTag = category.tag.toLowerCase().trim();

          // For debugging
          console.log(
            `  - Comparing label "${label}" with category tag "${category.tag}"`,
          );

          // Check for direct matches
          if (label.toLowerCase() === categoryTag) {
            console.log(`    > Direct match found!`);
            return true;
          }

          // Check if the label contains the tag as a substring
          if (label.toLowerCase().includes(categoryTag)) {
            console.log(`    > Substring match found!`);
            return true;
          }

          // Check if the tag contains the label as a substring
          if (categoryTag.includes(label.toLowerCase())) {
            console.log(`    > Reverse substring match found!`);
            return true;
          }

          // Check for word-level matches
          for (const word of labelWords) {
            if (
              word.length > 3 &&
              (categoryTag.includes(word) || word.includes(categoryTag))
            ) {
              console.log(`    > Word match found: "${word}"`);
              return true;
            }
          }

          return false;
        });
      })
    : [];

  // Loading skeleton for the gallery with masonry layout
  const GallerySkeleton = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
      {[...Array(12)].map((_, i) => {
        // Variable heights for skeleton items
        const aspectRatio =
          i % 3 === 0
            ? "aspect-[3/4]"
            : i % 3 === 1
              ? "aspect-square"
              : "aspect-[4/3]";
        return (
          <div
            key={i}
            className={`bg-gray-200 rounded-md ${aspectRatio} mb-6 animate-pulse`}
          ></div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f1] pb-16">
      {/* Hero Header */}
      <div className="py-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-light mb-2">{category.title}</h1>
            <p className="text-sm text-gray-500 mb-4">
              A few images displaying in a justified grid.
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              {category.description}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="transition-all"
              >
                ← Back to Categories
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div>
            <p className="text-center text-gray-500 mb-8">
              Loading plants in this category...
            </p>
            <GallerySkeleton />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
            <h2 className="text-xl font-bold">Error loading plants</h2>
            <p>{error instanceof Error ? error.message : "Unknown error"}</p>
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
                Showing {categoryPosts.filter((post) => post.image).length}{" "}
                plant
                {categoryPosts.filter((post) => post.image).length !== 1
                  ? "s"
                  : ""}{" "}
                in this category
              </p>
            </motion.div>

            {categoryPosts.filter((post) => post.image).length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">
                  No plants found in this category yet.
                </p>
                <div className="mt-4 mb-4 text-left mx-auto max-w-md p-4 bg-white rounded-md shadow-sm">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">
                    Debug Information:
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    Category tag: {category.tag}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Total posts:{" "}
                    {Array.isArray(blogPosts) ? blogPosts.length : 0}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Posts with images:{" "}
                    {Array.isArray(blogPosts)
                      ? blogPosts.filter((p) => p.image).length
                      : 0}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Posts with labels:{" "}
                    {Array.isArray(blogPosts)
                      ? blogPosts.filter((p) => p.labels && p.labels.length > 0)
                          .length
                      : 0}
                  </p>

                  <h4 className="text-xs font-medium text-gray-700 mb-1">
                    All available labels:
                  </h4>
                  <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
                    {Array.isArray(blogPosts) && blogPosts.length > 0 ? (
                      (() => {
                        // Collect labels using an array instead of a Set
                        const allLabelsArray: string[] = [];
                        const labelSet = new Set<string>();

                        blogPosts.forEach((post) => {
                          if (post.labels && post.labels.length > 0) {
                            post.labels.forEach((label) => {
                              if (!labelSet.has(label)) {
                                labelSet.add(label);
                                allLabelsArray.push(label);
                              }
                            });
                          }
                        });

                        return allLabelsArray.map((label) => (
                          <div key={label} className="mb-1">
                            - {label}{" "}
                            {category.tag.toLowerCase() === label.toLowerCase()
                              ? "(exact match)"
                              : category.tag
                                    .toLowerCase()
                                    .includes(label.toLowerCase()) ||
                                  label
                                    .toLowerCase()
                                    .includes(category.tag.toLowerCase())
                                ? "(partial match)"
                                : ""}
                          </div>
                        ));
                      })()
                    ) : (
                      <div>No labels found</div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/")}
                  className="transition-all"
                >
                  Back to Categories
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {categoryPosts
                    .filter((post) => post.image)
                    .map((post, index) => {
                      const [currentImageIndex, setCurrentImageIndex] =
                        useState(0);
                      const images = [
                        post.image,
                        ...(post.images || []),
                      ].filter(Boolean);

                      const handleImageClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        setCurrentImageIndex(
                          (prevIndex) => (prevIndex + 1) % images.length,
                        );
                      };

                      return (
                        <motion.div
                          key={post.id}
                          className={`block overflow-hidden shadow-sm hover:shadow transition-all duration-300 relative bg-white aspect-[4/3] ${styles.postAnimation}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={handleImageClick}
                        >
                          <img
                            src={images[currentImageIndex]}
                            alt={post.title}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-0 left-0 bg-white/80 text-xs py-1 px-2 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {post.title}
                          </a>
                        </motion.div>
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
