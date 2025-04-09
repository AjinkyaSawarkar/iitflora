import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SimplifiedBloggerPost } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeatureSliderProps {
  posts: SimplifiedBloggerPost[];
}

const FeatureSlider = ({ posts }: FeatureSliderProps) => {
  const [current, setCurrent] = useState(0);
  const [postsWithImages, setPostsWithImages] = useState<SimplifiedBloggerPost[]>([]);
  
  useEffect(() => {
    // Filter posts to only include those with images
    const filtered = posts.filter(post => post.image);
    // Randomize the order of posts
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    // Take up to 5 posts for the slider
    setPostsWithImages(shuffled.slice(0, 5));
  }, [posts]);
  
  const nextSlide = () => {
    setCurrent(current === postsWithImages.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? postsWithImages.length - 1 : current - 1);
  };

  useEffect(() => {
    // Auto-advance the slider every 5 seconds
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [current, postsWithImages.length]);

  if (postsWithImages.length === 0) return null;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 rounded-xl overflow-hidden group">
      {/* Slider controls */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-4 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/80 hover:bg-white text-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/80 hover:bg-white text-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {postsWithImages.map((_, index) => (
          <button 
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
      
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full h-full relative"
        >
          <img 
            src={postsWithImages[current].image} 
            alt={postsWithImages[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
            <h2 className="text-white text-xl md:text-3xl font-light mb-2 md:mb-4 max-w-3xl">
              {postsWithImages[current].title}
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-2xl line-clamp-2 mb-4">
              {postsWithImages[current].content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
            </p>
            <a 
              href={postsWithImages[current].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-300 text-sm md:text-base w-fit"
            >
              View Details
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FeatureSlider;