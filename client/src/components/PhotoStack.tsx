import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Tree } from '@shared/schema';

interface PhotoStackProps {
  trees: Tree[];
}

const PhotoStack = ({ trees }: PhotoStackProps) => {
  const [selectedTrees, setSelectedTrees] = useState<Tree[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [_, setLocation] = useLocation();
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Prepare trees for slideshow
  useEffect(() => {
    if (trees && trees.length) {
      // Randomly select 6 trees for the slideshow
      const shuffled = [...trees].sort(() => 0.5 - Math.random());
      setSelectedTrees(shuffled.slice(0, 6));
    }
  }, [trees]);

  // Automatic slideshow function
  const nextSlide = useCallback(() => {
    setActiveIndex(current => 
      current === selectedTrees.length - 1 ? 0 : current + 1
    );
  }, [selectedTrees.length]);

  // Set up automatic slideshow
  useEffect(() => {
    if (selectedTrees.length > 0) {
      // Clear any existing interval
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
      
      // Start the slideshow interval
      slideInterval.current = setInterval(nextSlide, 4000);
      
      // Clean up on unmount
      return () => {
        if (slideInterval.current) {
          clearInterval(slideInterval.current);
        }
      };
    }
  }, [selectedTrees, nextSlide]);

  const handleCardClick = (treeId: number) => {
    setLocation(`/tree/${treeId}`);
  };

  return (
    <div className="relative w-full h-[400px] perspective-1000 overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        {selectedTrees.length > 0 && (
          <motion.div
            key={selectedTrees[activeIndex].id}
            className="absolute w-full h-full cursor-pointer"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundImage: `url(${selectedTrees[activeIndex].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => handleCardClick(selectedTrees[activeIndex].id)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <motion.h3 
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {selectedTrees[activeIndex].name}
                </motion.h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
        {selectedTrees.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? "bg-white w-8" 
                : "bg-white/60 hover:bg-white/80"
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoStack;
